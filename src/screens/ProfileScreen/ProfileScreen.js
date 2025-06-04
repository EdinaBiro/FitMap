import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import { useIsFocused } from '@react-navigation/native';
import { baseURL } from '../../utils';

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
    const chechAuth = async () => {
      setIsLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 500));
      const user = auth().currentUser;
      console.log('Auth- check: Current user:', user);

      if (user) {
        setUserId(user.uid);
      } else {
        console.log('No user is logged in');
        alert('You must be logge din to acces your profile');
      }
      setIsLoading(false);
    };

    chechAuth();
  }, [isFocused]);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        alert('Prmission to access media library and camera is required');
      }
    })();
  }, [userId]);

  useEffect(() => {
    calculateBMI();
  }, [profile.height, profile.weight]);

  const handleChange = (key, value) => {
    const numericFileds = ['age', 'height', 'weight', 'activityLevel'];
    if (numericFileds.includes(key) && value != '') {
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
          console.log('No existing profile found, will creae one when saving');
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
      alert(`An unexpected error occured: ${error.message}`);
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

  const handleActivityLevelChange = (level) => {
    if (isEditing) {
      const levelNum = parseInt(level);
      setProfile({ ...profile, activityLevel: levelNum });
      setHoverText(activityTexts[level]);
    }
  };

  return (
    <>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#555" />
          <Text>Loading profile...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.profileContainer}>
            <View style={styles.profileOverlay}>
              <Text style={styles.title}>Profile</Text>
            </View>
          </View>
          <View style={styles.overlay}>
            <View style={styles.card}>
              <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                <Image
                  source={
                    profile.profileImage
                      ? { uri: profile.profileImage }
                      : require('../../../assets/images/default-avatar.jpg')
                  }
                  style={styles.profileImage}
                />
              </TouchableOpacity>

              <Text style={styles.label}>Age </Text>
              <View style={styles.infoBox}>
                <TextInput
                  style={styles.input}
                  editable={isEditing}
                  value={profile.age}
                  onChangeText={(text) => handleChange('age', text)}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.label}>Height(cm)</Text>
              <View style={styles.infoBox}>
                <TextInput
                  style={styles.input}
                  editable={isEditing}
                  value={profile.height}
                  onChangeText={(text) => handleChange('height', text)}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.label}>Weight(kg)</Text>
              <View style={styles.infoBox}>
                <TextInput
                  style={styles.input}
                  editable={isEditing}
                  value={profile.weight}
                  onChangeText={(text) => handleChange('weight', text)}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.label}>Gender</Text>
              <View style={styles.infoBox}>
                <Picker
                  selectedValue={profile.gender}
                  style={styles.input}
                  enabled={isEditing}
                  onValueChange={(itemValue) => handleChange('gender', itemValue)}
                >
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Male" value="male" />
                </Picker>
              </View>

              <Text style={styles.label}>Acivity Level</Text>
              <View style={styles.activityLevelContainer}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.circle, profile.activityLevel == level && styles.selectedButton]}
                    onPress={() => handleActivityLevelChange(level.toString())}
                  >
                    <Text style={styles.activityButtonText}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {hoverText ? <Text style={styles.hoverText}>{hoverText}</Text> : null}

              <View style={styles.bmiContainer}>
                <Text style={styles.bmiTitle}>YOUR BMI</Text>
                <Text>{bmi ? bmi : 'BMI will be calculated once you enter your details'}</Text>
              </View>

              <TouchableOpacity style={styles.button} onPress={isEditing ? handleSave : toggleEdit}>
                <Text style={styles.buttonText}>{isEditing ? 'Save' : 'Edit Profile'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: '#fff',
    paddingToop: 20,
  },

  card: {
    width: '90%',
    minHeight: 500,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elavation: 5,
    paddingTop: 200,
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },

  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 80,
    marginBottom: 10,
    alignSelf: 'center',
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    width: '100%',
    lineHeight: 20,
    color: '#333',
    textAlign: 'left',
  },
  input: {
    borderColor: '#ccc',
    flex: 1,
    marginLeft: 0,
    fontSize: 16,
    color: 'black',
    width: '80%',
    marginTop: 10,
  },

  button: {
    marginTop: 30,
    backgroundColor: '#555',
    padding: 10,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  imageContainer: {
    position: 'absolute',
    top: 30,
    left: 100,
    width: 140,
    height: 140,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#fff',
    marginBottom: 20,
    backgroundColor: 'gray',
  },
  infoBox: {
    width: '100%',
    padding: 10,
    borderRadius: 30,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    marginTop: 20,
    fontSize: 25,
    fontFamily: 'Open Sans',
    textAlign: 'center',
    alignSelf: 'center',
  },
  bmiContainer: {
    witdh: '100%',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  bmiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  activityLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
  },
  activityButtonText: {
    color: '#333',
    fontSize: 18,
  },
  hoverText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#888',
    marginTop: 10,
  },
  loadingContainer: {},
});

export default ProfileScreen;
