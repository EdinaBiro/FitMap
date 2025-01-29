import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput} from 'react-native'
import React, {useState} from 'react';



const ProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile,setProfile] = useState({
    age: '',
    gender: '',
    height: '',
    weight: ''
  });

  const handleChange = (key,value) => {
    setProfile({...profile, [key]: value});
  }

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source= {{ uri: 'https://via.placeholder.com/80' }} style={styles.profileImage} />

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

        {/* <View style={styles.infoContainer}>
          <Text style={styles.label}>Gender</Text>
          {isEditing ? (
            <Picker 
            selectedValue={profile.gender}
            style={styles.input}
            onValueChange={(itemValue) => handleChange('gender', itemValue)}
            >
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Male" value="male" />
            </Picker>
          ) : (
            <TextInput 
            style={styles.input}
            editable={false}
            value={profile.gender}
            /> */}

          {/* )}
         */}

        </View>

      <TouchableOpacity style={styles.button} onPress={toggleEdit}>
        <Text style={styles.buttonText}>{isEditing ? 'Save' : 'Edit Profile' }</Text>
      </TouchableOpacity>

      </View>
      // </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#274e13",
  },

  card:{
    width: "90%",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elavation: 5,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginmarginBottom:10,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input:{
    borderBottomWidth: 1,
    borderColor: '#ccc',
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },

  button: {
    marginTop: 20,
    backgroundColor: '#b6e28d',
    padding: 10,
    borderRadius: 10,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },


});

export default ProfileScreen;