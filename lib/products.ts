// Single source of truth for the Infinity Peptides research catalog.
// Prices are stored in cents. All copy is Research Use Only (RUO) and contains
// no dosing, administration, human-use, or therapeutic claims.

export type Category =
  | "Metabolic Research"
  | "Repair & Matrix"
  | "Growth & Signaling"
  | "Longevity & Cellular"
  | "Cognitive Research";

export type Product = {
  slug: string;
  name: string;
  strength: string;
  priceCents?: number; // undefined => inquiry-only
  category: Category;
  tag: string; // short descriptor shown on cards
  description: string; // RUO-safe research description
  featured?: boolean;
};

export const CATEGORY_ORDER: Category[] = [
  "Metabolic Research",
  "Repair & Matrix",
  "Growth & Signaling",
  "Longevity & Cellular",
  "Cognitive Research",
];

export const CATEGORY_BLURB: Record<Category, string> = {
  "Metabolic Research":
    "Incretin and metabolic-pathway reference compounds for energy-balance and adipose research.",
  "Repair & Matrix":
    "Tissue-repair, angiogenesis, and connective-matrix reference peptides and blends.",
  "Growth & Signaling":
    "Growth-hormone secretagogues and signaling peptides for endocrine research models.",
  "Longevity & Cellular":
    "Mitochondrial, coenzyme, and cellular-aging reference compounds for longevity research.",
  "Cognitive Research":
    "Neuroregulatory and nootropic reference peptides for cognitive research models.",
};

