import { StyleSheet, Text, TouchableOpacity, View, Animated, ScrollView } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const UserInfoScreen = ({ userResponses, updateResponse, handleNextStep }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const heightOptions = Array.from({ length: 81 }, (_, i) => ({ label: `${140 + i} cm`, value: (140 + i).toString() }));
  const weightOptions = Array.from({ length: 121 }, (_, i) => ({ label: `${40 + i} kg`, value: (40 + i).toString() }));
  const ageOptions = Array.from({ length: 65 }, (_, i) => ({ label: `${16 + i} years`, value: (16 + i).toString() }));

  const [completed, setCompleted] = useState({
    age: !!userResponses.age,
    height: !!userResponses.height,
    weight: !!userResponses.weight,
    gender: !!userResponses.gender,
  });

  const isComplete = () => {
    return userResponses.age && userResponses.height && userResponses.weight && userResponses.gender;
  };

  useEffect(() => {
    if (isComplete()) {
      const timer = setTimeout(() => {
        handleNextStep();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [userResponses.age, userResponses.height, userResponses.weight, userResponses.gender]);

  const handleValueChange = (field, value) => {
    if (typeof updateResponse === 'function') {
      updateResponse(field, value);
      setCompleted((prev) => ({ ...prev, [field]: true }));
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LottieView
        source={require('../../../assets/animations/profile_animation.json')}
        autoPlay
        loop
        style={{ width: 300, height: 300 }}
      />

      <Text style={styles.title}>Tell me about yourself</Text>
      <Text style={styles.description}>We need this information to create your personalized workout plan</Text>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Age</Text>
            {completed.age && (
              <View style={styles.completedIndicator}>
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              </View>
            )}
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={userResponses.age || '25'}
              onValueChange={(value) => handleValueChange('age', value)}
              itemStyle={styles.pickerItem}
              style={styles.picker}
            >
              {ageOptions.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Height</Text>
            {completed.height && (
              <View style={styles.completedIndicator}>
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={userResponses.height || '170'}
              onValueChange={(value) => handleValueChange('height', value)}
              style={styles.picker}
            >
              {heightOptions.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weight</Text>
            {completed.weight && (
              <View style={styles.completedIndicator}>
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={userResponses.weight || '70'}
              onValueChange={(value) => handleValueChange('weight', value)}
              style={styles.picker}
            >
              {weightOptions.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gender</Text>
            {completed.gender && (
              <View style={styles.completedIndicator}>
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </View>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderOption, userResponses.gender === 'female' && styles.selectedGender]}
              onPress={() => handleValueChange('gender', 'female')}
            >
              <MaterialIcons name="female" size={40} color={userResponses.gender === 'female' ? 'white' : '#6200ee'} />
              <Text style={[styles.genderText, userResponses.gender === 'female' && styles.selectedGenderText]}>
                Female
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.genderOption, userResponses.gender === 'male' && styles.selectedGender]}
              onPress={() => handleValueChange('gender', 'male')}
            >
              <MaterialIcons name="male" size={40} color={userResponses.gender === 'female' ? 'white' : '#6200ee'} />
              <Text style={[styles.genderText, userResponses.gender === 'male' && styles.selectedGenderText]}>
                Male
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <View style={styles.progressContainer}>
        <View style={styles.progressIndicator}>
          {['age', 'height', 'weight', 'gender'].map((field, index) => (
            <View key={index} style={[styles.progressDot, completed[field] && styles.completedDot]} />
          ))}
        </View>
        <Text style={styles.progressText}>
          {isComplete() ? 'All set? Moving to the next step...' : 'Please complete all fileds'}
        </Text>
      </View>
    </Animated.View>
  );
};

export default UserInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
    width: '100%',
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  completedIndicator: {
    backgroundColor: '#E8F5E8',
    padding: 4,
    borderRadius: 12,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  picker: {
    width: '100%',
    height: 60,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 15,
  },
  genderOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6200ee',
    width: 120,
  },
  selectedGender: {
    backgroundColor: '#6200ee',
  },
  genderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6200ee',
    fontWeight: '600',
  },
  selectedGenderText: {
    color: 'white',
  },
  progressIndicator: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#6200ee',
    transform: [{ scale: 1.2 }],
  },
  completedDot: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#B39DDB',
    elevation: 0,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDot: {
    width: 10,
    height: 1,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  completedDot: {
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
