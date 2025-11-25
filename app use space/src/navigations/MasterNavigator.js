import { MaterialIcons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { auth } from '../config/firebase';

// Telas do Mestre
import AdminAppointmentsScreen from '../screens/Master/AdminAppointmentsScreen';
import AdminDashboard from '../screens/Master/AdminDashboard';
import AdminPropertiesScreen from '../screens/Master/AdminPropertiesScreen';
import AdminUsersScreen from '../screens/Master/AdminUsersScreen';

// Telas reusáveis do Landlord (para edição dos usuários)
import PropertyFormScreen from '../screens/Landlord/PropertyFormScreen';

const Stack = createNativeStackNavigator();

const MasterNavigator = () => {
    const handleLogout = () => { auth.signOut(); };

    return (
        <Stack.Navigator
            initialRouteName="AdminDashboard"
            screenOptions={{
                headerStyle: { backgroundColor: '#003366' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                headerRight: () => (
                    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 10 }}>
                        <MaterialIcons name="logout" size={24} color="#fff" />
                    </TouchableOpacity>
                ),
            }}
        >
            <Stack.Screen 
                name="AdminDashboard" 
                component={AdminDashboard} 
                options={{ title: 'Painel Mestre' }}
            />
            <Stack.Screen 
                name="AdminProperties" 
                component={AdminPropertiesScreen} 
                options={{ title: 'Gestão de Imóveis' }}
            />
            <Stack.Screen 
                name="AdminUsers" 
                component={AdminUsersScreen} 
                options={{ title: 'Gestão de Clientes' }}
            />
            <Stack.Screen 
                name="AdminAppointments" 
                component={AdminAppointmentsScreen} 
                options={{ title: 'Gestão de Agendamentos' }}
            />
            {/* Permite que o Admin edite propriedades usando a tela do Locador */}
            <Stack.Screen 
                name="PropertyForm" 
                component={PropertyFormScreen} 
                options={{ title: 'Editar Imóvel (Admin)' }}
            />
        </Stack.Navigator>
    );
};

export default MasterNavigator;