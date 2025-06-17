import { baseURL } from '../utils';
import { onAuthStateChanged } from 'firebase/auth';
import auth from '@react-native-firebase/auth';
import { useNavigation } from 'expo-router';

export const getAuthToken = async () => {
  const userToken = await auth().currentUser.getIdToken();
  return userToken;
};

export const getWorkoutStats = async (timeRange = 'month') => {
  try {
    const token = await getAuthToken();
    // console.log(token);
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${baseURL}/stats/workouts?range=${timeRange}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    throw error;
  }
};
