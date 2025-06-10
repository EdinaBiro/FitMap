import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import Emoji from 'react-native-emoji';
import moment, { duration } from 'moment';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { baseURL } from '../../utils';

const WorkoutDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { date, workouts, workout } = route.params;
  const [isPlannedWorkout, setIsPlannedWorkout] = useState(false);
  const [workoutData, setWorkoutData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (workout) {
      setWorkoutData(workout);
      setIsPlannedWorkout(!workout.is_completed);
    } else if (workouts && workouts.length > 0) {
      setWorkoutData(workouts[0]);
      setIsPlannedWorkout(!workouts[0].is_completed);
    } else if (route.params.workoutId) {
      fetchWorkoutDetails(route.params.workoutId);
    }
  }, [workout, workouts, route.params.workoutId]);

  const fetchWorkoutDetails = async (workoutId) => {
    try {
      const response = await axios.get(`${baseURL}/get_workout/${workoutId}`);
      const data = response.data;

      const workoutDetails = {
        id: data.workout_id.toString(),
        name: data.workout_name,
        time: moment(data.workout_date).format('HH:mm'),
        distance: data.distance || 0,
        duration: data.duration || 0,
        calories: data.calories_burned || 0,
        pace: data.pace || 0,
        date: moment(data.workout_date).format('YYYY-MM-DD'),
        start_time: data.start_time,
        end_time: data.end_time,
        is_completed: data.is_completed || false,
      };

      setWorkoutData(workoutDetails);
      setIsPlannedWorkout(!data.is_completed);
    } catch (error) {
      console.error('Error fetching workout details: ', error);
      Alert.alert('Error', 'Failed to load workout details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkout = async () => {
    if (!workoutData || !workoutData.id) return;

    Alert.alert('Delete workout', 'Are you sure you want to delete this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${baseURL}/delete_workout/${workoutData.id}`);
            Alert.alert('Success', 'Workout deleted successfully');
            navigation.goBack();
          } catch (error) {
            console.error('Error deleting workout:', error);
            Alert.alert('Error', 'Failed to delete workout');
          }
        },
      },
    ]);
  };

  if (!workoutData) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="fitness-center" size={64} color="#ddd" />
        <Text style={styles.noDataText}>No workout data available</Text>
      </View>
    );
  }

  const getWorkoutIcon = (workoutName) => {
    const name = workoutName?.toLowerCase() || '';
    if (name.includes('run') || name.includes('jog')) return 'directions-run';
    if (name.includes('bike') || name.includes('cycle')) return 'directions-bike';
    if (name.includes('swim')) return 'pool';
    if (name.includes('walk')) return 'directions-walk';
    return 'fitness-center';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteWorkout} style={styles.deleteButton}>
          <MaterialIcons name="delete-outline" size={24} color="#ff4757" />
        </TouchableOpacity>
      </View>

      <View style={styles.headerCard}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{moment(date).format('dddd')}</Text>
          <Text style={styles.fullDateText}>{moment(date).format('MMMM D, YYYY')}</Text>
        </View>

        <View style={styles.workoutHeader}>
          <View style={styles.workoutIconContainer}>
            <MaterialIcons
              name={getWorkoutIcon(workoutData.name)}
              size={32}
              color={isPlannedWorkout ? '#ffa726' : '#4caf50'}
            />
          </View>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutName}>{workoutData.name}</Text>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.workoutTime}>{workoutData.time}</Text>
            </View>
          </View>
          {isPlannedWorkout ? (
            <View style={styles.plannedBadge}>
              <Text style={styles.plannedBadgeText}>Planned</Text>
            </View>
          ) : (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
            </View>
          )}
        </View>
      </View>

      {isPlannedWorkout ? (
        <View style={styles.plannedWorkoutCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="schedule" size={24} color="#ffa726" />
            <Text style={styles.sectionTitle}>Upcoming Workout</Text>
          </View>

          <Text style={styles.sectionSubtitle}>Notes</Text>
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>{workoutData.notes || 'No notes added for this workout'}</Text>
          </View>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              navigation.navigate('LogWorkout', {
                plannedWorkout: workoutData,
                date: date,
              });
            }}
          >
            <MaterialIcons name="play-arrow" size={24} color="white" />
            <Text style={styles.completeButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.completedWorkoutCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="check-circle" size={24} color="#4caf50" />
            <Text style={styles.sectionTitle}>Workout Complete</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="straighten" size={20} color="#2196f3" />
              </View>
              <Text style={styles.statValue}>{workoutData.distance}</Text>
              <Text style={styles.statUnit}>km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="timer" size={20} color="#ff9800" />
              </View>
              <Text style={styles.statValue}>{workoutData.duration}</Text>
              <Text style={styles.statUnit}>min</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="local-fire-department" size={20} color="#f44336" />
              </View>
              <Text style={styles.statValue}>{workoutData.calories}</Text>
              <Text style={styles.statUnit}>kcal</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="speed" size={20} color="#9c27b0" />
              </View>
              <Text style={styles.statValue}>{workoutData.pace}</Text>
              <Text style={styles.statUnit}>min/km</Text>
              <Text style={styles.statLabel}>Pace</Text>
            </View>
          </View>

          <View style={styles.notesSection}>
            <Text style={styles.sectionSubtitle}>Notes</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{workoutData.notes || 'No notes added for this workout'}</Text>
            </View>
          </View>

          {workoutData.image && (
            <View style={styles.imageSection}>
              <Text style={styles.sectionSubtitle}>Workout Photo</Text>
              <View style={styles.imageContainer}>
                <Image source={{ uri: workoutData.image }} style={styles.workoutImage} />
              </View>
            </View>
          )}
        </View>
      )}

      {workouts && workouts.length > 1 && (
        <View style={styles.otherWorkoutsCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="list" size={24} color="#607d8b" />
            <Text style={styles.sectionTitle}>Other Workouts Today</Text>
          </View>

          {workouts
            .filter((w) => w.id !== workoutData.id)
            .map((w, index) => (
              <TouchableOpacity
                key={index}
                style={styles.otherWorkoutItem}
                onPress={() => setWorkoutData(w)}
                activeOpacity={0.7}
              >
                <View style={styles.otherWorkoutIconContainer}>
                  <MaterialIcons
                    name={getWorkoutIcon(w.name)}
                    size={24}
                    color={!w.is_completed ? '#ffa726' : '#4caf50'}
                  />
                </View>
                <View style={styles.otherWorkoutInfo}>
                  <Text style={styles.otherWorkoutName}>{w.name}</Text>
                  <Text style={styles.otherWorkoutTime}>{w.time}</Text>
                </View>
                <View style={styles.otherWorkoutStatus}>
                  {!w.is_completed ? (
                    <View style={styles.plannedDot} />
                  ) : (
                    <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
  },
  headerCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dateContainer: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  fullDateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutTime: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  plannedBadge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffa726',
  },
  plannedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f57c00',
  },
  completedBadge: {
    padding: 4,
  },
  plannedWorkoutCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completedWorkoutCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  completeButton: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: -4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  notesSection: {
    marginBottom: 24,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  workoutImage: {
    width: '100%',
    height: 200,
  },
  otherWorkoutsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  otherWorkoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  otherWorkoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  otherWorkoutInfo: {
    flex: 1,
  },
  otherWorkoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  otherWorkoutTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  otherWorkoutStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plannedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffa726',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default WorkoutDetailsScreen;
