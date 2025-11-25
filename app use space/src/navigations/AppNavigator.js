import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext.js';

import LoginScreen from '../screens/Auth/LoginScreen.js';
import RegisterScreen from '../screens/Auth/RegisterScreen.js';

import LandlordNavigator from './LandlordNavigator.js';
import MasterNavigator from './MasterNavigator.js';
import TenantNavigator from './TenantNavigator.js';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator 
      screenOptions={{ 
          headerShown: true,
          headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
          headerTitleAlign: 'center',
      }}
  >
    <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{
            title: '', 
        }}
    />
    <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{
            title: '', 
        }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { userRole } = useAuth();

  const ErrorView = () => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Erro de Roteamento</Text>
      </View>
  );

  return (
    <NavigationContainer>
      {userRole === 'unauthenticated' ? (
        <AuthStack />
      ) : userRole === 'tenant' ? (
        <TenantNavigator />
      ) : userRole === 'landlord' ? (
        <LandlordNavigator />
      ) : userRole === 'master' ? (
        <MasterNavigator />
      ) : (
        <ErrorView />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;