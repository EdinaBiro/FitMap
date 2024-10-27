import { View, Text,Image } from 'react-native'
import React from 'react'
import {linearGradient} from "expo-linear-gradient"
import COLORS from '../../constants/colors'; 
import { MaskedViewComponent } from '@react-native-community/masked-view';


const WelcomeScreen = () => {
  return (
    <linearGradient
    style={{
        flex: 1
    }}>
    colors = {[COLORS.seondary, COLORS.primary]};

    <View style={{flex: 1}}>
            <Image 
            source={require("../../assets/welcome.jpg")}/>
            style={{
                height: 100,
                width: 100,
                borderRadius: 20,
                position: "absolute",
                top: 10,
               
            }}

        </View>


    </linearGradient>
  
  )
}

export default WelcomeScreen;

//