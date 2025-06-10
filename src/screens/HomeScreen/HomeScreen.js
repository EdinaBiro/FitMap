import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [mapRegion, setMapRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const navigation = useNavigation();

  const getUserLocation = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      setLoading(false);
      return;
    }
    try {
      let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      const userLocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      setUserLocation(userLocationData);
      setLoading(false);

      console.log(location.coords.longitude, location.coords.latitude);
      return userLocationData;
    } catch (error) {
      console.error('Error getting location: ', error);
      setErrorMsg('Permission to access location was denied');
      setLoading(false);
    }
  };

  const generateRandomRoutes = (userLocation) => {
    if (userLocation) {
      const distances = [1, 2, 3, 5, 8, 10];
      const newRoutes = [];

      distances.forEach((distance, index) => {
        const startCoords = userLocation;

        const latOffset = distance * 0.009 * (Math.random() * 2 - 1);
        const lngOffset = distance * 0.009 * (Math.random() * 2 - 1);

        const endCoords = {
          latitude: userLocation.latitude + latOffset,
          longitude: userLocation.longitude + lngOffset,
        };
        const midCoords = {
          latitude: userLocation.latitude + latOffset * 0.6 + (Math.random() * 0.004 - 0.002),
          longitude: userLocation.longitude + lngOffset * 0.6 + (Math.random() * 0.004 - 0.002),
        };

        const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?size=300x200&markers=color:green%7Clabel:S%7C${startCoords.latitude},${startCoords.longitude}&markers=color:red%7Clabel:E%7C${endCoords.latitude},${endCoords.longitude}&path=color:0x4285f4%7Cweight:3%7C${startCoords.latitude},${startCoords.longitude}%7C${midCoords.latitude},${midCoords.longitude}%7C${endCoords.latitude},${endCoords.longitude}&key=AIzaSyAGcodZd433BbtGC9oCVIMZlOuHuBPJ8Gk`;

        const routeTypes = ['Park loop', 'Urban run', 'Riverside path', 'Mountain trail', 'Neighborhood circuit'];
        const randomType = routeTypes[Math.floor(Math.random() * routeTypes.length)];

        const randomRoute = {
          id: `route_${distance}_${Date.now()}_${index}`,
          distance: distance,
          routeImage: mapImageUrl,
          description: `${randomType} - ${distance} km`,
          type: randomType,
          estimatedTime: Math.round(distance * 6),
          startCoords: startCoords,
          endCoords: endCoords,
          midCoords: midCoords,
          routeCoordinates: [startCoords, midCoords, endCoords],
        };

        newRoutes.push(randomRoute);
      });

      setRoutes(newRoutes);
    } else {
      console.log('User location not available');
    }
  };

  const handleStartRoute = (route) => {
    navigation.navigate('WorkoutStackNavigator', {
      screen: 'StartWorkoutScreen',
      params: {
        workoutName: route.description,
        initialLocation: route.startCoords,
        routeData: {
          id: route.id,
          distance: route.distance,
          type: route.type,
          estimatedTime: route.estimatedTime,
          coordinates: route.routeCoordinates,
          startCoords: route.startCoords,
          endCoords: route.endCoords,
          midCoords: route.midCoords,
        },
      },
    });
  };

  const renderRouteCard = ({ item }) => (
    <View style={styles.routeCard}>
      <Image source={{ uri: item.routeImage }} style={styles.routeImage} />
      <View style={styles.routeInfo}>
        <Text style={styles.routeTitle}>{item.distance} km run</Text>
        <Text style={styles.routeDescription}>{item.description}</Text>
        <Text style={styles.routeTime}>⏱ ~{item.estimatedTime} min</Text>
        <TouchableOpacity style={styles.startButton} onPress={() => handleStartRoute(item)}>
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  useEffect(() => {
    getUserLocation();

    const locationSubscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
        timeInterval: 3000,
      },
      (location) => {
        const updatedLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(updatedLocation);
      },
    );

    return () => {
      if (locationSubscription) {
        locationSubscription.then((sub) => sub.remove());
      }
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading location...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : (
        <>
          <View style={styles.mapCard}>
            <Text style={styles.mapCardTitle}>Current Position</Text>
            <MapView style={styles.map} initialRegion={mapRegion} showsUserLocation={true} showsMyLocationButton={true}>
              {userLocation && <Marker coordinate={userLocation} title="Your location" pinColor="#6200ee" />}
            </MapView>

            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  getUserLocation().then((location) => {
                    if (location) {
                      setMapRegion({
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                      });
                    }
                  })
                }
              >
                <Text style={styles.actionButtonText}>📍 Refresh</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  navigation.navigate('WorkoutStackNavigator', {
                    screen: 'StartWorkoutScreen',
                    params: {
                      workoutName: 'Free Run',
                      initialLocation: { latitude: mapRegion.latitude, longitude: mapRegion.longitude },
                    },
                  })
                }
              >
                <Text style={styles.actionButtonText}>🏃‍♂️ Workout</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('CalendarScreen', { location: userLocation })}
              >
                <Text style={styles.actionButtonText}>📅 Calendar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.routesSection}>
            <View style={styles.routesSectionHeader}>
              <Text style={styles.routesSectionTitle}>Recommended Routes</Text>
              <TouchableOpacity style={styles.generateButton} onPress={() => generateRandomRoutes(userLocation)}>
                <Text style={styles.generateButtonText}>🔄 New Routes</Text>
              </TouchableOpacity>
            </View>

            {routes.length === 0 ? (
              <View style={styles.noRoutesContainer}>
                <Text style={styles.noRoutesText}>Press the "New Routes" button to generate running routes!</Text>
              </View>
            ) : (
              <FlatList
                data={routes}
                renderItem={renderRouteCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.routesList}
              />
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },

  mapCard: {
    margin: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mapCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  actionButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },

  routesSection: {
    margin: 15,
    marginTop: 0,
  },
  routesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  routesSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  noRoutesContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
  },
  noRoutesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  routesList: {
    paddingBottom: 20,
  },

  routeCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  routeImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  routeInfo: {
    flex: 1,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  routeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  routeTime: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
