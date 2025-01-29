import { StyleSheet, Text, View,Image, Touchable, TouchableOpacity} from 'react-native';
import React from 'react';
import { createDrawerNavigator, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import {Ionicons} from '@expo/vector-icons';
import BottomNavigation from '../bottomNav/BottomNavigation';
import HomeScreen from '../screens/HomeScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';
import { createStackNavigator } from '@react-navigation/stack';


const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const CustomHeader = ( { navigation }) => (
    <View style={{flexDirection: 'row', padding: 10}}>
        <TouchableOpacity onPress={ () => navigation.openDrawer()}>
            <Ionicons name="menu" size={30} color="black" />
        </TouchableOpacity>
    </View>
);

const MainStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="MainTabs"
            component={BottomNavigation}
            options={({navigation}) => ({
                headerLeft: () => <CustomHeader navigation={navigation} />,
                headerShown: true
            })} />
    </Stack.Navigator>
);

const DrawerNavigation = () => {
  return (
   <Drawer.Navigator

   drawerContent={
    (props) =>{
        return(
        <SafeAreaView>
            <View style={{
                height: 200,
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#ffffff",
            }}>
                <Image 
                source={require("../../assets/images/profile.jpg")}
                style={{
                    height: 100,
                    width: 100,
                    borderRadius: 50,
                    marginBottom: 12,
                }}
                />
                <Text style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#000000",
                    marginBottom: 16,
                }}>Tom</Text>

            </View>
            <DrawerItemList {...props} />
        </SafeAreaView>
        );
    }
   }
    screenOptions = {{
        drawerStyle: {
            backgroundColor: "#ffffff",
            width: 250
        },
        headerStyle: {
            backgroundColor: "#ffffff",
        },
        headerShown: false,
        headerTintColor: "#000000",
        drawerLabelStyle: {
            color: "#000000",
            fontSize: 14,
            marginLeft: -10,
        }
    }}>
        <Drawer.Screen
        name="Home"
        options={{
            drawerLabel: "Home",
            title: "Home",
            headerShadowVisible: false,
            drawerIcon: ()=> (
                <Ionicons name="home-outline" size={24} />
            )
        }}
        component={MainStack}>

        </Drawer.Screen>

        <Drawer.Screen
        name="Settings"
        options={{
            drawerLabel: "Settings",
            title: "Settings",
            headerShadowVisible: false,
            drawerIcon: ()=> (
                <Ionicons name="settings-outline" size={24} />
            )
        }}
        component={SettingsScreen}>

        </Drawer.Screen>


   </Drawer.Navigator>
  )
}


const styles = StyleSheet.create({})

export default DrawerNavigation;