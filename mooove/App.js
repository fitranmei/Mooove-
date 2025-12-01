import Welcome from './components/Welcome';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';


const Stack = createNativeStackNavigator();

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
          name="home" 
          component={Home} 
          options={{ headerShown: false }}
        />
      

      </Stack.Navigator>
    </NavigationContainer>
  );
}

