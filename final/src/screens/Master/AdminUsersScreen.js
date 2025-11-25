import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useIsFocused } from '@react-navigation/native';

const AdminUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchUsers();
    }
  }, [isFocused]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Busca TODOS os documentos na coleção 'users' (onde salvamos a role)
      const querySnapshot = await getDocs(collection(db, 'users'));
      
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setUsers(usersList);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os usuários.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialIcons 
            name={item.role === 'landlord' ? 'business' : item.role === 'tenant' ? 'person' : 'admin-panel-settings'} 
            size={24} 
            color={item.role === 'landlord' ? '#003366' : item.role === 'tenant' ? '#FF5A5F' : '#00A86B'}
        />
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      
      <Text style={styles.detailText}><Text style={styles.detailLabel}>Nível:</Text> {item.role.toUpperCase()}</Text>
      <Text style={styles.detailText}><Text style={styles.detailLabel}>ID:</Text> {item.id}</Text>
      <Text style={styles.detailText}><Text style={styles.detailLabel}>Desde:</Text> {item.createdAt ? item.createdAt.toDate().toLocaleDateString('pt-BR') : 'N/A'}</Text>
    </View>
  );

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A86B" />
        <Text>Carregando todos os usuários...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#00A86B']} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="group-off" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum usuário registrado no sistema.</Text>
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
    borderLeftColor: '#00A86B', // Verde Admin
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, },
  userEmail: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 10, },
  detailText: { fontSize: 14, color: '#555', marginBottom: 3, },
  detailLabel: { fontWeight: 'bold', color: '#003366' },
  emptyContainer: { alignItems: 'center', marginTop: 50, padding: 20, backgroundColor: '#fff', borderRadius: 10, },
  emptyText: { fontSize: 16, color: '#666', marginTop: 15, textAlign: 'center', },
});

export default AdminUsersScreen;