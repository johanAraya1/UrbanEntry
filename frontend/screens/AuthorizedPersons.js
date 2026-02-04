import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import authorizedService from '../src/services/authorizedService';
import AppLogo from '../components/AppLogo';
import AlertDialog from '../components/AlertDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { useLanguage } from '../src/i18n/LanguageContext';

export default function AuthorizedPersons({ navigation }) {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentType: 'CEDULA',
    idNumber: '',
    licensePlate: ''
  });
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' });
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authorizedService.list();
      setItems(data);
    } catch (err) {
      showAlert(t('alerts.error'), t('alerts.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const showAlert = (title, message, type = 'success') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const normalizeText = (text) => {
    if (!text) return text;
    // Normalize Unicode characters to ensure proper encoding
    return text.normalize('NFC').trim();
  };

  const formatIdNumber = (documentType, text) => {
    // Remover caracteres no permitidos según el tipo
    let cleanText = text;
    
    switch (documentType) {
      case 'CEDULA':
        // Solo números
        cleanText = text.replace(/\D/g, '');
        // Máximo 9 dígitos (1-1234-5678)
        if (cleanText.length > 9) cleanText = cleanText.slice(0, 9);
        // Formatear con guiones automáticamente
        if (cleanText.length > 5) {
          return `${cleanText.slice(0, 1)}-${cleanText.slice(1, 5)}-${cleanText.slice(5)}`;
        } else if (cleanText.length > 1) {
          return `${cleanText.slice(0, 1)}-${cleanText.slice(1)}`;
        }
        return cleanText;
      
      case 'CEDULA_RESIDENCIA':
        // Solo números
        cleanText = text.replace(/\D/g, '');
        // Máximo 12 dígitos (123-456789-0123)
        if (cleanText.length > 12) cleanText = cleanText.slice(0, 12);
        // Formatear con guiones automáticamente
        if (cleanText.length > 9) {
          return `${cleanText.slice(0, 3)}-${cleanText.slice(3, 9)}-${cleanText.slice(9)}`;
        } else if (cleanText.length > 3) {
          return `${cleanText.slice(0, 3)}-${cleanText.slice(3)}`;
        }
        return cleanText;
      
      case 'PASAPORTE':
        // Alfanumérico mayúsculas
        cleanText = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        // Máximo 15 caracteres
        if (cleanText.length > 15) cleanText = cleanText.slice(0, 15);
        return cleanText;
      
      case 'OTRO':
        // Formato libre, máximo 50 caracteres
        if (cleanText.length > 50) cleanText = cleanText.slice(0, 50);
        return cleanText;
      
      default:
        return text;
    }
  };

  const validateIdNumber = (documentType, idNumber) => {
    if (!idNumber) return false;

    // Remover guiones para validar solo números
    const cleanNumber = idNumber.replace(/-/g, '');

    switch (documentType) {
      case 'CEDULA':
        // Debe tener exactamente 9 dígitos
        return cleanNumber.length === 9 && /^\d+$/.test(cleanNumber);
      
      case 'CEDULA_RESIDENCIA':
        // Entre 11 y 12 dígitos
        return cleanNumber.length >= 11 && cleanNumber.length <= 12 && /^\d+$/.test(cleanNumber);
      
      case 'PASAPORTE':
        // Alfanumérico, entre 6 y 15 caracteres
        return cleanNumber.length >= 6 && cleanNumber.length <= 15 && /^[A-Z0-9]+$/i.test(cleanNumber);
      
      case 'OTRO':
        // Sin validación estricta, solo que tenga contenido
        return idNumber.length > 0;
      
      default:
        return false;
    }
  };

  const getIdNumberPlaceholder = () => {
    switch (formData.documentType) {
      case 'CEDULA':
        return '101234567';
      case 'CEDULA_RESIDENCIA':
        return '123456789012';
      case 'PASAPORTE':
        return 'ABC123456';
      case 'OTRO':
        return t('authorizedPersons.freeFormat');
      default:
        return '';
    }
  };

  const handleIdNumberChange = (text) => {
    const formatted = formatIdNumber(formData.documentType, text);
    setFormData({ ...formData, idNumber: formatted });
  };

  const handleLicensePlateChange = (text) => {
    // Solo permitir letras y números, máximo 10 caracteres
    const cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const limited = cleaned.slice(0, 10);
    setFormData({ ...formData, licensePlate: limited });
  };

  const isFormValid = () => {
    // Validar que los campos obligatorios no estén vacíos
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.idNumber.trim()) {
      return false;
    }
    
    // Validar el formato del documento
    return validateIdNumber(formData.documentType, formData.idNumber);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ firstName: '', lastName: '', documentType: 'CEDULA', idNumber: '', licensePlate: '' });
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      documentType: item.documentType || 'CEDULA',
      idNumber: item.idNumber || '',
      licensePlate: item.licensePlate || ''
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(null);
    setFormData({ firstName: '', lastName: '', documentType: 'CEDULA', idNumber: '', licensePlate: '' });
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.idNumber) {
      showAlert(t('alerts.warning'), t('alerts.incompleteFields'), 'warning');
      return;
    }

    // Validar formato según tipo de documento
    if (!validateIdNumber(formData.documentType, formData.idNumber)) {
      showAlert(
        t('alerts.warning'), 
        t('authorizedPersons.invalidIdFormat') || 'Formato de documento inválido para el tipo seleccionado',
        'warning'
      );
      return;
    }

    // Normalize all text fields to ensure proper UTF-8 encoding
    const normalizedData = {
      firstName: normalizeText(formData.firstName),
      lastName: normalizeText(formData.lastName),
      documentType: formData.documentType,
      idNumber: normalizeText(formData.idNumber),
      licensePlate: formData.licensePlate ? normalizeText(formData.licensePlate.toUpperCase()) : ''
    };

    setSaving(true);
    try {
      if (editingItem) {
        await authorizedService.update(editingItem.id, normalizedData);
        showAlert(t('alerts.success'), t('authorizedPersons.updateSuccess'), 'success');
      } else {
        await authorizedService.create(normalizedData);
        showAlert(t('alerts.success'), t('authorizedPersons.createSuccess'), 'success');
      }
      closeModal();
      loadData();
    } catch (err) {
      showAlert(t('alerts.error'), err?.response?.data?.message || t('alerts.saveError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setConfirmVisible(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await authorizedService.remove(itemToDelete.id);
      showAlert(t('alerts.success'), t('authorizedPersons.deleteSuccess'), 'success');
      loadData();
    } catch (err) {
      showAlert(t('alerts.error'), t('alerts.deleteError'), 'error');
    } finally {
      setItemToDelete(null);
    }
  };

  if (loading) return (
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

  return (
    <LinearGradient
      colors={['#5AB9C1', '#4A9FA6', '#3E8A91']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>{t('authorizedPersons.title')}</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Empty State */}
          {!loading && items.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="person-add-outline" size={64} color="#fff" />
              </View>
              <Text style={styles.emptyText}>{t('authorizedPersons.noData')}</Text>
              <Text style={styles.emptySubText}>{t('authorizedPersons.addFirst')}</Text>
              <TouchableOpacity 
                style={styles.emptyButton} 
                onPress={openAddModal}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={24} color="#3E8A91" style={{ marginRight: 8 }} />
                <Text style={styles.emptyButtonText}>{t('authorizedPersons.addPerson')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && items.length > 0 && (
            <FlatList 
              data={items} 
              keyExtractor={(i) => String(i.id)} 
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="person" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{`${item.firstName} ${item.lastName}`}</Text>
                    <Text style={styles.cardDetail}>{`Documento: ${item.idNumber}`}</Text>
                    {item.licensePlate ? (
                      <Text style={styles.cardDetail}>{`Placa: ${item.licensePlate}`}</Text>
                    ) : null}
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => openEditModal(item)}
                    >
                      <Ionicons name="create-outline" size={22} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => confirmDelete(item)}
                    >
                      <Ionicons name="trash-outline" size={22} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              )} 
            />
          )}

          {/* Add Button */}
          {!loading && items.length > 0 && (
            <TouchableOpacity style={styles.fab} onPress={openAddModal}>
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Add/Edit Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingItem ? t('authorizedPersons.editPerson') : t('authorizedPersons.addPerson')}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('authorizedPersons.firstName')}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    placeholder={t('authorizedPersons.firstName')}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('authorizedPersons.lastName')}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                    placeholder={t('authorizedPersons.lastName')}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('authorizedPersons.documentType')}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.documentType}
                      onValueChange={(value) => setFormData({ ...formData, documentType: value, idNumber: '' })}
                      style={styles.picker}
                      dropdownIconColor="#3E8A91"
                    >
                      <Picker.Item label={t('authorizedPersons.cedula')} value="CEDULA" />
                      <Picker.Item label={t('authorizedPersons.cedulaResidencia')} value="CEDULA_RESIDENCIA" />
                      <Picker.Item label={t('authorizedPersons.pasaporte')} value="PASAPORTE" />
                      <Picker.Item label={t('authorizedPersons.otro')} value="OTRO" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('authorizedPersons.idNumber')}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.idNumber}
                    onChangeText={handleIdNumberChange}
                    placeholder={getIdNumberPlaceholder()}
                    placeholderTextColor="#999"
                    keyboardType={formData.documentType === 'PASAPORTE' ? 'default' : 'numeric'}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('authorizedPersons.licensePlate')} ({t('authorizedPersons.optional')})</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.licensePlate}
                    onChangeText={handleLicensePlateChange}
                    placeholder="ABC1234"
                    placeholderTextColor="#999"
                    maxLength={10}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.button, styles.buttonSecondary]} 
                  onPress={closeModal}
                  disabled={saving}
                >
                  <Text style={styles.buttonTextSecondary}>{t('authorizedPersons.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.button, 
                    styles.buttonPrimary,
                    (!isFormValid() || saving) && styles.buttonDisabled
                  ]} 
                  onPress={handleSave}
                  disabled={!isFormValid() || saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={[
                      styles.buttonText,
                      (!isFormValid() || saving) && styles.buttonTextDisabled
                    ]}>
                      {t('authorizedPersons.save')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <AlertDialog
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertVisible(false)}
        />

        <ConfirmDialog
          visible={confirmVisible}
          title={t('authorizedPersons.confirmDelete')}
          message={t('authorizedPersons.confirmDeleteMessage')}
          onConfirm={handleDelete}
          onCancel={() => {
            setConfirmVisible(false);
            setItemToDelete(null);
          }}
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
  container: { 
    flex: 1, 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 20,
    marginHorizontal: 16,
    color: '#fff',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 56,
  },
  emptyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3E8A91',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral,
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.neutral,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.neutral,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: colors.neutral,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#999',
  },
  buttonTextSecondary: {
    color: colors.neutral,
    fontSize: 16,
    fontWeight: '600',
  },
});
