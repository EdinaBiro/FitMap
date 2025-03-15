import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ConfirmEmailScreen from '../screens/ConfirmEmailScreen/ConfirmEmailScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen/ForgotPasswordScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen/NewPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen/CalendarScreen';
import WorkoutScreen from '../screens/Workout/WorkoutScreen/WorkoutScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import StartWorkoutScreen from '../screens/Workout/StartWorkoutScreen/StartWorkoutScreen';
import WorkoutStackNavigator from '../screens/Workout/WorkoutStackNavigator';
import TrainerProfileScreen from '../screens/TrainerProfileScreen';


const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
      <Stack.Navigator screenOptions={{headerShown: false}} >
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="ConfirmEmailScreen" component={ConfirmEmailScreen} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
        <Stack.Screen name="NewPasswordScreen" component={NewPasswordScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
        <Stack.Screen name="WorkoutScreen" component={WorkoutScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen}  />
        <Stack.Screen name="StartWorkoutScreen" component={StartWorkoutScreen}  />
        <Stack.Screen name="WorkoutStackNavigator" component={WorkoutStackNavigator}  />
        <Stack.Screen name="TrainerProfileScreen" component={TrainerProfileScreen}  />

      </Stack.Navigator>
    

  );
};



export default Navigation;