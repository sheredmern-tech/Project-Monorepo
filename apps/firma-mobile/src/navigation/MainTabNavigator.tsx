import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MyHomeScreen from '../screens/MyHomeScreen';
import CreateCaseScreen from '../screens/CreateCaseScreen';
import InboxScreen from '../screens/InboxScreen';
import { MY_NOTIFICATIONS, hasActiveCase } from '../mocks/my-cases.mock';

const Tab = createBottomTabNavigator();

// Custom Tab Bar
function CustomTabBar({ state, descriptors, navigation }: any) {
  const unreadCount = MY_NOTIFICATIONS.filter((n) => !n.read).length;
  const hasActive = hasActiveCase();

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Icons & Labels
        let icon = '●';
        let label = '';

        if (route.name === 'MyHome') {
          icon = '🏠';
          label = 'Home';
        } else if (route.name === 'CreateCase') {
          icon = '➕';
          label = 'Buat';
        } else if (route.name === 'Inbox') {
          icon = '📬';
          label = 'Inbox';
        }

        // Badge for inbox
        const showBadge = route.name === 'Inbox' && unreadCount > 0;

        // Disabled state for CreateCase if has active case
        const isDisabled = route.name === 'CreateCase' && hasActive;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            disabled={isDisabled}
          >
            <View style={styles.tabIconContainer}>
              <Text
                style={[
                  styles.tabIcon,
                  isFocused && styles.tabIconFocused,
                  isDisabled && styles.tabIconDisabled,
                ]}
              >
                {icon}
              </Text>
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                isFocused && styles.tabLabelFocused,
                isDisabled && styles.tabLabelDisabled,
              ]}
            >
              {label}
            </Text>
            {isDisabled && (
              <View style={styles.disabledIndicator}>
                <Text style={styles.disabledText}>🔒</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="MyHome"
        component={MyHomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="CreateCase"
        component={CreateCaseScreen}
        options={{
          title: 'Buat Pengajuan',
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          title: 'Inbox',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  tabIconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  tabIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabIconDisabled: {
    opacity: 0.3,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  tabLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  tabLabelFocused: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  tabLabelDisabled: {
    color: '#d1d5db',
  },
  disabledIndicator: {
    position: 'absolute',
    top: 0,
    right: '25%',
  },
  disabledText: {
    fontSize: 12,
  },
});