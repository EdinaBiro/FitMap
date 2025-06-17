import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigation from '../drawerNav/DrawerNavigation';
import CalendarScreen from '../screens/CalendarScreen/CalendarScreen';
import ConfirmEmailScreen from '../screens/ConfirmEmailScreen/ConfirmEmailScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen/ForgotPasswordScreen';
import GymScreen from '../screens/GymScreen/GymScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen/NewPasswordScreen';
import PersonalPlanScreen from '../screens/PersonalPlanScreen/PersonalPlanScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import SignUpScreen from '../screens/SignUpScreen';
import StartWorkoutScreen from '../screens/Workout/StartWorkoutScreen/StartWorkoutScreen';
import WorkoutScreen from '../screens/Workout/WorkoutScreen/WorkoutScreen';
import WorkoutStackNavigator from '../screens/Workout/WorkoutStackNavigator';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen/WorkoutSessionScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="ConfirmEmailScreen" component={ConfirmEmailScreen} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
      <Stack.Screen name="NewPasswordScreen" component={NewPasswordScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
      <Stack.Screen name="WorkoutScreen" component={WorkoutScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="StartWorkoutScreen" component={StartWorkoutScreen} />
      <Stack.Screen name="WorkoutStackNavigator" component={WorkoutStackNavigator} />
      <Stack.Screen name="GymScreen" component={GymScreen} />
      <Stack.Screen name="PersonalPlanScreen" component={PersonalPlanScreen} />
      <Stack.Screen name="MainApp" component={DrawerNavigation} />
      <Stack.Screen name="WorkoutSessionScreen" component={WorkoutSessionScreen} />
    </Stack.Navigator>
  );
};

export default Navigation;
