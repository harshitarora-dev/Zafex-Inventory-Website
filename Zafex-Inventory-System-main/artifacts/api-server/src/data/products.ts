/** Static product catalogue — source of truth until the DB is populated. */

export type Product = {
  id: string;
  name: string;
  cat: string;
  sub: string;
  price: number;
  badge?: string;
  image: string;
  desc?: string;
  tags?: string[];
  inStock?: boolean;
};

export const PRODUCTS: Product[] = [
  { id: "sw-1", name: "Duelist Sword – Vanguard Black", cat: "weaponry", sub: "swords", price: 4800, badge: "new", image: "/images/sword.png", desc: "A sleek duelist blade forged for collectors and LARP enthusiasts. Durable polypropylene construction with a steel-grey finish. Perfect for display or reenactment.", tags: ["sword","larp","duelist"], inStock: true },
  { id: "sw-2", name: "Duelist Sword – Vanguard Gold", cat: "weaponry", sub: "swords", price: 4800, badge: "new", image: "/images/swords.png", desc: "Gold-finished variant of the Vanguard series. An elegant display piece with balanced weight.", tags: ["sword","display"], inStock: true },
  { id: "sw-3", name: "Imperial Sword – Gold Edition", cat: "weaponry", sub: "swords", price: 9200, badge: "limited", image: "/images/sword.png", desc: "Museum-grade imperial longsword with ornamental gold crossguard. Limited collector's run.", tags: ["sword","limited","imperial"], inStock: false },
  { id: "ax-1", name: "Viking Bearded Broadaxe", cat: "weaponry", sub: "axes-hammers", price: 7200, badge: "new", image: "/images/axe.png", desc: "Forged steel head on a solid ash handle. Based on Norse archaeological finds.", tags: ["axe","viking"], inStock: true },
  { id: "ax-2", name: "Battle Hammer – Iron Shod", cat: "weaponry", sub: "axes-hammers", price: 8000, image: "/images/hammers.png", desc: "Heavyweight flanged mace. German design, 14th century.", inStock: true },
  { id: "bow-1", name: "Ranger's Elven Bow", cat: "weaponry", sub: "bows-arrows", price: 5500, badge: "new", image: "/images/bow.png", desc: "Elegant longbow crafted from laminated wood with engraved elven motifs. A must-have for LARP archers and fantasy collectors.", tags: ["bow","larp","elven"], inStock: true },
  { id: "sp-1", name: "Ashwood Tournament Spear", cat: "weaponry", sub: "training-weapons", price: 4200, image: "/images/spears.png", desc: "Balanced training spear for reenactors. Safe rounded tip.", inStock: true },
  { id: "bp-1", name: "Gothic Fluted Steel Breastplate", cat: "armour", sub: "breastplates", price: 20000, badge: "new", image: "/images/breastplates.png", desc: "Full-coverage gothic breastplate with distinctive fluted ridges for deflection. Hand-forged 16-gauge mild steel, polished to a mirror finish.", tags: ["breastplate","gothic","steel"], inStock: true },
  { id: "bp-2", name: "Leather Breastplate – Ranger", cat: "armour", sub: "breastplates", price: 12000, image: "/images/leather-breastplates.png", desc: "Hardened leather cuirass with brass buckles. Lightweight protection for archers and rangers. Adjustable fit.", tags: ["leather","breastplate"], inStock: true },
  { id: "hm-1", name: "Norman Spangenhelm Helmet", cat: "armour", sub: "helmets", price: 14500, image: "/images/norman-helmet.png", desc: "Riveted segmented helmet based on 11th-century Norman design. Includes nasal bar. Mild steel construction.", tags: ["helmet","norman","steel"], inStock: true },
  { id: "hm-2", name: "Barbuta Open-Face Helm", cat: "armour", sub: "helmets", price: 9800, image: "/images/gladitor-helmet.png", desc: "Italian-style open-faced helm of the 15th century. Provides excellent vision and ventilation for reenactors.", tags: ["helmet","italian","barbuta"], inStock: true },
  { id: "hm-3", name: "Viking Spectacle Helmet", cat: "armour", sub: "helmets", price: 11200, image: "/images/viking-helmet.png", desc: "Characteristic spectacle guard helm inspired by Norse Vendel-period finds. Forged steel with applied bronze accents.", tags: ["helmet","viking"], inStock: false },
  { id: "cm-1", name: "Riveted Chainmail Hauberk", cat: "armour", sub: "chainmail", price: 15500, badge: "new", image: "/images/chainmail-shirt.png", desc: "Full-length riveted chainmail hauberk crafted from 8mm mild steel rings. Covers shoulders to mid-thigh. Battle-ready.", tags: ["chainmail","hauberk","steel"], inStock: true },
  { id: "cm-2", name: "Steel Chainmail Coif", cat: "armour", sub: "chainmail", price: 6500, image: "/images/chainmail-coif.png", desc: "Head and neck protection in solid mild steel rings. Pairs with any helm or worn alone.", tags: ["chainmail","coif"], inStock: true },
  { id: "sh-1", name: "Viking Round Shield", cat: "armour", sub: "shields", price: 9500, image: "/images/round-shields.png", desc: "Hand-painted poplar wood shield with iron boss. Based on archaeological finds from Birka. Strap and grip included.", tags: ["shield","viking","wooden"], inStock: true },
  { id: "sh-2", name: "Templar Heater Shield", cat: "armour", sub: "shields", price: 11000, image: "/images/tamplar-crusader-shields.png", desc: "Classic heater shield in 14-gauge steel with hand-painted Templar cross. Straps adjustable.", tags: ["shield","templar","crusader"], inStock: true },
  { id: "sh-3", name: "Viking Kite Shield", cat: "armour", sub: "shields", price: 8800, image: "/images/viking-shield.png", desc: "Elongated kite shield offering full-body coverage. Linden wood with leather edge binding.", tags: ["shield","viking","kite"], inStock: true },
  { id: "cl-1", name: "Classic Padded Cotton Gambeson", cat: "clothing", sub: "tabards", price: 9500, badge: "new", image: "/images/gambeson.png", desc: "Quilted padded gambeson for use under armour or standalone protection. Thick cotton batting, reinforced stitching.", tags: ["gambeson","padding","clothing"], inStock: true },
  { id: "cl-2", name: "Viking Merchant Tunic", cat: "clothing", sub: "tunics", price: 4000, image: "/images/viking-tunic.png", desc: "Woven linen tunic with embroidered trim. Authentic Viking cut. Available in natural and undyed colours.", tags: ["tunic","viking","linen"], inStock: true },
  { id: "cl-3", name: "Medieval Duchess Gown", cat: "clothing", sub: "cloaks-robes", price: 10000, image: "/images/1781973392758_gown.jpeg", desc: "Flowing brocade gown with lace-up back and flared sleeves. Ideal for festivals, LARP, and historical re-enactment.", tags: ["gown","medieval","clothing"], inStock: true },
  { id: "ac-1", name: "Leather Sword Belt – Classic", cat: "accessories", sub: "belts", price: 2200, badge: "new", image: "/images/leather-belt.png", desc: "Full-grain leather sword belt with adjustable brass buckle. Fits blades up to 90 cm. Hand-stitched for durability.", tags: ["belt","leather","sword"], inStock: true },
  { id: "ac-2", name: "Carved Drinking Horn", cat: "accessories", sub: "bags-pouches", price: 3200, image: "/images/drinking-horn.png", desc: "Authentic ox horn with carved runic patterns. Food-safe sealed interior. Comes with a braided leather stand.", tags: ["drinking-horn","viking","accessory"], inStock: true },
  { id: "ac-3", name: "Knight's Pendant – Sterling", cat: "accessories", sub: "jewellery", price: 2400, badge: "new", image: "/images/horn-mug.png", desc: "Hand-cast sterling silver pendant shaped as a crusader shield. Comes on a 60 cm sterling chain.", tags: ["pendant","jewellery","knight"], inStock: true },
  { id: "ac-4", name: "Embossed Leather Bracer", cat: "accessories", sub: "bags-pouches", price: 3900, image: "/images/leather-bracer.png", desc: "Pair of hardened leather bracers with embossed Celtic knotwork. Lace-up closure for a custom fit.", tags: ["bracer","leather","celtic"], inStock: true },
  { id: "ac-5", name: "Viking Drinking Horn Mug", cat: "accessories", sub: "bags-pouches", price: 1800, image: "/images/drinking-horn.png", desc: "Solid ox-horn mug with flat base. Perfect for mead, ale, or just the aesthetic. Dishwasher safe.", tags: ["mug","horn","viking"], inStock: true },
];
