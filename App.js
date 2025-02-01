import { SafeAreaView, StyleSheet, Text, useColorScheme, View , ScrollView} from 'react-native';
import React from 'react';
import Navigation from './src/navigation';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import BottomNavigation from './src/bottomNav/BottomNavigation';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigation from './src/drawerNav/DrawerNavigation';
import { ThemeProvider } from './src/drawerNav/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
   <NavigationContainer>
      {/* <BottomNavigation /> */}
      <DrawerNavigation />
   </NavigationContainer>
   </ThemeProvider>
    
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
