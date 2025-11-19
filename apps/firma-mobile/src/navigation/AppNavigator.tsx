import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import MainTabNavigator from './MainTabNavigator';
import CreateCaseScreen from '../screens/CreateCaseScreen';
import CaseDetailScreen from '../screens/CaseDetailScreen';
import Phase2UploadScreen from '../screens/Phase2UploadScreen';
import { useStore } from '../store';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const user = useStore((state) => state.user);
  const isAuthenticated = !!user;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        {/* Public Stack - Browse without login */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Auth Stack - Modal presentation (contextual login) */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />

        {/* Protected Stack - Requires authentication */}
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{
            headerShown: false,
          }}
        />

        {/* Modal/Detail Screens */}
        <Stack.Screen
          name="CreateCase"
          component={CreateCaseScreen}
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="CaseDetail"
          component={CaseDetailScreen}
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Phase2Upload"
          component={Phase2UploadScreen}
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ===================================================================
// NAVIGATION TYPE DEFINITIONS (for TypeScript)
// ===================================================================

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Main: {
    screen?: 'Beranda' | 'CaseList' | 'Notifikasi' | 'Profil';
  };
  CreateCase: undefined;
  CaseDetail: {
    caseId: string;
  };
  Phase2Upload: {
    caseId: string;
  };
};