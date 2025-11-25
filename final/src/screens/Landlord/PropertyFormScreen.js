import { MaterialIcons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

// Lista de tipos de imóvel para o seletor
const PROPERTY_TYPES = [
  'Apartamento',
  'Casa',
  'Escritório',
  'Salão de Festas',
  'Loja',
  'Depósito',
];

const PropertyFormScreen = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [value, setValue] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [propertyType, setPropertyType] = useState('Selecione o Tipo'); 
  const [imageURL, setImageURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const placeholderColor = '#888';
  const currentAuth = getAuth(); 
  const propertyId = route.params?.propertyId; 
  const IsWeb = Platform.OS === 'web';

  useEffect(() => {
    if (propertyId) {
      setIsEditing(true);
      fetchPropertyData(propertyId);
    }
    navigation.setOptions({ title: propertyId ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel' });
  }, [propertyId]);

  const fetchPropertyData = async (id) => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'properties', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTitle(data.title || '');
        setDescription(data.description || '');
        setLocation(data.location || '');
        setValue(data.value ? String(data.value) : '');
        setDimensions(data.dimensions || '');
        setPropertyType(data.propertyType || 'Selecione o Tipo');
        setImageURL(data.imageURL || '');
      } else {
        Alert.alert('Erro', 'Propriedade não encontrada.');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterProperty = async () => {
    if (
      title === '' || 
      description === '' || 
      location === '' || 
      value === '' || 
      dimensions === '' ||
      propertyType === 'Selecione o Tipo' ||
      imageURL === ''
    ) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos e forneça a URL da imagem.');
      return;
    }

    setIsLoading(true);

    try {
      const parsedValue = parseFloat(value.replace(',', '.'));
      
      if (isNaN(parsedValue) || parsedValue <= 0) {
          Alert.alert('Erro', 'O valor do aluguel deve ser um número positivo.');
          setIsLoading(false);
          return;
      }
      
      const propertyData = {
        title,
        description,
        location,
        value: parsedValue,
        dimensions,
        propertyType,
        imageURL: imageURL,
        landlordId: currentAuth.currentUser.uid,
        updatedAt: serverTimestamp(),
        isAvailable: true,
      };

      if (isEditing) {
        await updateDoc(doc(db, 'properties', propertyId), propertyData);
        Alert.alert('Sucesso', 'Imóvel atualizado com sucesso!');
      } else {
        propertyData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'properties'), propertyData);
        Alert.alert('Sucesso', 'Imóvel cadastrado com sucesso!');
      }

      navigation.navigate('MyProperties'); // Voltar para a lista do Locador
      
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      Alert.alert('Erro', 'Não foi possível salvar o imóvel.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectPropertyType = (type) => {
      setPropertyType(type);
      setModalVisible(false);
  }
  
  // Função que renderiza todo o conteúdo interno do formulário
  const renderFormContent = () => (
    <>
        <Text style={styles.header}>{isEditing ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}</Text>

        {/* SELETOR DE TIPO DE IMÓVEL */}
        <Text style={styles.label}>Tipo de Imóvel</Text>
        <TouchableOpacity 
            style={styles.pickerContainer} 
            onPress={() => setModalVisible(true)}
        >
            <Text style={propertyType === 'Selecione o Tipo' ? styles.pickerPlaceholder : styles.pickerSelected}>
                {propertyType}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.label}>Título do Anúncio</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Apartamento Moderno no Centro"
          placeholderTextColor={placeholderColor}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Descrição Completa</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detalhes, diferenciais e regras do imóvel."
          placeholderTextColor={placeholderColor}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Localização (Endereço, Cidade/Bairro)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Av. Paulista, São Paulo"
          placeholderTextColor={placeholderColor}
          value={location}
          onChangeText={setLocation}
        />
        
        <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
                <Text style={styles.label}>Valor do Aluguel (R$)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 1500,00"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={setValue}
                />
            </View>
            <View style={styles.halfInput}>
                <Text style={styles.label}>Metragem/Dimensões</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 50m² ou 10x20"
                  placeholderTextColor={placeholderColor}
                  value={dimensions}
                  onChangeText={setDimensions}
                />
            </View>
        </View>
        
        {/* CAMPO URL DA IMAGEM */}
        <Text style={styles.label}>URL da Foto Principal</Text>
        <TextInput
          style={styles.input}
          placeholder="Cole a URL da imagem aqui (Ex: ImgBB, Unsplash)"
          placeholderTextColor={placeholderColor}
          keyboardType="url"
          value={imageURL}
          onChangeText={setImageURL}
        />
        
        {/* Pré-visualização Simples da Imagem */}
        {imageURL ? (
          <Image 
              source={{ uri: imageURL }} 
              style={styles.previewImage}
              resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
              <MaterialIcons name="image" size={30} color="#ccc" />
              <Text style={styles.imagePlaceholderText}>Pré-visualização da URL</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleRegisterProperty}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isEditing ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR IMÓVEL'}</Text>
          )}
        </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
      {IsWeb ? (
            // ESTRUTURA WEB: Sem Touch, usa View com scroll nativo do navegador
            <View style={[styles.scrollContainer, { overflowY: 'scroll' }]}> 
                {renderFormContent()}
            </View>
        ) : (
            // ESTRUTURA MOBILE: Com Touch para fechar teclado
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    {renderFormContent()}
                </ScrollView>
            </TouchableWithoutFeedback>
        )}

      {/* MODAL PARA SELEÇÃO DE TIPO DE IMÓVEL */}
      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
      >
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Selecione o Tipo de Imóvel</Text>
                  {PROPERTY_TYPES.map((type) => (
                      <TouchableOpacity 
                          key={type} 
                          style={styles.modalItem}
                          onPress={() => selectPropertyType(type)}
                      >
                          <Text style={styles.modalItemText}>{type}</Text>
                          {propertyType === type && (
                              <MaterialIcons name="check-circle" size={20} color="#003366" />
                          )}
                      </TouchableOpacity>
                  ))}
                  <TouchableOpacity 
                      style={styles.modalCloseButton} 
                      onPress={() => setModalVisible(false)}
                  >
                      <Text style={styles.modalCloseText}>Fechar</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    fontWeight: '600',
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 5, 
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    width: '48%',
  },
  pickerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 12,
      borderRadius: 8,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#ddd',
  },
  pickerPlaceholder: {
      color: '#888',
      fontSize: 16,
  },
  pickerSelected: {
      color: '#333',
      fontSize: 16,
      fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginVertical: 15,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginVertical: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 5,
    color: '#666',
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
  modalContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%', },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#003366', },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', },
  modalItemText: { fontSize: 16, color: '#333', },
  modalCloseButton: { marginTop: 20, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, alignItems: 'center', },
  modalCloseText: { color: '#333', fontWeight: 'bold', },
  button: {
    backgroundColor: '#003366',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PropertyFormScreen;