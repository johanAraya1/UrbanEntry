import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import authService from '../src/services/authService';
import AppLogo from '../components/AppLogo';
import AlertDialog from '../components/AlertDialog';
import { useLanguage } from '../src/i18n/LanguageContext';

export default function Profile({ navigation, route }) {
  const { t, language, changeLanguage } = useLanguage();
  const mustChangePassword = route?.params?.mustChangePassword || false;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Datos personales
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Contraseñas
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visibilidad de contraseñas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Alertas
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: 'success', title: '', message: '' });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
    } catch (error) {
      showAlert('error', t('alerts.error'), t('alerts.error'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, title, message) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  // Validaciones de contraseña
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  const isConfirmEnabled = isPasswordValid && newPassword.length > 0;

  const handleUpdateProfile = async () => {
    // Validar datos personales
    if (!firstName.trim() || !lastName.trim()) {
      showAlert('warning', t('alerts.incompleteFields'), t('profile.firstName') + ' ' + t('common.and') + ' ' + t('profile.lastName').toLowerCase() + ' ' + t('common.required'));
      return;
    }

    try {
      setSaving(true);
      await authService.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      showAlert('success', t('alerts.profileUpdated'), t('alerts.profileUpdatedMsg'));
      loadUserData();
      // Notificar al Dashboard para que se actualice
      if (route.params?.onProfileUpdate) {
        route.params.onProfileUpdate();
      }
    } catch (error) {
      showAlert('error', 'Error', error.response?.data?.message || error.response?.data || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      showAlert('warning', t('alerts.currentPasswordRequired'), t('alerts.currentPasswordRequiredMsg'));
      return;
    }

    if (!isPasswordValid) {
      showAlert('warning', t('alerts.invalidPassword'), t('alerts.invalidPasswordMsg'));
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('warning', t('alerts.passwordMismatch'), t('alerts.passwordMismatchMsg'));
      return;
    }

    try {
      setSaving(true);
      await authService.changePassword({
        currentPassword,
        newPassword,
      });
      showAlert('success', t('alerts.passwordChanged'), t('alerts.passwordChangedMsg'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Si era cambio obligatorio, redirigir al Dashboard
      if (mustChangePassword) {
        setTimeout(() => {
          navigation.replace('Dashboard');
        }, 2000);
      }
    } catch (error) {
      showAlert('error', 'Error', error.response?.data?.message || error.response?.data || 'No se pudo cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#5AB9C1', '#4A9FA6', '#3E8A91']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </LinearGradient>
    );
  }

  const ValidationItem = ({ isValid, text }) => (
    <View style={styles.validationItem}>
      <Ionicons 
        name={isValid ? "checkmark-circle" : "close-circle"} 
        size={18} 
        color={isValid ? "#2ECC71" : "#E74C3C"} 
      />
      <Text style={[styles.validationText, isValid && styles.validationTextValid]}>
        {text}
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#5AB9C1', '#4A9FA6', '#3E8A91']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          {!mustChangePassword && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
          {mustChangePassword && <View style={styles.backButton} />}
          <AppLogo size="small" />
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.mainTitle}>{t('profile.title')}</Text>

          {mustChangePassword && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={24} color="#ED6C02" />
              <Text style={styles.warningText}>
                {t('profile.mustChangePasswordWarning')}
              </Text>
            </View>
          )}

          {/* Sección Idioma - ocultar si es cambio obligatorio */}
          {!mustChangePassword && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
              <Text style={styles.helperText}>{t('profile.languageDesc')}</Text>
              <View style={styles.languageSelector}>
                <TouchableOpacity
                  style={[styles.languageButton, language === 'es' && styles.languageButtonActive]}
                  onPress={() => changeLanguage('es')}
                >
                  <Text style={[styles.languageButtonText, language === 'es' && styles.languageButtonTextActive]}>
                    {t('profile.spanish')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.languageButton, language === 'en' && styles.languageButtonActive]}
                  onPress={() => changeLanguage('en')}
                >
                  <Text style={[styles.languageButtonText, language === 'en' && styles.languageButtonTextActive]}>
                    {t('profile.english')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Sección Datos Personales - ocultar si es cambio obligatorio */}
          {!mustChangePassword && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.personalData')}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.firstName')}</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder={t('profile.firstName')}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.lastName')}</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder={t('profile.lastName')}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.email')}</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.email}
                editable={false}
                placeholderTextColor="#999"
              />
              <Text style={styles.helperText}>{t('profile.emailHelper')}</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleUpdateProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>{t('profile.saveChanges')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

          {/* Sección Cambiar Contraseña */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.changePassword')}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.currentPassword')}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder={t('profile.currentPassword')}
                  placeholderTextColor="#999"
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showCurrentPassword ? "eye-off" : "eye"}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.newPassword')}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder={t('profile.newPassword')}
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              
              {/* Validaciones */}
              {newPassword.length > 0 && (
                <View style={styles.validationsContainer}>
                  <ValidationItem isValid={hasMinLength} text={t('profile.passwordRequirements.minLength')} />
                  <ValidationItem isValid={hasUpperCase} text={t('profile.passwordRequirements.uppercase')} />
                  <ValidationItem isValid={hasLowerCase} text={t('profile.passwordRequirements.lowercase')} />
                  <ValidationItem isValid={hasNumber} text={t('profile.passwordRequirements.number')} />
                  <ValidationItem isValid={hasSpecialChar} text={t('profile.passwordRequirements.special')} />
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.confirmPassword')}</Text>
              <View style={[styles.passwordContainer, !isConfirmEnabled && styles.inputContainerDisabled]}>
                <TextInput
                  style={[styles.passwordInput, !isConfirmEnabled && styles.inputDisabled]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={isConfirmEnabled ? t('profile.confirmPassword') : t('profile.confirmPasswordDisabled')}
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  editable={isConfirmEnabled}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                  disabled={!isConfirmEnabled}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={22}
                    color={isConfirmEnabled ? "#666" : "#ccc"}
                  />
                </TouchableOpacity>
              </View>
              {isConfirmEnabled && confirmPassword && confirmPassword !== newPassword && (
                <Text style={styles.errorText}>{t('profile.passwordMismatch')}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonSecondary,
                (!isPasswordValid || !currentPassword || confirmPassword !== newPassword) && styles.buttonDisabled
              ]}
              onPress={handleChangePassword}
              disabled={!isPasswordValid || !currentPassword || confirmPassword !== newPassword || saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="lock-closed-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>{t('profile.changePasswordButton')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <AlertDialog
          visible={alertVisible}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={() => setAlertVisible(false)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#F0F0F0',
    color: '#999',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
  },
  inputContainerDisabled: {
    backgroundColor: '#F0F0F0',
    borderColor: '#D0D0D0',
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 14,
  },
  validationsContainer: {
    marginTop: 12,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validationText: {
    fontSize: 13,
    color: '#666',
  },
  validationTextValid: {
    color: '#2ECC71',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  buttonPrimary: {
    backgroundColor: '#5AB9C1',
  },
  buttonSecondary: {
    backgroundColor: '#1E3A5F',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  languageButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
  },
  languageButtonActive: {
    borderColor: '#5AB9C1',
    backgroundColor: '#E8F8F9',
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  languageButtonTextActive: {
    color: '#5AB9C1',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ED6C02',
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    color: '#E65100',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
