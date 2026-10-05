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
  boundary: .5, forests: .54, corridors: .58, rivers: .61, dams: .65,
  trail: .68, trailDuration: .15, cities: .79, airports: .8, sites: .85,
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
export type CloudState = { opacity: number; descent: number };
