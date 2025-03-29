import { Modal, Text, TouchableOpacity, View } from 'react-native';
import React, {useState} from 'react';
import styles from './styles';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native-gesture-handler';
import moment from 'moment';

const CompleteWorkoutModal = ({
    visible, onClose, completeWorkout, workout
}) => {
    const [completionData, setCompletionData] = useState({
        distance: '',
        duration: '',
        calories: '',
        pace: '',
    });

    const handleComplete = () => {

        if(!workout){
            console.error('No workout data available');
            onClose();
            return;
        }

        const data ={
            distance: parseFloat(completionData.distance) || 0,
            duration: completionData.duration || '00:00:00',
            calories: parseFloat(completionData.calories) || 0,
            pace: parseFloat(completionData.pace) || 0,
            end_time : moment().format('HH:mm:ss')
        };
        completeWorkout(workout.id,data);
        onClose();
    };

    return(
        <Modal
        visible={visible}
        animationType='slide'
        transparent={true}
        onRequestClose={onClose}>

        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View styke={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Complete {workout?.name} Workout</Text>

                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#6200ee"/>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Distance (km)</Text>
                    <TextInput
                        style={styles.TextInput}
                        keyboardType='decimal-pad'
                        value={completionData.distance}
                        onChangeText={(text) => setCompletionData(prev => ({...prev, distance: text}))}
                        placeholder='0.0'
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Duration (minutes)</Text>
                    <TextInput
                        style={styles.TextInput}
                        keyboardType='decimal-pad'
                        value={completionData.duration}
                        onChangeText={(text) => setCompletionData(prev => ({...prev, duration: text}))}
                        placeholder='0.0'
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Calories Burned</Text>
                    <TextInput
                        style={styles.TextInput}
                        keyboardType='decimal-pad'
                        value={completionData.calories}
                        onChangeText={(text) => setCompletionData(prev => ({...prev, calories: text}))}
                        placeholder='0.0'
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Pace (min/km)</Text>
                    <TextInput
                        style={styles.TextInput}
                        keyboardType='decimal-pad'
                        value={completionData.pace}
                        onChangeText={(text) => setCompletionData(prev => ({...prev, pace: text}))}
                        placeholder='0.0'
                    />
                </View>

                <View style={styles.modalButtons}>
                    <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={onClose}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleComplete}>
                        <Text style={styles.saveButtonText}>Complete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
        </Modal>
    );

};

export default CompleteWorkoutModal;

