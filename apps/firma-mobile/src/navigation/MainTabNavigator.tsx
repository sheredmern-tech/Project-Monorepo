import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MyHomeScreen from '../screens/MyHomeScreen';
import CreateCaseScreen from '../screens/CreateCaseScreen';
import InboxScreen from '../screens/InboxScreen';
import { useStore } from '../store';
import { hasActiveCase as checkHasActiveCase } from '../utils/case-helpers';
import { Colors, Typography, Spacing, IconSize, Shadows } from '../theme/design-system';

const Tab = createBottomTabNavigator();

// Custom Tab Bar
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { cases, notifications } = useStore();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasActive = checkHasActiveCase(cases);

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

        // Icons & Labels with Ionicons
        let iconName = 'home-outline';
        let label = '';

        if (route.name === 'MyHome') {
          iconName = isFocused ? 'home' : 'home-outline';
          label = 'Home';
        } else if (route.name === 'CreateCase') {
          iconName = isFocused ? 'add-circle' : 'add-circle-outline';
          label = 'Buat';
        } else if (route.name === 'Inbox') {
          iconName = isFocused ? 'notifications' : 'notifications-outline';
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
            activeOpacity={0.7}
          >
            <View style={styles.tabIconContainer}>
              <Ionicons
                name={iconName as any}
                size={IconSize.base}
                color={
                  isDisabled
                    ? Colors.gray[300]
                    : isFocused
                    ? Colors.black
                    : Colors.gray[400]
                }
              />
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
              <Ionicons
                name="lock-closed"
                size={IconSize.xs}
                color={Colors.gray[300]}
                style={styles.lockIcon}
              />
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
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    paddingBottom: 20,
    paddingTop: Spacing.sm,
    ...Shadows.base,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    position: 'relative',
  },
  tabIconContainer: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.black,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: Typography.size.xs - 2,
    fontWeight: Typography.weight.bold,
  },
  tabLabel: {
    fontSize: Typography.size.xs,
    color: Colors.gray[500],
    fontWeight: Typography.weight.medium,
  },
  tabLabelFocused: {
    color: Colors.black,
    fontWeight: Typography.weight.semibold,
  },
  tabLabelDisabled: {
    color: Colors.gray[300],
  },
  lockIcon: {
    position: 'absolute',
    top: 0,
    right: '25%',
  },
});