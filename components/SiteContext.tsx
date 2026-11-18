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
            <h2 id="site-context-title">The development landscape</h2>
          </div>
          <p className="site-context__note">
            Infrastructure, connectivity and urban ecosystem · For reference
            purposes only. Not to scale.
          </p>
        </header>
      </div>
      <BhutanInteractiveMap />
    </section>
  );
}
