import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../auth/AuthContext';
import { Icon, IconName } from '../components/Icon';
import { colors, fonts } from '../theme';
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

const headerOptions = {
  headerStyle: { backgroundColor: colors.primaryDark },
  headerTintColor: '#fff',
  headerShadowVisible: false,
  headerTitleStyle: { fontFamily: fonts.bold, fontSize: 18 },
};

const tabIcons: Record<keyof TabParamList, IconName> = {
  Tickets: 'ticket',
  Users: 'users',
  Profile: 'profile',
};

function Tabs() {
  const { session } = useAuth();
  const canSeeUsers = session?.role === 'ADMIN' || session?.role === 'TECHNICIAN';
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerOptions,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtle,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11, marginBottom: 2 },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 26,
          borderTopWidth: 0,
          backgroundColor: '#fff',
          elevation: 14,
          shadowColor: '#1E1B4B',
          shadowOpacity: 0.15,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
        },
        tabBarIcon: ({ color, focused }) => (
          <Icon name={tabIcons[route.name]} size={23} color={color} strokeWidth={focused ? 2.4 : 2} />
        ),
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
      <Stack.Navigator screenOptions={{ ...headerOptions, animation: 'slide_from_right' }}>
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
