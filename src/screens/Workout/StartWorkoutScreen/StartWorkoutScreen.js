import { StyleSheet, Text, View , Button, Platform, PermissionsAndroid, Animated, Alert, TouchableOpacity} from 'react-native';
import React, { useState, useEffect, useRef} from 'react';
import { useNavigation, useRoute} from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import MapView, {Polyline} from 'react-native-maps';
import { isDynamicPart } from 'expo-router/build/fork/getPathFromState-forks';
import { ScrollView } from 'react-native-gesture-handler';
import  Modal from 'react-native-modal';


const StartWorkoutScreen = () => {

    const [countDown, setCountdown] = useState(3);
    const [distance, setDistance] = useState(0);
    const [calories, setCalories] = useState(0);
    const [pace, setPace] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const navigation= useNavigation();
    const route = useRoute();
    const {workoutName} = route.params;
    const initialLocation = route.params?.initialLocation;
    const [location, setLocation] = useState(initialLocation ?? null);
    const [locationHistory, setLocationHistory] = useState(initialLocation ? [initialLocation] : []);
    const [isPaused, setIsPaused] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if(!location){
            Geolocation.getCurrentPosition(
                (position) => {
                    setLocation(position.coords);
                    setLocationHistory([position.coords]);
                },
                (error) => console.log(error),
                {enableHighAccuracy: true}
            );
           
        }
    }, []);

    useEffect( () =>{
        if(countDown > 0){
            const timer = setTimeout( () => {
                setCountdown(countDown -1);
                animateCountdown();
            },1000);
            return () => clearTimeout(timer); 
        }else{
            startWorkout();
        }
    }, [countDown]);

    useEffect(() => {
        let interval;
        if(isWorkoutActive && !isPaused){
            interval = setInterval(() => {
                setDuration(prevDuration => prevDuration +1); 
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isWorkoutActive, isPaused]);


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
                toValue:1,
                friction: 2,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const requestLocationPermission = async () => {
    try{
        if(Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'This app needs access to your location to track your workout',
                    buttonNeutral: 'Ask ME Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;}
        }catch(err){
            console.warn(err);
            return false;
        }
        
    };

    const startWorkout = async () => {
        const hasPermission = await requestLocationPermission();
        if(!hasPermission)
        {
            console.log('Permission to acces location was denied');
            return;
        }

        setIsWorkoutActive(true);

        Geolocation.watchPosition(
            (newLocation) => {
                setLocation((prevLocation) => {
                    if(prevLocation){
                        const distanceIncrement = calculateDistance(prevLocation, newLocation.coords);
                        setDistance((prevDistance) => prevDistance + distanceIncrement);
                        setPace(calculatePace(distance + distanceIncrement));
                        setCalories(calculateCalories(distance + distanceIncrement));
                    }
                    return newLocation?.coords ?? prevLocation;
                });

                setLocationHistory((prev) => [...prev, newLocation.coords]);
              
                    
                },
            
            (error) => {
                console.log(error);
            },
            {
                enableHighAccuracy: true,
                distanceFilter: 1,
                interval: 1000,
                fastestInterval: 500,
            }
            
        );
    };

    const calculateDistance = (startCoords, endCoords) => {
        const { latitude: lat1, longitude: lon1 } = startCoords;
        const { latitude: lat2, longitude: lon2 } = endCoords;

        const R = 6371e3; // metres
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // in metres
        return distance / 1000; // in kilometers
    };

    const calculatePace = (distance) => {
        return distance > 0  && distance > 0 ? ((duration / distance) / 60).toFixed(2) : 0;
    };

    const calculateCalories = (distance) => {
        const weight = 70;
        const caloriesPerKm = 60; //avg calories burned per km
        return (distance * caloriesPerKm).toFixed(2);
    };

    const handlePause = () => {
        setIsPaused(!isPaused);
    };

    const handleEndWorkout = () => {
       setIsModalVisible(true);
    };
       

    const confirmEndWorkout = () => {
        setIsModalVisible(false);
        navigation.navigate('HomeScreen');
    };

    const cancelEndWrokout = () => {
        setIsModalVisible(false);

    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds/60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
    
        {countDown > 0 ? (
            <Animated.Text 
                style={[
                    styles.countdown,
                    {opacity: fadeAnim, transform: [{scale: scaleAnim }]},
                ]} 
                >
                    {countDown}
                </Animated.Text>
    
        ) : (
            <>
            <View style={styles.mapContainer}>
                <MapView style={styles.map}
                    initialRegion={{
                        latitude: location?.latitude ??  37.78825,
                        longitude: location?.longitude ?? -122.4324,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }} >
                        <Polyline
                            coordinates={locationHistory}
                            strokeColor='#6200ee'
                            strokeWidth={3}/>
                    </MapView>
            <View style={styles.infoContainer}>
            <Text style={styles.workoutText}>🏋️‍♂️ Workout Started: {workoutName}</Text>
            <View style={styles.detailRow}>
            <Text style={styles.detailsText}>⏱ Duration: {formatTime(duration)} </Text>
            <Text style={styles.detailsText}>🏃‍♂️ Distance : {distance.toFixed(2)} km</Text>
            <Text style={styles.detailsText}>⏱ Pace : {pace} min/km</Text>
            <Text style={styles.detailsText}>🔥Calories : {calories} kcal</Text>
            </View>


            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handlePause}>
                    <Text style={styles.buttonText}>{isPaused ? "Resume" : "Pause" }</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.endButton]} onPress={handleEndWorkout}>
                    <Text style={styles.buttonText}>End Workout</Text>
                </TouchableOpacity>

                <Modal isVisible={isModalVisible} onBackdropPress ={cancelEndWrokout}>
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
    buttonContainer:{
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
        backgroundColor: "#007AFF",
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
    modalContent:{
        backgroundColor: '#fff',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalTitle:{
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
        backgroundColor: "#ccc",
        padding: 12,
        borderRadius: 8,
        width: '40%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalConfirmButton: {
        backgroundColor: '#6200ee',
        padding: 12,
        borderRadius: 8,
        width: '40%',
        alignItems:'center',
    }

});

export default StartWorkoutScreen;