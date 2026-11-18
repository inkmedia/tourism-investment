<?php
// Copy as enquiry-config.php ONE DIRECTORY ABOVE public_html, never inside it.
return [
    'enabled' => false, // Change to true only when ready to enable mail sending.
    'secret' => '', // Same random 32+ character secret as ENQUIRY_PHP_SECRET.
    'from' => 'noreply@gmc.bt',
    'recipient' => 'ghevaram.suthar@inkmeda.in', // Match ENQUIRY_RECIPIENT.
];
