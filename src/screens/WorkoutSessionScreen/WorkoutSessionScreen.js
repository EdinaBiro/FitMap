import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ExerciseCard = ({ exercise, index }) => {
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = index * 150;
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, []);

  const getExerciseIcon = (exerciseName) => {
    const name = exerciseName.toLowerCase();
    if (name.includes('push') || name.includes('bench')) return 'fitness-center';
    if (name.includes('squat') || name.includes('leg')) return 'directions-run';
    if (name.includes('pull') || name.includes('row')) return 'keyboard-arrow-up';
    if (name.includes('curl') || name.includes('bicep')) return 'sports-gymnastics';
    if (name.includes('press') || name.includes('shoulder')) return 'sports-handball';
    if (name.includes('deadlift')) return 'trending-up';
    return 'fitness-center';
  };

  const getDifficultyColor = (sets, reps) => {
    const totalVolume = sets * (typeof reps === 'string' ? parseInt(reps.split('-')[0]) : reps);
    if (totalVolume > 40) return '#ff6b6b';
    if (totalVolume > 25) return '#ffa726';
    return '#66bb6a';
  };

  return (
    <Animated.View
      style={[
        styles.exerciseCard,
        {
          opacity: cardFadeAnim,
          transform: [{ translateY: cardSlideAnim }],
        },
      ]}
    >
      <View style={styles.exerciseCardContent}>
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseIconContainer}>
            <MaterialIcons name={getExerciseIcon(exercise.name)} size={24} color="#6200ee" />
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            {exercise.muscle_group && <Text style={styles.muscleGroup}>{exercise.muscle_group}</Text>}
          </View>
          <View
            style={[styles.difficultyIndicator, { backgroundColor: getDifficultyColor(exercise.sets, exercise.reps) }]}
          />
        </View>

        <View style={styles.exerciseDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="repeat" size={16} color="#666" />
            <Text style={styles.detailText}>{exercise.sets} sets</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="fitness" size={16} color="#666" />
            <Text style={styles.detailText}>{exercise.reps} reps</Text>
          </View>
          {exercise.rest_time && (
            <View style={styles.detailItem}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.detailText}>{exercise.rest_time}s rest</Text>
            </View>
          )}
        </View>

        {exercise.instructions && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Instructions:</Text>
            <Text style={styles.instructionsText}>{exercise.instructions}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

const ProgressBar = ({ progress, color = '#6200ee' }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBackground}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: color,
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
    </View>
  );
};

const WorkoutSessionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { session } = route.params;

  const [currentExercise, setCurrentExercise] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const exercises = session.exercises || [];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getDayName = (dayNumber) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayNumber - 1] || 'Day';
  };

  const calculateTotalSets = () => {
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return 0;
    }
    return exercises.reduce((total, exercise) => {
      if (!exercise || typeof exercise.sets === 'undefined') {
        return total;
      }
      const sets = typeof exercise.sets === 'number' ? exercise.sets : parseInt(exercise.sets) || 0;
      return total + sets;
    }, 0);
  };

  const calculateEstimatedCalories = () => {
    const baseCalories = (session.estimated_duration || 45) * 8;
    return Math.round(baseCalories);
  };

  const startWorkout = () => {
    navigation.navigate('WorkoutSessionScreen', {
      sessionId: session.id,
      sessionName: session.session_name,
      exercises: session.exercises || [],
    });
  };

  const getDifficultyProgress = () => {
    const totalSets = calculateTotalSets();
    if (totalSets > 20) return 85;
    if (totalSets > 15) return 65;
    if (totalSets > 10) return 45;
    return 25;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={['#6200ee', '#3799b3']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.headerInfo,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.dayText}>
              Day {session.day_of_week} • {getDayName(session.day_of_week)}
            </Text>
            <Text style={styles.sessionTitle}>{session.session_name}</Text>
            {session.description && <Text style={styles.sessionDescription}>{session.description}</Text>}
          </Animated.View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <StatCard icon="schedule" label="Duration" value={`${session.estimated_duration || 45}m`} color="#ff6b6b" />
          <StatCard icon="fitness-center" label="Exercises" value={session.exercises?.length || 0} color="#4ecdc4" />
          <StatCard icon="whatshot" label="Calories" value={calculateEstimatedCalories()} color="#ffa726" />
          <StatCard icon="trending-up" label="Total Sets" value={calculateTotalSets()} color="#66bb6a" />
        </View>

        {/* Difficulty Progress */}
        <View style={styles.difficultySection}>
          <Text style={styles.sectionTitle}>Workout Intensity</Text>
          <ProgressBar progress={getDifficultyProgress()} color="#6200ee" />
        </View>

        {/* Workout Visualization */}
        <View style={styles.visualSection}>
          <Text style={styles.sectionTitle}>Workout Overview</Text>
          <View style={styles.workoutVisual}>
            {/* <LottieView
              source={require('../../../assets/animations/workout_animation.json')}
              autoPlay
              loop
              style={styles.workoutAnimation}
            /> */}
            <View style={styles.workoutSummary}>
              <Text style={styles.summaryTitle}>Ready to crush this workout?</Text>
              <Text style={styles.summaryText}>
                This {session.estimated_duration || 45}-minute session will target multiple muscle groups with{' '}
                {session.exercises?.length || 0} carefully selected exercises.
              </Text>
            </View>
          </View>
        </View>

        {/* Exercises List */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercises ({session.exercises?.length || 0})</Text>
          {session.exercises && session.exercises.length > 0 ? (
            session.exercises.map((exercise, index) => (
              <ExerciseCard key={exercise.id || index} exercise={exercise} index={index} />
            ))
          ) : (
            <View style={styles.noExercises}>
              <MaterialIcons name="fitness-center" size={48} color="#ccc" />
              <Text style={styles.noExercisesText}>No exercises available</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Start Workout Button */}
      <View style={styles.startButtonContainer}>
        <TouchableOpacity style={styles.startButton} onPress={startWorkout} activeOpacity={0.8}>
          <LinearGradient
            colors={['#6200ee', '#3799b3']}
            style={styles.startButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialIcons name="play-arrow" size={24} color="white" />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 8,
    marginRight: 15,
    marginTop: 5,
  },
  headerInfo: {
    flex: 1,
  },
  dayText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 5,
  },
  sessionTitle: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 34,
  },
  sessionDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  difficultySection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6200ee',
    minWidth: 35,
  },
  visualSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutVisual: {
    alignItems: 'center',
  },
  workoutAnimation: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  workoutSummary: {
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  exercisesSection: {
    marginBottom: 100,
  },
  exerciseCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseCardContent: {
    padding: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  muscleGroup: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  difficultyIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  exerciseDetails: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noExercises: {
    alignItems: 'center',
    padding: 40,
  },
  noExercisesText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  startButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default WorkoutSessionScreen;
