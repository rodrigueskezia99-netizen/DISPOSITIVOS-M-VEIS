import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase'; 

/**
 * Checa a disponibilidade de uma propriedade para uma data específica.
 * @param {string} propertyId - ID da propriedade.
 * @param {string} dateString - Data no formato 'YYYY-MM-DD'.
 * @returns {Promise<boolean>} Retorna TRUE se estiver DISPONÍVEL, FALSE se estiver ocupada (status 'pending' ou 'confirmed').
 */
export const checkAvailability = async (propertyId, dateString) => {
  if (!propertyId || !dateString) {
    console.error("Dados de checagem incompletos.");
    return false; 
  }

  // 1. Converte a string de data para um Timestamp de início do dia (não estritamente necessário para checagem de string, 
  // mas é uma boa prática se usássemos range de datas).
  // Para este projeto acadêmico, vamos usar a string YYYY-MM-DD.
  
  try {
    const q = query(
      collection(db, 'appointments'),
      where('propertyId', '==', propertyId),
      where('date', '==', dateString),
      // Propriedade não pode ser reservada se o status for pending OU confirmed
      where('status', 'in', ['pending', 'confirmed']) 
    );

    const querySnapshot = await getDocs(q);

    // Se houver qualquer documento, significa que já existe uma reserva (pendente ou confirmada) para aquela data.
    const isAvailable = querySnapshot.empty;
    
    return isAvailable; 

  } catch (error) {
    console.error('Erro ao checar disponibilidade:', error);
    // Em caso de erro, por segurança, consideramos indisponível
    return false; 
  }
};