import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import memberService from '../src/services/memberService';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';
import AppLogo from '../components/AppLogo';
import { useLanguage } from '../src/i18n/LanguageContext';

export default function MemberManagement({ navigation }) {
  const { t } = useLanguage();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: 'success', title: '', message: '' });
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [createdMemberData, setCreatedMemberData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Validar si el formulario está completo y válido
  const isFormValid = () => {
    const { firstName, lastName, email, password } = formData;
    // Validar que todos los campos estén llenos
    if (!firstName || !lastName || !email || !password) {
      return false;
    }
    // Validar que el email tenga formato válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    // Validar que la contraseña tenga al menos 8 caracteres
    if (password.length < 8) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.getMembers();
      setMembers(data);
    } catch (error) {
      showAlert('error', t('alerts.error'), t('alerts.loadMembersError'));
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, title, message) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const handleCreateMember = async () => {
    // Validaciones
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      showAlert('warning', t('alerts.incompleteFields'), t('alerts.allFieldsRequired'));
      return;
    }

    if (formData.password.length < 8) {
      showAlert('warning', t('alerts.weakPassword'), t('alerts.minPasswordLength'));
      return;
    }

    try {
      const response = await memberService.createMember(formData);
      
      // Guardar datos del miembro creado incluyendo la contraseña
      setCreatedMemberData({
        ...response,
        password: formData.password, // Guardamos la contraseña temporal
      });
      
      // Cerrar modal de creación y abrir modal de éxito
      setModalVisible(false);
      setSuccessModalVisible(true);
      
      // Limpiar formulario
      setFormData({ firstName: '', lastName: '', email: '', password: '' });
      
      // Recargar lista
      loadMembers();
    } catch (error) {
      const message = error.response?.data || 'No se pudo crear el miembro';
      showAlert('error', t('alerts.createError'), message);
    }
  };

  const handleCopyCredentials = async () => {
    const credentials = `🏠 UrbanEntry - Acceso Creado

Nombre: ${createdMemberData.firstName} ${createdMemberData.lastName}
Email: ${createdMemberData.email}
Contraseña temporal: ${createdMemberData.password}

⚠️ Por seguridad, cambia tu contraseña al iniciar sesión por primera vez.`;

    await Clipboard.setStringAsync(credentials);
    showAlert('success', t('alerts.copied'), t('alerts.credentialsCopied'));
  };

  const handleShareWhatsApp = () => {
    const message = `🏠 *UrbanEntry - Acceso Creado*

Hola ${createdMemberData.firstName}, te he agregado como miembro de nuestra casa en UrbanEntry.

📧 *Email:* ${createdMemberData.email}
🔑 *Contraseña temporal:* ${createdMemberData.password}

⚠️ Por seguridad, cambia tu contraseña al iniciar sesión por primera vez.`;

    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl).then(supported => {
      if (supported) {
        Linking.openURL(whatsappUrl);
      } else {
        showAlert('error', t('alerts.error'), t('alerts.whatsappError'));
      }
    });
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent('UrbanEntry - Acceso Creado');
    const body = encodeURIComponent(`Hola ${createdMemberData.firstName},

Te he agregado como miembro de nuestra casa en UrbanEntry.

Email: ${createdMemberData.email}
Contraseña temporal: ${createdMemberData.password}

Por seguridad, cambia tu contraseña al iniciar sesión por primera vez.

Saludos,
UrbanEntry`);

    const mailtoUrl = `mailto:${createdMemberData.email}?subject=${subject}&body=${body}`;
    
    Linking.openURL(mailtoUrl)
      .then(() => {
        setSuccessModalVisible(false);
      })
      .catch(err => {
        console.error('Error opening email:', err);
        showAlert('error', t('alerts.error'), t('alerts.emailError'));
      });
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    setCreatedMemberData(null);
  };

  const handleDeleteMember = (member) => {
    console.log('🗑️ Delete button pressed for member:', member);
    setMemberToDelete(member);
    setConfirmDeleteVisible(true);
  };

  const confirmDelete = async () => {
    console.log('✅ Delete confirmed, proceeding...');
    console.log('🗑️ Deleting member with ID:', memberToDelete.id);
    
    setConfirmDeleteVisible(false);
    
    try {
      const result = await memberService.deleteMember(memberToDelete.id);
      console.log('✅ Delete successful:', result);
      
      showAlert('success', t('alerts.success'), t('alerts.memberDeleted'));
      loadMembers();
      setMemberToDelete(null);
    } catch (error) {
      const errorMsg = error.response?.data || 'No se pudo eliminar el miembro';
      console.error('❌ Delete error:', error);
      console.error('❌ Error response:', error.response);
      
      showAlert('error', t('alerts.deleteError'), errorMsg);
    }
  };

  const cancelDelete = () => {
    console.log('❌ Delete cancelled by user');
    setConfirmDeleteVisible(false);
    setMemberToDelete(null);
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberIcon}>
        <Ionicons name="person" size={24} color="#5AB9C1" />
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteMember(item)}
      >
        <Ionicons name="trash-outline" size={22} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5AB9C1" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#5AB9C1', '#4A9FA6', '#3E8A91']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <AppLogo size="small" />
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.screenTitle}>{t('memberManagement.title')}</Text>
        
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#5AB9C1" />
          <Text style={styles.infoText}>
            {t('memberManagement.infoText')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="person-add" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>{t('memberManagement.addMember')}</Text>
        </TouchableOpacity>

        {members.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>{t('memberManagement.emptyState')}</Text>
            <Text style={styles.emptySubtext}>
              {t('memberManagement.emptySubtext')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
          />
        )}
      </View>

      {/* Modal para agregar miembro */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('memberManagement.modalTitle')}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('memberManagement.firstName')}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('memberManagement.lastName')}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('memberManagement.email')}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 45 }]}
                  placeholder={t('memberManagement.password')}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !isFormValid() && styles.submitButtonDisabled
                ]}
                onPress={handleCreateMember}
                disabled={!isFormValid()}
              >
                <Text style={[
                  styles.submitButtonText,
                  !isFormValid() && styles.submitButtonTextDisabled
                ]}>
                  {t('memberManagement.createButton')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('memberManagement.cancelButton')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de éxito con opciones de compartir */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={handleCloseSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#2E7D32" />
            </View>

            <Text style={styles.successTitle}>{t('memberManagement.successTitle')}</Text>
            
            {createdMemberData && (
              <>
                <View style={styles.credentialsBox}>
                  <View style={styles.credentialRow}>
                    <Ionicons name="person" size={20} color="#5AB9C1" />
                    <Text style={styles.credentialLabel}>{t('memberManagement.nameLabel')}</Text>
                    <Text style={styles.credentialValue}>
                      {createdMemberData.firstName} {createdMemberData.lastName}
                    </Text>
                  </View>
                  
                  <View style={styles.credentialRow}>
                    <Ionicons name="mail" size={20} color="#5AB9C1" />
                    <Text style={styles.credentialLabel}>{t('memberManagement.emailLabel')}</Text>
                    <Text style={styles.credentialValue}>{createdMemberData.email}</Text>
                  </View>
                  
                  <View style={styles.credentialRow}>
                    <Ionicons name="lock-closed" size={20} color="#5AB9C1" />
                    <Text style={styles.credentialLabel}>{t('memberManagement.passwordLabel')}</Text>
                    <Text style={styles.credentialValuePassword}>{createdMemberData.password}</Text>
                  </View>
                </View>

                <View style={styles.warningBox}>
                  <Ionicons name="warning" size={20} color="#ED6C02" />
                  <Text style={styles.warningText}>
                    {t('memberManagement.verifyEmail')}
                  </Text>
                </View>

                <View style={styles.shareButtonsContainer}>
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleCopyCredentials}
                  >
                    <Ionicons name="copy-outline" size={24} color="#FFF" />
                    <Text style={styles.shareButtonText}>{t('memberManagement.copyButton')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.shareButton, styles.whatsappButton]}
                    onPress={handleShareWhatsApp}
                  >
                    <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
                    <Text style={styles.shareButtonText}>{t('memberManagement.whatsappButton')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.shareButton, styles.emailButton]}
                    onPress={handleSendEmail}
                  >
                    <Ionicons name="mail-outline" size={24} color="#FFF" />
                    <Text style={styles.shareButtonText}>{t('memberManagement.emailButton')}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeSuccessButton}
                  onPress={handleCloseSuccessModal}
                >
                  <Text style={styles.closeSuccessButtonText}>{t('memberManagement.closeButton')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        visible={confirmDeleteVisible}
        type="danger"
        title={t('memberManagement.confirmDelete')}
        message={memberToDelete ? t('memberManagement.confirmDeleteMessage', { name: `${memberToDelete.firstName} ${memberToDelete.lastName}` }) : ''}
        confirmText={t('memberManagement.deleteButton')}
        cancelText={t('memberManagement.cancelButton')}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Modal de alertas (éxito/error/warning) */}
      <AlertDialog
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5AB9C1',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F8F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: '#3E8A91',
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#5AB9C1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  list: {
    paddingBottom: 20,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F8F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#5AB9C1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  successModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '85%',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 25,
  },
  credentialsBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  credentialLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    width: 90,
  },
  credentialValue: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  credentialValuePassword: {
    flex: 1,
    fontSize: 15,
    color: '#5AB9C1',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ED6C02',
  },
  warningText: {
    flex: 1,
    marginLeft: 10,
    color: '#E65100',
    fontSize: 13,
    lineHeight: 18,
  },
  shareButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#5AB9C1',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  emailButton: {
    backgroundColor: '#1976D2',
  },
  shareButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  closeSuccessButton: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeSuccessButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
});
