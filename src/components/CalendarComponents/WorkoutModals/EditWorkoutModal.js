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
                                   })}
                               </ScrollView>
                           </View>
   
                           <TouchableOpacity
                           style={styles.timeButton}
                           onPress={() => !isCompleted && setShowTimePicker(true)}
                           disabled={isCompleted}>
                               <Text style={styles.timeButtonText}>
                                   Select time: {selectedWorkout.time || 'Select time'}
                               </Text>
                           </TouchableOpacity>
   
                           {showTimePicker && (
                               <DateTimePicker
                               value={new Date(`1970-01-01T${selectedWorkout.time}:00`)}
                               mode="time"
                               display='default'
                               onChange={(event, selectedTime) => {
                                   setShowTimePicker(false);
                                   if(selectedTime){
                                       setSelectedWorkout(prev => ({
                                           ...prev,
                                           time: moment(selectedTime).format('HH:mm')
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
