import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Button, Modal, Alert, Image } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { poseAPI } from '../../utils';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
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

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [videoAnalysisResult, setVideoAnalysisResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [postureFeedback, setPostureFeedback] = useState('Ready to upload video');
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    // Cleanup effect if needed
  }, []);

  const pickVideo = async () => {
    try {
      setUploadStatus('Selecting video...');

      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const video = result.assets[0];
        console.log('Selected video:', video);

        // Validate video file
        if (video.size && video.size > 100 * 1024 * 1024) {
          // 100MB limit
          Alert.alert('File Too Large', 'Please select a video smaller than 100MB');
          setUploadStatus('');
          return;
        }
        7;

        setSelectedVideo(video);
        setUploadStatus(`Selected: ${video.name}`);
        setPostureFeedback(`Video selected: ${video.name}`);

        // Automatically analyze the selected video
        await uploadAndAnalyzeVideo(video.uri);
      } else {
        setUploadStatus('');
        setPostureFeedback('No video selected');
      }
    } catch (error) {
      console.error('Video selection error:', error);
      Alert.alert('Selection Error', 'Failed to select video. Please try again.');
      setUploadStatus('');
      setPostureFeedback('Ready to upload video');
    }
  };

  const uploadAndAnalyzeVideo = async (uri) => {
    try {
      setIsAnalyzing(true);
      setPostureFeedback('Analyzing your exercise form...');
      setUploadStatus('Uploading and analyzing...');

      const formData = new FormData();
      formData.append('video', {
        uri: uri,
        name: selectedVideo?.name || 'exercise.mp4',
        type: selectedVideo?.mimeType || 'video/mp4',
      });
      formData.append('exercise', 'bicep_curl');

      console.log('Uploading video to backend:', uri);

      // 1. First get the raw response
      const rawResponse = await fetch(`${poseAPI}/analyze-video`, {
        method: 'POST',
        body: formData,
      });

      // 2. Check for HTTP errors first
      if (!rawResponse.ok) {
        const errorText = await rawResponse.text();
        throw new Error(`HTTP ${rawResponse.status}: ${errorText}`);
      }

      // 3. Parse the JSON only after verifying HTTP status
      const result = await rawResponse.json();
      console.log('RAW BACKEND RESPONSE:', result);

      // 4. Verify the structure you expect
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response format from server');
      }

      // 5. Update state with the actual values from backend
      setVideoAnalysisResult(result);
      setShowResults(true);

      // 6. Use the counts DIRECTLY from backend (no addition)
      setCorrectReps(result.correct_reps ?? 0);
      setIncorrectReps(result.incorrect_reps ?? 0);

      setPostureFeedback('Analysis complete! Check your results.');
      setUploadStatus('Analysis complete');
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert.alert('Error', error.message || 'Analysis failed');
      setPostureFeedback('Analysis failed. Try again');
      setUploadStatus('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenCamera = async () => {
    console.log('Opening video upload mode');
    setCameraMode(true);
  };

  const handleCloseCamera = () => {
    setCameraMode(false);
    setPostureFeedback('Ready to upload video');
    setUploadStatus('');
    setShowResults(false);
    setVideoAnalysisResult(null);
    setSelectedVideo(null);
  };

  const toggleCameraType = () => {
    setCameraType((prevType) => (prevType === 'back' ? 'front' : 'back'));
  };

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
        <Ionicons name="cloud-upload" size={24} color="white" style={{ marginRight: 10 }} />
        <Text style={styles.startButtonText}>Upload Video</Text>
      </TouchableOpacity>
    </View>
  );

  const renderUploadScreen = () => (
    <View style={styles.fullScreenContainer}>
      <StatusBar hidden />

      <View style={styles.uploadBackground}>
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
            {uploadStatus ? <Text style={styles.uploadStatus}>{uploadStatus}</Text> : null}
          </View>

          <View style={styles.placeholderButton} />
        </SafeAreaView>

        <View style={styles.uploadContent}>
          <View style={styles.uploadIcon}>
            <Ionicons name="cloud-upload-outline" size={80} color="rgba(255,255,255,0.8)" />
          </View>

          <Text style={styles.uploadTitle}>Upload Exercise Video</Text>
          <Text style={styles.uploadSubtitle}>Select a video from your device to analyze your exercise form</Text>

          {selectedVideo && (
            <View style={styles.selectedVideoInfo}>
              <Ionicons name="videocam" size={24} color="#4cd964" />
              <Text style={styles.selectedVideoText}>{selectedVideo.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.uploadControls}>
          <TouchableOpacity
            style={[styles.uploadButton, isAnalyzing && styles.uploadButtonDisabled]}
            onPress={pickVideo}
            disabled={isAnalyzing}
          >
            <Ionicons name="folder-open" size={24} color="white" style={{ marginRight: 10 }} />
            <Text style={styles.uploadButtonText}>{selectedVideo ? 'Select Different Video' : 'Select Video'}</Text>
          </TouchableOpacity>

          {selectedVideo && !isAnalyzing && (
            <TouchableOpacity style={styles.analyzeButton} onPress={() => uploadAndAnalyzeVideo(selectedVideo.uri)}>
              <Ionicons name="analytics" size={24} color="white" style={{ marginRight: 10 }} />
              <Text style={styles.analyzeButtonText}>Analyze Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ResultsModal />

      {!cameraMode ? (
        <>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
            <Ionicons name="arrow-back-outline" size={30} color="black" />
          </TouchableOpacity>
          {renderGymHomeScreen()}
        </>
      ) : (
        renderUploadScreen()
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
  uploadBackground: {
    flex: 1,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#667eea',
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
  placeholderButton: {
    width: 44,
    height: 44,
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
    color: 'white',
    textAlign: 'center',
  },
  uploadStatus: {
    fontSize: 12,
    color: '#4cd964',
    textAlign: 'center',
    marginTop: 2,
  },
  uploadContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  uploadIcon: {
    marginBottom: 30,
    opacity: 0.8,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  uploadSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  selectedVideoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 20,
  },
  selectedVideoText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  uploadControls: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    marginBottom: 15,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  uploadButtonDisabled: {
    backgroundColor: 'rgba(0,123,255,0.5)',
    opacity: 0.6,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyzeButton: {
    backgroundColor: '#4cd964',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 3,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 15,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  resultsModal: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.9,
    maxHeight: '80%',
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  resultsContent: {
    width: '100%',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  feedbackSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  tipsSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#856404',
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#856404',
  },
  closeResultsButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  closeResultsText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GymScreen;
