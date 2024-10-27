import { SafeAreaView, StyleSheet, Text, useColorScheme, View , ScrollView} from 'react-native';
import React from 'react';
import {SignUpScreen} from "./src/screens/SignUpScreen";
import LoginScreen from './src/screens/LoginScreen';




const App = () => {
  return (
    <SafeAreaView style={styles.root}>
      <LoginScreen />

    </SafeAreaView>
    
  );
};



const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'F9FBFC',
  },
  
});

export default App;

//