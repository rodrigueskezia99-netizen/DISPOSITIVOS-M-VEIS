import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase'; 
import { useAuth } from '../../contexts/AuthContext'; 

const BookingFormScreen = ({ navigation, route }) => {
  const { propertyId, propertyTitle, landlordId, date, value } = route.params;
  const { user } = useAuth(); // Pega o usuário logado (Inquilino)
  const [isLoading, setIsLoading] = useState(false);
  
  // Dados de contato do Inquilino podem ser pré-preenchidos ou solicitados aqui
  // Por simplicidade, vamos apenas enviar a reserva.

  const handleConfirmBooking = async () => {
    setIsLoading(true);
    
    // Confirmação final antes de enviar
    Alert.alert(
        'Confirmar Solicitação',
        `Você deseja solicitar o agendamento de "${propertyTitle}" para a data ${date} por R$ ${value.toFixed(2).replace('.', ',')}?`,
        [
            {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => setIsLoading(false),
            },
            {
                text: 'Confirmar',
                onPress: async () => {
                    try {
                        const bookingData = {
                            propertyId,
                            propertyTitle, // Para facilitar a exibição
                            landlordId,
                            tenantId: user.uid,
                            tenantEmail: user.email,
                            date,
                            totalValue: value,
                            status: 'pending', // Inicia sempre como pendente
                            createdAt: new Date(),
                        };
        
                        await addDoc(collection(db, 'appointments'), bookingData);
        
                        Alert.alert('Sucesso!', 'Sua solicitação de agendamento foi enviada ao proprietário. Acompanhe o status na tela "Meus Agendamentos".');
                        
                        // Volta para a tela de busca ou para a tela de agendamentos do inquilino
                        navigation.navigate('Appointments'); 
        
                    } catch (error) {
                        console.error('Erro ao enviar agendamento:', error);
                        Alert.alert('Erro', 'Não foi possível completar a solicitação. Tente novamente.');
                    } finally {
                        setIsLoading(false);
                    }
                }
            }
        ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Revisar e Finalizar Agendamento</Text>
      
      <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
              <MaterialIcons name="home-work" size={24} color="#003366" />
              <View style={{marginLeft: 10}}>
                  <Text style={styles.summaryLabel}>Imóvel:</Text>
                  <Text style={styles.summaryValue}>{propertyTitle}</Text>
              </View>
          </View>
          
          <View style={styles.summaryItem}>
              <MaterialIcons name="event" size={24} color="#003366" />
              <View style={{marginLeft: 10}}>
                  <Text style={styles.summaryLabel}>Data Solicitada:</Text>
                  <Text style={styles.summaryValueDate}>{date}</Text>
              </View>
          </View>
          
          <View style={styles.summaryItem}>
              <MaterialIcons name="attach-money" size={24} color="#FF5A5F" />
              <View style={{marginLeft: 10}}>
                  <Text style={styles.summaryLabel}>Valor do Período (R$/Dia):</Text>
                  <Text style={styles.summaryValuePrice}>R$ {value.toFixed(2).replace('.', ',')}</Text>
              </View>
          </View>
      </View>
      
      <Text style={styles.sectionTitle}>Próximos Passos:</Text>
      <Text style={styles.instructionText}>
          Ao confirmar, sua solicitação será enviada ao Locador, que terá acesso aos seus dados de contato (email) e poderá aprovar ou rejeitar o agendamento.
      </Text>


      <TouchableOpacity 
        style={styles.confirmButton} 
        onPress={handleConfirmBooking}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmButtonText}>CONFIRMAR E ENVIAR SOLICITAÇÃO</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
          disabled={isLoading}
      >
          <Text style={styles.cancelButtonText}>Voltar e Alterar Data</Text>
      </TouchableOpacity>
      
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryBox: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 30,
      borderLeftWidth: 5,
      borderLeftColor: '#FF5A5F',
      elevation: 2,
  },
  summaryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      paddingBottom: 10,
  },
  summaryLabel: {
      fontSize: 14,
      color: '#666',
  },
  summaryValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#003366',
  },
  summaryValueDate: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#00A86B',
  },
  summaryValuePrice: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FF5A5F',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#003366',
  },
  confirmButton: {
    backgroundColor: '#003366',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#FF5A5F',
    fontSize: 16,
  }
});

export default BookingFormScreen;