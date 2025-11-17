import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import MainTabNavigator from './MainTabNavigator';
import CaseDetailScreen from '../screens/CaseDetailScreen';
import Phase2UploadScreen from '../screens/Phase2UploadScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
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
        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Main App (Bottom Tabs: MyHome, CreateCase, Inbox) */}
        <Stack.Screen name="Main" component={MainTabNavigator} />

        {/* Modal/Detail Screens */}
        <Stack.Screen
          name="CaseDetail"
          component={CaseDetailScreen}
          options={{
            presentation: 'card',
          }}
        />

        <Stack.Screen
          name="Phase2Upload"
          component={Phase2UploadScreen}
          options={{
            presentation: 'card',
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
  Login: undefined;
  Main: {
    screen?: 'MyHome' | 'CreateCase' | 'Inbox';
  };
  CaseDetail: {
    caseId: string;
  };
  Phase2Upload: {
    caseId: string;
  };
};