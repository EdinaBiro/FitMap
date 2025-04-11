import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Button, Modal, Alert, Image} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {CameraView, useCameraPermissions} from 'expo-camera';
import { Ionicons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { poseAPI } from '../../utils';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import PoseVisualization from './PoseVisualization';

const { width } = Dimensions.get('window');

const GymScreen = () => {
  const [cameraMode, setCameraMode] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [exerciseName, setExerciseName] = useState('');
  const [correctReps, setCorrectReps] = useState(0);
  const [incorrectReps, setIncorrectReps] = useState(0);
  const [totalSets, setTotalSets] = useState(3);
  const [repsPerSet, setRepsPerSet] = useState(10);
  const [setsCompleted, setSetsCompleted] = useState(0);
  const [cameraType, setCameraType] = useState('front');
  const [permission, requestPermission] = useCameraPermissions();

  const [isAnalyzing, setIsAnalyzing] =  useState(false);
  const [postureFeedback, setPostureFeedback] = useState('Start exercise');
  const [isGoogPosture, setIsGoodPosture] = useState(true);
  const [exerciseStage, setExerciseStage] = useState('');
  const [currentAngle, setCurrentAngle] = useState(0);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [lastRepsStage, setLastRepsStage] = useState(null);
  const [poseKeypoints, setPoseKeypoints] = useState(null);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [exerciseDetected, setExerciseDetected] = useState(false);
  const [detectionAttempts, setDetectionAttempts] = useState(0);
  const [isCheckingForExercise, setIsCheckingForExercise] = useState(false);
  const [frameProcessingEnabled, setFrameProcessingEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const lastProcessedTime = useRef(0);
  const processingInterval = 100;

  const cameraRef = useRef(null);
  const navigation = useNavigation();
  const analyzeIntervalRef = useState(null);
  const detectionIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      stopAllAnalysis();
    }
  }, []);

  useEffect(() => {
    if(autoAnalyze && cameraMode){
      if(permission?.granted){
        startExerciseDetection();
      }
    }else{
        stopAllAnalysis();
    }
      return () => {
        stopAllAnalysis();
      };
  }, [cameraMode, permission?.granted]);

  const stopAllAnalysis = () => {
    if(analyzeIntervalRef.current){
      clearInterval(analyzeIntervalRef.current);
      analyzeIntervalRef.current = null;
    }
    if(detectionIntervalRef.current){
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setFrameProcessingEnabled(false);
    setExerciseDetected(false);
    setIsCheckingForExercise(false);
  }

  const startExerciseDetection = () => {
    if(isCheckingForExercise) return;

    setIsCheckingForExercise(true);
    setDetectionAttempts(0);
    setFrameProcessingEnabled(true);
    setPostureFeedback("Looking for exercise pose...");
    setIsLoading(true);
  };

  const frameProcessor = async (frame) => {
    console.log("Frame processor called");

    if(!frame){
      console.log("No frame data received");
      return;
    }
    const now = Date.now();
    if(now - lastProcessedTime.current < processingInterval) return;

    if(!cameraRef.current || isAnalyzing) {
      console.log("Skipped frame-camera ref missing or already analyzing");
      return;
    }
    lastProcessedTime.current = now;

    try{
      console.log("Starting frame analysis");
      setIsAnalyzing(true);

      if(typeof frame.toBase64 !== 'function'){
        console.log("frame.toBase64 is not a function", typeof frame.toBase64);
        setIsAnalyzing(false);
        return;
      }

      const imageDataPromise = frame.toBase64();
      const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 3000)
    );
      const imageData = await Promise.race([imageDataPromise, timeoutPromise]);

      if(!imageData){
        console.log("Failed to convert frame to base64");
        setIsAnalyzing(false);
        return;
      }

      let retries = 0;
      const maxReties = 3;
      let success = false;
      let response;

      while(retries < maxReties && !success){
        try{
          response = await fetch(poseAPI, {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({
            image: imageData,
          }),
        });
        success = true;
      }catch(error){
        console.log(`API call attempt ${retries+1} failed: ${error.message}`);
        retries++;
        if(retries>= maxReties) throw error;

        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
       
      const result = await response.json();
      console.log('API repsonse: ', JSON.stringify(result));
      setIsLoading(false);

      if(result.detected){
          if(!exerciseDetected){
              console.log("Exercise detected for the first time");
              setExerciseDetected(true);
              setPostureFeedback("Exercise detected! Monitoring form...");
              setIsCheckingForExercise(false);
            }else{
              console.log("Exercise pose data:", result.stage, result.posture_correct ? "Good posture" : "Bad posture", result.keypoints ? `${result.keypoints.points?.length || 0} points` : "No keypoints");
              setPostureFeedback(result.posture_feedback)
              setIsGoodPosture(result.posture_correct)
              setExerciseStage(result.stage)
              setCurrentAngle(result.angle);

              if(result.keypoints){
                console.log("Setting pose keypoints with: ", result.keypoints.points?.length || 0, "points and", result.keypoints.connections?.length || 0, "cnnections");
                setPoseKeypoints(result.keypoints);
              }else{
                console.log("No keypoints in result");
              }
               if(result.stage === 'up' && lastRepsStage === 'down'){
                if(result.posture_correct){
                  setCorrectReps(prev => {
                    const newCount = prev + 1;
                    if( newCount % repsPerSet === 0){
                      setSetsCompleted(prevSets => prevSets + 1);
                    }
                    return newCount;
                  });
                }else{
                  setIncorrectReps(prev => prev + 1);
                }
              }
              setLastRepsStage(result.stage);
            }
             
          }else{
            console.log("No pose detected in frame");
            if(exerciseDetected){
              const resetTimeout = setTimeout(() => {
                setPoseKeypoints(null);
                setExerciseDetected(false);
                setPostureFeedback('Exercise Paused, Waiting to resume...');
              }, 3000);
              return () => clearTimeout(resetTimeout);
            }else{
              incrementDetectonAttempts();
            }
          }   
    }catch(error){
      console.error('Errror in exercise detection: ', error);
      incrementDetectonAttempts();
      setIsLoading(false);
    }finally{
      setIsAnalyzing(false);
    }
    };

  const incrementDetectonAttempts = () => {
    setDetectionAttempts(prev => {
      const newValue = prev + 1;
      if(newValue === 10 && !exerciseDetected){
        setPostureFeedback("Please position yourself for exercise");
      }
      return newValue;
    });
  };

  const handleOpenCamera = async () => {
    console.log("Opening camera, permission status: ", permission?.granted);
    try {
        if(permission?.granted){
            console.log("Camera permission already granted");
            setCameraMode(true);
            setTimeout(() => {
               setFrameProcessingEnabled(true);
               startExerciseDetection();
            },1000);
        }else{
          console.log("Requesting camera permission");
            setPermissionModalVisible(true);
    }
    } catch (error) {
      console.error('Camera permission error: ', error);
      Alert.alert("Error", "Failed to access camera. Please try again");
    }
  };

  const handleCloseCamera = () => {
    setCameraMode(false);
    setPostureFeedback('Waiting for exercise...');
    setIsGoodPosture(true);
    stopAllAnalysis();
  };


  const toggleCameraType = () => {
    setCameraType((prevType) => (prevType === 'back' ? 'front': 'back'));
  };

  const PermissionRequestModal = () => (
    <Modal
    animationType='fade' transparent={true} visible={permissionModalVisible} onRequestClose={() => setPermissionModalVisible(false)}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalIconContainer}>
            <Ionicons name="camera" size={50} color="#007bff"/>
          </View>
         <Text style={styles.modalTitle}>Camera Access Needed</Text>
         <Text style={styles.modalText}> To analyze your exercise form correctly, we need permission to use your camera</Text>
         <TouchableOpacity style={styles.allowButton} onPress={async () => {
          const permissionResult = await requestPermission();
          setPermissionModalVisible(false);
          if(permissionResult.granted){
            setCameraMode(true);
          }else{
            Alert.alert(
              "Camera Permission Required",
              "We need camera access ton analyze your exercise form. Please enable it in your device settings",
              [{ text: "OK", onPress: () => console.log("ok pressed")}]
            );
          }
         }}>
          <Text style={styles.allowButtonText}>Allow Camera Access</Text>
         </TouchableOpacity>

         <TouchableOpacity style={styles.cancelButton} onPress={() => setPermissionModalVisible(false)}>
          <Text style={styles.cancelButtonText}>Not Now</Text>
         </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPoseOverlay = () => {
    if(!poseKeypoints || !poseKeypoints.points || poseKeypoints.points.length < 5) return null;
    return(
        <PoseVisualization keypoints={poseKeypoints} cameraType={cameraType}/>
    );
  };

  const renderGymHomeScreen = () => (

    <View style={styles.startContainer}>
      <Text style={styles.exerciseName}>{exerciseName || 'Exercise Pose Detection'}</Text>
    <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Your Progress:</Text>
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
       <TouchableOpacity style={styles.startButton} onPress={handleOpenCamera}>
          <Ionicons name="camera" size={24} color="white" style={{marginRight: 10}}/>
          <Text style={styles.startButtonText}>Open Camera</Text>
       </TouchableOpacity>
       </View>

  );

  const renderCameraScreen = () => (
    <View style={styles.fullScreenContainer}>
      <StatusBar hidden />

      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={cameraType} enableFrameProcessor={frameProcessingEnabled} frameProcessor={frameProcessor} frameProcessorFps={5}/>
      {renderPoseOverlay()}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Detecting exercise...</Text>
        </View>
      )}

      <SafeAreaView style={styles.cameraControls}>
        <TouchableOpacity style={styles.closeButton} onPress={handleCloseCamera}>
          <Ionicons name="close" size={28} color="white"/>
        </TouchableOpacity>

        <View style={styles.postureContainer}>
          <Text style={[
            styles.postureFeedback, isGoogPosture ?  styles.goodPostureText : styles.badPostureText
          ]}>
            {postureFeedback}
          </Text>
        </View>

        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
          <Ionicons name="camera-reverse" size={24} color="white"/>
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.statsOverlay}>
        <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.statsGradient}>
          <View style={styles.bottomControlRow}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxTitle}>Reps</Text>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatValue}>{correctReps}</Text>
                <Text style={styles.miniStatLabel}>Correct</Text>
              </View>
              <View styles={styles.miniStat}>
                <Text style={styles.miniStatValue}>{incorrectReps}</Text>
                <Text style={styles.miniStatLabel}>Incorrect</Text>
              </View>
            </View>
          </View>

          <View style={styles.statBox}>
            <Text styles={styles.statBoxTitle}>Form</Text>
            <View style={styles.angleRow}>
              <Text style={styles.angleValue}>{Math.round(currentAngle)}°</Text>
              <Text style={styles.stageValue}>{exerciseStage || '-'}</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statBoxTitle}>Progress</Text>
            <Text style={styles.progressText}>{setsCompleted}/{totalSets} Sets</Text>
          </View>
         
        </LinearGradient>
      </View>
      </View>
  );


  return (
    <View style={styles.container}>
      <PermissionRequestModal />

      {!cameraMode ? (
        <>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 10}}>
         <Ionicons name="arrow-back-outline" size={30} color="black"/>
      </TouchableOpacity>
      {renderGymHomeScreen()}
        </>
      ): (
        renderCameraScreen()
      )}
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  backButton: {
    padding: 15,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  startButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Full-screen camera styles
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: 50,
    zIndex: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postureContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  postureFeedback: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goodPostureText: {
    color: '#4cd964',
  },
  badPostureText: {
    color: '#ff3b30',
  },

  statsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  statsGradient: {
    padding: 20,
    paddingBottom: 40,
  },
  bottomControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 5,
  },
  statBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  miniStat: {
    alignItems: 'center',
    flex: 1,
  },
  miniStatValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  miniStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  angleBox: {
    alignItems: 'center',
  },
  angleValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  stageValue: {
    color: '#fff',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  progressText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.85,
  },
  modalIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  allowButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  allowButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  angleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
});

export default GymScreen;