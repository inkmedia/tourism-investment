// Local contract tests. The injected sender records email in memory; no mail is sent.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function compile(file, imports = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, { exports, Response, TextDecoder, Uint8Array, URL, AbortSignal, fetch, process: { env: {} },
    require: (name) => { assert.ok(imports[name], `Unexpected import: ${name}`); return imports[name]; },
  });
  return exports;
}
const catalogue = compile('components/investmentData.ts');
const contact = compile('lib/contact.ts');
const { handleEnquiry } = compile('lib/enquiries.ts', {
  '../components/investmentData': catalogue, './contact': contact,
});
const opportunity = catalogue.opportunities[0];
const sample = {
  name: 'Local Test Visitor', email: 'test@example.invalid', jobTitle: 'Director',
  company: 'Local Test Organisation', country: 'Bhutan', sector: 'Luxury & Ultra-luxury',
  investmentRange: 'USD 5–10M', keys: '42', timeline: '1–2 years',
  concept: 'A test concept\nwith multiple lines.', message: 'Test details: & < > — preserved.',
  source: 'Other', sourceOther: 'Local form verification', opportunityId: String(opportunity.id),
};
const request = (body = sample, origin = 'http://localhost:3000') => new Request('http://localhost:3000/api/enquiries', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body),
});
const sent = [];
const delivery = { send: async (email) => { sent.push(email); return { id: 'local-test-only' }; } };
let result = await handleEnquiry(request());
assert.equal(result.status, 503);
assert.match((await result.json()).message, /has not been sent/);
assert.equal(sent.length, 0);
result = await handleEnquiry(request({ ...sample, to: 'wrong@example.invalid' }), delivery);
assert.equal(result.status, 200);
assert.equal((await result.json()).accepted, true);
assert.equal(sent[0].to, 'tourism@gmc.bt');
assert.equal(sent[0].replyTo, sample.email);
assert.ok(sent[0].subject.includes(opportunity.title));
for (const [key, value] of Object.entries(sample)) {
  if (key !== 'opportunityId') assert.ok(sent[0].text.includes(value), `Missing field: ${key}`);
}
assert.ok(sent[0].text.includes(`Opportunity reference: ${opportunity.id}`));
assert.ok(sent[0].text.includes(`Selected investment opportunity: ${opportunity.title}`));
result = await handleEnquiry(request({ ...sample, opportunityId: '' }), delivery);
assert.equal(result.status, 200);
assert.ok(sent[1].text.includes('General enquiry'));
for (const patch of [{name:''}, {email:'bad'}, {email:'x@example.invalid\nBcc: x@y.z'}, {company:' '}, {sector:''}, {investmentRange:''}, {sourceOther:''}, {opportunityId:'does-not-exist'}, {message: 'x'.repeat(5001)}, {name:42}]) {
  assert.equal((await handleEnquiry(request({...sample,...patch}), delivery)).status, 400);
}
assert.equal((await handleEnquiry(request(sample, 'https://other.invalid'), delivery)).status, 403);
assert.equal((await handleEnquiry(request({...sample,message:'x'.repeat(33000)}),delivery)).status,413);
for (const sender of [async () => {throw Error('provider failed');}, async () => ({id:''})]) {
  result = await handleEnquiry(request(), {send: sender});
  assert.equal(result.status,502);
  assert.equal((await result.json()).accepted,undefined);
}
assert.equal(sent.length,2, 'Invalid requests must never reach delivery');
result = await handleEnquiry(request({ ...sample, opportunityId: 'tenda-scda' }), delivery);
assert.equal(result.status, 200);
assert.ok(sent[2].subject.includes('Tenda by SCDA'));
assert.ok(sent[2].text.includes('Opportunity reference: tenda-scda'));
assert.ok(!catalogue.opportunities.some((item) => item.title === 'Tenda by SCDA'), 'Partnership projects must not create catalogue cards');
const hostinger = compile('lib/hostinger-mail.ts');
const { createHostingerDelivery, TEST_ENQUIRY_RECIPIENT } = hostinger;
assert.equal(TEST_ENQUIRY_RECIPIENT, 'ghevaram.suthar@inkmeda.in');
assert.equal(createHostingerDelivery({}), null);
assert.equal(createHostingerDelivery({ENQUIRY_PHP_URL:'http://host.invalid/email.php',ENQUIRY_PHP_SECRET:'x'.repeat(32)}),null);
assert.equal(createHostingerDelivery({ENQUIRY_PHP_URL:'https://host.invalid/email.php',ENQUIRY_PHP_SECRET:'short'}),null);
const settings = {ENQUIRY_PHP_URL:'https://host.invalid/email.php',ENQUIRY_PHP_SECRET:'x'.repeat(32)};
let forwarded;
const phpDelivery = createHostingerDelivery(settings, async (url, options) => {
  assert.equal(url,settings.ENQUIRY_PHP_URL);
  assert.equal(options.headers['X-Enquiry-Token'],settings.ENQUIRY_PHP_SECRET);
  assert.equal(options.redirect,'error');
  forwarded=JSON.parse(options.body);
  return Response.json({accepted:true,id:'local-php-mock',recipient:TEST_ENQUIRY_RECIPIENT});
});
result=await handleEnquiry(request({...sample,to:'attacker@example.invalid'}),phpDelivery);
assert.equal(result.status,200);
assert.equal(forwarded.to,TEST_ENQUIRY_RECIPIENT);
assert.equal(forwarded.replyTo,sample.email);
assert.ok(forwarded.text.includes(opportunity.title));
for(const key of Object.keys(sample).filter(key=>key!=='opportunityId')) assert.ok(forwarded.text.includes(sample[key]));
for(const reply of [{accepted:false},{accepted:true,id:'id',recipient:'wrong@example.invalid'},{accepted:true,recipient:TEST_ENQUIRY_RECIPIENT}]) {
  const fake=createHostingerDelivery(settings,async()=>Response.json(reply));
  assert.equal((await handleEnquiry(request(),fake)).status,502);
}
const failed=createHostingerDelivery(settings,async()=>new Response('failed',{status:502}));
assert.equal((await handleEnquiry(request(),failed)).status,502);
const unavailable=createHostingerDelivery(settings,async()=>{throw Error('timeout');});
assert.equal((await handleEnquiry(request(),unavailable)).status,502);
const production=createHostingerDelivery({...settings,ENQUIRY_RECIPIENT:'tourism@gmc.bt'},async()=>Response.json({accepted:true,id:'prod-mock',recipient:'tourism@gmc.bt'}));
assert.equal(production.recipient,'tourism@gmc.bt');
const route = compile('app/api/enquiries/route.ts', {'@/lib/enquiries':{handleEnquiry},'@/lib/hostinger-mail':hostinger});
assert.equal((await route.POST(request())).status,503,'Live route must remain disabled');
console.log('PASS: all enquiry fields and opportunity, fixed public/test recipients, PHP authentication payload, configuration checks, failure handling, mocked acceptance, and disabled unconfigured route. No email sent.');
