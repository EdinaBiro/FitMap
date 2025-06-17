import { Text, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import styles from './styles';
import WorkoutWeatherForecast from '../WeatherDisplay/WorkoutWeatherForecast';

const AddWorkoutModal = ({
  visible,
  onClose,
  workoutPlan,
  setWorkoutPlan,
  workouts,
  showTimePicker,
  setShowTimePicker,
  handleTimeChange,
  saveWorkoutPlan,
  weatherData,
  selectedDate,
}) => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [processedWeatherData, setProcessedWeatherData] = useState(null);

  useEffect(() => {
    if (weatherData) {
      try {
        const hourlyData = weatherData.list
          ? weatherData.list.map((item) => ({
              dt: item.dt,
              temp: item.main.temp,
              humidity: item.main.humidity,
              pressure: item.main.pressure,
              visibility: item.main.visibility,
              weather: item.weather || [{ main: 'Clear', description: 'clear sky' }],
              main: item.main || {},
            }))
          : [];

        const formattedWeatherData = {
          city: weatherData.name || 'Your location',
          current: {
            temp: weatherData.main ? weatherData.main.temp : 0,
            humidity: weatherData.main ? weatherData.main.humidity : 0,
            pressure: weatherData.main ? weatherData.main.pressure : 0,
            visibility: weatherData.visibility || 0,
            weather: weatherData.weather || [{ main: 'Clear', description: 'clear sky' }],
          },
          hourly: hourlyData,
        };

        setProcessedWeatherData(formattedWeatherData);
      } catch (error) {
        console.error('Error processing weather data: ', error);
        setProcessedWeatherData(null);
      }
    } else {
      setProcessedWeatherData(null);
    }
  }, [weatherData]);

  console.log('Modal weatherData: ', weatherData);
  useEffect(() => {
    if (workoutPlan.time instanceof Date) {
      setCurrentHour(workoutPlan.time.getHours());
    }
  }, [workoutPlan.time]);

  const handleHourSeelect = (hour) => {
    const newTime = new Date(workoutPlan.time);
    newTime.setHours(hour);
    newTime.setMinutes(0);

    setWorkoutPlan((prev) => ({ ...prev, time: newTime }));
    setCurrentHour(hour);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Plan Workout for{' '}
              {selectedDate && moment(selectedDate).isValid()
                ? moment(selectedDate).format('YYYY-MM-DD')
                : moment().format('YYYY-MM-DD')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="6200ee" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showHorizontalScrollIndicator={false}>
            {processedWeatherData && processedWeatherData.hourly ? (
              <WorkoutWeatherForecast
                weatherData={processedWeatherData}
                selectedHour={currentHour}
                onHourSelect={handleHourSeelect}
              />
            ) : (
              <View style={styles.weatherErrorContainer}>
                <Ionicons name="cloud-offline-outline" size={40} color="#6200ee" />
                <Text style={styles.weatherErrorText}>Weather forecast unavailable</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.section}>
            <Text style={styles.inputLabel}>Workout Type</Text>
            <ScrollView horizontal showHorizontalScrollIndicator={false} style={styles.workoutTypeScroll}>
              {workouts.map((workout, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.workoutTypeButton,
                    workoutPlan.workoutType === workout.name && styles.workoutTypeButtonSelected,
                  ]}
                  onPress={() => setWorkoutPlan((prev) => ({ ...prev, workoutType: workout.name }))}
                >
                  <Text
                    style={[
                      styles.workoutTypeText,
                      workoutPlan.workoutType === workout.name && styles.workoutTypeTextSeelected,
                    ]}
                  >
                    {workout.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time</Text>
            <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={20} color="#6200ee" />
              <Text style={styles.timeButtonText}>
                {workoutPlan.time instanceof Date
                  ? workoutPlan.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Select time'}
              </Text>
            </TouchableOpacity>
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={workoutPlan.time}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={handleTimeChange}
            />
          )}

          <View style={styles.reminderContainer}>
            <TouchableOpacity
              style={styles.checkBoxContainer}
              onPress={() => setWorkoutPlan((prev) => ({ ...prev, reminder: !prev.reminder }))}
            >
              <View style={[styles.checkbox, workoutPlan.reminder && styles.chechBoxChecked]}>
                {workoutPlan.reminder && <Ionicons name="checkmark" size={16} color="white" />}
              </View>

              <Text style={styles.reminderText}>Set reminder</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={saveWorkoutPlan}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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

export default AddWorkoutModal;
