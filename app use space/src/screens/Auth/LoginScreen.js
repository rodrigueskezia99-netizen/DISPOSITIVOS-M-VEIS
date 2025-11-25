import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../config/firebase.js';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const placeholderColor = '#888'; 
  const IsWeb = Platform.OS === 'web'; // Define a plataforma

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Erro no login:", error);
      let message = 'Ocorreu um erro desconhecido.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Email ou senha inválidos.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'O formato do email é inválido.';
      }
      
      Alert.alert('Falha no Login', message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função que renderiza todo o conteúdo interno
  const renderContent = () => (
    <> 
        <Image
            source={require('../../assets/images/logo_usespace.png')}
            style={styles.heroLogo}
        />
        
        <Text style={styles.mainTitle}>Bem-vindo(a) ao UseSpace</Text>
        <Text style={styles.subtitle}>Acesse sua conta</Text>

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
            placeholder="Senha"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
        />

        <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={!!isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.buttonText}>ENTRAR</Text>
            )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
        {IsWeb ? (
            // ESTRUTURA WEB 
            <View style={[styles.scrollContainer, { overflowY: 'scroll' }]}> 
                {renderContent()}
            </View>
        ) : (
            // ESTRUTURA MOBILE 
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
  button: {
    backgroundColor: '#FF5A5F', 
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

export default LoginScreen;