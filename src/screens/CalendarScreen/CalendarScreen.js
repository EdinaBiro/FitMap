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

const CalendarScreen = () => {

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [notes, setNotes] = useState({});
    const [images, setImages] = useState({});
    const [weather, setWeather] = useState('');
    const [daysOfWeek, setDaysOfWeek] = useState('');
    const [workouts, setWorkouts] = useState({});

    const navigation = useNavigation();
    const date = moment().format('YYYY.MM.DD');

    const [routes, setRoutes] = useState([]);
    const [userLocation, setUserLocation] = useState(null);

    const [events, setEvents] = useState({
        '2025-02-03': [{time: '10:00', title: 'Edzes: joga'}, {time: '14:00', title: 'Edzes: szaladas'}],
        '2025-02-10': [{time: '10:00', title: 'Edzes: joga'}, {time: '14:00', title: 'Edzes: szaladas'}],
    })

 

    const fetchWeatherData = (latitude, longitude) => {
        fetch(`https://api.weatherapi.com/v1/current.json?key=e0deebe2af12488d89c123118250302&q=${latitude},${longitude}`)
            .then(response => response.json())
            .then(data => {
                setWeather(data.current.condition.text);
            })
            .catch(error => console.log(error));
    };

    const requestLocationPermission = async () => {
        if(Platform.OS === 'android'){
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            if(granted === PermissionsAndroid.RESULTS.GRANTED){
                console.log("Location permission granted");
                getUserLocation();
            }else{
                useComposedEventHandler.log("Location permission denied");
            }
        } else{
            getUserLocation();
        }
    };

    const getUserLocation = () => {
        Geolocation.getCurrentPosition(
            position => {
                const {latitude, longitude} = position.coords;
                console.log("User location: ", latitude, longitude);
                setUserLocation({latitude, longitude});
                generateRandomRoute({latitude, longitude});
            },
            error => console.log(error.message),
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        );
    };

    const generateRandomRoute = (userLocation) => {
        if(userLocation){
        const randomDistance = (Math.random() * 10 +1).toFixed(1);
        const startCoords = userLocation;

        const endCoords = {
            latitude: userLocation.latitude + (Math.random() * 0.1 - 0.05), 
            longitude: userLocation.longitude + (Math.random() * 0.1 - 0.05) 
        };

        const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&markers=color:red%7Clabel:S%7C${startCoords.latitude},${startCoords.longitude}&markers=color:red%7Clabel:E%7C${endCoords.lat},${endCoords.lng}&path=color:0x0000ff%7C${startCoords.latitude},${startCoords.longitude}%7C${endCoords.lat},${endCoords.lng}&key=AIzaSyAGcodZd433BbtGC9oCVIMZlOuHuBPJ8Gk`;

        console.log("Map Image URL:", mapImageUrl);

        const randomRoute = {
            id: Math.random().toString(),
            distance: randomDistance,
            routeImage: mapImageUrl, 
            description: `Run ${randomDistance} km `,
        };
        setRoutes(prevRoutes => [randomRoute, ...prevRoutes]);
    }else{
        console.log("User location not available");
    }
    };

    useEffect(() => {
        requestLocationPermission();
    }, []);

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

    const addWorkoutToAgenda = () => {
        const newWorkout = {
            date: selectedDate,
            time: workoutTime,
            description: workoutDescription,
        };

        setWorkouts(prev => [...prev,newWorkout]);
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

    const renderRouteCard = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.routeImage }} style={styles.cardImage} />
            <Text style={styles.cardTitle}>Run {item.distance} km</Text>
            <Text>{item.description}</Text>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
        </View>
    );
    return (
        <View style={styles.container}>
            <View style={styles.calendarContainer}>
                <Calendar
                markedDates={{
                    [selectedDate]: {selected: true, selectedColor: 'blue', selectedTextColor: 'white'}
                }}
                    onDayPress={ onDayPress}
                    style={styles.calednar}
                />

            <View style={styles.agenda}>
                {selectedDate && (
                    <View>
                        <Text style={styles.dateText}>Selected Date: {selectedDate}</Text>

                        <RNPickerSelect
                            onValueChange={handleEventChange}
                            items={getEventOptions()}
                            placeholder={{label: '...', value: null}}
                            value={selectedEvent}
                            styles={pickerStyles}
                        />
                    {selectedEvent && (
                        <Text style={styles.eventText}>Kivalasztott esemeny: {selectedEvent}</Text>
                    )} 
                    
                    </View>
                )}
            </View>
        <View style={{flex: 1}} >
            <FlatList
                data={routes}
                renderItem={renderRouteCard}
                keyExtractor={(item) => item.id}
                style={styles.list}
                showVerticalScrollIndicator={false} />
        </View>
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

         </View>
         
            <Text style={styles.title}>Random Running Routes</Text>
            <Button title="Generated Routes" onPress={generateRandomRoute} />

            <ScrollView horizontal style={styles.cardContainer}>
                 <FlatList
                     data={routes}
                   renderItem={renderRouteCard}
                    keyExtractor={(item) => item.id}
                    horizontal
                 showsHorizontalScrollIndicator={false}
                />
            </ScrollView>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: 'center',
        justifyContent: 'center',
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
        position: 'absolute',
        top: 10,
        right: 10,
        width: 300,
    },
    calednar: {
        borderWidth: 1,
        borderColor: 'gray',
    },
    list: {
        flex: 1,
        marginTop: 100,
        witdh: '100%',
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
});

export default CalendarScreen;
