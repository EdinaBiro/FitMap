import { StyleSheet, Text, View, Image, useWindowDimensions, ScrollView} from 'react-native'
import Logo from '../../assets/images/1.png';
import React from 'react';
import CustomInput from '../components/CustomInput/CustomInput';
import {useState} from 'react';
import CustomButton from '../components/CustomButton/CustomButton';


const LoginScreen = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const {height} = useWindowDimensions();

    const onLoginPressed = () => {
      console.warn("Log in");
    }

    const onForgotPasswordPressed = () => {
      console.warn("Forgot password");
    }

    const onLoginApple = () => {
      console.warn("Apple");
    }

    const onLoginFacebook =() => {
      console.warn("Facebook");
    }

    const onLoginGoogle = () => {
      console.warn("Google");
    }

    const onSignUpPressed = () => {
      console.warn("Sign up");
    }

  return (
    <ScrollView showsHorizontalScrollIndicator={false}>
    <View style = {styles.root}>
      <Image source={Logo} 
      style={[styles.logo, {height: height * 0.4 }]} 
      resizeMode="contain"
      />

      <CustomInput 
      placeholder="Username" 
      value={username} 
      setValue={setUsername}
    
      />

      <CustomInput 
      placeholder="Password" 
      value={password} 
      setValue={setPassword}
      secureTextEntry={true}
      />

      <CustomButton text="Log in" onPress={onLoginPressed}/>

      <CustomButton 
      text="Forgot Password" 
      onPress={onForgotPasswordPressed}
      type="TERTIARY"
      />

    <CustomButton 
    text="Log in with Facebook" 
    onPress={onLoginFacebook}
    bgColor="#E7EAF4"
    fgColor="#4764A9"
    />

    <CustomButton 
    text="Log in with Google" 
    onPress={onLoginGoogle}
    bgColor="#FAE9EA"
    fgColor="#DD4D44"
    />

    <CustomButton 
    text="Log in with Apple" 
    onPress={onLoginApple}
    bgColor="#e3e3e3"
    fgColor="#363636"
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

//