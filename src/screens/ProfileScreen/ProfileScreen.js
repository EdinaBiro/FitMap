import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import { useIsFocused } from '@react-navigation/native';
import { baseURL } from '../../utils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [bmi, setBmi] = useState(null);
  const [hoverText, setHoverText] = useState('');
  const [activityLevel, setActivityLevel] = useState('1');
  const [userId, setUserId] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profile, setProfile] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();

  const activityTexts = {
    1: 'Sedentary - Little or no exercise',
    2: 'Lightly Active - Light exercise/sports 1-3 days/week',
    3: 'Moderately Active - Moderate exercise/sports 3-5 days/week',
    4: 'Very Active - Hard exercise/sports 6-7 days a week',
    5: 'Super Active - Very hard exercise/sports & physical job or training twice a day',
  };

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const user = auth().currentUser;
      console.log('Auth- check: Current user:', user);

      if (user) {
        setUserId(user.uid);
      } else {
        console.log('No user is logged in');
        alert('You must be logged in to access your profile');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [isFocused]);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        alert('Permission to access media library and camera is required');
      }
    })();
  }, [userId]);

  useEffect(() => {
    calculateBMI();
  }, [profile.height, profile.weight]);

  const handleChange = (key, value) => {
    const numericFields = ['age', 'height', 'weight', 'activityLevel'];
    if (numericFields.includes(key) && value !== '') {
      value = Number(value);
    }
    setProfile({ ...profile, [key]: value });
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setHoverText('');
    }
  };

  const validateInput = () => {
    const { age, height, weight } = profile;
    if (!age || !height || !weight || isNaN(age) || isNaN(height) || isNaN(weight)) {
      alert('Please provide valid numeric values for age, height and weight');
      return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setIsLoading(true);

      try {
        const response = await fetch(`${baseURL}/profile/user/${userId}`);
        console.log('Profile response status: ', response.status);
        if (response.ok) {
          const data = await response.json();
          setProfile({
            id: data.user_id,
            age: data.age?.toString() || '',
            height: data.height?.toString() || '',
            weight: data.weight?.toString() || '',
            gender: data.gender || 'female',
            activityLevel: data.activity_level || 1,
            profileImage: data.profile_image || null,
          });
        } else {
          console.log('No existing profile found, will create one when saving');
          setProfile({
            age: '',
            height: '',
            weight: '',
            gender: 'female',
            activityLevel: 1,
            profileImage: null,
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleSave = async () => {
    if (!validateInput()) return;

    try {
      const user = auth().currentUser;

      if (!user) {
        alert("User id is not available. Please make sure you're logged in");
        return;
      }
      const currentUserId = user.uid;

      let url;
      let method;

      if (profile.id) {
        url = `${baseURL}/profile/${profile.id}`;
        method = 'PUT';
      } else {
        url = `${baseURL}/profile/create_profile`;
        method = 'POST';
      }

      const activityLevelValue =
        typeof profile.activityLevel === 'string' ? parseInt(profile.activityLevel) : profile.activityLevel;

      const dataToSend = {
        profile_image: profile.profileImage,
        age: Number(profile.age),
        height: Number(profile.height),
        weight: Number(profile.weight),
        gender: profile.gender,
        activity_level: activityLevelValue || 1,
        user_id: currentUserId,
      };

      console.log('Sending data:', JSON.stringify(dataToSend));

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({
          id: data.id || data.user_id,
          age: data.age?.toString() || '',
          height: data.height?.toString() || '',
          weight: data.weight?.toString() || '',
          gender: data.gender || 'female',
          activityLevel: data.activity_level || 1,
          profileImage: data.profile_image || null,
        });
        alert('Profile saved successfully');
        setIsEditing(false);
        calculateBMI();
      } else {
        const errorData = await response.json();
        const errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        alert(`Error saving profile: ${errorMessage}`);
        console.error('Error details:', errorData);
      }
    } catch (error) {
      alert(`An unexpected error occurred: ${error.message}`);
      console.error('Fetch error:', error);
    }

    calculateBMI();
  };

  const pickImage = async () => {
    if (!isEditing) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Image,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfile({ ...profile, profileImage: result.assets[0].uri });
    }
  };

  const calculateBMI = () => {
    const { height, weight } = profile;
    if (height && weight && !isNaN(height) && !isNaN(weight)) {
      const heightInMeters = height / 100;
      const bmiValue = weight / (heightInMeters * heightInMeters);
      setBmi(bmiValue.toFixed(1));
    } else {
      setBmi(null);
    }
  };

  const getBMICategory = () => {
    if (!bmi) return { category: 'Unknown', color: '#9CA3AF' };
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { category: 'Underweight', color: '#3B82F6' };
    if (bmiValue < 25) return { category: 'Normal', color: '#10B981' };
    if (bmiValue < 30) return { category: 'Overweight', color: '#F59E0B' };
    return { category: 'Obese', color: '#EF4444' };
  };

  const handleActivityLevelChange = (level) => {
    if (isEditing) {
      const levelNum = parseInt(level);
      setProfile({ ...profile, activityLevel: levelNum });
      setHoverText(activityTexts[level]);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your health information</Text>
      </LinearGradient>

      <View style={styles.profileImageSection}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer} disabled={!isEditing}>
          <View style={styles.imageWrapper}>
            <Image
              source={
                profile.profileImage
                  ? { uri: profile.profileImage }
                  : require('../../../assets/images/default-avatar.jpg')
              }
              style={styles.profileImage}
            />
            {isEditing && (
              <View style={styles.editImageOverlay}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.contentCard}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.disabledInput]}
                editable={isEditing}
                value={profile.age}
                onChangeText={(text) => handleChange('age', text)}
                keyboardType="numeric"
                placeholder="Enter age"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={[styles.pickerWrapper, !isEditing && styles.disabledInput]}>
                <Picker
                  selectedValue={profile.gender}
                  enabled={isEditing}
                  onValueChange={(itemValue) => handleChange('gender', itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Male" value="male" />
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.disabledInput]}
                editable={isEditing}
                value={profile.height}
                onChangeText={(text) => handleChange('height', text)}
                keyboardType="numeric"
                placeholder="Enter height"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.disabledInput]}
                editable={isEditing}
                value={profile.weight}
                onChangeText={(text) => handleChange('weight', text)}
                keyboardType="numeric"
                placeholder="Enter weight"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Level</Text>
          <View style={styles.activityLevelContainer}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.activityButton, profile.activityLevel == level && styles.selectedActivityButton]}
                onPress={() => handleActivityLevelChange(level.toString())}
                disabled={!isEditing}
              >
                <Text
                  style={[
                    styles.activityButtonText,
                    profile.activityLevel == level && styles.selectedActivityButtonText,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {hoverText ? (
            <Text style={styles.activityDescription}>{hoverText}</Text>
          ) : (
            <Text style={styles.activityDescription}>
              {activityTexts[profile.activityLevel] || 'Select your activity level'}
            </Text>
          )}
        </View>

        <View style={styles.bmiSection}>
          <Text style={styles.sectionTitle}>BMI Calculator</Text>
          <View style={styles.bmiCard}>
            <View style={styles.bmiHeader}>
              <Text style={styles.bmiLabel}>Your BMI</Text>
              <View style={[styles.bmiCategoryBadge, { backgroundColor: getBMICategory().color }]}>
                <Text style={styles.bmiCategoryText}>{getBMICategory().category}</Text>
              </View>
            </View>
            <Text style={styles.bmiValue}>{bmi || '--'}</Text>
            <Text style={styles.bmiDescription}>
              {bmi ? 'Based on your current height and weight' : 'Enter your details to calculate BMI'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, isEditing && styles.saveButton]}
          onPress={isEditing ? handleSave : toggleEdit}
        >
          <LinearGradient
            colors={isEditing ? ['#10B981', '#059669'] : ['#667eea', '#764ba2']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name={isEditing ? 'checkmark' : 'pencil'} size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{isEditing ? 'Save Changes' : 'Edit Profile'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '400',
  },
  profileImageSection: {
    alignItems: 'center',
    marginTop: -30,
    zIndex: 1,
  },
  imageContainer: {
    marginBottom: 10,
  },
  imageWrapper: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'white',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#667eea',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  contentCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  pickerWrapper: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#1F2937',
  },
  activityLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedActivityButton: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  activityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedActivityButtonText: {
    color: 'white',
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bmiSection: {
    marginBottom: 32,
  },
  bmiCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bmiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  bmiLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  bmiCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bmiCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  bmiDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
});

export default ProfileScreen;
