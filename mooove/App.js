import Welcome from './components/Welcome';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import MyTicket from './components/MyTicket';
import History from './components/History';
import Account from './components/Account';
import BookingForm from './components/BookingForm';
import TrainList from './components/TrainList';
import PassengerData from './components/PassengerData';
import SeatSelection from './components/SeatSelection';
import PaymentConfirmation from './components/PaymentConfirmation';
import PaymentMethod from './components/PaymentMethod';


import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#F31260',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { 
          height: 80, 
          paddingBottom: 20, 
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans_700Bold',
          fontSize: 12,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource;

          if (route.name === 'home') {
            iconSource = require('./assets/images/navitem-1.png');
          } else if (route.name === 'myticket') {
            iconSource = require('./assets/images/navitem-2.png');
          } else if (route.name === 'history') {
            iconSource = require('./assets/images/navitem-3.png');
          } else if (route.name === 'account') {
            iconSource = require('./assets/images/navitem-4.png');
          }

          return (
            <Image 
              source={iconSource} 
              style={{ width: 24, height: 24, tintColor: color, resizeMode: 'contain' }} 
            />
          );
        },
      })}
    >
      <Tab.Screen name="home" component={Home} options={{ title: 'Beranda' }} />
      <Tab.Screen name="myticket" component={MyTicket} options={{ title: 'Tiket Saya' }} />
      <Tab.Screen name="history" component={History} options={{ title: 'Riwayat' }} />
      <Tab.Screen name="account" component={Account} options={{ title: 'Akun Saya' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  let [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
      
        <Stack.Screen 
          name="welcome" 
          component={Welcome} 
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="register" 
          component={Register} 
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="login" 
          component={Login} 
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="MainApp" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="BookingForm"
          component={BookingForm}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="TrainList"
          component={TrainList}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="PassengerData"
          component={PassengerData}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="SeatSelection"
          component={SeatSelection}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="PaymentConfirmation"
          component={PaymentConfirmation}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="PaymentMethod"
          component={PaymentMethod}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

