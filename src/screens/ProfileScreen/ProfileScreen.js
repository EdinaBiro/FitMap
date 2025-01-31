import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ImageBackground} from 'react-native'
import React, {useState, useEffect} from 'react';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';



const ProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
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
    }) ();
  }, []);

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

  const handleSave = () =>  {
    if(validateInput()){
      toggleEdit();
    }
  };

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
    <ImageBackground source={require('../../../assets/images/bg2.jpg')} style={styles.container}>
      <View style={styles.overlay} />
      <View style={styles.card}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          <Image source={{uri: profile.profileImage}} style={styles.profileImage} />
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Age: </Text>
          <TextInput 
            style={styles.input}
            editable={isEditing}
            value={profile.age}
            onChangeText={(text) => handleChange('age', text)}
            keyboardType="numeric"
      
        
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Height</Text>
          <TextInput
            style={styles.input}
            editable={isEditing}
            value={profile.height}
            onChangeText={(text) => handleChange('height', text)}
            keyboardType="numeric"

           />

        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Weight</Text>
          <TextInput
            style={styles.input}
            editable={isEditing}
            value={profile.weight}
            onChangeText={(text) => handleChange('weight', text)}
            keyboardType="numeric"

           />

        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Gender</Text>
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
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Activity Level: </Text>
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
      </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },

  card:{
    width: "90%",
    height: "80%",
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 25,
    borderRadius: 15,
    alignItems: 'flex-start',
    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 10,
    elavation: 5,
    position: 'realtive',
    paddingTop: 60,
  
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom:10,
    alignSelf: 'flex-start',
  },
  infoContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
    alignItems:'center',
   
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#fff",
    width: '40%',
  },
  input:{
    borderBottomWidth: 1,
    borderColor: '#ccc',
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#fff",
  },

  button: {
    marginTop: 25,
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
    top: -50,
    left: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: "#fff",
   
  }


});

export default ProfileScreen;