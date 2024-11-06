import React from 'react';
import {View,Text} from 'react-native';
import CustomButton from '../CustomButton';

const SocialSignInButton = () => {

    const onLoginApple = () => {
        console.warn("Apple");
      }
  
      const onLoginFacebook =() => {
        console.warn("Facebook");
      }
  
      const onLoginGoogle = () => {
        console.warn("Google");
      }
    return (
    <>
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

        </>
    );
}

export default SocialSignInButton;