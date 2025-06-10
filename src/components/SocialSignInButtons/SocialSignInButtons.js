import React from 'react';
import { View, Text } from 'react-native';
import CustomButton from '../CustomButton';

const SocialSignInButton = () => {
  const onLoginFacebook = () => {
    console.warn('Facebook');
  };

  const onLoginGoogle = () => {
    console.warn('Google');
  };
  return (
    <>
      <CustomButton text="Log in with Facebook" onPress={onLoginFacebook} bgColor="#E7EAF4" fgColor="#4764A9" />

      <CustomButton text="Log in with Google" onPress={onLoginGoogle} bgColor="#FAE9EA" fgColor="#DD4D44" />
    </>
  );
};

export default SocialSignInButton;
