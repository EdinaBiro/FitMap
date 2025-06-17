import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../utils';
import { getAuthToken } from '../services/StatisticsService';
import auth from '@react-native-firebase/auth';

export let globalData = null;
// const getAuthToken = async () => {
//   try {
//     const auth = getAuth();
//     const user = auth.currentUser;

//     if (user) {
//       const idToken = await user.getIdToken(true);
//       return idToken;
//     }

//     const storedToken = await AsyncStorage.getItem('userToken');

//     if (storedToken) {
//       return storedToken;
//     }

//     console.warn('No authentification token found');
//     return null;
//   } catch (error) {
//     console.error('Error getting auth token: ', error);
//     return null;
//   }
// };

export const saveOnBoardingData = async (data) => {
  try {
    const storageData = {
      ...data,
      timestamp: new Date().toISOString(),
      needsSync: true,
    };

    await AsyncStorage.setItem('pendingOnBoardingData', JSON.stringify(storageData));
    const check = AsyncStorage.getItem('pendingOnBoardingData');
    console.log('I HAVE RUNED', check);
    globalData = storageData;
    return {
      success: true,
      savedLocally: true,
      needsServerSync: true,
    };
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendPendingOnBoardingData = async (token) => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error('User not authenticated');

    const storedData = await AsyncStorage.getItem('pendingOnBoardingData');
    if (!storedData) return { success: false, message: 'No pending data' };

    const parsed = JSON.parse(storedData);

    // Transform to backend-expected format
    const payload = {
      fitnessLevel: Number(parsed.fitnessLevel),
      fitnessGoal: parsed.fitnessGoal,
      workoutFrequency: Number(parsed.workoutFrequency),
      workoutDuration: Number(parsed.workoutDuration),
      preferredWorkoutType: parsed.prefferedWorkoutType || parsed.preferredWorkoutType,
      medicalConditions: Boolean(parsed.medicalConditions),
      medicalDetails: parsed.medicalDetails || '',
      age: parsed.age,
      height: parsed.height,
      weight: parsed.weight,
      gender: parsed.gender,
      userId: user.uid, // Always use current user's ID
    };

    console.log('Sending payload:', payload);

    const response = await fetch(`${baseURL}/plan/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.detail || `HTTP ${response.status}`);
    }

    await AsyncStorage.removeItem('pendingOnBoardingData');
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Sync failed:', error.message);
    return {
      success: false,
      error: error.message,
      willRetry: true,
    };
  }
};

export const syncPendingOnBoardingData = async (token) => {
  try {
    const pendingData = await AsyncStorage.getItem('pendingOnBoardingData');
    if (!pendingData) {
      console.log('No peding onboarding data found');
      return { success: true, message: 'No pending data to sync' };
    }

    const parsed = JSON.parse(pendingData);
    console.log('Syncing pending onboarding data to server');

    const response = await fetch(`${baseURL}/plan/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsed),
    });
    if (response.ok) {
      console.log('Onboarding data successfullly sync to server');
      await AsyncStorage.removeItem('pendingOnBoardingData');
      const result = await response.json();
      return { success: true, message: 'Data synced successfully', serverResponse: result };
    } else {
      const errorData = await response.json();
      console.warn('Failed to sync onboarding data:', response.status, errorData);
      return { success: false, error: errorData.detail || 'Failed to sync data' };
    }
  } catch (error) {
    console.error('Error syncing onboarding data:', error);
    return { success: false, error: error.message };
  }
};

export const hasPendingOnBoardingData = async () => {
  try {
    const pendingData = await AsyncStorage.getItem('pendingOnBoardingData');
    return !!pendingData;
  } catch (error) {
    console.error('Error checking for pending data:', error);
    return false;
  }
};
export const checkQuestionnaireStatus = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentification token found');
    }

    const response = await fetch(`${baseURL}/plan/questionnaire-status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to save onboarding data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking questionnaire status:', error);
    throw error;
  }
};

export const generateWorkoutPlan = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentification token found');
    }

    const response = await fetch(`${baseURL}/plan/generate-workout-plan`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to save onboarding data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw error;
  }
};

export const getWorkoutPlan = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentification token found');
    }

    const response = await fetch(`${baseURL}/plan/workout-plan`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to save onboarding data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting workout plan:', error);
    throw error;
  }
};

export const getWorkoutSessionDetails = async (sessionId) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentification token found');
    }

    const response = await fetch(`${baseURL}/plan/workout-session/${sessionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to save onboarding data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting workout plan:', error);
    throw error;
  }
};
