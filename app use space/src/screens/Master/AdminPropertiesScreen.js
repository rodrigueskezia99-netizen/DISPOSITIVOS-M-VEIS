import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useIsFocused } from '@react-navigation/native';

const AdminPropertiesScreen = ({ navigation }) => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchProperties();
    }
  }, [isFocused]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      // Busca TODAS as propriedades
      const querySnapshot = await getDocs(collection(db, 'properties'));
      
      const propertiesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setProperties(propertiesList);
    } catch (error) {
      console.error('Erro ao buscar propriedades:', error);
      Alert.alert('Erro', 'Não foi possível carregar as propriedades.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDeleteProperty = (propertyId, title) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a propriedade "${title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'properties', propertyId));
              setProperties(prev => prev.filter(p => p.id !== propertyId));
              Alert.alert('Sucesso', 'Propriedade excluída.');
            } catch (error) {
              console.error('Erro ao excluir:', error);
              Alert.alert('Erro', 'Não foi possível excluir a propriedade.');
            }
          },
        },
      ]
    );
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProperties();
  };

  const renderPropertyItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.priceText}>R$ {item.value ? item.value.toFixed(2).replace('.', ',') : '0,00'}</Text>
      </View>
      
      {item.imageURL && (
        <Image source={{ uri: item.imageURL }} style={styles.propertyImage} />
      )}
      
      <Text style={styles.infoText}><Text style={styles.label}>ID Locador:</Text> {item.landlordId.substring(0, 8)}...</Text>
      <Text style={styles.infoText}><Text style={styles.label}>Localização:</Text> {item.location}</Text>

      <View style={styles.actionsContainer}>
        {/* Navega para o formulário de Locador em modo de edição */}
        <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('PropertyForm', { propertyId: item.id })}
        >
            <MaterialIcons name="edit" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProperty(item.id, item.title)}
        >
            <MaterialIcons name="delete" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text>Carregando todas as propriedades...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        renderItem={renderPropertyItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#FF5A5F']} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="business-off" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma propriedade registrada no sistema.</Text>
          </View>
        )}
      />
    </View>
  );
};

// ... (Estilos - Ajustar cores e manter a estrutura) ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4', },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  listContent: { padding: 10, },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, },
  title: { fontSize: 18, fontWeight: 'bold', color: '#003366', flexShrink: 1, marginRight: 10, },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#FF5A5F', },
  propertyImage: { width: '100%', height: 150, borderRadius: 8, marginBottom: 10, resizeMode: 'cover', },
  infoText: { fontSize: 14, color: '#555', marginBottom: 5, },
  label: { fontWeight: 'bold', color: '#333' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 10, borderRadius: 8, marginHorizontal: 5,
  },
  actionButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 5, fontSize: 14, },
  editButton: { backgroundColor: '#FF5A5F' },
  deleteButton: { backgroundColor: '#dc3545' },
  emptyContainer: { alignItems: 'center', marginTop: 50, padding: 20, backgroundColor: '#fff', borderRadius: 10, },
  emptyText: { fontSize: 16, color: '#666', marginTop: 15, textAlign: 'center', },
});

export default AdminPropertiesScreen;