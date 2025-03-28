import React, { useEffect, useState } from 'react'; 
import { StyleSheet, View, Text, Modal, TextInput, Image, TouchableOpacity,ScrollView, Alert} from 'react-native';
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
import {baseURL} from '../../utils';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {GEMINI_API_KEY} from '@env';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable, Switch } from 'react-native-gesture-handler';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const processImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
    });
    return{
        inlineData: {data: base64Data, mimeType: blob.type},
    };

};

const analyzeProgress = async (image1Uri, image2Uri) => {
    try{
        const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});
        const prompt =`
            Analyze these two fitness progress pictures (before and after) and give a brief analysis with:
            💪 Muscle & Fat changes
            🏋️ Posture Form
            🔍 Most noticeable differences
            🎯 2-3 recommendations

            Provide a clear, structured response with:
            - Key positive changes
            - Areas needing to work
            - Actionable advice

            Keep it motivational, but honest, using simple fitness terms. Keep it short. Inlcude revelant emojis in your response.

            Rules:
            - Use only plain text ( no *** or markdown)
           
        `;

        const image1 = await processImage(image1Uri);
        const image2 = await processImage(image2Uri);

        const result = await model.generateContent([prompt,image1,image2]);
        const response = await result.response;
        return response.text();
    }catch(error){
        console.error('Gemini error: ', error);
        return "Analysis failed. Please check your images and try again";
    }
};

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
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progressCycle, setProgressCycle] = useState('monthly');
    const [progressEntries, setProgressEntries] = useState([]);
    const [editWorkoutModal, setEditWorkoutModal] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    const [workoutPlan, setWorkoutPlan] = useState({
        id: '',
        workoutType: '',
        time: new Date(),
        date: moment().format('YYYY-MM-DD'),
        reminder: false
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

    const deleteWorkout = async (workout) => {
        try{

            const workoutId = parseInt(workout.id);

            await axios.delete(`${baseURL}/workout/delete_workout/${workoutId}`);

            const updatedAgendaItems = {...agendaItems};
            Object.keys(updatedAgendaItems).forEach(date => {
                updatedAgendaItems[date] = updatedAgendaItems[date].filter(
                    item => item.id !== workoutId.toString()
                );

                if(updatedAgendaItems[date].length === 0){
                    delete updatedAgendaItems[date];
                }
            });

            setAgendaItems(updatedAgendaItems);

            const newMarkedDates ={};
            Object.keys(updatedAgendaItems).forEach(date => {
                newMarkedDates[date] = {marked: true, dotColor: '#6200ee'};
            });
            setMarkedDates(newMarkedDates);
        }catch(error){
            console.error('Error deleting workout: ', error);
            Alert.alert('Error', 'Could not delete the workout. Please try agaian');
        }
    };

    const updateWorkout = async () => {
        try{
            if(!selectedWorkout || !selectedWorkout.id){
                alert('No workout selected to update');
                return;
            }
            const workoutDetails = await axios.get(`${baseURL}/workout/get_workout/${selectedWorkout.id}`);

            if(workoutDetails.data.is_completed){
                Alert.alert('Error', 'Completed workouts cannot be modified');
                return;
            }
            const updatedWorkoutData = {
                workout_name: selectedWorkout.name,
                start_time: `${selectedWorkout.time}:00`,
                workout_date: selectedDate || moment().format('YYYY-MM-DD')
            };

            const response = await axios.put(`${baseURL}/workout/update_workout/${selectedWorkout.id}`,
                updatedWorkoutData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if(response.status === 200){
                const updatedAgendaItems = {...agendaItems};
                Object.keys(updatedAgendaItems).forEach(date => {
                    updatedAgendaItems[date] = updatedAgendaItems[date].map(workout => 
                        workout.id === selectedWorkout.id
                        ?{...workout, name: updatedWorkoutData.workout_name, time: moment(updatedWorkoutData.start_time, 'HH:mm:ss').format('HH:mm')}
                        :workout
                    );
                });

                setAgendaItems(updatedAgendaItems);
                setEditWorkoutModal(false);

                Alert.alert('Success', 'Workout updated successfully');
            }
        }catch(error){
            console.error('Error updating workout: ', error);
            Alert.alert('Error', 'Could not update the workout. Please try again');
        }
    };

    const openEditWorkoutModal = (workout) => {
        setSelectedWorkout({
            id: workout.id,
            name: workout.name,
            time: workout.time,
            is_completed: workout.is_completed || false
        });
        setEditWorkoutModal(true);
    };

    const renderRightActions = (workout) => {
        return(
            <View style={styles.swipeActionsContainer}>
                <TouchableOpacity 
                    style={[styles.swipeAction, styles.editAction]}
                    onPress={() => openEditWorkoutModal(workout)}>
                        <Ionicons name="pencil" size={20} color="white"/>
                </TouchableOpacity>

                <TouchableOpacity
                style={[styles.swipeAction, styles.deleteAction]}
                onPress={() => {
                    Alert.alert(
                        'Delete workout',
                        'Are you sure you want to delete this workout?',
                        [
                            {text: 'Cancel', style: 'cancel'},
                            {
                                text: 'Delete',
                                style:'destructive',
                                onPress: () => deleteWorkout(workout)
                            }
                        ]
                    );
                }}
           >
            <Ionicons name="trash" size={20} color="white"/>
            </TouchableOpacity>

           </View>
        );
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
                workout_name: workoutPlan.workoutType|| "Planned Workout",
                workout_date: workoutDate,
                start_time: workoutTime,
                is_completed: false,
            };
            console.log('Base url: ', baseURL);

            console.log('Sending workout data: ', newWorkoutData);

            const response = await axios.post(`${baseURL}/workout/add_workout`, newWorkoutData, {
                headers: {
                    'Content-Type' : 'application/json'
                },
                timeout: 5000
            });

            console.log('Response status', response.status);
            console.log('Response data: ', response.data);

            const savedWorkout = response.data;
            const formattedTime = moment(workoutPlan.time).format('HH:mm');

            const newWorkout = {
                id: savedWorkout.workout_id.toString(),
                name: workoutPlan.workoutType || "Planned Workout",
                time: formattedTime,
                is_completed: false
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
};




    

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
         <GestureHandlerRootView>
            <Swipeable
            renderRightActions={() => renderRightActions(item)}
            rightThreshold={40}
            containerStyle={styles.swipeableContainer}>

            <TouchableOpacity style={styles.agendaItem} onPress={() => navigation.navigate('WorkoutDetailsScreen', {
                date: selectedDate,
                workout: item
            })}>
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
                    <Text style={styles.plannedText}>Planned Workout</Text>
                )}
                
            </TouchableOpacity>
            </Swipeable>
            </GestureHandlerRootView>
        );
    };

    const renderEditWorkoutModal = () => {
        if(!selectedWorkout) return null;

        const isCompleted = selectedWorkout.is_completed;
        return(
        <Modal 
            visible={editWorkoutModal}
            animationType='slide'
            transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{isCompleted ? 'Workout Details' : 'Edit Workout'}</Text>

                        {isCompleted && (
                            <Text style={styles.coompletedWarning}>
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
                        onPress={() => setShowTimePicker(true)}>
                            <Text style={styles.timeButtonText}>
                                Select time: {setSelectedWorkout.time || 'Select time'}
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
                            styke={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setEditWorkoutModal(false)}
                            >
                                <Text style={styles.cancelButton}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                            style={[styles.modalButton, styles.saveButton]}
                            onPress={async () => {
                                await updateWorkout();
                            }}
                            >
                            <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };
 
   
    const handleProgressImage = async (imageNumber) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4,3],
            quality: 1,
        });

        if(!result.canceled){
            const currentDate = new Date();
            const newEntry ={
                date: currentDate,
                imageUri: result.assets[0].uri,
                type: imageNumber === 1 ? 'before': 'after'
            };

            if(imageNumber === 1){
                setImage1(result.assets[0].uri);
                setUploadDate1(currentDate)
            }else{
                setImage2(result.assets[0].uri);
                setUploadDate2(currentDate);

                if(progressCycle === 'auto'){
                    setTimeout(() => {
                        setImage1(result.assets[0].uri);
                        setUploadDate1(currentDate);
                        setImage2(null);
                        setUploadDate2(null);
                        alert('This image will be used as your next "Before" comparison');
                    }, 1000);
                }
            }

            setProgressEntries(prev => [...prev, newEntry]);
        }
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
             <Text style={styles.textProgress}>Progress Tracker</Text>
             <Text style={styles.subtitle}>Visualize your transformation journey</Text>
       
       <View style={styles.comparisonContainer}>
        <View style={styles.imageColumn}>
                <Text style={styles.imageLabel}>BEFORE</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={() => PickProgessImage(1)}>
                    {image1 ? (
                        <>
                        <Image source={{uri: image1}} style={styles.image}/>
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateBadgeText}>
                                {moment(uploadDate1).format('MMM D')}
                            </Text>
                        </View>
                        </>
                    ):(
                        <View style={styles.uploadPlaceHolder}>
                            <Ionicons name="add-circle-sharp" size={32} color="#6200ee"/>
                            <Text style={styles.uploadButtonText}>Add A Before Photo</Text>
                        </View> 
                       
                    )}
                </TouchableOpacity>
            </View>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine}/>
                        <Ionicons name="compass" size={24} color="#6200ee"/>
                        <View style={styles.dividerLine}/>
                    </View>

                <View style={styles.imageColumn}>
                    <Text style={styles.imageLabel}>AFTER</Text>
                    <TouchableOpacity style={styles.imageUploadCard} onPress={() => PickProgessImage(2)}>
                    {image2 ? (
                        <>
                        <Image source={{uri: image2}} style={styles.image}/>
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateBadgeText}>
                                {moment(uploadDate2).format('MMM D')}
                            </Text>
                        </View>
                        </>
                    ):(
                        <View style={styles.uploadPlaceholder}>
                            <Ionicons name="add-circle-sharp" size={32} color="#6200ee"/>
                            <Text style={styles.uploadButtonText}>Add An After Photo</Text>
                        </View> 
                    )} 
                    </TouchableOpacity>
                </View>
            </View>

         <TouchableOpacity style={styles.analyzeButton} onPress={async() =>{
            if(!image1 || !image2){
                alert("Please upload both 'Before' and 'After' images first");
                return;
            }
            setIsAnalyzing(true);
            const result = await analyzeProgress(image1, image2);
            setAnalysisResult(result);
            setIsAnalyzing(false);
        }}
        disabled={isAnalyzing}
        >
            <Text style={styles.analyzeButtontext}>
                {isAnalyzing ? "Analyzing..." : "Analyze Progress"}
            </Text>
        </TouchableOpacity>

        {analysisResult && (
            <View style ={styles.analysisResultContainer}>
                <View style={styles.analysisHeader}>
                    <Ionicons name="analytics" size={24} color="#6200ee"/>
                    <Text style={styles.analysisHeaderText}>Progress Analysis</Text>
                </View>
                <Text style ={styles.analysisResultText}>{analysisResult}</Text>
                <View style={styles.analysisFooter}>
                    <Ionicons name="heart" size={16} color="#6200ee"/>
                    <Text style={styles.analysisFooterText}>Keep up the great work</Text>
            </View>
        </View>
        )}
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
    

                    <View style={styles.reminderContainer}>
                        <Switch
                        value={workoutPlan.reminder}
                        onValueChange={(value) => setWorkoutPlan(prev => ({...prev, reminder: value}))}
                        trackColor={{false: '#767677', true: '#6200ee'}} />
                        
                        <Text style={styles.reminderText}>Set reminder</Text>
                
                    </View>
                    
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
        {renderEditWorkoutModal()}
        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        paddingBottom: 60
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
        marginBottom: 20,
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
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden',
    },
    image:{
        width: '100%',
        height: '100%',
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
   input: {
    borderWidth: 1,
    borderColor: '#ddd',
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
   analyzeButton:{
    backgroundColor: '#6200ee',
    padding: 12,    
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
   },
   analyzeButtonText: {
    color: 'white',
    fontWeight: 'bold',
   },
   analysisResultContainer: {
    backgroundColor: '#f8f4ff',
    padding: 20,
    borderRadius: 12,
    marginTop: 15,
    marginBottom: 30,
    borderColor: "#6200ee",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
   },
   analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0d0ff',
    paddingBottom: 8,
   },
   analysisHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6200ee',
    marginLeft: 8,
   },
   analysisResultText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
   },
   analysisFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
   },
   comparisonContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    width: '100%',

   },
   imageColumn:{
    alignItems: 'center',
    marginHorizontal: 10,
   },
   imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
   },
   imageUploadCard:{
    height: 150,
    width: 150,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
   },
   uploadPlaceHolder:{
    alignItems: 'center',
    justifyContent: 'center',
   },
   uploadButtonText:{
    marginTop: 10,
    textAlign: 'center',
   },
   divider:{
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
   },
   dividerLine: {
    height: 1,
    width: 30,
    backgroundColor: '#6200ee',
    marginVertical: 10,
   },
   dateBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
   },
   dateBadgeText: {
    color: 'white',
    fontSize:16
   },
   plannedText:{
    color: '#6200ee',
    fontStyle: 'italic',
    marginTop: 5,
   },
   reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
   },
   reminderText: {
    marginLeft: 10,
    color: '#444'
   },
   swipeActionsContainer: {
    flexDirection: 'row',
    alignItems:'center',
   },
   swipeAction:{
    width: 70,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
   },
   editAction: {
    backgroundColor: '#4CAF50',
   },
   deleteAction: {
    backgroundColor: '#F44336'
   },
   swipeableContainer:{
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 5,
    overflow: 'hidden',
   },
   swipeableActionsContainer:{
    flexDirection: 'row',
    width: 140,
    height: '100%'
   },
   swipeAction: {
    width: 70,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
   },
   editAction: {
    backgroundColor: '#4CAF50'
   }, 
   deleteAction: {
    backgroundColor: '#F44336'
   },
   coompletedWarning: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
   },
   disabledButton: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0'
   }
});

export default CalendarScreen;
