import { StyleSheet, Text, View, Image, ScrollView} from 'react-native'
import React from 'react';
import CustomInput from '../../components/CustomInput';
import {useState} from 'react';
import CustomButton from '../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import {useForm} from 'react-hook-form';


const ConfirmEmailScreen = () => {

    const {control,handleSubmit}=useForm();

    const navigation = useNavigation();

    const onConfirmPressed = (data) => {
      console.warn(data);
      navigation.navigate("HomeScreen");
    }

    const onSignInPressed = () => {
      navigation.navigate("LoginScreen");
    }

    const onResendPressed = () => {
        console.warn("Resend");
    }

  return (
    <ScrollView showsHorizontalScrollIndicator={false}>
    <View style = {styles.root}>
     <Text style={styles.title}> Confirm your email</Text>

      <CustomInput 
      name="control"
      control={control}
      placeholder="Enter your confirmation code" 
      rules={{
        required: 'Confirmation code is required'
      }}

      />

      <CustomButton text="Confirm" onPress={handleSubmit(onConfirmPressed)}/>

      <CustomButton 
      text="Resend code" 
      onPress={onResendPressed}
      type="SECONDARY"
      />
    
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
      fontSize: 30,
      fontWeight: 'bold',
      color: "#051C60",
      margint: 10,
    },
    text:{
      marginVertical: 10,
      color: 'gray',
    },
    link: {
      color: '#FDB075',
    }
});



export default ConfirmEmailScreen;
