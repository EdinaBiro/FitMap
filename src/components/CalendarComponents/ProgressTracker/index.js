import { Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import styles from './styles';

const ProgressTracker = ({
    image1, image2,uploadDate1, uploadDate2, PickProgessImage, isAnalyzing, handleAnalyzeProgress
}) => {
  return(
    
            <View style={styles.progresSection}>
                 <Text style={styles.textProgress}>Progress Tracker</Text>
                 <Text style={styles.subtitle}>Visualize your transformation journey</Text>
           
           <View style={styles.comparisonContainer}>
            <View style={styles.imageColumn}>
                    <Text style={styles.imageLabel}>BEFORE</Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={() => PickProgessImage(1)}>
                        {image1 ? (
                            <>
                            <Image source={{uri: image1}} style={styles.image}/>
                            <View style={styles.dateBadge}>
                                <Text style={styles.dateBadgeText}>
                                    {moment(uploadDate1).format('MMM D')}
                                </Text>
                            </View>
                            </>
                        ):(
                            <View style={styles.uploadPlaceHolder}>
                                <Ionicons name="add-circle-sharp" size={32} color="#6200ee"/>
                                <Text style={styles.uploadButtonText}>Add A Before Photo</Text>
                            </View> 
                           
                        )}
                    </TouchableOpacity>
                </View>
    
                        <View style={styles.divider}>
                            <View style={styles.dividerLine}/>
                            <Ionicons name="compass" size={24} color="#6200ee"/>
                            <View style={styles.dividerLine}/>
                        </View>
    
                    <View style={styles.imageColumn}>
                        <Text style={styles.imageLabel}>AFTER</Text>
                        <TouchableOpacity style={styles.imageUploadCard} onPress={() => PickProgessImage(2)}>
                        {image2 ? (
                            <>
                            <Image source={{uri: image2}} style={styles.image}/>
                            <View style={styles.dateBadge}>
                                <Text style={styles.dateBadgeText}>
                                    {moment(uploadDate2).format('MMM D')}
                                </Text>
                            </View>
                            </>
                        ):(
                            <View style={styles.uploadPlaceholder}>
                                <Ionicons name="add-circle-sharp" size={32} color="#6200ee"/>
                                <Text style={styles.uploadButtonText}>Add An After Photo</Text>
                            </View> 
                        )} 
                        </TouchableOpacity>
                    </View>
                </View>
            <TouchableOpacity
            style={styles.analyzeButton}
            onPress={handleAnalyzeProgress}
            disabled={isAnalyzing}
            >
                <Text style={styles.analyzeButtontext}>
                {isAnalyzing ? "Analyzing..." : "Analyze Progress"}
                </Text>
            </TouchableOpacity>
        </View>
  );
};

export default ProgressTracker;

