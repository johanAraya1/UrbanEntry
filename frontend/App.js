import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Image, StyleSheet, StatusBar, Text } from 'react-native';
import { colors } from './theme';
import { APP_NAME, LOGO } from './src/config';
import { LanguageProvider } from './src/i18n/LanguageContext';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import AuthorizedPersons from './screens/AuthorizedPersons';
import MemberManagement from './screens/MemberManagement';
import Profile from './screens/Profile';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }}>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
          <Stack.Screen name="AuthorizedPersons" component={AuthorizedPersons} options={{ title: 'Autorizados' }} />
          <Stack.Screen name="MemberManagement" component={MemberManagement} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  brand: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700'
  }
});
