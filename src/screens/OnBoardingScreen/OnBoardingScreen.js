import { StyleSheet, Text, View, Image, TouchableOpacity, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useNavigation} from '@react-navigation/native';
import OnBoarding from 'react-native-onboarding-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';


const OnBoardingScreen = () => {
 const navigation = useNavigation();
 const fadeAnim = useRef(new Animated.Value(0)).current;
 const scaleAnim = useRef(new Animated.Value(0.8)).current;

 const renderNextButton = ({...props}) => {
    return(
    <TouchableOpacity {...props}>
        <Text>Next</Text>
    </TouchableOpacity>
    );
 };

 useEffect(() => {
    Animated.parallel([
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }),
    ]).start();
 },[fadeAnim, scaleAnim]);
  return (
    <LinearGradient 
        colors={['#f5f7fa', '#e4e0ff']}
        style={styles.background}
    >   
    <OnBoarding 
        onDone={() => navigation.navigate('LoginScreen')}
        onSkip={() => navigation.navigate('LoginScreen')}
        NextButtonComponent={renderNextButton}
        pages={[
            {
                backgroundColor: 'transparent',
                image: (
                    <Animated.View style={[styles.animationContainer, {opacity: fadeAnim, transform: [{scale: scaleAnim}]}]}>
                        <LottieView
                            source={require('../../../assets/animations/map_animation.json')}
                            autoPlay
                            loop
                            style={{width: 450, height: 450}}
                        />
                     
                        {/* <Image
                        source={require('../../../assets/images/map.jpg')}
                        style={styles.image}/> */}
                
                <View style={styles.textContainer}>
                    <Text style={styles.welcomeText}>Welcome to</Text>
                    <Text style={styles.appNameText}>FitMap</Text>
                </View>
                </Animated.View>
            
                ),
                
            },
            {
                backgroundColor: 'white',
                image: (
                    <LottieView
                    source={require('../../../assets/animations/ai_animation.json')}
                    autoPlay
                    loop
                    style={{width: 300, height: 300}}
                    />
                ),
                title: 'Unlock Your Potential',
                subtitle: 'Train smarter with AI quidance or connect with personal trainers.\n\nTrack progress, crush goals, and transform your body with science-backed plans',
                titleStyles: styles.title,
                subTitleStyles: styles.subtitle
            },
            {
                backgroundColor: 'transparent',
                title: '',
                subtitle: '',
                image: (
                  <View style={styles.authScreenContainer}>
                    <Text style={styles.finalTitle}>Ready to Begin?</Text>
                    <View style={styles.socialButtonsContainer}>
                      
                      <TouchableOpacity style={[styles.socialButton, styles.googleButton]}
                        onPress={() => navigation.navigate('LoginScreen')}>
                         <LottieView
                            source={require('../../../assets/animations/google_animation.json')}
                            autoPlay
                            loop={false}
                            style={styles.socialIconLarge}
                          />                          
                          <Text style={styles.socialButtonTextLarge}>Continue with Google</Text>

                          </TouchableOpacity>
        
            
                            <TouchableOpacity style={[styles.socialButton,styles.facebookButton]}
                            onPress={() => navigation.navigate('LoginScreen')}>
                          <LottieView
                            source={require('../../../assets/animations/facebook_animation.json')}
                            autoPlay
                            loop={false}
                            style={styles.socialIconLarge}
                          />
                          <Text style={[styles.socialButtonTextLarge, {color: 'white'}]}>Continue with Facebook</Text>
                          </TouchableOpacity>
                          </View> 

              
                    
                    <View style={styles.authOptions}>
                      <TouchableOpacity
                        style={styles.largeActionButton}
                        onPress={() => navigation.navigate('SignUpScreen')}
                      >
                        <Text style={styles.largeActionButtonText}>Sign up with Email</Text>
                      </TouchableOpacity>
                    </View>
              
        
                    <View style={styles.loginPrompt}>
                      <Text style={styles.loginText}>Already have an account?</Text>
                      <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                        <Text style={styles.loginLink}>Sign In</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              }

            
        ]}
        bottomBarHighlight={false}
        showSkip={false}
        showNext={false}
        showDone={false}
        bottomBarHeight={80}
        containerStyle={styles.container}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        renderPage={({item}) => (
            <LinearGradient
            colors={['#ADD8E6', '#B0EOE6']}
            style={styles.LinearGradient}
            start={{ x: 0, y:0}}
            end={{x:1, y:1}}
            >
            </LinearGradient>
        )}
        />
        </LinearGradient>
  );
};


const styles = StyleSheet.create({
    container:{
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    image: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
        marginBottom: 40,
    
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#6200ee',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#495057',
        textAlign: 'center',
        marginBottom: 10,
    },
    lastScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    getStartedButton: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginBottom: 20,
    },
    getStartedButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    alreadyAccountText: {
        fontSize: 16,
        color: '#495057',
    }, 
    signInLink: {
        color: '#007bff',
        fontWeight: 'bold',
    },
    dot: {
        backgroundColor: '#ced4da',
        width: 10,
        height: 10,
        borderRadius: 4,
        marginHorizontal: 3,
    },
    activeDot: {
        backgroundColor: '#007bff',
        width: 12,
        height: 12,
        borderRadius: 6,
        marginHorizontal: 3,
    },
    LinearGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageContainer: {
        flex: 1,
        width: '100%',
    },
    background: {
        flex:1,
    },
    textContainer: {
        alignItems: 'center',
    },
    welcomeText:{
        fontSize: 28,
        fontWeight: '300',
        color: '#333',
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    appNameText: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#6200ee',
        marginTop: 5,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    socialAuthContainer: {
        width: '100%',
        paddingBottom: 100,
    },
    socialAuthTitle:{
        fontSize: 20,
        color: '#495057',
        marginBottom: 30,
        fontWeight: '600',
    },
    socialButtons:{
        width: '80%',
        marginBottom: 20,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 18,
        paddingHorizontal: 25,
        borderRadius: 30,
        marginBottom: 20,
        borderWidth:1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: {width: 0,height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,

    },
    facebookButton: {
        backgroundColor: '#1877f2',
        borderColor: '#1877f2',
    },
    googleButton:{
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    socialIcon: {
        width: 25,
        height: 25,
        marginRight: 15,
    },
    socialButtonText:{
        fontSize: 16,
        fontWeight: '500',
    },
    socialButtonTextLarge: {
        fontSize: 18,
        fontWeight: '600',
      },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#dee2e6',
    }, dividerText: {
        marginHorizontal: 10,
        color: '#6c757d',
    },
    finalScreenContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 40,
        width: '100%',
        backgroundColor: '#f8f9fa',
      },
      finalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 30,
        backgroundColor: 'transparent',
      },
      finalTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#6200ee',
        marginBottom: 40,
        textAlign: 'center',
      },
      largeActionButton: {
        backgroundColor: '#6200ee',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 30,
        marginTop: 10,
      },
      largeActionButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
      },
      loginPrompt: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        paddingBottom: 30,
      },
      loginText: {
        color: '#757575',
        fontSize: 16,
      },
      loginLink: {
        color: '#6200ee',
        fontWeight: '600',
        marginLeft: 5,
        fontSize: 16,
      },
      socialIconLarge: {
        width: 50,
        height: 50,
        marginRight: 15,
      },
      authScreenContainer:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
      }
})

export default OnBoardingScreen;