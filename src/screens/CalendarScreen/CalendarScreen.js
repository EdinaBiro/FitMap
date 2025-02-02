import React, { useEffect, useState, useCallback } from 'react'; 
import { StyleSheet, View, Text, Button, Platform,  Modal, TextInput, Image, TouchableOpacity, PermissionsAndroid,ScrollView, FlatList} from 'react-native';
import * as ExpoCalendar from 'expo-calendar';
import { Calendar } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useComposedEventHandler } from 'react-native-reanimated';
import Geolocation from '@react-native-community/geolocation';

const CalendarScreen = () => {

    //const [calendarEvents, setCalendarEvents] = useState([]);
    const[selectedDate, setSelectedDate] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [notes, setNotes] = useState({});
    const [images, setImages] = useState({});
    const navigation = useNavigation();


    const [routes, setRoutes] = useState([]);
    const [userLocation, setUserLocation] = useState(null);

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
                    onDayPress={ (day) => setSelectedDate(day.dateString)}
                    style={styles.calednar}/>
            </View>
        <View style={{flex: 1}} >
            <FlatList
                data={routes}
                renderItem={renderRouteCard}
                keyExtractor={(item) => item.id}
                style={styles.list}
                showVerticalScrollIndicator={false} />
        </View>

         </View>
        //     <Text style={styles.title}>Random Running Routes</Text>
        //     <Button title="Generated Routes" onPress={generateRandomRoute} />

        //     <ScrollView horizontal style={styles.cardContainer}>
        //         <FlatList
        //             data={routes}
        //             renderItem={renderRouteCard}
        //             keyExtractor={(item) => item.id}
        //             horizontal
        //             showsHorizontalScrollIndicator={false}
        //         />
        //     </ScrollView>
        // </View>
       
    );

    // //datum kivalasztasakor modal megjelenitese
    // const onDayPress = (day) => {
    //     setSelectedDate(day.dateString);
    //     setModalVisible(true);
    // };

    // const saveNote = () => {
    //     setModalVisible(false);
    // };

    // const pickImage = async() => {
    //     const result = await ImagePicker.launchImageLibraryAsync({
    //         mediaType: ImagePicker.MediaTypeOptions.Images,
    //         allowsEditing: true,
    //         aspect: [4,3],
    //         quality: 1,
    //     });
    //     if( !result.canceled){
    //         setImages((prev) => ({
    //             ...prev,
    //             [selectedDate]: result.asstes[0].uri,
    //         }));
    //     }
    // };

 
    
    // return (
    //     <View style={styles.container}>
    //         <Calendar style={{
    //             borderWidth: 1,
    //             borderColor: 'gray',
    //             height: 350
    //         }}
    //         theme={{
    //             backgroundColor: '#ffffff',
    //             calendarBackground: '#ffffff',
    //             textSectionTitleColor: '#b6c1cd',
    //             selectedDayBackgroundColor: '#00adf5',
    //             selectedDayTextColor: '#ffffff',
    //             todatTextColor: '#00adf5',
    //             dayTextColor: '#2d4150',
    //             textDisabledColor: '#dd99ee'
    //         }}
    //         //  onDayPress={onDayPress}
    //         //  monthFormat={'MMMM yyyy'}
    //         //  makingType={'custom'}
    //         //  markedDates={{
    //         //     ...Object.keys(notes).reduce((acc,date) => {
    //         //         acc[date]= {marked: true, dotColor: 'blue'};
    //         //         return acc;
    //         //     }, {}),
    //         // }}
    //     />
    //     <Modal visible={modalVisible} animationType='slide'>
    //         <View style = {styles.modalContainer}>
    //             <Text style = {styles.modalTitle}>Notes for {selectedDate}</Text>
    //             <TextInput
    //                 style = {styles.textInput}
    //                 placeholder='Write your notes here...'
    //                 value={notes[selectedDate] || ''}
    //                 onChangeText={ (text) => setNotes({...notes, [selectedDate]: text})}
    //             />
    //             <TouchableOpacity onPress = {pickImage} style={styles.imageButton}>
    //                 <Text style = {styles.imageButtonText}>Pick an image</Text>
    //             </TouchableOpacity>
    //             {images[selectedDate] && (
    //                 <Image source={{ uri: images[selectedDate]}} style ={styles.imagePreview} />
    //             )}
    //             <Button title = "Save" onPress={saveNote} />
    //             <Button title = "Close" onPress={() => setModalVisible(false)} />

    //         </View>
    //     </Modal>

        
    //     </View>
    // );
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
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
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
});

export default CalendarScreen;
