import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Mudança para Tabs
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { auth } from '../config/firebase';

// Telas individuais
import MyPropertiesScreen from '../screens/Landlord/MyPropertiesScreen.js';
import PropertyFormScreen from '../screens/Landlord/PropertyFormScreen.js';
import AppointmentsScreen from '../screens/Tenant/AppointmentsScreen.js'; // Reutilizamos esta tela!

const Tab = createBottomTabNavigator();
const PropertyStack = createNativeStackNavigator();

// Stack para gerenciar o fluxo de Propiedades
const PropertyManagementFlow = () => (
    <PropertyStack.Navigator screenOptions={{ headerShown: false }}>
        <PropertyStack.Screen name="MyPropertiesList" component={MyPropertiesScreen} />
        <PropertyStack.Screen name="PropertyForm" component={PropertyFormScreen} />
    </PropertyStack.Navigator>
);

const LandlordNavigator = () => {
    const handleLogout = () => { auth.signOut(); };

    return (
        <Tab.Navigator 
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: '#003366' },
                headerTintColor: '#fff',
                tabBarActiveTintColor: '#FF5A5F', 
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { paddingVertical: 5, height: 60 },
                tabBarLabelStyle: { fontSize: 12, marginBottom: 5 },
                headerRight: () => (
                    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
                        <MaterialIcons name="logout" size={24} color="#fff" />
                    </TouchableOpacity>
                ),
            })}
        >
            <Tab.Screen 
                name="PropertiesTab" 
                component={PropertyManagementFlow} 
                options={{ 
                    headerShown: false, 
                    title: 'Meus Imóveis',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="home-work" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen 
                name="ReceivedAppointments" 
                component={AppointmentsScreen} // A tela é inteligente para reconhecer o nível do usuário
                options={{
                    title: 'Solicitações',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="notification-important" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default LandlordNavigator;