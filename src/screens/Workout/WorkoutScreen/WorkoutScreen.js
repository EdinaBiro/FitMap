import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ImageBackground, ScrollView, Image} from 'react-native';
import React from 'react';
import FastImage from 'react-native-fast-image';
import { useNavigation} from '@react-navigation/native';
import StartWorkoutScreen from '../StartWorkoutScreen';
import Geolocation from 'react-native-geolocation-service';
import GymScreen from '../../GymScreen/GymScreen';



const workouts = [
    {name: 'Gym', image: require('../../../../assets/images/gym.jpg')},
    {name: 'Running', image: require('../../../../assets/images/running.jpg')},
    {name: 'Cycling', image: require('../../../../assets/images/cycling.jpg')},
    {name: 'Walking', image: require('../../../../assets/images/walking.jpg')},
    {name: 'Hiking', image: require('../../../../assets/images/hiking.jpg')},
];

const { width} = Dimensions.get('window');

const WorkoutScreen = () => {

const navigation = useNavigation();

const handleWorkoutPress = (workoutName) => {
    if(workoutName === 'Gym'){
        navigation.navigate('GymScreen');
        return;
    }
    Geolocation.getCurrentPosition(
        (position) => {
            navigation.navigate('StartWorkoutScreen', {workoutName, initialLocation: position.coords});
        },
        (error) => {
            console.log(error);
            navigation.navigate('StartWorkoutScreen', {workoutName, initialLocation: null});
        },
        {enableHighAccuracy: true}
    );
  
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Hey User,</Text>
            <Text style={styles.subTitle}>Choose your workout for today</Text>
        </View>
        {workouts.map((workout, index) => (
           <TouchableOpacity key={index} style={styles.card} onPress={ () => handleWorkoutPress(workout.name)}>
                <ImageBackground source={workout.image} style={styles.cardImage} resizeMode={FastImage.resizeMode.cover}>
                    <Text style={styles.cardText}>{workout.name}</Text>
                </ImageBackground>
            </TouchableOpacity>
     ))}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 30,
    },
    card: {
        width: width-20,
        height: 150,
        borderRadius: 20,
        margonBottom: 15,
        overflow: 'hidden',
        marginBottom: 20,
        marginTop: 10,

    },
    cardImage:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
       

    },
    cardText: {
        fontSize: 24,
        color: '#ffffff',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: {width: 2, height: 2},
        textShadowRadius: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4A5568',
    },
    subTitle: {
        fontSize: 18,
        fontWeight: '600',
        alignSelf: 'flex-start',
        color: '#718096',
     },
     header: {
        alignSelf: 'flex-start',
        marginLeft: 8,
        marginBottom: 10,
     },
    hiddenImage: {
        width: 0,
        height:1,
        opacity:0,
    },
})


export default WorkoutScreen;