import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnBoardingScreen from './OnBoardingScreen';
import LoginScreen from '../LoginScreen';
import SignUpScreen from '../SignUpScreen';
import ConfirmEmailScreen from '../ConfirmEmailScreen/ConfirmEmailScreen';
import { NavigationContainer } from '@react-navigation/native';
import ForgotPasswordScreen from '../ForgotPasswordScreen/ForgotPasswordScreen';
import NewPasswordScreen from '../NewPasswordScreen/NewPasswordScreen';
import HomeScreen from '../HomeScreen';
import CalendarScreen from '../CalendarScreen/CalendarScreen';
import WorkoutScreen from '../Workout/WorkoutScreen/WorkoutScreen';
import ProfileScreen from '../ProfileScreen/ProfileScreen';
import StartWorkoutScreen from '../Workout/StartWorkoutScreen';
import WorkoutStackNavigator from '../Workout/WorkoutStackNavigator';
import GymScreen from '../GymScreen/GymScreen';


const Stack = createNativeStackNavigator();

const NavigationProvider = () => {
  return (
//    <NavigationContainer>
    <Stack.Navigator 
    initialRouteName='OnBoardingScreen'
    screenOptions={{
        headerShown: false,
    }}>
        <Stack.Screen name="OnBoardingScreen" component={OnBoardingScreen}/>
        <Stack.Screen name="LoginScreen" component={LoginScreen}/>
        <Stack.Screen name="SignUpScreen" component={SignUpScreen}/>


        <Stack.Screen name="ConfirmEmailScreen" component={ConfirmEmailScreen}/>
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen}/>
        <Stack.Screen name="NewPasswordScreen" component={NewPasswordScreen}/>

        <Stack.Screen name="HomeScreen" component={HomeScreen}/>
        <Stack.Screen name="CalendarScreen" component={CalendarScreen}/>
        <Stack.Screen name="WorkoutScreen" component={WorkoutScreen}/>
        <Stack.Screen name="ProfileScreen" component={ProfileScreen}/>
        <Stack.Screen name="StartWorkoutScreen" component={StartWorkoutScreen}/>
        <Stack.Screen name="GymScreen" component={GymScreen}/>    
    </Stack.Navigator>
//    </NavigationContainer>
  );
};

export default NavigationProvider;
