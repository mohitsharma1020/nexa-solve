/* ═══════════════════════════════════════════════════════════════
   NexaSolve — Product Data & Mock Content
   ═══════════════════════════════════════════════════════════════ */

export const products = [
  {
    id: 1,
    title: 'ProSound Elite Wireless Headphones',
    slug: 'prosound-elite-wireless-headphones',
    price: 6499,
    originalPrice: 10499,
    rating: 4.8,
    reviews: 2347,
    category: 'smart-gadgets',
    categoryLabel: 'Smart Gadgets',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
      'https://images.unsplash.com/photo-1434056886845-dbe89f0b9571?w=800&q=80',
    ],
    badge: 'Bestseller',
    shortDescription: 'Premium ANC headphones with 40-hour battery life.',
    description:
      'Experience studio-quality sound with our ProSound Elite headphones. Featuring advanced Active Noise Cancellation, 40mm custom drivers, and an ultra-comfortable over-ear design that lasts all day. Perfect for work, travel, and everything in between.',
    benefits: [
      'Crystal-clear ANC blocks 98% of ambient noise',
      '40-hour battery with quick-charge support',
      'Feather-light 250g ergonomic build',
      'Multi-device Bluetooth 5.3 connectivity',
    ],
    howItHelps:
      'Whether you are grinding through a workday, flying cross-country, or just need a moment of peace, these headphones create your personal sound sanctuary. The long battery life means no more mid-day charging anxiety.',
    specs: [
      { label: 'Driver Size', value: '40mm Titanium' },
      { label: 'Battery Life', value: '40 Hours' },
      { label: 'Weight', value: '250g' },
      { label: 'Connectivity', value: 'Bluetooth 5.3' },
    ],
    whatsIncluded: [
      'ProSound Elite Headphones',
      'Premium Carry Case',
      'USB-C Charging Cable',
      '3.5mm Audio Cable',
      'User Guide',
    ],
    useCases: [
      'Deep focus work sessions without distractions',
      'Long-haul flights with immersive audio',
      'Gym workouts with secure, sweat-resistant fit',
    ],
  },
  {
    id: 2,
    title: 'ChronoFit Smart Watch Pro',
    slug: 'chronofit-smart-watch-pro',
    price: 11999,
    originalPrice: 17999,
    rating: 4.7,
    reviews: 1856,
    category: 'smart-gadgets',
    categoryLabel: 'Smart Gadgets',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800&q=80',
      'https://images.unsplash.com/photo-1434056886845-dbe89f0b9571?w=800&q=80',
    ],
    badge: 'Trending',
    shortDescription: 'Advanced fitness tracking meets elegant design.',
    description:
      'The ChronoFit Smart Watch Pro combines sleek aesthetics with cutting-edge health monitoring. Track heart rate, SpO2, sleep quality, and 30+ workout modes with military-grade durability. Your health companion that looks as good as it performs.',
    benefits: [
      '24/7 heart rate & SpO2 monitoring',
      '7-day battery with always-on display',
      'IP68 waterproof — swim-proof to 50m',
      'GPS + GLONASS precision tracking',
    ],
    howItHelps:
      'Take control of your health journey with real-time insights on your wrist. From morning runs to sleep analysis, the ChronoFit Pro helps you build better habits and hit your fitness goals with data-driven precision.',
    specs: [
      { label: 'Display', value: '1.43" AMOLED' },
      { label: 'Battery Life', value: '7 Days' },
      { label: 'Water Resistance', value: 'IP68 / 5ATM' },
      { label: 'Sensors', value: 'HR, SpO2, GPS' },
    ],
    whatsIncluded: [
      'ChronoFit Smart Watch Pro',
      'Magnetic Charging Dock',
      'Extra Silicone Band',
      'Quick Start Guide',
    ],
    useCases: [
      'Track daily fitness goals and workout intensity',
      'Monitor sleep patterns for better recovery',
      'Navigate outdoor trails with built-in GPS',
    ],
  },
  {
    id: 3,
    title: 'SnapLens 4K Action Camera',
    slug: 'snaplens-4k-action-camera',
    price: 15999,
    originalPrice: null,
    rating: 4.9,
    reviews: 982,
    category: 'smart-gadgets',
    categoryLabel: 'Smart Gadgets',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80',
    ],
    badge: 'New',
    shortDescription: 'Ultra-stable 4K footage for adventure seekers.',
    description:
      'Capture every moment in stunning 4K detail with the SnapLens Action Camera. Featuring HyperSmooth stabilization, a waterproof body rated to 30 feet, and a wide 170° lens. Adventure-ready right out of the box.',
    benefits: [
      'True 4K 60fps with HDR support',
      'HyperSmooth 4.0 stabilization',
      'Waterproof to 30ft without housing',
      '170° ultra-wide angle lens',
    ],
    howItHelps:
      'Stop worrying about shaky footage or water damage. The SnapLens handles extreme conditions so you can focus on living the moment while still capturing professional-quality content for social media or personal memories.',
    specs: [
      { label: 'Resolution', value: '4K @ 60fps' },
      { label: 'Stabilization', value: 'HyperSmooth 4.0' },
      { label: 'Waterproof', value: '30ft / 10m' },
      { label: 'FOV', value: '170° Ultra-Wide' },
    ],
    whatsIncluded: [
      'SnapLens 4K Camera',
      'Waterproof Housing',
      'Mounting Kit (3 mounts)',
      'USB-C Cable',
      '32GB MicroSD Card',
    ],
    useCases: [
      'Capture epic surfing and diving footage',
      'Vlog on the go with flip-screen preview',
      'Time-lapse stunning sunsets and cityscapes',
    ],
  },
  {
    id: 4,
    title: 'AeroStride Performance Sneakers',
    slug: 'aerostride-performance-sneakers',
    price: 7499,
    originalPrice: 10999,
    rating: 4.6,
    reviews: 3120,
    category: 'lifestyle',
    categoryLabel: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
      'https://images.unsplash.com/photo-1434056886845-dbe89f0b9571?w=800&q=80',
    ],
    badge: 'Hot Deal',
    shortDescription: 'Cloud-like comfort meets street-ready style.',
    description:
      'Walk on air with AeroStride sneakers. Engineered with responsive CloudFoam midsoles, breathable knit uppers, and a lightweight design that keeps you moving all day. From gym sessions to weekend strolls, these are the only shoes you need.',
    benefits: [
      'CloudFoam midsole absorbs every impact',
      'Breathable 3D knit upper keeps feet cool',
      'Ultra-lightweight at just 280g per shoe',
      'Durable rubber outsole with flex grooves',
    ],
    howItHelps:
      'Say goodbye to foot fatigue. Whether you are on your feet all day at work or crushing a weekend hike, AeroStrides provide the perfect balance of cushioning, support, and style that adapts to your lifestyle.',
    specs: [
      { label: 'Weight', value: '280g per shoe' },
      { label: 'Material', value: '3D Knit Upper' },
      { label: 'Sole', value: 'CloudFoam Midsole' },
      { label: 'Sizes', value: 'US 6-13' },
    ],
    whatsIncluded: [
      'AeroStride Sneakers (1 pair)',
      'Extra Insoles',
      'Shoe Bag',
      'Care Guide',
    ],
    useCases: [
      'All-day office comfort without sacrificing style',
      'Light training and gym workouts',
      'Weekend travel with packable lightweight design',
    ],
  },
  {
    id: 5,
    title: 'GlowRitual Advanced Skincare Set',
    slug: 'glowritual-advanced-skincare-set',
    price: 5299,
    originalPrice: 8299,
    rating: 4.8,
    reviews: 1543,
    category: 'lifestyle',
    categoryLabel: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80',
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80',
      'https://images.unsplash.com/photo-1434056886845-dbe89f0b9571?w=800&q=80',
    ],
    badge: 'Trending',
    shortDescription: 'Clinical-grade formulas for radiant, healthy skin.',
    description:
      'Transform your skincare routine with the GlowRitual set. Featuring a Vitamin C serum, hyaluronic acid moisturizer, and gentle exfoliating cleanser — all dermatologist-tested and free from parabens, sulfates, and artificial fragrances.',
    benefits: [
      'Visible results in just 14 days',
      '100% vegan and cruelty-free formulas',
      'Suitable for all skin types including sensitive',
      'Dermatologist-tested and clinically proven',
    ],
    howItHelps:
      'Simplify your routine without compromising results. This three-step system addresses dullness, uneven texture, and hydration in minutes a day, giving you a radiant glow that builds confidence from the inside out.',
    specs: [
      { label: 'Serum', value: '30ml Vitamin C 20%' },
      { label: 'Moisturizer', value: '50ml Hyaluronic Acid' },
      { label: 'Cleanser', value: '120ml Gentle Exfoliant' },
      { label: 'Ingredients', value: 'Paraben-Free, Vegan' },
    ],
    whatsIncluded: [
      'Vitamin C Brightening Serum',
      'Hyaluronic Acid Moisturizer',
      'Gentle Exfoliating Cleanser',
      'Skincare Routine Guide',
    ],
    useCases: [
      'Morning glow routine before makeup',
      'Evening wind-down skincare ritual',
      'Travel-friendly sizes for on-the-go care',
    ],
  },

  {
    id: 7,
    title: 'AuraScent Luxury Eau de Parfum',
    slug: 'aurascent-luxury-eau-de-parfum',
    price: 4999,
    originalPrice: 7499,
    rating: 4.7,
    reviews: 1234,
    category: 'lifestyle',
    categoryLabel: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80',
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80',
      'https://images.unsplash.com/photo-1434056886845-dbe89f0b9571?w=800&q=80',
    ],
    badge: 'Bestseller',
    shortDescription: 'A signature scent that lasts all day.',
    description:
      'Make a lasting impression with AuraScent. This sophisticated blend of bergamot, jasmine, and sandalwood creates a captivating fragrance that evolves throughout the day. Long-lasting formula ensures you stay fresh from morning to night.',
    benefits: [
      '12+ hour wear time per application',
      'Complex 3-layer scent profile',
      'Premium French-sourced ingredients',
      'Elegant refillable glass atomizer',
    ],
    howItHelps:
      'Your scent is your invisible accessory. AuraScent gives you the confidence of knowing you smell amazing all day long, with a sophisticated yet approachable fragrance that garners compliments everywhere you go.',
    specs: [
      { label: 'Volume', value: '100ml / 3.4 fl oz' },
      { label: 'Concentration', value: 'Eau de Parfum' },
      { label: 'Top Notes', value: 'Bergamot, Lemon' },
      { label: 'Base Notes', value: 'Sandalwood, Musk' },
    ],
    whatsIncluded: [
      'AuraScent Eau de Parfum 100ml',
      'Travel Atomizer 10ml',
      'Gift Box',
      'Scent Profile Card',
    ],
    useCases: [
      'Daily signature scent for the office',
      'Date nights and special occasions',
      'Travel-size atomizer for on-the-go freshness',
    ],
  },
  {
    id: 8,
    title: 'PulseTrack Fitness Band Ultra',
    slug: 'pulsetrack-fitness-band-ultra',
    price: 3299,
    originalPrice: 5999,
    rating: 4.6,
    reviews: 4521,
    category: 'smart-gadgets',
    categoryLabel: 'Smart Gadgets',
    image: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1434056886845-dbe89f0b9571?w=800&q=80',
    ],
    badge: 'Hot Deal',
    shortDescription: 'Affordable fitness tracking that delivers.',
    description:
      'Get serious about fitness without breaking the bank. The PulseTrack Ultra packs heart rate monitoring, step tracking, sleep analysis, and 14-day battery into an ultra-slim, water-resistant band that you will forget you are wearing.',
    benefits: [
      '14-day battery on a single charge',
      'Continuous heart rate monitoring 24/7',
      'Smart notifications for calls and messages',
      'IP68 water-resistant — shower-safe',
    ],
    howItHelps:
      'The PulseTrack Ultra proves that premium fitness tracking does not need a premium price tag. Stay motivated with daily stats, build healthy habits with reminders, and track your progress over time with the free companion app.',
    specs: [
      { label: 'Display', value: '1.1" AMOLED Touch' },
      { label: 'Battery Life', value: '14 Days' },
      { label: 'Water Resistance', value: 'IP68' },
      { label: 'Sensors', value: 'HR, Accelerometer' },
    ],
    whatsIncluded: [
      'PulseTrack Fitness Band Ultra',
      'Charging Clip',
      'Extra Band (Black)',
      'Quick Start Guide',
    ],
    useCases: [
      'Daily step counting and calorie tracking',
      'Sleep quality analysis for better rest',
      'Smart notification relay during workouts',
    ],
  },
  {
    id: 9,
    title: 'StudioPods Pro Earbuds',
    slug: 'studiopods-pro-earbuds',
    price: 4999,
    originalPrice: 8499,
    rating: 4.8,
    reviews: 2876,
    category: 'smart-gadgets',
    categoryLabel: 'Smart Gadgets',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1434056886845-dbe89f0b9571?w=800&q=80',
    ],
    badge: 'Trending',
    shortDescription: 'Immersive sound in a compact, wireless design.',
    description:
      'StudioPods Pro delivers audiophile-grade sound in a truly wireless package. With hybrid ANC, transparency mode, and 32-hour total battery life, these earbuds set the new standard for portable audio excellence.',
    benefits: [
      'Hybrid ANC with transparency mode',
      '32-hour total battery (8h + 24h case)',
      'IPX5 sweat and splash resistant',
      'Spatial audio with head tracking',
    ],
    howItHelps:
      'From commutes to conference calls, StudioPods Pro adapt to your environment instantly. Switch between noise cancellation for focus and transparency mode for awareness, all with studio-quality sound that makes music come alive.',
    specs: [
      { label: 'Drivers', value: '11mm Dynamic' },
      { label: 'Battery', value: '8h + 24h case' },
      { label: 'Water Resistance', value: 'IPX5' },
      { label: 'Codec', value: 'AAC, aptX Adaptive' },
    ],
    whatsIncluded: [
      'StudioPods Pro Earbuds',
      'Wireless Charging Case',
      'Ear Tips (S, M, L)',
      'USB-C Cable',
      'Premium Pouch',
    ],
    useCases: [
      'Crystal-clear calls in noisy environments',
      'Immersive music during commutes',
      'Workout companion with secure fit',
    ],
  },
  {
    id: 10,
    title: 'ZenFlow Wellness Collection',
    slug: 'zenflow-wellness-collection',
    price: 3699,
    originalPrice: null,
    rating: 4.5,
    reviews: 876,
    category: 'home',
    categoryLabel: 'Home',
    image: 'https://images.unsplash.com/photo-1434056886845-dbe89f0b9571?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1434056886845-dbe89f0b9571?w=800&q=80',
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80',
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80',
    ],
    badge: null,
    shortDescription: 'Transform your space into a calm retreat.',
    description:
      'Create your personal sanctuary with the ZenFlow Wellness Collection. Includes an aromatherapy diffuser, organic essential oil set, and a guided meditation journal. Everything you need to unwind, recharge, and find your balance.',
    benefits: [
      'Ultrasonic diffuser runs for 8+ hours',
      '6 organic essential oils included',
      'Guided meditation journal with 90-day program',
      'Whisper-quiet operation under 25dB',
    ],
    howItHelps:
      'In a world that never stops, ZenFlow helps you press pause. The calming aromas, guided journaling, and mindful rituals reduce stress, improve sleep, and create moments of peace in your daily routine.',
    specs: [
      { label: 'Diffuser Capacity', value: '300ml' },
      { label: 'Run Time', value: '8+ Hours' },
      { label: 'Noise Level', value: '<25dB' },
      { label: 'Essential Oils', value: '6 x 10ml Organic' },
    ],
    whatsIncluded: [
      'Ultrasonic Aromatherapy Diffuser',
      '6 Organic Essential Oils',
      '90-Day Meditation Journal',
      'USB Power Adapter',
    ],
    useCases: [
      'Evening wind-down routine for better sleep',
      'Home office focus with energizing scents',
      'Weekend self-care and mindfulness practice',
    ],
  },
  {
    id: 11,
    title: 'TechStation Pro Laptop Stand',
    slug: 'techstation-pro-laptop-stand',
    price: 4499,
    originalPrice: 6499,
    rating: 4.7,
    reviews: 1654,
    category: 'productivity',
    categoryLabel: 'Productivity',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1434056886845-dbe89f0b9571?w=800&q=80',
    ],
    badge: 'Trending',
    shortDescription: 'Ergonomic elevation for peak productivity.',
    description:
      'Upgrade your workspace with the TechStation Pro. This premium aluminum laptop stand elevates your screen to eye level, reduces neck strain, and features an integrated cable management system. Compatible with all laptops up to 17 inches.',
    benefits: [
      '6-angle adjustable height positions',
      'Aircraft-grade aluminum construction',
      'Integrated cable management system',
      'Anti-slip silicone pads protect your device',
    ],
    howItHelps:
      'Poor posture causes chronic pain and reduces productivity. The TechStation Pro elevates your screen to the ergonomically correct height, helping you work longer, more comfortably, and with better focus throughout the day.',
    specs: [
      { label: 'Material', value: 'Aircraft Aluminum' },
      { label: 'Compatibility', value: 'Up to 17" Laptops' },
      { label: 'Adjustable', value: '6 Height Positions' },
      { label: 'Max Load', value: '25 lbs / 11 kg' },
    ],
    whatsIncluded: [
      'TechStation Pro Stand',
      'Cable Organizer Clips (4)',
      'Anti-Slip Pads (Extra Set)',
      'Setup Guide',
    ],
    useCases: [
      'Home office ergonomic setup',
      'Standing desk companion for varied heights',
      'Portable workspace for coffee shop workers',
    ],
  },
  {
    id: 12,
    title: 'UrbanPace All-Terrain Runners',
    slug: 'urbanpace-all-terrain-runners',
    price: 8999,
    originalPrice: 12999,
    rating: 4.9,
    reviews: 987,
    category: 'lifestyle',
    categoryLabel: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
      'https://images.unsplash.com/photo-1434056886845-dbe89f0b9571?w=800&q=80',
    ],
    badge: 'New',
    shortDescription: 'Trail-to-street versatility in one shoe.',
    description:
      'Conquer any terrain with UrbanPace. Featuring Vibram outsoles for trail grip, React foam for road cushioning, and a Gore-Tex waterproof membrane. The ultimate shoe for runners who refuse to let weather or terrain slow them down.',
    benefits: [
      'Vibram Megagrip outsole for any surface',
      'React foam delivers superior energy return',
      'Gore-Tex waterproof breathable membrane',
      'Reflective accents for low-light visibility',
    ],
    howItHelps:
      'One pair of shoes for every run, every surface, every season. UrbanPace eliminates the need for multiple running shoes by delivering trail-grade grip, road-level comfort, and all-weather protection in a single versatile package.',
    specs: [
      { label: 'Outsole', value: 'Vibram Megagrip' },
      { label: 'Midsole', value: 'React Foam' },
      { label: 'Upper', value: 'Gore-Tex Waterproof' },
      { label: 'Drop', value: '8mm Heel-Toe' },
    ],
    whatsIncluded: [
      'UrbanPace All-Terrain Runners',
      'Performance Insoles',
      'Lace Lock Set',
      'Trail Running Guide',
    ],
    useCases: [
      'Trail running in wet or muddy conditions',
      'Urban road running with premium cushioning',
      'Hiking and light trekking adventures',
    ],
  },
  {
    id: 13,
    title: 'Antarctic Explorer Polo Shirt',
    slug: 'antarctic-explorer-polo-shirt',
    shopifyProductId: 'gid://shopify/Product/8219005517898',
    shopifyVariantId: 'gid://shopify/ProductVariant/43648484343882',
    price: 1099,
    originalPrice: 1099,
    rating: 4.8,
    reviews: 127,
    category: 'polar-heritage',
    categoryLabel: 'Polar Heritage',
    image: '/polar/navy_polo.jpg',
    images: [
      '/polar/navy_polo.jpg',
      '/polar/black_polo.png',
      '/polar/white_polo.png',
    ],
    badge: 'Polar Inspired',
    shortDescription: 'A premium lifestyle polo inspired by Antarctic exploration.',
    description: 'The Antarctic Explorer Polo isn\'t just a shirt — it\'s a conversation starter. Featuring an authentic embroidered penguin and "COLDEST PLACE ON EARTH" detailing, this premium polo captures the spirit of polar exploration in a comfortable, versatile fit. Whether you\'re a traveler, content creator, or someone who lives for adventure, this polo tells the world you\'ve embraced the explorer mindset.',
    benefits: [
      'Authentic Antarctica-inspired embroidery',
      'Comfortable everyday fit for all-day wear',
      'Versatile styling — adventure to urban',
      'Premium feel with a clean silhouette',
    ],
    howItHelps: 'For the person who doesn\'t just watch adventure documentaries — they live them. This polo is your quiet flex that says "I chase extraordinary experiences."',
    specs: [
      { label: 'Collection', value: 'Polar Heritage' },
      { label: 'Fit', value: 'Modern Everyday' },
      { label: 'Style', value: 'Adventure Lifestyle' },
      { label: 'Vibe', value: 'Explorer Mindset' },
    ],
    whatsIncluded: [
      'Antarctic Explorer Polo Shirt',
      'Polar Heritage Tag',
    ],
    useCases: [
      'Travel and airport days',
      'Casual weekend outings',
      'Layered under a blazer for smart-casual',
    ],
  },
  {
    id: 14,
    title: 'Polar Summit Cap',
    slug: 'polar-summit-cap',
    shopifyProductId: 'gid://shopify/Product/8219531182154',
    shopifyVariantId: 'gid://shopify/ProductVariant/43649024098378',
    price: 499,
    originalPrice: 699,
    rating: 4.7,
    reviews: 89,
    category: 'polar-heritage',
    categoryLabel: 'Polar Heritage',
    image: '/polar/black_cap.png',
    images: [
      '/polar/black_cap.png'
    ],
    badge: 'Expedition Edition',
    shortDescription: 'A clean, everyday cap with authentic polar-inspired embroidery.',
    description: 'The Polar Summit Cap is where polar exploration meets everyday utility. Featuring an embroidered penguin and bold "ANTARCTICA" lettering, this premium black cap works whether you\'re hiking a mountain trail, exploring a new city, or simply running weekend errands with style.',
    benefits: [
      'Authentic "ANTARCTICA" embroidery',
      'Adjustable fit for all-day wear',
      'Travel-friendly and packable',
      'Works for outdoor and casual settings',
    ],
    howItHelps: 'Every explorer needs their go-to cap. The one that\'s been everywhere and still looks great. This is that cap.',
    specs: [
      { label: 'Collection', value: 'Polar Heritage' },
      { label: 'Fit', value: 'Adjustable One Size' },
      { label: 'Design', value: 'Expedition Detail' },
      { label: 'Style', value: 'Everyday Utility' },
    ],
    whatsIncluded: [
      'Polar Summit Cap',
    ],
    useCases: [
      'Hiking and trail exploring',
      'City travel and sightseeing',
      'Bad hair days with premium style',
    ],
  },
  {
    id: 15,
    title: 'Antarctic Horizons Desk Calendar 2026',
    slug: 'antarctic-horizons-desk-calendar-2026',
    shopifyProductId: 'gid://shopify/Product/8219509817418',
    shopifyVariantId: 'gid://shopify/ProductVariant/43648970096714',
    price: 699,
    originalPrice: 999,
    rating: 4.9,
    reviews: 203,
    category: 'polar-heritage',
    categoryLabel: 'Polar Heritage',
    image: '/polar/calendar_cover_v2.jpg',
    images: [
      '/polar/calendar_cover_v2.jpg',
      '/polar/calendar_1.png',
      '/polar/calendar_2.png',
      '/polar/calendar_3.png',
      '/polar/calendar_4.jpg',
      '/polar/calendar_5.jpg',
      '/polar/calendar_6.png',
      '/polar/calendar_7.png',
      '/polar/calendar_8.png',
      '/polar/calendar_9.png',
      '/polar/calendar_10.jpg',
    ],
    badge: 'Limited Collection',
    shortDescription: 'A collectible Antarctica-themed desk calendar featuring breathtaking polar wildlife.',
    description: 'Bring the raw beauty of the coldest place on Earth to your workspace. The 2026 Antarctic Horizons Desk Calendar features stunning, high-quality photography of polar wildlife—including Emperor Penguins, Weddell Seals, and Antarctic birds—set against breathtaking ice landscapes. Printed on premium heavy-stock paper, it\'s a daily reminder of the world\'s last great wilderness.',
    benefits: [
      '12 exclusive polar wildlife photographs',
      'Premium heavy-stock matte paper',
      'Sturdy desk-friendly stand design',
      'Spacious date grids for notes',
    ],
    howItHelps: 'It transforms a mundane desk into a window to the ice. Perfect for keeping you inspired and connected to the spirit of exploration while you work.',
    specs: [
      { label: 'Collection', value: 'Polar Heritage' },
      { label: 'Year', value: '2026' },
      { label: 'Format', value: 'Desk Calendar' },
      { label: 'Theme', value: 'Antarctic Wildlife' },
    ],
    whatsIncluded: [
      'Antarctic Horizons 2026 Desk Calendar',
    ],
    useCases: [
      'Home office inspiration',
      'Gift for adventure lovers',
      'Daily reminder of exploration goals',
    ],
  },
  {
    id: 16,
    title: 'Polar Legacy Blazer',
    slug: 'polar-legacy-blazer',
    price: 2999,
    originalPrice: 3999,
    rating: 4.9,
    reviews: 64,
    category: 'polar-heritage',
    categoryLabel: 'Polar Heritage',
    image: '/polar/navy_blazer.png',
    images: [
      '/polar/navy_blazer.png',
    ],
    badge: 'Signature Drop',
    shortDescription: 'A premium navy blazer featuring a subtle embroidered penguin lapel detail.',
    description: 'The Polar Legacy Blazer is the crown jewel of the Polar Heritage Collection. Inspired by the pride and professionalism of Antarctic expeditions, this sharp navy blazer bridges the gap between adventure legacy and refined style. Complete with an authentic embroidered penguin on the lapel, it makes a statement without saying a word.',
    benefits: [
      'Authentic embroidered penguin lapel detail',
      'Premium construction with a polished silhouette',
      'Statement piece for professional occasions',
      'Refined design nodding to polar heritage',
    ],
    howItHelps: 'Some achievements don\'t need a trophy. They need a blazer that carries the story in its fabric, its cut, and its quiet authority.',
    specs: [
      { label: 'Collection', value: 'Signature Drop' },
      { label: 'Fit', value: 'Tailored Refined' },
      { label: 'Vibe', value: 'Expedition Elegance' },
      { label: 'Style', value: 'Statement Piece' },
    ],
    whatsIncluded: [
      'Polar Legacy Blazer',
      'Premium Garment Bag',
    ],
    useCases: [
      'Important meetings and corporate events',
      'Creative industry gatherings',
      'Upscale dinners and special occasions',
    ],
  },
  {
    id: 17,
    title: 'Polar Expedition Backpack',
    slug: 'polar-expedition-backpack',
    price: 1299,
    originalPrice: 1999,
    rating: 4.8,
    reviews: 142,
    category: 'polar-heritage',
    categoryLabel: 'Polar Heritage',
    image: '/polar/backpack.png',
    images: [
      '/polar/backpack.png',
    ],
    badge: 'New Arrival',
    shortDescription: 'A rugged, versatile backpack designed for everyday explorers.',
    description: 'Carry your essentials with the spirit of the ice. The Polar Expedition Backpack by Harissons combines rugged durability with everyday utility. Featuring the exclusive Antarctica penguin logo, this pack is built to withstand your daily commute, weekend getaways, and spontaneous adventures while keeping your gear secure and organized.',
    benefits: [
      'Durable, weather-resistant material',
      'Multiple compartments for organized storage',
      'Ergonomic straps for all-day comfort',
      'Authentic Antarctica printed logo',
    ],
    howItHelps: 'Whether you\'re navigating the urban jungle or hitting a trail, this backpack ensures you carry everything you need with expedition-level reliability.',
    specs: [
      { label: 'Collection', value: 'Polar Heritage' },
      { label: 'Type', value: 'Everyday Backpack' },
      { label: 'Material', value: 'Water-Resistant Nylon' },
      { label: 'Brand', value: 'Harissons Collab' },
    ],
    whatsIncluded: [
      'Polar Expedition Backpack',
    ],
    useCases: [
      'Daily office or school commute',
      'Weekend travel and hiking',
      'Carrying tech and camera gear securely',
    ],
  }
];

