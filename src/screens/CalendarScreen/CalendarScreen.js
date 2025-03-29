import React, { useEffect, useState } from 'react'; 
import { StyleSheet, View, TouchableOpacity,Text, Alert} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import moment, { duration } from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import {baseURL} from '../../utils';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {GEMINI_API_KEY} from '@env';
import {WEATHER_API} from '@env';
import { Ionicons } from '@expo/vector-icons';

import WorkoutAgenda from '../../components/CalendarComponents/WorkoutAgenda';
import ProgressTracker from '../../components/CalendarComponents/ProgressTracker';
import AgendaItem from '../../components/CalendarComponents/AgendaItem';
import AddWorkoutModal from '../../components/CalendarComponents/WorkoutModals/AddWorkoutModal';
import EditWorkoutModal from '../../components/CalendarComponents/WorkoutModals/EditWorkoutModal';
import WeatherCard from '../../components/CalendarComponents/WeatherDisplay/WeatherCard';
import { getCurrentPositionAsync } from 'expo-location';
import CompleteWorkoutModal from '../../components/CalendarComponents/WorkoutModals/CompleteWorkoutModal';


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
    const [weatherData, setWeatherData] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [comppleteWorkoutModal, setCompleteWorkoutModal] = useState(false);
    const [workoutToComplete, setWorkoutToComplete] = useState(null);
    const [activeSection, setActiveSection] = useState('agenda');

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
        const unsubscribeFocus = navigation.addListener('focus', () => {
            if(userId){
                fetchWeatherData();
            }
        });
        return unsubscribeFocus;
    }, [navigation, userId]);

    useEffect(() => {
        const user = auth().currentUser;
        if(user){
            setUserId(user.uid);
        }else{
            console.log('No user is logged in');
        }

    },[]);

    const navigation = useNavigation();

    useEffect(() => {
        if(userId){
        fetchWorkoutData();
        }
        
    }, [userId]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            const location = navigation.getState().routes.find(
                route => route.name === 'CalendarScreen'
            )?.params?.location;

        if(!location){

            try{
                const currentLocation = await getCurrentPositionAsync();
                setUserLocation(currentLocation);
            }catch(error){
                console.log('Could not find location: ', location);

                setUserLocation({
                    latitude:37.7749,
                    longitude: -122.4194
                });
            }
            }else{

                setUserLocation(location);
            }

            if(selectedDate){
                fetchWeatherData(selectedDate);
            }
    });

    return unsubscribe;
},[navigation, selectedDate]);

    const fetchWeatherData = async (date) => {
        if(!userLocation){
            console.log('No location data available');
            setUserLocation({
                latitude: 12.45,
                longitude:77.767
            })
        }

        try{

            const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${userLocation.latitude}&lon=${userLocation.longitude}&units=metric&appid=${WEATHER_API}`);
            console.log('Api response: ', response.data);
            const forecastDate = moment(date).format('YYYY-MM-DD');

            const forecastsForDate = response.data.list.filter(item => 
                moment.unix(item.dt).format('YYYY-MM-DD') === forecastDate
            );

            if(forecastsForDate && forecastsForDate.length > 0){
                const midDayForecast = forecastsForDate.find(item => {
                    const hour = parseInt(moment.unix(item.dt).format('H'));
                    return hour >=12 && hour <=15;
                }) || forecastsForDate[0];

                // midDayForecast.list = response.data.list.filter((item, index) => {
                //     const itemDate = moment.unix(item.dt);
                //     const hour = parseInt(itemDate.format('H'));
                //     const dayDiff = itemDate.diff(moment(), 'days');
                //     return dayDiff >=0 && dayDiff < 5 && hour>=12 && hour <=15;
                // });

                setWeatherData(midDayForecast);
                return midDayForecast;
            }else{
                console.log('No forecast available for the selected date');
                setWeatherData(null);
                return null;
            }
        }catch(error){
            console.error('Error fetching weather data: ', error);
            setWeatherData(null);
            return null;
        };
    } 

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

                const isCompleted = typeof workout.is_completed === 'string'
                    ? workout.is_completed.toLowerCase() === 'true'
                    : Boolean(workout.is_completed);

                formattedWorkouts[workoutDate].push({
                    id: workout.workout_id.toString(),
                    name: workout.workout_name,
                    time: workoutTime,
                    distance: workout.distance,
                    duration: workout.duration,
                    calories: workout.calories,
                    pace: workout.pace,
                    is_completed : isCompleted
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
                {/* {!workout.is_completed && (
                    <TouchableOpacity
                    style={[styles.swipeAction, styles.completeAction]}
                    onPress={() => openCompleteWorkoutModal(workout)}>
                    <Ionicons name="checkmark-circle" size={20} color="white"/>
                    </TouchableOpacity>
                )} */}
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

    const openCompleteWorkoutModal = (workout) => {
        setWorkoutToComplete({
            id: workout.id,
            name: workout.name,
            time: workout.time
        });

        setCompleteWorkoutModal(true);
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
        const selectedDateString = day.dateString;
        setSelectedDate(selectedDateString);

        try{

            setIsLoading(true);
            const dayWorkouts = await fetchWorkoutsForDate(selectedDateString);
            setIsLoading(false);

            navigation.navigate('WorkoutDetailsScreen', {
                date: selectedDateString,
                workouts: dayWorkouts || []
            });
           
    }catch(error){
        console.error('Error fetching workout for date:', error);
        setIsLoading(false);
        navigation.navigate('WorkoutDetailsScreen', {
            date: selectedDateString,
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

            const validDate = moment(workoutPlan.date).isValid()
                ? moment(workoutPlan.date).format('YYYY-MM-DD')
                : moment().format('YYYY-MM-DD');

            const validTime = workoutPlan.time instanceof Date
                ? moment(workoutPlan.time).format('HH:mm:ss')
                : moment().format('HH:mm:ss')
            // const workoutDate = moment(workoutPlan.date).format('YYYY-MM-DD');
            // const workoutTime=moment(workoutPlan.time).format('HH:mm:ss');

            const formattedDate = validDate;

            const newWorkoutData = {
                user_id: userId,
                workout_name: workoutPlan.workoutType|| "Planned Workout",
                workout_date: validDate,
                start_time: validTime,
                is_completed: false,
            };
           
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
            if(!updatedAgendaItems[formattedDate]){
                updatedAgendaItems[formattedDate] = [];
            }
            updatedAgendaItems[formattedDate].push(newWorkout);
            setAgendaItems(updatedAgendaItems);

            setMarkedDates(prev => ({
                ...prev,
                [formattedDate]: {marked: true, dotColor: '#6200ee'}
            }));

            setWorkoutPlan({
                title: '',
                time: new Date(),
                date: moment().format('YYYY-MM-DD'),
                workoutType: ''
            });
            setPlanWorkoutModal(false);

            await fetchWorkoutData();
        }catch(error){
            console.error('Error saving workout plan: ', error);

            if(error.response){
                console.error('Error response data: ', error.response.data);
                console.error('Error response status: ', error.response.status);

            }
    }
};

const completeWorkout = async (workoutId, completionData) => {
    try{
        const workoutDetails = await axios.get(`${baseURL}/workout/get_workout/${workoutId}`);

        if(workoutDetails.data.is_completed){
            Alert.alert('Error', 'This workout is already marked as completed');
            return;
        }

        const updatedWorkoutData ={
            ...workoutDetails.data,
            distance: completionData.distance || 0,
            duration: completionData.duration || 0,
            calories_burned: completionData.calories || 0,
            pace : completionData.pace || 0,
            is_completed : true,
            end_time: completionData.end_time || workoutDetails.data.end_time
        };

        const response= await axios.put(`${baseURL}/workout/update_planned_workout/${workoutId}`,
            updatedWorkoutData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if(response.status === 200){

            const workoutDate = moment(workoutDetails.data.workout_date).format('YYYY-MM-DD');
            const updatedAgendaItems = { ...agendaItems};
            if(updatedAgendaItems[workoutDate]){
                updatedAgendaItems[workoutDate] = updatedAgendaItems[workoutDate].map(workout => {
                    if(workout.id == workoutId.toString()){
                        return {
                            ...workout,
                            is_completed: true,
                            distance: completionData.distance || 0,
                            duration: completionData.duration || 0,
                            calories: completionData.calories || 0,
                            pace: completionData.pace || 0,
                        };
                    }
                    return workout;
                });

                setAgendaItems(updatedAgendaItems);
            }
            fetchWorkoutData();
            Alert.alert('Success', 'Workout completed successfullt');
        }

    }catch(error){
        console.error('Error completing workout: ', error);
        Alert.alert('Error', 'Could not complete the workout. Please try again');
    }
};

const openPlanWorkoutModal = async (date) => {

    const selectedDate = date ? date: moment().format('YYYY-MM-DD');
    const weather = await fetchWeatherData(selectedDate);
    setWorkoutPlan(prev => ({
        ...prev,
        date: selectedDate,
        time: new Date(),
        workoutType: '',
        reminder: false
    }));

    setWeatherData(weather);
    console.log('Weather data for modal: ', weather);

    setPlanWorkoutModal(true);
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
    const handleAnalyzeProgress = async () => {
        if(!image1 || !image2){
            alert("Please upload both 'Before' and 'After' images first");
            return;
        }
        setIsAnalyzing(true);
        const result = await analyzeProgress(image1, image2);
        setAnalysisResult(result);
        setIsAnalyzing(false);
    };

    const renderAgendaItem = (item) => {
        return(
            <AgendaItem
            item={item}
            selectedDate={selectedDate}
            navigation={navigation}
            renderRightActions={renderRightActions}
            />
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
 

    const renderActiveSection = () =>{
        if(activeSection === 'agenda'){
            return (
                <View style={{flex: 1}}>
                <WorkoutAgenda
                agendaItems={agendaItems}
                selectedDate={selectedDate}
                renderItem={renderAgendaItem}
                setWorkoutPlan={setWorkoutPlan}
                setPlanWorkoutModal={openPlanWorkoutModal}/>

            </View>
            );
        }else{
            return(
                <View>
                    <ProgressTracker
                    image1={image1}
                    image2={image2}
                    uploadDate1={uploadDate1}
                    uploadDate2={uploadDate2}
                    PickProgessImage={PickProgessImage}
                    isAnalyzing={isAnalyzing}
                    handleAnalyzeProgress={handleAnalyzeProgress}
                    />

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
            )
        }
    };
        
 

    return (
    
        <SafeAreaView style={styles.container}>
            <View style={styles.tabContainer}>
            <TouchableOpacity 
            style={[styles.tabButton, activeSection === 'agenda' && styles.activeTab]}
            onPress={() => setActiveSection('agenda')}>
                <Text style={[styles.tabText, activeSection === 'agenda' && styles.activeTabText]}>Workouts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.tabButton, activeSection === 'progress' && styles.activeTab]}
            onPress={() => setActiveSection('progress')}>
                <Text style={[styles.tabText, activeSection === 'progress' && styles.activeTabTextt]}>Progress</Text>
            </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
                {renderActiveSection()}
            </View>
        
       <AddWorkoutModal
       visible={planWorkoutModal}
       onClose={() => setPlanWorkoutModal(false)}
       workoutPlan={workoutPlan}
       setWorkoutPlan={setWorkoutPlan}
       workouts={workouts}
       showTimePicker={showTimePicker}
       setShowTimePicker={setShowTimePicker}
       handleTimeChange={handleTimeChange}
       saveWorkoutPlan={saveWorkoutPlan}
       weatherData={weatherData}
       />

       <EditWorkoutModal
       visible={editWorkoutModal}
       onClose={()=> setEditWorkoutModal(false)}
       selectedWorkout={selectedWorkout}
       workouts={workouts}
       showTimePicker={showTimePicker}
       setShowTimePicker={setShowTimePicker}
       updateWorkout={updateWorkout}
       /> 

       <CompleteWorkoutModal
       visible={comppleteWorkoutModal}
       onClose={() => setCompleteWorkoutModal(false)}
       workout={workoutToComplete}
       completeWorkout={completeWorkout}
       />

        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        paddingBottom: 60
    },
    contentContainer: {
        flex:1,
        padding: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tabButton:{
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#6200ee',
    },
    tabText: {
        fontSize: 16,
        color: '#777',
    },  
    activeTabText: {
        color: '#6200ee',
        fontWeight: 'bold',
    },
    swipeActionsContainer: {
        flexDirection: 'row',
        width: 100,
    },swipeAction:{
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAction: {
        backgroundColor: '#6200ee',
    },
    deleteAction: {
        backgroundColor: 'red',
    },
    completeAction: {
        backgroundColor: '#4CAF50'
    },



   
 


});

export default CalendarScreen;
