import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase'; 
import { useIsFocused } from '@react-navigation/native'; // Para recarregar dados ao voltar

const MyPropertiesScreen = ({ navigation }) => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused(); // Hook para saber se a tela está em foco

  // Recarrega os dados sempre que a tela estiver em foco (útil após cadastro/edição)
  useEffect(() => {
    if (isFocused) {
      fetchLandlordProperties();
    }
  }, [isFocused]); 

  const fetchLandlordProperties = async () => {
    setIsLoading(true);
    try {
      const landlordId = auth.currentUser.uid;
      // Cria uma query para buscar APENAS as propriedades do Locador logado
      const q = query(collection(db, 'properties'), where('landlordId', '==', landlordId));
      const querySnapshot = await getDocs(q);
      
      const propertiesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setProperties(propertiesList);
    } catch (error) {
      console.error('Erro ao buscar propriedades:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas propriedades.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteProperty = (propertyId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta propriedade? Esta ação é irreversível.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'properties', propertyId));
              // Atualiza a lista localmente
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
  
  const renderPropertyItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      // Navega para a tela de formulário em modo de edição
      onPress={() => navigation.navigate('PropertyForm', { propertyId: item.id })} 
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.priceText}>R$ {item.value ? item.value.toFixed(2).replace('.', ',') : '0,00'}</Text>
      </View>
      
      {item.imageURL && (
        <Image source={{ uri: item.imageURL }} style={styles.propertyImage} />
      )}
      
      <Text style={styles.detailsText} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.locationText}><MaterialIcons name="location-on" size={14} color="#555" /> {item.location}</Text>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#003366' }]}
            onPress={() => navigation.navigate('PropertyForm', { propertyId: item.id })}
        >
            <MaterialIcons name="edit" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#dc3545' }]}
            onPress={() => handleDeleteProperty(item.id)}
        >
            <MaterialIcons name="delete" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text>Buscando propriedades...</Text>
      </View>
    );
  }
  
  // Renderiza a lista ou uma mensagem se vazia
  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        renderItem={renderPropertyItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="home-work" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Você ainda não tem propriedades cadastradas.</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('PropertyForm')}
            >
              <Text style={styles.addButtonText}>Cadastrar Imóvel</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      
      {/* Botão flutuante para adicionar nova propriedade */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('PropertyForm')}
      >
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    flexShrink: 1,
    marginRight: 10,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5A5F',
  },
  propertyImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  detailsText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 13,
    color: '#777',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
  addButton: {
    marginTop: 20,
    backgroundColor: '#003366',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#FF5A5F',
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});

export default MyPropertiesScreen;