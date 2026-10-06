export const MAP_SELECTORS = {
  base: "#layer-base",
  satellite: "#base-satellite-image",
  veil: "#layer-white",
  forests: "#layer-forests",
  rivers: "#rivers",
  protectedForests: "#protected-forests",
  corridors: "#ecological-corridors",
  trail: "#layer-mindfulness-trail",
  boundary: "#layer-boundary",
  dams: "#layer-dams",
  sites: "#layer-religious-sites",
  airports: "#layer-airports",
  cities: "#layer-cities",
  legend: "#layer-legend",
} as const;

export const MAP_ANIMATION = {
  descent: .12, descentDuration: .48, satellite: .15, approach: .12,
  boundary: .34, forests: .43, corridors: .49, rivers: .54, dams: .76,
  trail: .65, trailDuration: .14, cities: .78, airports: .82, sites: .86,
  controls: .94, legend: .90, interaction: .94,
} as const;

export const MAP_LAYERS = [
  { key: "protectedForests", label: "Protected forest", color: "#6fa43d" },
  { key: "corridors", label: "Ecological corridor", color: "#cae897" },
  { key: "rivers", label: "Rivers", color: "#6abbf2" },
  { key: "dams", label: "Dams", color: "#f4d274" },
  { key: "airports", label: "Airports", color: "#ffffff" },
  { key: "trail", label: "Mindfulness Trail", color: "#d2232a" },
  { key: "sites", label: "Religious sites", color: "#ce0901" },
] as const;
export type LayerKey = typeof MAP_LAYERS[number]["key"];
export const MAP_INTERACTION = {
  radius: 140, markerScale: .07, tiltDegrees: .55, infrastructureRadius: 190,
  majorCities: ["city-thimphu", "city-paro", "city-gelephu", "city-jakar", "city-punakha"],
} as const;
export type CloudState = { opacity: number; descent: number; pointerX: number; pointerY: number; ambient: number };
