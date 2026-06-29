import { writeFileSync } from "fs";
import { REMEDIES } from "./remedies-data";

const titles = Object.values(REMEDIES).flat().map((r) => r.title);
writeFileSync("./scripts/seed-titles.json", JSON.stringify(titles, null, 2));
console.log(`Wrote ${titles.length} titles`);
