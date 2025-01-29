import React, { useEffect, useState, useCallback } from 'react'; 
import { StyleSheet, View, Text, Button, Platform,  Modal, TextInput, Image, TouchableOpacity} from 'react-native';
import * as ExpoCalendar from 'expo-calendar';
import { Calendar } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

const CalendarScreen = () => {

    //const [calendarEvents, setCalendarEvents] = useState([]);
    const[selectedDate, setSelectedDate] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [notes, setNotes] = useState({});
    const [images, setImages] = useState({});
    const navigation = useNavigation();


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

 
    
    return (
        <View style={styles.container}>
            <Calendar style={{
                borderWidth: 1,
                borderColor: 'gray',
                height: 350
            }}
            theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#00adf5',
                selectedDayTextColor: '#ffffff',
                todatTextColor: '#00adf5',
                dayTextColor: '#2d4150',
                textDisabledColor: '#dd99ee'
            }}
            //  onDayPress={onDayPress}
            //  monthFormat={'MMMM yyyy'}
            //  makingType={'custom'}
            //  markedDates={{
            //     ...Object.keys(notes).reduce((acc,date) => {
            //         acc[date]= {marked: true, dotColor: 'blue'};
            //         return acc;
            //     }, {}),
            // }}
        />
        <Modal visible={modalVisible} animationType='slide'>
            <View style = {styles.modalContainer}>
                <Text style = {styles.modalTitle}>Notes for {selectedDate}</Text>
                <TextInput
                    style = {styles.textInput}
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
    textInput: {
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
});

export default CalendarScreen;
