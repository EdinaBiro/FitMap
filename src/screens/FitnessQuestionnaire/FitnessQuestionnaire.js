import { StyleSheet, Text, View, Animated, TouchableOpacity} from 'react-native'
import React, {useRef, useEffect} from 'react'
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import Slider from '@react-native-community/slider';
import { updateDevelopmentTeamForPbxproj } from '@expo/config-plugins/build/ios/DevelopmentTeam';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { escape } from 'querystring';
import { LinearGradient } from 'expo-linear-gradient';
import { userInfo } from 'os';

const FitnessQuestionnaire = () => {
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    

    const totalSteps = 0;
    const progress =((currentStep + 1) / totalSteps) * 100;

   

    

   
  

   

    

    const questionScreens =[
    <Animated.View
    style={[styles.questionContainer, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}
    ]}
    key ="fitnessLevel">
        <LottieView soruce={require('../../../assets/animations/fitness_level_animation.json')}
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
        onValueChange={(value) => updateResponse('fitnessLevel', value)}
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
    </Animated.View>,


    <Animated.View
    style={[styles.questionContainer, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}
    ]}
    key ="fitnessGoal">
        <LottieView soruce={require('../../../assets/animations/goals_animation.json')}
        autoPlay
        loop
        style={styles.questionAnimation}/>
    <Text style={styles.questionTitle}>What's your primary fitness goal?</Text>
    <Text style={styles.questionDescription}>We'll customize your workouts based on this</Text>

    <View style={styles.selectionGrid}>
        <SelectionButton
        title="Lose Weight"
        seelcted={userResponses.fitnessGoal === 'loseWeight'}
        onPress={() => updateResponse('fitnessGoal', 'loseWeight')}
        icon="whatshot"
        />

    <SelectionButton
            title="Build Muscle"
            seelcted={userResponses.fitnessGoal === 'buildMuscle'}
            onPress={() => updateResponse('fitnessGoal','buildMuscle')}
            icon="fitness-center"
            />

    <SelectionButton
            title="Improve Cardio"
            seelcted={userResponses.fitnessGoal === 'improveCardio'}
            onPress={() => updateResponse('fitnessGoal', 'improveCardio')}
            icon="directions-run"
            />

    <SelectionButton
            title="Increase Flexibility"
            seelcted={userResponses.fitnessGoal === 'increaseFFlexibility'}
            onPress={() => updateResponse('fitnessGoal', 'increaseFlexibility')}
            icon="accessibility"
            />

<SelectionButton
        title="General Fitness"
        seelcted={userResponses.fitnessGoal === 'generalFitness'}
        onPress={() => updateResponse('fitnessGoal', 'generalFitness')}
        icon="favorite"
        />

<SelectionButton
        title="Athletic Performance"
        seelcted={userResponses.fitnessGoal === 'athleticPerformance'}
        onPress={() => updateResponse('fitnessGoal', 'atheticPerformance')}
        icon="emoji-events"
        />
    </View>
    </Animated.View>,

<Animated.View
style={[styles.questionContainer, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}
]}
key ="workoutFrequency">
    <LottieView soruce={require('../../../assets/animations/calendar_animation.json')}
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
</Animated.View>,


<Animated.View
style={[styles.questionContainer, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}
]}
key ="prefferedWorkoutType">
    
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
            onPres={() => toggleWorkoutType(item.key)}
            icon={item.icon}
            />
        ))}
    </View>
</ScrollView>
<Text style={styles.selectedValue}>
    {userResponses.prefferedWorkoutType.length === 0
        ? "Please select at least one workout type"
        : `${userResponses.prefferedWorkoutType.length} workout types seelcted`}
</Text>

</Animated.View>,

<Animated.View
style={[styles.questionContainer, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}
]}
key ="medicalConditions">
    <LottieView soruce={require('../../../assets/animations/medical_animation.json')}
    autoPlay
    loop
    style={styles.questionAnimation}/>
