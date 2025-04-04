import { StyleSheet, Text, View, Image, TouchableOpacity, Animated, ScrollView, TextInput, Alert } from 'react-native';
import React, { useEffect, useRef, useState} from 'react';
import { useNavigation, CommonActions} from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Onboarding from 'react-native-onboarding-swiper';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'react-native';


const OnBoardingScreen = () => {
 const navigation = useNavigation();
 const navigationRef= useRef(navigation);
 const fadeAnim = useRef(new Animated.Value(0)).current;
 const scaleAnim = useRef(new Animated.Value(0.8)).current;
 const [currentPage, setCurrentPage] = useState(0);
 const [showQuestionnaire, setShowQuestionnaire] = useState(null);
 const [currentQuestionIndex,setcurrentQuestionIndex] = useState(0);

 const [currentStep, setCurrentStep] = useState(0);
 const [userResponses, setUserResponses] = useState({
         fitnessLevel:2,
         fitnessGoal: '',
         workoutFrequency: 3,
         workoutDuration: 30,
         prefferedWorkoutType: [],
         medicalConditions: false,
         medicalDetails: '',
     });

     const updateResponse = (key, value) => {
      const updatedResponses={
          ...userResponses,
          [key] : value,
      }; 
      setUserResponses(updatedResponses);

      if(key === "fitnessGoal") {
        setTimeout(() => {
          handleNextStep();
        }, 400);
      }else if(key === "workoutFrequency" ){
        setTimeout(() => {
          handleNextStep();
        }, 400);
      }else if( key === "fitnessLevel"){
        setTimeout(() => {
          handleNextStep();
        }, 400);
      }  
  };

  const safeNavigate = (routeName, params ={})=>{
    const nav = navigationRef.current || navigation;

    if(nav && nav.navigate){
      try{
        nav.navigate(routeName,params);
      }catch(error){
        console.error('Navigation error', error);
        Alert.alert("Navigation error",
          "Unable to navigate at this time. Please try again",
          [{ text : 'OK'}]
        );
      }
    }else{
      setTimeout(() => {
        const navRetry = navigationRef.current || navigation;
        if(navRetry && navRetry.navigate){
          try{
                 navRetry.navigate(routeName, params);
          }catch(error){
            console.error('Navigation retry error: ', error);
            Alert.alert(
              "Navigation error",
              "Unable to navigate at this time. Please try again",
              [{ text : 'OK'}]
            );
          }
        }else{
          Alert.alert(
            "Navigation error",
            "Unable to navigate at this time. Please try again",
            [{ text : 'OK'}]
          );
        }
      }, 500);
    }
  };

   const toggleWorkoutType = (type) => {
          const currentTypes =[...userResponses.prefferedWorkoutType];
          if(currentTypes.includes(type)){
              updateResponse('prefferedWorkoutType', currentTypes.filter(t => t!=type));
          }else{
              updateResponse('prefferedWorkoutType', [...currentTypes, type]);
          }
          
      };
      const handlePersonalize = () => {
        setShowQuestionnaire(true);
        setcurrentQuestionIndex(0);
      }


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
  const handleNextStep = () => {
     if(currentStep === 3 && !userResponses.fitnessGoal) {
      Alert.alert("Selection required", "Please select a fitness goal to continue");
      return;
    }else if(currentStep === 5 && userResponses.prefferedWorkoutType.length ===0){
      Alert.alert("Selection required", "Please select at least one workout to continue");
      return;
    }
    if(showQuestionnaire === false){
      safeNavigate('LoginScreen');
      return;
    }
    if(showQuestionnaire && currentStep === 6){
      safeNavigate('LoginScreen', {userResponses});
      return;
    }

    
    if(currentStep === 0){
      if(showQuestionnaire === true){
        setCurrentStep(1);
      }else{
        setCurrentStep(7);
      }
    }else{
       const nextStep = currentStep + 1;
      animateToNextStep(nextStep);
      setCurrentStep(nextStep);
    }
 };

 const handlePrevStep = () => {
  if(currentStep > 0){
      animateToPrevStep(currentStep - 1);
      setCurrentStep(currentStep - 1);
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
  },[navigation]);

 const renderDoneButton =({...props}) => {
  return(
    <TouchableOpacity style={styles.nextButton} {...props}>
      <Text style={styles.nextButtonText}>Done</Text>
      <MaterialIcons name="check" size={20} color="white"/>
    </TouchableOpacity>
  );
 };

 const SelectionButton = ({ title, selected, onPress, icon}) => (
         <TouchableOpacity style={[styles.selectionButton, selected ? styles.selectedButton : {}]}
         onPress={onPress}>
             {icon && <MaterialIcons name={icon} size={22} color={selected ? "white" : '#6200ee'} style={styles.buttonIcon}/>}
             <Text style={[styles.selectionButtonText, selected ? styles.selectedButtonText : {}]}>{title}</Text>
         </TouchableOpacity>
     );

  const renderProgressIndicator = () =>{
    if(!showQuestionnaire || currentStep === 0 || currentStep === 7) return null;

    const totalSteps = 6;
    const currentProgress = Math.min(currentStep, totalSteps);

    return(
      <View style={styles.progressContainer}>
        {Array.from({length: totalSteps}, (_,i) => (
          <View key={i} style={[styles.progressDot,
            i< currentProgress && styles.progressDotActive 
          ]}
          />
        ))}
      </View>
    );
  };


  const renderStep = () => {
    switch(currentStep){
      case 0:
            return(
                    <Animated.View style={[styles.animationContainer, {opacity: fadeAnim, transform: [{scale: scaleAnim}]}]}>
                        <LottieView
                            source={require('../../../assets/animations/map_animation.json')}
                            autoPlay
                            loop
                            style={{width: 450, height: 450}}
                        />
                
                <View style={styles.textContainer}>
                    <Text style={styles.welcomeText}>Welcome to</Text>
                    <Text style={styles.appNameText}>FitMap</Text>
                    <Text style={styles.welcomeDescription}>
                      Would you like to answer a few questions to get a personalized workout plan?
                    </Text>
                    <View style={styles.optionsContainer}>
                      <TouchableOpacity style={styles.optionButton} 
                        onPress={() =>{ setShowQuestionnaire(true); setTimeout(() => {setCurrentStep(1);},50)}}>
                          <Text style={styles.optionButtonText}>Yes, personalize my plan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                        style={[styles.optionButton, styles.optionButtonSecundary]}
                        onPress={() => {setShowQuestionnaire(false); safeNavigate('LoginScreen'); }}>
                          <Text style={styles.optionButtonSecundary}>Skip for now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                </Animated.View>
            
                );
                
             case 1: 
             return(
              <Animated.View style={[styles.stepContainer,{opacity: fadeAnim, transform: [{scale: fadeAnim}]}]}>
                    <LottieView
                    source={require('../../../assets/animations/ai_animation.json')}
                    autoPlay
                    loop
                    style={{width: 300, height: 300}}
                    />

                  <Text style={styles.stepTitle}>Unlock Your Potential</Text>
                  <Text style={styles.stepDescription}>Train smarter with AI quidance or connect with personal trainers.\n\nTrack progress, crush goals, and transform your body with science-backed plans</Text>

                  <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
                    <Text style={styles.nextButtonText}>Let's Get Started</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="white"/>
                  </TouchableOpacity>
              </Animated.View>
             );

             case 2:
                return(
                <Animated.View style={[styles.stepContainer, {opacity: fadeAnim, transform: [{scale:scaleAnim}]}]}>
                   <LottieView source={require('../../../assets/animations/fitness_level_animation.json')}
                          autoPlay
                          loop
                          style={styles.questionAnimation}/>
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
                            console.log("Slider value changed:", value);
                            updateResponse('fitnessLevel', value);
                          }}
                          minimumTrackTintColor="#6200ee"
                          maximumTrackTintColor="#e0e0e0"
                          thumbTintColor="#6200ee"/>
                          <View style={styles.sliderLabelsContainer}>
                              <Text style={styles.sliderLabel}>Beginner</Text>
                              <Text style={styles.sliderLabel}>Intermediate</Text>
                              <Text style={styles.sliderLabel}>Advanced</Text>
                          </View>
                      </View>
                  
                      <Text style={styles.selectedValue}>
                          {userResponses.fitnessLevel === 1 && "Just starting out"}
                          {userResponses.fitnessLevel === 2 && "Occasional exerciser"}
                          {userResponses.fitnessLevel === 3 && "Regular exerciser"}
                          {userResponses.fitnessLevel === 4 && "Fitness enthusiast"}
                          {userResponses.fitnessLevel === 5 && "Advanced athlete"}
                  
                      </Text>
                </Animated.View>
              );

              case 3:
                return (
                <Animated.View style={[styles.stepContainer, {opacity: fadeAnim, transform: [{scale:scaleAnim}]}]}>
                     <LottieView source={require('../../../assets/animations/goals_animation.json')}
                            autoPlay
                            loop
                            style={styles.questionAnimation}/>
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
                                onPress={() => updateResponse('fitnessGoal','buildMuscle')}
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
                </Animated.View>
              );
            case 4:
              return(
                <Animated.View style={[styles.stepContainer, {opacity: fadeAnim, transform: [{scale:scaleAnim}]}]}>
                    <LottieView source={require('../../../assets/animations/calendar_animation.json')}
                      autoPlay
                      loop
                      style={styles.questionAnimation}/>
                  <Text style={styles.questionTitle}>How many days per week can you workout?</Text>
                  <Text style={styles.questionDescription}>Be realistic about your availability</Text>
                  
                  <View style={styles.circularSelectionContainer}>
                      {[1,2,3,4,5,6,7].map((day) => (
                          <TouchableOpacity key={day} style={[styles.circularButton, 
                              userResponses.workoutFrequency === day ? styles.selectedCircularButton : {}
                          ]}
                          onPress={() => updateResponse('workoutFrequency', day)}
                          >
                              <Text style={[styles.circularButtonText, userResponses.workoutFrequency === day ? styles.selectedCircularButtonText : {}
                              ]}
                              >{day} </Text>
                  
                          </TouchableOpacity>
                      ))}
                  </View>
                  
                  <Text style={styles.selectedValue}>
                      {userResponses.workoutFrequency === 1 ? "1 day per week" : `${userResponses.workoutFrequency} days per week`}
                  </Text>
                </Animated.View>
              );
            
            case 5:
             return(
                <Animated.View style={[styles.stepContainer, {opacity: fadeAnim, transform: [{scale:scaleAnim}]}]}>
                  <Text style={styles.questionTitle}>What types of workouts do you enjoy?</Text>
                  <Text style={styles.questionDescription}>Select all that apply</Text>
                  
                  <ScrollView style={styles.scrollableSections}>
                      <View style={styles.selectionGrid}>
                          {[
                              {key : 'weightLifting', title: 'Weight Lifting',icon: 'fitness-center' },
                              {key : 'cardio', title: 'Cardio',icon: 'directions-run' },
                              {key : 'yoga', title: 'Yoga',icon: 'self-improvement' },
                              {key : 'hiit', title: 'HIIT',icon: 'whatshot' },
                              {key : 'pilates', title: 'Pilates',icon: 'accessibility-new' },   
                              {key : 'bodyweight', title: 'BodyWeight',icon: 'accessibility' },
                              {key : 'outdoorActivities', title: 'Outdoor Activities',icon: 'terrain' },
                              {key : 'sports', title: 'Sports',icon: 'sports-basketball' },
                          ].map(item => (
                              <SelectionButton key={item.key}
                              title={item.title}
                              selected={userResponses.prefferedWorkoutType.includes(item.key)}
                              onPress={() => toggleWorkoutType(item.key)}
                              icon={item.icon}
                              />
                          ))}
                      </View>
                  </ScrollView>
                  <Text style={styles.selectedValue}>
                      {userResponses.prefferedWorkoutType.length === 0
                          ? "Please select at least one workout type"
                          : `${userResponses.prefferedWorkoutType.length} workout types selected`}
                  </Text>
                  <TouchableOpacity style={[styles.nextButton, userResponses.prefferedWorkoutType === 0] ? styles.disabledButton: {}}
                    onPress={handleNextStep} disabled={userResponses.prefferedWorkoutType.length === 0}>
                    <Text style={styles.nextButtonText}>Finish</Text>
                    <MaterialIcons name="check" size={20} color="white"/>
                  </TouchableOpacity>
                </Animated.View>
              );
            case 6:
            return(
                <Animated.View style={[styles.stepContainer, {opacity: fadeAnim, transform: [{scale:scaleAnim}]}]}>
                  <LottieView source={require('../../../assets/animations/medical_animation.json')}
                      autoPlay
                      loop
                      style={styles.questionAnimation}/>
                  <Text style={styles.questionTitle}>Do you have any medical conditions?</Text>
                  <Text style={styles.questionDescription}>This helps us create safe workout plans for you</Text>
                  
                  <View style={styles.yesNoContainer}>
                  <TouchableOpacity style={[styles.yesNoButton, userResponses.medicalConditions === false ? styles.selectedYesButton: {}
                  ]}
                  onPress={() => {
                      updateResponse('medicalConditions',false);
                      updateResponse('medicalDetails', '');
                      setTimeout(() => handleNextStep(), 400);
                  }}
                  >
                      <Text style={[styles.yesNoButtonText, userResponses.medicalConditions === false ? styles.selectedYesNoButtonText : {}
                  
                      ]}>No</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity  style={[styles.yesNoButton, userResponses.medicalConditions === true ? styles.selectedYesNoButton : {}
                  
                  ]}
                  onPress={() => updateResponse('medicalConditions', true)}>
                  <Text style={[styles.yesNoButtonText, userResponses.medicalConditions === true ? styles.selectedYesNoButtonText : {}
                  ]}>Yes</Text>
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
                          placeholder='E.g. back pain, knee problems,high blook pressure...' />
                  
                        <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
                          <Text style={styles.nextButtonText}>Continue</Text>
                          <MaterialIcons name="arrow-forward" size={20} color="white"/>
                        </TouchableOpacity>
                      </View>
                    )}
                </Animated.View>
              );
            case 7:
                return(
                  <Animated.View style={[styles.stepContainer, {opacity: fadeAnim, transform: [{scale:scaleAnim}]}]}>
                    <Text style={styles.finalTitle}>Ready to Begin?</Text>
                    <View style={styles.socialButtonsContainer}>
                      
                      <TouchableOpacity style={[styles.socialButton, styles.googleButton]}
                        onPress={() => safeNavigate('LoginScreen')}>
                         <LottieView
                            source={require('../../../assets/animations/google_animation.json')}
                            autoPlay
                            loop={false}
                            style={styles.socialIconLarge}
                          />                          
                          <Text style={styles.socialButtonTextLarge}>Continue with Google</Text>

                          </TouchableOpacity>
        
            
                            <TouchableOpacity style={[styles.socialButton,styles.facebookButton]}
                            onPress={() => safeNavigate('LoginScreen')}>
                          <LottieView
                            source={require('../../../assets/animations/facebook_animation.json')}
                            autoPlay
                            loop={false}
                            style={styles.socialIconLarge}
                          />
                          <Text style={[styles.socialButtonTextLarge, {color: 'white'}]}>Continue with Facebook</Text>
                          </TouchableOpacity>
                          </View> 

              
                    
                    <View style={styles.authOptions}>
                      <TouchableOpacity
                        style={styles.largeActionButton}
                        onPress={() => safeNavigate('SignUpScreen')}
                      >
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
      return(
          <LinearGradient colors={['#f5f7fa', '#e4e0ff']}
            style={styles.background}>
            <StatusBar barStyle="dark-content" backgroundColor='transparent' translucent/>
          
            <View style={styles.container}>
              {showBackButton && (
              <TouchableOpacity style={styles.backButton} onPress={handlePrevStep} activeOpacity={0.7}>
                <MaterialIcons name='arrow-back' size={24} color="#6200ee"/>
              </TouchableOpacity>
              )}
              {renderProgressIndicator()}
              {renderStep()}
            </View>
            </LinearGradient>
        );
};


