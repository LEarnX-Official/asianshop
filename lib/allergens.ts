// Keyword hints for the 14 EU allergens in PL/DE/EN ingredient text. Used to put allergens in
// bold inside the ingredients list (EU rules require emphasis). Real data must come from the
// producer label; this is a prototype aid only.
export const ALLERGEN_PATTERNS: Record<string, string> = {
  gluten: "wheat|gluten|barley|rye|oats?|semolina|maida|atta|pszen\\w*|jęczmie\\w*|żyt\\w*|owies|owsian\\w*|weizen\\w*|gerste|roggen|hafer",
  crustaceans: "shrimps?|prawns?|crabs?|krewet\\w*|krab\\w*|garnel\\w*|krebs\\w*",
  eggs: "eggs?|jaj\\w*|eier",
  fish: "fish|ryb\\w*|fisch\\w*|anchov\\w*",
  peanuts: "peanuts?|groundnuts?|orzesz\\w* ziemn\\w*|erdnüss\\w*|erdnuss\\w*",
  soy: "soy\\w*|soja\\w*|sojow\\w*",
  milk: "milk|lactose|butter|cream|whey|ghee|cheese|paneer|mlek\\w*|mleczn\\w*|laktoz\\w*|masł\\w*|śmietan\\w*|serwat\\w*|milch\\w*|laktose|sahne|molke|käse",
  nuts: "almonds?|cashews?|hazelnuts?|walnuts?|pistachios?|migdał\\w*|nerkow\\w*|pistacj\\w*|mandel\\w*|haselnuss\\w*|walnuss\\w*|pistazie\\w*",
  celery: "celery|seler\\w*|sellerie",
  mustard: "mustard|gorczyc\\w*|musztard\\w*|senf\\w*",
  sesame: "sesame|sezam\\w*|sesam\\w*",
  sulphites: "sulphites?|sulfites?|sulphur dioxide|siarczyn\\w*|dwutlenek siarki|sulfit\\w*|schwefeldioxid",
  lupin: "lupin\\w*|łubin\\w*",
  molluscs: "molluscs?|squid|oysters?|mięczak\\w*|ostryg\\w*|kalmar\\w*|weichtier\\w*|auster\\w*",
};

const ANY = new RegExp(`(?<![\\p{L}])(${Object.values(ALLERGEN_PATTERNS).join("|")})(?![\\p{L}])`, "giu");

/** Splits text into plain and allergen parts for rendering. */
export function splitAllergens(text: string): { text: string; allergen: boolean }[] {
  const out: { text: string; allergen: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(ANY)) {
    if (m.index! > last) out.push({ text: text.slice(last, m.index), allergen: false });
    out.push({ text: m[0], allergen: true });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), allergen: false });
  return out;
}
