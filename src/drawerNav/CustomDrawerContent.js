import { StyleSheet, Text, View, Image, TouchableOpacity, Switch } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from './ThemeContext';
import { navigationRef } from '../navigation/NavigationRef';
import auth from '@react-native-firebase/auth';
import { baseURL } from '../utils';
import { useNavigation } from '@react-navigation/native';

const CustomDrawerContent = (props) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { isDarkTheme, setIsDarkTheme } = useContext(ThemeContext);
  const [profileImage, setProfileImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth().currentUser;
      if (user) {
        setUserId(user.uid);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`${baseURL}/profile/user/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setProfileImage(data.profile_image);
        }
      } catch (error) {
        console.error('Error fetching profile: ', error);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleLogout = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        console.log('Logging out...');
        await auth().signOut();
        console.log('User signed out');
      } else {
        console.log('No user currently signed in');
      }

      console.log('NavigationRef: ', navigationRef);

      navigation.navigate('LoginScreen');
    } catch (e) {
      console.log('Error during logout: ', e);
    }
  };

  const handleThemeToggle = () => {
    setIsDarkTheme((prevTheme) => !prevTheme);
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.profileContainer}>
        <Image
          source={profileImage ? { uri: profileImage } : require('../../assets/images/default-avatar.jpg')}
          style={styles.profileImage}
        />
      </View>
      <DrawerItemList {...props} />
      <TouchableOpacity onPress={() => setIsDropdownVisible(!isDropdownVisible)} style={styles.settingButton}>
        <Ionicons name="settings-outline" size={24} />
        <Text style={styles.settingsText}>Settings</Text>
      </TouchableOpacity>
      {isDropdownVisible && (
        <View style={styles.dropdown}>
          <View style={styles.option}>
            <Text style={styles.optionText}>Dark Theme</Text>
            <Switch value={isDarkTheme} onValueChange={handleThemeToggle} />
            <Ionicons name={isDarkTheme ? 'moon' : 'sunny'} size={24} />
          </View>
          <TouchableOpacity style={styles.option} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} />
            <Text style={styles.optionText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  settingsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    marginLeft: 16,
  },
  dropdown: {
    marginTop: 10,
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  optionText: {
    fontSize: 16,
  },
  profileContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileImage: {
    height: 100,
    width: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});

export default CustomDrawerContent;
