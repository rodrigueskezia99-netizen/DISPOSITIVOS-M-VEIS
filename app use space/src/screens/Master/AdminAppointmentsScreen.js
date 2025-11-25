import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useIsFocused } from '@react-navigation/native';

// Helper para cores e textos de status (reutilizado do AppointmentsScreen)
const getStatusDisplay = (status) => {
    switch(status) {
        case 'pending': return { text: 'PENDENTE', color: '#ffc107', icon: 'schedule' };
        case 'confirmed': return { text: 'CONFIRMADO', color: '#28a745', icon: 'check-circle' };
        case 'rejected': return { text: 'REJEITADO', color: '#dc3545', icon: 'cancel' };
        default: return { text: 'DESCONHECIDO', color: '#6c757d', icon: 'help-outline' };
    }
};

const AdminAppointmentsScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchAppointments();
    }
  }, [isFocused]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      // Busca TODAS as solicitações de agendamento
      const querySnapshot = await getDocs(collection(db, 'appointments'));
      
      const appointmentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        formattedDate: new Date(doc.data().date).toLocaleDateString('pt-BR', { dateStyle: 'long' }),
        createdAtDate: doc.data().createdAt ? doc.data().createdAt.toDate().toLocaleDateString('pt-BR') : 'N/A',
      }));
      
      // Ordena: Pendentes primeiro
      appointmentsList.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          return 0;
      });
      
      setAppointments(appointmentsList);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os agendamentos.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const handleUpdateStatus = (appointmentId, currentStatus, title) => {
      // Opções disponíveis para o Mestre
      const options = [
          { text: 'Aprovar', action: () => updateAppointment(appointmentId, 'confirmed'), style: 'default' },
          { text: 'Rejeitar', action: () => updateAppointment(appointmentId, 'rejected'), style: 'destructive' },
          { text: 'Pendente', action: () => updateAppointment(appointmentId, 'pending'), style: 'default' },
          { text: 'Cancelar', style: 'cancel' }
      ];

      Alert.alert(
          `Mudar Status de "${title}"`,
          `Status atual: ${currentStatus.toUpperCase()}. Selecione a nova ação:`,
          options.map(opt => ({ 
              text: opt.text, 
              style: opt.style, 
              onPress: opt.action 
          }))
      );
  };
  
  const updateAppointment = async (id, newStatus) => {
      try {
          await updateDoc(doc(db, 'appointments', id), { status: newStatus });
          Alert.alert('Sucesso', `Status atualizado para ${newStatus.toUpperCase()}`);
          fetchAppointments(); // Recarrega a lista
      } catch (error) {
          Alert.alert('Erro', 'Não foi possível atualizar o status.');
      }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAppointments();
  };

  const renderAppointmentItem = ({ item }) => {
    const statusDisplay = getStatusDisplay(item.status);

    return (
      <View style={styles.card}>
          <View style={styles.cardHeader}>
              <Text style={styles.propertyTitle} numberOfLines={1}>{item.propertyTitle}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusDisplay.color }]}>
                  <MaterialIcons name={statusDisplay.icon} size={16} color="#fff" />
                  <Text style={styles.statusText}>{statusDisplay.text}</Text>
              </View>
          </View>
          
          <Text style={styles.detailText}><Text style={styles.detailLabel}>Data:</Text> {item.formattedDate}</Text>
          <Text style={styles.detailText}><Text style={styles.detailLabel}>Valor:</Text> R$ {item.totalValue.toFixed(2).replace('.', ',')}</Text>
          <Text style={styles.detailText}><Text style={styles.detailLabel}>Inquilino:</Text> {item.tenantEmail}</Text>

          <TouchableOpacity 
              style={styles.updateStatusButton}
              onPress={() => handleUpdateStatus(item.id, item.status, item.propertyTitle)}
          >
              <MaterialIcons name="settings" size={18} color="#fff" />
              <Text style={styles.updateStatusButtonText}>Mudar Status</Text>
          </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text>Carregando todos os agendamentos...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        renderItem={renderAppointmentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#003366']} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum agendamento registrado no sistema.</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4', padding: 10, },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  listContent: { paddingBottom: 20, },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#003366', // Azul Admin Agendamento
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, },
  propertyTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flexShrink: 1, marginRight: 10, },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 15, },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12, marginLeft: 5, },
  detailText: { fontSize: 14, color: '#555', marginBottom: 3, },
  detailLabel: { fontWeight: 'bold', color: '#333' },
  updateStatusButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      backgroundColor: '#003366',
      padding: 10,
      borderRadius: 8,
  },
  updateStatusButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      marginLeft: 5,
  },
  emptyContainer: { alignItems: 'center', marginTop: 50, padding: 20, backgroundColor: '#fff', borderRadius: 10, },
  emptyText: { fontSize: 16, color: '#666', marginTop: 15, textAlign: 'center', },
});

export default AdminAppointmentsScreen;