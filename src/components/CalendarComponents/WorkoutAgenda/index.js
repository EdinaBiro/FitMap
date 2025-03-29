import { Text, View, TouchableOpacity} from 'react-native'
import React from 'react';
import { Agenda } from 'react-native-calendars';
import moment from 'moment';
import styles from './styles';

const WorkoutAgenda = ({
    agendaItems, selectedDate, renderItem, setWorkoutPlan, setPlanWorkoutModal
}) => {
 return(
    <View style={styles.agendaContainer}>
    <Agenda
        items={agendaItems}
        renderItem = {renderItem}
        renderEmptyData={() => (
            <View style={styles.emptyAgenda}>
                <Text style={styles.emptyAgendaText}>No workouts planned for this day</Text>
            

        <TouchableOpacity 
            style={styles.planWorkoutButton}
            onPress={() => {
                setWorkoutPlan(prev => ({
                    ...prev,
                    date: selectedDate || moment().format('YYYY-MM-DD')
                }));
                setPlanWorkoutModal(true);
            }}
            >
            </TouchableOpacity>
            </View>
        )}

        selected={selectedDate || moment().format('YYYY-MM-DD')}
        theme={{
            agendaDayTextColor: '#6200ee',
            agendaDayNumColor: '#6200ee',
            agendaTodayColor: '#6200ee',
            agendaKnobColor: '#6200ee',

        }}
        hideKnob={false}
        pastScrollRange={1}
        futureScrollRange={1}
        showScrollIndicator={true}
        enableSwipeMonths={true}
    />
    </View>
 );
};

export default WorkoutAgenda;

