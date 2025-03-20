import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Button} from 'react-native';
import React, { useState, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {CameraView, useCameraPermissions} from 'expo-camera';
import { Ionicons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const GymScreen = () => {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [exerciseName, setExerciseName] = useState('');
  const [correctReps, setCorrectReps] = useState(0);
  const [incorrectReps, setIncorrectReps] = useState(0);
  const [totalSets, setTotalSets] = useState(3);
  const [repsPerSet, setRepsPerSet] = useState(10);
  const [setsCompleted, setSetsCompleted] = useState(0);
  const [cameraType, setCameraType] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef(null);
  const navigation = useNavigation();

  const handleOpenCamera = async () => {
    try {
        if(permission?.granted){
            setCameraOpen(true);
        }else{
            console.log('Requesting camera permission...');
            const permissionResult = await requestPermission();
            console.log('Camera permission status: ', permissionResult.granted)

        if(permissionResult.granted){
            setCameraOpen(true);
        }else{
            console.log('Camera permission denied');
        }
    }
  
    } catch (error) {
      console.error('Camera permission error: ', error);
    }
  };

  const handleCloseCamera = () => {
    setCameraOpen(false);
  };

  if(!permission){
    return <Text>Requesting camera permission...</Text>
  }

  if(!permission.granted){
    return(
        <View style={styles.container}>
            <Text>We need your permission to show the camera</Text>
            <Button onPress={requestPermission} title="Grant permission"/>
        </View>
    )
  }

  const toggleCameraType = () => {
    setCameraType((prevType) => (prevType === 'back' ? 'front': 'back'));
  }

  const analyzeExercisePose = () => {
    setCorrectReps(prev => prev + 1);
    if ((correctReps + 1) % repsPerSet === 0) {
      setSetsCompleted(prev => prev + 1);
    }
  };

  return (
    <View style={styles.container}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 10}}>
         <Ionicons name="arrow-back-outline" size={30} color="black"/>
    </TouchableOpacity>
   
      {!cameraOpen ? (
        <View style={styles.startContainer}>
          <Text style={styles.exerciseName}>{exerciseName || 'Exercise Pose Detection'}</Text>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={handleOpenCamera}
          >
            <Text style={styles.startButtonText}>Start Camera</Text>
          </TouchableOpacity>
          
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Previous Stats:</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{correctReps}</Text>
                <Text style={styles.statLabel}>Correct Reps</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{incorrectReps}</Text>
                <Text style={styles.statLabel}>Incorrect Reps</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{setsCompleted} / {totalSets}</Text>
                <Text style={styles.statLabel}>Sets</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{repsPerSet}</Text>
                <Text style={styles.statLabel}>Reps/Set</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef} 
                style={styles.camera}
                facing={cameraType}
                ratio="16:9" />

                
                <TouchableOpacity
                    style={styles.flipButton}
                    onPress={toggleCameraType} >
                
                <Ionicons name="camera-reverse" size={24} color="white"/>

                </TouchableOpacity>
             
          </View>

          <LinearGradient 
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']} 
            style={styles.infoContainer}
          >
            <Text style={styles.exerciseName}>{exerciseName || 'Exercise Pose Analysis'}</Text>

            <View style={styles.repsContainer}>
              <View style={styles.repCounter}>
                <Text style={styles.repCount}>{correctReps}</Text>
                <Text style={styles.repLabel}>Correct</Text>
              </View>

              <View style={styles.repCounter}>
                <Text style={styles.repCount}>{incorrectReps}</Text>
                <Text style={styles.repLabel}>Incorrect</Text>
              </View>
            </View>

            <View style={styles.setRepsContainer}>
              <View style={styles.setsInfo}>
                <Text style={styles.infoLabel}>Sets</Text>
                <Text style={styles.infoValue}>{setsCompleted} / {totalSets}</Text>
              </View>
              <View style={styles.repsInfo}>
                <Text style={styles.infoLabel}>Reps/Set</Text>
                <Text style={styles.infoValue}>{repsPerSet}</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.analyzeButton} 
                onPress={analyzeExercisePose}
              >
                <Text style={styles.buttonText}>Analyze Pose</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleCloseCamera}
              >
                <Text style={styles.buttonText}>Close Camera</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 30,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 10,    
    backgroundColor: '#000',
    flex:1,
    marginTop: 50,
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    width: '100%',
    padding: 20,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  repsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  repCounter: {
    alignItems: 'center',
  },
  repCount: {
    fontSize: 28,
    fontWeight: '600',
    color: '#007bff',
  },
  repLabel: {
    fontSize: 16,
    color: '#555',
  },
  setRepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  setsInfo: {
    alignItems: 'center',
  },
  repsInfo: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 5,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  analyzeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
 
});

export default GymScreen;