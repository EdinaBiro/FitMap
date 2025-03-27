import { SafeAreaView, StyleSheet, Text, useColorScheme, View , ScrollView, ActivityIndicator} from 'react-native';
import React, {useState, useEffect, createContext} from 'react';
import Navigation from './src/navigation/index';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import BottomNavigation from './src/bottomNav/BottomNavigation';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigation from './src/drawerNav/DrawerNavigation';
import { ThemeProvider } from './src/drawerNav/ThemeContext';
import { navigationRef } from './src/navigation/NavigationRef';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import OnBoardingScreen from './src/screens/OnBoardingScreen';

export const AuthContext = createContext();
const App = () => {

  const [user, setUser] = useState(null);
 // const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  //const [isLoading, setIsLoading] = useState(true);

  function onAuthStateChanged(user) {
    setUser(user);
  }

  useEffect(() => {
  //   const chechFirstLaunch = async () => {
  //     try{
  //       await AsyncStorage.removeItem('alreadyLaunched');
  //       const value = await AsyncStorage.getItem('alreadyLaunched');
  //       if(value === null){
  //         await AsyncStorage.setItem('alreadyLaunched', 'true');
  //         setIsFirstLaunch(true);
  //       }else{
  //         setIsFirstLaunch(false);
  //       }
  //     }catch(error){
  //       console.error('Error checking first launch: ', error);
  //       setIsFirstLaunch(false);
  //     }
  //   };

    const authSubsrciber = auth().onAuthStateChanged(user => {
      setUser(user);
      // if(isFirstLaunch !== null){
      //   setIsLoading(false);
      // }
    });

    //chechFirstLaunch();

    return () => {
      authSubsrciber();
    };
  },[]);
  //};
  //},[isFirstLaunch]);

 

  // if(isLoading){
  //   return(
  //     <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
  //       <ActivityIndicator size="large"/>
  //     </View>
  //   );
  // }

  return (
     <AuthContext.Provider value={{ user }}>
         
        <ThemeProvider>
          <NavigationContainer ref={navigationRef}>
            {user ? (
              <DrawerNavigation/>
             ) : (
              <>
              {/* {isFirstLaunch ? (
                <OnBoardingScreen/>
              ):( */}
                <Navigation />
             {/* )} */}
              </>
             )}
          </NavigationContainer>
        </ThemeProvider>
        </AuthContext.Provider>
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
