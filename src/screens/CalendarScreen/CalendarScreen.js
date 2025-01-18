import React, { useEffect, useState } from 'react'; // Hozzáadtam az useState importot
import { StyleSheet, View, Text, Button, Platform,  Modal, TextInput, Image, TouchableOpacity} from 'react-native';
import * as ExpoCalendar from 'expo-calendar';
import { Calendar as RNCalendar } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';

const CalendarScreen = () => {

    //const [calendarEvents, setCalendarEvents] = useState([]);
    const[selectedDate, setSelectedDate] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [notes, setNotes] = useState({});
    const [images, setImages] = useState({});

    //datum kivalasztasakor modal megjelenitese
    const onDayPress = (day) => {
        setSelectedDate(day.dateString);
        setModalVisible(true);
    };

    const saveNote = () => {
        setModalVisible(false);
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
                [selectedDate]: result.asstes[0].uri,
            }));
        }
    };
    // useEffect(() => {
    //     (async () => {
    //         const { status } = await Calendar.requestCalendarPermissionsAsync();
    //         if (status === 'granted') {
    //             const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    //             console.log("Here are all your calendars");
    //             console.log({ calendars });

    //             if (calendars.length > 0) {
    //                 const events = await Calendar.getEventsAsync(
    //                     [calendars[0].id],
    //                     new Date().toISOString(),
    //                     new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
    //                 );
    //                 setCalendarEvents(events);
    //             }
    //         }
    //     })();
    // }, []);

    // // Formázott események
    // const formattedEvents = calendarEvents.reduce((acc, event) => {
    //     const eventDate = event.startDate.split('T')[0];
    //     if (!acc[eventDate]) {
    //         acc[eventDate] = [];
    //     }
    //     acc[eventDate].push(event.title);
    //     return acc;
    // }, {});

    // const createCalendar = async () => {
    //     const defaultCalendarSource = 
    //         Platform.OS === 'ios'
    //             ? await getDefaultCalendarSource()
    //             : { isLocalAccount: true, name: 'Expo Calendar' };
        
    //     const newCalendarID = await Calendar.createCalendarAsync({
    //         title: 'Expo Calendar',
    //         color: 'blue',
    //         entityType: Calendar.EntityTypes.EVENT,
    //         sourceId: defaultCalendarSource.id,
    //         source: defaultCalendarSource,
    //         name: 'internalCalendarName',
    //         ownerAccount: 'personal',
    //         accessLevel: Calendar.CalendarAccessLevel.OWNER,
    //     });
    //     console.log(`Your new calendar ID is: ${newCalendarID}`);
    // };

    // async function getDefaultCalendarSource() {
    //     const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    //     return defaultCalendar.source;
    // }

    return (
        <View style={styles.container}>
            <RNCalendar
             onDayPress={onDayPress}
             monthFormat={'MMMM yyyy'}
             makingType={'custom'}
             markedDates={{
                ...Object.keys(notes).reduce((acc,date) => {
                    acc[date]= {marked: true, dotColor: 'blue'};
                    return acc;
                }, {}),
            }}
        />
        <Modal visible={modalVisible} animationType='slide'>
            <View style = {styles.modalContainer}>
                <Text style = {styles.modalTitle}>Notes for {selectedDate}</Text>
                <TextInput
                    style = {styles.TextInput}
                    placeholder='Write your notes here...'
                    value={notes[selectedDate] || ''}
                    onChangeText={ (text) => setNotes({...notes, [selectedDate]: text})}
                />
                <TouchableOpacity onPress = {pickImage} style={styles.imageButton}>
                    <Text style = {styles.imageButtonText}>Pick an image</Text>
                </TouchableOpacity>
                {images[selectedDate] && (
                    <Image source={{ uri: images[selectedDate]}} style ={styles.imagePreview} />
                )}
                <Button title = "Save" onPress={saveNote} />
                <Button title = "Close" onPress={() => setModalVisible(false)} />

            </View>
        </Modal>
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
        justifyContent: 'cneter',
        alignItems: 'center',
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    tetxInput: {
        width: '100%',
        height: 100,
        borderWidth: 1,
        boderColor: '#acc',
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
    }
});

export default CalendarScreen;
