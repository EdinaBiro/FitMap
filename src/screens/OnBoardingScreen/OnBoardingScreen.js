import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { saveOnBoardingData } from '../../services/WorkoutPlanService';
import { baseURL } from '../../utils';
import { styles } from './styles';
import UserInfoScreen from './UserInfoScreen';

const OnBoardingScreen = () => {
  const data = null;
  const navigation = useNavigation();
  const navigationRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [currentPage, setCurrentPage] = useState(0);
  const [showQuestionnaire, setShowQuestionnaire] = useState(null);
  const [currentQuestionIndex, setcurrentQuestionIndex] = useState(0);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [userResponses, setUserResponses] = useState({
    fitnessLevel: 2,
    fitnessGoal: '',
    workoutFrequency: 3,
    workoutDuration: 30,
    prefferedWorkoutType: [],
    medicalConditions: false,
    medicalDetails: '',

    age: '',
    height: '',
    weight: '',
    gender: 'female',
  });

  const MAX_WORKOUTS_SELECTIONS = 3;

  const checkQuestionnaireStatus = async () => {
    try {
      const token = await getAuthToken();

      if (!token) {
        return { completed: false };
      }

      const response = await fetch(`${baseURL}/plan/questionnaire-status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }
      const data = await response.json();
      return {
        completed: data.completed || false,
        completed_at: data.completed_at,
      };
    } catch (error) {
      console.error('Error in checkQuestionnairestatus:', error);
      return { completed: false };
    }
  };

  const saveOnBoardingDataToServer = async (userData) => {
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${baseURL}/plan/onboarding`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      console.log('Sending onboardingToServer data: ', userData);

      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving onboarding data to server: ', error);
      return null;
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // const status = await checkQuestionnaireStatus();
        // setHasCompletedQuestionnaire(status.completed);
      } catch (error) {
        console.error('Error checking questionnaire status:', error);
        setHasCompletedQuestionnaire(false);
      }
    };
    checkStatus();
  }, []);

  const updateResponse = (key, value) => {
    const updatedResponses = {
      ...userResponses,
      [key]: value,
    };
    setUserResponses(updatedResponses);

    if (key === 'fitnessLevel') {
      const timer = setTimeout(() => {
        handleNextStep();
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (key === 'fitnessGoal') {
      setUserResponses((prevResponses) => ({
        ...prevResponses,
        [key]: value,
      }));
      // setTimeout(() => {
      //   handleNextStep();
      // }, 400);
      return;
    }

    if (key === 'workoutFrequency') {
      setTimeout(() => {
        handleNextStep();
      }, 400);
      return;
    }
  };

  const safeNavigate = (routeName, params = {}) => {
    setTimeout(() => {
      try {
        if (navigation) {
          navigation.navigate(routeName, params);
        } else {
          console.warn('Navigation not available yet');
        }
      } catch (error) {
        console.error('Navigation error', error);
        Alert.alert('Navigation error', 'Unable to navigate at this time. Please try again', [{ text: 'OK' }]);
      }
    }, 0);
  };

  const toggleWorkoutType = (type) => {
    const currentTypes = [...userResponses.prefferedWorkoutType];
    if (currentTypes.includes(type)) {
      updateResponse(
        'prefferedWorkoutType',
        currentTypes.filter((t) => t != type),
      );
      return;
    }

    if (currentTypes.length >= MAX_WORKOUTS_SELECTIONS) {
      Alert.alert('Maximum Selections', 'You can only select 3 workout types.', [{ text: 'oK' }]);
      return;
    }

    const updatedTypes = [...currentTypes, type];
    updateResponse('prefferedWorkoutType', updatedTypes);

    if (updatedTypes.length === MAX_WORKOUTS_SELECTIONS) {
      setTimeout(() => {
        handleNextStep();
      }, 800);
    }
  };
  const handlePersonalize = () => {
    setShowQuestionnaire(true);
    setCurrentStep(1);
  };

  const animateToNextStep = (nextStep) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 5,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const animateToPrevStep = (prevStep) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 5,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };
  const handleNextStep = async () => {
    console.log('handleNextStep called, currentStep =', currentStep);
    if (currentStep === 3 && !userResponses.fitnessGoal) {
      Alert.alert('Selection required', 'Please select a fitness goal to continue');
      return;
    }
    if (currentStep === 5 && userResponses.prefferedWorkoutType.length === 0) {
      Alert.alert('Selection required', 'Please select at least one workout type to continue');
      return;
    }
    if (showQuestionnaire === false && !hasCompletedQuestionnaire) {
      Alert.alert(
        'Complete Setup Required',
        'To provide you with best exercise, please complete the quick setup to create your personalized workout plan.',
        [
          {
            text: 'Continue Setup',
            onPress: () => {
              setShowQuestionnaire(true);
              setCurrentStep(1);
            },
          },
        ],
      );
      return;
    }
    if (showQuestionnaire === false && hasCompletedQuestionnaire) {
      safeNavigate('LoginScreen');
      return;
    }
    if (currentStep === 7) {
      try {
        await saveOnBoardingData(userResponses);
        setHasCompletedQuestionnaire(true);
        safeNavigate('LoginScreen');
      } catch (error) {
        Alert.alert('Error', 'Failed to save your preferences. Please try again');
        console.error('Error saving onboarding data', error);
      }
      return;
    }

    if (currentStep === 0) {
      if (showQuestionnaire === true) {
        setCurrentStep(1);
      } else {
        setCurrentStep(8);
      }
    } else {
      const nextStep = currentStep + 1;
      animateToNextStep(nextStep);
      setCurrentStep(nextStep);
    }
  };

  useEffect(() => {
    if (currentStep === 8) {
      const timer = setTimeout(() => {
        setCurrentStep(9);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setTimeout(() => {
        animateToPrevStep(prevStep);
      }, 10);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        duration: 3,
        useNativeDriver: true,
      }),
    ]).start();
    navigationRef.current = navigation;
  }, [navigation]);

  const renderDoneButton = ({ ...props }) => {
    return (
      <TouchableOpacity style={styles.nextButton} {...props}>
        <Text style={styles.nextButtonText}>Done</Text>
        <MaterialIcons name="check" size={20} color="white" />
      </TouchableOpacity>
    );
  };

  const SelectionButton = ({ title, selected, onPress, icon }) => (
    <TouchableOpacity style={[styles.selectionButton, selected ? styles.selectedButton : {}]} onPress={onPress}>
      {icon && <MaterialIcons name={icon} size={22} color={selected ? 'white' : '#6200ee'} style={styles.buttonIcon} />}
      <Text style={[styles.selectionButtonText, selected ? styles.selectedButtonText : {}]}>{title}</Text>
    </TouchableOpacity>
  );

  const renderProgressIndicator = () => {
    if (!showQuestionnaire || currentStep === 0 || currentStep === 8) return null;

    const totalSteps = 7;
    const currentProgress = Math.min(currentStep, totalSteps);

    return (
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View key={i} style={[styles.progressDot, i < currentProgress && styles.progressDotActive]} />
        ))}
      </View>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View style={[styles.animationContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <LottieView
              source={require('../../../assets/animations/map_animation.json')}
              autoPlay
              loop
              style={{ width: 450, height: 450 }}
            />

            <View style={styles.textContainer}>
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.appNameText}>FitMap</Text>
              <Text style={styles.welcomeDescription}>
                {hasCompletedQuestionnaire
                  ? 'Welcome back!! You can continue to login or update your preferences.'
                  : 'To provide yoy with the best personalized workout experience, please complete our quick setup.'}
              </Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    setShowQuestionnaire(true);
                    setCurrentStep(1);
                  }}
                >
                  <Text style={styles.optionButtonText}>
                    {hasCompletedQuestionnaire ? 'Update My Preferences' : "Lets's Get Started"}
                  </Text>
                </TouchableOpacity>
                {hasCompletedQuestionnaire && (
                  <TouchableOpacity
                    style={[styles.optionButton, styles.optionButtonSecundary]}
                    onPress={() => {
                      setShowQuestionnaire(false);
                    }}
                  >
                    <Text style={styles.optionButtonSecundary}>Continue to Login</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
            <LottieView
              source={require('../../../assets/animations/ai_animation.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />

            <Text style={styles.stepTitle}>Unlock Your Potential</Text>
            <Text style={styles.stepDescription}>
              Train smarter with AI quidance or connect with personal trainers.Track progress, crush goals, and
              transform your body with science-backed plans
            </Text>

            <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
              <Text style={styles.nextButtonText}>Let's Get Started</Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <LottieView
              source={require('../../../assets/animations/fitness_level_animation.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
            <Text style={styles.questionTitle}>What's your fitness level?</Text>
            <Text style={styles.questionDescription}>Help us understand where you're starting from</Text>

            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={userResponses.fitnessLevel}
                onValueChange={(value) => {
                  updateResponse('fitnessLevel', value);
                }}
                minimumTrackTintColor="#6200ee"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#6200ee"
              />
              <View style={styles.sliderLabelsContainer}>
                <Text style={styles.sliderLabel}>Beginner</Text>
                <Text style={styles.sliderLabel}>Intermediate</Text>
                <Text style={styles.sliderLabel}>Advanced</Text>
              </View>
            </View>

            <Text style={styles.selectedValue}>
              {userResponses.fitnessLevel === 1 && 'Just starting out'}
              {userResponses.fitnessLevel === 2 && 'Occasional exerciser'}
              {userResponses.fitnessLevel === 3 && 'Regular exerciser'}
              {userResponses.fitnessLevel === 4 && 'Fitness enthusiast'}
              {userResponses.fitnessLevel === 5 && 'Advanced athlete'}
            </Text>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <LottieView
              source={require('../../../assets/animations/goals_animation.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
            <Text style={styles.questionTitle}>What's your primary fitness goal?</Text>
            <Text style={styles.questionDescription}>We'll customize your workouts based on this</Text>

            <View style={styles.selectionGrid}>
              <SelectionButton
                title="Lose Weight"
                selected={userResponses.fitnessGoal === 'loseWeight'}
                onPress={() => updateResponse('fitnessGoal', 'loseWeight')}
                icon="whatshot"
              />

              <SelectionButton
                title="Build Muscle"
                selected={userResponses.fitnessGoal === 'buildMuscle'}
                onPress={() => updateResponse('fitnessGoal', 'buildMuscle')}
                icon="fitness-center"
              />

              <SelectionButton
                title="Improve Cardio"
                selected={userResponses.fitnessGoal === 'improveCardio'}
                onPress={() => updateResponse('fitnessGoal', 'improveCardio')}
                icon="directions-run"
              />

              <SelectionButton
                title="Increase Flexibility"
                selected={userResponses.fitnessGoal === 'increaseFlexibility'}
                onPress={() => updateResponse('fitnessGoal', 'increaseFlexibility')}
                icon="accessibility"
              />

              <SelectionButton
                title="General Fitness"
                selected={userResponses.fitnessGoal === 'generalFitness'}
                onPress={() => updateResponse('fitnessGoal', 'generalFitness')}
                icon="favorite"
              />

              <SelectionButton
                title="Athletic Performance"
                selected={userResponses.fitnessGoal === 'athleticPerformance'}
                onPress={() => updateResponse('fitnessGoal', 'athleticPerformance')}
                icon="emoji-events"
              />
            </View>

            {userResponses.fitnessGoal && (
              <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
                <Text style={styles.nextButtonText}>Continue</Text>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            )}
          </Animated.View>
        );
      case 4:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <LottieView
              source={require('../../../assets/animations/calendar_animation.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
            <Text style={styles.questionTitle}>How many days per week can you workout?</Text>
            <Text style={styles.questionDescription}>Be realistic about your availability</Text>

            <View style={styles.circularSelectionContainer}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.circularButton,
                    userResponses.workoutFrequency === day ? styles.selectedCircularButton : {},
                  ]}
                  onPress={() => updateResponse('workoutFrequency', day)}
                >
                  <Text
                    style={[
                      styles.circularButtonText,
                      userResponses.workoutFrequency === day ? styles.selectedCircularButtonText : {},
                    ]}
                  >
                    {day}{' '}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.selectedValue}>
              {userResponses.workoutFrequency === 1
                ? '1 day per week'
                : `${userResponses.workoutFrequency} days per week`}
            </Text>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <LottieView
              source={require('../../../assets/animations/goals_animation.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
            <Text style={styles.questionTitle}>What types of workouts do you enjoy?</Text>
            <Text style={styles.questionDescription}>Select all that apply</Text>

            <ScrollView style={styles.scrollableSections}>
              <View style={styles.selectionGrid}>
                {[
                  { key: 'weightLifting', title: 'Weight Lifting', icon: 'fitness-center' },
                  { key: 'cardio', title: 'Cardio', icon: 'directions-run' },
                  { key: 'yoga', title: 'Yoga', icon: 'self-improvement' },
                  { key: 'hiit', title: 'HIIT', icon: 'whatshot' },
                  { key: 'pilates', title: 'Pilates', icon: 'accessibility-new' },
                  { key: 'bodyweight', title: 'BodyWeight', icon: 'accessibility' },
                  { key: 'outdoorActivities', title: 'Outdoor Activities', icon: 'terrain' },
                  { key: 'sports', title: 'Sports', icon: 'sports-basketball' },
                ].map((item) => (
                  <SelectionButton
                    key={item.key}
                    title={item.title}
                    selected={userResponses.prefferedWorkoutType.includes(item.key)}
                    onPress={() => toggleWorkoutType(item.key)}
                    icon={item.icon}
                    disabled={
                      userResponses.prefferedWorkoutType.length >= MAX_WORKOUTS_SELECTIONS &&
                      !userResponses.prefferedWorkoutType.includes(item.key)
                    }
                  />
                ))}
              </View>
            </ScrollView>
            <Text style={styles.selectedValue}>
              {userResponses.prefferedWorkoutType.length === 0
                ? 'Please select at least one workout type'
                : `${userResponses.prefferedWorkoutType.length}/${MAX_WORKOUTS_SELECTIONS} workout types selected`}
            </Text>
          </Animated.View>
        );
      case 6:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <LottieView
              source={require('../../../assets/animations/medical_animation.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
            <Text style={styles.questionTitle}>Do you have any medical conditions?</Text>
            <Text style={styles.questionDescription}>This helps us create safe workout plans for you</Text>

            <View style={styles.yesNoContainer}>
              <TouchableOpacity
                style={[
                  styles.yesNoButton,
                  userResponses.medicalConditions === false ? styles.selectedYesNoButton : {},
                ]}
                onPress={() => {
                  updateResponse('medicalConditions', false);
                  updateResponse('medicalDetails', '');
                  setTimeout(() => handleNextStep(), 400);
                }}
              >
                <Text
                  style={[
                    styles.yesNoButtonText,
                    userResponses.medicalConditions === false ? styles.selectedYesNoButtonText : {},
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.yesNoButton, userResponses.medicalConditions === true ? styles.selectedYesNoButton : {}]}
                onPress={() => updateResponse('medicalConditions', true)}
              >
                <Text
                  style={[
                    styles.yesNoButtonText,
                    userResponses.medicalConditions === true ? styles.selectedYesNoButtonText : {},
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
            </View>

            {userResponses.medicalConditions && (
              <View style={styles.textInputContainer}>
                <Text style={styles.textInputLabel}>Please specify:</Text>
                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={3}
                  value={userResponses.medicalDetails}
                  onChangeText={(text) => updateResponse('medicalDetails', text)}
                  placeholder="E.g. back pain, knee problems,high blook pressure..."
                />

                <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
                  <Text style={styles.nextButtonText}>Continue</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        );
      case 7:
        return (
          <UserInfoScreen
            userResponses={userResponses}
            updateResponse={updateResponse}
            handleNextStep={handleNextStep}
          />
        );
      case 8:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <ScrollView contentContainerStyle={{ alignItems: 'center' }} showVerticalScrolndicator={false}>
              <LottieView
                source={require('../../../assets/animations/rocket_animation.json')}
                autoPlay
                loop
                style={{ width: 300, height: 300 }}
              />
              <View style={styles.confirmationCard}>
                <Text style={styles.confirmationTitle}>Your plan is Ready!</Text>
                <Text style={styles.conformationDesciption}>
                  Based on your preferences we've created a perosnalized AI workout plan tailored scpecifillay for you
                </Text>

                <View style={styles.planHighlightsContainer}>
                  <View style={styles.infoSection}>
                    <View style={styles.sectionHeader}>
                      <MaterialIcons name="person" size={20} color="#6200ee" />
                      <Text style={styles.sectionTitle}>Personal Profile</Text>
                    </View>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Age</Text>
                        <Text style={styles.infoValue}>{userResponses.age || '25'}</Text>
                      </View>

                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Height</Text>
                        <Text style={styles.infoValue}>{userResponses.height || '170'} cm</Text>
                      </View>

                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Weight</Text>
                        <Text style={styles.infoValue}>{userResponses.weight || 70}</Text>
                      </View>

                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Gender</Text>
                        <Text style={styles.infoValue}>{userResponses.gender === 'male' ? '♂ Male' : '♀ Female'}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.infoSection}>
                    <View style={styles.sectionHeader}>
                      <MaterialIcons name="fitness-center" size={20} color="#6200ee" />
                      <Text style={styles.sectionTitle}>Your Fitness Plan</Text>
                    </View>

                    <View style={styles.highlightItem}>
                      <MaterialIcons name="schedule" size={24} color="#4CAF50" />
                      <Text style={styles.hightlightText}>
                        {userResponses.workoutFrequency} {userResponses.workoutFrequency === 1 ? 'workout' : 'workouts'}{' '}
                        per week
                      </Text>
                    </View>

                    <View style={styles.hightlightItem}>
                      <MaterialIcons name="flag" size={24} color="#FF9800" />
                      <Text style={styles.hightlightText}>
                        Goal:
                        {userResponses.fitnessGoal === 'loseWeight'
                          ? 'Lose weight'
                          : userResponses.fitnessGoal === 'buildMuscle'
                          ? 'Build Muscle'
                          : userResponses.fitnessGoal === 'improveCardio'
                          ? 'Improve Cardio'
                          : userResponses.fitnessGoal === 'increaseFlexibility'
                          ? 'Increase Flexibility'
                          : userResponses.fitnessGoal === 'athleticPerformance'
                          ? 'Athletic Performance'
                          : 'General Fitness'}
                      </Text>
                    </View>

                    <View style={styles.hightlightItem}>
                      <MaterialIcons name="trending-up" size={24} color="#FF9800" />
                      <Text style={styles.hightlightText}>
                        Level:
                        {userResponses.fitnessLevel === 1
                          ? 'Just Starting Out'
                          : userResponses.fitnessLevel === 2
                          ? 'Occasional Exerciser'
                          : userResponses.fitnessGoal === 3
                          ? 'Regular Exerciser'
                          : userResponses.fitnessGoal === 4
                          ? 'Fitness Enhusiast'
                          : 'Advanced Athlete'}
                      </Text>
                    </View>

                    <View style={styles.hightlightItem}>
                      <MaterialIcons name="sports" size={24} color="#2196F3" />
                      <Text style={styles.hightlightText}>
                        Level
                        {userResponses.prefferedWorkoutType
                          .map((type) => {
                            switch (type) {
                              case 'weightLifting':
                                return 'Weights';
                              case 'cardio':
                                return 'Cardio';
                              case 'yoga':
                                return 'Yoga';
                              case 'hiit':
                                return 'HIIT';
                              case 'bodyweight':
                                return 'Bodyweight';
                              case 'outdoorActivities':
                                return 'Outdoor activities';
                              case 'sports':
                                return 'Sports';
                              default:
                                return type;
                            }
                          })
                          .join(' & ')}
                      </Text>
                    </View>

                    {userResponses.medicalConditions && (
                      <View style={styles.highlightItem}>
                        <MaterialIcons name="local-hospital" size={24} color="#F44336" />
                        <Text style={styles.hightlightText}> Medical considerations noted</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.readyBadge}>
                  <MaterialIcons name="rocket-launch" size={28} color="white" />
                  <Text style={styles.readyText}>Ready to Transform!</Text>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        );

      case 9:
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={{ width: 250, height: 250, marginBottom: 20 }}>
              <LottieView
                source={require('../../../assets/animations/target2_animation.json')}
                autoPlay
                loop
                style={{ flex: 1, width: '100%', height: '100%' }}
              />
            </View>
            <Text style={styles.finalTitle}>Ready to Begin?</Text>
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                onPress={() => safeNavigate('LoginScreen')}
              >
                <LottieView
                  source={require('../../../assets/animations/google_animation.json')}
                  autoPlay
                  loop={false}
                  style={styles.socialIconLarge}
                />
                <Text style={styles.socialButtonTextLarge}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.facebookButton]}
                onPress={() => safeNavigate('LoginScreen')}
              >
                <LottieView
                  source={require('../../../assets/animations/facebook_animation.json')}
                  autoPlay
                  loop={false}
                  style={styles.socialIconLarge}
                />
                <Text style={[styles.socialButtonTextLarge, { color: 'white' }]}>Continue with Facebook</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.authOptions}>
              <TouchableOpacity style={styles.largeActionButton} onPress={() => safeNavigate('SignUpScreen')}>
                <Text style={styles.largeActionButtonText}>Sign up with Email</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.loginPrompt}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => safeNavigate('LoginScreen')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  const showBackButton = currentStep > 1 && currentStep < 7;
  return (
    <LinearGradient colors={['#f5f7fa', '#e4e0ff']} style={styles.background}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.container}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={handlePrevStep} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color="#6200ee" />
          </TouchableOpacity>
        )}
        {renderProgressIndicator()}
        {renderStep()}
      </View>
    </LinearGradient>
  );
};

export default OnBoardingScreen;
