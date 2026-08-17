export interface CategoryDetail {
    title: string;
    points: string[];
    specifications: Record<string, string>;
}

export const categoryDetails: Record<string, CategoryDetail> = {
    'seafood': {
        title: 'Premium Fresh Seafood Selection',
        points: [
            'Freshly caught from pristine coastal waters and delivered within 24 hours to ensure maximum freshness and optimal flavor',
            'Sourced exclusively from sustainable fishing practices that protect marine ecosystems and support local fishing communities',
            'Each piece is individually inspected by our quality experts for perfect texture, vibrant color, and superior quality standards',
            'Expertly vacuum-sealed using advanced packaging technology to preserve natural taste, texture, and nutritional value during transit',
            'Exceptionally rich in omega-3 fatty acids, essential proteins, vitamins, and minerals that support heart health and overall wellness',
            'Versatile cooking options including grilling, baking, steaming, or pan-searing with perfect results every time for any recipe',
            'Maintained under strict temperature-controlled conditions throughout the entire supply chain from ocean to your doorstep',
            'Available in a wide range of cuts, sizes, and preparations including fillets, whole fish, steaks, and specialty seafood items'
        ],
        specifications: {
            'Storage Instructions': 'Keep frozen at -18°C or below in original packaging until ready to use for optimal preservation',
            'Shelf Life Details': '3-6 months when properly frozen, 1-2 days when refrigerated at 4°C or below after thawing',
            'Source & Origin': 'Responsibly sourced from certified sustainable coastal waters and eco-friendly aquaculture farms',
            'Preparation Guidelines': 'Thaw slowly in refrigerator for 12-24 hours before cooking, never thaw at room temperature',
            'Quality Certifications': 'Marine Stewardship Council (MSC) certified, FDA approved, and regularly inspected for safety',
            'Allergen Information': 'Contains shellfish and fish proteins, processed in facilities that handle other seafood products',
            'Nutritional Profile': 'High-quality protein source, rich in omega-3 fatty acids, vitamin D, selenium, and essential minerals'
        }
    },
    'snacks': {
        title: 'Gourmet Snack Collection',
        points: [
            'Expertly crafted using only the highest quality, all-natural ingredients sourced from trusted local and international suppliers',
            'Perfectly designed for convenient on-the-go snacking with portable packaging that fits easily in bags, lunchboxes, or desks',
            'Completely free from artificial preservatives, colors, flavors, and harmful additives for pure, wholesome snacking experience',
            'Meticulously developed through extensive recipe testing to deliver optimal flavor profiles, perfect texture, and satisfying crunch',
            'Extensive variety available including multiple flavor options, different size packages, and specialized dietary formulations',
            'Ideal for social gatherings, office parties, school lunches, movie nights, or anytime you need a quick and delicious energy boost',
            'Individually wrapped and sealed using advanced packaging technology to ensure long-lasting freshness and prevent staleness',
            'Carefully formulated to accommodate various dietary preferences including gluten-free, vegan, low-sodium, and keto-friendly options'
        ],
        specifications: {
            'Storage Requirements': 'Store in cool, dry place away from direct sunlight and moisture to maintain optimal quality and crispness',
            'Product Shelf Life': '6-12 months from production date when stored properly in sealed packaging at recommended conditions',
            'Ingredient Quality': '100% natural ingredients, no artificial additives, non-GMO verified, and sourced from quality suppliers',
            'Allergen Statements': 'Always check individual product labels for specific allergen information and manufacturing facility details',
            'Dietary Accommodations': 'Multiple options available including vegetarian, vegan, gluten-free, and allergen-conscious formulations',
            'Packaging Features': 'Resealable bags and portion-controlled packaging designed to maintain freshness between multiple servings',
            'Quality Assurance': 'Rigorous quality testing, batch verification, and continuous monitoring to ensure consistent excellence'
        }
    },
    'bakery': {
        title: 'Artisan Bakery Creations',
        points: [
            'Freshly baked each morning using time-honored traditional recipes passed down through generations of master bakers',
            'Created with premium quality flour, farm-fresh ingredients, and artisanal techniques that ensure superior texture and flavor',
            'Completely free from artificial preservatives, additives, and chemical enhancers for pure, authentic bakery goodness',
            'Expertly baked to golden perfection with ideal crust development, perfect crumb structure, and mouthwatering aroma',
            'Comprehensive selection available including various sizes, types, and specialty items to suit every occasion and preference',
            'Perfect for breakfast gatherings, afternoon snacks, dessert presentations, or as the centerpiece of any special celebration',
            'Thoughtfully packaged using specialized materials that protect delicate textures while maintaining just-baked freshness',
            'Designed to complement different dining occasions from casual family meals to formal events and everything in between'
        ],
        specifications: {
            'Storage Guidelines': 'Store in cool, dry place or refrigerate for longer freshness; some items may require specific storage conditions',
            'Freshness Timeline': '2-7 days optimal freshness depending on product type; best consumed within first 2-3 days for peak quality',
            'Core Ingredients': 'High-quality flour, fresh dairy, farm eggs, natural sweeteners, and premium flavorings without artificial enhancers',
            'Common Allergens': 'Typically contains wheat, gluten, dairy, eggs; specific allergen information provided on each product label',
            'Dietary Considerations': 'Freshly baked without preservatives; some options available for specific dietary needs and restrictions',
            'Serving Preparation': 'Ready to enjoy immediately or can be gently warmed to restore fresh-from-oven warmth and texture',
            'Quality Standards': 'Daily quality inspections, temperature monitoring, and strict adherence to food safety protocols'
        }
    },
    'fruits': {
        title: 'Premium Fresh Fruit Selection',
        points: [
            'Expertly hand-picked at the absolute peak of ripeness to ensure optimal natural sweetness, perfect texture, and maximum flavor',
            'Directly sourced from our network of trusted local farms and premium international growers who share our quality standards',
            'Naturally grown using sustainable farming practices without harmful pesticides, synthetic fertilizers, or chemical treatments',
            'Exceptionally rich in essential vitamins, powerful antioxidants, dietary fiber, and natural compounds that support overall health',
            'Available in multiple quality grades, various size options, and seasonal varieties to provide year-round fresh fruit enjoyment',
            'Perfect for fresh eating, culinary creations, healthy snacks, juicing, baking, or as beautiful natural decorations',
            'Meticulously sorted, washed, and quality-checked through multiple stages to ensure only the finest fruits reach our customers',
            'Carefully delivered using temperature-controlled logistics to preserve nutritional value, freshness, and perfect condition'
        ],
        specifications: {
            'Optimal Storage': 'Store in cool, well-ventilated area away from direct sunlight; some fruits may require specific temperature conditions',
            'Freshness Duration': '3-7 days optimal freshness depending on fruit variety and ripeness level at time of purchase',
            'Source Verification': 'Combination of local farms and imported premium sources with full traceability and quality verification',
            'Organic Availability': 'Certified organic options available for selected fruits with proper certification and growing documentation',
            'Ripeness Guidance': 'Selected at perfect ripeness for immediate enjoyment or carefully chosen to ripen beautifully at home',
            'Nutritional Benefits': 'Naturally rich in vitamins, minerals, fiber, and antioxidants that support immune function and overall wellness',
            'Quality Classification': 'Grade A selection representing the highest quality standards with consistent size, color, and condition'
        }
    },
    'beverages': {
        title: 'Premium Beverage Collection',
        points: [
            'Expertly crafted using only premium quality ingredients sourced from the world\'s finest tea gardens, coffee regions, and fruit orchards',
            'Extensive variety available including multiple flavor profiles, different bottle sizes, and specialized formulations for every preference',
            'Completely free from artificial sweeteners, synthetic preservatives, artificial colors, and any chemical flavor enhancements',
            'Perfectly formulated for optimal hydration, natural refreshment, and enjoyable drinking experience throughout the day',
            'Carefully developed to accommodate various dietary needs including sugar-free, caffeine-free, and specialty requirement options',
            'Excellent choice for social gatherings, office refreshments, family meals, sports activities, or daily hydration routines',
            'Precisely bottled using state-of-the-art equipment that ensures maximum freshness, flavor preservation, and product integrity',
            'Available in both cold-pressed juice varieties for maximum nutrition and traditional brewing methods for classic flavor profiles'
        ],
        specifications: {
            'Storage Conditions': 'Store in cool, dry place away from direct sunlight and extreme temperatures; refrigerate after opening',
            'Shelf Life Assurance': '6-18 months unopened when stored properly; specific expiration dates clearly marked on each container',
            'Ingredient Transparency': 'Natural fruits, herbs, botanicals, purified water, and authentic flavorings without artificial components',
            'Sweetening Options': 'Natural fruit sugars, honey, stevia, or completely unsweetened options to suit different taste preferences',
            'Allergen Management': 'Comprehensive allergen information provided on each product label with clear manufacturing facility details',
            'Dietary Formulations': 'Multiple options including vegan, gluten-free, dairy-free, and other specialty dietary requirements',
            'Eco-Packaging': 'Recyclable bottles, sustainable containers, and environmentally conscious packaging materials throughout'
        }
    },
    'vegetables': {
        title: 'Farm-Fresh Vegetable Selection',
        points: [
            'Freshly harvested from our network of certified local organic farms using sustainable agricultural practices and ethical farming',
            'Exceptionally rich in essential vitamins, vital minerals, dietary fiber, and beneficial plant compounds that support overall health',
            'Completely grown without chemical pesticides, synthetic fertilizers, artificial growth enhancers, or genetically modified organisms',
            'Wide variety available including seasonal specialties, heirloom varieties, and everyday favorites throughout the entire year',
            'Perfect for cooking applications, fresh salads, healthy juicing, culinary preparations, or as nutritious side dishes',
            'Thoroughly washed, carefully sorted, and meticulously quality-checked to ensure only the finest vegetables reach your kitchen',
            'Expertly delivered using advanced cold chain logistics to preserve nutritional content, crisp texture, and garden-fresh quality',
            'Excellent for creating healthy meals, following specific diets, exploring new recipes, or maintaining balanced nutrition'
        ],
        specifications: {
            'Storage Recommendations': 'Refrigerate in vegetable drawer or crisper section with proper humidity control for optimal preservation',
            'Freshness Timeline': '3-10 days optimal quality depending on vegetable type, with proper storage conditions and handling',
            'Farming Origins': 'Primarily sourced from local organic farms with additional premium selections from trusted regional growers',
            'Organic Certification': 'Certified organic options available with proper documentation and verification of growing practices',
            'Preparation Guidelines': 'Always wash thoroughly before consumption or preparation to ensure cleanliness and food safety',
            'Nutritional Value': 'Naturally high in dietary fiber, essential vitamins, minerals, and beneficial plant-based compounds',
            'Quality Standards': 'Freshly harvested, premium grade selection with consistent quality, appearance, and culinary performance'
        }
    },
    'meat': {
        title: 'Premium Quality Meat Selection',
        points: [
            'Responsibly sourced from our network of trusted, ethical farms that prioritize animal welfare and sustainable raising practices',
            'Expertly aged to perfection using traditional methods that develop optimal tenderness, deep flavor, and superior texture',
            'Completely free from added growth hormones, routine antibiotics, and artificial enhancements for pure, natural meat quality',
            'Comprehensive selection available including various cuts, different quality grades, and specialized preparations for every need',
            'Perfect for multiple cooking methods including grilling, roasting, slow cooking, pan-searing, or specialty culinary techniques',
            'Professionally vacuum-sealed using food-grade materials that ensure maximum freshness, prevent freezer burn, and preserve quality',
            'Subject to strict quality control protocols, regular inspections, and continuous monitoring throughout the entire supply chain',
            'Carefully delivered with precise temperature control from our facilities to your location to maintain perfect condition and safety'
        ],
        specifications: {
            'Storage Requirements': 'Keep frozen at -18°C or below for long-term storage; refrigerate at 4°C or below for short-term use',
            'Quality Preservation': '6-12 months optimal quality when properly frozen; 2-3 days when refrigerated under correct conditions',
            'Source Verification': 'Ethical farming practices, grass-fed options available, with full traceability from farm to customer',
            'Safety Certifications': 'USDA approved, quality graded, regularly inspected, and compliant with all food safety regulations',
            'Preparation Safety': 'Always thaw slowly in refrigerator before cooking; never thaw at room temperature to prevent bacterial growth',
            'Allergen Status': 'Pure meat products typically contain no common allergens; check specific product labels for detailed information',
            'Cut Quality': 'Premium cuts, expertly trimmed, consistent portioning, and professional preparation for excellent cooking results'
        }
    },
    'dairy': {
        title: 'Fresh Dairy Products Collection',
        points: [
            'Directly sourced from our select network of trusted local dairy farms that maintain the highest standards of animal care and hygiene',
            'Properly pasteurized using advanced techniques that ensure complete safety while preserving natural flavor and nutritional benefits',
            'Naturally rich in calcium, essential proteins, vitamins, and other important nutrients that support bone health and overall wellness',
            'Comprehensive range available including various fat percentages, different product types, and specialized dairy formulations',
            'Perfect for cooking applications, baking projects, direct consumption, or as essential ingredients in your favorite recipes',
            'Subject to strict quality control measures, regular testing, and continuous monitoring to ensure consistent safety and quality',
            'Expertly delivered using temperature-controlled vehicles and handling procedures that maintain perfect freshness and safety',
            'Multiple options available including certified organic varieties, traditional formulations, and specialty dairy products'
        ],
        specifications: {
            'Storage Instructions': 'Refrigerate at 4°C or below immediately after purchase; maintain consistent cold chain for optimal quality',
            'Freshness Duration': '7-21 days optimal quality depending on specific product type and proper refrigeration conditions',
            'Farm Sources': 'Local dairy farms with verified practices, regular inspections, and commitment to quality and animal welfare',
            'Safety Processing': 'High-temperature short-time (HTST) pasteurization ensuring safety while preserving nutritional quality',
            'Common Allergens': 'Contains milk and lactose; manufactured in facilities that may process other dairy and allergen-containing products',
            'Nutritional Profile': 'Excellent source of calcium, high-quality protein, essential vitamins, and important minerals for health',
            'Quality Assurance': 'Fresh daily deliveries, rigorous quality testing, temperature monitoring, and strict adherence to safety standards'
        }
    }
};