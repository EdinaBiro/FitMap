import { StyleSheet, Text, View, Dimensions, Button, TouchableOpacity} from 'react-native'
import React, {useState, useEffect} from 'react';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
const HomeScreen = () => {

  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });


  const userLocaion = async () => {
    let {status} = await Location.requestForegroundPermissionsAsync();
    if( status !== 'granted')
    {
      setErrorMsg('Permission to access location was denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
    setMapRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });

    console.log(location.coords.longitude,location.coords.latitude);
  }
  useEffect( () => {
    userLocaion();
  }, []);
  return (
    <View style = { styles.container}>
      <MapView style={styles.map} 
        region = {mapRegion}
        >

          <Marker coordinate={mapRegion} title = 'Marker'/>
      </MapView>
      <Button title='Get Location' onPress={userLocaion} />


    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map:  {
    width: '100%',
    height: '100%'
  },
});