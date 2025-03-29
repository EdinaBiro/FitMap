import { Text, View } from 'react-native';
import React from 'react';
import styles from './styles';
import { Ionicons } from '@expo/vector-icons';

const WeatherCard = ({weatherData}) => {
    if(!weatherData) return null;

    const getWeatherIcon = (condition) => {
        const conditionMap = {
            'Clear': 'sunny-outline',
            'Clouds': 'cloud-outline',
            'Rain': 'rainy-outline',
            'Thunderstorm': 'thunderstorm-outline',
            'Snow': 'snow-outline',
            'Mist': 'water-outline',
            'Fog': 'water-outline',
            'Drizzle': 'rainy-outline',
            'Haze': 'water-outline'
        };

        return conditionMap[condition] || 'thermometer-outline';
    }

    const condition = weatherData.weather[0].main;
    const temp = Math.round(weatherData.main.temp);
    const description = weatherData.weather[0].description;

    
  return (
    <View style={styles.container2}>
        <View style={styles.cardHeader}>
            <Ionicons name={getWeatherIcon(condition)} size={24} color="#6200ee"/>
            <Text style={styles.cardTemp}>{temp}°C</Text>
            <Text style={styles.cardDescription}>{description}</Text>
        </View>
     
    </View>
  );
};

export default WeatherCard;

