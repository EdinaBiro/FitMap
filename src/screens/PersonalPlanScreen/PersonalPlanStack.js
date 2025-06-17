import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PersonalPlanScreen from './PersonalPlanScreen';
import WorkoutSessionScreen from '../WorkoutSessionScreen/WorkoutSessionScreen';

const Stack = createNativeStackNavigator();

const PersonalPlanStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PersonalPlanScreen" component={PersonalPlanScreen} />
      <Stack.Screen name="WorkoutSessionScreen" component={WorkoutSessionScreen} />
    </Stack.Navigator>
  );
};

export default PersonalPlanStack;
