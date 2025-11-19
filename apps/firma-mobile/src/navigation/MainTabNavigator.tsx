import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MyHomeScreen from '../screens/MyHomeScreen';
import CaseListScreen from '../screens/CaseListScreen';
import InboxScreen from '../screens/InboxScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useStore } from '../store';
import { Colors, Typography, Spacing, IconSize, Shadows } from '../theme/design-system';

const Tab = createBottomTabNavigator();

// Custom Tab Bar
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { notifications } = useStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

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

        // Icons & Labels with Ionicons (Bahasa Indonesia)
        let iconName = 'home-outline';
        let label = '';

        if (route.name === 'Beranda') {
          iconName = isFocused ? 'home' : 'home-outline';
          label = 'Beranda';
        } else if (route.name === 'CaseList') {
          iconName = isFocused ? 'folder-open' : 'folder-open-outline';
          label = 'Kasus Saya';
        } else if (route.name === 'Notifikasi') {
          iconName = isFocused ? 'notifications' : 'notifications-outline';
          label = 'Notifikasi';
        } else if (route.name === 'Profil') {
          iconName = isFocused ? 'person' : 'person-outline';
          label = 'Profil';
        }

        // Badge for notifications
        const showBadge = route.name === 'Notifikasi' && unreadCount > 0;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={styles.tabIconContainer}>
              <Ionicons
                name={iconName as any}
                size={IconSize.base}
                color={isFocused ? Colors.black : Colors.gray[400]}
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
              ]}
            >
              {label}
            </Text>
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
      {/* Tab 1: Beranda */}
      <Tab.Screen
        name="Beranda"
        component={MyHomeScreen}
        options={{
          title: 'Beranda',
        }}
      />

      {/* Tab 2: Kasus Saya */}
      <Tab.Screen
        name="CaseList"
        component={CaseListScreen}
        options={{
          title: 'Kasus Saya',
        }}
      />

      {/* Tab 3: Notifikasi (Tengah) */}
      <Tab.Screen
        name="Notifikasi"
        component={InboxScreen}
        options={{
          title: 'Notifikasi',
        }}
      />

      {/* Tab 4: Profil (Paling Kanan) */}
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          title: 'Profil',
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
});