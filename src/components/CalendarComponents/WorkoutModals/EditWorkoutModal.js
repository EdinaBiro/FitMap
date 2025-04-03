import {Text, View, TouchableOpacity, ScrollView, Alert, Modal} from 'react-native';
import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import styles from './styles';

const EditWorkoutModal = ({
    visible, onClose, selectedWorkout, setSelectedWorkout, workouts, showTimePicker, setShowTimePicker, updateWorkout
}) => {
        if(!selectedWorkout) return null;
   
           const isCompleted = selectedWorkout.is_completed;
           return(
           <Modal 
               visible={visible}
               animationType='slide'
               transparent={true}
               onRequestClose={onClose}
               >
                   <View style={styles.modalOverlay}>
                       <View style={styles.modalContent}>
                           <Text style={styles.modalTitle}>{isCompleted ? 'Workout Details' : 'Edit Workout'}</Text>
   
                           {isCompleted && (
                               <Text style={styles.completedWarning}>
                                   This workout is already completed and cannot be modified
                               </Text>
                           )}
   
                           <View style={styles.inputContainer}>
                               <Text style={styles.inputLabel}>Workout Type</Text>
                               <ScrollView
                               horizontal
                               showsHorizontalScrollIndicator={false}
                               style={styles.workoutTypeScroll}
                               >
                                   {workouts.map((workout, index) => {
                                    return(
                                       <TouchableOpacity
                                       key={index}
                                       style={[
                                           styles.workoutTypeButton,
                                           selectedWorkout?.name === workout.name && styles.workoutTypeButtonSelected
   
                                       ]}
                                       onPress={ !isCompleted ? () => setSelectedWorkout(prev => ({...prev, name: workout.name})): null} disabled={isCompleted}
                                       >
                                           <Text style={[
                                               styles.workoutTypeText,
                                               selectedWorkout?.name === workout.name && styles.workoutTypeTextSeelected
                                           ]}>
                                               {workout.name}
                                           </Text>
                                       </TouchableOpacity>
                                    );
                                   })}
                               </ScrollView>
                           </View>
   
                           <TouchableOpacity
                           style={styles.timeButton}
                           onPress={() => !isCompleted && setShowTimePicker(true)}
                           disabled={isCompleted}>
                            <View style={styles.timeButtonInner}>
                                <Ionicons name="time-outline" size={20} color="#6200ee"/>
                               <Text style={styles.timeButtonText}>
                                   {selectedWorkout.time ? moment(selectedWorkout.time, 'HH:mm').format('hh:mm A') : 'Select time'}
                               </Text>
                            </View>
                           </TouchableOpacity>
   
                           {showTimePicker && (
                               <DateTimePicker
                               value={selectedWorkout.time ? new Date(`1970-01-01T${selectedWorkout.time}`): new Date()}
                               mode="time"
                               display='default'
                               onChange={(event, selectedTime) => {
                                   setShowTimePicker(false);
                                   if(selectedTime && selectedTime !== undefined){
                                    const hours = selectedTime.getHours().toString().padStart(2,'0');
                                    const minutes = selectedTime.getMinutes().toString().padStart(2,'0');
                                    const formattedTime = `${hours}:${minutes}`;

                                    selectedWorkout(prev => ({
                                        ...prev,
                                        time: formattedTime
                                    }));
                                   }
                               }}
                               />
                           )}
   
                           <View style={styles.modalButtons}>
                               <TouchableOpacity
                               style={[styles.modalButton, styles.cancelButton]}
                               onPress={onClose}
                               >
                                   <Text style={styles.cancelButton}>Cancel</Text>
                               </TouchableOpacity>
   
                               {!isCompleted && (
                                <TouchableOpacity
                               style={[styles.modalButton, styles.saveButton]}
                               onPress={async () => {
                                   await updateWorkout();
                               }}
                               >
                               <Text style={styles.saveButtonText}>Save</Text>
                               </TouchableOpacity>
                               )}
                           </View>
                       </View>
                   </View>
               </Modal>
  );
};

export default EditWorkoutModal;
