import { StyleSheet, Text, View, Image, ScrollView, Alert} from 'react-native'
import React from 'react';
import CustomInput from '../../components/CustomInput';
import {useState} from 'react';
import CustomButton from '../../components/CustomButton';
import {useForm} from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

const ForgotPasswordScreen= () => {

    const {control,handleSubmit} = useForm();
    const navigation = useNavigation();
    const [loading, setIsLoading] = useState(false);



    const onSendPressed = async (data) => {
      try{
        setIsLoading(true);
        await auth().sendPasswordResetEmail(data.email);
        Alert.alert(
          'Email sent',
          'A password reset link has been sent to your email address',
          [{ text: 'OK', onPress: () => navigation.navigate('LoginScreen')}]
        );
      }catch(error){
        let errorMessage = 'An error occured. Please try again';

        if(error.code === 'auth/invalid-email'){
          errorMessage='This email address is invalid';
        }else if(error.code === 'auth/user-not-found'){
          errorMessage = 'No user found with this email address.';
        }

        Alert.alert('Error', errorMessage);
      }finally{
        setIsLoading(false);
      }
      
      
    };
    

    const onSignInPressed = () => {
      navigation.navigate("LoginScreen");
    }


  return (
    <ScrollView showsHorizontalScrollIndicator={false}>
    <View style = {styles.root}>
     <Text style={styles.title}>Reset your password</Text>

      <CustomInput 
      name = "email"
      control={control}
      placeholder="Email" 
      rules={{
          required: 'Email is required',
          pattern: {
            value:  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          }
      }}
      
      /> 


      <CustomButton text={loading ? "Sending..." : "Send"} onPress={handleSubmit(onSendPressed)} disabled={loading}/>
    
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



export default ForgotPasswordScreen;
