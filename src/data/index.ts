import type { Scheme } from "@/lib/validation/scheme.schema";

// Central schemes
import pmKisan from "./schemes/central/pm-kisan.json";
import ayushmanBharat from "./schemes/central/ayushman-bharat-pm-jay.json";
import pmAwas from "./schemes/central/pm-awas-yojana.json";
import pmUjjwala from "./schemes/central/pm-ujjwala-yojana.json";
import pmMatruVandana from "./schemes/central/pm-matru-vandana.json";
import sukanyaSamriddhi from "./schemes/central/sukanya-samriddhi.json";
import atalPension from "./schemes/central/atal-pension-yojana.json";
import pmJeevanJyoti from "./schemes/central/pm-jeevan-jyoti.json";
import pmSurakshaBima from "./schemes/central/pm-suraksha-bima.json";
import mgnrega from "./schemes/central/mgnrega.json";
import pmSvanidhi from "./schemes/central/pm-svanidhi.json";
import standUpIndia from "./schemes/central/stand-up-india.json";
import postMatricScholarship from "./schemes/central/post-matric-scholarship.json";
import nsap from "./schemes/central/national-social-assistance.json";
import pmAbhim from "./schemes/central/pm-svasthya.json";
import nfsa from "./schemes/central/national-food-security.json";
import samagraShiksha from "./schemes/central/samagra-shiksha.json";
import nrlm from "./schemes/central/national-livelihood.json";
import ignaps from "./schemes/central/national-old-age-pension.json";
import nfbs from "./schemes/central/national-family-benefit.json";

// Assam state schemes
import assamOrunodoi from "./schemes/assam/orunodoi.json";
import assamStartup from "./schemes/assam/assam-startup.json";

const allSchemes = [
  pmKisan,
  ayushmanBharat,
  pmAwas,
  pmUjjwala,
  pmMatruVandana,
  sukanyaSamriddhi,
  atalPension,
  pmJeevanJyoti,
  pmSurakshaBima,
  mgnrega,
  pmSvanidhi,
  standUpIndia,
  postMatricScholarship,
  nsap,
  pmAbhim,
  nfsa,
  samagraShiksha,
  nrlm,
  ignaps,
  nfbs,
  assamOrunodoi,
  assamStartup,
] as Scheme[];

// Export validated schemes
export const schemes: Scheme[] = allSchemes;

// Export by category
export const schemesByCategory = schemes.reduce(
  (acc, scheme) => {
    if (!acc[scheme.category]) acc[scheme.category] = [];
    acc[scheme.category].push(scheme);
    return acc;
  },
  {} as Record<string, Scheme[]>
);

// Export by level
export const centralSchemes = schemes.filter((s) => s.level === "central");
export const stateSchemes = schemes.filter((s) => s.level === "state");

// Export by state
export const schemesByState = schemes.reduce(
  (acc, scheme) => {
    if (scheme.level === "state" && scheme.state) {
      if (!acc[scheme.state]) acc[scheme.state] = [];
      acc[scheme.state].push(scheme);
    }
    return acc;
  },
  {} as Record<string, Scheme[]>
);

// Get scheme by ID
export function getSchemeById(id: string): Scheme | undefined {
  return schemes.find((s) => s.id === id);
}

// Get all scheme IDs
export const schemeIds = schemes.map((s) => s.id);