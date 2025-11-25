import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// IMPORTANTE: Manter o SafeAreaView da biblioteca de contexto
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

const SearchScreen = ({ navigation }) => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const isFocused = useIsFocused();
  
  const fetchAllProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'properties'));
      
      const propertiesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setProperties(propertiesList);
      setFilteredProperties(propertiesList); 
      
    } catch (error) {
      console.error('Erro ao buscar todas as propriedades:', error);
      Alert.alert('Erro', 'Não foi possível carregar as propriedades.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchAllProperties();
    }
  }, [isFocused, fetchAllProperties]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProperties(properties);
      return;
    }
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    
    const filtered = properties.filter(p => 
      p.title.toLowerCase().includes(lowerCaseQuery) ||
      p.location.toLowerCase().includes(lowerCaseQuery) ||
      p.propertyType.toLowerCase().includes(lowerCaseQuery) 
    );
    
    setFilteredProperties(filtered);
  }, [searchQuery, properties]);

  const renderPropertyItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id, propertyTitle: item.title })} 
    >
      <View style={styles.cardHeader}>
        <Text style={styles.priceText}>R$ {item.value ? item.value.toFixed(2).replace('.', ',') : '0,00'}</Text>
        <Text style={styles.typeText}>{item.propertyType.toUpperCase().replace('_', ' ')}</Text>
      </View>
      
      {item.imageURL && (
        <Image source={{ uri: item.imageURL }} style={styles.propertyImage} />
      )}
      
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.locationText}><MaterialIcons name="location-on" size={14} color="#555" /> {item.location}</Text>
      <Text style={styles.dimensionsText}>{item.dimensions}</Text>
      
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text>Buscando espaços disponíveis...</Text>
      </View>
    );
  }
  
  return (
    // CONTAINER PRINCIPAL AGORA É O SAFEVIEWAREA
    <SafeAreaView style={styles.container}> 
      
      {/* Barra de Busca */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por título, localização ou tipo..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredProperties}
        renderItem={renderPropertyItem}
        keyExtractor={item => item.id}
        // Adicionando um padding inferior maior na lista
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum imóvel encontrado com sua busca.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // O container agora usa flex: 1 para preencher a tela dentro do SafeAreaView
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Ajuste de margens na barra de busca
  searchInput: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginTop: 5, 
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listContent: {
    padding: 10,
    // NOVO VALOR: Aumentado para 100 para garantir que o conteúdo não seja cortado pela Tab Bar inferior.
    paddingBottom: 100, 
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 5, 
    shadowColor: '#000',
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
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5A5F',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  dimensionsText: {
    fontSize: 14,
    color: '#777',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default SearchScreen;