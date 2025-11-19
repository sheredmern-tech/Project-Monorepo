import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { Colors, Typography, Spacing, Radius, IconSize, Shadows } from '../theme/design-system';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useStore();

  const handleLogout = () => {
    Alert.alert(
      'Keluar dari Akun?',
      'Anda yakin ingin keluar dari akun Anda?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Welcome');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'edit-profile',
      icon: 'person-outline',
      label: 'Edit Profil',
      onPress: () => Alert.alert('Edit Profil', 'Fitur edit profil akan segera hadir'),
    },
    {
      id: 'my-cases',
      icon: 'folder-open-outline',
      label: 'Kasus Saya',
      onPress: () => navigation.navigate('Main', { screen: 'CaseList' }),
    },
    {
      id: 'notifications',
      icon: 'notifications-outline',
      label: 'Pengaturan Notifikasi',
      onPress: () => Alert.alert('Notifikasi', 'Pengaturan notifikasi akan segera hadir'),
    },
    {
      id: 'help',
      icon: 'help-circle-outline',
      label: 'Bantuan & Dukungan',
      onPress: () => Alert.alert('Bantuan', 'Hubungi kami di support@firma.com'),
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      label: 'Tentang Firma',
      onPress: () => Alert.alert('Firma', 'Versi 1.0.0\n\nAplikasi manajemen dokumen legal untuk klien'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profil</Text>
          <Text style={styles.headerSubtitle}>Kelola akun Anda</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={IconSize['2xl']} color={Colors.white} />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Nama Pengguna'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
          </View>

          <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={IconSize.sm} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={IconSize.base} color={Colors.black} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={IconSize.sm} color={Colors.gray[400]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={IconSize.base} color={Colors.gray[500]} />
            <Text style={styles.infoText}>Data Anda dienkripsi dan aman</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cloud-outline" size={IconSize.base} color={Colors.gray[500]} />
            <Text style={styles.infoText}>Sinkronisasi otomatis aktif</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={IconSize.base} color={Colors.white} />
          <Text style={styles.logoutButtonText}>Keluar dari Akun</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Firma Mobile App v1.0.0</Text>
          <Text style={styles.footerText}>© 2025 Firma. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    paddingTop: Spacing['5xl'],
    paddingBottom: Spacing.base,
  },
  headerContent: {
    paddingHorizontal: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.size['3xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.gray[500],
    fontWeight: Typography.weight.medium,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Shadows.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontSize: Typography.size.sm,
    color: Colors.gray[600],
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.base,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  menuSection: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.gray[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.base,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border.light,
  },
  menuItemLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.base,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.black,
  },
  appInfo: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.base,
    padding: Spacing.base,
    backgroundColor: Colors.gray[50],
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.size.sm,
    color: Colors.gray[600],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.black,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.base,
    borderRadius: Radius.md,
    ...Shadows.md,
  },
  logoutButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.white,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.size.xs,
    color: Colors.gray[400],
    marginVertical: Spacing.xs / 2,
  },
});
