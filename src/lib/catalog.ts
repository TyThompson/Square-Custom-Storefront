export type CatalogItem = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  image: string;
  accent: string;
};

/** Demo catalog used when Square Catalog API credentials are not configured. */
export const DEMO_CATALOG: CatalogItem[] = [
  {
    id: "bean-house",
    name: "House Blend Beans",
    description: "Medium roast with cocoa and toasted almond notes. 12 oz bag.",
    priceCents: 1800,
    category: "Coffee",
    image: "/products/beans.svg",
    accent: "#3d5a45",
  },
  {
    id: "bean-ethiopian",
    name: "Ethiopian Natural",
    description: "Bright blueberry and jasmine. Single-origin, washed process.",
    priceCents: 2200,
    category: "Coffee",
    image: "/products/ethiopian.svg",
    accent: "#6b4f3a",
  },
  {
    id: "mug-stone",
    name: "Stoneware Mug",
    description: "Hand-thrown 12 oz mug. Matte sage glaze, kiln-fired locally.",
    priceCents: 2800,
    category: "Goods",
    image: "/products/mug.svg",
    accent: "#7d9b8a",
  },
  {
    id: "tea-sencha",
    name: "Sencha Green Tea",
    description: "First-flush leaves, grassy and clean. 50 g pouch.",
    priceCents: 1400,
    category: "Tea",
    image: "/products/tea.svg",
    accent: "#4a6b52",
  },
  {
    id: "filter-papers",
    name: "Cone Filters (100)",
    description: "Oxygen-bleached #2 filters for pour-over brewing.",
    priceCents: 900,
    category: "Goods",
    image: "/products/filters.svg",
    accent: "#8a8478",
  },
  {
    id: "syrup-vanilla",
    name: "Vanilla Syrup",
    description: "Small-batch syrup with real Madagascar vanilla. 8 oz.",
    priceCents: 1200,
    category: "Pantry",
    image: "/products/syrup.svg",
    accent: "#c4a574",
  },
];

export function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function getCatalogItem(id: string) {
  return DEMO_CATALOG.find((item) => item.id === id);
}
