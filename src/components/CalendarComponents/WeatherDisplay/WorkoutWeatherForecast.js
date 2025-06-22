import { StyleSheet, Text, View, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

const { width } = Dimensions.get('window');

const WorkoutWeatherForecast = ({ weatherData, selectedHour, onHourSelect }) => {
  const [selectedHourData, setSelectedHourData] = useState(null);

  useEffect(() => {
    if (weatherData && weatherData.hourly) {
      const hourData = weatherData.hourly.find((h) => {
        const hourNum = new Date(h.dt * 1000).getHours();
        return hourNum === selectedHour;
      });

      setSelectedHourData(hourData || weatherData.hourly[0]);
    }
  }, [weatherData, selectedHour]);

  if (!weatherData || !weatherData.hourly) {
    return (
      <View style={styles.weatherErrorContainer}>
        <Ionicons name="cloud-outline" size={40} color="#6200ee" />
        <Text style={styles.weatherText}>Weather forecast unavailable</Text>
      </View>
    );
  }

  const getWeatherIcon = (condition) => {
    const conditionMap = {
      Clear: 'sunny-outline',
      Clouds: 'cloud-outline',
      Rain: 'rainy-outline',
      Thunderstorm: 'thunderstorm-outline',
      Snow: 'snow-outline',
      Mist: 'water-outline',
      Fog: 'water-outline',
      Drizzle: 'rainy-outline',
      Haze: 'water-outline',
    };

    return conditionMap[condition] || 'thermometer-outline';
  };

  const getWeatherColor = (condition) => {
    const baseColor = {
      Clear: '#89CFF0',
      Clouds: '#E6E6FA',
      Rain: '#4682B4',
      Thunderstorm: '#483D8B',
      Snow: '#F0F8FF',
      Mist: '#B0C4DE',
      Fog: '#B0C4DE',
      Drizzle: '#87CEEB',
      Haze: '#D3D3D3',
    };
    return baseColor[condition] || '#89CFF0';
  };

  const getWeatherBackground = (condition) => {
    const mainColor = getWeatherColor(condition);
    return (
      {
        Clear: `linear-gradient(to bottom, ${mainColor}, #87CEFA)`,
        Clouds: `linear-gradient(to bottom, ${mainColor}, #F0F8FF)`,
        Rain: `linear-gradient(to bottom, ${mainColor}, #1A3C5B)`,
        Thunderstorm: `linear-gradient(to bottom, ${mainColor}, #191970)`,
        Snow: `linear-gradient(to bottom, ${mainColor}, #F0F8FF)`,
        Mist: `linear-gradient(to bottom, ${mainColor}, #B0C4DE)`,
        Fog: `linear-gradient(to bottom, ${mainColor}, #B0C4DE)`,
        Drizzle: `linear-gradient(to bottom, ${mainColor}, #4682B4)`,
        Haze: `linear-gradient(to bottom, ${mainColor}, #B0C4DE)`,
      }[condition] || `linear-gradient(to bottom, ${mainColor}, #F0F8FF)`
    );
  };

  const currentWeather =
    weatherData.current.weather && weatherData.current.weather.length > 0 ? weatherData.current.weather[0] : null;
  const currentCondition = currentWeather ? currentWeather.main : 'Clear';
  const currentTemp = weatherData.current.temp ? Math.round(weatherData.current.temp) : 0;

  const mainColor = getWeatherColor(currentCondition);

  const hourlyForecast = weatherData.hourly
    .slice(0, 24)
    .map((hour, index) => {
      if (!hour || !hour.weather || !hour.weather[0]) {
        return null;
      }
      const time = new Date(hour.dt * 1000);
      const hourNum = time.getHours();
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 || 12;
      const timeString = `${hour12}${ampm}`;
      const temp = Math.round(hour.temp);
      const condition = hour.weather[0].main;
      const isSelected = selectedHour === hourNum;
      const date = time;

      return {
        currentTemp,
        time: timeString,
        hourNum,
        temp,
        condition,
        isSelected,
        date,
        description: hour.weather[0].description,
      };
    })
    .filter((item) => item != null);

  const selectedForecast = hourlyForecast.find((h) => h.isSelected) || hourlyForecast[0];

  return (
    <View style={styles.container}>
      <View style={[styles.mainCard, { backgroundColor: mainColor }]}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={18} color="#fff" />
          <Text style={styles.locationText}>{weatherData.city || 'Current Location'}</Text>
        </View>

        <View style={styles.currentWeatherContainer}>
          <View style={styles.temperatureContainer}>
            <Text style={styles.temperatureText}>{selectedForecast.temp}°</Text>
            <Text style={styles.conditionText}>{selectedForecast.description}</Text>
            <Text style={styles.dateText}>{moment(selectedForecast.date).format('h:mm A,MMM D')}</Text>
          </View>

          <View style={styles.iconContainer}>
            <Ionicons
              name={getWeatherIcon(selectedForecast.condition)}
              size={80}
              color="#fff"
              style={styles.weatherIcon}
            />
          </View>
        </View>

        <View style={styles.hourlyContainer}>
          <Text style={styles.sectionTitle}>HOURLY FORECAST</Text>
          <ScrollView
            horizontal
            showHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hourlyScrollContent}
          >
            {hourlyForecast.map((hour, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.hourItem, hour.isSelected && styles]}
                onPress={() => onHourSelect(hour.hourNum)}
              >
                <Text style={[styles.hourTime, hour.isSelected && styles.selectedText]}>{hour.time}</Text>
                <Ionicons
                  name={getWeatherIcon(hour.condition)}
                  size={24}
                  color={hour.isSelected ? '#fff' : '#555'}
                  style={styles.hourIcon}
                />
                <Text style={[styles.hourTemp, hour.isSelected && styles.selectedText]}>{hour.temp}°</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.dailyContainer}>
          <View style={styles.dailyRow}>
            <Ionicons name="water-outline" size={18} color="#555" />
            <Text style={styles.dailyLabel}>Humidity</Text>
            <Text style={styles.dailyValue}>{weatherData.current.humidity || 'N/A'}%</Text>
          </View>
        </View>

        <View style={styles.dailyRow}>
          <Ionicons name="speedometer-outline" size={18} color="#555" />
          <Text style={styles.dailyLabel}>Pressure</Text>
          <Text style={styles.dailyValue}>{weatherData.current.pressure || 'N/A'}hPa</Text>
        </View>

        <View style={styles.dailyRow}>
          <Ionicons name="eye-outline" size={18} color="#555" />
          <Text style={styles.dailyLabel}>Visibility</Text>
          <Text style={styles.dailyValue}>
            {weatherData.current.visibility ? (weatherData.current.visibility / 1000).toFixed(1) : 'N/A'}km
          </Text>
        </View>
      </View>

      <View style={styles.recommendationContainer}>
        <Text style={styles.recommendationTitle}>Workout Recommendation</Text>
        <Text style={styles.recommendationText}>
          {getWorkoutRecommendation(selectedForecast.condition, selectedForecast.temp)}
        </Text>
      </View>
    </View>
  );
};

