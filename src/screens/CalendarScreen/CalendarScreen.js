import React, { useEffect, useState } from 'react'; 
import { StyleSheet, View, Text, Modal, TextInput, Image, TouchableOpacity,ScrollView} from 'react-native';
import { Calendar } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import Emoji from 'react-native-emoji';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Agenda} from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import { StretchOutY } from 'react-native-reanimated';
import baseURL from '../../utils';

const CalendarScreen = () => {

    const [selectedDate, setSelectedDate] = useState('');
    const [markedDates, setMarkedDates] = useState({});
    const [planWorkoutModal, setPlanWorkoutModal] = useState(false);
    const [agendaItems, setAgendaItems] = useState({});
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [images, setImages] = useState({});
    const [image1,setImage1] = useState(null);
    const [image2,setImage2] = useState(null);
    const [uploadDate1, setUploadDate1] = useState(null);
    const [uploadDate2, setUploadDate2] = useState(null);
    const [showDatePicker1, setShowDatePicker1] = useState(false);
    const [showDatePicker2, setShowDatePicker2] = useState(false);
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [workoutPlan, setWorkoutPlan] = useState({
        title: '',
        time: new Date(),
        date: moment().format('YYYY-MM-DD'),
        workoutType: ''
    });

    const workouts =[
        {name: 'Gym'},
        {name: 'Running'},
        {name: 'Cycling'},
        {name: 'Walking'},
        {name: 'Hiking'},
        
    ];

    useEffect(() => {
        const user = auth().currentUser;
        if(user){
            setUserId(user.uid);
        }else{
            console.log('No user is logged in');
        }

    },[]);

    const navigation = useNavigation();
    const date = moment().format('YYYY.MM.DD');

    useEffect(() => {
        if(userId){
        fetchWorkoutData();
        }
        
    }, [userId]);

    const fetchWorkoutData = async () => {
        if(!userId){
            console.log('Skipping api call - no user id available');
            return;
        }

        setIsLoading(true);
        try{
            const response = await axios.get(`${baseURL}/workout/get_user_workout/${userId}`);
            const workouts = response.data;

            const formattedWorkouts = {};
            workouts.forEach(workout => {
                const workoutDate = moment(workout.workout_date).format('YYYY-MM-DD');

                if(!formattedWorkouts[workoutDate]){
                    formattedWorkouts[workoutDate]=[];
                }

                const workoutTime= moment(workout.workout_date).format('HH:mm');

                formattedWorkouts[workoutDate].push({
                    id: workout.workout_id.toString(),
                    name: workout.workout_name,
                    time: workoutTime,
                    distance: workout.distance,
                    duration: workout.duration,
                    calories: workout.calories,
                    pace: workout.pace,


                });
            });

            setAgendaItems(formattedWorkouts);
           
            const marked = {};
            Object.keys(formattedWorkouts).forEach(date => {
                marked[date] = { marked: true, dotColor: '#6200ee'};
            });

            setMarkedDates(marked);
            setIsLoading(false);
        }catch(error){
            console.error('Error fetching workout data: ', error);
            setIsLoading(false);
        }
    };



    const fetchWorkoutsForDate = async (dateString) => {
        if(!userId){
            console.log('Cannot fetch workouts - no user id available');
            return [];
        }

        try{
            const formattedDate = moment(dateString).format('YYYY-MM-DD');

            const response = await axios.get(`${baseURL}/workout/get_user_workout_by_date/${userId}/${formattedDate}`);

            if(response.status === 200){
                return response.data.map(workout => ({
                    id: workout.workout_id.toString(),
                    name: workout.workout_name,
                    time: moment(workout.workout_date).format('HH:mm'),
                    distance: workout.distance || 0,
                    duration: workout.duration,
                    calories: workout.calories_burned || 0,
                    pace: workout.pace || 0,
                    date: moment(workout.workout_date).format('YYYY-MM-DD'),
                    }));
            }else{
                console.log('Api returned non-200 status', response.status);
                
                return [];
            }
        }catch(error){
            console.log(`Error fetching wokrout for date ${dateString}`, error); 

            if(error.response && error.response.status === 404){
                return [];
            }
            return [];
        }
    };

    const onDayPress = async(day) => {
        const seelctedDateString = day.dateString;
        setSelectedDate(day.dateString);
    

        try{

            setIsLoading(true);
            const dayWorkouts = await fetchWorkoutsForDate(day.dateString);
            setIsLoading(false);

            navigation.navigate('WorkoutDetailsScreen', {
                date: day.dateString,
                workouts: dayWorkouts || []
            });
           
    }catch(error){
        console.error('Error fetching workout for date:', error);
        setIsLoading(false);
        navigation.navigate('WorkoutDetailsScreen', {
            date: day.dateString,
            workouts: []
        });
        
    }
    };

    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if(selectedTime){
            setWorkoutPlan(prev => ({...prev, time: selectedTime}));
        }
    };

    const saveWorkoutPlan = async () => {
        try{

            const workoutDate = moment(workoutPlan.date).format('YYYY-MM-DD');
            const workoutTime=moment(workoutPlan.time).format('HH:mm:ss');

            const newWorkoutData = {
                user_id: userId,
                workout_name: workoutPlan.title || "Planned Workout",
                workout_date: workoutDate,
                distance: 0,
                duration: 0,
                calories_burned: 0,
                pace: 0,
                start_time: workoutTime,
                end_time: workoutTime
            };

            console.log('Sending workout data: ', newWorkoutData);

            const response = await axios.post(`${baseURL}/workout/add_workout`, newWorkoutData, {
                headers: {
                    'Content-Type': 'applocation/json',
                }
            });
            const savedWorkout = response.data;
            const formattedTime = moment(workoutPlan.time).format('HH:mm');

            const newWorkout = {
                id: savedWorkout.workout_id.toString(),
                name: workoutPlan.title,
                time: formattedTime,
                distance: 0,
                duration: 0,
                calories: 0,
                pace: 0,
                start_time: workoutTime,
                end_time: workoutTime
            };

            const updatedAgendaItems = {...agendaItems};
            if(!updatedAgendaItems[workoutPlan.date]){
                updatedAgendaItems[workoutPlan.date] = [];
            }
            updatedAgendaItems[workoutPlan.date].push(newWorkout);
            setAgendaItems(updatedAgendaItems);

            setMarkedDates(prev => ({
                ...prev,
                [workoutPlan.date]: {marked: true, dotColor: '#6200ee'}
            }));

            setWorkoutPlan({
                title: '',
                notes: '',
                time: new Date(),
                date: moment().format('YYYY-MM-DD'),
                workoutType: ''
            });
            setPlanWorkoutModal(false);
        }catch(error){
            console.error('Error saving workout plan: ', error);

            if(error.response){
                console.error('Error response data: ', error.response.data);
                console.error('Error response status: ', error.response.status);

            }
        }
    }

    const pickImage = async() => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaType: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4,3],
            quality: 1,
        });
        if( !result.canceled){
            setImages((prev) => ({
                ...prev,
                [selectedDate]: result.assets[0].uri,
            }));
        }
    };

    const PickProgessImage = async (imageNumber) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4,3],
            quality: 1,
        });

        if(!result.canceled){

            const currentTime = new Date();

            if(imageNumber === 1){
                setImage1(result.assets[0].uri);
                //setShowDatePicker1(true);
                setUploadDate1(currentTime);
            }else{
                setImage2(result.assets[0].uri);
                //setShowDatePicker2(true);
                setUploadDate2(currentTime);
            }
        }
    };

    const renderAgendaItem = (item) => {
        return(
            <TouchableOpacity style={styles.agendaItem} onPress={() => navigation.navigate('WorkoutDetailsScreen', {
                date: selectedDate,
                workout: item
            })}>
                <View style={styles.agendaItemHeader}>
                    <Text style={styles.agendaItemTime}>{item.time}</Text>
                    <Text style={styles.agendaItemType}>{item.type}</Text>
                </View>
                <Text style={styles.agendaItemTitle}>{item.name}</Text>
               
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
                
            </TouchableOpacity>
        );
    };
   
 
    return (
    
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.mainScrollVIew} contentContainerStyle={styles.scrollViewContainer} showsVerticalScrollIndicator={true} bounces={true}>
       
                    <TouchableOpacity style={styles.planWorkoutButton} onPress={() => {
                        setWorkoutPlan(prev => ({...prev, date: selectedDate || moment().format('YYYY-MM-DD')}));
                        setPlanWorkoutModal(true);
                    }}>

                    <Text style={styles.planWorkoutButtonText}>Plan a Workout</Text>

                    </TouchableOpacity>

                    <View style={styles.agendaContainer}>
                        <Agenda
                            items={agendaItems}
                            renderItem = {renderAgendaItem}
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
                        />
                    </View>
                    


    
        {/* <Modal visible={modalVisible} animationType="slide">
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}> {selectedDate}</Text>
                <Text style={styles.dayName}>{daysOfWeek}</Text>

                <Text style={styles.workoutText}><Emoji name="runner" style={styles.emoji}/> Distance: {workouts[selectedDate]?.distance || 0} km</Text>
                <Text style={styles.workoutText}><Emoji name="timer_clock" style={styles.emoji}/> Duration: {workouts[selectedDate]?.duration || 0} min</Text>
                <Text style={styles.workoutText}><Emoji name="fire" style={styles.emoji}/>Calories: {workouts[selectedDate]?.calories || 0} kcal</Text>

                <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
                <Text style={styles.imageButtonText}>Select an image of the wrokout </Text>
            </TouchableOpacity>
            {images[selectedDate] && (
                <Image source={{uri: images[selectedDate]}} style={styles.imagePreview}/>    
            )}
            {weather && <Text style={styles.weatherText}> Weather: {weather}</Text>}
                <TextInput
                    style={styles.textInput}
                    placeholder="Write your notes here..."
                    value={notes[selectedDate] || ''}
                    onChangeText={(text) => setNotes({...notes, [selectedDate]: text})}
                />
        
            <Text style={styles.weatherText}> Weather: {weather}</Text>
            <Button title="Save" onPress={saveNote}/>
            <Button title="Close" onPress={() => setModalVisible(false)} />
            </View>

        </Modal> */}

        <View style={styles.progresSection}>
             <Text style={styles.textProgress}>Let's track your progress</Text>
             <Text style={styles.subtitle}>See the changes week by week</Text>
       

    
        <View style={styles.progressCard}>
            <View style={styles.imageContainer}>
                <TouchableOpacity style={styles.uploadButton} onPress={() => PickProgessImage(1)}>
                    {image1 ? (
                        <Image source={{uri: image1}} style={styles.image}/>
                    ):(
                        <Text style={styles.uploadButtonText}>Before</Text>
                       
                    )}
                    </TouchableOpacity>
                    {uploadDate1 && <Text style={styles.dateText}>{moment(uploadDate1).format('YYYY-MM-DD HH:mm')}</Text>}
                    {showDatePicker1 && (
                        <DateTimePicker 
                            testId="dateTimePicker1"
                            value={uploadDate1 || new Date()}
                            mode="datetime"
                            is24Hour={true}
                            display="default"
                            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 1)} />
                    )}
                
            </View>

            

            <View style={styles.imageContainer}>
                <TouchableOpacity style={styles.uploadButton} onPress={() => PickProgessImage(2)}>
                    {image2 ? (
                        <Image source={{uri: image2}} style={styles.image}/>
                    ):(
                        <Text style={styles.uploadButtonText}>After</Text>
                       
                    )}
                    </TouchableOpacity>
                    {uploadDate2 && <Text style={styles.dateText}>{moment(uploadDate2).format('YYYY-MM-DD HH:mm')}</Text>}
                    {showDatePicker2 && (
                        <DateTimePicker 
                            testID="dateTimePicker2"
                            value={uploadDate2 || new Date()}
                            mode="datetime"
                            is24Hour={true}
                            display="default"
                            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 2)} />
                    )}
                
            </View>
            
         </View>
         </View>
    </ScrollView>

         <Modal
            visible={planWorkoutModal}
            animationType="slide"
            transparent={true}>

            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                        Plan Workout for {workoutPlan.date}
                    </Text>

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
                        <Text style={styles.timeButtonText}>
                            Select time: {moment(workoutPlan.time).format('hh:mm A')}
                        </Text>
                    </TouchableOpacity>

                    {showTimePicker && (
                        <DateTimePicker 
                            value={workoutPlan.time}
                            mode="time"
                            is24Hour={false}
                            display="default"
                            onChange={handleTimeChange} />
                    )}

                    <TextInput
                        style={[styles.input, styles.notesInput]}
                        placeholder="Notes"
                        multiline
                        value={workoutPlan.notes}
                        onChangeText={(text) => setWorkoutPlan(prev => ({...prev, notes: text}))} />
                    
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setPlanWorkoutModal(false)}>
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
        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
    },
    scrollViewContainer: {
        flexGrow: 1,
        padding: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding:20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    input:{
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 12,
        fontSize: 16,
        backgroundColor: '#fcfcfc',
    },
    timeButton: {
        backgroundColor: '#f0e6ff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0d0ff'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        position: 'absolute',
        top: 0,
        left: 0,
        marginTop: 20,
        marginLeft: 15,
        marginTop: 0,
    },
    textInput: {
        width: '100%',
        height: 100,
        borderWidth: 1,
        borderColor: '#acc',
        marginBottom: 20,
        padding: 10,
        textAlignVertical: 'top',
    },
    imageButton: {
        backgroundColor: '#808080',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        borderRadius: 30,
        marginBottom: 10,
    },
    imageButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    imagePreview: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    buttonContainer: {
        padding: 10,
    },
    agendaItemTime:{
        fontSize: 13,
        color: '#666',
    },
    cardContainer:{
        marginTop: 20,
    },
    emptyAgendaText:{
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    card: {
        width: 200,
        height: 300,
        margin: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 'auto',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    calendarContainer: {
        flex:1,
        padding: 30,
        
    },
    calendar: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        marginBottom: 10,
    },
    list: {
        flex: 1,
        marginTop: 100,
        width: '100%',
    },
    planWorkoutButton: {
        backgroundColor: '#6200ee',
        padding: 12,
        borderRadius: 15,
        alignItems: 'center',
        marginVertical: 10,
    },
    planWorkoutButtonText: {
        color: 'white'
    },
    agendaContainer: {
        marginTop: 20,
        height: 350,
    },
    agendaItem: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginVertical: 5,
    },
    agendaItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    agendaItemType: {
        fontSize: 13,
        color: '#666',
    },
    agendaItemTitle: {
        fontSize: 18,
        fontWeight: '500'
     },
    workoutStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    statText:{
        fontSize: 13,
        color: '#444',
    },
    plannedTag: {
        alignSelf: 'flex-start',
    },
    emptyAgenda: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    progresSection: {
        marginTop: 30,
    },
    weatherText: {
        fontSize: 16,
        marginBottom: 20,
    },
    dayName: {
        fontSize: 16,
        fontWeight: 'normal',
        position: 'absolute',
        top: 20,
        left: 0,
        marginTop: 35,
        marginLeft: 20,
    },
    emoji: {
        fontSize: 20,
    },
    itemText:{
        color: 'black',
        fontSize: 14,
    },
    item: {
        backgroundColor: '#CBC3E3',
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 25,
        paddingBottom: 20,
    },
    agenda: {
        marginTop: 15,
    },
    progressCard: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
    },
    imageContainer: {
        alignItems: 'center',
        width: '45%',
    },
    uploadButton: {
        height: 150,
        width: 150,
        backgroundColor: '#6200ee',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        //borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    image:{
        width: 150,
        height: 150,
    },
    scrollViewContainer:{
        flexGrow: 1,
    },
   textProgress: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
   },
   subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
   },
   dateText: {
    fontSize: 14,
    color: '#777',
   },
   iput: {
    borderWidth: 1,
    borderColor: '#ddd',
   },
   notesInput: {
    height: 100,
    textAlignVertical: 'top',
   },
   timeButton: {
    backgroundColor: '#f0e6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
   },
   timeButtonText: {
    color: '#6200ee',
    textAlign: 'center',
    fontSize: 16,
   },
   modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
   },
   modalButton: {
    flex: 1,
    padding: 12,
   },
   cancelButton: {
    backgroundColor: '#f2f2f2',
    marginRight: 10,
    borderRadius: 10,
   },
   cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
   },
   saveButton: {
    backgroundColor: '#6200ee',
    borderRadius: 10,
   },
   saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
   },
   modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#6200ee',
   },
   inputContainer: {
    marginBottom: 15,
   },
   inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#444',
   },
   workoutTypeScroll: {
    flexDirection: 'row',
    marginBottom: 5,
   },
   workoutTypeButton:{
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
   },
   workoutTypeButtonSelected: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
   },
   workoutTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
   },
   workoutTypeTextSeelected: {
    color: 'white',
   },
});

export default CalendarScreen;
