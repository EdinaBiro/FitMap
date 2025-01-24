import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef} from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen/HomeScreen'; 
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import CalendarScreen from '../screens/CalendarScreen/CalendarScreen';

const TabArray = [
    {route: 'Screen', label:'HomeScreen', type: 'Ionicons', avtiveIcon: 'home', inActiveIcon: 'home-outline', component: HomeScreen},
    {route: 'ProfileScreen', label: 'ProfileScreen', type: 'Ionicons', activeIcon: 'person', inActiveIcon: 'person-outline', component: ProfileScreen },
    {route: 'CalendarScreen', label: 'CalendarScreen', type: 'Ionicons', activeIcon: 'calendar', inActiveIcon: 'calendar-outline', component: CalendarScreen },

]

const Tab = createBottomTabNavigator();



const TabButton = (props) => {
    const {item, onPress,focused} = props;

    const viewRef = useRef(null);

    useEffect( () => {
        if( focused){
            viewRef.current.animate ({0: {scale: .5, rotate: '0deg'}, 1: {scale: 1.5, rotate: '360deg'}}, 300 );
        }else{
            viewRef.current.animate ({0: {scale: 1.5, rotate: '360deg'}, 1: {scale: 1, rotate: '0deg'}}, 300 );
        }
    }, [focused]);

    return (
        <TouchableOpacity 
            onPress ={ onPress}
            activeOpacity={1}
            style={styles.container}>
                <Animatable.View
                    ref={viewRef}
                    //animation="zoomIn"
                    //duration={1000}
                    style={styles.container}>
                     <Icon type ={item.type}  
                        name={focused ? item.activeIcon : item.inActiveIcon}  
                        color={focused ? Colors.primary : Colors.primaryLite}
                        size={focused ? 28 : 24}/>
                </Animatable.View>
        </TouchableOpacity>
    )
}

const BottomNavigation = () => {
  return (
    <Tab.Navigator
        screenOptions = {{
            headerShown: false,
            tabBarStyle: {
                height: 60,
                position: 'absolute',
                bottom: 16,
                right: 16,
                left: 16,
                borderRadius: 16,
            }
        }}
        >
        {
            TabArray.map((item, index) => {
            return (
                <Tab.Screen name = {item.route} component={item.component} 
                 options ={{
                    tabBarShowLabel: false,
                    tabBarButton: (props) => <TabButton {...props} item ={item}/>
                }}
                />
            )
        })}
        </Tab.Navigator>
   
  )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }

});

export default BottomNavigation;