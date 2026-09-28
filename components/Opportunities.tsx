import { readFile } from "node:fs/promises";
import path from "node:path";
import OpportunityJourney from "./OpportunityJourney";

const areas = [
  [
    "Accommodation & Hospitality",
    "01_accommodation_hospitality.svg",
    "Resorts, eco-lodges, glamping retreats, capsule stays, wellness farms, boutique accommodation, and other distinctive stay formats.",
  ],
  [
    "Attractions & Leisure",
    "02_attractions_leisure.svg",
    "Theme parks, water parks, cable cars, adventure parks, promenades, family entertainment facilities, and scenic leisure products.",
  ],
  [
    "Culture & Heritage",
    "03_culture_heritage.svg",
    "Heritage villages, craft experiences, Bhutanese cuisine, cultural weekends, traditional games, storytelling, local design, performance, and visitor orientation experiences rooted in Bhutanese identity.",
  ],
  [
    "Wellness & Mindfulness",
    "04_wellness_mindfulness.svg",
    "Hot spring resorts, meditation programmes, yoga, wellness retreats, slow living experiences, farm-based restoration, mindful leadership retreats, and nature-based wellbeing.",
  ],
  [
    "Nature & Eco-Tourism",
    "05_nature_ecotourism.svg",
    "Birdwatching, eco-lodges, river activities, scenic cycling, nature walks, firefly experiences, outdoor learning, biodiversity interpretation, and low-impact nature-based tourism.",
  ],
  [
    "Events & Activities",
    "06_events_activities.svg",
    "Festivals, markets, races, night walks, food events, cultural weekends, outdoor film screenings, creative programming, and seasonal activities that bring regular energy to GMC.",
  ],
  [
    "Retail, F&B & Lifestyle",
    "07_retail_fnb_lifestyle.svg",
    "Food halls, dessert streets, cafés, restaurants, lifestyle retail, pop-up markets, craft stalls, wellness products, and small business opportunities linked to visitor spending.",
  ],
];

export default async function Opportunities() {
  const items = await Promise.all(
    areas.map(async ([title, file, description]) => {
      // Only trusted, repository-owned SVGs are inlined; scope their styles to this section.
      const artwork = (
        await readFile(path.join(process.cwd(), "public/img/svg", file), "utf8")
      )
        .replace(/<style>[\s\S]*?<\/style>/g, "")
        .replace(/<(title|desc)[^>]*>[\s\S]*?<\/\1>/g, "")
        .replace(/\s(?:id|aria-labelledby|role)="[^"]*"/g, "");
      return { title, description, artwork };
    }),
  );
  return <OpportunityJourney items={items} />;
}