/* ── Categories ─────────────────────────────────────────────── */
export const categories = [
  {
    id: 'smart-gadgets',
    name: 'Smart Gadgets',
    slug: 'smart-gadgets',
    description: 'Cutting-edge tech that simplifies your daily life.',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80',
    productCount: 5,
  },
  {
    id: 'home',
    name: 'Home Essentials',
    slug: 'home',
    description: 'Transform your living space with smart home solutions.',
    image: 'https://images.unsplash.com/photo-1434056886845-dbe89f0b9571?w=800&q=80',
    productCount: 1,
  },
  {
    id: 'travel',
    name: 'Travel Gear',
    slug: 'travel',
    description: 'Adventure-ready accessories for the modern explorer.',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    productCount: 1,
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Elevate your everyday with premium lifestyle picks.',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
    productCount: 4,
  },
  {
    id: 'productivity',
    name: 'Productivity',
    slug: 'productivity',
    description: 'Work smarter with tools designed for peak performance.',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80',
    productCount: 1,
  },
  {
    id: 'digital',
    name: 'Digital',
    slug: 'digital',
    description: 'Software and digital tools for the connected lifestyle.',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80',
    productCount: 0,
  },
  {
    id: 'polar-heritage',
    name: 'Polar Heritage',
    slug: 'polar-heritage',
    description: 'Inspired by real expeditions. Designed for everyday explorers.',
    image: 'https://images.unsplash.com/photo-1518118228380-4b2a8d3c1c91?w=800&q=80',
    productCount: 4,
  },
];

