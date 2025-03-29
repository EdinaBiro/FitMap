import { Text, TouchableOpacity,View,Modal,ScrollView} from 'react-native';
import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import styles from './styles';

const AddWorkoutModal = ({
    visible, onClose, workoutPlan, setWorkoutPlan, workouts, showTimePicker, setShowTimePicker, handleTimeChange, saveWorkoutPlan, weatherData
}) => {

    console.log('Workout plan date: ', workoutPlan.date);
    console.log('Moment validation: ', moment(workoutPlan.date, 'YYYY-MM-DD').isValid());
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
    };

  return (
         <Modal
                visible={visible}
                animationType="slide"
                transparent={true}
                onRequestClose={onClose}>
    
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                            Plan Workout for {workoutPlan.date && typeof workoutPlan.date === 'string' ?
                             moment(workoutPlan.date,'YYYY-MM-DD').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')}
                        </Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="6200ee"/>
                    </TouchableOpacity>
                    </View>

                    {weatherData && (
                        <View style={styles.weatherContainer}>
                            <Ionicons name={getWeatherIcon(weatherData.weather[0].main)} size={24} color="#6200ee"/>
                            <Text style={styles.weatherText}>
                                {Math.round(weatherData.main.temp)}°C - {weatherData.weather[0].description}
                            </Text>
                        </View>
                    )}
    
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Workout Type</Text>
                            <ScrollView horizontal
                            showHorizontalScrollIndicator={false}
                            style={styles.workoutTypeScroll}>
                                {workouts.map((workout, index) => (
                                    <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.workoutTypeButton,
                                        workoutPlan.workoutType === workout.name && styles.workoutTypeButtonSelected
                                    ]}
                                    onPress={() => setWorkoutPlan(prev => ({...prev, workoutType: workout.name}))}>
                                        <Text style={[styles.workoutTypeText,
                                        workoutPlan.workoutType === workout.name && styles.workoutTypeTextSeelected
                                        ]}>
                                            {workout.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
    
                        <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
                            <View style={styles.timeButtonInner}>
                                <Ionicons name="time-outline" size={20} color="#6200ee"/>
                                <Text style={styles.timeButtonText}>
                                 {moment(workoutPlan.time).format('hh:mm A')} </Text>
                            </View>
                        </TouchableOpacity>
    
                        {showTimePicker && (
                            <DateTimePicker 
                                value={workoutPlan.time}
                                mode="time"
                                is24Hour={false}
                                display="default"
                                onChange={handleTimeChange} />
                        )}
        
    
                        <View style={styles.reminderContainer}>
                            <TouchableOpacity
                            style={styles.checkBoxContainer}
                            onPress={() => setWorkoutPlan(prev => ({...prev, reminder: !prev.reminder}))}>
                            <View style={[
                                styles.checkbox,
                                workoutPlan.reminder && styles.chechBoxChecked
                            ]}>
                                {workoutPlan.reminder && <Ionicons name="checkmark" size={16} color="white"/>}
                            </View>
                            
                            <Text style={styles.reminderText}>Set reminder</Text>
                    
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={onClose}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
    
                                <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={saveWorkoutPlan}>
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
  );
};




export default AddWorkoutModal;
