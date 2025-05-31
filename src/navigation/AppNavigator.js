import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import TrekListScreen from '../screens/TrekListScreen';
import TrekDetailsScreen from '../screens/TrekDetailsScreen';
import MapScreen from '../screens/MapScreen';
import MyTreksScreen from '../screens/MyTreksScreen';
import LoungeScreen from '../screens/LoungeScreen';
import TrekPlannerScreen from '../screens/TrekPlannerScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import EmergencyContactsScreen from '../screens/EmergencyContactsScreen';
import LiveTrackingScreen from '../screens/LiveTrackingScreen';
import { COLORS, FONTS, createTextStyle } from '../utils/constants';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder screens for bottom tabs
const TrekScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Trek Screen</Text>
  </View>
);



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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.backgroundCard,
          borderTopWidth: 1,
          borderTopColor: COLORS.surfaceBorder,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
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
        name="Map"
        component={MapStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>🗺️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Lounge"
        component={LoungeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>👥</Text>
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
