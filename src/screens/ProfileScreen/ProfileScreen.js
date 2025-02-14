import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ImageBackground} from 'react-native'
import React, {useState, useEffect} from 'react';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView } from 'react-native-gesture-handler';



const ProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [bmi, setBmi] = useState(null);
  const [hoverText, setHoverText] = useState('');
  const [activityLevel, setActivityLevel] = useState('1');
  const [profile,setProfile] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '1',
    profileImage: 'https://via.placeholder.com/80'
  });

  const activityTexts = {
    1: 'Sedentary - Little or no exercise',
    2: 'Lightly Active - Light exercise/sports 1-3 days/week',
    3: 'Moderately Active - Moderate exercise/sports 3-5 days/week',
    4: 'Very Active - Hard exercise/sports 6-7 days a week',
    5: 'Super Active - Very hard exercise/sports & physical job or training twice a day'
  };

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
  }, []);

  useEffect( () => {
    calculateBMI();
  }, [profile.height, profile.weight]);

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
      calculateBMI();
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

  const calculateBMI = () => {
    const {height, weight} = profile;
    if( height && weight && !isNaN(height) && !isNaN(weight)) {
       const heightInMeters = height / 100;
      const bmiValue = weight / (heightInMeters * heightInMeters);
      setBmi(bmiValue.toFixed(1));
      }
      else{
        setBmi(null);
      }
   
  };

  const handleActivityLevelChange = (level) => {
    setProfile({...profile, activityLevel: level});
    setHoverText(activityTexts[level]);
  };



  return (

    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.profileContainer}>

        <View style ={styles.profileOverlay}>
        <Text style={styles.title}>Profile</Text>
        </View>
      </View>
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

        <Text style={styles.label}>Acivity Level</Text>
        <View style={styles.activityLevelContainer}>
          {[1,2,3,4,5].map((level) => (
            <TouchableOpacity
              key ={ level}
              style={[styles.circle, profile.activityLevel == level && styles.selectedButton]}
              onPress={ () => handleActivityLevelChange(level.toString())}
            >
              <Text style={styles.activityButtonText}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {hoverText ? (
          <Text style={styles.hoverText}>{hoverText}</Text>
        ): null}

        <View style={styles.bmiContainer}>
          <Text style={styles.bmiTitle}>YOUR BMI</Text>
          <Text>{bmi ? bmi: 'BMI will be calculated once you enter your details'}</Text>
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
    textAlign: 'left',
  },
  input:{
    borderColor: '#ccc',
    flex: 1,
    marginLeft: 0,
    fontSize: 16,
    color: "black",
    width: '80%',
    marginTop: 10,
    
  },

  button: {
    marginTop: 30,
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
    top: 30,
    left: 100,
    width: 140,
    height: 140,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: "#fff",
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: "#fff",
    marginBottom: 20,
    backgroundColor: 'gray',
    
   
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
    marginBottom: 10
    
  },
scrollContainer:{
  flexGrow: 1,
  paddingBottom: 20,
  alignItems: 'center',
},
title: {
  marginTop: 20,
  fontSize: 25,
  fontFamily: 'Open Sans',
  textAlign:'center',
  alignSelf: 'center',
},
bmiContainer:{
  witdh: '100%',
  padding: 20,
  backgroundColor:'#f5f5f5',
  borderRadius: 10,
  marginTop: 20,
  marginBottom: 20,
  alignItems: 'center',
},
bmiTitle: {
  fontSize: 18, 
  fontWeight: 'bold',
  marginBottom: 10,
},
activityLevelContainer:{
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '80%',
  marginTop: 20,
},
circle: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#f0f0f0',
  justifyContent: 'center',
  alignItems: 'center',

},
selectedButton: {
  backgroundColor: '#4CAF50',
},
activityButtonText:{
  color: '#333',
  fontSize: 18,
},
hoverText: {
  fontSize: 16,
  fontStyle: 'italic',
  color: '#888',
  marginTop: 10,
}



});

export default ProfileScreen;