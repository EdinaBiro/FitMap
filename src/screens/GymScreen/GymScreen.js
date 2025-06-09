import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Button, Modal, Alert, Image } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { poseAPI } from '../../utils';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import PoseVisualization from './PoseVisualization';
import { TargetType } from '@expo/config-plugins/build/ios/Target';

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

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [videoAnalysisResult, setVideoAnalysisResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [postureFeedback, setPostureFeedback] = useState('Ready to record');
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);

  const recordingTimer = useRef(null);
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  const startRecording = async () => {
    if (!cameraRef.current) return;
    try {
      console.log('Starting video recording...');
      setIsRecording(true);
      setRecordingDuration(0);
      setPostureFeedback('Recording...Perform your exercise');

      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      const video = await cameraRef.current.recordAsync({
        quality: '720p',
        maxDuration: 30,
        mute: false,
      });

      console.log('Video recorded:', video.uri);
      await uploadAndAnalyzeVideo(video.uri);
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Recording Error', 'Failed to record video.Please try again');
      stopRecording();
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    try {
      console.log('Stopping video recording...');
      await cameraRef.current.stopRecording();
      setIsRecording(false);
      setPostureFeedback('Processing video');

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    }
  };

  const uploadAndAnalyzeVideo = async (videoUri) => {
    try {
      setIsAnalyzing(true);
      setPostureFeedback('Analyzing your exercise form...');

      const formData = new FormData();
      formData.append('exercise', 'bicep_curl'); //TODO: make this dynamic
      formData.append('video', {
        uri: videoUri,
        name: 'exercise.mp4',
        type: 'video/mp4',
      });

      console.log('Uploading video to backend');

      const response = await fetch(`${poseAPI.replace('/analyze-pose', '/analyze-video')}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error, status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Video analysis result:', result);

      setVideoAnalysisResult(result);
      setShowResults(true);

      if (result.total_reps) {
        setCorrectReps((prev) => prev + (result.correct_reps || 0));
        setIncorrectReps((prev) => prev + (result.incorrect_reps || 0));
      }

      setPostureFeedback('Analysis complete');
    } catch (error) {
      console.error('Video analysis result:', result);
      Alert.alert('Analysis Error', 'Failed to analyze video.Please check your connection and try again');
      setPostureFeedback('Analysis failed.Try again');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenCamera = async () => {
    console.log('Opening camera, permission status: ', permission?.granted);
    try {
      if (permission?.granted) {
        console.log('Camera permission already granted');
        setCameraMode(true);
      } else {
        console.log('Requesting camera permission');
        setPermissionModalVisible(true);
      }
    } catch (error) {
      console.error('Camera permission error: ', error);
      Alert.alert('Error', 'Failed to access camera. Please try again');
    }
  };

  const handleCloseCamera = () => {
    if (isRecording) {
      stopRecording();
    }
    setCameraMode(false);
    setPostureFeedback('Waiting for exercise...');
    setShowResults(false);
    setVideoAnalysisResult(null);
  };

  const toggleCameraType = () => {
    setCameraType((prevType) => (prevType === 'back' ? 'front' : 'back'));
  };

  const PermissionRequestModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={permissionModalVisible}
      onRequestClose={() => setPermissionModalVisible(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalIconContainer}>
            <Ionicons name="camera" size={50} color="#007bff" />
          </View>
          <Text style={styles.modalTitle}>Camera Access Needed</Text>
          <Text style={styles.modalText}>
            {' '}
            To analyze your exercise form correctly, we need permission to use your camera
          </Text>
          <TouchableOpacity
            style={styles.allowButton}
            onPress={async () => {
              const permissionResult = await requestPermission();
              setPermissionModalVisible(false);
              if (permissionResult.granted) {
                setCameraMode(true);
              } else {
                Alert.alert(
                  'Camera Permission Required',
                  'We need camera access ton analyze your exercise form. Please enable it in your device settings',
                  [{ text: 'OK', onPress: () => console.log('ok pressed') }],
                );
              }
            }}
          >
            <Text style={styles.allowButtonText}>Allow Camera Access</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => setPermissionModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Not Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const ResultsModal = () => (
    <Modal animationType="slide" transparent={true} visible={showResults} onRequestClose={() => setShowResults(false)}>
      <View style={styles.centeredView}>
        <View style={styles.resultsModal}>
          <Text style={styles.resultsTitle}>Exercise Analysis Results</Text>

          {videoAnalysisResult && (
            <View style={styles.resultsContent}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Reps:</Text>
                <Text style={styles.resultValue}>{videoAnalysisResult.total_reps || 0}</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Correct Form:</Text>
                <Text style={[styles.resultValue, { color: '#4cd964' }]}>{videoAnalysisResult.correct_reps || 0}</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Needs Improvement:</Text>
                <Text style={[styles.resultValue, { color: '#ff3b30' }]}>
                  {videoAnalysisResult.incorrect_reps || 0}
                </Text>
              </View>

              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackTitle}>AI Feedback:</Text>
                <Text style={styles.feedbackText}>
                  {videoAnalysisResult.feedback || 'Great job! Keep up the good work.'}
                </Text>
              </View>

              {videoAnalysisResult.improvement_tips && (
                <View style={styles.tipsSection}>
                  <Text style={styles.tipsTitle}>Improvement Tips:</Text>
                  <Text style={styles.tipsText}>{videoAnalysisResult.improvement_tips}</Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.closeResultsButton} onPress={() => setShowResults(false)}>
            <Text style={styles.closeResultsText}>Continue Training</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderGymHomeScreen = () => (
    <View style={styles.startContainer}>
      <Text style={styles.exerciseName}>{exerciseName || 'Exercise Video Analysis'}</Text>
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
            <Text style={styles.statValue}>
              {setsCompleted} / {totalSets}
            </Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{repsPerSet}</Text>
            <Text style={styles.statLabel}>Reps/Set</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.startButton} onPress={handleOpenCamera}>
        <Ionicons name="videocam" size={24} color="white" style={{ marginRight: 10 }} />
        <Text style={styles.startButtonText}>Start Recording</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCameraScreen = () => (
    <View style={styles.fullScreenContainer}>
      <StatusBar hidden />

      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={cameraType} />

      {isAnalyzing && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Analyzing video...</Text>
        </View>
      )}

      <SafeAreaView style={styles.cameraControls}>
        <TouchableOpacity style={styles.closeButton} onPress={handleCloseCamera}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <View style={styles.postureContainer}>
          <Text style={styles.postureFeedback}>{postureFeedback}</Text>
          {isRecording && <Text style={styles.recordingDuration}>{formatDuration(recordingDuration)}</Text>}
        </View>

        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
          <Ionicons name="camera-reverse" size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.recordingControls}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording ? styles.recordButtonActive : styles.recordButtonInactive]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isAnalyzing}
        >
          <Ionicons name={isRecording ? 'stop' : 'radio-button-on'} size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <PermissionRequestModal />
      <ResultsModal />

      {!cameraMode ? (
        <>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
            <Ionicons name="arrow-back-outline" size={30} color="black" />
          </TouchableOpacity>
          {renderGymHomeScreen()}
        </>
      ) : (
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
