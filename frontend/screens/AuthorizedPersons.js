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
  ScrollView
} from 'react-native';
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
    idNumber: '',
    licensePlate: ''
  });
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authorizedService.list();
      setItems(data);
    } catch (err) {
      showAlert(t('alerts.error'), t('alerts.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const showAlert = (title, message) => {
    setAlertConfig({ title, message });
    setAlertVisible(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ firstName: '', lastName: '', idNumber: '', licensePlate: '' });
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      idNumber: item.idNumber || '',
      licensePlate: item.licensePlate || ''
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(null);
    setFormData({ firstName: '', lastName: '', idNumber: '', licensePlate: '' });
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.idNumber) {
      showAlert(t('alerts.warning'), t('alerts.incompleteFields'));
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await authorizedService.update(editingItem.id, formData);
        showAlert(t('alerts.success'), t('authorizedPersons.updateSuccess'));
      } else {
        await authorizedService.create(formData);
        showAlert(t('alerts.success'), t('authorizedPersons.createSuccess'));
      }
      closeModal();
      loadData();
    } catch (err) {
      showAlert(t('alerts.error'), err?.response?.data?.message || t('alerts.saveError'));
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
      showAlert(t('alerts.success'), t('authorizedPersons.deleteSuccess'));
      loadData();
    } catch (err) {
      showAlert(t('alerts.error'), t('alerts.deleteError'));
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
            <View style={styles.logoWrapper}>
              <AppLogo size="small" />
            </View>
            <View style={styles.placeholder} />
          </View>

          <Text style={styles.title}>{t('authorizedPersons.title')}</Text>

          {/* Empty State */}
          {!loading && items.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={80} color="rgba(255,255,255,0.5)" />
              <Text style={styles.emptyText}>{t('authorizedPersons.noData')}</Text>
              <Text style={styles.emptySubText}>{t('authorizedPersons.addFirst')}</Text>
            </View>
          )}

          {/* List */}
          <FlatList 
            data={items} 
            keyExtractor={(i) => String(i.id)} 
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="person" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.cardDetail}>
                      <Ionicons name="card-outline" size={14} color="#666" /> {item.idNumber}
                    </Text>
                    {item.licensePlate && (
                      <Text style={styles.cardDetail}>
                        <Ionicons name="car-outline" size={14} color="#666" /> {item.licensePlate}
                      </Text>
                    )}
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
              </View>
            )} 
          />

          {/* Add Button */}
          <TouchableOpacity style={styles.fab} onPress={openAddModal}>
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
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
                  <Text style={styles.label}>{t('authorizedPersons.idNumber')}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.idNumber}
                    onChangeText={(text) => setFormData({ ...formData, idNumber: text })}
                    placeholder={t('authorizedPersons.idNumber')}
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('authorizedPersons.licensePlate')} ({t('authorizedPersons.optional')})</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.licensePlate}
                    onChangeText={(text) => setFormData({ ...formData, licensePlate: text.toUpperCase() })}
                    placeholder={t('authorizedPersons.licensePlate')}
                    placeholderTextColor="#999"
                    autoCapitalize="characters"
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
                  style={[styles.button, styles.buttonPrimary]} 
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>{t('authorizedPersons.save')}</Text>
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
    marginBottom: 20,
    marginHorizontal: 16,
    color: '#fff',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
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
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
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
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: colors.neutral,
    fontSize: 16,
    fontWeight: '600',
  },
});
