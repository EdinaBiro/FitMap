import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'

const CustomButton = ({onPress,text,type="PRIMARY", bgColor, fgColor}) => {
  return (
    <Pressable 
    onPress={onPress} 
    style={[
    styles.constainer, 
    styles[`constainer_${type}`],
    bgColor ? {backgroundColor: bgColor} : {}
    ]}>

  < Text style={[
    styles.text, 
    styles[`text_${type}`],
    fgColor ? {color: fgColor} : {},
    ]}>
      {text}
  </Text>
  </Pressable>
  );
};

const styles = StyleSheet.create({
    constainer: {
      width: '100%',
      padding: 15,
      marginVertical: 5,
      alignItems: 'center',
      borderRadius: 10,
    },

    constainer_PRIMARY: {
      backgroundColor: '#3B71F3',
    },

    container_TERITARY: {

    },

    text: {
      fontWeight: 'bold',
      color: 'white',
    },

    text_TERTIARY:{
      color: 'gray',
    },
});

export default CustomButton