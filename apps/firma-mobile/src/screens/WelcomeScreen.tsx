import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows, IconSize } from '../theme/design-system';

export default function WelcomeScreen({ navigation }: any) {
  const handleCallFirma = () => {
    Linking.openURL('tel:+62211234567'); // Update with actual number
  };

  const handleEmailFirma = () => {
    Linking.openURL('mailto:info@firma.com'); // Update with actual email
  };

  const services = [
    {
      id: 'land-cert',
      icon: 'home-outline',
      title: 'Land Certification',
      description: 'Complete land certificate processing',
      duration: '30-45 days',
    },
    {
      id: 'business-setup',
      icon: 'business-outline',
      title: 'Business Setup',
      description: 'PT/CV company registration',
      duration: '14-21 days',
    },
    {
      id: 'legal-consult',
      icon: 'chatbubble-ellipses-outline',
      title: 'Legal Consultation',
      description: 'Expert legal advice',
      duration: '1-3 days',
    },
    {
      id: 'permits',
      icon: 'document-text-outline',
      title: 'Business Permits',
      description: 'NIB and other permits',
      duration: '7-14 days',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: 'clipboard-outline',
      title: 'Submit Request',
      description: 'Choose service & provide details',
    },
    {
      step: 2,
      icon: 'cloud-upload-outline',
      title: 'Upload Documents',
      description: 'Submit required documents',
    },
    {
      step: 3,
      icon: 'time-outline',
      title: 'Track Progress',
      description: 'Monitor your case status',
    },
    {
      step: 4,
      icon: 'checkmark-circle-outline',
      title: 'Get Results',
      description: 'Receive your documents',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="briefcase" size={IconSize.lg} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.logoTitle}>Firma</Text>
              <Text style={styles.logoSubtitle}>Legal Services</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="person-circle-outline" size={IconSize.base} color={Colors.black} />
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Professional Legal Services</Text>
          <Text style={styles.heroSubtitle}>
            Fast, reliable, and affordable legal solutions for your needs
          </Text>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid-outline" size={IconSize.base} color={Colors.black} />
            <Text style={styles.sectionTitle}>Our Services</Text>
          </View>

          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceIcon}>
                  <Ionicons name={service.icon as any} size={IconSize.md} color={Colors.black} />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
                <View style={styles.serviceDuration}>
                  <Ionicons name="time-outline" size={IconSize.xs} color={Colors.gray[500]} />
                  <Text style={styles.serviceDurationText}>{service.duration}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle-outline" size={IconSize.base} color={Colors.black} />
            <Text style={styles.sectionTitle}>How It Works</Text>
          </View>

          {howItWorks.map((step, index) => (
            <View key={step.step} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.step}</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Ionicons name={step.icon as any} size={IconSize.base} color={Colors.black} />
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
              {index < howItWorks.length - 1 && <View style={styles.stepConnector} />}
            </View>
          ))}
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <Ionicons name="rocket-outline" size={IconSize['2xl']} color={Colors.black} />
            <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
            <Text style={styles.ctaSubtitle}>
              Login to submit your request and track your cases
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.ctaButtonText}>Login to Continue</Text>
              <Ionicons name="arrow-forward" size={IconSize.sm} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call-outline" size={IconSize.base} color={Colors.black} />
            <Text style={styles.sectionTitle}>Contact Us</Text>
          </View>

          <View style={styles.contactCard}>
            <TouchableOpacity style={styles.contactButton} onPress={handleCallFirma}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="call" size={IconSize.base} color={Colors.black} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>+62 21 1234 5678</Text>
              </View>
              <Ionicons name="chevron-forward" size={IconSize.sm} color={Colors.gray[400]} />
            </TouchableOpacity>

            <View style={styles.contactDivider} />

            <TouchableOpacity style={styles.contactButton} onPress={handleEmailFirma}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="mail" size={IconSize.base} color={Colors.black} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>info@firma.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={IconSize.sm} color={Colors.gray[400]} />
            </TouchableOpacity>

            <View style={styles.contactDivider} />

            <View style={styles.contactButton}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="location" size={IconSize.base} color={Colors.black} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Office</Text>
                <Text style={styles.contactValue}>Jakarta, Indonesia</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Firma Legal Services</Text>
          <Text style={styles.footerSubtext}>Professional & Trusted</Text>
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
    ...Shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['5xl'],
    paddingBottom: Spacing.base,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: Radius.base,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    letterSpacing: -0.5,
  },
  logoSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.gray[500],
    fontWeight: Typography.weight.medium,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  loginButtonText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.black,
  },
  content: {
    flex: 1,
  },
  hero: {
    padding: Spacing['2xl'],
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  heroTitle: {
    fontSize: Typography.size['3xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: Typography.size.base,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: Typography.size.base * 1.5,
  },
  section: {
    padding: Spacing.lg,
    marginTop: Spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.black,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  serviceCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    padding: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Shadows.sm,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.base,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  serviceTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  serviceDescription: {
    fontSize: Typography.size.sm,
    color: Colors.gray[600],
    marginBottom: Spacing.sm,
    lineHeight: Typography.size.sm * 1.4,
  },
  serviceDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  serviceDurationText: {
    fontSize: Typography.size.xs,
    color: Colors.gray[500],
    fontWeight: Typography.weight.medium,
  },
  stepCard: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  stepNumber: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepNumberText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.white,
  },
  stepContent: {
    marginLeft: 48,
    backgroundColor: Colors.white,
    padding: Spacing.base,
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  stepTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.black,
  },
  stepDescription: {
    fontSize: Typography.size.sm,
    color: Colors.gray[600],
    lineHeight: Typography.size.sm * 1.4,
  },
  stepConnector: {
    position: 'absolute',
    left: 15,
    top: 32,
    bottom: -Spacing.lg,
    width: 2,
    backgroundColor: Colors.gray[300],
    zIndex: 1,
  },
  ctaSection: {
    padding: Spacing.lg,
  },
  ctaCard: {
    backgroundColor: Colors.white,
    padding: Spacing['2xl'],
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
    ...Shadows.base,
  },
  ctaTitle: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: Typography.size.base,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: Typography.size.base * 1.5,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.black,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.base,
    ...Shadows.sm,
  },
  ctaButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.white,
  },
  contactCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.base,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: Typography.size.xs,
    color: Colors.gray[500],
    fontWeight: Typography.weight.medium,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.black,
  },
  contactDivider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginHorizontal: Spacing.base,
  },
  footer: {
    padding: Spacing['2xl'],
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.size.sm,
    color: Colors.gray[600],
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.xs,
  },
  footerSubtext: {
    fontSize: Typography.size.xs,
    color: Colors.gray[400],
  },
});
