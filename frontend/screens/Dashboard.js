import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import authService from '../src/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLogo from '../components/AppLogo';
import { useLanguage } from '../src/i18n/LanguageContext';

export default function Dashboard({ navigation }) {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      navigation.replace('Login');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const handleLogout = async () => {
    await authService.logout();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderSuperAdminOptions = () => (
    <>
      <MenuCard
        icon="people"
        title={t('dashboard.menu.userManagement')}
        description={t('dashboard.menu.userManagementDesc')}
        color="#1E3A5F"
        onPress={() => {/* TODO: navigate to users */}}
      />
      <MenuCard
        icon="home"
        title={t('dashboard.menu.houseManagement')}
        description={t('dashboard.menu.houseManagementDesc')}
        color="#2E7D32"
        onPress={() => {/* TODO: navigate to houses */}}
      />
      <MenuCard
        icon="stats-chart"
        title={t('dashboard.menu.statistics')}
        description={t('dashboard.menu.statisticsDesc')}
        color="#ED6C02"
        onPress={() => {/* TODO: navigate to stats */}}
      />
      <MenuCard
        icon="settings"
        title={t('dashboard.menu.settings')}
        description={t('dashboard.menu.settingsDesc')}
        color="#9C27B0"
        onPress={() => {/* TODO: navigate to settings */}}
      />
    </>
  );

  const renderAdminOptions = () => (
    <>
      <MenuCard
        icon="people"
        title={t('dashboard.menu.manageMembers')}
        description={t('dashboard.menu.manageMembersDesc')}
        color="#1E3A5F"
        onPress={() => navigation.navigate('MemberManagement')}
      />
      <MenuCard
        icon="shield-checkmark"
        title={t('dashboard.menu.authorizedPersons')}
        description={t('dashboard.menu.authorizedPersonsDesc')}
        color="#2E7D32"
        onPress={() => navigation.navigate('AuthorizedPersons')}
      />
      <MenuCard
        icon="calendar"
        title={t('dashboard.menu.dailyVisits')}
        description={t('dashboard.menu.dailyVisitsDesc')}
        color="#1976D2"
        onPress={() => navigation.navigate('DailyVisits')}
      />
      <MenuCard
        icon="time"
        title={t('dashboard.menu.accessHistory')}
        description={t('dashboard.menu.accessHistoryDesc')}
        color="#ED6C02"
        onPress={() => {/* TODO: navigate to access logs */}}
      />
    </>
  );

  const renderOfficerOptions = () => (
    <>
      <MenuCard
        icon="enter"
        title={t('dashboard.menu.confirmAccess')}
        description={t('dashboard.menu.confirmAccessDesc')}
        color="#2E7D32"
        onPress={() => {/* TODO: navigate to confirm access */}}
      />
      <MenuCard
        icon="search"
        title={t('dashboard.menu.searchAuthorized')}
        description={t('dashboard.menu.searchAuthorizedDesc')}
        color="#1976D2"
        onPress={() => {/* TODO: navigate to search */}}
      />
      <MenuCard
        icon="calendar-outline"
        title={t('dashboard.menu.todayVisits')}
        description={t('dashboard.menu.todayVisitsDesc')}
        color="#ED6C02"
        onPress={() => {/* TODO: navigate to today visits */}}
      />
    </>
  );

  const renderMemberOptions = () => (
    <>
      <MenuCard
        icon="shield-checkmark"
        title={t('dashboard.menu.myAuthorized')}
        description={t('dashboard.menu.myAuthorizedDesc')}
        color="#2E7D32"
        onPress={() => navigation.navigate('AuthorizedPersons')}
      />
      <MenuCard
        icon="calendar"
        title={t('dashboard.menu.myVisits')}
        description={t('dashboard.menu.myVisitsDesc')}
        color="#1976D2"
        onPress={() => {/* TODO: navigate to my visits */}}
      />
    </>
  );

  const getMenuOptions = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'ROLE_SUPER':
        return renderSuperAdminOptions();
      case 'ROLE_ADMIN':
        return renderAdminOptions();
      case 'ROLE_OFFICER':
        return renderOfficerOptions();
      case 'ROLE_MEMBER':
        return renderMemberOptions();
      default:
        return null;
    }
  };

  const getRoleName = () => {
    if (!user) return '';
    const roleKey = user.role;
    return t(`dashboard.roles.${roleKey}`) || user.role;
  };

  return (
    <LinearGradient
      colors={['#5AB9C1', '#4A9FA6', '#3E8A91']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header with Logo in same row */}
          <View style={styles.header}>
            <AppLogo size="large" />
            <View style={styles.userInfoContainer}>
              <Text style={styles.welcomeText}>{t('dashboard.welcome')}</Text>
              <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.userRole}>{getRoleName()}{user?.houseNumber ? ` - Casa ${user.houseNumber}` : ''}</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.profileButton} 
                onPress={() => navigation.navigate('Profile', { onProfileUpdate: loadUserData })}
              >
                <Ionicons name="person-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Menu Cards */}
          <View style={styles.menuContainer}>
            {getMenuOptions()}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const MenuCard = ({ icon, title, description, color, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <Ionicons name={icon} size={32} color="#fff" />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#999" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 16,
  },
  userInfoContainer: {
    flex: 1,
    marginLeft: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
  },
});
