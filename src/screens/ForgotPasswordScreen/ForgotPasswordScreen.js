import { StyleSheet, Text, View, Image, ScrollView} from 'react-native'
import React from 'react';
import CustomInput from '../../components/CustomInput';
import {useState} from 'react';
import CustomButton from '../../components/CustomButton';
import {useForm} from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';


const ForgotPasswordScreen= () => {

    const [email, setEmail] = useState('');

    const {control,handleSubmit} = useForm();
    const navigation = useNavigation();



    const onSendPressed = (data) => {
      console.warn(data);
      navigation.navigate("NewPasswordScreen");
    }
    

    const onSignInPressed = () => {
      navigation.navigate("LoginScreen");
    }


  return (
    <ScrollView showsHorizontalScrollIndicator={false}>
    <View style = {styles.root}>
     <Text style={styles.title}>Reset your password</Text>

      <CustomInput 
      name = "Email"
      control={control}
      placeholder="Email" 
      rules={{
          required: 'Email is required'
      }}
      
      /> 


      <CustomButton text="Send" onPress={handleSubmit(onSendPressed)}/>
    
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