/* ── Customer Reviews ───────────────────────────────────────── */
export const reviews = [
  {
    id: 1,
    name: 'Sarah M.',
    rating: 5,
    date: '2026-05-15',
    productTitle: 'ProSound Elite Wireless Headphones',
    comment:
      'Absolutely blown away by the noise cancellation. I use these daily for work-from-home focus sessions and the 40-hour battery is no joke. Best headphones I have ever owned!',
    verified: true,
  },
  {
    id: 2,
    name: 'James K.',
    rating: 5,
    date: '2026-05-12',
    productTitle: 'ChronoFit Smart Watch Pro',
    comment:
      'The sleep tracking alone is worth the price. I have completely restructured my bedtime routine based on the insights. Build quality rivals watches 3x the price.',
    verified: true,
  },
  {
    id: 3,
    name: 'Priya R.',
    rating: 4,
    date: '2026-05-10',
    productTitle: 'GlowRitual Advanced Skincare Set',
    comment:
      'My skin has never looked better! The Vitamin C serum is incredibly potent and I saw visible brightening within 2 weeks. Only wish the cleanser was a tad larger.',
    verified: true,
  },
  {
    id: 4,
    name: 'Michael T.',
    rating: 5,
    date: '2026-05-08',
    productTitle: 'AeroStride Performance Sneakers',
    comment:
      'I walk 10K steps daily and these are hands down the most comfortable sneakers I have owned. Zero break-in time. They felt amazing from the first step. Ordering a second pair.',
    verified: true,
  },
  {
    id: 5,
    name: 'Emma L.',
    rating: 5,
    date: '2026-05-05',
    productTitle: 'StudioPods Pro Earbuds',
    comment:
      'The spatial audio is a game changer for music lovers. Crystal clear calls too — my team can finally hear me perfectly on Zoom. Worth every penny.',
    verified: true,
  },
  {
    id: 6,
    name: 'David C.',
    rating: 4,
    date: '2026-05-03',
    productTitle: 'TechStation Pro Laptop Stand',
    comment:
      'Solid aluminum build, no wobble at all. My neck pain from hunching over my laptop is completely gone after just a week of use. Simple but effective product.',
    verified: true,
  },
  {
    id: 7,
    name: 'Aisha N.',
    rating: 5,
    date: '2026-04-28',
    productTitle: 'AuraScent Luxury Eau de Parfum',
    comment:
      'I get compliments every single day. The scent evolves beautifully from morning to evening. The travel atomizer is a brilliant addition. Already my signature fragrance.',
    verified: true,
  },
  {
    id: 8,
    name: 'Chris W.',
    rating: 5,
    date: '2026-04-25',
    productTitle: 'UrbanPace All-Terrain Runners',
    comment:
      'Ran a muddy trail race and a city 10K in the same week with these. The grip is incredible off-road and the cushioning is perfect on pavement. The only running shoe I need.',
    verified: false,
  },
];

/* ── Helper Functions ───────────────────────────────────────── */
export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug) || null;
}

export function getProductsByCategory(categorySlug) {
  return products.filter((p) => p.category === categorySlug);
}

export function getFeaturedProducts(count = 4) {
  return products.filter((p) => p.badge).slice(0, count);
}

export function getRelatedProducts(productId, count = 4) {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];
  return products
    .filter((p) => p.category === product.category && p.id !== productId)
    .slice(0, count);
}
