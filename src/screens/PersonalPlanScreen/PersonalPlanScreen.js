import { View, Text, Dimensions, Alert, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { StatusBar } from 'expo-status-bar';
import { generateWorkoutPlan, getWorkoutPlan } from '../../services/WorkoutPlanService';
import { useFocusEffect } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const PersonalPlanScreen = () => {
  const navigation = useNavigation();
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [workoutSessions, setWorkoutSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useFocusEffect(
    React.useCallback(() => {
      loadPersonalPlan();
    }, []),
  );

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

  const loadPersonalPlan = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.replace('LoginScreen');
        return;
      }

      const planData = await getWorkoutPlan();
      setWorkoutPlan(planData.plan);
      setWorkoutSessions(planData.sessions || []);
      setUserInfo(planData.user_info);
    } catch (error) {
      console.error('Error loading personal plan:', error);
      Alert.alert('Error', 'Failed to load your workout plan. Please try again', [
        { text: 'Retry', onPress: loadPersonalPlan },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPersonalPlan();
    setRefreshing(false);
  };

  const getDayName = (dayNumber) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayNumber - 1] || 'Day';
  };

  const getMotivationalMessage = () => {
    const messages = [
      'Every workout brings you closer to your goals! 💪',
      'Consistency is key to success! 🔥',
      'Your future self will thank you! ⭐',
      'Progress, not perfection! 🎯',
      'Stronger than yesterday! 💫',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const startWorkout = (session) => {
    navigation.navigate('WorkoutSessionScreen', {
      sessionId: session.id,
      sessionName: session.session_name,
      exercises: session.exercises || [],
    });
  };

  const generatePlan = async () => {
    try {
      setLoading(true);
      await generateWorkoutPlan();
      await loadPersonalPlan();
      Alert.alert('Success', 'Your workout plan has been regenerated');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate workout plan. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const regeneratePlan = async () => {
    Alert.alert('Regenerate Plan', 'This will create a new workout plan based on your preferences. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Regenerate',
        onPress: async () => {
          try {
            setLoading(true);
            await generateWorkoutPlan();
            await loadPersonalPlan();
            Alert.alert('Success', 'Your workout plan has been regenerated');
          } catch (error) {
            Alert.alert('Error', 'Failed to generate workout plan. Please try again');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderWorkoutCard = (session, index) => {
    const cardDelay = index * 100;
    const cardFadeAnim = useRef(new Animated.Value(0)).current;
    const cardSlideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(cardFadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cardSlideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, cardDelay);
    }, []);

    return (
      <Animated.View
        key={session.id}
        style={[
          styles.workoutCard,
          {
            opacity: cardFadeAnim,
            transform: [{ translateY: cardSlideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#6200ee', '#3799b3']}
          style={styles.workoutCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.workoutCardHeader}>
            <View style={styles.dayInfo}>
              <Text style={styles.dayNumber}>Day {session.day_of_week}</Text>
              <Text style={styles.dayName}>{getDayName(session.day_of_week)}</Text>
            </View>
            <MaterialIcons name="fitness-center" size={24} color="white" />
          </View>
          <Text style={styles.sessionName}>{session.session_name}</Text>

          {session.description && <Text style={styles.sessionDescription}>{session.description}</Text>}

          <View style={styles.sessionStats}>
            <View style={styles.statItem}>
              <MaterialIcons name="schedule" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{session.estimated_duration || 45} min</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="fitness-center" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{session.exercise_count || 0} exercises</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startWorkoutButton} onPress={() => startWorkout(session)} activeOpacity={0.8}>
            <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
            <MaterialIcons name="play-arrow" size={20} color="#6200ee" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <LinearGradient colors={['#f5f7fa', '#e4e0ff']} style={styles.background}>
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../../../assets/animations/loading_animation.json')}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
          <Text style={styles.loadingText}>Loading your personal plan...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e0ff']} style={styles.background}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.welcomeHeader}>
            <Text style={styles.welcomeText}>Your Personal</Text>
            <Text style={styles.planText}>Workout Plan</Text>
            <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
          </View>

          {workoutPlan && (
            <View style={styles.planSummary}>
              <View style={styles.summaryItem}>
                <MaterialIcons name="event" size={20} color="#6200ee" />
                <Text style={styles.summaryText}>{workoutPlan.workout_days_per_week} days/week</Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialIcons name="trending-up" size={20} color="#6200ee" />
                <Text style={styles.summaryText}>{workoutPlan.difficulty_level}</Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialIcons name="psychology" size={20} color="#6200ee" />
                <Text style={styles.summaryText}>AI Generated</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.generateButton} onPress={regeneratePlan}>
            <MaterialIcons name="refresh" size={18} color="#6200ee" />
            <Text style={styles.regenerateButtonText}>Regenerate Plan</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.workoutCardsContainer}>
          {workoutSessions.length > 0 ? (
            workoutSessions.map((session, index) => renderWorkoutCard(session, index))
          ) : (
            <View style={styles.emptyState}>
              <LottieView
                source={require('../../../assets/animations/empty_animation.json')}
                autoPlay
                loop
                style={{ width: 200, height: 200 }}
              />
              <Text style={styles.emptyStateTitle}>No Workouts Yet</Text>
              <Text style={styles.emptyStateText}>Your personalized workout plan will appear here once generated.</Text>

              <TouchableOpacity style={styles.generateButton} onPress={generatePlan}>
                <Text style={styles.generateButtonText}>Generate Plan</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeHeader: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    color: '#333',
    fontWeight: '300',
    marginBottom: 4,
  },
  planText: {
    fontSize: 32,
    color: '#6200ee',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  planSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 10,
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
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  regenerateButtonText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  generateButtonText: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: '600',
  },

  workoutCardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  workoutCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  workoutCardGradient: {
    padding: 20,
    minHeight: 180,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  dayInfo: {
    flex: 1,
  },
  dayNumber: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 2,
  },
  dayName: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },

  sessionName: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 26,
  },
  sessionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 15,
    lineHeight: 20,
  },

  sessionStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 6,
    fontWeight: '500',
  },

  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    minWidth: 140,
  },
  startWorkoutButtonText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 6,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 20,
  },

  '@media (max-width: 350)': {
    welcomeText: {
      fontSize: 20,
    },
    planText: {
      fontSize: 28,
    },
    sessionName: {
      fontSize: 18,
    },
    workoutCard: {
      marginBottom: 15,
    },
    workoutCardGradient: {
      padding: 16,
      minHeight: 160,
    },
  },

  flexRow: {
    flexDirection: 'row',
  },
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCenter: {
    textAlign: 'center',
  },
  marginBottom10: {
    marginBottom: 10,
  },
  marginBottom20: {
    marginBottom: 20,
  },
  paddingHorizontal20: {
    paddingHorizontal: 20,
  },
});

export default PersonalPlanScreen;
