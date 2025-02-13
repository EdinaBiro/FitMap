import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ImageBackground} from 'react-native'
import React, {useState, useEffect} from 'react';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView } from 'react-native-gesture-handler';



const ProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId]= useState(null);
  const [profile,setProfile] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '1',
    profileImage: 'https://via.placeholder.com/80'
  });

  useEffect( () => {
    (async () => {
      const {status: cameraStatus} = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus} = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if(cameraStatus !== 'granted' || mediaStatus !== 'granted'){
        alert('Prmission to access media library and camera is required');
      }

      if(userId){
        const response = await fetch(`http://127.0.0.1:8000/profile/${userId}`);
        console.log("Response status:", response.status);
        const data = await response.json();
        setProfile(data);
      }
    }) ();
  }, [userId]);

  const handleChange = (key,value) => {
    setProfile({...profile, [key]: value});
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const validateInput = () => {
    const {age, height, weight} = profile;
    if(!age || !height || !weight || isNaN(age) || isNaN(height) || isNaN(weight)){
      alert('Please provide valid numeric values for age, height and weight');
      return false;
    }
    return true;
  };

  const handleSave = async() =>  {
    if(validateInput()){
      try{
        const url= userId ? `http://127.0.0.1:8000/profile/${userId}` : `http://127.0.0.1:8000/profile`;
        const method = userId ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method : method,
          headers: {
            'Content-Type' : 'application/json'
          },
          body: JSON.stringify(profile)

        });

        if(response.ok){
          const data = await response.json();
          setProfile(data);
          if(!userId){
            setUserId(data.id);
          }
          toggleEdit();
          alert("Profile saved successfully");
        }else{
          const errorData = await response.json();
          alert("Error savong profile: ${errorData.detail || response.statusText} ")
          console.error("Error details:", errorData);
        }

      }catch(error){
        alert("An unexpected error occured: ${error.message}")
        console.error("Fetch error:", error);
      }
      toggleEdit();
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Image,
      allowsEditing: true,
      aspect: [1,1],
      quality: 1, 
    });

    if(!result.canceled) {
      setProfile({...profile, profileImage: result.assets[0].uri});
    }
  }

  return (

    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.overlay}>
      <View style={styles.card}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          <Image source={{uri: profile.profileImage}} style={styles.profileImage} />
        </TouchableOpacity>

        <Text style={styles.label}>Age </Text>
        <View style={styles.infoBox}>
          <TextInput 
            style={styles.input}
            editable={isEditing}
            value={profile.age}
            onChangeText={(text) => handleChange('age', text)}
            keyboardType="numeric"
      
        
          />
        </View>

        <Text style={styles.label}>Height(cm)</Text>
        <View style={styles.infoBox}>
          <TextInput
            style={styles.input}
            editable={isEditing}
            value={profile.height}
            onChangeText={(text) => handleChange('height', text)}
            keyboardType="numeric"

           />

        </View>

        <Text style={styles.label}>Weight(kg)</Text>
        <View style={styles.infoBox}>
          <TextInput
            style={styles.input}
            editable={isEditing}
            value={profile.weight}
            onChangeText={(text) => handleChange('weight', text)}
            keyboardType="numeric"

           />

        </View>

        <Text style={styles.label}>Gender</Text>
          <View style={styles.infoBox}>
            <Picker 
            selectedValue={profile.gender}
            style={styles.input}
            enabled={isEditing}
            onValueChange={(itemValue) => handleChange('gender', itemValue)}
            >
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Male" value="male" />
            </Picker>
        </View>

        <Text style={styles.label}>Activity Level: </Text>
        <View style={styles.infoBox}>
          <Picker
            selectedValue={profile.activityLevel}
            style={styles.input}
            enabled={isEditing}
            onValueChange={(itemValue) => handleChange('activityLevel', itemValue)}
          >
            <Picker.Item label="1 - Sedentary" value="1" />
            <Picker.Item label="2 - Lightly Active" value="2" />
            <Picker.Item label="3 - Moderately Active" value="3" />
            <Picker.Item label="4 - Very Active" value="4" />
            <Picker.Item label="5 - Super Active" value="5" />
          </Picker>
        </View>


      <TouchableOpacity style={styles.button} onPress={isEditing ? handleSave : toggleEdit}>
        <Text style={styles.buttonText}>{isEditing ? 'Save' : 'Edit Profile' }</Text>
      </TouchableOpacity>

      </View>
      </View>
      </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: '#fff',
    paddingToop: 20,
  },

  card:{
    width: "90%",
    minHeight: 500,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 10,
    elavation: 5,
    paddingTop: 200,
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  
  },

  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 80,
    marginBottom:10,
    alignSelf: 'center',
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "black",
    width: '100%',
    lineHeight: 20,
    color: '#333',
  },
  input:{
    borderColor: '#ccc',
    flex: 1,
    marginLeft: 0,
    fontSize: 16,
    color: "black",
    width: '80%',
    marginTop: 10
  },

  button: {
    marginTop: 50,
    backgroundColor: '#555',
    padding: 10,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#fff"
  },
  imageContainer: {
    position: 'absolute',
    top: 50,
    left: 120,
    width: 140,
    height: 140,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: "#fff",
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: "#fff",
    marginBottom: 20,
   
  },
  infoBox: {
    width: '100%',
    padding: 10,
    borderRadius: 30,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius:4,
    elevation: 3,
    marginBottom: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
scrollContainer:{
  flexGrow: 1,
  paddingBottom: 20,
},
title: {
  marginTop: 20,
  fontSize: 25,
  fontFamily: 'Open Sans',
  textAlign:'center',
  alignSelf: 'center',
},


});

export default ProfileScreen;