import { View, Text,TextInput , StyleSheet} from 'react-native'
import React from 'react'

const CustomInput = ({value,setValue, placeholder, secureTextEntry}) => {
  return (
    <View style={styles.constainer}>
    <TextInput 
    value = {value}
    onChangeText={ setValue}
    placeholder={placeholder}
    style={styles.input}
    secureTextEntry={secureTextEntry}
    />
    </View>
  );
};

const styles = StyleSheet.create({

    constainer: {
        backgroundColor: 'white',
        width: '100%',
        borderColor:' #e8e8e8',
        borderWidth:1,
        borderRadius: 10,
        paddingHorizontal:10,
        marginVertical: 8,
       

    },
    input: {
        height: 50,
        width: '100%',
    }
});



export default CustomInput