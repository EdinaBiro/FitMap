import { Text, View } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import styles from './styles';

const WeatherDisplay = ({weatherData}) => {
    if(!weatherData){
        return(
            <View style={[styles.container, {backgroundColor: '#f0f0f0'}]}>
                <Text style={styles.noDataText}>Weather data unavailable</Text>
            </View>
        )
    }
    const getWeatherIcon = (condition) => {
        const conditionMap ={
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

        return conditionMap[condition] || "thermometer-outline";
    };

    const getWeatherBackground = (condition) => {
        const backgroundMap = {
            'Clear': '#89CFF0', 
            'Clouds': '#E6E6FA', 
            'Rain': '#4682B4', 
            'Thunderstorm': '#483D8B', 
            'Snow': '#F0F8FF', 
            'Mist': '#B0C4DE', 
            'Fog': '#B0C4DE', 
    };

    return backgroundMap[condition] || '#89CFF0';
};

const getWeatherDescription = (condition) => {
    const descriptionMap ={
        'Clear': 'Sunny',
        'Clouds': 'Cloudy',
        'Rain': 'Rainy',
        'Thunderstorm': 'Thunderstorm',
        'Snow': 'Snowy',
        'Mist': 'Misty',
        'Fog': 'Foggy',
    };
    return descriptionMap[condition] || condition;
};

const condition = weatherData?.weather?.[0]?.main || 'Clear';
const temp = Math.round(weatherData?.main?.temp || 0);
const description = getWeatherDescription(condition);
const highTemp = Math.round(weatherData?.main?.temp_max || temp);
const lowTemp = Math.round(weatherData?.main?.temp_min || temp);
const cityName= weatherData?.cityName || "San Francisco";

const weekForecast = weatherData.list && Array.isArray(weatherData.list)
    ? weatherData.list.slice(0,5).map((day)=> {
        return {
            day: moment(day.dt * 1000).format('ddd'),
            temp: Math.round(day.main?.temp || 0),
            condition: day.weather?.[0]?.main || 'Clear'
        };
    }) :

    Array(5).fill().map((_, index) => {
        return{
            day: moment().add(index, 'days').format('ddd'),
            temp: temp,
            condition: condition
        };
});

  return (
    <View style={[styles.container, {backgroundColor: getWeatherBackground(condition)}]}>
        <View style={styles.header}>
            <Ionicons name="location" size={24} color="#333"/>
            <Text style={styles.cityName}>{cityName}</Text>
        </View>

        <View style={styles.mainContent}>
            <Ionicons name={getWeatherIcon(condition)} size={100} color="#333" style={styles.weatherIcon}/>
            <Text style={styles.temperature}>{temp}°</Text>
            <Text style={styles.description}>{description}</Text>
            <Text style={styles.tempRange}>H: {highTemp}° L: {lowTemp}°</Text>
        </View>

        <View style={styles.forecastContainer}>
            <Text style={styles.forecastTitle}>5-DAY FORECAST</Text>
            <View style={styles.weekForecast}>
                {weekForecast.map((day, index) => (
                    <View key={index} style={styles.dayForecast}>
                        <Text style={styles.dayText}>{day.day}</Text>
                        <Ionicons name={getWeatherIcon(day.condition)} size={20} color="#333"
                        style={styles.smallWetherIcon}/>
                        <Text style={styles.dayTemp}>{day.temp}°</Text>
                    </View>
                ))}
            </View>
        </View>
    </View>
  );
};

export default WeatherDisplay;

