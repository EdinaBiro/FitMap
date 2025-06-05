import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import CalendarScreen from '../screens/CalendarScreen/CalendarScreen';
import { Platform } from 'react-native';
import WorkoutStackNavigator from '../screens/Workout/WorkoutStackNavigator';

const TabArray = [
  {
    route: 'HomeScreen',
    label: 'HomeScreen',
    type: 'Ionicons',
    avtiveIcon: 'home',
    inActiveIcon: 'home-outline',
    component: HomeScreen,
  },
  {
    route: 'ProfileScreen',
    label: 'ProfileScreen',
    type: 'Ionicons',
    activeIcon: 'person',
    inActiveIcon: 'person-outline',
    component: ProfileScreen,
  },
  {
    route: 'WorkoutScreen',
    label: 'WorkoutScreen',
    type: 'Ionicons',
    activeIcon: 'add',
    inActiveIcon: 'add-outline',
    component: WorkoutStackNavigator,
  },
  {
    route: 'CalendarScreen',
    label: 'CalendarScreen',
    type: 'Ionicons',
    activeIcon: 'calendar',
    inActiveIcon: 'calendar-outline',
    component: CalendarScreen,
  },
  {
    route: 'PersonalPlanScreen',
    label: 'PersonalPlanScreen',
    type: 'Ionicons',
    activeIcon: 'rocket',
    inActiveIcon: 'rocket-outline',
    component: SocialMediaScreen,
  },
];

const Tab = createBottomTabNavigator();

const screenOptions = {
  tabBarShowLabel: false,
  headerShow: false,
  tabBarStyle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 90 : 60,
    backgroundColor: '#ffffff',
  },
};

const TabButton = (props) => {
  const { item, onPress, focused } = props;

  const viewRef = useRef(null);

  useEffect(() => {
    if (focused) {
      viewRef.current.animate({ 0: { scale: 0.5, rotate: '0deg' }, 1: { scale: 1.5, rotate: '360deg' } }, 300);
    } else {
      viewRef.current.animate({ 0: { scale: 1.5, rotate: '360deg' }, 1: { scale: 1, rotate: '0deg' } }, 300);
    }
  }, [focused]);

  const isWorkoutScreen = item.route === 'WorkoutScreen';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={isWorkoutScreen ? styles.plusButtonContainer : styles.container}
    >
      <Animatable.View
        ref={viewRef}
        animation="zoomIn"
        duration={1000}
        style={isWorkoutScreen ? styles.plusButton : styles.container}
      >
        <Icon
          type={item.type}
          name={focused ? item.activeIcon : item.inActiveIcon}
          color={focused ? Colors.primary : Colors.primaryLite}
          size={focused ? 28 : 24}
        />
      </Animatable.View>
    </TouchableOpacity>
  );
};

const BottomNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          position: 'absolute',
          bottom: 16,
          right: 16,
          left: 16,
          borderRadius: 16,
        },
      }}
    >
      {TabArray.map((item, index) => {
        return (
          <Tab.Screen
            name={item.route}
            component={item.component}
            key={index}
            options={{
              tabBarShowLabel: false,
              tabBarButton: (props) => <TabButton {...props} item={item} />,
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButtonContainer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#6200ee',
    backgroundColor: '#fff',
  },
});

export default BottomNavigation;
