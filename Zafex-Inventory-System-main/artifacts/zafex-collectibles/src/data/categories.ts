export interface SubCategory {
  label: string;
  slug: string;
}

export interface NavCategory {
  label: string;
  slug: string;
  subs: SubCategory[];
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    label: 'CHAINMAIL ARMOR',
    slug: 'chainmail-armor',
    subs: [
      { label: 'Chainmail Shirts & Hauberks', slug: 'chainmail-shirts-hauberks' },
      { label: 'Chainmail Coifs & Hood',       slug: 'chainmail-coifs-hood' },
      { label: 'Chainmail Aventails',           slug: 'chainmail-aventails' },
      { label: 'Chainmail Tops & Bras',         slug: 'chainmail-tops-bras' },
      { label: 'Chainmail Leggings & Skirts',   slug: 'chainmail-leggings-skirts' },
      { label: 'Chainmail Belts',               slug: 'chainmail-belts' },
      { label: 'Chainmail Gloves & Sleeves',    slug: 'chainmail-gloves-sleeves' },
      { label: 'Chainmail Accessories',         slug: 'chainmail-accessories' },
    ],
  },
  {
    label: 'MEDIEVAL HELMETS',
    slug: 'medieval-helmets',
    subs: [
      { label: 'Templar Helmets',   slug: 'templar-helmets' },
      { label: 'Great Helmets',     slug: 'great-helmets' },
      { label: 'Bascinet Helmets',  slug: 'bascinet-helmets' },
      { label: 'Barbute Helmets',   slug: 'barbute-helmets' },
      { label: 'Sugarloaf Helmets', slug: 'sugarloaf-helmets' },
      { label: 'Viking Helmets',    slug: 'viking-helmets' },
      { label: 'Norman Helmets',    slug: 'norman-helmets' },
      { label: 'Spangenhelm',       slug: 'spangenhelm' },
      { label: 'Roman Helmets',     slug: 'roman-helmets' },
      { label: 'Gladiator Helmets', slug: 'gladiator-helmets' },
      { label: 'Crusader Helmets',  slug: 'crusader-helmets' },
      { label: 'Fantasy Helmets',   slug: 'fantasy-helmets' },
    ],
  },
  {
    label: 'PLATE ARMOR',
    slug: 'plate-armor',
    subs: [
      { label: 'Breastplates',    slug: 'breastplates' },
      { label: 'Cuirasses',       slug: 'cuirasses' },
      { label: 'Pauldrons',       slug: 'pauldrons' },
      { label: 'Gorgets',         slug: 'gorgets' },
      { label: 'Vambraces',       slug: 'vambraces' },
      { label: 'Gauntlets',       slug: 'gauntlets' },
      { label: 'Greaves',         slug: 'greaves' },
      { label: 'Sabatons',        slug: 'sabatons' },
      { label: 'Full Armor Sets', slug: 'full-armor-sets' },
    ],
  },
  {
    label: 'LEATHER ARMOR',
    slug: 'leather-armor',
    subs: [
      { label: 'Leather Chest Armor',   slug: 'leather-chest-armor' },
      { label: 'Leather Bracers',       slug: 'leather-bracers' },
      { label: 'Leather Gorgets',       slug: 'leather-gorgets' },
      { label: 'Leather Pauldrons',     slug: 'leather-pauldrons' },
      { label: 'Leather Belts',         slug: 'leather-belts' },
      { label: 'Leather Bags & Pouches',slug: 'leather-bags-pouches' },
      { label: 'Leather Accessories',   slug: 'leather-accessories' },
    ],
  },
  {
    label: 'GAMBESONS',
    slug: 'gambesons',
    subs: [
      { label: 'Gambesons',       slug: 'gambesons' },
      { label: 'Padded Jackets',  slug: 'padded-jackets' },
      { label: 'Arming Doublets', slug: 'arming-doublets' },
    ],
  },
  {
    label: 'MEDIEVAL CLOTHING',
    slug: 'medieval-clothing',
    subs: [
      { label: 'Tunics',          slug: 'tunics' },
      { label: 'Surcoats',        slug: 'surcoats' },
      { label: 'Cloaks',          slug: 'cloaks' },
      { label: 'Capes',           slug: 'capes' },
      { label: 'Pants & Shirts',  slug: 'pants-shirts' },
      { label: 'Dresses',         slug: 'dresses' },
      { label: 'Viking Clothing', slug: 'viking-clothing' },
      { label: 'Roman Clothing',  slug: 'roman-clothing' },
    ],
  },
  {
    label: 'ROMAN COLLECTION',
    slug: 'roman-collection',
    subs: [
      { label: 'Roman Armor',        slug: 'roman-armor' },
      { label: 'Lorica Segmentata',  slug: 'lorica-segmentata' },
      { label: 'Roman Helmets',      slug: 'roman-helmets' },
      { label: 'Roman Shields',      slug: 'roman-shields' },
      { label: 'Roman Belts',        slug: 'roman-belts' },
      { label: 'Roman Accessories',  slug: 'roman-accessories' },
    ],
  },
  {
    label: 'VIKING COLLECTION',
    slug: 'viking-collection',
    subs: [
      { label: 'Viking Armor',       slug: 'viking-armor' },
      { label: 'Viking Helmets',     slug: 'viking-helmets' },
      { label: 'Viking Shields',     slug: 'viking-shields' },
      { label: 'Viking Clothing',    slug: 'viking-clothing' },
      { label: 'Viking Belts',       slug: 'viking-belts' },
      { label: 'Viking Accessories', slug: 'viking-accessories' },
    ],
  },
  {
    label: 'SHIELDS',
    slug: 'shields',
    subs: [
      { label: 'Wooden Shields',  slug: 'wooden-shields' },
      { label: 'Viking Shields',  slug: 'viking-shields' },
      { label: 'Roman Shields',   slug: 'roman-shields' },
      { label: 'Heater Shields',  slug: 'heater-shields' },
      { label: 'Round Shields',   slug: 'round-shields' },
      { label: 'Templar Shields', slug: 'templar-shields' },
    ],
  },
  {
    label: 'WEAPONS',
    slug: 'weapons',
    subs: [
      { label: 'Swords & Daggers', slug: 'swords-daggers' },
      { label: 'Axes & Maces',     slug: 'axes-maces' },
      { label: 'Spears',           slug: 'spears' },
    ],
  },
  {
    label: 'LARP & COSPLAY',
    slug: 'larp-cosplay',
    subs: [
      { label: 'LARP Armor',         slug: 'larp-armor' },
      { label: 'Cosplay Costumes',   slug: 'cosplay-costumes' },
      { label: 'Fantasy Armor',      slug: 'fantasy-armor' },
      { label: 'Fantasy Helmets',    slug: 'fantasy-helmets' },
      { label: 'Accessories',        slug: 'accessories' },
    ],
  },
  {
    label: 'ACCESSORIES',
    slug: 'accessories',
    subs: [
      { label: 'Belts',          slug: 'belts' },
      { label: 'Bags',           slug: 'bags' },
      { label: 'Pouches',        slug: 'pouches' },
      { label: 'Drinking Horns', slug: 'drinking-horns' },
      { label: 'Tankards',       slug: 'tankards' },
      { label: 'Jewelry',        slug: 'jewelry' },
      { label: 'Medieval Gifts', slug: 'medieval-gifts' },
    ],
  },
  {
    label: 'CUSTOM ORDERS',
    slug: 'custom-orders',
    subs: [
      { label: 'Custom Armor',        slug: 'custom-armor' },
      { label: 'Custom Chainmail',    slug: 'custom-chainmail' },
      { label: 'Custom Helmets',      slug: 'custom-helmets' },
      { label: 'Custom Leather Armor',slug: 'custom-leather-armor' },
      { label: 'Museum Replicas',     slug: 'museum-replicas' },
    ],
  },
  {
    label: 'COLLECTIONS',
    slug: 'collections',
    subs: [
      { label: 'Best Sellers',            slug: 'best-sellers' },
      { label: 'New Arrivals',            slug: 'new-arrivals' },
      { label: 'Staff Picks',             slug: 'staff-picks' },
      { label: 'Handmade Collection',     slug: 'handmade-collection' },
      { label: 'Limited Edition',         slug: 'limited-edition' },
      { label: 'Festival Collection',     slug: 'festival-collection' },
      { label: 'Movie Inspired',          slug: 'movie-inspired' },
      { label: 'Historical Reproductions',slug: 'historical-reproductions' },
    ],
  },
  {
    label: 'WHOLESALE',
    slug: 'wholesale',
    subs: [
      { label: 'Wholesale Program', slug: 'wholesale-program' },
      { label: 'Private Label',     slug: 'private-label' },
      { label: 'OEM Manufacturing', slug: 'oem-manufacturing' },
      { label: 'Bulk Orders',       slug: 'bulk-orders' },
      { label: 'Distributor Program',slug: 'distributor-program' },
    ],
  },
  {
    label: 'ABOUT US',
    slug: 'about-us',
    subs: [
      { label: 'Our Story',           slug: 'our-story' },
      { label: 'Our Workshop',        slug: 'our-workshop' },
      { label: 'Manufacturing Process',slug: 'manufacturing-process' },
      { label: 'Meet Our Craftsmen',  slug: 'meet-our-craftsmen' },
      { label: 'Quality Promise',     slug: 'quality-promise' },
      { label: 'Global Shipping',     slug: 'global-shipping' },
    ],
  },
  {
    label: 'RESOURCES',
    slug: 'resources',
    subs: [
      { label: 'Medieval Blog',      slug: 'medieval-blog' },
      { label: 'Buying Guides',      slug: 'buying-guides' },
      { label: 'Chainmail Size Guide',slug: 'chainmail-size-guide' },
      { label: 'Helmet Size Guide',  slug: 'helmet-size-guide' },
      { label: 'Leather Care Guide', slug: 'leather-care-guide' },
      { label: 'FAQ',                slug: 'faq' },
    ],
  },
];
