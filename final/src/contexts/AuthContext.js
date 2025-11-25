import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { auth, db } from '../config/firebase.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('loading');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
        setIsLoading(false);
        setUserRole('unauthenticated');
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserRole(userData.role || 'tenant'); 
        } else {
          setUserRole('tenant');
        }
      } else {
        setUser(null);
        setUserRole('unauthenticated');
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userRole,
    isLoading,
  };

  if (isLoading) {
    return (
      <AuthContext.Provider value={value}>
        <LoadingScreen /> 
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#003366" />
    <Text>Carregando...</Text>
  </View>
);