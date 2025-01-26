import { StyleSheet, Text, View, Image, useWindowDimensions, ScrollView, TouchableOpacity, Platform} from 'react-native'
import Logo from '../../../assets/images/logo.png';
import React from 'react';
import CustomInput from '../../components/CustomInput';
import {useState, useEffect} from 'react';
import CustomButton from '../../components/CustomButton/CustomButton';
import { TextInput } from 'react-native-gesture-handler';
import {useForm,Controller} from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
// import {auth} from '../../Firebase/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import auth from '@react-native-firebase/auth';
import { AuthenticationToken,LoginManager, AccessToken } from 'react-native-fbsdk-next';

const LoginScreen = () => {

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    console.log(user, 'user');
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);


    function generateNonce(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let nonce = '';
      for (let i = 0; i < length; i++) {
        nonce += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return nonce;
    }


    async function onFacebookButtonPressIOS() {
    // Create a nonce and the corresponding
    // sha256 hash of the nonce
    console.log('on facebook button ios');
    const nonce = generateNonce(16);
    const nonceSha256 = await sha256(nonce);
    // Attempt login with permissions and limited login
    const result = await LoginManager.logInWithPermissions(
      ['public_profile', 'email'],
      'limited',
      nonceSha256,
    );
  
    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }
  
    // Once signed in, get the users AuthenticationToken
    const data = await AuthenticationToken.getAuthenticationTokenIOS();
  
    if (!data) {
      throw 'Something went wrong obtaining authentication token';
    }
  
    // Create a Firebase credential with the AuthenticationToken
    // and the nonce (Firebase will validates the hash against the nonce)
    const facebookCredential = auth.FacebookAuthProvider.credential(data.authenticationToken, nonce);
  
    // Sign-in the user with the credential
    //return auth().signInWithCredential(facebookCredential);
    await auth().signInWithCredential(facebookCredential);

    if(auth().currentUser) {
      navigation.navigate('CalendarScreen');
    }
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

    const {height} = useWindowDimensions();
    const navigation = useNavigation();

    const {control,handleSubmit,formState: {errors}} = useForm();

  

    const onLoginPressed = () => {
      //validate user

      navigation.navigate('CalendarScreen');
      handleLogin();
    }

    const handleLogin = () => {
      console.warn('Logged in');
      navigation.navigate('CalendarScreen');
    }

    const handleSignUp = () => {
      console.log('Sign up!');
    }

    const onForgotPasswordPressed = () => {

      navigation.navigate("ForgotPasswordScreen");
    }

    const onSignUpPressed = () => {
      navigation.navigate("SignUpScreen");

    }

    const onSignInFacebook = () => {
      console.warn('onSignInFacebook');
    }

    const onSignInGoogle = () => {
      console.warn('onSignInGoogle');
    }

    async function onFacebookButtonPressAndroid() {
      // Attempt login with permissions
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) {
        throw 'User cancelled the login process';
      }
    
      // Once signed in, get the users AccessToken
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw 'Something went wrong obtaining access token';
      }
    
      // Create a Firebase credential with the AccessToken
      const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
      // Sign-in the user with the credential
      //return auth().signInWithCredential(facebookCredential);

      await auth().signInWithCredential(facebookCredential);
      //navigation.navigate('HomeScreen');

      if(auth().currentUser) {
        navigation.navigate('CalendarScreen');
      }
    }
    if (initializing) return null;

  if (!user) {
    return (
      <ScrollView showsHorizontalScrollIndicator={false}>
      <View style = {styles.root}>
        <Image source={Logo} 
        style={[styles.logo, {height: height * 0.4 }]} 
        resizeMode="contain"
        />
  
  
        <CustomInput 
        name="email" 
        placeholder="Email" 
        control={control} 
        value={email}
        onChangeText={text => setEmail(text)}
        rules={{required: 'Email is required'}}
         />
  
        <CustomInput 
        name="password"
        placeholder="Password" 
        secureTextEntry={true}
        control={control}
        value={password}
        onChangeText={text => setPassword(text)}
        rules={{required: 'Password is required',minLength: {value:3, message:'Password should be minimum ${value} characters long',maxLength:  {value:15, message:'Password should be maximum ${value} characters long'  }}}}
        />
  
  
        <CustomButton text="Log in" onPress={onLoginPressed }/>
       
  
        <CustomButton 
        text="Forgot Password" 
        onPress={ () => navigation.navigate('ForgotPasswordScreen')}
        type="TERTIARY"
        />
    
        <CustomButton
          text = "Sign up with Facebook" 
          onPress={Platform.OS === "ios" ? () => onFacebookButtonPressIOS().then( () => handleSubmit(onLoginPressed)) : () => onFacebookButtonPressAndroid().then( handleLogin).catch(err => console.error(err, 'error')) }
          bgColor="#E7EAF4"
          fgColor="#4765A9"
  
        />
        <CustomButton
          text = "Sign up with Google"
          onPress={onSignInGoogle}
          bgColor="#FAE9EA"
          fgColor="DD4D44"
  
        />
  
  
        <CustomButton 
        text="Don't have an account? Create one" 
        onPress={onSignUpPressed}
        type="TERTIARY"
        />
  
  
      </View>
      </ScrollView>
    );
  }

  // return (
  //   // <View>
  //   //   <Text>Welcome {user.email}</Text>
  //   // </View>
  //   navigation.navigate('CalendarScreen')
  // );

  
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
