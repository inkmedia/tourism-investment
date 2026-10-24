import RoyalPortrait from "@/components/RoyalPortrait";

export default function HisMajesty() {
  return (
    <section id="his-majesty" className="his-majesty" aria-labelledby="his-majesty-title">
      <div className="his-majesty__inner">
        <div className="his-majesty__copy">
          <h2 id="his-majesty-title">
            <span>His Majesty</span>
            King Jigme Khesar<br />
            Namgyel Wangchuck
          </h2>
        </div>
        <RoyalPortrait />
        <figure className="his-majesty__quote-card">
          <span className="his-majesty__quote-mark" aria-hidden="true">&ldquo;</span>
          <blockquote className="his-majesty__quote">
            <p>GMC is not just for the present generation but for all future generations...&rdquo;</p>
          </blockquote>
          <figcaption className="his-majesty__attribution">at Bhutan Innovation Forum 2024</figcaption>
        </figure>
      </div>
    </section>
  );
}
