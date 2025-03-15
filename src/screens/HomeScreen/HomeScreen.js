import { StyleSheet, Text, View, Dimensions, Button, TouchableOpacity, ActivityIndicator,FlatList, ScrollView} from 'react-native'
import React, {useState, useEffect} from 'react';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation} from '@react-navigation/native';

const HomeScreen = () => {

  const [mapRegion, setMapRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

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

//   const getUserLocation = () => {
//     Geolocation.getCurrentPosition(
//         position => {
//             const {latitude, longitude} = position.coords;
//             console.log("User location: ", latitude, longitude);
//             setUserLocation({latitude, longitude});
//             generateRandomRoute({latitude, longitude});
//         },
//         error => console.log(error.message),
//         {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
//     );
// };
 const generateRandomRoute = (userLocation) => {
        if(userLocation){
        const randomDistance = (Math.random() * 10 +1).toFixed(1);
        const startCoords = userLocation;

        const endCoords = {
            latitude: userLocation.latitude + (Math.random() * 0.1 - 0.05), 
            longitude: userLocation.longitude + (Math.random() * 0.1 - 0.05) 
        };

        const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&markers=color:red%7Clabel:S%7C${startCoords.latitude},${startCoords.longitude}&markers=color:red%7Clabel:E%7C${endCoords.lat},${endCoords.lng}&path=color:0x0000ff%7C${startCoords.latitude},${startCoords.longitude}%7C${endCoords.lat},${endCoords.lng}&key=AIzaSyAGcodZd433BbtGC9oCVIMZlOuHuBPJ8Gk`;

        console.log("Map Image URL:", mapImageUrl);

        const randomRoute = {
            id: Math.random().toString(),
            distance: randomDistance,
            routeImage: mapImageUrl, 
            description: `Run ${randomDistance} km `,
        };
        setRoutes(prevRoutes => [randomRoute, ...prevRoutes]);
    }else{
        console.log("User location not available");
    }
    };

    const renderRouteCard = ({ item }) => (
      <View style={styles.card}>
          <Image source={{ uri: item.routeImage }} style={styles.cardImage} />
          <Text style={styles.cardTitle}>Run {item.distance} km</Text>
          <Text>{item.description}</Text>
          <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
      </View>
  );

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


          <View style={{flex: 1}} >
                  <FlatList
                      data={routes}
                      renderItem={renderRouteCard}
                      keyExtractor={(item) => item.id}
                      style={styles.list}
                      showVerticalScrollIndicator={false} />
              </View>

              <Text style={styles.title}>Random Running Routes</Text>
                          <Button title="Generated Routes" onPress={generateRandomRoute} />
              
                          <ScrollView horizontal style={styles.cardContainer}>
                               <FlatList
                                  data={routes}
                                 renderItem={renderRouteCard}
                                  keyExtractor={(item) => item.id}
                                  horizontal
                               showsHorizontalScrollIndicator={false}
                              />
                            </ScrollView>
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