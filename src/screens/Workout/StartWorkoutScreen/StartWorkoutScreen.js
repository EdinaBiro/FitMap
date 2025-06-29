import {
  StyleSheet,
  Text,
  View,
  Button,
  Platform,
  PermissionsAndroid,
  Animated,
  Alert,
  TouchableOpacity,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import { ScrollView } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import axios from 'axios';
import workoutApi from '../workoutApi';
import { format } from 'date-fns';
import auth from '@react-native-firebase/auth';

const StartWorkoutScreen = () => {
  const [countDown, setCountdown] = useState(3);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [pace, setPace] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { workoutName } = route.params;
  const initialLocation = route.params?.initialLocation;
  const [location, setLocation] = useState(initialLocation ?? null);
  const [locationHistory, setLocationHistory] = useState(initialLocation ? [initialLocation] : []);
  const [isPaused, setIsPaused] = useState(false);
  const [userProfile, setuserProfile] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const formattedDate = format(new Date(), 'yyyy-MM-dd');
  const currentUserId = auth().currentUser?.uid;
  const routeData = route.params?.routeData;

  const [currentWaypointIndex, setcurrentWaypointIndex] = useState(0);
  const [distanceToNextWayPoint, setDistanceToNextWayPoint] = useState(0);
  const [isFollowingRoute, setIsFollowingRoute] = useState(!!routeData);
  const [routeCompletion, setRouteCompletion] = useState(0);
  const [isOffRoute, setIsOffRoute] = useState(false);

  const getRouteWayPoints = () => {
    if (!routeData) return [];
    return routeData.coordinates || [routeData.startCoords, routeData.midCoords, routeData.endCoords];
  };

  const routeWayPoints = getRouteWayPoints();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUserId) {
        try {
          const response = await axios.get(`http://192.168.1.7:8000/profile/user/${currentUserId}`);
          setuserProfile(response.data);
        } catch (error) {
          console.error('Error fetching user profile: ', error);
        }
      }
    };
    fetchUserProfile();
  }, [currentUserId]);

  useEffect(() => {
    if (!location) {
      Geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
          setLocationHistory([position.coords]);
        },
        (error) => console.log(error),
        { enableHighAccuracy: true },
      );
    }
  }, []);

  useEffect(() => {
    if (countDown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countDown - 1);
        animateCountdown();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      startWorkout();
    }
  }, [countDown]);

  useEffect(() => {
    let interval;
    if (isWorkoutActive && !isPaused) {
      interval = setInterval(() => {
        setDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, isPaused]);

  useEffect(() => {
    if (location && isFollowingRoute && routeWayPoints.length > 0) {
      updateRouteProgress(location);
    }
  }, [location, isFollowingRoute, currentWaypointIndex]);

  const animateCountdown = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.5);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          title: 'Location Permission',
          message: 'This app needs access to your location to track your workout',
          buttonNeutral: 'Ask ME Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const startWorkout = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('Permission to acces location was denied');
      return;
    }

    setIsWorkoutActive(true);

    Geolocation.watchPosition(
      (newLocationData) => {
        const newCoords = newLocationData.coords;

        setLocation((prevLocation) => {
          if (prevLocation && !isPaused) {
            const distanceIncrement = calculateDistance(prevLocation, newCoords);
            setDistance((prevDistance) => {
              const newDistance = prevDistance + distanceIncrement;

              setPace(calculatePace(newDistance, duration));
              setCalories(calculateCalories(newDistance));

              return newDistance;
            });
          }

          return newCoords;
        });
        if (!isPaused && newCoords && newCoords.latitude && newCoords.longitude) {
          setLocationHistory((prev) => [...prev, newCoords]);
        }
      },

      {
        enableHighAccuracy: true,
        distanceFilter: 5,
        interval: 1000,
        fastestInterval: 500,
      },
    );
  };

  const updateRouteProgress = (currentLocation) => {
    if (!routeWayPoints.length) return;

    const currentWayPoint = routeWayPoints[currentWaypointIndex];
    if (!currentWayPoint) return;

    const distanceToWaypoint = calculateDistance(currentLocation, currentWayPoint);
    setDistanceToNextWayPoint(distanceToWaypoint);

    if (distanceToWaypoint < 0.05) {
      if (currentWaypointIndex < routeWayPoints.length - 1) {
        setcurrentWaypointIndex(currentWaypointIndex + 1);
        Alert.alert('Waypoint Reached!', 'Great job! Continue to the next waypoint');
      } else {
        setRouteCompletion(100);
        Alert.alert('Route Completed!', "Congratulations! You've completed the route.");
      }
    }
    const distanceFromRoute = getDistanceFromRouteLine(currentLocation);
    setIsOffRoute(distanceFromRoute > 0.1);

    const totalWaypoints = routeWayPoints.length;
    const completedWaypoints = currentWaypointIndex;
    const progressPercentage = Math.min((completedWaypoints / (totalWaypoints - 1)) * 100, 100);
    setRouteCompletion(progressPercentage);
  };

  const getDistanceFromRouteLine = (currentLocation) => {
    if (!routeWayPoints.length) return 0;

    let minDistance = Infinity;
    for (let i = 0; i < routeWayPoints.length - 1; i++) {
      const segmentStart = routeWayPoints[i];
      const segmentEnd = routeWayPoints[i + 1];
      const distanceToSegment = getDistanceToLineSegment(currentLocation, segmentStart, segmentEnd);
      minDistance = Math.min(minDistance, distanceToSegment);
    }

    return minDistance;
  };

  const getDistanceToLineSegment = (point, lineStart, lineEnd) => {
    const A = point.latitude - lineStart.latitude;
    const B = point.longitude - lineStart.longitude;
    const C = lineEnd.latitude - lineStart.latitude;
    const D = lineEnd.longitude - lineStart.longitude;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;
    if (param < 0) {
      xx = lineStart.latitude;
      yy = lineStart.longitude;
    } else if (param > 1) {
      xx = lineEnd.latitude;
      yy = lineEnd.longitude;
    } else {
      xx = lineStart.latitude + param * C;
      yy = lineStart.longitude + param * D;
    }

    return calculateDistance(point, { latitude: xx, longitude: yy });
  };

  const calculateDistance = (startCoords, endCoords) => {
    if (
      !startCoords ||
      !endCoords ||
      startCoords.latitude === undefined ||
      startCoords.longitude === undefined ||
      endCoords.latitude === undefined ||
      endCoords.longitude === undefined
    ) {
      return 0;
    }
    const { latitude: lat1, longitude: lon1 } = startCoords;
    const { latitude: lat2, longitude: lon2 } = endCoords;

    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance / 1000;
  };

  const calculatePace = (distance, currentDuration) => {
    if (distance <= 0 || currentDuration <= 0) return 0;

    const paceValue = currentDuration / 60 / distance;

    return isNaN(paceValue) ? 0 : parseFloat(paceValue.toFixed(2));
  };

  const calculateCalories = (distance) => {
    if (!userProfile || isNaN(distance) || distance <= 0) {
      return 0;
    }

    const { age, gender, weight, height, activity_level } = userProfile;

    const userWeight = weight;
    const userAge = age;
    const userGender = gender;
    const userHeight = height;

    let bmr;
    if (userGender.toLowerCase() === 'male') {
      bmr = 10 * userWeight + 6.25 * userHeight - 5 * userAge + 5;
    } else {
      bmr = 10 * userWeight + 6.25 * userHeight - 5 * userAge - 161;
    }

    const caloriesPerMinRest = bmr / 1440;

    let met;

    const paceMinPerKm = duration / 60 / distance;

    if (paceMinPerKm > 8) {
      met = 4;
    } else if (paceMinPerKm > 5) {
      met = 8;
    } else {
      met = 11;
    }

    const activityFactor = 0.9 + (activity_level || 3) * 0.05;
    met *= activityFactor;

    const durationHours = duration / 3600;
    const caloriesBurned = met * userWeight * durationHours;

    return isNaN(caloriesBurned) ? '0.00' : caloriesBurned.toFixed(2);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleEndWorkout = () => {
    setIsModalVisible(true);
  };

  const confirmEndWorkout = async () => {
    try {
      setIsModalVisible(false);

      const startTime = new Date(Date.now() - duration * 1000);
      const endTime = new Date();

      const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      };

      const workoutData = {
        user_id: currentUserId,
        distance: parseFloat(distance.toFixed(2)),
        calories_burned: parseFloat(calories),
        pace: parseFloat(pace),
        duration: duration,
        workout_name: workoutName,
        workout_date: formattedDate,
        start_time: formatTime(startTime),
        end_time: formatTime(endTime),
        is_completed: true,
      };
      console.log('Workout data being sent:', JSON.stringify(workoutData));

      const savedWorkout = await workoutApi.saveWorkout(workoutData);
      navigation.navigate('HomeScreen', { completedWorkout: savedWorkout });
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout. Please try again', [{ text: 'OK' }]);
      console.error('Error saving workout: ', error.response?.data || error.message);
    }
  };

  const cancelEndWrokout = () => {
    setIsModalVisible(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const isValidLocation = (prevLocation, newLocation) => {
    if (!prevLocation) return true;

    const distance = calculateDistance(prevLocation, newLocation);

    return distance < 0.1;
  };

  const getMapRegion = () => {
    if (location) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  const renderRouteInfo = () => {
    if (!isFollowingRoute || !routeData) return null;

    return (
      <View style={styles.routeInfoContainer}>
        <Text style={styles.routeInfoTitle}>🗺️ Route Progress</Text>
        <View style={styles.routeInfoRow}>
          <Text style={styles.routeInfoText}>
            📍 Waypoint: {currentWaypointIndex + 1}/{routeWayPoints.length}
          </Text>
          <Text style={styles.routeInfoText}>🎯 Distance to next: {(distanceToNextWayPoint * 1000).toFixed(0)}m</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${routeCompletion}%` }]} />
        </View>
        <Text style={styles.progressText}>{routeCompletion.toFixed(0)}% Complete</Text>
        {isOffRoute && <Text style={styles.offRouteText}>⚠️ You're off the planned route!</Text>}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {countDown > 0 ? (
        <Animated.Text style={[styles.countdown, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          {countDown}
        </Animated.Text>
      ) : (
        <>
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: location?.latitude ?? 37.78825,
                longitude: location?.longitude ?? -122.4324,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={true}
              followsUserLocation={true}
            >
              <Polyline coordinates={locationHistory} strokeColor="#6200ee" strokeWidth={3} />

              {isFollowingRoute && routeWayPoints.length > 0 && (
                <Polyline coordinates={routeWayPoints} strokeColor="#FF6B35" strokeWidth={2} lineDashPattern={[5, 5]} />
              )}

              {isFollowingRoute &&
                routeWayPoints.map((waypoint, index) => (
                  <Marker
                    key={index}
                    coordinate={waypoint}
                    title={`Waypoint ${index + 1}`}
                    pinColor={index === 0 ? 'green' : index === routeWayPoints.length - 1 ? 'red' : 'orange'}
                  />
                ))}
            </MapView>

            <View style={styles.infoContainer}>
              <Text style={styles.workoutText}>🏋️‍♂️ Workout Started: {workoutName}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailsText}>⏱ Duration: {formatTime(duration)} </Text>
                <Text style={styles.detailsText}>🏃‍♂️ Distance : {distance.toFixed(2)} km</Text>
                <Text style={styles.detailsText}>⏱ Pace : {pace} min/km</Text>
                <Text style={styles.detailsText}>🔥Calories : {calories} kcal</Text>
              </View>

              {renderRouteInfo()}

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handlePause}>
                  <Text style={styles.buttonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.endButton]} onPress={handleEndWorkout}>
                  <Text style={styles.buttonText}>End Workout</Text>
                </TouchableOpacity>

                <Modal isVisible={isModalVisible} onBackdropPress={cancelEndWrokout}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Confirm End Of Workout</Text>
                    <Text style={styles.modalMessage}>Are you sure you want to end your workout?</Text>
                    <View style={styles.modalButtons}>
                      <TouchableOpacity style={styles.modalCancelButton} onPress={cancelEndWrokout}>
                        <Text style={styles.modalButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmEndWorkout}>
                        <Text style={styles.modalButtonText}>OK</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  countdown: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  workoutText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailsText: {
    fontSize: 18,
    marginTop: 10,
  },
  mapContainer: {
    width: '100%',
    height: '80%',
    flex: 1,
  },
  infoContainer: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  map: {
    width: '100%',
    height: '50%',
    borderWidth: 2,
    borderRadius: 15,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalCancelButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalConfirmButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
});

export default StartWorkoutScreen;
