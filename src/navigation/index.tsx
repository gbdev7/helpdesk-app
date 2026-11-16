import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../auth/AuthContext';
import { colors } from '../theme';
import { RootStackParamList, TabParamList } from './types';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TicketsScreen from '../screens/TicketsScreen';
import TicketDetailScreen from '../screens/TicketDetailScreen';
import NewTicketScreen from '../screens/NewTicketScreen';
import UsersScreen from '../screens/UsersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const headerStyle = { headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' as const } };

function Tabs() {
  const { session } = useAuth();
  const canSeeUsers = session?.role === 'ADMIN' || session?.role === 'TECHNICIAN';
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            Tickets: focused ? 'ticket' : 'ticket-outline',
            Users: focused ? 'people' : 'people-outline',
            Profile: focused ? 'person-circle' : 'person-circle-outline',
          } as const;
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Tickets" component={TicketsScreen} options={{ title: 'Chamados', tabBarLabel: 'Chamados' }} />
      {canSeeUsers && <Tab.Screen name="Users" component={UsersScreen} options={{ title: 'Usuários', tabBarLabel: 'Usuários' }} />}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Meu perfil', tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.primary } }}>
      <Stack.Navigator screenOptions={headerStyle}>
        {session ? (
          <>
            <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="NewTicket" component={NewTicketScreen} options={{ title: 'Novo chamado' }} />
            <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ title: 'Detalhes do chamado' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar conta' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
