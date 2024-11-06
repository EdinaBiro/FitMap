import { StyleSheet, Text, View, Image, ScrollView} from 'react-native'
import React from 'react';
import CustomInput from '../..//components/CustomInput';
import {useState} from 'react';
import CustomButton from '../../components/CustomButton';
import { useNavigation } from 'expo-router';
import {useForm} from 'react-hook-form';


const NewPasswordScreen= () => {

  
    const {control,handleSubmit} = useState();
    const navigation = useNavigation();

    const onSubmitPressed = (data) => {
      console.warn(data);
      navigation.navigate('Home');
    }

    const onSignInPressed = () => {
      navigation.navigate('LoginScreen');
    }

   

  return (
    <ScrollView showsHorizontalScrollIndicator={false}>
    <View style = {styles.root}>
     <Text style={styles.title}>Reset your password</Text>

      <CustomInput 
      name = "code"
      placeholder="Code" 
      control={control}
      rules = {{
          required: 'Code is required'
      }}
     
      /> 

     <CustomInput 
      name = "password"
      placeholder="Enter your new password" 
      control={control}
      secureTextEntry
      rules = {{
        required: 'Password is required',
         minLength: {
          value: 8, 
          message: 'Username should be at least 8 characters long'
         },
         maxLength: {
          value: 24,
          message: 'Password should be at most 24 characters long'
         }

        }}
     
      /> 

      <CustomButton text="Submit" onPress={handleSubmit(onSubmitPressed)}/>
    
      <CustomButton 
      text="Back to Sign in" 
      onPress={onSignInPressed}
      type="SECONDARY"
      />


    </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  
    root:{
        alignItems: 'center',
        padding: 50,
    },
    title:{
      fontSize: 25,
      fontWeight: 'bold',
      color: "#051C60",
      margint: 10,
      marginTop: 10,
      padding: 10,
      marginBottom: 10,
    },
    text:{
      marginVertical: 10,
      color: 'gray',
    },
    link: {
      color: '#FDB075',
    }
});



export default NewPasswordScreen;
