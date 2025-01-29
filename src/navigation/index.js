import { View, Text } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ConfirmEmailScreen from '../screens/ConfirmEmailScreen/ConfirmEmailScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen/ForgotPasswordScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen/NewPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen/CalendarScreen';
import BottomNavigation from '../bottomNav/BottomNavigation';
import DrawerNavigation from '../drawerNav/DrawerNavigation';
import WorkoutScreen from '../screens/WorkoutScreen/WorkoutScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName='LoginScreen'>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="ConfirmEmailScreen" component={ConfirmEmailScreen} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
        <Stack.Screen name="NewPasswordScreen" component={NewPasswordScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
        <Stack.Screen name ="BottomNavigation" component={BottomNavigation}/>
        <Stack.Screen name="Main" component={DrawerNavigation}/>
        <Stack.Screen name="WorkoutScreen" component={WorkoutScreen} />

      </Stack.Navigator>
   </NavigationContainer>

  );
};



export default Navigation;