import { StyleSheet, Text, View,Image, Touchable, TouchableOpacity, Switch} from 'react-native';
import React, {useContext, useState} from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import {Ionicons} from '@expo/vector-icons';
import BottomNavigation from '../bottomNav/BottomNavigation';
import HomeScreen from '../screens/HomeScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import {ThemeContext} from './ThemeContext';
import LoginScreen from '../screens/LoginScreen';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import { firebase } from '@react-native-firebase/auth';
import {navigationRef, navigate} from '../navigation/NavigationRef';
import auth from '@react-native-firebase/auth';


const CustomDrawerContent = (props) => {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const {isDarkTheme, setIsDarkTheme} = useContext(ThemeContext);

    const handleLogout = async () => {
       try{
        const user = auth().currentUser;
        if(user){
             console.log('Logging out...');
             await auth().signOut();
             console.log('User signed out');
             //props.navigation.replace('LoginScreen')
        }else{
            console.log("No user currently signed in");
        }
     
        console.log("NavigationRef: ", navigationRef);
       
    
        props.navigation.reset({
    
            index: 0,
            routes: [{name: 'LoginScreen'}],
    
       });

       }catch(e){
        console.log("Error during logout: ",e);
       }
        };
       


    const handleThemeToggle = () => {
        setIsDarkTheme(prevTheme => !prevTheme);
    };

    return(
        <DrawerContentScrollView {...props}>
            <View style={styles.profileContainer}>
                <Image source={require("../../assets/images/profile.jpg")} style={styles.profileImage} />
                </View>
                <DrawerItemList {...props}/>
                <TouchableOpacity onPress={ () => setIsDropdownVisible(!isDropdownVisible)} style={styles.settingButton}>
                    <Ionicons name="settings-outline" size={24} />
                    <Text style={styles.settingsText}>Settings</Text>
                </TouchableOpacity>
                {isDropdownVisible && (
                    <View style={styles.dropdown}>
                        <View style={styles.option}>
                        <Text style={styles.optionText}>Dark Theme</Text>
                        <Switch 
                            value={isDarkTheme}
                            onValueChange={handleThemeToggle}
                        />
                        <Ionicons name={isDarkTheme ? "moon" : "sunny"} size={24}/>
                    </View>
                    <TouchableOpacity style={styles.option} onPress ={handleLogout}>
                        <Ionicons name="log-out" size={24} />
                        <Text style={styles.optionText}>Log Out</Text>
                        
                    </TouchableOpacity>
                    </View>
                   
                )}
        
                
                </DrawerContentScrollView>
    )
}


const styles = StyleSheet.create({
    settingsText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
        marginLeft: 16,
    },
    dropdown: {
        marginTop: 10,
        marginLeft: 16,
        marginRight: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    optionText: {
        fontSize: 16,
    },
    profileContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#fff",
    },
    profileImage: {
        height: 100,
        width: 100,
        borderRadius: 50,
        marginBottom: 12,
    },
    settingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
    }
})

export default CustomDrawerContent;