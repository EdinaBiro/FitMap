import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../bottomNav/BottomNavigation';
import CustomDrawerContent from './CustomDrawerContent';
import GymScreen from '../screens/GymScreen/GymScreen';
import WorkoutDetailsScreen from '../screens/Workout/WorkoutDetailsScreen';
import PersonalPlanScreen from '../screens/PersonalPlanScreen/PersonalPlanScreen';

const Drawer = createDrawerNavigator();

const CustomHeader = ({ navigation }) => (
  <View style={{ flexDirection: 'row', padding: 10 }}>
    <TouchableOpacity onPress={() => navigation.openDrawer()}>
      <Ionicons name="menu" size={30} color="black" />
    </TouchableOpacity>
  </View>
);

// const MainStack = () => (
//     <Stack.Navigator>
//         <Stack.Screen
//             name="MainStack"
//             component={BottomNavigation}
//             options={({navigation}) => ({
//                 headerLeft: () => <CustomHeader navigation={navigation} />,
//                 headerShown: true,
//                 title: '',
//             })} />

//     </Stack.Navigator>
// );

const DrawerNavigation = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#ffffff',
          width: 250,
        },
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerShown: true,
        headerTintColor: '#000000',
        drawerLabelStyle: {
          color: '#000000',
          fontSize: 14,
          marginLeft: -10,
        },
      }}
    >
      <Drawer.Screen
        name="HomeTabs"
        component={BottomNavigation}
        options={{ title: '', drawerItemStyle: { display: 'none' } }}
      ></Drawer.Screen>

      <Drawer.Screen
        name="GymScreen"
        component={GymScreen}
        options={{ title: '', drawerItemStyle: { display: 'none' } }}
      ></Drawer.Screen>

      <Drawer.Screen
        name="WorkoutDetailsScreen"
        component={WorkoutDetailsScreen}
        options={{ title: '', drawerItemStyle: { display: 'none' } }}
      ></Drawer.Screen>
    </Drawer.Navigator>
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

export default DrawerNavigation;
