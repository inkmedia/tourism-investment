export const MAP_SELECTORS = {
  base: "#layer-base",
  satellite: "#base-satellite-image",
  veil: "#layer-white",
  forests: "#layer-forests",
  rivers: "#rivers",
  protectedForests: "#protected-forests",
  corridors: "#ecological-corridors",
  trail: "#layer-mindfulness-trail",
  alignment108: "#layer-alignment108",
  boundary: "#layer-boundary",
  gmcBoundary: "#layer-gmc-boundary",
  sites: "#layer-religious-sites",
  airports: "#layer-airports",
  cities: "#layer-cities",
  legend: "#layer-legend",
} as const;

export const MAP_ANIMATION = {
  descent: 0, descentDuration: .08, satellite: 0, approach: .02,
  boundary: .02, forests: .40, corridors: .53, rivers: .64, gmcBoundary: .08,
  alignment108: .34, trail: .24, trailDuration: .08, cities: .76, airports: .76, sites: .78,
  controls: .90, legend: 0, interaction: .90,
} as const;

export const MAP_LAYERS = [
  { key: "gmcBoundary", label: "GMC boundary", color: "#f4d274" },
  { key: "alignment108", label: "108 Alignment", color: "#f59af3" },
  { key: "trail", label: "Mindfulness Trail", color: "#d2232a" },
  { key: "protectedForests", label: "Protected forest", color: "#6fa43d" },
  { key: "corridors", label: "Ecological corridor", color: "#cae897" },
  { key: "rivers", label: "Rivers", color: "#6abbf2" },
  { key: "airports", label: "Airports", color: "#ffffff" },
  { key: "sites", label: "Religious sites", color: "#ce0901" },
] as const;
export type LayerKey = typeof MAP_LAYERS[number]["key"];
export const MAP_INTERACTION = {
  radius: 140, markerScale: .07, tiltDegrees: .55, infrastructureRadius: 190,
  majorCities: ["city-thimphu", "city-paro", "city-gelephu", "city-jakar", "city-punakha"],
} as const;
export type CloudState = { opacity: number; descent: number; pointerX: number; pointerY: number; ambient: number };
