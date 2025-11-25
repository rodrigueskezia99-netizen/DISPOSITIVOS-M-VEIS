import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase.js';

const USER_ROLES = [
  { label: 'Sou um Inquilino (Buscando imóveis)', value: 'tenant' },
  { label: 'Sou um Locador (Alugando imóveis)', value: 'landlord' },
];

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(USER_ROLES[0].value);
  const [isLoading, setIsLoading] = useState(false);
  
  const placeholderColor = '#888'; 
  const IsWeb = Platform.OS === 'web'; // Define a plataforma

  const handleRegister = async () => {
    if (fullName === '' || email === '' || password === '' || confirmPassword === '') {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const user = response.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: selectedRole,
        fullName: fullName,
        createdAt: new Date(),
      });

      Alert.alert('Sucesso!', 'Conta criada com sucesso. Você será redirecionado.');
      
    } catch (error) {
      console.error("Erro no registro:", error);
      let message = 'Ocorreu um erro desconhecido.';

      if (error.code === 'auth/email-already-in-use') {
        message = 'Este email já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'O formato do email é inválido.';
      }
      
      Alert.alert('Falha no Registro', message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderContent = () => (
    <> 
        <Image
            source={require('../../assets/images/logo_usespace.png')}
            style={styles.heroLogo}
        />
        
        <Text style={styles.mainTitle}>Crie sua Conta</Text>
        <Text style={styles.subtitle}>Defina seu perfil e comece a usar!</Text>

        <TextInput
            style={styles.input}
            placeholder="Nome Completo"
            placeholderTextColor={placeholderColor}
            keyboardType="default"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
        />

        <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={placeholderColor}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
        />
        <TextInput
            style={styles.input}
            placeholder="Senha (Mín. 6 caracteres)"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
        />
        <TextInput
            style={styles.input}
            placeholder="Confirme a Senha"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
        />

        <Text style={styles.roleLabel}>Qual seu papel principal?</Text>
        <View style={styles.roleContainer}>
            {USER_ROLES.map((role) => (
            <TouchableOpacity
                key={role.value}
                style={[
                styles.roleButton,
                selectedRole === role.value && styles.roleButtonActive,
                ]}
                onPress={() => setSelectedRole(role.value)}
            >
                <Text style={[
                styles.roleText,
                selectedRole === role.value && styles.roleTextActive,
                ]}>
                {role.label}
                </Text>
            </TouchableOpacity>
            ))}
        </View>

        <TouchableOpacity 
            style={styles.button} 
            onPress={handleRegister}
            disabled={!!isLoading}
        >
            {isLoading ? (
            <ActivityIndicator color="#fff" />
            ) : (
            <Text style={styles.buttonText}>CADASTRAR</Text>
            )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Já tem conta? Fazer Login</Text>
        </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
        {Platform.OS === 'web' ? (
            // ESTRUTURA WEB (Simples View)
            <View style={[styles.scrollContainer, { overflowY: 'scroll' }]}> 
                {renderContent()}
            </View>
        ) : (
            // ESTRUTURA MOBILE (Com Touch para fechar teclado)
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView contentContainerStyle={styles.scrollContainer} 
                            keyboardShouldPersistTaps="handled">
                    {renderContent()}
                </ScrollView>
            </TouchableWithoutFeedback>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 30,
    paddingTop: 80,
  },
  heroLogo: { 
    width: '70%', 
    height: 150, 
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 40,
  },
  mainTitle: { 
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: { 
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  roleLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#003366', 
    backgroundColor: '#E6EFFF',
  },
  roleText: {
    color: '#333',
    fontSize: 13,
    textAlign: 'center',
  },
  roleTextActive: {
    color: '#003366',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#003366', 
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    color: '#003366',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 15,
  },
});

export default RegisterScreen;