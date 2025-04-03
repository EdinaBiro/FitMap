import { Text, TouchableOpacity, View, Image, ScrollView, ActivityIndicator,Modal, Pressable, StyleSheet} from 'react-native';
import React , {useEffect, useRef, useState }from 'react';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import styles from './styles';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const ProgressTracker = ({
    image1, image2,uploadDate1, uploadDate2, PickProgessImage, isAnalyzing, handleAnalyzeProgress, analysisResult
}) => {
    const [modalVisible, setModalVisible] =useState(false);
    const [typingText, setTypingText] = useState('');
    const [typingFullText,setTypingFullText] = useState('');
    const [isTyping, setIsTyping]=useState(false);
    const [isTypingFull, setIsTypingFull] = useState(false);
    const fullText =useRef('');
    const summarizedText = useRef('');
    const typingSpeed = 30;

    useEffect(() => {
        if(isAnalyzing){
            setModalVisible(true);
        }

        if(analysisResult && !isTyping && !isTypingFull){
            fullText.current = analysisResult;
            const lines = analysisResult.split('.');
            const keyPoints= lines.filter(line => 
                line.includes('imporvement') ||
                line.includes('progress') ||
                line.includes('change') ||
                line.includes('result')
            ).slice(0,3);

            summarizedText.current = keyPoints.join('. ') + '.';
            if(summarizedText.current.trim() === '.'){
                summarizedText.current = lines.slice(0,2).join('.') +'.';
            }   

            setTypingText('');
            setTypingFullText('');
            startTyping();

        }
    }, [isAnalyzing, analysisResult])

    const startTypingFull = () => {
        setIsTypingFull(true);
        let i =0;
        const fullInterval = setInterval(() => {
        if(i < fullText.current.length){
            setTypingFullText(prev => prev + fullText.current.charAt(i));
            i++;
        }else{
            clearInterval(fullInterval);
            setIsTypingFull(false);
        }
    },typingSpeed / 2);
    };

    const startTyping = () => {
        setIsTyping(true);
        let i =0;
        const interval = setInterval(() => {
            if( i < summarizedText.current.length){
                setTypingText(prev => prev + summarizedText.current.charAt(i));
                i++;
            }else{
            clearInterval(interval);
            setIsTyping(false);
            startTypingFull();
            }
        }, typingSpeed);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setTypingText(fullText.current);
        setIsTyping(false);
    }
    return(
        <> 
        <ScrollView showsVerticalScrollIndicator={false} style={{flex:1}}>
            <Animated.View
            entering={FadeInUp.duration(500).delay(100)}
            style={styles.progressHeader}>
                 <Text style={styles.textProgress}>Progress Tracker</Text>
                 <Text style={styles.subtitle}>Visualize your transformation journey</Text>
            </Animated.View>

            <Animated.View
            entering={FadeInUp.duration(500).delay(200)}
             style={styles.comparisonContainer}>
            <View style={styles.imageColumn}>
                    <Text style={styles.imageLabel}>BEFORE</Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={() => PickProgessImage(1)} activeOpacity={0.9}>
                        {image1 ? (
                            <>
                            <View style={styles.imageContainer}>
                            <Image source={{uri: image1}} style={styles.image}/>
                            <View style={styles.dateBadge}>
                                <Text style={styles.dateBadgeText}>
                                    {moment(uploadDate1).format('MMM D')}
                                </Text>
                            </View>
                            </View>
                            </>
                        ):(
                            <View style={styles.uploadPlaceHolder}>
                                <LinearGradient colors={['#7d40ff', '#6200ee']} style={styles.addButtonGradient}>
                                    <Ionicons name="add-circle-sharp" size={32} color="#ffffff"/>
                                </LinearGradient>
                                <Text style={styles.uploadButtonText}>Add A Before Photo</Text>
                            </View> 
                           
                        )}
                    </TouchableOpacity>
                </View>
    
                        <View style={styles.divider}>
                            <View style={styles.dividerLine}/>
                            <LinearGradient colors={['#7d40ff', '#6200ee']} style={styles.dividerIcon}>
                                <Ionicons name="trending-up" size={24} color="#ffffff"/>
                            </LinearGradient>
                            <View style={styles.dividerLine}/>
                        </View>
    
                    <View style={styles.imageColumn}>
                        <Text style={styles.imageLabel}>AFTER</Text>
                        <TouchableOpacity style={styles.uploadButton} onPress={() => PickProgessImage(2)} activeOpacity={0.9}>
                        {image2 ? (
                            <>
                            <View style={styles.imageContainer}>
                            <Image source={{uri: image2}} style={styles.image}/>
                            <View style={styles.dateBadge}>
                                <Text style={styles.dateBadgeText}>
                                    {moment(uploadDate2).format('MMM D')}
                                </Text>
                            </View>
                        </View>
                            </>
                        ):(
                            <View style={styles.uploadPlaceHolder}>
                                <LinearGradient colors={['#7d40ff', '#6200ee']} style={styles.addButtonGradient}>
                                 <Ionicons name="add-circle-sharp" size={32} color="ffffff"/>
                                </LinearGradient>
                                <Text style={styles.uploadButtonText}>Add An After Photo</Text>
                            </View> 
                        )} 
                        </TouchableOpacity>
                    </View>
                </Animated.View>

            <Animated.View 
            entering={FadeInUp.duration(500).delay(300)}
            style={styles.analyzeButtonContainer}>
            <TouchableOpacity
            style={[styles.analyzeButton, (!image1 || !image2) && styles.analyzeButtonDisabled]}
            onPress={handleAnalyzeProgress}
            disabled={isAnalyzing || !image1 || !image2}
            >
                {isAnalyzing ? (
                    <View style={styles.analyzeButtonContent}>
                        <ActivityIndicator size="small" color="#ffffff"/>
                        <Text style={styles.analyzeButtontext}>Analyzing...</Text>
                    </View>
                ) : (
                    <View style={styles.analyzeButtonContent}>
                        <Ionicons name="chatbubble-ellipses-sharp" size={20} color="#ffffff" style={{marginRight: 8}}/>
                        <Text style={styles.analyzeButtontext}>
                            Analyze Progress
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>

        {analysisResult && !modalVisible && (
            <Animated.View 
            entering={FadeInDown.duration(700)}
            style={styles.analysisResultContainer}>
                <LinearGradient
                colors={['#ffffff', '#f8f5ff']}
                style={styles.analysisCard}>
                <View style={styles.analysisHeader}>
                    <MaterialCommunityIcons name="brain" size={24} color="#6200ee"/>
                    <Text style={styles.analysisHeaderText}>AI Progress Analysis</Text>
                </View>
                <View style={styles.analysisFooter}>
                    <View style={styles.footerBadge}>
                        <Ionicons name="fitness" size={24} color="#6200ee"/>
                        <Text style={styles.analysisFooterText}>Keep pushing your limits</Text>
                    </View>
                </View>
            </LinearGradient>
            </Animated.View>
        )}
        </ScrollView>

        <Modal
        animationType='fade'
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}>
        
        <View style={modalStyles.centeredView}>
            <BlurView intensity={80} style={modalStyles.blurBackground} tint="dark">
                <View style={modalStyles.modalView}>
                    <Pressable style={modalStyles.closeButton} onPress={handleCloseModal}>
                        <Ionicons name="close" size={24} color="#6200ee"/>
                    </Pressable>

                    <Text style={modalStyles.modalTitle}>AI Progess Analysis</Text>

                    <View style={modalStyles.imageContainer}>
                        {image1 && (
                        <View style={modalStyles.modalImageColumn}>
                        <Text style={modalStyles.modalImageLabel}>BEFORE</Text>
                        <Image source={{uri: image1}} style={modalStyles.modalImage}/>
                    </View>
                    )}

{                       image2 && (
                        <View style={modalStyles.modalImageColumn}>
                        <Text style={modalStyles.modalImageLabel}>AFTER</Text>
                        <Image source={{uri: image2}} style={modalStyles.modalImage}/>
                    </View>
                    )}
                    </View>

                <View style={modalStyles.analysisContainer}>
                    {isAnalyzing ? (
                    <View style={modalStyles.analyzingContainer}>
                        <ActivityIndicator size="large" color="#6200ee"/>
                        <Text style={modalStyles.analyzingText}>Analyzing...</Text>
                    </View>
                ) : (
                    <View style={modalStyles.analysisContent}>
                        <MaterialCommunityIcons name="brain" size={24} color="#6200ee" style={modalStyles.brainIcon}/>
                        <Text style={[modalStyles.analysisText, modalStyles.keyHighlights]}>
                            <Text style={modalStyles.highlightsHeader}>Key Highlights</Text>{'\n'}
                            {typingText}
                        </Text>
                        {isTyping && <View style={modalStyles.cursor}/>}
                    </View>
                )}
                </View>

                <View style={modalStyles.footerContainer}>
                    <Ionicons name="fitness" size={24} color="#6200ee"/>
                    <Text style={modalStyles.footerText}>Keep pushing your limits</Text>
                </View>
            </View>
            </BlurView>
        </View>
            
        </Modal>
        </>
  );
};

const modalStyles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    blurBackground: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalView: {
      width: '80%',
      height: 'auto',
      maxHeight: '80%',
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 10,
      padding: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#6200ee',
      textAlign: 'center',
      marginBottom: 15,
      marginTop: 5,
    },
    imageContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    modalImageColumn: {
      width: '48%',
      alignItems: 'center',
    },
    modalImageLabel: {
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 1,
      marginBottom: 5,
      color: '#555',
    },
    modalImage: {
      width: '100%',
      height: 150,
      borderRadius: 10,
    },
    analysisContainer: {
      backgroundColor: '#f8f5ff',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
    },
    analyzingContainer: {
      alignItems: 'center',
      padding: 20,
    },
    analyzingText: {
      marginTop: 10,
      color: '#6200ee',
      fontSize: 16,
      fontWeight: '500',
    },
    analysisContent: {
      position: 'relative',
    },
    brainIcon: {
      position: 'absolute',
      top: 0,
      left: 0,
    },
    analysisText: {
      fontSize: 16,
      lineHeight: 24,
      color: '#333',
      paddingLeft: 30,
      marginBottom: 5,
    },
    cursor: {
      width: 2,
      height: 20,
      backgroundColor: '#6200ee',
      marginLeft: 4,
    },
    footerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 5,
    },
    footerText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#6200ee',
      marginLeft: 8,
    },
    highlightsHeader:{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    keyHighlights:{
        fontSize: 12,
        fontWeight: '400'
    }
  });
export default ProgressTracker;

