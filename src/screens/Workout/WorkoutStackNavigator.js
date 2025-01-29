import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkoutScreen from './WorkoutScreen/WorkoutScreen';
import StartWorkoutScreen from './StartWorkoutScreen';

const WorkoutStack = createNativeStackNavigator();

const WorkoutStackNavigator = () => {
  return (
   <WorkoutStack.Navigator screenOptions={{ headerShown: false}}>
    <WorkoutStack.Screen name="WorkoutScreen" component={WorkoutScreen}/>
    <WorkoutStack.Screen name="StartWorkoutScreen" component={StartWorkoutScreen}/>
   </WorkoutStack.Navigator>
  )
}

export default WorkoutStackNavigator;

const styles = StyleSheet.create({})