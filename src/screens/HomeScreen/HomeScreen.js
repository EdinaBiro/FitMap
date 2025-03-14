import { StyleSheet, Text, View, Dimensions, Button, TouchableOpacity, ActivityIndicator} from 'react-native'
import React, {useState, useEffect} from 'react';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation} from '@react-navigation/native';

const HomeScreen = () => {

  const [mapRegion, setMapRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  const userLocaion = async () => {
    setLoading(true);
    let {status} = await Location.requestForegroundPermissionsAsync();
    if( status !== 'granted')
    {
      setErrorMsg('Permission to access location was denied');
      setLoading(false);
      return;
    }
    let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
    setMapRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    setLoading(false);

    console.log(location.coords.longitude,location.coords.latitude);
  }

  useEffect( () => {
    userLocaion();
  }, []);

  return (
    <View style = { styles.container}>
      {loading ? (
          <ActivityIndicator size="large" color="#0000ff"/>
      ): errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ): (
        <>
         <MapView style={styles.map} 
        region = {mapRegion} onRegionChangeComplete={(region) => setMapRegion(region)}
        >

          <Marker coordinate={mapRegion} title = 'Marker'/>
      </MapView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={userLocaion}>
            <Text style={styles.buttonText}>Get Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={ () => navigation.navigate('WorkoutScreen', {initialLocation: {latitude: mapRegion.latitude, longitude: mapRegion.longitude}})}>
            <Text style={styles.buttonText}>Workout</Text>
        </TouchableOpacity>
      </View>
      </>
      )}
    </View> 
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map:  {
    width: '100%',
    height: '100%'
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    right:10,
    flexDirection: 'column',
    paddingVertical: 20,
  },
  button:{
    marginVertical: 10,
    backgroundColor: "#6200ee",
    borderRadius: 20,
    width: '50%',
    padding: 10,
    
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
  }
});

export default HomeScreen;