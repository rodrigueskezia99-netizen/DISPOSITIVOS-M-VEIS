import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase'; 
import { Calendar } from 'react-native-calendars'; 
import { checkAvailability } from '../../utils/bookingUtils'; // Importa a função de checagem

const PropertyDetailsScreen = ({ navigation, route }) => {
  const { propertyId, propertyTitle } = route.params;
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: propertyTitle || 'Detalhes do Imóvel' });
    fetchPropertyDetails();
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      const docRef = doc(db, 'properties', propertyId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProperty({ id: docSnap.id, ...docSnap.data() });
      } else {
        Alert.alert('Erro', 'Propriedade não encontrada.');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função que faz a checagem de disponibilidade
  const checkDate = async (dateString) => {
      setIsChecking(true);
      setSelectedDate(dateString);
      
      const available = await checkAvailability(propertyId, dateString);
      setIsAvailable(available);
      
      if (!available) {
          Alert.alert('Indisponível', 'Esta propriedade já possui uma reserva ou solicitação pendente para a data selecionada.');
      }
      setIsChecking(false);
  };
  
  const onDayPress = (day) => {
    checkDate(day.dateString);
  };
  
  // Ação final: Navegar para o formulário de reserva
  const handleBooking = () => {
      if (!selectedDate || !isAvailable) {
          Alert.alert('Erro', 'Por favor, selecione uma data DISPONÍVEL no calendário.');
          return;
      }
      
      navigation.navigate('BookingForm', { 
          propertyId: property.id, 
          propertyTitle: property.title,
          landlordId: property.landlordId,
          date: selectedDate,
          value: property.value,
      });
  };


  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!property) {
    return <Text style={styles.errorText}>Detalhes não disponíveis.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {property.imageURL && (
        <Image source={{ uri: property.imageURL }} style={styles.mainImage} />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
            <Text style={styles.title}>{property.title}</Text>
            <Text style={styles.price}>R$ {property.value ? property.value.toFixed(2).replace('.', ',') : '0,00'} / Dia</Text>
        </View>

        {/* ... (Informações Básicas - Mantidas do código anterior) ... */}
        <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={18} color="#003366" />
            <Text style={styles.infoText}>{property.location}</Text>
        </View>
        <View style={styles.infoRow}>
            <MaterialIcons name="aspect-ratio" size={18} color="#003366" />
            <Text style={styles.infoText}>{property.dimensions}</Text>
        </View>
        <View style={styles.infoRow}>
            <MaterialIcons name="category" size={18} color="#003366" />
            <Text style={styles.infoText}>Tipo: {property.propertyType.toUpperCase().replace('_', ' ')}</Text>
        </View>

        <Text style={styles.sectionTitle}>Descrição:</Text>
        <Text style={styles.description}>{property.description}</Text>
        
        {/* Seção de Calendário e Reserva */}
        <Text style={styles.sectionTitle}>1. Escolha a Data e Verifique Disponibilidade:</Text>
        <View style={styles.calendarContainer}>
            <Calendar
                onDayPress={onDayPress}
                minDate={new Date().toISOString().split('T')[0]} // Impede seleção de datas passadas
                markedDates={{
                    [selectedDate]: { 
                        selected: true, 
                        selectedColor: isAvailable ? '#00A86B' : '#dc3545', // Verde se OK, Vermelho se ocupado
                        selectedTextColor: '#fff'
                    }
                    // TODO: Futuramente, buscar e marcar todas as datas INDISPONÍVEIS aqui
                }}
                theme={{
                    selectedDayBackgroundColor: '#FF5A5F',
                    todayTextColor: '#003366',
                    arrowColor: '#003366',
                }}
            />
        </View>
        
        {isChecking ? (
            <ActivityIndicator size="small" color="#003366" style={{marginTop: 15}} />
        ) : selectedDate ? (
            <Text style={[styles.selectedDateText, { color: isAvailable ? '#00A86B' : '#dc3545' }]}>
                {isAvailable ? `Data disponível: ${selectedDate}` : `Data OCUPADA: ${selectedDate}`}
            </Text>
        ) : (
             <Text style={styles.selectedDatePrompt}>Selecione uma data no calendário acima.</Text>
        )}
        
        <Text style={styles.sectionTitle}>2. Finalizar Solicitação:</Text>

        <TouchableOpacity 
            style={[styles.bookingButton, !selectedDate || !isAvailable ? styles.disabledButton : {}]}
            onPress={handleBooking}
            disabled={!selectedDate || !isAvailable}
        >
            <Text style={styles.bookingButtonText}>SOLICITAR AGENDAMENTO</Text>
        </TouchableOpacity>

      </View>
      
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

// ... (Estilos - Manter ou adaptar os estilos do código anterior) ...

const styles = StyleSheet.create({
  // ... (manter estilos como 'container', 'loadingContainer', 'mainImage', 'content', 'header', etc.)
  // Adicionar:
  disabledButton: {
      backgroundColor: '#ccc',
  },
  bookingButton: {
    backgroundColor: '#003366',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  bookingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  selectedDateText: {
      marginTop: 15,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  selectedDatePrompt: {
      marginTop: 15,
      fontSize: 16,
      color: '#FF5A5F',
      textAlign: 'center',
  },
  // O restante dos estilos deve ser copiado do código anterior
  container: { flex: 1, backgroundColor: '#fff', },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  mainImage: { width: '100%', height: 250, resizeMode: 'cover', },
  content: { padding: 20, },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, },
  title: { fontSize: 24, fontWeight: 'bold', color: '#003366', flexShrink: 1, },
  price: { fontSize: 24, fontWeight: 'bold', color: '#FF5A5F', },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, },
  infoText: { fontSize: 16, color: '#555', marginLeft: 10, },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5, },
  description: { fontSize: 16, lineHeight: 24, color: '#666', },
  calendarContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, overflow: 'hidden', },
  errorText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'red', }
});

export default PropertyDetailsScreen;