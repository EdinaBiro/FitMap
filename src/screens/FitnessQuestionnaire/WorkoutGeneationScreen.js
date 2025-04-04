import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { MaterialIcons } from '@expo/vector-icons';

const WorkoutGeneationScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {userResponses} = route.params;
    const [generationStep, setGenerationStep] = useState(0);

    const generationSteps =[
        "Analyzing your fitness profile...",
        "Calculaction optimal workout intesnity...",
        "Selecting exercises based on your preferences...",
        "Building your personalized workout plan...",
        "Finalizing your fitness journey..."
    ];

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setGenerationStep(prev => {
                if(prev < generationStep.length -1 ){
                    return prev+1;
                }else{
                    clearInterval(stepInterval);
                    setTimeout(() => {
                        navigation.navigate('WorkoutPlanScreen', {userResponses});
                    }, 1500);
                    return prev;
                }  
            });
        }, 1500);

        return () => clearInterval(stepInterval);
    }, []);


    const generateWorkoutWithAI = async (userData) => {

    }
  return (
   <LinearGradient
   colors={['#f5f7fa', '#e4e0ff']}
   style={styles.animationContainer}>
    <View style={styles.animationContainer}>
    <LottieView
    source={require('../../../assets/animations/taget_animation.json')}
    autoPlay
    loop
    style={styles.animation}
    />
    </View>

    <Text style={styles.title}>Creating Your Custom Workout</Text>
    <Text style={styles.subtitle}>Our AI is building the perfect plan for you</Text>

    <View style={styles.stepsContainer}>
        {generationSteps.map((step, index) => (
            <View key ={index} style={styles.stepRow}>
                {index <= generationStep ? (
                    <View style={styles.stepActiveIndicator}>
                        {index < generationStep ? (
                            <MaterialIcons name="check" sie={16} color="white"/>
                        ) : (
                            <ActivityIndicator size="small" color="white"/>
                        )}
                        </View>
                ):(
                    <View style={styles.stepInactiveIndicator}/>
                )}
                <Text style={[styles.stepText, index <= generationStep ? styles.stepTextActive: {}]} >
                    {step}
                </Text>
            </View>
        ))}
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

export default WorkoutGeneationScreen;