const getWorkoutRecommendation = (condition, temp) => {
  if (condition === 'Thunderstorm' || (condition === 'Rain' && temp < 15)) {
    return "Consider indoor workouts today. Weather conditions aren't ideal for outdoor activities.";
  } else if (condition === 'Clear' && temp > 30) {
    return "It's quite hot! Stay hydrated and consider working out during cooler hours.";
  } else if (condition === 'Snow' || temp < 5) {
    return 'Dress in warm layers for outdoor workouts or consider indoor alternatives.';
  } else if (condition === 'Clear' || (condition === 'Clouds' && temp >= 15 && temp <= 25)) {
    return 'Perfect weather for your workout! Enjoy your outdoor session.';
  } else {
    return 'Weather is acceptable for your planned workout. Prepare accordingly.';
  }
};

export default WorkoutWeatherForecast;

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 10,
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherErrorContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
  },
  weatherErrorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6200ee',
    fontWeight: '500',
  },
  mainCard: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  currentWeatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  temperatureContainer: {
    flex: 1,
  },
  temperatureText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: -10,
  },
  conditionText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherIcon: {
    marginRight: 10,
  },
  hourlyContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
    letterSpacing: 1,
  },
  hourlyScrollContent: {
    paddingRight: 15,
  },
  hourItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginRight: 12,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    minWidth: 70,
  },
  selectedHourItem: {
    backgroundColor: '#6200ee',
  },
  hourTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  hourIcon: {
    marginVertical: 8,
  },
  hourTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
  dailyContainer: {
    backgroundColor: '#fff',
    padding: 15,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dailyLabel: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  dailyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recommendationContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 5,
  },
  recommendationText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
});
