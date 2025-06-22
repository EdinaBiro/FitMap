import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { AccessToken, AuthenticationToken, LoginManager } from 'react-native-fbsdk-next';
import Logo from '../../../assets/images/logo.png';
import CustomButton from '../../components/CustomButton/CustomButton';
import CustomInput from '../../components/CustomInput';
import { hasPendingOnBoardingData, syncPendingOnBoardingData } from '../../services/WorkoutPlanService';
import { baseURL } from '../../utils';
import { sendPendingOnBoardingData } from '../../services/WorkoutPlanService';

const LoginScreen = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  const navigation = useNavigation();

  function onAuthStateChanged(user) {
    console.log(user, 'user');
    setUser(user);

    if (user) {
      user.getIdToken().then((token) => {
        sendPendingOnBoardingData(token);
      });
      setTimeout(() => {
        navigation.navigate('CalendarScreen');
      }, 1500);
    }
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
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
    console.log('on facebook button ios');
    const nonce = generateNonce(16);
    const nonceSha256 = await sha256(nonce);
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email'], 'limited', nonceSha256);

    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }

    const data = await AuthenticationToken.getAuthenticationTokenIOS();

    if (!data) {
      throw 'Something went wrong obtaining authentication token';
    }
    const facebookCredential = auth.FacebookAuthProvider.credential(data.authenticationToken, nonce);
    await auth().signInWithCredential(facebookCredential);

    if (auth().currentUser) {
      setTimeout(() => {
        navigation.navigate('CalendarScreen');
      }, 1500);
    }
  }

  const { height } = useWindowDimensions();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onLoginPressed = () => {
    setTimeout(() => {
      navigation.navigate('CalendarScreen');
    }, 1500);
    handleLogin();
  };

  const handleLogin = async () => {
    const email = watch('email');
    const password = watch('password');

    console.log('email: ', email);
    console.log('password: ', password);

    if (!email.trim() || !password.trim()) {
      console.log('Enter email and password');
      alert('Please enter email and password');
      return;
    }
    try {
      await auth().signInWithEmailAndPassword(email, password);
      setTimeout(() => {
        navigation.navigate('CalendarScreen');
      }, 1500);
    } catch (error) {
      console.log(error);
    }
  };

  const onForgotPasswordPressed = () => {
    navigation.navigate('ForgotPasswordScreen');
  };

  const onSignUpPressed = () => {
    navigation.navigate('SignUpScreen');
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '1168328468027-nck4olakkh9mfbgdfrhehl46igrm952l.apps.googleusercontent.com',
      offlineAccess: true,
    });
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      await auth().signInWithCredential(googleCredential);

      console.log('Successfull Google Login');

      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error(error.message, error.code);
      alert(error.message);
    }
  };

  const handleLoginSuccess = async (user, token) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      const hasPendingData = await hasPendingOnBoardingData();
      if (hasPendingData) {
        console.log('Found pending onboarding data, syncing to server..');
        const syncResult = await syncPendingOnBoardingData();

        if (syncResult.success) {
          console.log('Successfully synced onboarding data');
        } else {
          console.warn('Failed to sync onboarding data: ', syncResult.error);
        }
      }
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Error in login success handler:', error);
      Alert.alert('Error', 'Login successful but there was an issue syncing your data');
    }
  };

  async function onFacebookButtonPressAndroid() {
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }
    const data = await AccessToken.getCurrentAccessToken();
    if (!data) {
      throw 'Something went wrong obtaining access token';
    }

    const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

    await auth().signInWithCredential(facebookCredential);

    if (auth().currentUser) {
      setTimeout(() => {
        navigation.navigate('CalendarScreen');
      }, 1500);
    }
  }
  if (initializing) return null;

  if (!user) {
    return (
      <ScrollView showsHorizontalScrollIndicator={false}>
        <View style={styles.root}>
          <Image source={Logo} style={[styles.logo, { height: height * 0.4 }]} resizeMode="contain" />

          <CustomInput name="email" placeholder="Email" control={control} rules={{ required: 'Email is required' }} />

          <CustomInput
            name="password"
            placeholder="Password"
            secureTextEntry={true}
            control={control}
            rules={{
              required: 'Password is required',
              minLength: {
                value: 3,
                message: 'Password should be minimum ${value} characters long',
                maxLength: { value: 15, message: 'Password should be maximum ${value} characters long' },
              },
            }}
          />

          <CustomButton text="Log in" onPress={handleLogin} />

          <CustomButton
            text="Forgot Password"
            onPress={() => navigation.navigate('ForgotPasswordScreen')}
            type="TERTIARY"
          />

          <CustomButton
            text="Sign up with Facebook"
            onPress={
              Platform.OS === 'ios'
                ? () => onFacebookButtonPressIOS().then(() => handleSubmit(onLoginPressed))
                : () => onFacebookButtonPressAndroid().catch((err) => console.error(err, 'error'))
            }
            bgColor="#E7EAF4"
            fgColor="#4765A9"
          />
          <CustomButton text="Sign up with Google" onPress={onGoogleButtonPress} bgColor="#FAE9EA" fgColor="DD4D44" />

          <CustomButton text="Don't have an account? Create one" onPress={onSignUpPressed} type="TERTIARY" />
        </View>
      </ScrollView>
    );
  }
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
  root: {
    alignItems: 'center',
    padding: 20,
  },
});

export default LoginScreen;
