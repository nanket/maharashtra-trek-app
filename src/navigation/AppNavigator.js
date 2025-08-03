import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import TrekListScreen from '../screens/TrekListScreen';
import TrekDetailsScreen from '../screens/TrekDetailsScreen';
import MapScreen from '../screens/MapScreen';
import MyTreksScreen from '../screens/MyTreksScreen';

import TrekScreen from '../screens/TrekScreen';
import TrekPlannerScreen from '../screens/TrekPlannerScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import EmergencyContactsScreen from '../screens/EmergencyContactsScreen';
import LiveTrackingScreen from '../screens/LiveTrackingScreen';
import { COLORS, FONTS, createTextStyle } from '../utils/constants';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Trek Stack Navigator
const TrekStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TrekMain" component={TrekScreen} />
      <Stack.Screen name="TrekList" component={TrekListScreen} />
      <Stack.Screen name="TrekDetails" component={TrekDetailsScreen} />
      <Stack.Screen name="TrekPlanner" component={TrekPlannerScreen} />
      <Stack.Screen name="Emergency" component={EmergencyScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
    </Stack.Navigator>
  );
};



// Map Stack Navigator
const MapStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MapMain" component={MapScreen} />
      <Stack.Screen name="TrekDetails" component={TrekDetailsScreen} />
    </Stack.Navigator>
  );
};

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="TrekList" component={TrekListScreen} />
      <Stack.Screen name="TrekDetails" component={TrekDetailsScreen} />
      <Stack.Screen name="TrekPlanner" component={TrekPlannerScreen} />
      <Stack.Screen name="Emergency" component={EmergencyScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.backgroundCard,
          borderTopWidth: 1,
          borderTopColor: COLORS.surfaceBorder,
          paddingBottom: Math.max(insets.bottom, 8), // Respect safe area
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 70 + insets.bottom : 70,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          ...createTextStyle(12, 'medium'),
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Treks"
        component={TrekStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>🏔️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>🗺️</Text>
          ),
        }}
      />

      <Tab.Screen
        name="My Treks"
        component={MyTreksScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>📋</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
