import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../utils';

const ONBOARDING_DATA_KEY = 'fitmap_onboarding_data';
const ONBOARDING_COMPLETED_KEY = 'fitmap_onboarding_completed';

export const getOnboardingData = async () => {
  try {
    const userData = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting onboarding data: ', error);
    return null;
  }
};

export const isOnboardingCompleted = async () => {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking onboarding status: ', error);
    return false;
  }
};

export const transferOnboardingDataToProfile = async () => {
  try {
    const user = auth().currentUser;
    if (!user) {
      console.log('No user is logged in');
      return false;
    }

    const onboardingData = await getOnboardingData();
    if (!onboardingData) {
      console.log('No onborading data found');
      return false;
    }

    const profileData = {
      user_id: user.uid,
      age: Number(onboardingData.age || 0),
      height: Number(onboardingData.height || 0),
      weight: Number(onboardingData.weight || 0),
      gender: onboardingData.gender || 'female',
      activity_level: Number(onboardingData.fitnessLevel || 1),
      profile_image: null,
    };

    const response = await fetch(`${baseURL}/profile/create_profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (response.ok) {
      console.log('Successfully transferred onboarding data to profile');
      return true;
    } else {
      console.error('Failed to transfer onboarding data to profile: ', await response.json());
      return false;
    }
  } catch (error) {
    console.error('Error transferring onboarding data to profile');
    return false;
  }
};
