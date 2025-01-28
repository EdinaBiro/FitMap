import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ImageBackground} from 'react-native';
import React from 'react';

const workouts = [
    {name: 'Running', image: require('../../../assets/images/running.jpg')},
    {name: 'Cycling', image: require('../../../assets/images/cycling.jpg')},
    {name: 'Walking', image: require('../../../assets/images/walking.jpg')},
    {name: 'Hiking', image: require('../../../assets/images/hiking.jpg')},
];

const { width} = Dimensions.get('window');

const WorkoutScreen = () => {
  return (
    <View style={styles.container}>
        {workouts.map((workout, index) => (
            <TouchableOpacity key={index} style={styles.card}>
                <ImageBackground soruce={workout.image} style={styles.cardImage}>
                    <Text style={styles.cardText}>{workout.name}</Text>
                </ImageBackground>
            </TouchableOpacity>
     ))}
    </View>
  );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    card: {
        width: width-20,
        height: 150,
        borderRadius: 10,
        margonBottom: 15,
        overflow: 'hidden',
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
})


export default WorkoutScreen;