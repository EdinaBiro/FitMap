import { StyleSheet, Text, View, Image, ScrollView} from 'react-native'
import React from 'react';
import CustomInput from '../../components/CustomInput';
import {useState} from 'react';
import CustomButton from '../../components/CustomButton';
import SocialSignInButtons from '../../components/SocialSignInButtons';
import { useNavigation } from '@react-navigation/native';

import { useForm } from 'react-hook-form';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;


const SignUpScreen = () => {

    const {control,handleSubmit, watch} = useForm();
    const pwd = watch('password');
    const navigation = useNavigation();

    const onRegisterPressed = () => {
      navigation.navigate("LoginScreen");
    }

    const onSignInPressed = () => {
      navigation.navigate("LoginScreen");

    }

    const onPrivacyPressed = () =>{
      console.warn("Privacy");
    }

    const onTermsOfUsePressed =() => {
      console.warn("Terms of use");
    }

  return (
    <ScrollView showsHorizontalScrollIndicator={false}>
    <View style = {styles.root}>
     <Text style={styles.title}> Create an account</Text>

      <CustomInput 
      name="username"
      control={control}
      placeholder="Username"  
      rules=   {{required: 'Username is required', minLength: {value: 3, message: 'Username should be at least 3 characters long', maxLength: {value:24 , message: 'Username should be at least 24 characters long'},}}}
      />

      <CustomInput 
      name="email"
      placeholder="Email" 
      control={control}
      rules = {{pattern:{value: EMAIL_REGEX, messag: 'Email is invalid'}}}
      />

      <CustomInput 
      name="password"
      placeholder="Password" 
      control={control}
      secureTextEntry
      rules={{required: 'Password is required', minLength: {value: 8, message: 'Password should be at least 8 characters long', maxLength: {value:24 , message: 'Password should be at least 24 characters long'},}}}
      />

      <CustomInput 
      name="password-repeat"
      placeholder="Repeat Password" 
      control={control}
      secureTextEntry
      rules={{
        validate: value => 
          value == pwd || 'Password do not match',
      }}
      />

      <CustomButton text="Register" onPress={handleSubmit(onRegisterPressed)}/>
      
      <Text style={styles.text}>By registering, you confirm that you accept our{' '} 
      <Text style= {styles.link} onPress={onTermsOfUsePressed}>
        Terms of Use</Text> {' '}
          and {' '}
      <Text style={styles.link} onPress ={onPrivacyPressed} > 
        Privacy Policy</Text> 
      </Text>


     <SocialSignInButtons />
    
      <CustomButton 
      text="Have an account? Sign In" 
      onPress={onSignInPressed}
      type="TERTIARY"
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



export default SignUpScreen;
