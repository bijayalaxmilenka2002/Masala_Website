// Comprehensive product database for Subhadarshini Spices with Real Pricing & Spice Meters
const PRODUCTS_DATA = [
  // BLENDED GROUND SPICES
  {
    id: "sambar-masala",
    name: "Sambar Masala",
    category: "blended",
    categoryName: "Blended Ground Spices",
    image: "assets/images/products/sambar-masala.png",
    badge: "Bestseller",
    rating: 5,
    reviews: 142,
    heat: 2, // 1 to 3
    heatLabel: "Medium Spice",
    aroma: "High Aromatic",
    variants: [
      { weight: "50g", price: 38 },
      { weight: "100g", price: 72 },
      { weight: "200g", price: 138 }
    ],
    shortDesc: "Authentic coastal spice blend for richly aromatic, tangy dal stews.",
    description: "Sambar masala is a traditional South Indian spice blend crafted with roasted lentils, coriander, cumin, fenugreek, and fragrant spices that add depth, aroma, and tang to lentil and vegetable stews. Specially milled in low temperature to retain essential oils.",
    benefits: ["Improves digestive health", "Rich in dietary fiber and plant antioxidants", "Supports metabolic vitality"],
    ingredients: "Coriander, Cumin, Red Chilli, Fenugreek, Mustard, Black Pepper, Turmeric, Asafoetida, Curry Leaves, Chana Dal, Urad Dal",
    pairsWith: "Toor Dal, Drumstick Sambars, Idli & Dosa, Mixed Vegetable Lentils"
  },
  {
    id: "chicken-masala",
    name: "Special Chicken Masala",
    category: "blended",
    categoryName: "Blended Ground Spices",
    image: "assets/images/products/chicken-masala.png",
    badge: "Popular",
    rating: 5,
    reviews: 218,
    heat: 3,
    heatLabel: "Fiery Hot",
    aroma: "Intense Roast",
    variants: [
      { weight: "50g", price: 42 },
      { weight: "100g", price: 80 },
      { weight: "250g", price: 195 }
    ],
    shortDesc: "Robust spice blend infused with toasted whole spices for lip-smacking chicken gravies.",
    description: "An authentic, deep crimson spice blend combining roasted cumin, mace, cinnamon, bay leaf, and fiery red chillies. Formulated to permeate deep into chicken marinades for rich gravies and tandoori roasts.",
    benefits: ["Natural thermogenic booster", "Rich in capsaicin and immune-boosting phytonutrients", "Free from artificial coloring"],
    ingredients: "Coriander, Cumin, Chilli, Black Pepper, Turmeric, Clove, Cinnamon, Cardamom, Nutmeg, Mace, Star Anise",
    pairsWith: "Homestyle Chicken Curry, Kadhai Chicken, Chicken Korma, Chicken Sukka"
  },
  {
    id: "meat-masala",
    name: "Royal Meat Masala",
    category: "blended",
    categoryName: "Blended Ground Spices",
    image: "assets/images/products/meat-masala.png",
    badge: "Chef Choice",
    rating: 5,
    reviews: 96,
    heat: 3,
    heatLabel: "Fiery Hot",
    aroma: "Deep Warmth",
    variants: [
      { weight: "50g", price: 45 },
      { weight: "100g", price: 85 },
      { weight: "200g", price: 165 }
    ],
    shortDesc: "Warm, full-bodied spice concoction designed for slow-cooked tender meat curries.",
    description: "A masterful formulation of aromatic spices engineered to complement the hearty character of mutton and slow-cooked meat preparations. Ensures dark, flavorful gravies with exceptional fragrance.",
    benefits: ["Assists in protein breakdown and digestion", "High concentration of warming antioxidants", "Contains natural digestive spices"],
    ingredients: "Coriander, Cumin, Black Cardamom, Clove, Cinnamon, Bay Leaves, Black Pepper, Dry Ginger, Mace, Nutmeg",
    pairsWith: "Mutton Kassa, Rogan Josh, Keema Curry, Traditional Meat Stews"
  },
  {
    id: "fish-curry-masala",
    name: "Coastal Fish Curry Masala",
    category: "blended",
    categoryName: "Blended Ground Spices",
    image: "assets/images/products/fish-curry-masala.png",
    badge: "Odisha Special",
    rating: 5,
    reviews: 164,
    heat: 2,
    heatLabel: "Medium Tangy",
    aroma: "Mustard Herb",
    variants: [
      { weight: "50g", price: 40 },
      { weight: "100g", price: 76 }
    ],
    shortDesc: "Odisha & coastal inspired blend balanced with mustard, fenugreek, and subtle tartness.",
    description: "Tailored to honor eastern India's rich seafood traditions, this masala balances mustard seeds, coriander, cumin, and subtle souring notes to eliminate raw aroma and enhance delicate fish textures.",
    benefits: ["Rich in essential minerals", "Heart-healthy mustard oil friendly blend", "Enhances seafood flavor naturally"],
    ingredients: "Mustard, Coriander, Turmeric, Red Chilli, Cumin, Fenugreek, Black Pepper, Dry Mango Powder",
    pairsWith: "Macha Besara (Odia Fish in Mustard), Rohu Curry, Prawn Masala, Fish Fry"
  },
  {
    id: "dalma-powder",
    name: "Heritage Dalma Masala",
    category: "blended",
    categoryName: "Blended Ground Spices",
    image: "assets/images/products/dalma-powder.png",
    badge: "Traditional",
    rating: 5,
    reviews: 189,
    heat: 1,
    heatLabel: "Mild Roasted",
    aroma: "Toasted Jeera",
    variants: [
      { weight: "50g", price: 36 },
      { weight: "100g", price: 68 }
    ],
    shortDesc: "The soul of quintessential Odia Dalma — freshly dry roasted cumin and red chilli notes.",
    description: "Dalma is Odisha's culinary crowning jewel. This proprietary spice blend brings the iconic aroma of slow roasted cumin seeds and red chillies that are traditionally sprinkled over simmering dal with raw papaya, pumpkin, and plantain.",
    benefits: ["Light on digestion", "Zero additives or fillers", "Pure traditional flavor"],
    ingredients: "Dry Roasted Cumin, Dry Red Chilli, Cardamom, Bay Leaf, Selected Heritage Spices",
    pairsWith: "Authentic Odia Dalma, Temple-style Dalma, Santula, Ghanta Tarkari"
  },
  {
    id: "shahi-paneer-masala",
    name: "Shahi Paneer Masala",
    category: "blended",
    categoryName: "Blended Ground Spices",
    image: "assets/images/products/shahi-paneer-masala.png",
    badge: "Vegetarian Delight",
    rating: 5,
    reviews: 112,
    heat: 1,
    heatLabel: "Mild Sweet Spice",
    aroma: "Cardamom & Mace",
    variants: [
      { weight: "50g", price: 42 },
      { weight: "100g", price: 80 }
    ],
    shortDesc: "Fragrant, mild and rich spices for velvety, restaurant-style paneer gravies.",
    description: "Crafted for luxurious, creamy vegetarian gravies. Contains delicate hints of green cardamom, mace, kasuri methi, and mild Kashmiri chilli that produce a silky, golden-orange curry sauce.",
    benefits: ["Mild on stomach", "Enhances rich cashew & cream curries", "100% pure vegetarian spice blend"],
    ingredients: "Coriander, Cumin, Green Cardamom, Kasuri Methi, Mace, Nutmeg, Cinnamon, Turmeric, Kashmiri Chilli",
    pairsWith: "Shahi Paneer, Paneer Butter Masala, Matar Paneer, Malai Kofta"
  },
  {
    id: "garam-masala",
    name: "Supreme Garam Masala",
    category: "blended",
    categoryName: "Blended Ground Spices",
    image: "assets/images/products/garam-masala.png",
    badge: "Kitchen Essential",
    rating: 5,
    reviews: 240,
    heat: 3,
    heatLabel: "Intense Warmth",
    aroma: "Royal Exotic",
    variants: [
      { weight: "50g", price: 48 },
      { weight: "100g", price: 92 },
      { weight: "250g", price: 220 }
    ],
    shortDesc: "Finishing blend of intense, aromatic whole spices ground at ultra-low temperature.",
    description: "An authentic royal finishing spice blend containing cloves, black cardamom, cinnamon, star anise, and nutmeg. A tiny pinch sprinkled right before serving awakens irresistible aroma in any curry.",
    benefits: ["Ignites agni (digestive fire)", "Powerful antimicrobial properties", "Zero fillers or sawdust"],
    ingredients: "Black Cardamom, Green Cardamom, Clove, Cinnamon, Star Anise, Mace, Nutmeg, Black Pepper, Cumin",
    pairsWith: "Any Indian Curry, Biryani, Pulao, Dal Fry, Samosa Fillings"
  },
  {
    id: "biryani-masala",
    name: "Dum Biryani Masala",
    category: "blended",
    categoryName: "Blended Ground Spices",
    image: "assets/images/products/biryani-masala.png",
    badge: "Exotic",
    rating: 5,
    reviews: 87,
    heat: 2,
    heatLabel: "Medium Warmth",
    aroma: "Shahi Jeera & Mace",
    variants: [
      { weight: "50g", price: 46 },
      { weight: "100g", price: 88 }
    ],
    shortDesc: "Infused with royal shahi jeera, saffron undertones, and regal sweet whole spices.",
    description: "Inspired by the royal kitchens of India, this blend marries star anise, mace, cloves, and caraway seeds with whole fragrant spices to impart that signature layered dum biryani fragrance.",
    benefits: ["Rich in uplifting essential oils", "Digestive spice profile", "Restaurant-grade aroma at home"],
    ingredients: "Shahi Jeera, Green Cardamom, Black Cardamom, Cinnamon, Cloves, Mace, Bay Leaf, Star Anise, Black Pepper",
    pairsWith: "Hyderabadi Biryani, Kolkata Biryani, Veg Dum Pulao, Yakhni"
  },
  {
    id: "kitchen-king",
    name: "Kitchen King Masala",
    category: "blended",
    categoryName: "Blended Ground Spices",
    image: "assets/images/products/kitchen-king.webp",
    badge: "All-Rounder",
    rating: 5,
    reviews: 130,
    heat: 2,
    heatLabel: "Balanced Spice",
    aroma: "Classic Curry",
    variants: [
      { weight: "50g", price: 40 },
      { weight: "100g", price: 76 }
    ],
    shortDesc: "The universal curry enhancer that elevates every daily vegetable and lentil dish.",
    description: "The ultimate king of spice blends. Versatile and harmoniously balanced, it transforms everyday vegetables, potatoes, and lentils into lip-smacking feasts with consistent warmth and color.",
    benefits: ["Balanced everyday seasoning", "Nutritionally balanced micronutrients", "No added preservatives"],
    ingredients: "Coriander, Cumin, Turmeric, Chilli, Fenugreek, Black Pepper, Dry Ginger, Mustard, Clove, Nutmeg",
    pairsWith: "Aloo Gobhi, Mix Veg Curry, Bhindi Masala, Dal Tadka"
  },
  {
    id: "chat-masala",
    name: "Tangy Chat Masala",
    category: "blended",
    categoryName: "Blended Ground Spices",
    image: "assets/images/products/chat-masala.png",
    badge: "Snack Lover",
    rating: 5,
    reviews: 175,
    heat: 1,
    heatLabel: "Tangy & Zesty",
    aroma: "Amchur & Black Salt",
    variants: [
      { weight: "50g", price: 35 },
      { weight: "100g", price: 65 }
    ],
    shortDesc: "Pungent, tangy, and zesty seasoning featuring black salt, hing, and amchur.",
    description: "Our signature sprinkle spice combines sun-dried raw mango powder (amchur), mineral-rich rock salt, black salt, and toasted cumin. Perfect for fruit bowls, street chaats, and salads.",
    benefits: ["Aids quick digestion", "Electrolyte-replenishing mineral salts", "Appetite stimulator"],
    ingredients: "Dry Mango Powder (Amchur), Black Salt, Cumin, Coriander, Black Pepper, Mint, Asafoetida, Citric Salt",
    pairsWith: "Fruit Chaat, Dahi Vada, Pani Puri, Salads, French Fries, Lassi"
  },
  {
    id: "chana-masala",
    name: "Amritsari Chana Masala",
    category: "blended",
    categoryName: "Blended Ground Spices",
    image: "assets/images/products/chana-masala.png",
    badge: "North Indian Classic",
    rating: 5,
    reviews: 94,
    heat: 2,
    heatLabel: "Medium Pungent",
    aroma: "Anardana & Cumin",
    variants: [
      { weight: "50g", price: 38 },
      { weight: "100g", price: 72 }
    ],
    shortDesc: "Robust, dark, and tangy blend tailored for authentic chickpeas and chole gravies.",
    description: "Specially concocted to deliver that deep brownish hue and signature tartness of Punjabi chole without needing artificial tea bags or enhancers.",
    benefits: ["High iron and antioxidant profile", "Supports legume digestion", "Zero artificial coloring"],
    ingredients: "Coriander, Dry Mango, Cumin, Red Chilli, Pomegranate Seeds (Anardana), Black Pepper, Ginger, Cinnamon",
    pairsWith: "Chole Bhature, Pindi Chana, Chickpea Salad, Puri Sabzi"
  },
  {
    id: "egg-curry-masala",
    name: "Egg Curry Masala",
    category: "blended",
    categoryName: "Blended Ground Spices",
    image: "assets/images/products/egg-curry-masala.png",
    badge: "Quick Cook",
    rating: 5,
    reviews: 67,
    heat: 2,
    heatLabel: "Medium Pepper",
    aroma: "Curry Leaf & Cumin",
    variants: [
      { weight: "50g", price: 38 },
      { weight: "100g", price: 72 }
    ],
    shortDesc: "Zesty, fragrant blend designed to coat boiled and shallow-fried eggs in flavor.",
    description: "Crafted specifically for egg curries, egg roast, and Anda Bhurji. It creates a rich gravy that clings delightfully to slit boiled eggs.",
    benefits: ["Fast cooking friendly", "Rich, hearty flavor profile", "Lab-tested pure spices"],
    ingredients: "Coriander, Cumin, Chilli, Black Pepper, Turmeric, Clove, Cinnamon, Fennel, Curry Leaves",
    pairsWith: "Dhaba Style Egg Curry, Egg Masala Fry, Anda Bhurji"
  },

  // BASIC GROUND SPICES
  {
    id: "turmeric-powder",
    name: "Pure Haldi (Turmeric) Powder",
    category: "basic",
    categoryName: "Basic Ground Spices",
    image: "assets/images/products/turmeric-powder.png",
    badge: "High Curcumin",
    rating: 5,
    reviews: 320,
    heat: 0,
    heatLabel: "Earthy Healing",
    aroma: "Pure Golden Turmeric",
    variants: [
      { weight: "100g", price: 34 },
      { weight: "250g", price: 78 },
      { weight: "500g", price: 145 },
      { weight: "1kg", price: 280 }
    ],
    shortDesc: "Bright golden turmeric packed with high natural curcumin content from pristine farms.",
    description: "Sourced directly from certified turmeric cultivation hubs and ground in sanitary cold-air classifying mills. Free of lead chromate, chalk, or foreign starches.",
    benefits: ["High natural Curcumin content (tested >3%)", "Potent anti-inflammatory & immunity booster", "Pure natural golden color"],
    ingredients: "100% Pure Whole Dried Turmeric Rhizomes",
    pairsWith: "Every Indian Dal, Sabzi, Golden Haldi Milk, Marinades"
  },
  {
    id: "red-chilli-powder",
    name: "Hot Red Chilli Powder",
    category: "basic",
    categoryName: "Basic Ground Spices",
    image: "assets/images/products/red-chilli-powder.png",
    badge: "Fiery Fresh",
    rating: 5,
    reviews: 210,
    heat: 3,
    heatLabel: "Fiery Hot",
    aroma: "Pungent Pepper",
    variants: [
      { weight: "100g", price: 42 },
      { weight: "250g", price: 98 },
      { weight: "500g", price: 185 },
      { weight: "1kg", price: 360 }
    ],
    shortDesc: "Bold pungency and vibrant heat from handpicked sun-dried stemless chillies.",
    description: "Pure whole red chillies are destemmed, cleaned, and pulverised under moisture-controlled conditions to deliver fiery heat without chemical dyes or Sudan dye adulterants.",
    benefits: ["Natural source of Vitamin C & capsaicin", "Stimulates metabolism", "100% lab certified purity"],
    ingredients: "100% Pure Sun-Dried Red Chillies (Stemless)",
    pairsWith: "Curries, Pickles, Tadka, Chutneys, Street Foods"
  },
  {
    id: "kashmiri-chilli",
    name: "Kashmiri Mirch Powder",
    category: "basic",
    categoryName: "Basic Ground Spices",
    image: "assets/images/products/kashmiri-chilli.png",
    badge: "Natural Crimson",
    rating: 5,
    reviews: 185,
    heat: 1,
    heatLabel: "Mild Warmth",
    aroma: "Smoky Sweet",
    variants: [
      { weight: "100g", price: 58 },
      { weight: "250g", price: 138 },
      { weight: "500g", price: 265 }
    ],
    shortDesc: "Gentle warmth with intense natural crimson red color for picture-perfect curries.",
    description: "Delivers the coveted royal red color to your culinary preparations with very mild, gentle heat. Perfect for butter gravies, roasts, and biryanis.",
    benefits: ["Zero synthetic coloring", "Mild on sensitive stomachs", "Loaded with carotenoids and antioxidants"],
    ingredients: "100% Pure Kashmiri Dried Red Chillies",
    pairsWith: "Butter Chicken, Paneer Butter Masala, Rogan Josh, Tandoori Marinades"
  },
  {
    id: "coriander-powder",
    name: "Dhaniya (Coriander) Powder",
    category: "basic",
    categoryName: "Basic Ground Spices",
    image: "assets/images/products/coriander-powder.png",
    badge: "Aromatic",
    rating: 5,
    reviews: 195,
    heat: 0,
    heatLabel: "Mild Earthy",
    aroma: "Citrus Herbal",
    variants: [
      { weight: "100g", price: 32 },
      { weight: "250g", price: 72 },
      { weight: "500g", price: 135 },
      { weight: "1kg", price: 260 }
    ],
    shortDesc: "Earthy, citrusy aroma ground from plump whole coriander seeds with retained oils.",
    description: "Plump green coriander seeds are sorted, gently roasted, and milled into a silky powder that lends rich body and subtle citrus aroma to curry gravies.",
    benefits: ["Soothes digestive tract", "High in dietary antioxidants", "Aids blood sugar regulation"],
    ingredients: "100% Pure Whole Coriander Seeds",
    pairsWith: "All everyday gravies, sambars, rasam, dry vegetable dishes"
  },
  {
    id: "cumin-powder",
    name: "Jeera (Cumin) Powder",
    category: "basic",
    categoryName: "Basic Ground Spices",
    image: "assets/images/products/cumin-powder.png",
    badge: "Essential",
    rating: 5,
    reviews: 140,
    heat: 1,
    heatLabel: "Warm Nutty",
    aroma: "Toasted Earth",
    variants: [
      { weight: "100g", price: 54 },
      { weight: "250g", price: 128 },
      { weight: "500g", price: 245 }
    ],
    shortDesc: "Intensely aromatic, slightly nutty cumin powder ground from cleaned whole seeds.",
    description: "Processed from high-grade cumin seeds with significant volatile oil retention. Provides the foundational warm, nutty taste to Indian cooking.",
    benefits: ["Rich in bioavailable iron", "Boosts enzymatic digestion", "Promotes gut health"],
    ingredients: "100% Pure Whole Cumin Seeds",
    pairsWith: "Raita, Dals, Chaats, Roasted Vegetable Seasoning"
  },
  {
    id: "black-pepper-powder",
    name: "Kali Mirch (Black Pepper) Powder",
    category: "basic",
    categoryName: "Basic Ground Spices",
    image: "assets/images/products/black-pepper-powder.png",
    badge: "King of Spices",
    rating: 5,
    reviews: 110,
    heat: 3,
    heatLabel: "Sharp Pungent",
    aroma: "High Piperine",
    variants: [
      { weight: "50g", price: 65 },
      { weight: "100g", price: 125 }
    ],
    shortDesc: "High piperine black pepper powder delivering sharp warmth and invigorating aroma.",
    description: "Produced from hand-sorted, heavy-weight Malabar/coastal black peppercorns. Milled cold to retain piperine content and volatile terpenes.",
    benefits: ["Enhances nutrient absorption (like Curcumin)", "Clears congestion", "Potent antioxidant"],
    ingredients: "100% Pure Bold Black Peppercorns",
    pairsWith: "Soups, Salads, Omelettes, Herbal Teas, Pepper Chicken"
  },

  // WHOLE SPICES
  {
    id: "panch-phoran",
    name: "Authentic Panch Phoran",
    category: "whole",
    categoryName: "Whole Spices",
    image: "assets/images/products/panch-phoran.png",
    badge: "Eastern Heritage",
    rating: 5,
    reviews: 155,
    heat: 1,
    heatLabel: "Gentle Herbal",
    aroma: "Fennel & Nigella",
    variants: [
      { weight: "100g", price: 44 },
      { weight: "200g", price: 82 }
    ],
    shortDesc: "The celebrated 5-spice whole blend of Odisha & Bengal for heavenly tempering.",
    description: "A precision-balanced whole spice combination of Cumin, Mustard, Fenugreek, Fennel, and Kalonji (Nigella seeds). When tossed into hot mustard oil or ghee, it releases an unforgettable aroma.",
    benefits: ["Holistic 5-way digestive blend", "Traditional Ayurvedic tempering", "100% whole, unpolished seeds"],
    ingredients: "Cumin Seeds, Mustard Seeds, Fennel Seeds, Fenugreek Seeds, Kalonji (Nigella Seeds)",
    pairsWith: "Odia Santula, Tarkari, Dalma, Fish Curry, Chutneys"
  },
  {
    id: "bay-leaf",
    name: "Tej Patta (Bay Leaf)",
    category: "whole",
    categoryName: "Whole Spices",
    image: "assets/images/products/bay-leaf.png",
    badge: "Forest Sourced",
    rating: 5,
    reviews: 78,
    heat: 0,
    heatLabel: "Woodsy Herbal",
    aroma: "Herbal Laurel",
    variants: [
      { weight: "50g", price: 28 },
      { weight: "100g", price: 50 }
    ],
    shortDesc: "Intact, whole dried aromatic laurel leaves offering woodsy, herbal warmth.",
    description: "Carefully selected whole green-olive bay leaves, free from breakage and moisture discoloration. Imparts a subtle, woodsy note to simmering broths, biryanis, and curries.",
    benefits: ["Antimicrobial qualities", "Infuses aromatic richness without calories", "Supports cardiovascular health"],
    ingredients: "100% Pure Dried Whole Bay Leaves (Cinnamomum tamala)",
    pairsWith: "Biryani, Dum Aloo, Dal Makhani, Pulao, Stews"
  },
  {
    id: "dry-red-chilli",
    name: "Whole Dry Red Chilli",
    category: "whole",
    categoryName: "Whole Spices",
    image: "assets/images/products/dry-red-chilli.png",
    badge: "Sun Dried",
    rating: 5,
    reviews: 92,
    heat: 3,
    heatLabel: "Fiery Tadka",
    aroma: "Sun-Cured Pungency",
    variants: [
      { weight: "100g", price: 46 },
      { weight: "200g", price: 88 },
      { weight: "500g", price: 210 }
    ],
    shortDesc: "Crisp, sun-dried whole red chillies with intact seeds for crackling tadka.",
    description: "Sun-dried to crisp perfection with natural oil glands preserved. Releases delightful smoky heat when crackled in hot oil or ghee during tempering.",
    benefits: ["Metabolism booster", "Natural culinary heat", "Free from artificial polish"],
    ingredients: "100% Pure Sun-Dried Whole Chillies",
    pairsWith: "Dal Tadka, Chutney Tempering, Rasam, Dry Roasts"
  },
  {
    id: "coriander-seeds",
    name: "Whole Coriander Seeds",
    category: "whole",
    categoryName: "Whole Spices",
    image: "assets/images/products/coriander-seeds.png",
    badge: "Plump & Fresh",
    rating: 5,
    reviews: 64,
    heat: 0,
    heatLabel: "Mild Citrus",
    aroma: "Coriandrol Essential Oil",
    variants: [
      { weight: "100g", price: 34 },
      { weight: "250g", price: 78 },
      { weight: "500g", price: 145 }
    ],
    shortDesc: "Dual-hulled whole coriander seeds brimming with fresh citrus-coriandrol oil.",
    description: "Cleaned through multi-stage destoners to remove twigs and dust. Ideal for home roasting, fresh mortar-pestle grinding, and pickle formulations.",
    benefits: ["Cooling Ayurvedic property", "Reduces cholesterol", "Great for herbal detox water"],
    ingredients: "100% Cleaned Whole Coriander Seeds",
    pairsWith: "Pickles, Fresh Spice Pastes, Kadai Masala, Detox Waters"
  },
  {
    id: "mustard-seeds",
    name: "Mustard Seeds (Rai / Sarso)",
    category: "whole",
    categoryName: "Whole Spices",
    image: "assets/images/products/mustard-seeds.png",
    badge: "Sharp Crackle",
    rating: 5,
    reviews: 82,
    heat: 2,
    heatLabel: "Pungent Pop",
    aroma: "Nutty Mustard Oil",
    variants: [
      { weight: "100g", price: 32 },
      { weight: "200g", price: 60 },
      { weight: "500g", price: 140 }
    ],
    shortDesc: "Cleaned, tiny bold black mustard seeds that pop with pungent, nutty aroma.",
    description: "High oil content mustard seeds, screened for uniformity. Crackles uniformly in hot oil without burning prematurely.",
    benefits: ["High in selenium and magnesium", "Supports joint and metabolic wellness", "Heart-friendly fats"],
    ingredients: "100% Cleaned Bold Black Mustard Seeds",
    pairsWith: "South Indian Tadka, Odia Besara, Sambars, Pickles"
  },
  {
    id: "cumin-seeds",
    name: "Whole Cumin Seeds (Jeera)",
    category: "whole",
    categoryName: "Whole Spices",
    image: "assets/images/products/cumin-seeds.png",
    badge: "Machine Cleaned",
    rating: 5,
    reviews: 115,
    heat: 1,
    heatLabel: "Warm Nutty",
    aroma: "Earthy Cuminaldehyde",
    variants: [
      { weight: "100g", price: 58 },
      { weight: "250g", price: 138 },
      { weight: "500g", price: 265 }
    ],
    shortDesc: "Pristine whole cumin seeds with intense earthy flavor and high volatile oil.",
    description: "Machine sorted, optical-cleaned cumin seeds free from weed seeds, stones, and dust. Delivers immediate aroma the instant it hits warm fat.",
    benefits: ["Natural digestive stimulant", "Rich in iron", "Immune support"],
    ingredients: "100% Pure Cleaned Cumin Seeds",
    pairsWith: "Jeera Rice, Tadka Dal, Khichdi, Sabzi Base"
  },

  // PREMIUM FOOD ITEMS
  {
    id: "soya-chunks",
    name: "High Protein Soya Chunks (Big / Mini)",
    category: "premium",
    categoryName: "Premium Food Items",
    image: "assets/images/products/soya-chunks.png",
    badge: "52% Protein",
    rating: 5,
    reviews: 145,
    heat: 0,
    heatLabel: "Neutral",
    aroma: "Mild Soy",
    variants: [
      { weight: "200g", price: 48 },
      { weight: "500g", price: 110 }
    ],
    shortDesc: "Juicy, spongy 100% vegetarian protein powerhouse that absorbs gravies wonderfully.",
    description: "Packed with over 52% plant-based protein. Expands into tender, juicy bites that soak up curries and marinades just like meat.",
    benefits: ["Super-rich in lean protein (52g per 100g)", "Zero cholesterol, low fat", "Ideal for gym enthusiasts & vegetarian nutrition"],
    ingredients: "Defatted Soya Flour",
    pairsWith: "Soya Aloo Curry, Soya Biryani, Soya Chilly, Kebabs"
  },
  {
    id: "hing",
    name: "Pure Compounded Hing (Asafoetida)",
    category: "premium",
    categoryName: "Premium Food Items",
    image: "assets/images/products/hing.png",
    badge: "Ultra Pungent",
    rating: 5,
    reviews: 198,
    heat: 2,
    heatLabel: "Pungent Umami",
    aroma: "Intense Asafoetida",
    variants: [
      { weight: "10g", price: 32 },
      { weight: "25g", price: 72 }
    ],
    shortDesc: "Small pinch delivers enormous umami depth, aroma, and gut-soothing digestion.",
    description: "A pinch of Subhadarshini Hing creates that unmistakable gourmet Indian kitchen aroma while preventing digestive discomfort from lentils and tubers.",
    benefits: ["Remarkable anti-bloating and gas relief", "Authentic pungent fragrance", "Long shelf-life hermetic bottle"],
    ingredients: "Edible Gum, Wheat Flour, Asafoetida Resin",
    pairsWith: "Sambar, Rasam, Dal Tadka, Kadhi, Puri Aloo"
  },
  {
    id: "dalia",
    name: "Farm-Fresh Wheat Dalia",
    category: "premium",
    categoryName: "Premium Food Items",
    image: "assets/images/products/dalia.png",
    badge: "Diet & Fitness",
    rating: 5,
    reviews: 76,
    heat: 0,
    heatLabel: "Wholesome",
    aroma: "Toasted Wheat",
    variants: [
      { weight: "500g", price: 45 }
    ],
    shortDesc: "Golden cracked wheat packed with natural fiber and slow-burning energy.",
    description: "Made from premium selected durum wheat, hygienically milled into uniform grains. Perfect for wholesome breakfast porridges or savory vegetable khichdi.",
    benefits: ["High dietary fiber for gut health", "Low glycemic index, diabetic friendly", "Sustained all-day energy"],
    ingredients: "100% Pure Broken Wheat",
    pairsWith: "Sweet Dalia Kheer, Vegetable Dalia Upma, Savory Khichdi"
  },
  {
    id: "black-salt",
    name: "Mineral Rich Black Salt (Kala Namak)",
    category: "premium",
    categoryName: "Premium Food Items",
    image: "assets/images/products/black-salt.png",
    badge: "Natural Minerals",
    rating: 5,
    reviews: 98,
    heat: 1,
    heatLabel: "Savoury Sulphurous",
    aroma: "Mineral Rock Salt",
    variants: [
      { weight: "100g", price: 25 },
      { weight: "250g", price: 55 }
    ],
    shortDesc: "Volcanic rock salt offering signature savory sulphurous aroma and therapeutic benefits.",
    description: "Finely ground authentic Kala Namak loaded with naturally occurring trace minerals. Indispensable for chaats, jaljeera, and cooling summer drinks.",
    benefits: ["Reduces heartburn and acid reflux", "Natural electrolytes", "Enhances savory flavor without excess sodium"],
    ingredients: "100% Pure Rock Black Salt",
    pairsWith: "Jaljeera, Fruit Chaats, Chutneys, Buttermilk, Raita"
  },
  {
    id: "kasuri-methi",
    name: "Fragrant Kasuri Methi",
    category: "premium",
    categoryName: "Premium Food Items",
    image: "assets/images/products/kasuri-methi.png",
    badge: "Gourmet Finish",
    rating: 5,
    reviews: 135,
    heat: 0,
    heatLabel: "Herbal Sweet-Bitter",
    aroma: "Classic Fenugreek Bouquet",
    variants: [
      { weight: "40g", price: 42 }
    ],
    shortDesc: "Sun-cured dried fenugreek leaves that impart irresistible royal restaurant fragrance.",
    description: "Crisp, dust-free dried fenugreek leaves. Gently rub between your palms over hot curries in the final minute of cooking for restaurant-style magic.",
    benefits: ["Regulates glucose and lipid levels", "Rich in iron and chlorophyll", "Intense natural bouquet"],
    ingredients: "100% Pure Dried Fenugreek Leaves",
    pairsWith: "Butter Chicken, Dal Makhani, Methi Paneer, Parathas"
  },
  {
    id: "punjabi-dal-tadka",
    name: "Punjabi Dal Tadka Dal",
    category: "premium",
    categoryName: "Premium Food Items",
    image: "assets/images/products/punjabi-dal-tadka.png",
    badge: "Special Blend",
    rating: 5,
    reviews: 54,
    heat: 0,
    heatLabel: "Creamy Lentil",
    aroma: "Natural Dal",
    variants: [
      { weight: "500g", price: 85 }
    ],
    shortDesc: "Hand-blended heritage lentils curated for that creamy, dhaba-style dal tadka.",
    description: "A calibrated blend of protein-rich lentils processed under hygienic parameters for uniform cooking and supreme velvety consistency.",
    benefits: ["Rich in clean plant protein", "Easy to digest", "Chemical polish free"],
    ingredients: "Curated Blend of Yellow Toor Dal, Moong Dal, and Chana Lentils",
    pairsWith: "Jeera Rice, Butter Roti, Garlic Tadka"
  },

  // UPCOMING
  {
    id: "sattu-powder",
    name: "Roasted Bengal Gram Sattu Powder",
    category: "upcoming",
    categoryName: "Up Coming Product",
    image: "assets/images/products/sattu-powder.jpg",
    badge: "Coming Soon",
    rating: 5,
    reviews: 30,
    heat: 0,
    heatLabel: "Roasted Nutty",
    aroma: "Roasted Chana",
    variants: [
      { weight: "500g", price: 75 },
      { weight: "1kg", price: 140 }
    ],
    shortDesc: "Traditional roasted gram flour — the ancient Indian superfood for instant vitality.",
    description: "Slow-roasted Bengal gram stone-ground to perfection. High protein, high fiber, and cooling fuel for hot summer days or workout fuel.",
    benefits: ["Instant energy and hydration drink", "Over 20% plant protein", "Natural body coolant"],
    ingredients: "100% Pure Roasted Bengal Gram",
    pairsWith: "Sattu Sharbat (Sweet or Salty), Litti Chokha, Sattu Paratha"
  }
];

// Export or expose globally
if (typeof window !== "undefined") {
  window.PRODUCTS_DATA = PRODUCTS_DATA;
}
