import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase'; 
import { useAuth } from '../../contexts/AuthContext'; // Para obter a role do usuário
import { useIsFocused } from '@react-navigation/native';

const AppointmentsScreen = ({ navigation }) => {
  const { userRole, user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();
  
  // Define se a tela é para o Locador (que aprova) ou Inquilino (que visualiza)
  const isLandlordView = userRole === 'landlord'; 
  const collectionTitle = isLandlordView ? 'Solicitações Recebidas' : 'Meus Agendamentos';

  useEffect(() => {
    if (isFocused && user?.uid) {
      fetchAppointments();
    }
  }, [isFocused, userRole, user]);

  const fetchAppointments = async () => {
    if (!user.uid) return;

    setIsLoading(true);
    try {
      let q;
      
      // Filtra por Locador (para ver o que precisa aprovar) ou por Inquilino (para ver o que solicitou)
      if (isLandlordView) {
        q = query(collection(db, 'appointments'), where('landlordId', '==', user.uid));
      } else {
        q = query(collection(db, 'appointments'), where('tenantId', '==', user.uid));
      }

      const querySnapshot = await getDocs(q);
      
      const appointmentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Formata a data para melhor visualização
        formattedDate: new Date(doc.data().date).toLocaleDateString('pt-BR', { dateStyle: 'long' }),
      }));
      
      // Ordena: Pendentes primeiro, depois Confirmados, depois Rejeitados
      appointmentsList.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return 0;
      });
      
      setAppointments(appointmentsList);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os agendamentos.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para Locador: Aprovar ou Rejeitar
  const handleAction = async (appointmentId, newStatus) => {
      setIsLoading(true);
      try {
          const docRef = doc(db, 'appointments', appointmentId);
          await updateDoc(docRef, { status: newStatus });
          
          Alert.alert('Sucesso', `Agendamento ${newStatus === 'confirmed' ? 'Aprovado' : 'Rejeitado'} com sucesso.`);
          
          // Recarrega a lista para refletir a mudança
          fetchAppointments(); 
          
      } catch (error) {
          console.error('Erro ao atualizar agendamento:', error);
          Alert.alert('Erro', 'Não foi possível completar a ação.');
          setIsLoading(false);
      }
  };
  
  // Helper para cores e textos de status
  const getStatusDisplay = (status) => {
      switch(status) {
          case 'pending': return { text: 'PENDENTE', color: '#ffc107', icon: 'schedule' };
          case 'confirmed': return { text: 'CONFIRMADO', color: '#28a745', icon: 'check-circle' };
          case 'rejected': return { text: 'REJEITADO', color: '#dc3545', icon: 'cancel' };
          default: return { text: 'DESCONHECIDO', color: '#6c757d', icon: 'help-outline' };
      }
  };

  const renderAppointmentItem = ({ item }) => {
    const statusDisplay = getStatusDisplay(item.status);

    return (
      <View style={styles.card}>
          <View style={styles.cardHeader}>
              <Text style={styles.propertyTitle}>{item.propertyTitle}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusDisplay.color }]}>
                  <MaterialIcons name={statusDisplay.icon} size={16} color="#fff" />
                  <Text style={styles.statusText}>{statusDisplay.text}</Text>
              </View>
          </View>
          
          <Text style={styles.detailText}><Text style={styles.detailLabel}>Data:</Text> {item.formattedDate}</Text>
          <Text style={styles.detailText}><Text style={styles.detailLabel}>Valor:</Text> R$ {item.totalValue.toFixed(2).replace('.', ',')}</Text>
          
          {/* Mostra o email do outro usuário (apenas para a visão do Locador/Inquilino) */}
          {isLandlordView ? (
              <Text style={styles.contactText}>Inquilino: {item.tenantEmail}</Text>
          ) : (
              <Text style={styles.contactText}>Sua solicitação enviada em: {item.createdAt.toDate().toLocaleDateString('pt-BR')}</Text>
          )}

          {/* Ações do Locador */}
          {isLandlordView && item.status === 'pending' && (
              <View style={styles.actionsContainer}>
                  <TouchableOpacity 
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleAction(item.id, 'confirmed')}
                      disabled={isLoading}
                  >
                      <MaterialIcons name="done" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Aprovar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleAction(item.id, 'rejected')}
                      disabled={isLoading}
                  >
                      <MaterialIcons name="close" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Rejeitar</Text>
                  </TouchableOpacity>
              </View>
          )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text>Carregando {collectionTitle}...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
        <Text style={styles.screenTitle}>{collectionTitle}</Text>
        
        <FlatList
            data={appointments}
            renderItem={renderAppointmentItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="calendar-month" size={50} color="#ccc" />
                    <Text style={styles.emptyText}>
                        {isLandlordView ? 'Você não tem solicitações de reserva pendentes.' : 'Você não tem agendamentos registrados.'}
                    </Text>
                </View>
            )}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#003366',
      textAlign: 'center',
      marginBottom: 15,
      paddingTop: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  },
  detailText: {
      fontSize: 15,
      color: '#555',
      marginBottom: 3,
  },
  detailLabel: {
      fontWeight: 'bold',
      color: '#003366',
  },
  contactText: {
      fontSize: 13,
      color: '#777',
      marginTop: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14,
  },
  approveButton: {
      backgroundColor: '#28a745', // Verde
  },
  rejectButton: {
      backgroundColor: '#dc3545', // Vermelho
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default AppointmentsScreen;