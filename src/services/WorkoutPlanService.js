import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../utils';
import { getAuth } from 'firebase/auth';

const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token;
  } catch (error) {
    console.error('Error getting auth token: ', error);
    return null;
  }
};

export const saveOnBoardingData = async (data) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.warn('No token found, saving onboarding data locally');
      await AsyncStorage.setItem(
        'pendingOnBoardingData',
        JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          needsSync: true,
        }),
      );
      return { success: false, savedLocally: true, needsServerSync: true };
    }
    console.log('Token found, sending onboarding data to server: ', data);

    const response = await fetch(`${baseURL}/plan/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      await AsyncStorage.setItem(
        'pendingOnBoardingData',
        JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          needsSync: true,
        }),
      );
      return { success: false, savedLocally: true, needsServerSync: true, error: errorData.detail };
    }

    await AsyncStorage.removeItem('pendingOnBoardingData');
    const result = await response.json();
    return { success: true, savedLocally: true, needsServerSync: false, serverResponse: result };
  } catch (error) {
    console.error('Error saving onboarding data: ', error);
    try {
      await AsyncStorage.setItem(
        'pendingOnBoardingData',
        JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          needsSync: true,
        }),
      );
      return { success: false, savedLocally: true, needsServerSync: true, error: error.message };
    } catch (storageError) {
      console.error('DFailed to save locally: ', storageError);
      throw new Error('Failed to save onboarding data both locally and on server');
    }
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
      body: JSON.stringify(data),
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
