import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'

export default function Map() {
   
  const initialLocation = {
    latitude: 37.78825,
    longitude: -122.4324,
  }
  const [myLocation, setfirst]=  useState(initialLocation)
  return (
    <View style={styles.container}>
        <MapView initialRegion={
            {
             latitude: 37.78825,
             longitude: -122.4324,
             latitudeDelta: 0.0922,
             longitudeDelta: 0.0421
            }
        }>  

        </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    }
})