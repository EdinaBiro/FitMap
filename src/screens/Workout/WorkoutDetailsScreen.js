import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image,Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import Emoji from 'react-native-emoji';
import moment, { duration } from 'moment';
import { Ionicons} from '@expo/vector-icons';
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
    }else if(route.params.workoutId){
      fetchWorkoutDetails(route.params.workoutId);
    }
  }, [workout, workouts, route.params.workoutId]);

  const fetchWorkoutDetails = async (workoutId) => {
    try {
        const response = await axios.get(`${baseURL}/get_workout/${workoutId}`);
        const data = response.data;

        const workoutDetails={
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
          is_completed : data.is_completed || false

        };

        setWorkoutData(workoutDetails);
        setIsPlannedWorkout(!data.is_completed);
    } catch (error) {
      console.error('Error fetching workout details: ', error);
      Alert.alert('Error', 'Failed to load wokrout details');
    }finally{
      setIsLoading(false);
    }
  };

  const handleDeleteWorkout = async () => {
    if (!workoutData || !workoutData.id) return;

    Alert.alert( 
        'Delete workout',
        'Are you sure you want to delete this workout?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try{
                await axios.delete(`${baseURL}/delete_workout/${workoutData.id}`);
                Alert.alert('Success', 'Workout deleted successfully');
                navigation.goBack();
              }catch(error){
                console.error('Error deleting workout:', error);
                Alert.alert('Error', 'Failed to delete wokrout');
              }
            }
          }
        ]
    );
  };

  if (!workoutData) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No workout data available</Text>
      </View>
    );
  }


  return (
    <ScrollView style={styles.container}>

      <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 10}}>
               <Ionicons name="arrow-back-outline" size={30} color="black"/>
          </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.date}>{moment(date).format('dddd, MMMM D, YYYY')}</Text>
        <Text style={styles.workoutName}>{workoutData.name}</Text>
        <Text style={styles.workoutTime}>
          <Emoji name="clock3" style={styles.emoji} /> {workoutData.time}
        </Text>
        <Text style={styles.workoutType}>{workoutData.type}</Text>
      </View>

      {isPlannedWorkout ? (
        <View style={styles.plannedWorkoutContainer}>
          <View style={styles.plannedBadge}>
            <Text style={styles.plannedBadgeText}>Planned Workout</Text>
          </View>

          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{workoutData.notes || 'No notes added'}</Text>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              navigation.navigate('LogWorkout', {
                plannedWorkout: workoutData,
                date: date,
              });
            }}
          >
            <Text style={styles.completeButtonText}>Complete Workout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.completedWorkoutContainer}>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{workoutData.distance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>{workoutData.duration} min</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>{workoutData.calories} kcal</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>{workoutData.pace} min/km</Text>
              <Text style={styles.statLabel}>Pace</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{workoutData.notes || 'No notes added'}</Text>

          {workoutData.image && (
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Workout Photo</Text>
              <Image source={{ uri: workoutData.image }} style={styles.workoutImage} />
            </View>
          )}
        </View>
      )}

      {workouts && workouts.length > 1 && (
        <View style={styles.otherWorkoutsContainer}>
          <Text style={styles.sectionTitle}>Other Workouts Today</Text>
          {workouts
            .filter((w) => w.id !== workoutData.id)
            .map((w, index) => (
              <TouchableOpacity
                key={index}
                style={styles.otherWorkoutItem}
                onPress={() => setWorkoutData(w)}
              >
                <Text style={styles.otherWorkoutTime}>{w.time}</Text>
                <Text style={styles.otherWorkoutName}>{w.name}</Text>
                <Text style={styles.otherWorkoutType}>{w.type}</Text>
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
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  workoutTime: {
    fontSize: 16,
    marginBottom: 10,
  },
  workoutType: {
    fontSize: 16,
    marginBottom: 10,
  },
  plannedWorkoutContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  plannedBadge: {
    backgroundColor: '#ffcc00',
    padding: 5,
    borderRadius: 5,
    marginBottom: 10,
  },
  plannedBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notes: {
    fontSize: 16,
    marginBottom: 20,
  },
  completeButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedWorkoutContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  imageSection: {
    marginBottom: 20,
  },
  workoutImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  otherWorkoutsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  otherWorkoutItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  otherWorkoutTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  otherWorkoutName: {
    fontSize: 16,
  },
  otherWorkoutType: {
    fontSize: 14,
    color: '#666',
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default WorkoutDetailsScreen;