import { SafeAreaView, StyleSheet, Text, useColorScheme, View , ScrollView} from 'react-native';
import React from 'react';
import Navigation from './src/navigation';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
const App = () => {
  return (
    <SafeAreaView style={styles.root}>
      <Navigation />

    </SafeAreaView>
    
  );
};


AppRegistry.registerComponent(appName, () => App);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'F9FBFC',
  },
  
});

export default App;