const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 80,
    paddingTop: 40,
  },
  animation: {
    width: 300,
    height: 300,
  },
  animationSmall: {
    width: 250,
    height: 250,
  },
  questionAnimation: {
    width: 180,
    height: 180,
    marginBottom: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#333',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  appNameText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    marginBottom:20,
  },
  questionnaireOptions: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  questionnairePrompt: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  optionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  optionButtonTextSecondary: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6200ee',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 10,
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  questionDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingVertical: 5,
    borderRadius: 10,
  },
  sliderContainer: {
    width: '100%',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
  },
  sliderLabel: {
    color: '#666',
    fontSize: 14,
  },
  selectedValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedButton: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  buttonIcon: {
    marginRight: 8,
  },
  selectionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedButtonText: {
    color: 'white',
  },
  circularSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  circularButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    margin: 6,
  },
  selectedCircularButton: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  circularButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedCircularButtonText: {
    color: 'white',
  },
  scrollableSelections: {
    maxHeight: 300,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    shadowOpacity: 0.1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#6200ee',
    borderRadius: 5,
  },
  socialButtonsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  facebookButton: {
    backgroundColor: '#1877f2',
    borderColor: '#1877f2',
  },
  googleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  socialIconLarge: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  socialButtonTextLarge: {
    fontSize: 16,
    fontWeight: '600',
  },
  finalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 40,
    textAlign: 'center',
  },
  authOptions: {
    width: '100%',
  },
  largeActionButton: {
    backgroundColor: '#6200ee',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  largeActionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#757575',
    fontSize: 16
  },
  optionButtonSecundary:{
    backgroundColor: 'transparent',
    borderColor: '#6200ee',
    color: '#6200ee',
  },
  questionsContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  questionItem: {
    marginBottom: 15,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  navButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  lottieAnimation: {
    width: 150,
    height: 150,
    alignSelf: 'center',
  },

});

export default OnBoardingScreen;