<Text style={styles.questionTitle}>Do you have any medical conditions?</Text>
<Text style={styles.questionDescription}>This helps us create safe workout plans for you</Text>

<View style={styles.yesNoContainer}>
<TouchableOpacity style={[styles.yesNoButton, userResponses.medicalConditions === false ? styles.selectedYesButton: {}
]}
onPress={() => {
    updateResponse('medicalConditions: ', false);
    updateResponse('medicalDetails', '');
}}
>
    <Text style={[styles.yesNoButtonText, userResponses.medicalConditions === false ? styles.selectedYesNoButtonText : {}

    ]}>No</Text>
</TouchableOpacity>

<TouchableOpacity  style={[styles.yesNoButton, userResponses.medicalConditions === true ? styles.selectedYesNoButton : {}

]}
onPress={() => userResponses('medicalConditions', true)}>
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

    </View>
)}

</Animated.View>,
  
];

  return (
    <LinearGradient
    colors={['#f5f7fa', '#e4e0ff']}
    style={styles.background}>
        <View style={styles.container}>
            <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, {width: `${progress}%`}]}/>

                </View>
                <Text style={styles.progressText}>{currentStep+1}/{totalSteps}</Text>
            </View>

            {questionScreens[currentStep]}

            <View style={styles.navigationContainer}>
                {currentStep > 0 && (
                    <TouchableOpacity style={styles.backButton}
                    onPress={handlePrevStep}>
                    <MaterialIcons name="arrow-back" size={24} color="#6200ee"/>
                    <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNextStep}
                disabled={
                    (currentStep === 1 && !userResponses.fitnessGoal) ||
                    (currentStep ===  4 && userResponses.prefferedWorkoutType.length === 0)
                }>
                    <Text style={styles.nextButtonText}>
                        {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                    </Text>
                    <MaterialIcons name={currentStep === totalSteps -1 ? 'check' : 'arrow-forward'}
                    size ={24}
                    color="white"/>
                </TouchableOpacity>
            </View>
        </View>
    </LinearGradient>
  )
}


const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 30,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    progressBarBackground: {
        flex: 1,
        haight: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        marginRight: 10,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#6200ee',
        borderRadius: 4,
    },
    progressText: {
        color: '#6200ee',
        fontWeight: '600',
        fontSize: 14,
    },
    questionContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%'
    },
    questionAnimation: {
        width: 180,
        height: 180,
        marginBottom: 20,
    }, questionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    }, 
    questionDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
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
        witdh: '100%',
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
        marginTop: 10,
        textAlign: 'center',
    },selectionGrid:{
        flexDirection: 'row', 
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%'
    },
    selectionButton: {
        flexDirection: 'row',
        alignItems: 'center',
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
      },
      circularButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
      },
      selectedCircularButton: {
        backgroundColor: '#6200ee',
        borderColor: '#6200ee',
      },
      circularButtonText: {
        fontWeight: 'bold',
        color: '#333',
      },
      selectedCircularButtonText: {
        color: 'white',
      },
      scrollableSelections: {
        maxHeight: 250,
        width: '100%',
      },
      yesNoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        marginBottom: 30,
      },
      yesNoButton: {
        width: 120,
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
      },
      selectedYesNoButton: {
        backgroundColor: '#6200ee',
        borderColor: '#6200ee',
      },
      yesNoButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
      },
      selectedYesNoButtonText: {
        color: 'white',
      },
      textInputContainer: {
        width: '100%',
        marginBottom: 20,
      },
      textInputLabel: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
      },
      textInput: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        textAlignVertical: 'top',
      },
      navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 20,
      },
      backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
      },
      backButtonText: {
        marginLeft: 5,
        color: '#6200ee',
        fontWeight: '600',
        fontSize: 16,
      },
      nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6200ee',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
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
        marginRight: 5,
      },
})

export default FitnessQuestionnaire;