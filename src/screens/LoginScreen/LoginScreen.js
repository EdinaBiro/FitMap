import { StyleSheet, Text, View, Image, useWindowDimensions, ScrollView} from 'react-native'
import Logo from '../../../assets/images/logo.png';
import React from 'react';
import CustomInput from '../../components/CustomInput/CustomInput';
import {useState} from 'react';
import CustomButton from '../../components/CustomButton/CustomButton';
import { useNavigation } from 'expo-router';
import { TextInput } from 'react-native-gesture-handler';
import {useForm,Controller} from 'react-hook-form';

const LoginScreen = () => {

    const {height} = useWindowDimensions();
    const navigation = useNavigation();

    const {control,handleSubmit,formState: {errors}} = useForm();
  

    const onLoginPressed = () => {
      //validate user

      navigation.navigate('Home');
    }

    const onForgotPasswordPressed = () => {

      navigation.navigate("ForgotPasswordScreen");
    }

    const onSignUpPressed = () => {
      navigation.navigate("SignUpScreen");

    }

  return (
    <ScrollView showsHorizontalScrollIndicator={false}>
    <View style = {styles.root}>
      <Image source={Logo} 
      style={[styles.logo, {height: height * 0.4 }]} 
      resizeMode="contain"
      />


      <CustomInput 
      name="username" 
      placeholder="Username" 
      control={control} 
      rules={{required: 'Username is required'}}
       />

      <CustomInput 
      name="password"
      placeholder="Password" 
      secureTextEntry={true}
      control={control}
      rules={{required: 'Password is required',minLength: {value:3, message:'Password should be minimum ${value} characters long',magLength:  {value:15, message:'Password should be maximum ${value} characters long'  }}}}
      />


      <CustomButton text="Log in" onPress={handleSubmit(onLoginPressed)}/>

      <CustomButton 
      text="Forgot Password" 
      onPress={onForgotPasswordPressed}
      type="TERTIARY"
      />
  
      <CustomButton 
      text="Don't have an account? Create one" 
      onPress={onSignUpPressed}
      type="TERTIARY"
      />


    </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
    logo: {
        width: '100%',
        height: undefined,
        aspectRatio: 1.5,
        maxHeight: 700,
        maxWidth: 700,
        marginBottom: 10,
    },
    root:{
        alignItems: 'center',
        padding: 20,
    },
});



export default LoginScreen;
