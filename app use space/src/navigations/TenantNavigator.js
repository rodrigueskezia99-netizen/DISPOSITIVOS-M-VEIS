import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Novo import
import { TouchableOpacity } from 'react-native';
import { auth } from '../config/firebase';

// Telas que o inquilino verá
import AppointmentsScreen from '../screens/Tenant/AppointmentsScreen'; // A ser criada
import BookingFormScreen from '../screens/Tenant/BookingFormScreen'; // Novo
import ProfileScreen from '../screens/Tenant/ProfileScreen'; // A ser criada
import PropertyDetailsScreen from '../screens/Tenant/PropertyDetailsScreen'; // Novo
import SearchScreen from '../screens/Tenant/SearchScreen';

const Tab = createBottomTabNavigator();
const SearchStack = createNativeStackNavigator(); // Novo Stack para busca

// Stack aninhado para o fluxo de Busca (que permite navegação para detalhes/reserva)
const SearchFlow = () => (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
        <SearchStack.Screen name="SearchList" component={SearchScreen} />
        <SearchStack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
        <SearchStack.Screen name="BookingForm" component={BookingFormScreen} />
    </SearchStack.Navigator>
);


const TenantNavigator = () => {
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
            {}
            <Tab.Screen 
                name="SearchTab" 
                component={SearchFlow} 
                options={{
                    headerShown: false,
                    title: 'Buscar Imóveis',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="search" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen 
                name="Appointments" 
                component={AppointmentsScreen} 
                options={{
                    title: 'Meus Agendamentos',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="calendar-today" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="person" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default TenantNavigator;