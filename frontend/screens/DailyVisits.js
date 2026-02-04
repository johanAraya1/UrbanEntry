import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../src/i18n/LanguageContext';
import { colors } from '../theme';
import AlertDialog from '../components/AlertDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import dailyVisitService from '../src/services/dailyVisitService';
import AppLogo from '../components/AppLogo';

export default function DailyVisits({ navigation }) {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentType: 'CEDULA',
    idNumber: '',
    licensePlate: '',
    visitDate: new Date(),
    timeType: 'ALL_DAY', // ALL_DAY, MORNING, AFTERNOON, SPECIFIC
    specificTime: null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'info' });
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dailyVisitService.list();
      setItems(data);
    } catch (error) {
      console.error('Error loading daily visits:', error);
      showAlert(t('common.error'), t('dailyVisits.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      documentType: 'CEDULA',
      idNumber: '',
      licensePlate: '',
      visitDate: new Date(),
      timeType: 'ALL_DAY',
      specificTime: null,
    });
    setEditingItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    const visitDate = item.visitDate ? new Date(item.visitDate) : new Date();
    let timeType = 'ALL_DAY';
    let specificTime = null;

    if (item.expectedTimeFrom && item.expectedTimeTo) {
      const fromHour = parseInt(item.expectedTimeFrom.split(':')[0]);
      if (fromHour === 6 && item.expectedTimeTo === '12:00') {
        timeType = 'MORNING';
      } else if (fromHour === 12 && item.expectedTimeTo === '18:00') {
        timeType = 'AFTERNOON';
      } else {
        timeType = 'SPECIFIC';
        const [hours, minutes] = item.expectedTimeFrom.split(':');
        specificTime = new Date();
        specificTime.setHours(parseInt(hours), parseInt(minutes));
      }
    }

    setFormData({
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      documentType: item.documentType || 'CEDULA',
      idNumber: item.idNumber || '',
      licensePlate: item.licensePlate || '',
      visitDate,
      timeType,
      specificTime,
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const formatIdNumber = (documentType, text) => {
    const digitsOnly = text.replace(/\D/g, '');
    
    switch (documentType) {
      case 'CEDULA':
        if (digitsOnly.length <= 9) {
          if (digitsOnly.length >= 5) {
            return `${digitsOnly.slice(0, 1)}-${digitsOnly.slice(1, 5)}-${digitsOnly.slice(5, 9)}`;
          } else if (digitsOnly.length >= 2) {
            return `${digitsOnly.slice(0, 1)}-${digitsOnly.slice(1)}`;
          }
          return digitsOnly;
        }
        return formData.idNumber;
      
      case 'CEDULA_RESIDENCIA':
        if (digitsOnly.length <= 12) {
          if (digitsOnly.length >= 10) {
            return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 9)}-${digitsOnly.slice(9, 13)}`;
          } else if (digitsOnly.length >= 4) {
            return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
          }
          return digitsOnly;
        }
        return formData.idNumber;
      
      case 'PASAPORTE':
        return text.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 15);
      
      case 'OTRO':
        return text.slice(0, 50);
      
      default:
        return text;
    }
  };

  const validateIdNumber = (documentType, idNumber) => {
    const digitsOnly = idNumber.replace(/\D/g, '');
    
    switch (documentType) {
      case 'CEDULA':
        return digitsOnly.length === 9;
      case 'CEDULA_RESIDENCIA':
        return digitsOnly.length >= 11 && digitsOnly.length <= 12;
      case 'PASAPORTE':
        return idNumber.length >= 6 && idNumber.length <= 15;
      case 'OTRO':
        return idNumber.trim().length >= 1;
      default:
        return false;
    }
  };

  const handleIdNumberChange = (text) => {
    const formatted = formatIdNumber(formData.documentType, text);
    setFormData({ ...formData, idNumber: formatted });
  };

  const handleLicensePlateChange = (text) => {
    const filtered = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    setFormData({ ...formData, licensePlate: filtered });
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.idNumber.trim() !== '' &&
      validateIdNumber(formData.documentType, formData.idNumber) &&
      (formData.timeType !== 'SPECIFIC' || formData.specificTime !== null)
    );
  };

  const getIdNumberPlaceholder = () => {
    switch (formData.documentType) {
      case 'CEDULA':
        return '1-1111-1111';
      case 'CEDULA_RESIDENCIA':
        return '123-456789-0123';
      case 'PASAPORTE':
        return 'AB123456';
      case 'OTRO':
        return t('dailyVisits.enterDocument');
      default:
        return '';
    }
  };

  const prepareDataForSubmit = () => {
    const data = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      documentType: formData.documentType,
      idNumber: formData.idNumber.trim(),
      licensePlate: formData.licensePlate.trim() || null,
      visitDate: formData.visitDate.toISOString().split('T')[0],
    };

    // Configurar horarios según el tipo seleccionado
    switch (formData.timeType) {
      case 'MORNING':
        data.expectedTimeFrom = '06:00';
        data.expectedTimeTo = '12:00';
        break;
      case 'AFTERNOON':
        data.expectedTimeFrom = '12:00';
        data.expectedTimeTo = '18:00';
        break;
      case 'SPECIFIC':
        if (formData.specificTime) {
          const hours = String(formData.specificTime.getHours()).padStart(2, '0');
          const minutes = String(formData.specificTime.getMinutes()).padStart(2, '0');
          data.expectedTimeFrom = `${hours}:${minutes}`;
          data.expectedTimeTo = `${hours}:${minutes}`;
        }
        break;
      case 'ALL_DAY':
      default:
        data.expectedTimeFrom = null;
        data.expectedTimeTo = null;
        break;
    }

    return data;
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      showAlert(t('common.error'), t('dailyVisits.invalidForm'), 'error');
      return;
    }

    try {
      setSaving(true);
      const data = prepareDataForSubmit();

      if (editingItem) {
        await dailyVisitService.update(editingItem.id, data);
        showAlert(t('common.success'), t('dailyVisits.updateSuccess'), 'success');
      } else {
        await dailyVisitService.create(data);
        showAlert(t('common.success'), t('dailyVisits.createSuccess'), 'success');
      }

      closeModal();
      await loadItems();
    } catch (error) {
      console.error('Error saving daily visit:', error);
      showAlert(t('common.error'), t('dailyVisits.saveError'), 'error');
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
      await dailyVisitService.remove(itemToDelete.id);
      showAlert(t('common.success'), t('dailyVisits.deleteSuccess'), 'success');
      setConfirmVisible(false);
      setItemToDelete(null);
      await loadItems();
    } catch (error) {
      console.error('Error deleting daily visit:', error);
      showAlert(t('common.error'), t('dailyVisits.deleteError'), 'error');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, visitDate: selectedDate });
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setFormData({ ...formData, specificTime: selectedTime });
    }
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDisplayTime = (time) => {
    if (!time) return '';
    return time.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTimeTypeLabel = (timeType) => {
    switch (timeType) {
      case 'ALL_DAY':
        return '🌅 ' + t('dailyVisits.allDay');
      case 'MORNING':
        return '🌄 ' + t('dailyVisits.morning');
      case 'AFTERNOON':
        return '🌆 ' + t('dailyVisits.afternoon');
      case 'SPECIFIC':
        return '⏰ ' + t('dailyVisits.specificTime');
      default:
        return timeType;
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#3E8A91', '#2C6B73']} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#3E8A91', '#2C6B73']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.logoWrapper}>
              <Text style={styles.title}>{t('dailyVisits.title')}</Text>
            </View>
            <View style={styles.placeholder} />
          </View>

          {/* Empty State */}
          {!loading && items.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={80} color="rgba(255,255,255,0.8)" />
              <Text style={styles.emptyText}>{t('dailyVisits.noData')}</Text>
              <Text style={styles.emptySubText}>{t('dailyVisits.addFirst')}</Text>
              <TouchableOpacity 
                style={styles.emptyButton} 
                onPress={openAddModal}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={24} color="#3E8A91" style={{ marginRight: 8 }} />
                <Text style={styles.emptyButtonText}>{t('dailyVisits.addVisit')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* List */}
          {!loading && items.length > 0 && (
            <FlatList 
              data={items} 
              keyExtractor={(i) => String(i.id)} 
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="calendar" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{`${item.firstName} ${item.lastName}`}</Text>
                    <Text style={styles.cardDetail}>{`Documento: ${item.idNumber}`}</Text>
                    <Text style={styles.cardDetail}>{`Fecha: ${new Date(item.visitDate).toLocaleDateString('es-ES')}`}</Text>
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
                  {editingItem ? t('dailyVisits.editVisit') : t('dailyVisits.addVisit')}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('dailyVisits.firstName')}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    placeholder={t('dailyVisits.firstName')}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('dailyVisits.lastName')}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                    placeholder={t('dailyVisits.lastName')}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('dailyVisits.documentType')}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.documentType}
                      onValueChange={(value) => setFormData({ ...formData, documentType: value, idNumber: '' })}
                      style={styles.picker}
                      dropdownIconColor="#3E8A91"
                    >
                      <Picker.Item label={t('dailyVisits.cedula')} value="CEDULA" />
                      <Picker.Item label={t('dailyVisits.cedulaResidencia')} value="CEDULA_RESIDENCIA" />
                      <Picker.Item label={t('dailyVisits.pasaporte')} value="PASAPORTE" />
                      <Picker.Item label={t('dailyVisits.otro')} value="OTRO" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('dailyVisits.idNumber')}</Text>
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
                  <Text style={styles.label}>{t('dailyVisits.licensePlate')} ({t('dailyVisits.optional')})</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.licensePlate}
                    onChangeText={handleLicensePlateChange}
                    placeholder="ABC1234"
                    placeholderTextColor="#999"
                    maxLength={10}
                  />
                </View>

                {/* Fecha de Visita */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('dailyVisits.visitDate')}</Text>
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#3E8A91" />
                    <Text style={styles.dateButtonText}>{formatDisplayDate(formData.visitDate)}</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={formData.visitDate}
                      mode="date"
                      display="default"
                      onChange={onDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                </View>

                {/* Tipo de Hora */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('dailyVisits.timeType')}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.timeType}
                      onValueChange={(value) => setFormData({ ...formData, timeType: value })}
                      style={styles.picker}
                      dropdownIconColor="#3E8A91"
                    >
                      <Picker.Item label={getTimeTypeLabel('ALL_DAY')} value="ALL_DAY" />
                      <Picker.Item label={getTimeTypeLabel('MORNING')} value="MORNING" />
                      <Picker.Item label={getTimeTypeLabel('AFTERNOON')} value="AFTERNOON" />
                      <Picker.Item label={getTimeTypeLabel('SPECIFIC')} value="SPECIFIC" />
                    </Picker>
                  </View>
                </View>

                {/* Hora Específica */}
                {formData.timeType === 'SPECIFIC' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('dailyVisits.specificTime')}</Text>
                    <TouchableOpacity 
                      style={styles.dateButton}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Ionicons name="time-outline" size={20} color="#3E8A91" />
                      <Text style={styles.dateButtonText}>
                        {formData.specificTime ? formatDisplayTime(formData.specificTime) : t('dailyVisits.selectTime')}
                      </Text>
                    </TouchableOpacity>
                    {showTimePicker && (
                      <DateTimePicker
                        value={formData.specificTime || new Date()}
                        mode="time"
                        display="default"
                        onChange={onTimeChange}
                        is24Hour={false}
                      />
                    )}
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.button, styles.buttonSecondary]} 
                  onPress={closeModal}
                  disabled={saving}
                >
                  <Text style={styles.buttonTextSecondary}>{t('dailyVisits.cancel')}</Text>
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
                      {t('dailyVisits.save')}
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
          title={t('dailyVisits.confirmDelete')}
          message={t('dailyVisits.confirmDeleteMessage')}
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
    fontSize: 24, 
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 24,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 12,
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
    marginTop: 32,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.neutral,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  picker: {
    height: 56,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.neutral,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral,
  },
  buttonTextDisabled: {
    color: '#999',
  },
});
