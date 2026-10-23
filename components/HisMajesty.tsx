import Image from "next/image";

export default function HisMajesty() {
  return (
    <section id="his-majesty" className="his-majesty" aria-labelledby="his-majesty-title">
      <div className="his-majesty__portrait">
          <Image
            src="/img/his-majesty.webp"
            alt="His Majesty King Jigme Khesar Namgyel Wangchuck at Bhutan Innovation Forum 2024"
            fill
            sizes="100vw"
          />
        </div>
      <div className="his-majesty__inner">
        <div className="his-majesty__copy">
          <span className="his-majesty__rule" aria-hidden="true" />
          <h2 id="his-majesty-title">
            <span>His Majesty</span>
            King Jigme Khesar Namgyel Wangchuck
          </h2>
          <p>&ldquo;GMC is not just for the present generation but for all future generations...&rdquo;</p>
          <p>at Bhutan Innovation Forum 2024</p>
        </div>
      </div>
    </section>
  );
}
