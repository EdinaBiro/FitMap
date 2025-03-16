import React, { useEffect, useState, useCallback } from 'react'; 
import { StyleSheet, View, Text, Button, Platform,  Modal, TextInput, Image, TouchableOpacity, PermissionsAndroid,ScrollView, FlatList, PixelRatio} from 'react-native';
import { Calendar } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useComposedEventHandler } from 'react-native-reanimated';
import Geolocation from '@react-native-community/geolocation';
import moment from 'moment';
import Emoji from 'react-native-emoji';
import RNPickerSelect from 'react-native-picker-select';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Agenda} from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';

const CalendarScreen = () => {

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [notes, setNotes] = useState({});
    const [images, setImages] = useState({});
    const [weather, setWeather] = useState('');
    const [daysOfWeek, setDaysOfWeek] = useState('');
    const [workouts, setWorkouts] = useState({});
    const [image1,setImage1] = useState(null);
    const [image2,setImage2] = useState(null);
    const [uploadDate1, setUploadDate1] = useState(null);
    const [uploadDate2, setUploadDate2] = useState(null);
    const [showDatePicker1, setShowDatePicker1] = useState(false);
    const [showDatePicker2, setShowDatePicker2] = useState(false);



    const navigation = useNavigation();
    const date = moment().format('YYYY.MM.DD');


    const fetchWeatherData = (latitude, longitude) => {
        fetch(`https://api.weatherapi.com/v1/current.json?key=e0deebe2af12488d89c123118250302&q=${latitude},${longitude}`)
            .then(response => response.json())
            .then(data => {
                setWeather(data.current.condition.text);
            })
            .catch(error => console.log(error));
    };

    // const requestLocationPermission = async () => {
    //     if(Platform.OS === 'android'){
    //         const granted = await PermissionsAndroid.request(
    //             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    //         );
    //         if(granted === PermissionsAndroid.RESULTS.GRANTED){
    //             console.log("Location permission granted");
    //             getUserLocation();
    //         }else{
    //             useComposedEventHandler.log("Location permission denied");
    //         }
    //     } else{
    //         getUserLocation();
    //     }
    // };



    // useEffect(() => {
    //     requestLocationPermission();
    // }, []);

    const onDayPress = (day) => {
        setSelectedDate(day.dateString);
        setSelectedEvent('');
        setDaysOfWeek(moment(day.dateString).format('dddd'));

        const workoutForDay = workouts[day.dateString] || {distance: 0, duration: 0, calories: 0};
        setModalVisible(true);
    };

    const saveNote = () => {
        setModalVisible(false);
    };

    const handleEventChange = (event) => {
        setSelectedEvent(event);
    };

    const getEventOptions = () => {
        return events[selectedDate] ?
         events[selectedDate].map((event, index) => ({
            label: '${event.time} - ${event.title}',
            value: event.title,
         }))
         : [];
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

   
 
    return (
      <ScrollView contentContainerStyle={styles.scrollViewContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
            <View style={styles.calendarContainer}>
                <Calendar
                markedDates={{
                    [selectedDate]: {selected: true, selectedColor: 'purple', selectedTextColor: 'white'}
                }}
                    onDayPress={ onDayPress}
                    style={styles.calednar}
                />
            <SafeAreaView style={styles.agenda}>
                <Agenda 
                    items={{
                        '2025-03-15': [{name: 'Run', data:'Outdoor Running'}],
                        '2025-03-17': [{name: 'Walking', data:'Outdoor walking'}],
                    }}

                    renderItem={(item, isFirst) =>(
                        <TouchableOpacity style={styles.item}>
                            <Text style={styles.itemText}>{item.name}</Text>
                            <Text style={styles.itemText}>{item.data}</Text>

                        </TouchableOpacity>
                    ) }
                />
            </SafeAreaView>

    
        <Modal visible={modalVisible} animationType="slide">
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

        </Modal>

        <Text style={styles.textProgress}>Let's track your progress</Text>
        <Text style={styles.subtitle}>See the changes week by week</Text>

        <View style={styles.progressCard}>
            <View style={styles.imageContainer}>
                <TouchableOpacity style={styles.uploadButton} onPress={() => PickProgessImage(1)}>
                    {image1 ? (
                        <Image source={{uri: image1}} style={styles.image}/>
                    ):(
                        <Text>Upload Image</Text>
                       
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
                        <Text>Upload Image</Text>
                       
                    )}
                    </TouchableOpacity>
                    {uploadDate2 && <Text style={styles.dateText}>{moment(uploadDate2).format('YYYY-MM-DD HH:mm')}</Text>}
                    {showDatePicker2 && (
                        <DateTimePicker 
                            testId="dateTimePicker2"
                            value={uploadDate2 || new Date()}
                            mode="datetime"
                            is24Hour={true}
                            display="default"
                            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 2)} />
                    )}
                
            </View>
            
         </View>

         </View>
        </View>
        </ScrollView>  
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        padding: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        position: 'absolute',
        top: 0,
        left: 0,
        marginTop: 20,
        marginLeft: 15,
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
    logoutButton:{
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
        borderRadius: 5,
    },
    cardContainer:{
        marginTop: 20,
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

        top: 10,
        width: 400,
        padding: 30,
        marginBottom:20,
    },
    calednar: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
    },
    list: {
        flex: 1,
        marginTop: 100,
        width: '100%',
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
});

export default CalendarScreen;
