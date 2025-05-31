// Comprehensive trek planning and preparation data

export const trekPreparationGuide = {
  essential: {
    title: "Essential Items Checklist",
    items: [
      { id: 1, item: "Trekking shoes with good grip", category: "footwear", mandatory: true },
      { id: 2, item: "Backpack (30-40L for day treks)", category: "gear", mandatory: true },
      { id: 3, item: "Water bottles (2-3 liters)", category: "hydration", mandatory: true },
      { id: 4, item: "First aid kit", category: "safety", mandatory: true },
      { id: 5, item: "Headlamp/flashlight", category: "lighting", mandatory: true },
      { id: 6, item: "Power bank", category: "electronics", mandatory: true },
      { id: 7, item: "Rain jacket/poncho", category: "clothing", mandatory: true },
      { id: 8, item: "Energy bars/dry fruits", category: "food", mandatory: true },
    ]
  },
  recommended: {
    title: "Recommended Items",
    items: [
      { id: 9, item: "Trekking poles", category: "gear", mandatory: false },
      { id: 10, item: "Camera", category: "electronics", mandatory: false },
      { id: 11, item: "Sunglasses", category: "protection", mandatory: false },
      { id: 12, item: "Sunscreen (SPF 30+)", category: "protection", mandatory: false },
      { id: 13, item: "Insect repellent", category: "protection", mandatory: false },
      { id: 14, item: "Whistle", category: "safety", mandatory: false },
    ]
  },
  seasonal: {
    monsoon: [
      "Waterproof bag covers",
      "Extra pair of socks",
      "Quick-dry clothes",
      "Gaiters for muddy trails"
    ],
    winter: [
      "Warm layers",
      "Gloves",
      "Woolen cap",
      "Thermos for hot drinks"
    ],
    summer: [
      "Extra water",
      "Electrolyte powder",
      "Light-colored clothing",
      "Wide-brimmed hat"
    ]
  }
};

export const fitnessPreparation = {
  beginner: {
    title: "Beginner Fitness Plan (4 weeks)",
    weeks: [
      {
        week: 1,
        focus: "Building base endurance",
        exercises: [
          { exercise: "Walking", duration: "30 minutes", frequency: "Daily" },
          { exercise: "Stair climbing", duration: "10 minutes", frequency: "3x/week" },
          { exercise: "Basic stretching", duration: "15 minutes", frequency: "Daily" }
        ]
      },
      {
        week: 2,
        focus: "Increasing intensity",
        exercises: [
          { exercise: "Brisk walking/light jogging", duration: "35 minutes", frequency: "Daily" },
          { exercise: "Stair climbing", duration: "15 minutes", frequency: "4x/week" },
          { exercise: "Leg strengthening", duration: "20 minutes", frequency: "3x/week" }
        ]
      }
    ]
  },
  intermediate: {
    title: "Intermediate Fitness Plan",
    focus: "Building trek-specific strength and endurance"
  },
  advanced: {
    title: "Advanced Fitness Plan",
    focus: "Peak performance and challenging treks"
  }
};

export const safetyGuidelines = {
  beforeTrek: [
    "Inform family/friends about your trek plan",
    "Check weather forecast 24 hours before",
    "Verify local guide contact numbers",
    "Download offline maps",
    "Check emergency contact numbers"
  ],
  duringTrek: [
    "Stay with the group",
    "Follow marked trails",
    "Take regular breaks",
    "Stay hydrated",
    "Turn back if weather deteriorates"
  ],
  emergency: [
    "Maharashtra Emergency: 108",
    "Tourist Helpline: 1363",
    "Forest Department: 1926",
    "Police: 100",
    "Fire Emergency: 101"
  ]
};

export const weatherGuidance = {
  monsoon: {
    period: "June to September",
    conditions: "Heavy rainfall, slippery trails",
    recommendations: [
      "Avoid ridge walks and cliff areas",
      "Carry waterproof gear",
      "Start early to avoid afternoon showers",
      "Check for landslide warnings"
    ],
    bestFor: ["Waterfalls", "Valley treks"],
    avoid: ["High altitude treks", "Rock climbing"]
  },
  winter: {
    period: "December to February",
    conditions: "Cool and dry, clear visibility",
    recommendations: [
      "Perfect for all types of treks",
      "Carry warm layers for early morning",
      "Best time for photography",
      "Ideal for camping"
    ],
    bestFor: ["All trek types", "Camping", "Photography"],
    avoid: []
  },
  summer: {
    period: "March to May",
    conditions: "Hot and dry, limited water sources",
    recommendations: [
      "Start very early (4-5 AM)",
      "Carry extra water",
      "Avoid midday trekking",
      "Choose shaded routes"
    ],
    bestFor: ["Early morning treks", "Cave exploration"],
    avoid: ["Long exposed trails", "Afternoon treks"]
  }
};

