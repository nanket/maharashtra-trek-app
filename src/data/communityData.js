// Mock community data for the lounge screen
export const communityPosts = [
  {
    id: 1,
    user: {
      name: "Priya Sharma",
      avatar: "👩‍🦱",
      level: "Expert Trekker",
      completedTreks: 45
    },
    type: "completion",
    trek: {
      id: 1,
      name: "Rajgad Fort",
      category: "fort"
    },
    content: "Just completed Rajgad Fort! The sunrise view was absolutely breathtaking. Perfect weather conditions today. Highly recommend starting early morning.",
    rating: 5,
    timestamp: "2024-01-15T06:30:00Z",
    likes: 23,
    comments: 8,
    photos: ["rajgad_sunrise.jpg"]
  },
  {
    id: 2,
    user: {
      name: "Arjun Patil",
      avatar: "👨‍🦲",
      level: "Adventure Seeker",
      completedTreks: 28
    },
    type: "tip",
    content: "Pro tip for Dudhsagar Falls: Book your jeep safari in advance, especially during monsoon season. The forest department limits the number of vehicles per day.",
    timestamp: "2024-01-14T14:20:00Z",
    likes: 31,
    comments: 12,
    category: "waterfall"
  },
  {
    id: 3,
    user: {
      name: "Sneha Kulkarni",
      avatar: "👩‍🦰",
      level: "Mountain Explorer",
      completedTreks: 67
    },
    type: "weather_alert",
    content: "Weather update: Heavy rainfall expected in Sahyadri ranges this weekend. Please postpone your treks for safety. Stay safe, fellow trekkers! 🌧️",
    timestamp: "2024-01-14T09:15:00Z",
    likes: 89,
    comments: 24,
    isImportant: true
  },
  {
    id: 4,
    user: {
      name: "Rahul Desai",
      avatar: "👨‍🦱",
      level: "Trek Enthusiast",
      completedTreks: 19
    },
    type: "question",
    content: "Planning to visit Harishchandragad next month. Any recommendations for the best route? First time visiting this fort. Looking for moderate difficulty path.",
    timestamp: "2024-01-13T18:45:00Z",
    likes: 15,
    comments: 18,
    trek: {
      id: 5,
      name: "Harishchandragad",
      category: "fort"
    }
  },
  {
    id: 5,
    user: {
      name: "Meera Joshi",
      avatar: "👩‍🦳",
      level: "Veteran Trekker",
      completedTreks: 92
    },
    type: "achievement",
    content: "Milestone achieved! Just completed my 90th trek in Maharashtra. This journey has been incredible. Thank you to this amazing community for all the support! 🎉",
    timestamp: "2024-01-13T12:30:00Z",
    likes: 156,
    comments: 45,
    isSpecial: true
  }
];

export const featuredTrekkers = [
  {
    id: 1,
    name: "Meera Joshi",
    avatar: "👩‍🦳",
    level: "Veteran Trekker",
    completedTreks: 92,
    speciality: "Fort Expert",
    recentAchievement: "90 Treks Completed",
    joinedDate: "2022-03-15"
  },
  {
    id: 2,
    name: "Vikram Singh",
    avatar: "👨‍🦲",
    level: "Mountain Guide",
    completedTreks: 78,
    speciality: "Waterfall Specialist",
    recentAchievement: "Community Helper",
    joinedDate: "2022-06-20"
  },
  {
    id: 3,
    name: "Anita Rao",
    avatar: "👩‍🦱",
    level: "Adventure Leader",
    completedTreks: 56,
    speciality: "Group Organizer",
    recentAchievement: "50+ Group Treks",
    joinedDate: "2023-01-10"
  }
];

export const communityStats = {
  totalMembers: 2847,
  activeTrekkers: 456,
  treksCompletedThisMonth: 189,
  totalTreksLogged: 12456,
  popularDestination: "Rajgad Fort",
  weatherAlerts: 2
};

export const trekRecommendations = [
  {
    id: 1,
    name: "Sinhagad Fort",
    category: "fort",
    difficulty: "Easy",
    reason: "Perfect for beginners",
    completedBy: 234,
    rating: 4.5,
    distance: "25 km from Pune"
  },
  {
    id: 2,
    name: "Bhimashankar",
    category: "trek",
    difficulty: "Moderate",
    reason: "Great for weekend adventure",
    completedBy: 156,
    rating: 4.7,
    distance: "100 km from Mumbai"
  },
  {
    id: 3,
    name: "Kune Falls",
    category: "waterfall",
    difficulty: "Easy",
    reason: "Monsoon special",
    completedBy: 89,
    rating: 4.3,
    distance: "65 km from Pune"
  }
];

export const weatherUpdates = [
  {
    location: "Pune Region",
    condition: "Partly Cloudy",
    temperature: "24°C",
    humidity: "65%",
    windSpeed: "12 km/h",
    trekCondition: "Good",
    icon: "⛅"
  },
  {
    location: "Mumbai Region", 
    condition: "Clear Sky",
    temperature: "28°C",
    humidity: "70%",
    windSpeed: "8 km/h",
    trekCondition: "Excellent",
    icon: "☀️"
  },
  {
    location: "Sahyadri Range",
    condition: "Light Rain",
    temperature: "22°C", 
    humidity: "85%",
    windSpeed: "15 km/h",
    trekCondition: "Caution",
    icon: "🌦️"
  }
];

// Helper functions
export const getTimeAgo = (timestamp) => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w ago`;
};

export const getPostTypeIcon = (type) => {
  switch (type) {
    case 'completion': return '✅';
    case 'tip': return '💡';
    case 'weather_alert': return '🌦️';
    case 'question': return '❓';
    case 'achievement': return '🏆';
    default: return '📝';
  }
};

export const getPostTypeColor = (type) => {
  switch (type) {
    case 'completion': return '#10B981';
    case 'tip': return '#F59E0B';
    case 'weather_alert': return '#EF4444';
    case 'question': return '#3B82F6';
    case 'achievement': return '#8B5CF6';
    default: return '#6B7280';
  }
};
