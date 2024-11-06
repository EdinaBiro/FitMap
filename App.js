import { SafeAreaView, StyleSheet, Text, useColorScheme, View , ScrollView} from 'react-native';
import React from 'react';
import Navigation from './src/navigation';

const App = () => {
  return (
    <SafeAreaView style={styles.root}>
      <Navigation />

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
