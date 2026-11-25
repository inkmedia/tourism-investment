"use client";

import BhutanInteractiveMap from "./bhutan-map/BhutanInteractiveMap";

export default function SiteContext() {


  return (
    <section
      id="investment-map"
      className="site-context"
      aria-labelledby="site-context-title"
    >
      <div className="site-context__inner">
        <header className="site-context__header">
          <div>
            <p className="site-context__eyebrow">Site context</p>
            <h2 id="site-context-title">GMC within Bhutan</h2>
          </div>
          <p className="site-context__note">
            GMC lies in southern Bhutan, on the border with India. The gold
            outline highlights its location and extent within the country.
            Map for geographic context, not for land or distance measurement.
          </p>
        </header>
      </div>
      <BhutanInteractiveMap />
    </section>
  );
}
