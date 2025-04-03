import { Text, View, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';
import Emoji from 'react-native-emoji';

const AgendaItem = ({
    item, selectedDate, navigation, renderRightActions
}) => {
    return(
             <GestureHandlerRootView>
                <Swipeable
                renderRightActions={() => renderRightActions(item)}
                rightThreshold={40}
                containerStyle={styles.swipeableContainer}>
    
                <TouchableOpacity style={styles.agendaItem} onPress={() =>  { if(item.is_completed) {navigation.navigate('WorkoutDetailsScreen', {
                    date: selectedDate,
                    workout: item
                });
            }else{
                Alert.alert('Plannes Workout', 'This workout has not been completed yet');
            }
            }}>
                    <View style={styles.agendaItemHeader}>
                        <Text style={styles.agendaItemTime}>{item.time}</Text>
                        <Text style={styles.agendaItemType}>{item.type}</Text>
                    </View>
                    <Text style={styles.agendaItemTitle}>{item.name}</Text>
    
                    {item.is_completed ? (
                   
                        <View style ={styles.workoutStats}>
                            <Text style={styles.statText}>
                                <Emoji name="runner" style={styles.emoji}/> {item.distance} km
                            </Text>
                            <Text style={styles.statText}>
                                <Emoji name="timer_clock" style={styles.emoji}/> {item.duration} min
                            </Text>
    
                            <Text style={styles.statText}>
                                <Emoji name="fire" style={styles.emoji}/> {item.calories} kcal
                            </Text>
                        </View>
                    ):(
                        
                        <View style={styles.plannedContainer}>
                            <Text style={styles.plannedText}>Planned Workout</Text>
                            {item.reminder && (
                                <Ionicons name="alarm" size={16} color="#6200ee" style={styles.reminderIcon}/>
                            )}
                        </View>
                        
                    )}
                    
                </TouchableOpacity>
                </Swipeable>
                </GestureHandlerRootView>
            );
        };
    
export default AgendaItem

