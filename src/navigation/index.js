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
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SCREENS from '../screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="LogInScreen" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ConfirmEmail" component={ConfirmEmailScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

const TabNavigator = () => {
  return <Tab.Navigator initialRouteName ={SCREENS.HOME} >
    <Tab.Screen 
    name = {SCREENS.HOME} 
    component={HomeScreen} 
    options={{title: 'Home', tabBarIcon: ({focused}) => (<Image source={IMAGES.HOME} style={{height: 30, width: 30}} />)}}> 

    </Tab.Screen>

  <Tab.Screen 
  name = {SCREENS.PROFILE} 
  component={ProfileScreen} 
  options={{title: 'Profile', tabBarIcon: ({focused}) => (<Image source={IMAGES.PROFILE} style={{height: 30, width: 30}} />)}}> 

  </Tab.Screen>

  {/* <Tab.Screen 
  name = {SCREENS.WORKOUT} 
  component={WorkoutScreen} 
  options={{title: 'Workout', tabBarIcon: ({focused}) => (<Image source={IMAGES.WORKOUT} style={{height: 30, width: 30}} />)}}> 

  </Tab.Screen> */}

  </Tab.Navigator>
}


export default Navigation;