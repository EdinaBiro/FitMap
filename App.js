import { SafeAreaView, StyleSheet, Text, useColorScheme, View , ScrollView} from 'react-native';
import React, {useState, useEffect} from 'react';
import Navigation from './src/navigation/index';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import BottomNavigation from './src/bottomNav/BottomNavigation';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigation from './src/drawerNav/DrawerNavigation';
import { ThemeProvider } from './src/drawerNav/ThemeContext';
import { navigationRef } from './src/navigation/NavigationRef';
import auth from '@react-native-firebase/auth';

const App = () => {

  const [user, setUser] = useState(null);

    function onAuthStateChanged(user) {
    console.log(user, 'user');
    setUser(user);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  return (
        <ThemeProvider>
          <NavigationContainer ref={navigationRef}>
            {user ? <DrawerNavigation/> : <Navigation />}
            {/* <DrawerNavigation /> */}
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