export const products: Product[] = [
  // ---------------- Metabolic Research ----------------
  {
    slug: "retatrutide-10mg",
    name: "Retatrutide",
    strength: "10 mg",
    priceCents: 4000,
    category: "Metabolic Research",
    tag: "Triple-agonist (GIP / GLP-1 / glucagon)",
    description:
      "Retatrutide is a triple-agonist research peptide engaging GIP, GLP-1, and glucagon receptor pathways. A frequently referenced compound in preclinical metabolic and energy-balance investigations.",
    featured: true,
  },
  {
    slug: "retatrutide-20mg",
    name: "Retatrutide",
    strength: "20 mg",
    priceCents: 5000,
    category: "Metabolic Research",
    tag: "Triple-agonist (higher concentration)",
    description:
      "A higher-concentration vial of Retatrutide, a triple-agonist research peptide studied across GIP, GLP-1, and glucagon receptor pathways in metabolic models.",
  },
  {
    slug: "retatrutide-30mg",
    name: "Retatrutide",
    strength: "30 mg",
    priceCents: 6000,
    category: "Metabolic Research",
    tag: "Triple-agonist (max concentration)",
    description:
      "The highest-concentration Retatrutide vial in the catalog, intended for extended metabolic research protocols comparing triple-agonist signaling.",
  },
  {
    slug: "tirzepatide-10mg",
    name: "Tirzepatide",
    strength: "10 mg",
    priceCents: 5000,
    category: "Metabolic Research",
    tag: "Dual GIP / GLP-1 agonist",
    description:
      "Tirzepatide is a dual GIP and GLP-1 receptor agonist widely referenced in preclinical metabolic and incretin-signaling research.",
    featured: true,
  },
  {
    slug: "tirzepatide-20mg",
    name: "Tirzepatide",
    strength: "20 mg",
    priceCents: 6000,
    category: "Metabolic Research",
    tag: "Dual GIP / GLP-1 (higher concentration)",
    description:
      "A higher-concentration Tirzepatide vial for extended dual-agonist metabolic research protocols.",
  },
  {
    slug: "tirzepatide-30mg",
    name: "Tirzepatide",
    strength: "30 mg",
    priceCents: 7000,
    category: "Metabolic Research",
    tag: "Dual GIP / GLP-1 (max concentration)",
    description:
      "The highest-concentration Tirzepatide vial in the catalog for comparative dual-agonist incretin research.",
  },
  {
    slug: "semaglutide-10mg",
    name: "Semaglutide",
    strength: "10 mg",
    priceCents: 6000,
    category: "Metabolic Research",
    tag: "GLP-1 receptor agonist",
    description:
      "Semaglutide is a GLP-1 receptor agonist referenced extensively in preclinical incretin and metabolic-regulation research.",
  },
  {
    slug: "semaglutide-20mg",
    name: "Semaglutide",
    strength: "20 mg",
    priceCents: 7000,
    category: "Metabolic Research",
    tag: "GLP-1 (higher concentration)",
    description:
      "A higher-concentration Semaglutide vial for extended GLP-1 receptor research protocols.",
  },
  {
    slug: "cagrilintide-10mg",
    name: "Cagrilintide",
    strength: "10 mg",
    priceCents: 7000,
    category: "Metabolic Research",
    tag: "Long-acting amylin analog",
    description:
      "Cagrilintide is a long-acting amylin analog studied in preclinical satiety-signaling and metabolic research models.",
  },
  {
    slug: "aod-9604-10mg",
    name: "AOD-9604",
    strength: "10 mg",
    priceCents: 5000,
    category: "Metabolic Research",
    tag: "Modified GH fragment (176-191)",
    description:
      "AOD-9604 is a modified fragment of human growth hormone (176-191) studied in lipid-metabolism and adipose-tissue research models.",
  },
  {
    slug: "l-carnitine",
    name: "L-Carnitine",
    strength: "Research vial",
    priceCents: 6000,
    category: "Metabolic Research",
    tag: "Fatty-acid transport cofactor",
    description:
      "L-Carnitine is a quaternary amine central to mitochondrial fatty-acid transport, referenced in cellular energy-metabolism research.",
  },
  {
    slug: "glutathione",
    name: "Glutathione",
    strength: "Research vial",
    priceCents: 5000,
    category: "Metabolic Research",
    tag: "Master antioxidant tripeptide",
    description:
      "Glutathione is an endogenous tripeptide antioxidant referenced in oxidative-stress and redox-balance research models.",
  },

  // ---------------- Repair & Matrix ----------------
  {
    slug: "bpc-157-tb-500-10mg",
    name: "BPC-157 + TB-500",
    strength: "10 mg + 10 mg",
    priceCents: 8000,
    category: "Repair & Matrix",
    tag: "Dual repair blend",
    description:
      "A research blend pairing BPC-157 and TB-500 in a single vial for comparative studies of tissue repair, angiogenesis, and cellular migration pathways.",
    featured: true,
  },
  {
    slug: "bpc-157-tb-500-5mg",
    name: "BPC-157 + TB-500",
    strength: "5 mg + 5 mg",
    category: "Repair & Matrix",
    tag: "Dual repair blend (compact)",
    description:
      "A compact-concentration BPC-157 and TB-500 research blend for preliminary tissue-repair and connective-matrix investigations.",
  },
  {
    slug: "glow-70mg",
    name: "Glow",
    strength: "70 mg",
    priceCents: 9000,
    category: "Repair & Matrix",
    tag: "Skin & recovery research blend",
    description:
      "Glow is a multi-peptide research blend used in comparative dermal-regeneration and recovery investigations.",
    featured: true,
  },
  {
    slug: "klow",
    name: "KLOW",
    strength: "Research blend",
    priceCents: 10000,
    category: "Repair & Matrix",
    tag: "Multi-peptide regeneration blend",
    description:
      "KLOW is a multi-peptide research blend referenced in comparative regeneration and connective-tissue repair studies.",
  },
  {
    slug: "tb-500-10mg",
    name: "TB-500",
    strength: "10 mg",
    priceCents: 5000,
    category: "Repair & Matrix",
    tag: "Thymosin Beta-4 fragment",
    description:
      "TB-500 is the synthetic analog of the active region of Thymosin Beta-4, investigated in cellular-migration, vascularization, and recovery research.",
  },
  {
    slug: "bpc-157-10mg",
    name: "BPC-157",
    strength: "10 mg",
    priceCents: 5000,
    category: "Repair & Matrix",
    tag: "Body Protection Compound",
    description:
      "BPC-157 is a synthetic pentadecapeptide studied across preclinical models for tissue repair, angiogenesis, and gut-lining research.",
  },
  {
    slug: "ghk-cu-50mg",
    name: "GHK-Cu",
    strength: "50 mg",
    priceCents: 5000,
    category: "Repair & Matrix",
    tag: "Copper-binding tripeptide",
    description:
      "GHK-Cu is a naturally occurring copper-binding tripeptide referenced in dermal-regeneration, collagen-remodeling, and anti-inflammatory research.",
  },
  {
    slug: "ghk-cu-100mg",
    name: "GHK-Cu",
    strength: "100 mg",
    priceCents: 6000,
    category: "Repair & Matrix",
    tag: "Copper peptide (high concentration)",
    description:
      "A high-concentration GHK-Cu vial for extended copper-peptide research into collagen remodeling and dermal regeneration.",
  },

  // ---------------- Growth & Signaling ----------------
  {
    slug: "ipamorelin-10mg",
    name: "Ipamorelin",
    strength: "10 mg",
    priceCents: 5000,
    category: "Growth & Signaling",
    tag: "Selective GH secretagogue",
    description:
      "Ipamorelin is a selective growth-hormone secretagogue and ghrelin-receptor agonist studied for its targeted release profile in endocrine research.",
  },
  {
    slug: "cjc-dac-2mg",
    name: "CJC-1295 + DAC",
    strength: "2 mg",
    priceCents: 5000,
    category: "Growth & Signaling",
    tag: "Long-acting GHRH analog",
    description:
      "CJC-1295 with DAC is a long-acting growth-hormone-releasing hormone analog referenced in endocrine and metabolic research models.",
    featured: true,
  },
  {
    slug: "sermorelin-5mg",
    name: "Sermorelin",
    strength: "5 mg",
    priceCents: 5000,
    category: "Growth & Signaling",
    tag: "GHRH (1-29) analog",
    description:
      "Sermorelin is a GHRH (1-29) analog studied in growth-hormone axis and endocrine signaling research.",
  },
  {
    slug: "tesamorelin-10mg",
    name: "Tesamorelin",
    strength: "10 mg",
    priceCents: 5000,
    category: "Growth & Signaling",
    tag: "Stabilized GHRH analog",
    description:
      "Tesamorelin is a stabilized growth-hormone-releasing hormone analog referenced in metabolic and adipose-tissue research.",
  },
  {
    slug: "kisspeptin",
    name: "Kisspeptin",
    strength: "Research vial",
    priceCents: 5000,
    category: "Growth & Signaling",
    tag: "Reproductive-axis signaling peptide",
    description:
      "Kisspeptin is a signaling peptide referenced in reproductive-axis and neuroendocrine research models.",
  },
  {
    slug: "pt-141-10mg",
    name: "PT-141",
    strength: "10 mg",
    priceCents: 5000,
    category: "Growth & Signaling",
    tag: "Melanocortin agonist",
    description:
      "PT-141 (Bremelanotide) is a melanocortin-receptor agonist studied in neuroendocrine signaling research.",
  },

  // ---------------- Longevity & Cellular ----------------
  {
    slug: "nad-1000mg",
    name: "NAD+",
    strength: "1000 mg",
    priceCents: 10000,
    category: "Longevity & Cellular",
    tag: "Cellular coenzyme",
    description:
      "NAD+ is an essential coenzyme central to cellular metabolism, DNA-repair pathways, and longevity research at the mitochondrial level.",
    featured: true,
  },
  {
    slug: "nad-500mg",
    name: "NAD+",
    strength: "500 mg",
    priceCents: 6000,
    category: "Longevity & Cellular",
    tag: "Cellular coenzyme",
    description:
      "A 500 mg NAD+ vial for cellular-metabolism and longevity research into redox balance and DNA-repair pathways.",
  },
  {
    slug: "mots-c-10mg",
    name: "MOTS-c",
    strength: "10 mg",
    priceCents: 4000,
    category: "Longevity & Cellular",
    tag: "Mitochondrial-derived peptide",
    description:
      "MOTS-c is a mitochondrial-derived peptide studied for its role in metabolic regulation, insulin sensitivity, and cellular-energy research.",
  },
  {
    slug: "mots-c-40mg",
    name: "MOTS-c",
    strength: "40 mg",
    priceCents: 5000,
    category: "Longevity & Cellular",
    tag: "Mitochondrial peptide (high concentration)",
    description:
      "A high-concentration MOTS-c vial for extended mitochondrial and metabolic research protocols.",
    featured: true,
  },
  {
    slug: "ss-31-10mg",
    name: "SS-31",
    strength: "10 mg",
    priceCents: 5000,
    category: "Longevity & Cellular",
    tag: "Mitochondria-targeted tetrapeptide",
    description:
      "SS-31 (Elamipretide) is a mitochondria-targeted tetrapeptide referenced in research on cardiolipin stabilization and cellular-energy production.",
  },
  {
    slug: "epitalon",
    name: "Epitalon",
    strength: "Research vial",
    priceCents: 5000,
    category: "Longevity & Cellular",
    tag: "Telomerase-pathway tetrapeptide",
    description:
      "Epitalon is a synthetic tetrapeptide referenced in telomere-biology and cellular-aging research models.",
  },
  {
    slug: "slu-pp-332",
    name: "SLU-PP-332",
    strength: "Research vial",
    priceCents: 5000,
    category: "Longevity & Cellular",
    tag: "ERR pan-agonist",
    description:
      "SLU-PP-332 is an estrogen-related-receptor (ERR) pan-agonist studied in mitochondrial-biogenesis and exercise-mimetic research.",
  },

  // ---------------- Cognitive Research ----------------
  {
    slug: "semax-10mg",
    name: "Semax",
    strength: "10 mg",
    priceCents: 5000,
    category: "Cognitive Research",
    tag: "ACTH(4-10) nootropic peptide",
    description:
      "Semax is a synthetic peptide derived from ACTH(4-10), studied for its influence on BDNF expression and cognitive research models.",
  },
  {
    slug: "selank-10mg",
    name: "Selank",
    strength: "10 mg",
    priceCents: 5000,
    category: "Cognitive Research",
    tag: "Tuftsin-analog anxiolytic peptide",
    description:
      "Selank is a synthetic analog of the immunomodulatory peptide tuftsin, referenced in anxiolytic and neuroregulatory research.",
  },
];

export function formatPrice(cents?: number): string {
  if (cents == null) return "Inquire";
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductsByCategory(): { category: Category; items: Product[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: products.filter((p) => p.category === category),
  })).filter((group) => group.items.length > 0);
}

const priced = products.filter((p) => p.priceCents != null);

export const catalogStats = {
  count: products.length,
  categories: CATEGORY_ORDER.length,
  startingPriceCents: Math.min(...priced.map((p) => p.priceCents as number)),
};
