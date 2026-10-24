import RoyalPortrait from "@/components/RoyalPortrait";

export default function HisMajesty() {
  return (
    <section id="his-majesty" className="his-majesty" aria-labelledby="his-majesty-title">
      <div className="his-majesty__inner">
        <div className="his-majesty__copy">
          <span className="his-majesty__rule" aria-hidden="true" />
          <h2 id="his-majesty-title">
            <span>His Majesty</span>
            King Jigme Khesar Namgyel Wangchuck
          </h2>
          <blockquote className="his-majesty__quote">
            <p>&ldquo;GMC is not just for the present generation but for all future generations...&rdquo;</p>
          </blockquote>
          <p className="his-majesty__attribution">at Bhutan Innovation Forum 2024</p>
        </div>
        <RoyalPortrait />
      </div>
    </section>
  );
}
