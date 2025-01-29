import { StyleSheet, Text, View , Button, Platform, PermissionsAndroid, Animated} from 'react-native';
import React, { useState, useEffect, useRef} from 'react';
import { useNavigation, useRoute} from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';


const StartWorkoutScreen = () => {

    const [countDown, setCountdown] = useState(3);
    const [location, setLocation] = useState(null);
    const [distance, setDistance] = useState(0);
    const [calories, setCalories] = useState(0);
    const [pace, setPace] = useState(0);
    const navigation= useNavigation();
    const route = useRoute();
    const {workoutName} = route.params;

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect( () =>{
        if(countDown > 0){
            const timer = setTimeout( () => {
                setCountdown(countDown -1);
                animateCountdown();
                //fadeIn();
            },1000);
            return () => clearTimeout(timer); 
        }else{
            console.log('Workout started');
            startWorkout();
        }
    }, [countDown]);

    const fadeIn = () => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue:1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }

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
            return garnted === PermissionsAndroid.RESULTS.GRANTED;
        }else{
            return true;
        }
    };

    const startWorkout = async () => {
        const hasPermission = await requestLocationPermission();
        if(!hasPermission)
        {
            console.log('Permission to acces location was denied');
            return;
        }

        Geolocation.watchPosition(
            (newLocation) => {
                if(location) {
                    const distanceIncrement = calculateDistance(location.coords, newLocation.coords);
                    setDistance(distance + distanceIncrement);
                    setPace(calculatePace(distance + distanceIncrement));
                }
                setLocation(newLocation);
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
        return distance > 0 ? (distance / (countDown / 60)).toFixed(2) : 0;
    };

    const calculateCalories = (distance) => {
        const weight = 70;
        const caloriesPerKm = 60; //avg calories burned per km
        return (distance * caloriesPerKm).toFixed(2);
    };



  return (
    <View style={styles.container}>
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
            <View>
            <Text style={styles.workoutText}>Workout Started: {workoutName}</Text>
            <Text style={styles.detailsText}>Distance : {distance.toFixed(2)} km</Text>
            <Text style={styles.detailsText}>Pace : {pace} min/km</Text>
            <Text style={styles.detailsText}>Calories : {calories} kcal</Text>

            </View>
        )}
    </View>
  );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
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
})

export default StartWorkoutScreen;