import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import {GEMINI_API_KEY} from '@env';
import { ConfigError } from 'expo/config';

const GenerateWorkoutPlan = async (userResponses) => {
    const {fitnessLevel, fitnessGoal, workoutFrequency, prefferedWorkoutType,userAge,userWeight, userHeight, healtCondition, timeAvailable} = userResponses;

    try{
      const aiResponse = await getAIWorkoutRecommendations(userResponses);
      if(aiResponse && aiResponse.workouts){
        return{
          workout: aiResponse.workouts,
          recommendations: aiResponse.recommendations,
          planDetails: aiResponse.planDetails,
          aiGenerated: true,
        };
      }
    }catch(error){
      console.error("AI workout generation failed, falling back to the template-based approach", error);
    }

    const getIntesity = () => {
      switch(fitnessLevel){
        case 1: return "Low";
        case 2: return "Low to moderate";
        case 3: return "Moderate";
        case 4: return "Moderate to high";
        case 5: return "High";
        case 6: return "Moderate";
      }
    };

    const getDuration = () => {
      const baseMinutes = 30;
      const addtionioalMinutes = (fitnessLevel -1 ) * 5;
      return baseMinutes + addtionioalMinutes;
    };

    const generateWorkoutsFromPreferences = () => {
      const workouts = [];
      const intesity = getIntesity();
      const duration = getDuration();

      const workoutOptions = {
        weightLifting: [
          {
            title: 'Upper Body Strength',
            description: 'Focus on chest, shoulders, and arms for optial upper body development',
            exercises: [
              { name: 'Bench Press', sets: fitnessLevel >= 3 ? 4 : 3, reps: fitnessLevel >= 4 ? '8-10' : '10-12' },
              { name: 'Shoulder Press', sets: 3, reps: '10-12' },
              { name: 'Bicep Curls', sets: 3, reps: '10-15' },
              { name: 'Tricep Extensions', sets: 3, reps: '10-15' },
              { name: 'Lat Pulldown', sets: 3, reps: '10-12' },
            ],
            duration: duration,
            intesity: intesity,
            //image:
          },
          {
            title: 'Full Body Strength',
            description: 'Comprehensive workout targeting all major muscle groups',
            exercises: [
              { name: 'Deadlifts', sets: 3, reps: fitnessLevel >= 4 ? '6-8' : '8-10' },
              { name: 'Pull ups/Assisted Pull-ups', sets: 3, reps: 'As many as possible' },
              { name: 'Push ups', sets: 3, reps: 'As many as possible' },
              { name: 'Dumbbel Rows', sets: 3, reps: '10-12' },
              { name: 'Overhead Press', sets: 3, reps: '8-10' },
            ],
            duration: duration,
            intesity: intesity,
            //image:
          },
        ],
        cardio: [
          {
            title: 'Endurance Run',
            description: 'Build cardiovascular endurance with steady-state-running',
            exercises: [
              { name: 'Warm-up', duration: '5 minutes', description: 'Light jog or brisk walk' },
              {
                name: 'Steady-State-Run',
                duration: `${Math.floor(duration * 0.7)} minutes`,
                description: `Maintain ${
                  fitnessLevel >= 4 ? '70-80%' : fitnessLevel >= 2 ? '60-70%' : '50-60%'
                } of max heart-rate`,
              },
              { name: 'Cool down', duration: '5 minutes', description: 'Light jog or brisk walk' },
              { name: 'Stretching', duration: '5 minutes', description: 'Focus on leg and hip stretches' },
            ],
            duration: duration,
            intesity: intesity,
            //image:
          },
          {
            title: 'Interval Training',
            description: 'Improve cardiovascular fitness and burn calories efficiently',
            exercises: [
              { name: 'Warm-up', duration: '5 minutes', description: 'Lig carido to increase heart rate' },
              {
                name: 'Interval Training',
                repeat: fitnessLevel >= 4 ? 8 : fitnessLevel >= 2 ? 6 : 4,
                description: '30 seconds high intesity, 90 seconds recovery',
              },
              { name: 'Cool down', duration: '5 minutes', description: 'Light cardio to gradually reduce heart rate' },
              { name: 'Stretching', duration: '5 minutes', description: 'Full body stretching' },
            ],
            duration: duration,
            intesity: intesity,
            //image:
          },
        ],
        yoga: [
          {
            title: 'Morning Flow',
            description: 'Energize your day with this revitalizing yoga sequence',
            exercises: [
              { name: "Child's Pose", duration: '2 minutes' },
              { name: 'Cat-Cow Stretch', duration: '2 minutes' },
              { name: 'Downward Dog', duration: '1 minute' },
              { name: 'Sun Salutations', repeat: fitnessLevel >= 3 ? 5 : 3, description: 'Complete sequence' },
              { name: 'Warrior Sequence', duration: '5 minutes' },
              { name: 'Balance Poses', duration: '5 minutes' },
              { name: 'Final Relaxation', duration: '5 minutes' },
            ],
            duration: duration,
            intensity: 'Low to Moderate',
            //image: 'yoga_morning',
          },
          {
            title: 'Strength & Flexibility',
            description: 'Build strength while improving flexibility',
            exercises: [
              { name: 'Warm-up Poses', duration: '5 minutes' },
              { name: 'Standing Poses', duration: '10 minutes' },
              { name: 'Core Strengthening', duration: '10 minutes' },
              { name: 'Hip Openers', duration: '5 minutes' },
              { name: 'Final Relaxation', duration: '5 minutes' },
            ],
            duration: duration,
            intensity: fitnessLevel >= 4 ? 'Moderate' : 'Low to Moderate',
           // image: 'yoga_strength',
          },
        ],
        hiit: [
          {
            title: 'HIIT Burner',
            description: 'Intense interval training to maximize calorie burn',
            exercises: [
              { name: 'Warm-up', duration: '3 minutes' },
              { name: 'Burpees', duration: '30 seconds', rest: '15 seconds' },
              { name: 'Mountain Climbers', duration: '30 seconds', rest: '15 seconds' },
              { name: 'Jump Squats', duration: '30 seconds', rest: '15 seconds' },
              { name: 'Push-ups', duration: '30 seconds', rest: '15 seconds' },
              { name: 'High Knees', duration: '30 seconds', rest: '15 seconds' },
              { name: 'Rest', duration: '1 minute' },
              { name: 'Repeat circuit', repeat: fitnessLevel >= 4 ? 4 : fitnessLevel >= 2 ? 3 : 2 },
            ],
            duration: fitnessLevel >= 4 ? 35 : fitnessLevel >= 2 ? 30 : 25,
            intensity: 'High',
           // image: 'hiit_burner',
          },
          {
            title: 'Tabata Challenge',
            description: '20 seconds work, 10 seconds rest for maximum efficiency',
            exercises: [
              { name: 'Warm-up', duration: '5 minutes' },
              { name: 'Squats', duration: '20 seconds', rest: '10 seconds', repeat: 8 },
              { name: 'Rest', duration: '1 minute' },
              { name: 'Push-ups', duration: '20 seconds', rest: '10 seconds', repeat: 8 },
              { name: 'Rest', duration: '1 minute' },
              { name: 'Sit-ups', duration: '20 seconds', rest: '10 seconds', repeat: 8 },
              { name: 'Rest', duration: '1 minute' },
              { name: 'Burpees', duration: '20 seconds', rest: '10 seconds', repeat: 8 },
              { name: 'Cool Down', duration: '5 minutes' },
            ],
            duration: fitnessLevel >= 4 ? 35 : 30,
            intensity: 'Very High',
           // image: 'hiit_tabata',
          },
        ],
        pilates: [
          {
            title: 'Core Pilates',
            description: 'Strengthen your core and improve posture',
            exercises: [
              { name: 'Breathing Exercise', duration: '3 minutes' },
              { name: 'The Hundred', sets: 1, reps: fitnessLevel >= 3 ? '100 pumps' : '50 pumps' },
              { name: 'Roll Up', sets: 3, reps: '10' },
              { name: 'Single Leg Circles', sets: 2, reps: '10 each leg' },
              { name: 'Rolling Like a Ball', sets: 2, reps: '10' },
              { name: 'Single Leg Stretch', sets: 2, reps: '10 each leg' },
              { name: 'Double Leg Stretch', sets: 2, reps: '10' },
            ],
            duration: duration,
            intensity: fitnessLevel >= 4 ? 'Moderate' : 'Low to Moderate',
           // image: 'pilates_core',
          },
        ],
        bodyweight: [
          {
            title: 'Bodyweight Circuit',
            description: 'Effective strength training using just your body weight',
            exercises: [
              { name: 'Push-ups', sets: 3, reps: fitnessLevel >= 4 ? '15-20' : fitnessLevel >= 2 ? '10-15' : '5-10' },
              { name: 'Squats', sets: 3, reps: '15-20' },
              {
                name: 'Plank',
                sets: 3,
                duration: fitnessLevel >= 4 ? '60 seconds' : fitnessLevel >= 2 ? '45 seconds' : '30 seconds',
              },
              { name: 'Lunges', sets: 3, reps: '12 each leg' },
              { name: 'Mountain Climbers', sets: 3, duration: '30 seconds' },
              { name: 'Burpees', sets: 3, reps: fitnessLevel >= 4 ? '15' : fitnessLevel >= 2 ? '10' : '5' },
            ],
            duration: duration,
            intensity: intensity,
            //image: 'bodyweight_circuit',
          },
          {
            title: 'Calisthenics Basics',
            description: 'Build functional strength and body control',
            exercises: [
              { name: 'Pull-ups/Assisted Pull-ups', sets: 3, reps: 'As many as possible' },
              { name: 'Dips', sets: 3, reps: 'As many as possible' },
              { name: 'Pike Push-ups', sets: 3, reps: '10-15' },
              { name: 'Pistol Squats/Assisted Pistol Squats', sets: 3, reps: '5-10 each leg' },
              { name: 'L-Sit/Tucked L-Sit', sets: 3, duration: 'As long as possible' },
            ],
            duration: duration,
            intensity: 'Moderate to High',
            //image: 'bodyweight_calisthenics',
          },
        ],
        outdoorActivities: [
          {
            title: 'Trail Adventure',
            description: 'Connect with nature while getting a great workout',
            exercises: [
              { name: 'Hiking/Trail Running', duration: `${duration - 10} minutes` },
              {
                name: 'Outdoor Bodyweight Circuit',
                description:
                  'Find a scenic spot and perform: 20 squats, 10 push-ups, 30-second plank, 20 jumping jacks',
                repeat: 3,
              },
            ],
            duration: duration,
            intensity: intensity,
            //image: 'outdoor_trail',
          },
        ],
        sports: [
          {
            title: 'Sports Conditioning',
            description: 'Improve athletic performance for your favorite sports',
            exercises: [
              { name: 'Dynamic Warm-up', duration: '5 minutes' },
              { name: 'Agility Ladder Drills', duration: '5 minutes' },
              {
                name: 'Plyometric Exercises',
                duration: '10 minutes',
                description: 'Jump squats, box jumps, lateral jumps',
              },
              { name: 'Sport-Specific Drills', duration: '15 minutes' },
              { name: 'Cool Down', duration: '5 minutes' },
            ],
            duration: duration,
            intensity: intensity,
            //image: 'sports_conditioning',
          },
        ],
      };

      const prefferredTypes = prefferedWorkoutType.length > 0 ? prefferedWorkoutType: ['cardio', 'bodyweight'];

      for (let day = 1; day <= workoutFrequency; day++){
        const typeIndex = (day - 1) % prefferredTypes.length;
        const workoutType = prefferredTypes[typeIndex];

        const availableWorkouts = workoutOptions[workoutType] || [];

        if(availableWorkouts.length > 0){
          let selectedWorkoutIndex = 0;
          if(fitnessGoal === 'loseWeight'){
            selectedWorkoutIndex = availableWorkouts.findIndex(w => w.intesity.includes('High')) !== -1 ?
            availableWorkouts.findIndex(w => w.intesity.includes("High")) : 0;
          }else if(fitnessGoal === 'buildMuscle'){
            selectedWorkoutIndex = workoutType === 'weightLifting' ? 0 : 0;
          }else if(fitnessGoal === 'improveCardio'){
            selectedWorkoutIndex = workoutType === 'cardio' || workoutType === 'hiit' ? 0 : 0;
          }else{
            selectedWorkoutIndex = day % availableWorkouts.length;
          }

          const selectedWorkout = { ...availableWorkouts[selectedWorkoutIndex]};

          selectedWorkout.day = day;
          selectedWorkout.workoutType = workoutType;

          workouts.push(selectedWorkout);
        }
      }
      return workouts;
    };

     const generateRecommendations = () => {
       const recommendations = {
         general: [
           'Stay hydrated before, during, and after workouts',
           'Get 7-9 hours of sleep for optimal recovery',
           'Consider your nutrition as important as your workouts',
         ],
       };

       switch (fitnessGoal) {
         case 'loseWeight':
           recommendations.specific = [
             'Focus on creating a calorie deficit through diet and exercise',
             'Incorporate both cardio and strength training for optimal fat loss',
             'Monitor your progress with measurements rather than just the scale',
           ];
           break;
         case 'buildMuscle':
           recommendations.specific = [
             "Ensure you're in a slight calorie surplus",
             'Consume sufficient protein (1.6-2.2g per kg of bodyweight)',
             'Progressive overload is key - gradually increase weights or reps',
           ];
           break;
         case 'improveCardio':
           recommendations.specific = [
             'Mix high intensity and steady state cardio for best results',
             "Track your heart rate to ensure you're training at the right intensity",
             'Gradually increase duration and intensity over time',
           ];
           break;
         case 'increaseFlexibility':
           recommendations.specific = [
             'Hold static stretches for 30-60 seconds',
             'Practice flexibility work when muscles are warm',
             'Be consistent - daily practice yields better results than occasional sessions',
           ];
           break;
         case 'generalFitness':
           recommendations.specific = [
             'Balance your training across strength, cardio, and flexibility',
             'Find activities you enjoy to maintain long-term consistency',
             "Don't be afraid to try new workout styles and methods",
           ];
           break;
         case 'athleticPerformance':
           recommendations.specific = [
             'Include sport-specific training alongside general fitness work',
             'Periodize your training to peak for important events/seasons',
             'Recovery is as important as training for performance',
           ];
           break;
         default:
           recommendations.specific = [
             'Set SMART goals to track your progress',
             'Find a workout buddy or community for accountability',
             'Balance your training with adequate recovery',
           ];
       }

       return recommendations;
     };

     return{
      workouts: generateWorkoutsFromPreferences(),
      recommendations: generateRecommendations(),
      planDetails: {
        fitnessLeve: fitnessLevel,
        fitnessGoal: fitnessGoal,
        workoutFrequency: workoutFrequency,
        intesity: getIntesity(),
        averageDuration: getDuration()
      },
      aiGenerated: false
     };
  
    async function getAIWorkoutRecommendations(userResponses) {
       const {
         fitnessLevel,
         fitnessGoal,
         workoutFrequency,
         prefferedWorkoutType,
         userAge,
         userWeight,
         userHeight,
         healtCondition,
         timeAvailable,
       } = userResponses;

       const apiKey = GEMINI_API_KEY;

       const prompt = `
        Create a personalized workout plan with the following parameters:
        -Fitness level: ${fitnessLevel}/5 (where 1 is beginner, 5 is advanced)
        -Fitness goal: ${fitnessGoal}
        -Workout frequency: ${workoutFrequency} days per week
        -Preffered workout types: ${prefferedWorkoutType.join(', ')}
        ${userAge ? `-Age ${userAge}` : ``}
        ${userWeight ? `-Weight ${userWeight}kg` : ``}
        ${userHeight ? `-Age ${userHeight}` : ``}
        ${healthConditions ? `-Healt conditions to consider: ${healthConditions}` : ``}
        ${timeAvailable ? `-Available time per session ${timeAvailable} minutes` : ``}

        Format the response as a JSON object with these properties:
        1.workouts: An array of workout objects, each with:
          -title: The name of the workout
          -description: Brief description
          -workoutType: The category( e.g cardio, weightLifting)
          -day: Which day of the week(number)
          -duration: Minutes of the workout
          -intesity: Text description of intensity
          -exercises: Array of exercise objects with name, sets, reps, duration, rest, etc.
          -image: An image identifier (from these options:weightlifting_upper, weightlifting_lower, weightlifting_full, cardio_running, cardio_interval, cardio_mix, yoga_morning, yoga_strength, hiit_burner, hiit_tabata, pilates_core, bodyweight_circuit, bodyweight_calisthenics, outdoor_trail, sports_conditioning )
        2.recommendations: An object with:
          -general: Attay of general fitness recommendations
          -specific: Array of goal-specific recommendations

        3.planDetails: Object with summary stats(fitnessLevel, fitnessGoal, workoutFrequency, intesity, averageDration)
        
        Make this plan truly personalized based on all the data provided. Include varied exercises, appropiate rest periods and realistic progression
       `;
       try{
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
          {
            content: [{parts: [{text: prompt}]}],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192
            }
          }
        );

        const geminiResponse = response.data;
        if(geminiResponse.candidates && geminiResponse.candidates.length > 0){
          const content = geminiResponse.candidates[0].contentl
          if(content && content.parts && content.parts.length > 0){
            const textResponse = content.parts[0].text;
            const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || textResponse.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : textResponse;

            try{
              const workoutPlan = JSON.parse(jsonString);
              return workoutPlan;
            }catch(jsonError){
              console.error("Failed to parse Ai response as JSON: ", jsonError);
              throw new Error("Invalid response format from Ai");
            }
          }
        }
        throw new Error("No valid response from Gemini AI");
       }catch(error)
       {
        console.error("Error getting AI workout recommendations:", error);
        throw error;
       }

    }
};


const styles = StyleSheet.create({
    background: {
        flex: 1,
      },
      container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        alignItems: 'center',
        justifyContent: 'center',
      },
      animationContainer: {
        width: 200,
        height: 200,
        marginBottom: 20,
      },
      animation: {
        width: '100%',
        height: '100%',
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
      },
      subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
      },
      stepsContainer: {
        width: '100%',
        marginBottom: 40,
      },
      stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
      },
      stepActiveIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#6200ee',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      },
      stepInactiveIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#e0e0e0',
      },
})

export default GenerateWorkoutPlan;