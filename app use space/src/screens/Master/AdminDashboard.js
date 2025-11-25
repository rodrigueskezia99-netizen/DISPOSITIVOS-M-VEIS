import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AdminDashboard = ({ navigation }) => {
  
    const renderCard = (title, icon, screenName, color) => (
        <TouchableOpacity 
            style={[styles.card, { borderLeftColor: color }]} 
            onPress={() => navigation.navigate(screenName)}
        >
            <MaterialIcons name={icon} size={40} color={color} />
            <Text style={styles.cardTitle}>{title}</Text>
        </TouchableOpacity>
    );

  return (
    <ScrollView style={styles.container}>
        <Text style={styles.headerTitle}>Painel de Administração Mestre</Text>
        <Text style={styles.subtitle}>Visão geral do sistema e gestão total.</Text>
      
      {renderCard(
          'Gerenciar Propriedades',
          'business',
          'AdminProperties',
          '#FF5A5F' // Airbnb Red
      )}
      
      {renderCard(
          'Gerenciar Clientes',
          'group',
          'AdminUsers',
          '#00A86B' // Green
      )}
      
      {renderCard(
          'Gerenciar Agendamentos',
          'list-alt',
          'AdminAppointments',
          '#003366' // Dark Blue
      )}
      
      <View style={{height: 50}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 8, // Destaque lateral
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
  },
});

export default AdminDashboard;