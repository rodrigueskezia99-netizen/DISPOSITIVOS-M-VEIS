import React from 'react';
import AppNavigator from './src/navigations/AppNavigator.js'; 
import { AuthProvider } from './src/contexts/AuthContext.js'; 

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}