import { MaterialIcons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen = () => {
  const { user, userRole } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Sair do Aplicativo",
      "Tem certeza que deseja fazer logout?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          onPress: () => {
            auth.signOut();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons 
            name="account-circle" 
            size={80} 
            color="#003366" 
            style={styles.profileIcon}
        />
        <Text style={styles.nameText}>Olá, {user?.email || 'Usuário'}</Text>
        <View style={[styles.roleBadge, { backgroundColor: userRole === 'landlord' ? '#00A86B' : '#FF5A5F' }]}>
            <Text style={styles.roleText}>{userRole?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
            <MaterialIcons name="email" size={24} color="#666" />
            <Text style={styles.infoText}>{user?.email}</Text>
        </View>
        <View style={styles.infoItem}>
            <MaterialIcons name="vpn-key" size={24} color="#666" />
            <Text style={styles.infoText}>UID: {user?.uid || 'N/A'}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="#fff" />
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>
      
      <Text style={styles.footerText}>Sistema ComercialStay v1.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  profileIcon: {
    marginBottom: 10,
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  roleBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#555',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#dc3545', // Vermelho
    padding: 15,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footerText: {
      marginTop: 'auto', // Empurra para o rodapé
      fontSize: 12,
      color: '#aaa',
  }
});

export default ProfileScreen;