export const routePlanningTips = {
  timeCalculation: {
    formula: "Distance (km) × 1.5 + Elevation gain (m) ÷ 100",
    factors: [
      "Add 30% time for breaks",
      "Add 50% for photography stops",
      "Consider group fitness level",
      "Account for weather conditions"
    ]
  },
  difficultyAssessment: {
    easy: {
      criteria: "< 5km, < 500m elevation, well-marked trails",
      suitableFor: "Beginners, families with children"
    },
    moderate: {
      criteria: "5-10km, 500-1000m elevation, some steep sections",
      suitableFor: "Regular hikers, good fitness level"
    },
    difficult: {
      criteria: "> 10km, > 1000m elevation, technical sections",
      suitableFor: "Experienced trekkers, excellent fitness"
    }
  }
};

export const localCulture = {
  etiquette: [
    "Respect local customs and traditions",
    "Ask permission before photographing people",
    "Don't litter - carry back all waste",
    "Respect religious sites and practices",
    "Support local economy by hiring local guides"
  ],
  language: {
    useful_phrases: [
      { marathi: "नमस्कार", english: "Namaskaar", meaning: "Hello/Goodbye" },
      { marathi: "पाणी", english: "Paani", meaning: "Water" },
      { marathi: "मदत", english: "Madat", meaning: "Help" },
      { marathi: "रस्ता", english: "Rasta", meaning: "Road/Path" },
      { marathi: "किती वेळ?", english: "Kiti vel?", meaning: "How much time?" }
    ]
  }
};

export const budgetPlanning = {
  categories: [
    {
      category: "Transportation",
      items: [
        { item: "Train/Bus fare", typical_cost: "₹200-800", tips: "Book in advance for discounts" },
        { item: "Local transport", typical_cost: "₹100-300", tips: "Share with group to reduce cost" },
        { item: "Fuel (if driving)", typical_cost: "₹500-1500", tips: "Calculate based on distance" }
      ]
    },
    {
      category: "Accommodation",
      items: [
        { item: "Homestay", typical_cost: "₹500-1500/night", tips: "Book through local contacts" },
        { item: "Camping", typical_cost: "₹200-500/night", tips: "Carry own tent to save money" },
        { item: "Lodge/Hotel", typical_cost: "₹1000-3000/night", tips: "Check reviews before booking" }
      ]
    },
    {
      category: "Food & Water",
      items: [
        { item: "Meals", typical_cost: "₹150-400/meal", tips: "Try local cuisine" },
        { item: "Snacks & water", typical_cost: "₹200-500/day", tips: "Carry energy bars" },
        { item: "Emergency food", typical_cost: "₹300-600", tips: "Always carry backup" }
      ]
    }
  ]
};

// Helper functions
export const calculateTrekTime = (distance, elevationGain, groupSize, fitnessLevel) => {
  let baseTime = distance * 1.5 + elevationGain / 100;
  
  // Adjust for group size
  if (groupSize > 5) baseTime *= 1.2;
  
  // Adjust for fitness level
  const fitnessMultiplier = {
    beginner: 1.5,
    intermediate: 1.2,
    advanced: 1.0
  };
  
  baseTime *= fitnessMultiplier[fitnessLevel] || 1.2;
  
  // Add buffer time
  const totalTime = baseTime * 1.3;
  
  return {
    estimatedTime: Math.round(totalTime * 10) / 10,
    baseTime: Math.round(baseTime * 10) / 10,
    bufferTime: Math.round((totalTime - baseTime) * 10) / 10
  };
};

export const getSeasonalRecommendations = (month) => {
  const monthNum = new Date(month).getMonth() + 1;
  
  if (monthNum >= 6 && monthNum <= 9) {
    return weatherGuidance.monsoon;
  } else if (monthNum >= 12 || monthNum <= 2) {
    return weatherGuidance.winter;
  } else {
    return weatherGuidance.summer;
  }
};

export const generatePackingList = (trekType, season, duration, difficulty) => {
  let packingList = [...trekPreparationGuide.essential.items];
  
  // Add seasonal items
  if (season === 'monsoon') {
    packingList.push(...trekPreparationGuide.seasonal.monsoon.map((item, index) => ({
      id: 100 + index,
      item,
      category: 'seasonal',
      mandatory: true
    })));
  }
  
  // Add recommended items for longer treks
  if (duration > 1) {
    packingList.push(...trekPreparationGuide.recommended.items);
  }
  
  return packingList;
};
