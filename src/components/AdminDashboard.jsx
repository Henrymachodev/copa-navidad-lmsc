import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  Filter, 
  RefreshCw, 
  Trash2, 
  LogOut, 
  Trophy, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Layers,
  Eye,
  X,
  ExternalLink,
  Plus,
  Edit,
  Handshake,
  Check,
  Clock,
  AlertTriangle,
  Settings,
  CreditCard,
  FileCheck2,
  UploadCloud,
  FileCheck,
  Save,
  Sliders,
  DollarSign,
  HeartPulse,
  Award,
  Shirt,
  Compass,
  UserCheck,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  Sparkles,
  UserPlus,
  Cloud,
  CloudOff,
  Database,
  Pencil,
  MessageSquare,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Move,
  ArrowUpDown,
  Smartphone,
  Landmark,
  Coins
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  getRegistrations, 
  deleteRegistration, 
  updateRegistration,
  saveRegistration,
  updateRegistrationStatus,
  updateRegistrationObservation,
  getCategoryLimits, 
  saveCategoryLimits,
  getSponsors, 
  saveSponsor, 
  saveSponsorsOrder,
  deleteSponsor,
  getLandingConfig,
  saveLandingConfig,
  subscribeToLandingConfig,
  PLAYER_STATUSES,
  DEFAULT_MAX_PAIRS_PER_CATEGORY,
  DEFAULT_LANDING_CONFIG,
  DEFAULT_HERO_FOTOS,
  DEFAULT_HERO_MONTAGE_FOTOS,
  DEFAULT_BENEFICIOS_INVERSION,
  subscribeToRegistrations,
  ADMIN_ROLES,
  getAdminUsers,
  saveAdminUser,
  deleteAdminUser,
  isSupabaseConfigured,
  getActiveSupabaseConfig,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  getSupabaseProjectRef
} from '../services/supabase';
import { CATEGORIAS } from './RegistrationForm';

export default function AdminDashboard({ onLogout, currentUser }) {
  // Pestañas: 'inscripciones' | 'cupos' | 'landing' | 'patrocinadores' | 'roles'
  const [activeTab, setActiveTab] = useState('inscripciones');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Modal para ver comprobante
  const [receiptModalData, setReceiptModalData] = useState(null);

  // Modal para ver ficha completa del registro
  const [detailModalData, setDetailModalData] = useState(null);

  // Modal para editar dupla completa
  const [editModalData, setEditModalData] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Modal para agregar/editar observaciones rápidas
  const [observationModalData, setObservationModalData] = useState(null);
  const [savingObservation, setSavingObservation] = useState(false);

  // Modal para inscribir pareja desde el administrador
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const initialNewDupla = {
    categoria: '',
    status: 'confirmado',
    monto: '$140',
    metodoPago: 'Pago Móvil',
    referenciaPago: '',
    observaciones: '',
    comprobantePagoUrl: '',
    comprobanteNombre: '',
    aceptaReglamento: 'si',
    jugador1: {
      nombre: '',
      apellido: '',
      cedula: '',
      email: '',
      telefono: '',
      tallaFranela: 'M',
      ladoJuego: 'Derecha',
      categoriaHabitual: '',
      torneoActual: '',
      historialTorneos: '',
      alergias: '',
      aceptaReglamento: 'si'
    },
    jugador2: {
      nombre: '',
      apellido: '',
      cedula: '',
      email: '',
      telefono: '',
      tallaFranela: 'M',
      ladoJuego: 'Revés',
      categoriaHabitual: '',
      torneoActual: '',
      historialTorneos: '',
      alergias: '',
      aceptaReglamento: 'si'
    }
  };
  const [newDuplaForm, setNewDuplaForm] = useState(initialNewDupla);

  // Modal para configuración de Base de Datos en la Nube (Supabase)
  const [cloudDbModalOpen, setCloudDbModalOpen] = useState(false);
  const [cloudDbForm, setCloudDbForm] = useState(() => getActiveSupabaseConfig());

  // Cupos por categoría
  const [limits, setLimits] = useState({ defaultMax: DEFAULT_MAX_PAIRS_PER_CATEGORY });
  const [editingLimits, setEditingLimits] = useState(false);

  // Configuración de Contenidos & Landing
  const [landingForm, setLandingForm] = useState(DEFAULT_LANDING_CONFIG);
  const [savingLanding, setSavingLanding] = useState(false);

  // Patrocinadores
  const [sponsorsList, setSponsorsList] = useState([]);
  const [sponsorModal, setSponsorModal] = useState(null);
  const [draggedSponsorIdx, setDraggedSponsorIdx] = useState(null);
  const [savingSponsorOrder, setSavingSponsorOrder] = useState(false);

  // Usuarios y Roles de Administrador
  const [adminUsersList, setAdminUsersList] = useState([]);
  const [userModal, setUserModal] = useState(null);
  const [savingUser, setSavingUser] = useState(false);

  // Carga inicial y listeners
  useEffect(() => {
    fetchData();
    loadLimits();
    loadSponsorsData();
    loadLandingData();
    loadAdminUsers();

    const unsubRegistrations = subscribeToRegistrations((data) => {
      setRegistrations(data);
      setLoading(false);
    });

    const unsubLanding = subscribeToLandingConfig((cfg) => {
      setLandingForm(cfg);
    });

    window.addEventListener('admin_users_updated', loadAdminUsers);

    return () => {
      if (typeof unsubRegistrations === 'function') unsubRegistrations();
      if (typeof unsubLanding === 'function') unsubLanding();
      window.removeEventListener('admin_users_updated', loadAdminUsers);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Error al cargar inscripciones:', error);
      setFeedback({ type: 'error', message: 'No se pudieron cargar las inscripciones.' });
    } finally {
      setLoading(false);
    }
  };

  const loadLimits = async () => {
    try {
      const l = await getCategoryLimits();
      setLimits(l);
    } catch (e) {
      console.error('Error cargando límites:', e);
    }
  };

  const loadLandingData = async () => {
    try {
      const cfg = await getLandingConfig();
      setLandingForm(cfg);
    } catch (e) {
      console.error('Error cargando configuración landing:', e);
    }
  };

  const loadSponsorsData = async () => {
    try {
      const sp = await getSponsors();
      setSponsorsList(sp);
    } catch (e) {
      console.error('Error cargando sponsors:', e);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const users = await getAdminUsers();
      setAdminUsersList(users);
    } catch (e) {
      console.error('Error cargando usuarios admin:', e);
    }
  };

  const handleSaveUserSubmit = async (e) => {
    e.preventDefault();
    if (!userModal.nombre.trim() || !userModal.pin.trim()) {
      alert('El Nombre y el PIN de acceso son obligatorios.');
      return;
    }
    setSavingUser(true);
    try {
      await saveAdminUser(userModal);
      setUserModal(null);
      await loadAdminUsers();
      setFeedback({ type: 'success', message: 'Usuario y rol guardados con éxito.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Error al guardar usuario.' });
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el acceso para ${nombre}?`)) return;
    try {
      await deleteAdminUser(id);
      await loadAdminUsers();
      setFeedback({ type: 'success', message: 'Usuario eliminado correctamente.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      alert(err.message || 'Error al eliminar usuario.');
    }
  };

  const handleToggleUserActive = async (user) => {
    try {
      await saveAdminUser({ ...user, activo: !user.activo });
      await loadAdminUsers();
      setFeedback({ type: 'success', message: `Usuario ${!user.activo ? 'activado' : 'desactivado'}.` });
      setTimeout(() => setFeedback(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickResizeSponsor = async (sponsor, delta) => {
    const currentHeight = Number(sponsor.logoHeight) || 65;
    const newHeight = Math.max(30, Math.min(140, currentHeight + delta));
    try {
      await saveSponsor({ ...sponsor, logoHeight: newHeight });
      await loadSponsorsData();
    } catch (e) {
      console.error('Error ajustando tamaño de sponsor:', e);
    }
  };

  // Reordenar patrocinadores (Mover flechas)
  const handleMoveSponsor = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sponsorsList.length) return;
    const updated = [...sponsorsList];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setSponsorsList(updated);
    try {
      setSavingSponsorOrder(true);
      await saveSponsorsOrder(updated);
      setFeedback({ type: 'success', message: `Posición actualizada: "${moved.name}" ahora está en el puesto #${newIndex + 1}` });
      setTimeout(() => setFeedback(null), 2500);
    } catch (err) {
      console.error('Error al guardar nuevo orden de sponsors:', err);
      setFeedback({ type: 'error', message: 'Error guardando nuevo orden de patrocinadores' });
    } finally {
      setSavingSponsorOrder(false);
    }
  };

  // Asignar posición numérica directa
  const handleSetSponsorPosition = async (fromIndex, toPosition) => {
    const toIndex = Math.max(0, Math.min(sponsorsList.length - 1, Number(toPosition) - 1));
    if (toIndex === fromIndex || isNaN(toIndex)) return;
    const updated = [...sponsorsList];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setSponsorsList(updated);
    try {
      setSavingSponsorOrder(true);
      await saveSponsorsOrder(updated);
      setFeedback({ type: 'success', message: `Posición actualizada: "${moved.name}" ahora está en el puesto #${toIndex + 1}` });
      setTimeout(() => setFeedback(null), 2500);
    } catch (err) {
      console.error('Error al cambiar posición:', err);
      setFeedback({ type: 'error', message: 'Error al cambiar posición' });
    } finally {
      setSavingSponsorOrder(false);
    }
  };

  // Arrastrar y soltar (Drag and Drop)
  const handleDragStart = (e, index) => {
    setDraggedSponsorIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch (_) {}
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedSponsorIdx === null || draggedSponsorIdx === targetIndex) {
      setDraggedSponsorIdx(null);
      return;
    }
    const updated = [...sponsorsList];
    const [moved] = updated.splice(draggedSponsorIdx, 1);
    updated.splice(targetIndex, 0, moved);
    setDraggedSponsorIdx(null);
    setSponsorsList(updated);
    try {
      setSavingSponsorOrder(true);
      await saveSponsorsOrder(updated);
      setFeedback({ type: 'success', message: `Nuevo orden guardado: "${moved.name}" en el puesto #${targetIndex + 1}` });
      setTimeout(() => setFeedback(null), 2500);
    } catch (err) {
      console.error('Error al guardar orden arrastrado:', err);
    } finally {
      setSavingSponsorOrder(false);
    }
  };

  // Cambio de status de un jugador / pareja
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRegistrationStatus(id, newStatus);
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      setFeedback({ 
        type: 'success', 
        message: `Estado de la pareja actualizado a "${newStatus.toUpperCase()}".` 
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Error al cambiar status.' });
    }
  };

  // Guardar límites de cupos
  const handleSaveLimits = async (e) => {
    e.preventDefault();
    try {
      await saveCategoryLimits(limits);
      setEditingLimits(false);
      setFeedback({ type: 'success', message: 'Límites de cupos actualizados con éxito.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      setFeedback({ type: 'error', message: 'Error al guardar límites.' });
    }
  };

  // Guardar Contenidos & Landing
  const handleSaveLandingSubmit = async (e) => {
    e.preventDefault();
    setSavingLanding(true);
    try {
      await saveLandingConfig(landingForm);
      setFeedback({ type: 'success', message: '¡Contenidos de la Landing y Reglamento actualizados con éxito!' });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Error al guardar configuración de contenidos.' });
    } finally {
      setSavingLanding(false);
    }
  };

  // Carga de PDF del Reglamento Oficial (< 1MB)
  const handleReglamentoPdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 1048576; // 1 MB
    if (file.size > MAX_SIZE) {
      alert(`El archivo supera el límite de 1 MB (${(file.size / (1024 * 1024)).toFixed(2)} MB). Por favor comprímelo antes de subir.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setLandingForm(prev => ({
        ...prev,
        reglamentoPdfData: ev.target.result,
        reglamentoNombre: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReglamentoPdf = () => {
    setLandingForm(prev => ({
      ...prev,
      reglamentoPdfData: '',
      reglamentoNombre: ''
    }));
  };

  // Manejo de Fotos del Hero Principal
  const handleHeroPhotoChange = (index, field, value) => {
    const currentFotos = landingForm.heroFotos && landingForm.heroFotos.length === 4 
      ? [...landingForm.heroFotos] 
      : [...DEFAULT_HERO_FOTOS];
    currentFotos[index] = { ...currentFotos[index], [field]: value };
    setLandingForm(prev => ({ ...prev, heroFotos: currentFotos }));
  };

  const handleHeroPhotoUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_SIZE = 1048576; // 1 MB
    if (file.size > MAX_SIZE) {
      alert(`La imagen supera 1 MB (${(file.size / (1024 * 1024)).toFixed(2)} MB). Por favor comprímela antes de subir.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleHeroPhotoChange(index, 'imagen', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRestoreHeroPhoto = (index) => {
    const defaultFoto = DEFAULT_HERO_FOTOS[index];
    if (defaultFoto) {
      const currentFotos = landingForm.heroFotos && landingForm.heroFotos.length === 4 
        ? [...landingForm.heroFotos] 
        : [...DEFAULT_HERO_FOTOS];
      currentFotos[index] = { ...defaultFoto };
      setLandingForm(prev => ({ ...prev, heroFotos: currentFotos }));
    }
  };

  // Manejo de Fotos del Montaje Deportivo Flyer
  const handleMontagePhotoUpload = (key, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_SIZE = 1048576; // 1 MB
    if (file.size > MAX_SIZE) {
      alert(`La imagen supera 1 MB (${(file.size / (1024 * 1024)).toFixed(2)} MB). Por favor comprímela antes de subir.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLandingForm(prev => ({
        ...prev,
        heroMontageFotos: {
          ...(prev.heroMontageFotos || DEFAULT_HERO_MONTAGE_FOTOS),
          [key]: ev.target.result
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRestoreMontagePhoto = (key) => {
    setLandingForm(prev => ({
      ...prev,
      heroMontageFotos: {
        ...(prev.heroMontageFotos || DEFAULT_HERO_MONTAGE_FOTOS),
        [key]: DEFAULT_HERO_MONTAGE_FOTOS[key]
      }
    }));
  };

  // Manejo de Beneficios de la Inversión
  const handleBenefitChange = (index, value) => {
    const current = landingForm.beneficiosInversion && landingForm.beneficiosInversion.length > 0
      ? [...landingForm.beneficiosInversion]
      : [...DEFAULT_BENEFICIOS_INVERSION];
    current[index] = value;
    setLandingForm(prev => ({ ...prev, beneficiosInversion: current }));
  };

  const handleAddBenefit = () => {
    const current = landingForm.beneficiosInversion && landingForm.beneficiosInversion.length > 0
      ? [...landingForm.beneficiosInversion]
      : [...DEFAULT_BENEFICIOS_INVERSION];
    current.push('Nuevo beneficio de inscripción');
    setLandingForm(prev => ({ ...prev, beneficiosInversion: current }));
  };

  const handleRemoveBenefit = (index) => {
    const current = landingForm.beneficiosInversion && landingForm.beneficiosInversion.length > 0
      ? [...landingForm.beneficiosInversion]
      : [...DEFAULT_BENEFICIOS_INVERSION];
    if (current.length <= 1) {
      alert('Debe haber al menos un beneficio en la lista.');
      return;
    }
    current.splice(index, 1);
    setLandingForm(prev => ({ ...prev, beneficiosInversion: current }));
  };

  const handleRestoreBenefits = () => {
    setLandingForm(prev => ({ ...prev, beneficiosInversion: [...DEFAULT_BENEFICIOS_INVERSION] }));
  };

  // Eliminar registro
  const handleDelete = async (id, playerNames) => {
    if (!window.confirm(`¿Estás seguro de eliminar la inscripción de ${playerNames}?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteRegistration(id);
      setRegistrations(prev => prev.filter(r => r.id !== id));
      setFeedback({ type: 'success', message: 'Inscripción eliminada correctamente.' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Error al eliminar registro.' });
    } finally {
      setDeletingId(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Abrir modal de edición con la información completa
  const handleOpenEditModal = (item) => {
    setEditModalData({
      id: item.id,
      categoria: item.categoria || '',
      status: item.status || item.estado || 'preinscrito',
      monto: item.monto || '$140',
      metodoPago: item.metodoPago || 'Pago Móvil',
      referenciaPago: item.referenciaPago || '',
      observaciones: item.observaciones || item.metadata?.observaciones || '',
      comprobantePagoUrl: item.comprobantePagoUrl || '',
      comprobanteNombre: item.comprobanteNombre || '',
      aceptaReglamento: item.aceptaReglamento || 'si',
      createdAtISO: item.createdAtISO || new Date().toISOString(),
      jugador1: {
        nombre: item.jugador1?.nombre || '',
        apellido: item.jugador1?.apellido || '',
        cedula: item.jugador1?.cedula || '',
        email: item.jugador1?.email || '',
        telefono: item.jugador1?.telefono || '',
        tallaFranela: item.jugador1?.tallaFranela || 'M',
        ladoJuego: item.jugador1?.ladoJuego || 'Derecha',
        categoriaHabitual: item.jugador1?.categoriaHabitual || '',
        torneoActual: item.jugador1?.torneoActual || '',
        historialTorneos: item.jugador1?.historialTorneos || '',
        alergias: item.jugador1?.alergias || '',
        aceptaReglamento: item.jugador1?.aceptaReglamento || 'si'
      },
      jugador2: {
        nombre: item.jugador2?.nombre || '',
        apellido: item.jugador2?.apellido || '',
        cedula: item.jugador2?.cedula || '',
        email: item.jugador2?.email || '',
        telefono: item.jugador2?.telefono || '',
        tallaFranela: item.jugador2?.tallaFranela || 'M',
        ladoJuego: item.jugador2?.ladoJuego || 'Revés',
        categoriaHabitual: item.jugador2?.categoriaHabitual || '',
        torneoActual: item.jugador2?.torneoActual || '',
        historialTorneos: item.jugador2?.historialTorneos || '',
        alergias: item.jugador2?.alergias || '',
        aceptaReglamento: item.jugador2?.aceptaReglamento || 'si'
      }
    });
  };

  // Guardar edición completa de dupla
  const handleSaveEditDupla = async (e) => {
    e.preventDefault();
    if (!editModalData) return;
    if (!editModalData.categoria) {
      alert('Por favor selecciona la categoría de la pareja.');
      return;
    }
    if (!editModalData.jugador1?.nombre?.trim() || !editModalData.jugador2?.nombre?.trim()) {
      alert('Por favor completa al menos los nombres de ambos jugadores.');
      return;
    }

    setSavingEdit(true);
    try {
      await updateRegistration(editModalData.id, editModalData);
      setRegistrations(prev => prev.map(r => r.id === editModalData.id ? { ...editModalData } : r));
      setEditModalData(null);
      setFeedback({ type: 'success', message: '¡Información de la dupla actualizada exitosamente!' });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error('Error al actualizar la dupla:', err);
      setFeedback({ type: 'error', message: 'Error al actualizar los datos de la dupla.' });
    } finally {
      setSavingEdit(false);
    }
  };

  // Abrir modal de observaciones rápidas
  const handleOpenObservationModal = (item) => {
    setObservationModalData({
      id: item.id,
      playerNames: `${item.jugador1?.nombre || ''} y ${item.jugador2?.nombre || ''}`,
      categoria: item.categoria,
      observaciones: item.observaciones || item.metadata?.observaciones || ''
    });
  };

  // Guardar observación rápida en Supabase y local
  const handleSaveObservation = async (e) => {
    e.preventDefault();
    if (!observationModalData) return;
    setSavingObservation(true);
    try {
      const text = observationModalData.observaciones.trim();
      await updateRegistrationObservation(observationModalData.id, text);
      setRegistrations(prev => prev.map(r => r.id === observationModalData.id ? {
        ...r,
        observaciones: text,
        metadata: { ...(r.metadata || {}), observaciones: text }
      } : r));
      setObservationModalData(null);
      setFeedback({ type: 'success', message: '¡Observación guardada con éxito!' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Error guardando observación:', err);
      alert('Error al guardar la observación.');
    } finally {
      setSavingObservation(false);
    }
  };

  // Inscribir nueva pareja directamente desde el Administrador
  const handleCreateDuplaSubmit = async (e) => {
    e.preventDefault();
    if (!newDuplaForm.categoria) {
      alert('Por favor selecciona la categoría oficial de competencia.');
      return;
    }
    if (!newDuplaForm.jugador1?.nombre?.trim() || !newDuplaForm.jugador2?.nombre?.trim()) {
      alert('Por favor completa al menos los nombres de ambos jugadores.');
      return;
    }

    setSavingCreate(true);
    try {
      const res = await saveRegistration(newDuplaForm);
      await fetchData();
      setCreateModalOpen(false);
      setNewDuplaForm(initialNewDupla);
      setFeedback({ 
        type: 'success', 
        message: `¡Pareja inscrita con éxito desde el administrador! (Estatus: ${res.status || newDuplaForm.status})` 
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error('Error al registrar pareja desde admin:', err);
      setFeedback({ type: 'error', message: 'Error al registrar la pareja.' });
    } finally {
      setSavingCreate(false);
    }
  };

  // Guardar configuración de Supabase Cloud
  const handleSaveCloudConfig = (e) => {
    e.preventDefault();
    if (!cloudDbForm.supabaseUrl?.trim() || !cloudDbForm.supabaseAnonKey?.trim()) {
      alert('Por favor ingresa la URL del proyecto Supabase y la clave pública (anon key).');
      return;
    }
    saveCustomSupabaseConfig(cloudDbForm);
    setCloudDbModalOpen(false);
    setFeedback({ type: 'success', message: '¡Configuración de Supabase guardada! Conectando con la base de datos en la nube...' });
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handleClearCloudConfig = () => {
    if (window.confirm('¿Deseas restablecer la configuración de Supabase a los valores locales?')) {
      clearCustomSupabaseConfig();
      window.location.reload();
    }
  };

  // Carga de comprobante en modal de edición
  const handleReceiptUploadEdit = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1048576) {
      alert(`El archivo supera 1 MB (${(file.size / (1024 * 1024)).toFixed(2)} MB). Por favor comprímelo antes de subir.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditModalData(prev => ({
        ...prev,
        comprobantePagoUrl: ev.target.result,
        comprobanteNombre: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  // Carga de comprobante en modal de nueva pareja (Admin)
  const handleReceiptUploadNew = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1048576) {
      alert(`El archivo supera 1 MB (${(file.size / (1024 * 1024)).toFixed(2)} MB). Por favor comprímelo antes de subir.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewDuplaForm(prev => ({
        ...prev,
        comprobantePagoUrl: ev.target.result,
        comprobanteNombre: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  // Guardar o Crear Patrocinador
  const handleSaveSponsorSubmit = async (e) => {
    e.preventDefault();
    if (!sponsorModal.name.trim()) return;

    try {
      await saveSponsor(sponsorModal);
      await loadSponsorsData();
      setSponsorModal(null);
      setFeedback({ type: 'success', message: 'Patrocinador guardado correctamente.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      setFeedback({ type: 'error', message: 'Error guardando patrocinador.' });
    }
  };

  const handleDeleteSponsor = async (id, name) => {
    if (!window.confirm(`¿Eliminar al patrocinador ${name}?`)) return;
    try {
      await deleteSponsor(id);
      await loadSponsorsData();
      setFeedback({ type: 'success', message: 'Patrocinador eliminado.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      setFeedback({ type: 'error', message: 'Error eliminando patrocinador.' });
    }
  };

  // Filtrado de la tabla
  const filteredList = registrations.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.categoria === selectedCategory;
    const itemStatus = (item.status || item.estado || 'preinscrito').toLowerCase();
    const matchesStatus = selectedStatus === 'ALL' || itemStatus === selectedStatus;
    
    const search = searchTerm.toLowerCase();
    const j1Name = `${item.jugador1?.nombre || ''} ${item.jugador1?.apellido || ''}`.toLowerCase();
    const j2Name = `${item.jugador2?.nombre || ''} ${item.jugador2?.apellido || ''}`.toLowerCase();
    const j1Cedula = (item.jugador1?.cedula || '').toLowerCase();
    const j2Cedula = (item.jugador2?.cedula || '').toLowerCase();
    const j1Email = (item.jugador1?.email || '').toLowerCase();
    const j2Email = (item.jugador2?.email || '').toLowerCase();
    const j1Tel = (item.jugador1?.telefono || '').toLowerCase();
    const j2Tel = (item.jugador2?.telefono || '').toLowerCase();
    const refPago = (item.referenciaPago || '').toLowerCase();

    const matchesSearch = 
      j1Name.includes(search) || 
      j2Name.includes(search) || 
      j1Cedula.includes(search) ||
      j2Cedula.includes(search) ||
      j1Email.includes(search) || 
      j2Email.includes(search) ||
      j1Tel.includes(search) ||
      j2Tel.includes(search) ||
      refPago.includes(search);

    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Estadísticas globales
  const totalInscritos = registrations.length;
  const totalConfirmados = registrations.filter(r => (r.status || r.estado || '').toLowerCase() === 'confirmado').length;
  const totalEsperandoPago = registrations.filter(r => (r.status || r.estado || '').toLowerCase() === 'esperando pago').length;
  const totalListaEspera = registrations.filter(r => (r.status || r.estado || '').toLowerCase() === 'lista de espera').length;

  // EXPORTAR A EXCEL (.XLSX) CON TODOS LOS NUEVOS CAMPOS EXHAUSTIVOS
  const exportToExcel = () => {
    if (registrations.length === 0) {
      alert('No hay registros disponibles para exportar.');
      return;
    }

    const dataForSheet = registrations.map((r, index) => ({
      'N°': index + 1,
      'Fecha': r.createdAtFormatted || r.createdAtISO || 'N/A',
      'Categoría': r.categoria,
      'Status': (r.status || r.estado || 'preinscrito').toUpperCase(),
      'Monto': r.monto || '$140',
      'Método de Pago': r.metodoPago || 'No especificado',
      'Referencia / ID Pago': r.referenciaPago || r.referencia_pago || r.referencia || 'Sin referencia',
      'Comprobante Adjunto': r.comprobantePagoUrl ? 'SÍ' : 'NO',
      'Observaciones': r.observaciones || r.metadata?.observaciones || 'Sin observaciones',

      // Jugador 1
      'J1 Nombre y Apellido': `${r.jugador1?.nombre || ''} ${r.jugador1?.apellido || ''}`.trim(),
      'J1 Cédula': r.jugador1?.cedula || '',
      'J1 Email': r.jugador1?.email || '',
      'J1 Teléfono': r.jugador1?.telefono || '',
      'J1 Talla Franela': r.jugador1?.tallaFranela || '',
      'J1 Lado de Juego': r.jugador1?.ladoJuego || '',
      'J1 Categoría Habitual': r.jugador1?.categoriaHabitual || '',
      'J1 Torneo Actual': r.jugador1?.torneoActual || '',
      'J1 Historial Torneos': r.jugador1?.historialTorneos || '',
      'J1 Alergias': r.jugador1?.alergias || '',
      'J1 Acepta Reglamento': r.jugador1?.aceptaReglamento === 'si' ? 'SÍ' : (r.jugador1?.aceptaReglamento || 'NO'),

      // Jugador 2
      'J2 Nombre y Apellido': `${r.jugador2?.nombre || ''} ${r.jugador2?.apellido || ''}`.trim(),
      'J2 Cédula': r.jugador2?.cedula || '',
      'J2 Email': r.jugador2?.email || '',
      'J2 Teléfono': r.jugador2?.telefono || '',
      'J2 Talla Franela': r.jugador2?.tallaFranela || '',
      'J2 Lado de Juego': r.jugador2?.ladoJuego || '',
      'J2 Categoría Habitual': r.jugador2?.categoriaHabitual || '',
      'J2 Torneo Actual': r.jugador2?.torneoActual || '',
      'J2 Historial Torneos': r.jugador2?.historialTorneos || '',
      'J2 Alergias': r.jugador2?.alergias || '',
      'J2 Acepta Reglamento': r.jugador2?.aceptaReglamento === 'si' ? 'SÍ' : (r.jugador2?.aceptaReglamento || 'NO'),

      'Acepta Reglamento Dupla': r.aceptaReglamento === 'si' ? 'SÍ' : 'NO',
      'ID Documento': r.id || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
    worksheet['!cols'] = [
      { wch: 5 },  // N°
      { wch: 20 }, // Fecha
      { wch: 18 }, // Categoría
      { wch: 15 }, // Status
      { wch: 10 }, // Monto
      { wch: 20 }, // Método de Pago
      { wch: 24 }, // Referencia / ID Pago
      { wch: 14 }, // Comprobante
      { wch: 32 }, // Observaciones
      
      // J1
      { wch: 25 }, { wch: 16 }, { wch: 25 }, { wch: 16 }, { wch: 12 },
      { wch: 14 }, { wch: 18 }, { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 12 },
      
      // J2
      { wch: 25 }, { wch: 16 }, { wch: 25 }, { wch: 16 }, { wch: 12 },
      { wch: 14 }, { wch: 18 }, { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 12 },
      
      { wch: 14 }, { wch: 24 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inscripciones Oficiales');

    const fechaActual = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Inscripciones_Copa_Navidad_LMSC_${fechaActual}.xlsx`);
  };

  // EXPORTAR A CSV CON TODAS LAS NUEVAS COLUMNAS ESTRUCTURADAS
  const exportToCSV = () => {
    if (registrations.length === 0) {
      alert('No hay registros para exportar.');
      return;
    }

    const headers = [
      'Nro', 'Fecha', 'Categoria', 'Status', 'Monto', 'Metodo_Pago', 'Referencia_Pago', 'Comprobante_Adjunto', 'Observaciones',
      'J1_Nombre', 'J1_Cedula', 'J1_Email', 'J1_Telefono', 'J1_Talla_Franela', 'J1_Lado_Juego', 'J1_Categoria_Habitual', 'J1_Torneo_Actual', 'J1_Historial_Torneos', 'J1_Alergias', 'J1_Acepta_Reglamento',
      'J2_Nombre', 'J2_Cedula', 'J2_Email', 'J2_Telefono', 'J2_Talla_Franela', 'J2_Lado_Juego', 'J2_Categoria_Habitual', 'J2_Torneo_Actual', 'J2_Historial_Torneos', 'J2_Alergias', 'J2_Acepta_Reglamento',
      'Acepta_Reglamento_Dupla', 'ID_Documento'
    ];

    const clean = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

    const rows = registrations.map((r, i) => [
      i + 1,
      clean(r.createdAtFormatted || r.createdAtISO || ''),
      clean(r.categoria || ''),
      clean((r.status || r.estado || 'preinscrito').toUpperCase()),
      clean(r.monto || '$140'),
      clean(r.metodoPago || ''),
      clean(r.referenciaPago || r.referencia_pago || r.referencia || ''),
      clean(r.comprobantePagoUrl ? 'SI' : 'NO'),
      clean(r.observaciones || r.metadata?.observaciones || ''),

      clean(`${r.jugador1?.nombre || ''} ${r.jugador1?.apellido || ''}`.trim()),
      clean(r.jugador1?.cedula || ''),
      clean(r.jugador1?.email || ''),
      clean(r.jugador1?.telefono || ''),
      clean(r.jugador1?.tallaFranela || ''),
      clean(r.jugador1?.ladoJuego || ''),
      clean(r.jugador1?.categoriaHabitual || ''),
      clean(r.jugador1?.torneoActual || ''),
      clean(r.jugador1?.historialTorneos || ''),
      clean(r.jugador1?.alergias || ''),
      clean(r.jugador1?.aceptaReglamento === 'si' ? 'SI' : 'NO'),

      clean(`${r.jugador2?.nombre || ''} ${r.jugador2?.apellido || ''}`.trim()),
      clean(r.jugador2?.cedula || ''),
      clean(r.jugador2?.email || ''),
      clean(r.jugador2?.telefono || ''),
      clean(r.jugador2?.tallaFranela || ''),
      clean(r.jugador2?.ladoJuego || ''),
      clean(r.jugador2?.categoriaHabitual || ''),
      clean(r.jugador2?.torneoActual || ''),
      clean(r.jugador2?.historialTorneos || ''),
      clean(r.jugador2?.alergias || ''),
      clean(r.jugador2?.aceptaReglamento === 'si' ? 'SI' : 'NO'),

      clean(r.aceptaReglamento === 'si' ? 'SI' : 'NO'),
      clean(r.id || '')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fecha = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Inscripciones_Copa_Navidad_LMSC_${fecha}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper para color de status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmado':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'esperando pago':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'preinscrito':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'lista de espera':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'retirado':
        return 'bg-slate-700 text-slate-300 border-slate-600';
      case 'suspendido':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a389c] via-[#082b7c] to-[#071f5c] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* BARRA SUPERIOR ADMIN */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blue-400/25">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#A3E229]/20 text-[#A3E229] border border-[#A3E229]/40 flex items-center justify-center font-bold shadow-[0_0_20px_rgba(163,226,41,0.25)]">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-black text-white tracking-wide uppercase">
              Panel de Administración Oficial
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/80">
              Copa Navidad LMSC 2026 • Control de Inscripciones, Landing, Cupos y Patrocinadores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden sm:flex flex-col items-end text-right pr-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#A3E229]" />
                {currentUser.nombre || 'Administrador'}
              </span>
              <span className="text-[10px] text-[#A3E229] font-semibold uppercase tracking-wider font-orbitron">
                {currentUser.rol || 'Super Admin'}
              </span>
            </div>
          )}

          {/* Indicador y Selector de Base de Datos en la Nube (Supabase) */}
          <button
            type="button"
            onClick={() => setCloudDbModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              isSupabaseConfigured()
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/25 hover:bg-amber-500/35 text-amber-300 border-amber-500/50 animate-pulse'
            }`}
            title="Ver o configurar conexión a la base de datos en la nube (Supabase)"
          >
            {isSupabaseConfigured() ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">BD Nube: <strong className="text-white font-mono">Supabase ({getSupabaseProjectRef()})</strong></span>
                <span className="sm:hidden">Supabase ✓</span>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">BD: <strong>Local (Conectar Supabase)</strong></span>
                <span className="sm:hidden">Conectar Supabase</span>
              </>
            )}
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#082363]/80 hover:bg-[#0b3b95] text-blue-100 border border-blue-400/30 text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#A3E229]' : 'text-[#A3E229]'}`} />
            <span>Actualizar</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div className={`max-w-7xl mx-auto mb-6 p-4 rounded-xl text-sm flex items-center gap-2 border ${
          feedback.type === 'error' 
            ? 'bg-rose-500/20 text-rose-200 border-rose-500/40' 
            : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
        }`}>
          {feedback.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* PESTAÑAS DE ADMINISTRACIÓN ESTILO ATLÉTICO DE ALTO RENDIMIENTO */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center gap-2.5 border-b border-blue-400/25 pb-3">
        <button
          onClick={() => setActiveTab('inscripciones')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'inscripciones'
              ? 'bg-[#A3E229] text-[#150D8B] font-orbitron font-black shadow-[0_0_20px_rgba(163,226,41,0.5)]'
              : 'bg-[#082363]/80 text-blue-200 hover:text-white border border-blue-400/30 hover:bg-[#0b3b95]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Inscripciones ({totalInscritos})</span>
        </button>

        <button
          onClick={() => setActiveTab('landing')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'landing'
              ? 'bg-[#A3E229] text-[#150D8B] font-orbitron font-black shadow-[0_0_20px_rgba(163,226,41,0.5)]'
              : 'bg-[#082363]/80 text-blue-200 hover:text-white border border-blue-400/30 hover:bg-[#0b3b95]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Contenidos & Landing</span>
        </button>

        <button
          onClick={() => setActiveTab('cupos')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'cupos'
              ? 'bg-[#A3E229] text-[#150D8B] font-orbitron font-black shadow-[0_0_20px_rgba(163,226,41,0.5)]'
              : 'bg-[#082363]/80 text-blue-200 hover:text-white border border-blue-400/30 hover:bg-[#0b3b95]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Control de Cupos</span>
        </button>

        <button
          onClick={() => setActiveTab('patrocinadores')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'patrocinadores'
              ? 'bg-[#A3E229] text-[#150D8B] font-orbitron font-black shadow-[0_0_20px_rgba(163,226,41,0.5)]'
              : 'bg-[#082363]/80 text-blue-200 hover:text-white border border-blue-400/30 hover:bg-[#0b3b95]'
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>Patrocinadores ({sponsorsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'roles'
              ? 'bg-[#A3E229] text-[#150D8B] font-orbitron font-black shadow-[0_0_20px_rgba(163,226,41,0.5)]'
              : 'bg-[#082363]/80 text-blue-200 hover:text-white border border-blue-400/30 hover:bg-[#0b3b95]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Usuarios & Roles ({adminUsersList.length})</span>
        </button>
      </div>

      {/* PESTAÑA: CONTENIDOS & LANDING */}
      {activeTab === 'landing' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <form onSubmit={handleSaveLandingSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-gold-400" />
                  Editor de Contenidos & Textos de la Landing
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Modifica en tiempo real los textos del Hero, subtítulos, cuentas de pago y sube el PDF del Reglamento Oficial.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingLanding}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-900 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-glow-gold transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{savingLanding ? 'Guardando...' : 'Guardar Todo'}</span>
              </button>
            </div>

            {/* SECCIÓN A: TEXTOS PRINCIPALES DEL HERO & LISTADO */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">
                1. Textos del Hero y Portada
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cintillo Superior (Encima del Título)
                  </label>
                  <input
                    type="text"
                    value={landingForm.heroCintillo || ''}
                    onChange={(e) => setLandingForm({ ...landingForm, heroCintillo: e.target.value })}
                    placeholder="Cupos Limitados"
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título Principal del Hero
                  </label>
                  <input
                    type="text"
                    value={landingForm.heroTitulo || ''}
                    onChange={(e) => setLandingForm({ ...landingForm, heroTitulo: e.target.value })}
                    placeholder="¡Inscripciones abiertas!"
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fechas Oficiales (Cuadro Banner)
                  </label>
                  <input
                    type="text"
                    value={landingForm.heroFechas || ''}
                    onChange={(e) => setLandingForm({ ...landingForm, heroFechas: e.target.value })}
                    placeholder="del 14 al 19 de diciembre"
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sede Oficial (Cuadro Banner)
                  </label>
                  <input
                    type="text"
                    value={landingForm.heroSede || ''}
                    onChange={(e) => setLandingForm({ ...landingForm, heroSede: e.target.value })}
                    placeholder="La Marina SC, Lechería"
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                  />
                </div>

              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subtítulo Explicativo del Hero
                </label>
                <textarea
                  rows="3"
                  value={landingForm.heroSubtitulo || ''}
                  onChange={(e) => setLandingForm({ ...landingForm, heroSubtitulo: e.target.value })}
                  placeholder="Cierra el año con el mejor nivel competitivo en una experiencia diseñada para que el atleta sea el absoluto protagonista..."
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 text-white border border-slate-700 text-xs sm:text-sm resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subtítulo de la Sección "Parejas Confirmadas"
                </label>
                <input
                  type="text"
                  value={landingForm.parejasSubtitulo || ''}
                  onChange={(e) => setLandingForm({ ...landingForm, parejasSubtitulo: e.target.value })}
                  placeholder="Listado oficial de duplas con inscripción y pago verificado por el comité organizador"
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                />
              </div>
            </div>

            {/* SECCIÓN 2: FOTOS DEL BANNER HERO PRINCIPAL */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    2. Fotos del Banner Hero Principal (Flyer Deportivo o Cuadrícula)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Selecciona el estilo de presentación en el Hero y personaliza las fotografías oficiales del torneo.
                  </p>
                </div>
              </div>

              {/* SELECTOR DE ESTILO VISUAL: MONTAJE FLYER VS CUADRÍCULA CLÁSICA */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-navy-900/60 to-blue-950/40 border border-blue-400/40 shadow-inner">
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Estilo de Exhibición en el Banner Hero:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Opción 1: Atletas Oficiales Sin Fondo (Integrados al Banner) */}
                  <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    (landingForm.heroVisualMode || 'banner') !== 'grid'
                      ? 'bg-[#A3E229]/15 border-[#A3E229] shadow-[0_0_20px_rgba(163,226,41,0.2)]'
                      : 'bg-navy-900/70 border-slate-700/80 hover:border-slate-500'
                  }`}>
                    <input 
                      type="radio"
                      name="heroVisualMode"
                      value="banner"
                      checked={(landingForm.heroVisualMode || 'banner') !== 'grid'}
                      onChange={() => setLandingForm(prev => ({ ...prev, heroVisualMode: 'banner' }))}
                      className="mt-1 text-[#A3E229] focus:ring-[#A3E229]"
                    />
                    <div>
                      <span className="text-xs sm:text-sm font-black font-orbitron text-white block">
                        Atletas Oficiales Sin Fondo (Integrados al Banner)
                      </span>
                      <span className="text-[11px] text-blue-200/90 block mt-0.5">
                        Imágenes transparentes sin marcos ni cuadros, integradas directamente sobre la cancha del hero.
                      </span>
                    </div>
                  </label>

                  {/* Opción 2: Cuadrícula Clásica (4 Tarjetas) */}
                  <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    landingForm.heroVisualMode === 'grid'
                      ? 'bg-[#A3E229]/15 border-[#A3E229] shadow-[0_0_20px_rgba(163,226,41,0.2)]'
                      : 'bg-navy-900/70 border-slate-700/80 hover:border-slate-500'
                  }`}>
                    <input 
                      type="radio"
                      name="heroVisualMode"
                      value="grid"
                      checked={landingForm.heroVisualMode === 'grid'}
                      onChange={() => setLandingForm(prev => ({ ...prev, heroVisualMode: 'grid' }))}
                      className="mt-1 text-[#A3E229] focus:ring-[#A3E229]"
                    />
                    <div>
                      <span className="text-xs sm:text-sm font-black font-orbitron text-white block">
                        Cuadrícula Clásica (4 Tarjetas con Categorías)
                      </span>
                      <span className="text-[11px] text-blue-200/90 block mt-0.5">
                        Versión anterior con 4 fotos individuales en recuadros separados.
                      </span>
                    </div>
                  </label>

                </div>
              </div>

              {/* VISTA Y CONTROLES SEGÚN EL MODO SELECCIONADO */}
              {(landingForm.heroVisualMode || 'banner') !== 'grid' ? (
                /* CONTROLES PARA ATLETAS SIN FONDO */
                <div className="bg-navy-900/90 p-4 rounded-2xl border border-slate-700/80 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-orbitron">
                        <Sparkles className="w-4 h-4 text-[#A3E229]" />
                        Composición Oficial de Atletas (Sin Fondo)
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Imágenes PNG transparentes preparadas a partir de las fotos oficiales de la carpeta materiales.
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#A3E229]/20 text-[#A3E229] border border-[#A3E229]/50">
                      Sin Cuadros ni Marcos
                    </span>
                  </div>

                  {/* SELECTOR RÁPIDO ENTRE BANNER 2 Y BANNER 1 */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">Variante rápida:</span>
                    <button
                      type="button"
                      onClick={() => setLandingForm(prev => ({ ...prev, heroBannerImage: './assets/hero_banner_oficial.png' }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        (landingForm.heroBannerImage || './assets/hero_banner_oficial.png').includes('hero_banner_oficial') || (landingForm.heroBannerImage || '').includes('banner2')
                          ? 'bg-[#A3E229] text-[#150D8B] shadow-md'
                          : 'bg-navy-800 text-slate-300 hover:text-white border border-slate-700'
                      }`}
                    >
                      Imagen Oficial (Atletas LMSC)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLandingForm(prev => ({ ...prev, heroBannerImage: './assets/banner1.png' }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        (landingForm.heroBannerImage || '').includes('banner1')
                          ? 'bg-[#A3E229] text-[#150D8B] shadow-md'
                          : 'bg-navy-800 text-slate-300 hover:text-white border border-slate-700'
                      }`}
                    >
                      Banner 1 (Panorámico)
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-4 p-3 rounded-xl bg-[#071f5c]/60 border border-blue-400/30">
                    <div className="relative w-48 h-32 sm:w-56 sm:h-36 rounded-xl overflow-hidden border border-blue-400/40 shadow-inner shrink-0 bg-gradient-to-b from-[#0a389c] to-[#071f5c] flex items-center justify-center p-2">
                      <img 
                        src={landingForm.heroBannerImage || './assets/hero_banner_oficial.png'} 
                        alt="Atletas Copa Navidad LMSC" 
                        className="w-full h-full object-contain filter drop-shadow-md"
                      />
                    </div>

                    <div className="flex-1 space-y-3 text-left w-full">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300 uppercase">
                          Ruta o Enlace de la Imagen PNG Sin Fondo
                        </label>
                        <input
                          type="text"
                          value={landingForm.heroBannerImage && landingForm.heroBannerImage.startsWith('data:') ? '(Imagen personalizada subida en base64)' : (landingForm.heroBannerImage || './assets/hero_banner_oficial.png')}
                          onChange={(e) => setLandingForm(prev => ({ ...prev, heroBannerImage: e.target.value }))}
                          placeholder="./assets/hero_banner_oficial.png o https://..."
                          className="w-full px-3 py-2 rounded-xl bg-navy-800 text-white border border-slate-600 text-xs truncate"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <label className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-md">
                          <UploadCloud className="w-4 h-4" />
                          <span>Subir Imagen PNG (&lt; 1 MB)</span>
                          <input
                            type="file"
                            accept="image/png,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 1048576) {
                                alert(`La imagen supera 1 MB (${(file.size / (1024 * 1024)).toFixed(2)} MB). Por favor comprímela antes de subir.`);
                                e.target.value = '';
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setLandingForm(prev => ({ ...prev, heroBannerImage: ev.target.result }));
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setLandingForm(prev => ({ ...prev, heroBannerImage: './assets/hero_banner_oficial.png' }))}
                          className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restaurar Oficial</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* CONTROLES PARA LA CUADRÍCULA CLÁSICA (4 TARJETAS) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(landingForm.heroFotos && landingForm.heroFotos.length === 4 
                  ? landingForm.heroFotos 
                  : DEFAULT_HERO_FOTOS
                ).map((foto, fIdx) => (
                  <div key={foto.id || fIdx} className="bg-navy-900/90 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                    <div className="flex items-start gap-3">
                      {/* Preview en miniatura */}
                      <div className="relative w-24 h-32 rounded-xl overflow-hidden border border-blue-400/40 bg-[#071f5c] shrink-0 shadow-md">
                        <img 
                          src={foto.imagen} 
                          alt={foto.categoria || `Foto ${fIdx + 1}`} 
                          style={{ objectPosition: foto.objectPosition || 'center 20%' }}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#071f5c] to-transparent"></div>
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-[#A3E229] text-[#150D8B] truncate max-w-[85px]">
                          {foto.badge || `Foto ${fIdx + 1}`}
                        </span>
                        <span className="absolute bottom-1 left-1 right-1 text-[8px] font-bold text-white truncate">
                          {foto.categoria}
                        </span>
                      </div>

                      {/* Campos de texto */}
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-300 uppercase">
                              Etiqueta / Badge
                            </label>
                            <input
                              type="text"
                              value={foto.badge || ''}
                              onChange={(e) => handleHeroPhotoChange(fIdx, 'badge', e.target.value)}
                              placeholder="Ej: Masculino"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-navy-800 text-white border border-slate-600 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-300 uppercase">
                              Categoría / Subtexto
                            </label>
                            <input
                              type="text"
                              value={foto.categoria || ''}
                              onChange={(e) => handleHeroPhotoChange(fIdx, 'categoria', e.target.value)}
                              placeholder="Ej: 2da a 7ma"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-navy-800 text-white border border-slate-600 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-300 uppercase">
                            Alineación Vertical (object-position)
                          </label>
                          <select
                            value={foto.objectPosition || 'center 20%'}
                            onChange={(e) => handleHeroPhotoChange(fIdx, 'objectPosition', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-navy-800 text-white border border-slate-600 text-xs"
                          >
                            <option value="center 10%">Arriba (center 10%)</option>
                            <option value="center 20%">Arriba Medio (center 20%)</option>
                            <option value="center 32%">Centro Superior (center 32%)</option>
                            <option value="center 46%">Centro Exacto (center 46%)</option>
                            <option value="center center">Centro (center center)</option>
                            <option value="center 70%">Inferior (center 70%)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-300 uppercase">
                            URL / Ruta de Imagen
                          </label>
                          <input
                            type="text"
                            value={foto.imagen && foto.imagen.startsWith('data:') ? '(Imagen personalizada subida en base64)' : (foto.imagen || '')}
                            onChange={(e) => handleHeroPhotoChange(fIdx, 'imagen', e.target.value)}
                            placeholder="./assets/... o https://..."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-navy-800 text-white border border-slate-600 text-xs truncate"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción para cada foto */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <label className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Subir Imagen (&lt; 1 MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleHeroPhotoUpload(fIdx, e)}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRestoreHeroPhoto(fIdx)}
                        className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                        title="Restaurar valores de fábrica para esta foto"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restaurar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

            {/* SECCIÓN 3: INVERSIÓN Y BENEFICIOS INCLUIDOS */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#A3E229]" />
                    3. Inversión Oficial y Beneficios de Inscripción
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modifica el monto de inversión ($140), desglose ($70 por jugador), garantía de juegos y las viñetas oficiales.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleRestoreBenefits}
                  className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs font-bold text-slate-300 border border-slate-700 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Viñetas Oficiales</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Inversión Total por Dupla
                  </label>
                  <input
                    type="text"
                    value={landingForm.heroInversion || ''}
                    onChange={(e) => setLandingForm({ ...landingForm, heroInversion: e.target.value, montoInscripcion: e.target.value.split(' ')[0] || e.target.value })}
                    placeholder="$140 por dupla"
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Ej: $140 por dupla</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Desglose por Jugador
                  </label>
                  <input
                    type="text"
                    value={landingForm.heroInversionDesglose || ''}
                    onChange={(e) => setLandingForm({ ...landingForm, heroInversionDesglose: e.target.value })}
                    placeholder="$70 por jugador"
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Ej: $70 por jugador</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Garantía de Juegos
                  </label>
                  <input
                    type="text"
                    value={landingForm.heroJuegosGarantizados || ''}
                    onChange={(e) => setLandingForm({ ...landingForm, heroJuegosGarantizados: e.target.value })}
                    placeholder="2 juegos garantizados"
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Hero y Formulario</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Badge de Premios
                  </label>
                  <input
                    type="text"
                    value={landingForm.heroPremios || ''}
                    onChange={(e) => setLandingForm({ ...landingForm, heroPremios: e.target.value })}
                    placeholder="Premios en Metálico & Trofeos Oficiales"
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Cintillo distintivo</span>
                </div>
              </div>

              {/* Lista editable de Beneficios / Viñetas */}
              <div className="bg-navy-900/80 p-4 rounded-2xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white uppercase tracking-wider">
                    Viñetas: ¿Qué incluye la inscripción oficial?
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="px-2.5 py-1 rounded-lg bg-[#A3E229] hover:bg-[#b6f23d] text-[#150D8B] text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Viñeta</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(landingForm.beneficiosInversion && landingForm.beneficiosInversion.length > 0
                    ? landingForm.beneficiosInversion
                    : DEFAULT_BENEFICIOS_INVERSION
                  ).map((beneficio, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2 bg-navy-800 p-2.5 rounded-xl border border-slate-700">
                      <span className="w-5 h-5 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center text-[10px] font-black shrink-0">
                        {bIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={beneficio}
                        onChange={(e) => handleBenefitChange(bIdx, e.target.value)}
                        placeholder="Descripción del beneficio..."
                        className="flex-1 bg-transparent text-white text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(bIdx)}
                        className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors"
                        title="Eliminar este beneficio"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: DETALLES DE CADA MÉTODO DE PAGO */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>4. Cuentas y Nombres de Métodos de Pago</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Edita el <strong className="text-white">Nombre</strong> y los <strong className="text-white">Datos de Pago</strong> de cada método. Se reflejan inmediatamente en la ventana de confirmación tras inscribirse una dupla y en la web pública.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* MÉTODO 1: PAGO MÓVIL */}
                <div className="bg-navy-900/90 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Método 1</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Tasa BCV
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Nombre del Método
                      </label>
                      <input
                        type="text"
                        value={landingForm.pagoMovilNombre ?? 'Pago Móvil'}
                        onChange={(e) => setLandingForm({ ...landingForm, pagoMovilNombre: e.target.value })}
                        placeholder="Ej: Pago Móvil"
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white font-semibold border border-slate-700 text-xs focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Subtítulo / Etiqueta
                      </label>
                      <input
                        type="text"
                        value={landingForm.pagoMovilSubtitulo ?? 'Tasa oficial BCV del día'}
                        onChange={(e) => setLandingForm({ ...landingForm, pagoMovilSubtitulo: e.target.value })}
                        placeholder="Ej: Tasa oficial BCV"
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-slate-300 border border-slate-700 text-xs focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Cuentas y Datos Bancarios (Banco, Cédula, Teléfono)
                    </label>
                    <textarea
                      rows="4"
                      value={landingForm.pagoMovilDetalle || ''}
                      onChange={(e) => setLandingForm({ ...landingForm, pagoMovilDetalle: e.target.value })}
                      placeholder="Banco: Banco Plaza&#10;Cédula: 16.248.462&#10;Teléfono: 0414-8188308"
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 font-mono text-slate-200 border border-slate-700 text-xs focus:border-emerald-400 focus:outline-none"
                    ></textarea>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Tip: Escribe en formato "Etiqueta: Valor" para que el jugador tenga botones de copia rápida.
                    </span>
                  </div>
                </div>

                {/* MÉTODO 2: ZELLE */}
                <div className="bg-navy-900/90 p-4 rounded-2xl border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Método 2</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      USD Directo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Nombre del Método
                      </label>
                      <input
                        type="text"
                        value={landingForm.zelleNombre ?? 'Zelle'}
                        onChange={(e) => setLandingForm({ ...landingForm, zelleNombre: e.target.value })}
                        placeholder="Ej: Zelle"
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white font-semibold border border-slate-700 text-xs focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Subtítulo / Etiqueta
                      </label>
                      <input
                        type="text"
                        value={landingForm.zelleSubtitulo ?? 'Dólares USD directos'}
                        onChange={(e) => setLandingForm({ ...landingForm, zelleSubtitulo: e.target.value })}
                        placeholder="Ej: Sin comisiones"
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-slate-300 border border-slate-700 text-xs focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Cuentas y Datos Zelle (Correo, Titular)
                    </label>
                    <textarea
                      rows="4"
                      value={landingForm.zelleDetalle || ''}
                      onChange={(e) => setLandingForm({ ...landingForm, zelleDetalle: e.target.value })}
                      placeholder="Correo Zelle: Armasveronica@gmail.com&#10;Titular: Verónica De Iglesias"
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 font-mono text-slate-200 border border-slate-700 text-xs focus:border-purple-400 focus:outline-none"
                    ></textarea>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      El correo y titular oficial para pagos internacionales vía Zelle.
                    </span>
                  </div>
                </div>

                {/* MÉTODO 3: CUENTA INTERNACIONAL */}
                <div className="bg-navy-900/90 p-4 rounded-2xl border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Método 3</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Panamá / Wire / ACH
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Nombre del Método
                      </label>
                      <input
                        type="text"
                        value={landingForm.cuentaInternacionalNombre ?? 'Cuenta Internacional'}
                        onChange={(e) => setLandingForm({ 
                          ...landingForm, 
                          cuentaInternacionalNombre: e.target.value,
                          banescoPanamaNombre: e.target.value
                        })}
                        placeholder="Ej: Cuenta Internacional"
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white font-semibold border border-slate-700 text-xs focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Subtítulo / Etiqueta
                      </label>
                      <input
                        type="text"
                        value={landingForm.cuentaInternacionalSubtitulo ?? 'Banco General Panamá (Ahorros)'}
                        onChange={(e) => setLandingForm({ ...landingForm, cuentaInternacionalSubtitulo: e.target.value })}
                        placeholder="Ej: Banco General Panamá"
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-slate-300 border border-slate-700 text-xs focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Cuentas y Datos (Banco, Titular, Tipo, Número)
                    </label>
                    <textarea
                      rows="4"
                      value={landingForm.cuentaInternacionalDetalle || landingForm.banescoPanamaDetalle || ''}
                      onChange={(e) => setLandingForm({ 
                        ...landingForm, 
                        cuentaInternacionalDetalle: e.target.value,
                        banescoPanamaDetalle: e.target.value
                      })}
                      placeholder="Banco: Banco General Panamá&#10;Beneficiario: Verónica Armas&#10;Cuenta de ahorros: 04-43-00-002370-4"
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 font-mono text-slate-200 border border-slate-700 text-xs focus:border-blue-400 focus:outline-none"
                    ></textarea>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Datos de cuenta internacional / Panamá para transferencias bancarias.
                    </span>
                  </div>
                </div>

                {/* MÉTODO 4: BINANCE */}
                <div className="bg-navy-900/90 p-4 rounded-2xl border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Método 4</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Cripto / Pay ID
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Nombre del Método
                      </label>
                      <input
                        type="text"
                        value={landingForm.binancePayNombre ?? 'Binance'}
                        onChange={(e) => setLandingForm({ ...landingForm, binancePayNombre: e.target.value })}
                        placeholder="Ej: Binance"
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white font-semibold border border-slate-700 text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Subtítulo / Etiqueta
                      </label>
                      <input
                        type="text"
                        value={landingForm.binancePaySubtitulo ?? 'Binance Pay / USDT'}
                        onChange={(e) => setLandingForm({ ...landingForm, binancePaySubtitulo: e.target.value })}
                        placeholder="Ej: Pay ID / USDT"
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-slate-300 border border-slate-700 text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Cuentas y Datos Binance (Usuario, Binance ID)
                    </label>
                    <textarea
                      rows="4"
                      value={landingForm.binancePayDetalle || ''}
                      onChange={(e) => setLandingForm({ ...landingForm, binancePayDetalle: e.target.value })}
                      placeholder="Usuario: User-845f5&#10;ID Binance: 1136516403&#10;Moneda: USDT"
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 font-mono text-slate-200 border border-slate-700 text-xs focus:border-amber-400 focus:outline-none"
                    ></textarea>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      ID de Binance Pay y usuario de la cuenta para transferencias en USDT.
                    </span>
                  </div>
                </div>

              </div>

              {/* OPCIÓN ADICIONAL: EFECTIVO EN CLUB */}
              <div className="bg-navy-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="mostrarEfectivo"
                      checked={!!landingForm.mostrarEfectivo}
                      onChange={(e) => setLandingForm({ ...landingForm, mostrarEfectivo: e.target.checked })}
                      className="w-4 h-4 rounded text-[#A3E229] focus:ring-[#A3E229] bg-navy-950 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="mostrarEfectivo" className="text-xs font-bold text-white cursor-pointer">
                      Habilitar método adicional de "Efectivo en Taquilla / Club" en la ventana de confirmación
                    </label>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Opcional
                  </span>
                </div>

                {landingForm.mostrarEfectivo && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Nombre del Método
                      </label>
                      <input
                        type="text"
                        value={landingForm.efectivoNombre ?? 'Efectivo'}
                        onChange={(e) => setLandingForm({ ...landingForm, efectivoNombre: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white font-semibold border border-slate-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Lugar y Horarios de Atención
                      </label>
                      <textarea
                        rows="2"
                        value={landingForm.efectivoDetalle || ''}
                        onChange={(e) => setLandingForm({ ...landingForm, efectivoDetalle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 font-mono text-slate-200 border border-slate-700 text-xs"
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN 5: GESTIÓN DE REGLAMENTO OFICIAL (PDF < 1MB & ENLACE & TEXTO) */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                5. Reglamento Oficial del Club y Torneo
              </h3>
              <p className="text-xs text-slate-400">
                Puedes adjuntar el archivo PDF oficial (&lt; 1 MB), ingresar un enlace web externo y/o editar el texto del reglamento.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Carga de PDF */}
                <div className="bg-navy-900 p-4 rounded-2xl border border-slate-700">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Subir Archivo PDF del Reglamento (&lt; 1 MB)
                  </label>

                  {landingForm.reglamentoPdfData ? (
                    <div className="p-3 rounded-xl bg-navy-800 border border-emerald-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-6 h-6 text-gold-400 shrink-0" />
                        <div className="truncate text-xs">
                          <p className="font-bold text-white truncate">{landingForm.reglamentoNombre || 'Reglamento_Oficial.pdf'}</p>
                          <span className="text-emerald-400 text-[11px]">PDF cargado en sistema</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={landingForm.reglamentoPdfData}
                          download={landingForm.reglamentoNombre || 'Reglamento.pdf'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                          title="Descargar"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={handleRemoveReglamentoPdf}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400"
                          title="Eliminar PDF"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-gold-500/60 rounded-xl bg-navy-950/60 cursor-pointer text-center transition-colors">
                      <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs font-medium text-slate-300">Seleccionar PDF del Reglamento</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Máximo 1 MB</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleReglamentoPdfUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Enlace Web Externo al Reglamento */}
                <div className="bg-navy-900 p-4 rounded-2xl border border-slate-700 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Enlace Web Externo al Reglamento (Opcional)
                    </label>
                    <input
                      type="url"
                      value={landingForm.reglamentoUrl || ''}
                      onChange={(e) => setLandingForm({ ...landingForm, reglamentoUrl: e.target.value })}
                      placeholder="https://drive.google.com/... o https://fvp.com.ve/reglamento"
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-800 text-white border border-slate-700 text-xs sm:text-sm"
                    />
                    <span className="text-[11px] text-slate-500 mt-2 block">
                      Si proporcionas una URL externa, los jugadores tendrán un botón directo para visitarla.
                    </span>
                  </div>
                </div>

              </div>

              {/* Texto Completo del Reglamento */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Texto Transcrito del Reglamento Oficial
                </label>
                <textarea
                  rows="6"
                  value={landingForm.reglamentoTexto || ''}
                  onChange={(e) => setLandingForm({ ...landingForm, reglamentoTexto: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-900 font-sans text-slate-200 border border-slate-700 text-xs sm:text-sm leading-relaxed"
                  placeholder="Escribe o pega aquí las cláusulas del reglamento..."
                ></textarea>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingLanding}
                className="px-8 py-3.5 rounded-2xl bg-[#A3E229] hover:bg-[#b6f23d] text-[#150D8B] font-orbitron font-black text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(163,226,41,0.45)] transition-all uppercase tracking-wider"
              >
                <Save className="w-5 h-5 text-[#150D8B]" />
                <span>{savingLanding ? 'Guardando en Firestore...' : 'Guardar y Publicar Cambios'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* PESTAÑA: CUPOS */}
      {activeTab === 'cupos' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gold-400" />
                  Cupos Disponibles por Categoría (Límite: {limits.defaultMax || 24} parejas)
                </h2>
                <p className="text-xs text-slate-400">
                  Al completar los cupos disponibles, los nuevos inscritos pasan automáticamente a <strong>Lista de Espera</strong>.
                </p>
              </div>

              <button
                onClick={() => setEditingLimits(!editingLimits)}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-bold text-gold-300 border border-gold-500/30"
              >
                {editingLimits ? 'Cerrar Edición' : 'Modificar Límite General'}
              </button>
            </div>

            {editingLimits && (
              <form onSubmit={handleSaveLimits} className="mb-6 p-4 rounded-2xl bg-navy-900 border border-gold-500/40 flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cantidad máxima de parejas por defecto:
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="128"
                    value={limits.defaultMax || 24}
                    onChange={(e) => setLimits(prev => ({ ...prev, defaultMax: parseInt(e.target.value) || 24 }))}
                    className="w-full px-3 py-2 rounded-xl bg-navy-800 text-white border border-slate-700 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Guardar Cupos
                </button>
              </form>
            )}

            {/* GRID DE CUPOS POR CATEGORÍA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIAS.map(cat => {
                const max = limits[cat.label] || limits.defaultMax || DEFAULT_MAX_PAIRS_PER_CATEGORY;
                const catRegistrations = registrations.filter(r => r.categoria === cat.label && r.status !== 'retirado');
                const confirmados = catRegistrations.filter(r => (r.status || r.estado || '').toLowerCase() === 'confirmado').length;
                const esperando = catRegistrations.filter(r => (r.status || r.estado || '').toLowerCase() === 'esperando pago').length;
                const enListaEspera = catRegistrations.filter(r => (r.status || r.estado || '').toLowerCase() === 'lista de espera').length;
                
                const ocupados = confirmados + esperando;
                const disponibles = Math.max(0, max - ocupados);
                const porcentaje = Math.min(100, Math.round((ocupados / max) * 100));

                return (
                  <div key={cat.id} className="bg-navy-800/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{cat.label}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          disponibles === 0 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                            : disponibles <= 5
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {disponibles === 0 ? 'COMPLETO' : `${disponibles} DISPONIBLES`}
                        </span>
                      </div>

                      <div className="mt-3 flex items-baseline justify-between text-xs text-slate-300">
                        <span>Ocupados: <strong>{ocupados}</strong> / {max}</span>
                        <span className="font-semibold text-emerald-400">{confirmados} Confirmados</span>
                      </div>

                      <div className="w-full h-2.5 bg-navy-900 rounded-full overflow-hidden mt-2 border border-slate-700">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            porcentaje >= 100 ? 'bg-red-500' : porcentaje >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${porcentaje}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Esperando pago: <strong className="text-amber-300">{esperando}</strong></span>
                      <span>En lista de espera: <strong className="text-purple-300">{enListaEspera}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: PATROCINADORES */}
      {activeTab === 'patrocinadores' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-gold-400" />
                  Gestión y Orden de Patrocinadores & Aliados
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Asigna logos, enlaces externos y define el <strong className="text-white">orden exacto de aparición</strong> en la web. Arrastra las tarjetas o usa los controles numéricos y flechas.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {savingSponsorOrder && (
                  <span className="text-xs text-[#A3E229] flex items-center gap-1.5 bg-[#A3E229]/10 px-3 py-1.5 rounded-xl border border-[#A3E229]/30 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A3E229]" />
                    <span>Guardando orden...</span>
                  </span>
                )}
                <button
                  onClick={() => setSponsorModal({ id: '', name: '', tier: 'Auspiciador Oficial', logo: '', link: 'https://' })}
                  className="px-4 py-2.5 rounded-xl bg-[#A3E229] hover:bg-[#b6f23d] text-[#150D8B] text-xs font-orbitron font-black flex items-center gap-2 shadow-[0_0_20px_rgba(163,226,41,0.4)] transition-all uppercase"
                >
                  <Plus className="w-4 h-4 text-[#150D8B]" />
                  <span>Agregar Patrocinador</span>
                </button>
              </div>
            </div>

            {/* BARRA INFORMATIVA DE ORDEN */}
            <div className="bg-navy-900/90 border border-slate-700/80 rounded-2xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#A3E229]/15 border border-[#A3E229]/30 flex items-center justify-center text-[#A3E229] shrink-0">
                  <ArrowUpDown className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Orden de visualización oficial ({sponsorsList.length} patrocinadores)</span>
                    <span className="px-2 py-0.2 text-[10px] rounded bg-gold-400/20 text-gold-400 border border-gold-400/30">En vivo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    El patrocinador en el <strong className="text-white">Puesto #1</strong> aparecerá primero a la izquierda en la landing page. Usa las flechas <strong className="text-slate-200">◀ ▶</strong>, selecciona el número directo o arrastra cualquier tarjeta.
                  </p>
                </div>
              </div>
            </div>

            {sponsorsList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-navy-900/40 rounded-2xl border border-slate-800">
                <Handshake className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm">No hay patrocinadores registrados.</p>
                <button
                  onClick={() => setSponsorModal({ id: '', name: '', tier: 'Auspiciador Oficial', logo: '', link: 'https://' })}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#A3E229] text-[#150D8B] text-xs font-bold inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar el primer patrocinador</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sponsorsList.map((sp, index) => (
                  <div
                    key={sp.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`bg-navy-800/80 p-5 rounded-2xl border flex flex-col justify-between transition-all duration-200 cursor-default ${
                      draggedSponsorIdx === index 
                        ? 'opacity-40 border-[#A3E229] ring-2 ring-[#A3E229]/60 scale-[0.98]' 
                        : 'border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      {/* HEADER DE LA TARJETA: POSICIÓN Y CONTROLES DE ORDEN */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <span 
                            className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-white p-1 rounded hover:bg-navy-900 transition-colors"
                            title="Arrastra para mover de lugar"
                          >
                            <GripVertical className="w-4 h-4" />
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-[#150D8B] text-[#A3E229] border border-[#A3E229]/40 font-mono font-black text-xs shadow-sm">
                            #{index + 1}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#A3E229]/15 text-[#A3E229] border border-[#A3E229]/30 truncate max-w-[110px]">
                            {sp.tier}
                          </span>
                        </div>

                        {/* CONTROLES RÁPIDOS DE REORDENAMIENTO */}
                        <div className="flex items-center gap-1 bg-navy-950/80 p-1 rounded-xl border border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleMoveSponsor(index, -1)}
                            disabled={index === 0}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-xs font-bold ${
                              index === 0 
                                ? 'text-slate-600 cursor-not-allowed bg-transparent' 
                                : 'text-slate-300 hover:text-white hover:bg-navy-800 active:scale-95'
                            }`}
                            title="Mover antes / izquierda"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          <select
                            value={index + 1}
                            onChange={(e) => handleSetSponsorPosition(index, e.target.value)}
                            className="bg-navy-900 text-[#A3E229] font-mono font-bold text-xs px-1.5 py-1 rounded-md border border-slate-700 focus:border-[#A3E229] focus:outline-none cursor-pointer"
                            title="Cambiar a posición exacta"
                          >
                            {sponsorsList.map((_, pIdx) => (
                              <option key={pIdx} value={pIdx + 1}>
                                Puesto #{pIdx + 1}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleMoveSponsor(index, 1)}
                            disabled={index === sponsorsList.length - 1}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-xs font-bold ${
                              index === sponsorsList.length - 1 
                                ? 'text-slate-600 cursor-not-allowed bg-transparent' 
                                : 'text-slate-300 hover:text-white hover:bg-navy-800 active:scale-95'
                            }`}
                            title="Mover después / derecha"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* VISTA PREVIA DEL LOGO */}
                      <div className="h-16 flex items-center justify-center p-2 bg-navy-900 rounded-xl border border-slate-800 my-2">
                        {sp.logo ? (
                          <img 
                            src={sp.logo} 
                            alt={sp.name} 
                            style={{ height: `${sp.logoHeight || 65}px`, maxHeight: '60px' }}
                            className="max-h-full max-w-full object-contain" 
                          />
                        ) : (
                          <span className="text-xs text-slate-500">Sin logo asignado</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{sp.name}</h4>
                        {sp.link && (
                          <a href={sp.link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#A3E229] transition-colors" title={sp.link}>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{sp.link || 'Sin enlace'}</p>

                      {/* CONTROL RÁPIDO DE TAMAÑO DEL LOGO */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 bg-navy-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                        <span>Tamaño en web: <strong className="text-gold-400 font-mono font-bold">{sp.logoHeight || 65}px</strong></span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickResizeSponsor(sp, -5)}
                            className="w-6 h-6 rounded-lg bg-navy-800 text-slate-300 hover:text-white border border-slate-700 font-bold flex items-center justify-center text-xs transition-colors"
                            title="Reducir 5px"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickResizeSponsor(sp, 5)}
                            className="w-6 h-6 rounded-lg bg-navy-800 text-slate-300 hover:text-white border border-slate-700 font-bold flex items-center justify-center text-xs transition-colors"
                            title="Aumentar 5px"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSponsorModal({ ...sp, logoHeight: sp.logoHeight || 65 })}
                        className="p-1.5 rounded-lg bg-navy-700 text-slate-300 hover:text-gold-400 text-xs flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSponsor(sp.id, sp.name)}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA: USUARIOS & ROLES */}
      {activeTab === 'roles' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-gold-400" />
                  Gestión de Usuarios y Roles de Acceso
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Crea y administra credenciales y roles para miembros del comité organizador, árbitros y administradores.
                </p>
              </div>

              <button
                onClick={() => setUserModal({ id: '', nombre: '', username: '', email: '', rol: 'Comité Organizador', pin: '', activo: true })}
                className="px-4 py-2.5 rounded-xl bg-[#A3E229] hover:bg-[#b6f23d] text-[#150D8B] text-xs font-orbitron font-black flex items-center gap-2 shadow-[0_0_20px_rgba(163,226,41,0.4)] transition-all uppercase"
              >
                <Plus className="w-4 h-4 text-[#150D8B]" />
                <span>Nuevo Usuario Admin</span>
              </button>
            </div>

            {/* TABLA DE USUARIOS */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-navy-950 text-slate-400 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3.5">Nombre & Usuario</th>
                    <th className="px-4 py-3.5">Correo</th>
                    <th className="px-4 py-3.5">Rol de Acceso</th>
                    <th className="px-4 py-3.5">PIN / Clave</th>
                    <th className="px-4 py-3.5 text-center">Estado</th>
                    <th className="px-4 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-normal text-xs sm:text-sm">
                  {adminUsersList.map((user) => (
                    <tr key={user.id} className="hover:bg-navy-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-gold-400" />
                          <span>{user.nombre}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">@{user.username || 'usuario'}</span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-300">
                        {user.email || '—'}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.rol === 'Super Admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : user.rol === 'Comité Organizador'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : user.rol === 'Mesa Técnica'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-slate-700/60 text-slate-300'
                        }`}>
                          {user.rol}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        <span className="tracking-widest">••••••</span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleUserActive(user)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            user.activo
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                          }`}
                        >
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setUserModal(user)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-gold-400 hover:bg-navy-800 transition-colors"
                            title="Editar usuario"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.nombre)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ROLES DISPONIBLES EXPLICATIVO */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Descripción de Roles y Permisos en el Sistema:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {ADMIN_ROLES.map(r => (
                  <div key={r.id} className="p-3 rounded-xl bg-navy-900/60 border border-slate-800 text-xs">
                    <span className="font-bold text-white block mb-0.5">{r.label}</span>
                    <span className="text-[11px] text-slate-400">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: INSCRIPCIONES */}
      {activeTab === 'inscripciones' && (
        <>
          {/* TARJETAS DE ESTADÍSTICAS */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Inscripciones</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-extrabold text-white">{totalInscritos}</span>
                <Users className="w-5 h-5 text-gold-400" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Parejas en el sistema</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Confirmados (Publicados)</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-extrabold text-emerald-400">{totalConfirmados}</span>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Visibles en la web pública</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Esperando Pago</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-extrabold text-amber-400">{totalEsperandoPago}</span>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Comprobante o ref por verificar</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">En Lista de Espera</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-extrabold text-purple-400">{totalListaEspera}</span>
                <AlertTriangle className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Categorías completas</span>
            </div>
          </div>

          {/* CONTROLES: BÚSQUEDA, FILTRO Y EXPORTACIÓN */}
          <div className="max-w-7xl mx-auto glass-panel p-5 rounded-2xl mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                {/* Buscador */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por jugador, cédula, teléfono o ref de pago..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Filtro de Categoría */}
                <div className="relative min-w-[170px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="ALL">Todas las Categorías</option>
                    {CATEGORIAS.map(cat => (
                      <option key={cat.id} value={cat.label}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro de Status */}
                <div className="relative min-w-[160px]">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-gold-500 capitalize"
                  >
                    <option value="ALL">Todos los Estados</option>
                    {PLAYER_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botón Inscribir Pareja y Exportación */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#A3E229] hover:bg-[#b6f23d] text-[#150D8B] font-orbitron font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#A3E229]/25 transition-all transform hover:scale-105 active:scale-95"
                  title="Inscribir una nueva pareja directamente desde el Administrador"
                >
                  <UserPlus className="w-4 h-4 text-[#150D8B]" />
                  <span>+ Inscribir Pareja</span>
                </button>

                <button
                  onClick={exportToExcel}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel</span>
                </button>

                <button
                  onClick={exportToCSV}
                  className="px-3 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>CSV</span>
                </button>
              </div>

            </div>
          </div>

          {/* TABLA PRINCIPAL DE INSCRIPCIONES */}
          <div className="max-w-7xl mx-auto glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-navy-800/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 font-bold">#</th>
                    <th scope="col" className="px-3 py-3.5 font-bold">Categoría & Monto</th>
                    <th scope="col" className="px-3 py-3.5 font-bold">Jugador 1</th>
                    <th scope="col" className="px-3 py-3.5 font-bold">Jugador 2</th>
                    <th scope="col" className="px-3 py-3.5 font-bold">Pago & Ref</th>
                    <th scope="col" className="px-3 py-3.5 font-bold">Status (Admin)</th>
                    <th scope="col" className="px-3 py-3.5 font-bold text-right">Ficha / Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-normal text-xs sm:text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gold-400" />
                        Cargando inscripciones desde Firestore...
                      </td>
                    </tr>
                  ) : filteredList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        No se encontraron inscripciones con los criterios seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((item, idx) => {
                      const currentStatus = (item.status || item.estado || 'preinscrito').toLowerCase();
                      const playerNames = `${item.jugador1?.nombre || ''} y ${item.jugador2?.nombre || ''}`;

                      return (
                        <tr key={item.id} className="hover:bg-navy-800/50 transition-colors">
                          <td className="px-3 py-3.5 font-mono text-xs text-slate-400">
                            {idx + 1}
                          </td>

                          {/* Categoría y Monto */}
                          <td className="px-3 py-3.5">
                            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30 whitespace-nowrap">
                              {item.categoria}
                            </span>
                            <div className="text-[11px] font-medium mt-1 flex items-center gap-1">
                              <span className="text-emerald-400 font-bold">{item.monto || '$150'}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-300 truncate max-w-[130px]" title={item.metodoPago}>
                                {item.metodoPago || 'Por confirmar'}
                              </span>
                            </div>
                          </td>

                          {/* Jugador 1 con nuevos campos visuales */}
                          <td className="px-3 py-3.5">
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{item.jugador1?.nombre} {item.jugador1?.apellido || ''}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                              {item.jugador1?.cedula && (
                                <span className="font-mono text-slate-300">CI: {item.jugador1.cedula}</span>
                              )}
                              {item.jugador1?.tallaFranela && (
                                <span className="text-gold-400 font-bold">Talla: {item.jugador1.tallaFranela}</span>
                              )}
                              {item.jugador1?.ladoJuego && (
                                <span className="text-[#80e100]">Lado: {item.jugador1.ladoJuego}</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                              {item.jugador1?.email} • {item.jugador1?.telefono}
                            </div>
                          </td>

                          {/* Jugador 2 con nuevos campos visuales */}
                          <td className="px-3 py-3.5">
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{item.jugador2?.nombre} {item.jugador2?.apellido || ''}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                              {item.jugador2?.cedula && (
                                <span className="font-mono text-slate-300">CI: {item.jugador2.cedula}</span>
                              )}
                              {item.jugador2?.tallaFranela && (
                                <span className="text-gold-400 font-bold">Talla: {item.jugador2.tallaFranela}</span>
                              )}
                              {item.jugador2?.ladoJuego && (
                                <span className="text-[#80e100]">Lado: {item.jugador2.ladoJuego}</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                              {item.jugador2?.email} • {item.jugador2?.telefono}
                            </div>
                          </td>

                          {/* Pago & Comprobante */}
                          <td className="px-3 py-3.5">
                            {item.referenciaPago ? (
                              <div className="font-mono text-xs text-gold-300 font-semibold mb-1 truncate max-w-[140px]" title={item.referenciaPago}>
                                Ref: {item.referenciaPago}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic block mb-1">Sin ref</span>
                            )}

                            {item.comprobantePagoUrl ? (
                              <button
                                onClick={() => setReceiptModalData(item)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/40 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Comprobante</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Sin archivo</span>
                            )}

                            {item.observaciones && (
                              <button
                                type="button"
                                onClick={() => handleOpenObservationModal(item)}
                                className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 rounded-lg px-2 py-0.5 max-w-[170px] truncate transition-colors text-left font-medium"
                                title={`Observación: ${item.observaciones}`}
                              >
                                <MessageSquare className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="truncate">{item.observaciones}</span>
                              </button>
                            )}
                          </td>

                          {/* Selector y Acción Rápida de Status */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <div className="flex flex-col gap-1.5">
                              {currentStatus !== 'confirmado' ? (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(item.id, 'confirmado')}
                                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-navy-950 font-black text-xs shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all active:scale-95 cursor-pointer"
                                  title="Confirmar pareja y publicar inmediatamente en la web pública"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Confirmar Dupla</span>
                                </button>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Confirmada ✓</span>
                                </div>
                              )}

                              <select
                                value={currentStatus}
                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold border focus:outline-none uppercase transition-all cursor-pointer ${getStatusBadgeClass(currentStatus)}`}
                                title="Cambiar estado de la pareja"
                              >
                                {PLAYER_STATUSES.map(s => (
                                  <option key={s} value={s} className="bg-navy-900 text-white font-normal capitalize">
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>

                          {/* Acciones: Ver Ficha, Editar & Eliminar */}
                          <td className="px-3 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setDetailModalData(item)}
                                className="p-1.5 rounded-lg text-slate-300 hover:text-gold-400 hover:bg-navy-800 transition-colors"
                                title="Ver Ficha Completa de la Dupla"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleOpenObservationModal(item)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  item.observaciones 
                                    ? 'text-amber-400 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                                    : 'text-slate-400 hover:text-amber-300 hover:bg-navy-800'
                                }`}
                                title={item.observaciones ? `Observaciones: ${item.observaciones}` : 'Agregar Observación'}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 rounded-lg text-slate-300 hover:text-[#A3E229] hover:bg-navy-800 transition-colors"
                                title="Editar Datos de la Dupla"
                              >
                                <Pencil className="w-4 h-4 text-[#A3E229]" />
                              </button>

                              <button
                                onClick={() => handleDelete(item.id, playerNames)}
                                disabled={deletingId === item.id}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Eliminar inscripción"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-navy-800/40 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Mostrando {filteredList.length} de {registrations.length} parejas</span>
              <span className="text-slate-500">Copa Navidad • La Marina Sport Club</span>
            </div>
          </div>
        </>
      )}

      {/* MODAL PARA VER FICHA COMPLETA CON TODOS LOS NUEVOS CAMPOS */}
      {detailModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-navy-800 border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Ficha Técnica de Inscripción • {detailModalData.categoria}
                  </h3>
                  <p className="text-xs text-slate-400">
                    ID Registro: <span className="font-mono text-gold-300">{detailModalData.id}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDetailModalData(null)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-navy-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-6">
              
              {/* Resumen de Pago & Status CON ACCIÓN RÁPIDA DE CONFIRMACIÓN */}
              <div className="bg-navy-950 p-4 rounded-2xl border border-gold-500/40 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  <div>
                    <span className="text-slate-400 block font-semibold">Estado Actual:</span>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full font-bold uppercase ${getStatusBadgeClass(detailModalData.status || detailModalData.estado || 'preinscrito')}`}>
                      {detailModalData.status || detailModalData.estado || 'preinscrito'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Método de Pago:</span>
                    <span className="text-white font-bold mt-1 block">{detailModalData.metodoPago || 'No especificado'} ({detailModalData.monto || '$150'})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Referencia / Hash:</span>
                    <span className="font-mono text-gold-300 font-bold mt-1 block">{detailModalData.referenciaPago || 'Sin referencia'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {detailModalData.status !== 'confirmado' ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await handleStatusChange(detailModalData.id, 'confirmado');
                        setDetailModalData(prev => ({ ...prev, status: 'confirmado' }));
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-navy-950 font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirmar Pareja</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-xs flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Publicada en Web</span>
                    </span>
                  )}

                  <select
                    value={detailModalData.status || 'preinscrito'}
                    onChange={async (e) => {
                      const newSt = e.target.value;
                      await handleStatusChange(detailModalData.id, newSt);
                      setDetailModalData(prev => ({ ...prev, status: newSt }));
                    }}
                    className="px-3 py-2 rounded-xl bg-navy-800 text-white font-bold text-xs border border-slate-700 cursor-pointer focus:outline-none"
                  >
                    {PLAYER_STATUSES.map(s => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Observaciones del Administrador */}
              {detailModalData.observaciones && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span>Observaciones / Notas Internas</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {detailModalData.observaciones}
                  </p>
                </div>
              )}

              {/* Ficha Jugador 1 */}
              <div className="bg-navy-900/90 p-5 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-white">Jugador 1: {detailModalData.jugador1?.nombre} {detailModalData.jugador1?.apellido || ''}</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Cédula:</span>
                    <span className="font-mono text-white font-semibold">{detailModalData.jugador1?.cedula || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Email:</span>
                    <span className="text-slate-200">{detailModalData.jugador1?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Teléfono:</span>
                    <span className="text-slate-200">{detailModalData.jugador1?.telefono || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Talla de Franela:</span>
                    <span className="text-gold-400 font-bold">{detailModalData.jugador1?.tallaFranela || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lado de Juego:</span>
                    <span className="text-[#80e100] font-bold">{detailModalData.jugador1?.ladoJuego || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Categoría Habitual:</span>
                    <span className="text-white">{detailModalData.jugador1?.categoriaHabitual || 'N/A'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-400 block">Liga / Torneo Actual:</span>
                    <span className="text-slate-200">{detailModalData.jugador1?.torneoActual || 'Ninguno'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-400 block">Historial Torneos:</span>
                    <p className="text-slate-300 bg-navy-950 p-2.5 rounded-xl border border-slate-800 mt-1 whitespace-pre-wrap">
                      {detailModalData.jugador1?.historialTorneos || 'Sin historial registrado'}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-400 block">Alergias / Restricciones:</span>
                    <span className="text-amber-300 font-medium">{detailModalData.jugador1?.alergias || 'Ninguna'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Aceptó Reglamento:</span>
                    <span className={detailModalData.jugador1?.aceptaReglamento === 'si' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {detailModalData.jugador1?.aceptaReglamento === 'si' ? 'SÍ' : 'NO'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ficha Jugador 2 */}
              <div className="bg-navy-900/90 p-5 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-white">Jugador 2: {detailModalData.jugador2?.nombre} {detailModalData.jugador2?.apellido || ''}</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Cédula:</span>
                    <span className="font-mono text-white font-semibold">{detailModalData.jugador2?.cedula || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Email:</span>
                    <span className="text-slate-200">{detailModalData.jugador2?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Teléfono:</span>
                    <span className="text-slate-200">{detailModalData.jugador2?.telefono || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Talla de Franela:</span>
                    <span className="text-gold-400 font-bold">{detailModalData.jugador2?.tallaFranela || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lado de Juego:</span>
                    <span className="text-[#80e100] font-bold">{detailModalData.jugador2?.ladoJuego || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Categoría Habitual:</span>
                    <span className="text-white">{detailModalData.jugador2?.categoriaHabitual || 'N/A'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-400 block">Liga / Torneo Actual:</span>
                    <span className="text-slate-200">{detailModalData.jugador2?.torneoActual || 'Ninguno'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-400 block">Historial Torneos:</span>
                    <p className="text-slate-300 bg-navy-950 p-2.5 rounded-xl border border-slate-800 mt-1 whitespace-pre-wrap">
                      {detailModalData.jugador2?.historialTorneos || 'Sin historial registrado'}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-400 block">Alergias / Restricciones:</span>
                    <span className="text-amber-300 font-medium">{detailModalData.jugador2?.alergias || 'Ninguna'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Aceptó Reglamento:</span>
                    <span className={detailModalData.jugador2?.aceptaReglamento === 'si' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {detailModalData.jugador2?.aceptaReglamento === 'si' ? 'SÍ' : 'NO'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón para ver comprobante si existe */}
              {detailModalData.comprobantePagoUrl && (
                <div className="pt-2 flex justify-start">
                  <button
                    onClick={() => {
                      setReceiptModalData(detailModalData);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Comprobante de Pago Adjunto</span>
                  </button>
                </div>
              )}

            </div>

            <div className="pt-3 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setDetailModalData(null)}
                className="px-5 py-2.5 rounded-xl bg-navy-700 hover:bg-navy-600 text-white text-xs font-semibold"
              >
                Cerrar Ficha
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL PARA VER COMPROBANTE DE PAGO */}
      {receiptModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-navy-800 border border-gold-500/40 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gold-400" />
                  Comprobante de Pago - {receiptModalData.categoria}
                </h3>
                <p className="text-xs text-slate-400">
                  Pareja: {receiptModalData.jugador1?.nombre} & {receiptModalData.jugador2?.nombre}
                </p>
              </div>

              <button
                onClick={() => setReceiptModalData(null)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-navy-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 bg-navy-900 p-4 rounded-2xl border border-slate-700">
              <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                <div>
                  <span className="text-slate-400 block">Referencia / ID:</span>
                  <span className="font-mono text-sm text-gold-300 font-bold">{receiptModalData.referenciaPago || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Método de Pago:</span>
                  <span className="text-white font-semibold">{receiptModalData.metodoPago} (${receiptModalData.monto || '150'})</span>
                </div>
              </div>

              {receiptModalData.comprobantePagoUrl ? (
                receiptModalData.comprobanteTipo?.includes('pdf') || receiptModalData.comprobantePagoUrl.startsWith('data:application/pdf') ? (
                  <div className="text-center py-8 bg-navy-800 rounded-xl border border-slate-700">
                    <FileText className="w-12 h-12 text-gold-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white mb-1">{receiptModalData.comprobanteNombre || 'Comprobante en formato PDF'}</p>
                    <p className="text-xs text-slate-400 mb-4">Documento digital adjunto por la pareja</p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <a
                        href={receiptModalData.comprobantePagoUrl}
                        download={receiptModalData.comprobanteNombre || 'comprobante_pago.pdf'}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-xs transition-colors shadow-glow-gold"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Descargar PDF</span>
                      </a>
                      <a
                        href={receiptModalData.comprobantePagoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-700 hover:bg-navy-600 text-white font-semibold text-xs border border-slate-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Abrir en Nueva Pestaña</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="max-h-[450px] w-full overflow-auto rounded-xl border border-slate-800 bg-black/40 flex items-center justify-center p-2">
                      <img 
                        src={receiptModalData.comprobantePagoUrl} 
                        alt="Comprobante de pago" 
                        className="max-h-[420px] max-w-full object-contain rounded-lg"
                      />
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <a
                        href={receiptModalData.comprobantePagoUrl}
                        download={receiptModalData.comprobanteNombre || 'comprobante.png'}
                        className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Descargar Imagen</span>
                      </a>
                      <span className="text-slate-600">•</span>
                      <a
                        href={receiptModalData.comprobantePagoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver a Tamaño Completo</span>
                      </a>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-center py-8 text-slate-400 text-xs">No hay comprobante digital adjunto.</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Cambia el status en la tabla a <strong>CONFIRMADO</strong> para validar su inscripción.
              </span>
              <button
                onClick={() => setReceiptModalData(null)}
                className="px-4 py-2 rounded-xl bg-navy-700 text-white font-semibold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR PATROCINADOR */}
      {sponsorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-navy-800 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
              <h3 className="text-lg font-bold text-white">
                {sponsorModal.id ? 'Editar Patrocinador' : 'Nuevo Patrocinador'}
              </h3>
              <button onClick={() => setSponsorModal(null)} className="p-1.5 rounded-full text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSponsorSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nombre de la Empresa / Marca *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Gatorade"
                  value={sponsorModal.name}
                  onChange={(e) => setSponsorModal({ ...sponsorModal, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nivel / Categoría del Auspicio</label>
                <input
                  type="text"
                  placeholder="Ej: Auspiciador Oficial, Hidratación, etc."
                  value={sponsorModal.tier}
                  onChange={(e) => setSponsorModal({ ...sponsorModal, tier: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">URL del Logo (o ruta en /assets)</label>
                <input
                  type="text"
                  placeholder="Ej: /assets/LOGO-JUAN-XXIII-WHT.png o https://..."
                  value={sponsorModal.logo}
                  onChange={(e) => setSponsorModal({ ...sponsorModal, logo: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Enlace Web o Red Social (se abre en nueva pestaña)</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/tumarcavenezuela"
                  value={sponsorModal.link}
                  onChange={(e) => setSponsorModal({ ...sponsorModal, link: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                />
              </div>

              {/* DEFINIR TAMAÑO DEL LOGO EN LA WEB */}
              <div className="bg-navy-900/90 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                <label className="block font-semibold text-slate-300 flex items-center justify-between">
                  <span>Tamaño del Logo en la Web</span>
                  <span className="text-gold-400 font-mono font-bold text-sm">{sponsorModal.logoHeight || 65}px</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="35"
                    max="140"
                    step="5"
                    value={sponsorModal.logoHeight || 65}
                    onChange={(e) => setSponsorModal({ ...sponsorModal, logoHeight: parseInt(e.target.value) || 65 })}
                    className="w-full accent-gold-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="35"
                    max="140"
                    value={sponsorModal.logoHeight || 65}
                    onChange={(e) => setSponsorModal({ ...sponsorModal, logoHeight: parseInt(e.target.value) || 65 })}
                    className="w-20 px-2 py-1.5 rounded-xl bg-navy-950 text-white border border-slate-700 text-center font-mono text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: 'Pequeño (45px)', val: 45 },
                    { label: 'Mediano (65px)', val: 65 },
                    { label: 'Grande (90px)', val: 90 },
                    { label: 'Extra Grande (120px)', val: 120 }
                  ].map(preset => (
                    <button
                      type="button"
                      key={preset.val}
                      onClick={() => setSponsorModal({ ...sponsorModal, logoHeight: preset.val })}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                        (sponsorModal.logoHeight || 65) === preset.val
                          ? 'bg-gold-500 text-navy-900 border-gold-400'
                          : 'bg-navy-950 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setSponsorModal(null)}
                  className="px-4 py-2 rounded-xl bg-navy-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold"
                >
                  Guardar Patrocinador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR USUARIO ADMINISTRADOR */}
      {userModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-navy-800 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-gold-400" />
                <h3 className="text-lg font-bold text-white">
                  {userModal.id ? 'Editar Usuario Admin' : 'Nuevo Usuario Admin'}
                </h3>
              </div>
              <button onClick={() => setUserModal(null)} className="p-1.5 rounded-full text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Henry Macho"
                  value={userModal.nombre}
                  onChange={(e) => setUserModal({ ...userModal, nombre: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nombre de Usuario (Login)</label>
                <input
                  type="text"
                  placeholder="Ej: henry o comite1"
                  value={userModal.username}
                  onChange={(e) => setUserModal({ ...userModal, username: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="Ej: comite@lamarina.com"
                  value={userModal.email}
                  onChange={(e) => setUserModal({ ...userModal, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Rol de Acceso *</label>
                <select
                  value={userModal.rol}
                  onChange={(e) => setUserModal({ ...userModal, rol: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                >
                  {ADMIN_ROLES.map(r => (
                    <option key={r.id} value={r.label}>
                      {r.label} — {r.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">PIN o Contraseña de Acceso *</label>
                <input
                  type="text"
                  required
                  placeholder="Ingresa PIN o contraseña segura"
                  value={userModal.pin}
                  onChange={(e) => setUserModal({ ...userModal, pin: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="user-activo"
                  checked={userModal.activo}
                  onChange={(e) => setUserModal({ ...userModal, activo: e.target.checked })}
                  className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500/30"
                />
                <label htmlFor="user-activo" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Usuario activo (permite iniciar sesión en el panel)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setUserModal(null)}
                  className="px-4 py-2 rounded-xl bg-navy-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold"
                >
                  {savingUser ? 'Guardando...' : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR DUPLA INSCRITA */}
      {editModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-gradient-to-b from-navy-800 to-navy-900 border border-blue-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl my-8 max-h-[92vh] flex flex-col">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-orbitron text-white flex items-center gap-2">
                    Editar Pareja Inscrita
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-sans border border-blue-500/30">
                      ID: {editModalData.id}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Modifica cualquier dato de la dupla, estado oficial de inscripción o método de pago
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditModalData(null)} 
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body Scrollable */}
            <form onSubmit={handleSaveEditDupla} className="overflow-y-auto pr-2 py-4 space-y-6 flex-1 text-xs">
              
              {/* Bloque 1: Categoría, Estado y Datos Financieros */}
              <div className="bg-navy-900/90 border border-blue-400/20 rounded-2xl p-4 sm:p-5 space-y-4">
                <h4 className="text-sm font-bold font-orbitron text-gold-400 uppercase tracking-wide flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold-400" />
                  Categoría y Estado de Inscripción
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-200 mb-1.5">Categoría Oficial *</label>
                    <select
                      value={editModalData.categoria}
                      onChange={(e) => setEditModalData({ ...editModalData, categoria: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-950 text-white border border-slate-700 focus:border-gold-400 font-semibold text-xs"
                    >
                      <option value="">Selecciona Categoría</option>
                      {CATEGORIAS.map(c => (
                        <option key={c.id} value={c.label}>
                          {c.label} ({c.group})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-200 mb-1.5">Estado Oficial *</label>
                    <select
                      value={editModalData.status}
                      onChange={(e) => setEditModalData({ ...editModalData, status: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-950 text-white border border-slate-700 focus:border-gold-400 font-semibold text-xs capitalize"
                    >
                      {PLAYER_STATUSES.map(st => (
                        <option key={st} value={st}>
                          {st.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-200 mb-1.5">Método de Pago</label>
                    <select
                      value={editModalData.metodoPago}
                      onChange={(e) => setEditModalData({ ...editModalData, metodoPago: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-950 text-white border border-slate-700 focus:border-gold-400 text-xs"
                    >
                      <option value={landingForm.pagoMovilNombre || 'Pago Móvil'}>{landingForm.pagoMovilNombre || 'Pago Móvil'}</option>
                      <option value={landingForm.zelleNombre || 'Zelle'}>{landingForm.zelleNombre || 'Zelle'}</option>
                      <option value={landingForm.cuentaInternacionalNombre || 'Cuenta Internacional'}>{landingForm.cuentaInternacionalNombre || 'Cuenta Internacional (Panamá)'}</option>
                      <option value={landingForm.binancePayNombre || 'Binance'}>{landingForm.binancePayNombre || 'Binance (USDT)'}</option>
                      <option value="Efectivo / Directo en Club">Efectivo / Directo en Club</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-200 mb-1.5">Referencia de Pago</label>
                    <input
                      type="text"
                      placeholder="Ej: PM-94827104"
                      value={editModalData.referenciaPago}
                      onChange={(e) => setEditModalData({ ...editModalData, referenciaPago: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-950 text-white border border-slate-700 focus:border-gold-400 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Comprobante */}
                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">
                      Comprobante actual: {editModalData.comprobantePagoUrl ? (
                        <strong className="text-emerald-300 font-semibold">{editModalData.comprobanteNombre || 'Adjunto'}</strong>
                      ) : (
                        <span className="text-slate-400 italic">Sin comprobante</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{editModalData.comprobantePagoUrl ? 'Reemplazar Comprobante' : 'Subir Comprobante'}</span>
                      <input type="file" accept="image/*,application/pdf" onChange={handleReceiptUploadEdit} className="hidden" />
                    </label>
                    {editModalData.comprobantePagoUrl && (
                      <button
                        type="button"
                        onClick={() => setEditModalData(prev => ({ ...prev, comprobantePagoUrl: '', comprobanteNombre: '' }))}
                        className="px-2.5 py-1.5 rounded-xl bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30 text-xs"
                        title="Quitar comprobante"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>

                {/* Observaciones Internas Admin */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>Observaciones / Notas Internas (Opcional - Solo Admin)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Notas internas del comité (ej: pago pendiente, horarios especiales, observaciones médicas)..."
                    value={editModalData.observaciones || ''}
                    onChange={(e) => setEditModalData({ ...editModalData, observaciones: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700 focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              {/* Bloque 2: Jugador 1 y Jugador 2 en columnas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* JUGADOR 1 */}
                <div className="bg-navy-900/90 border border-blue-500/30 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-blue-500/20">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h4 className="text-sm font-bold text-white font-orbitron">Datos de Jugador 1</h4>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre y Apellido"
                      value={editModalData.jugador1?.nombre || ''}
                      onChange={(e) => setEditModalData({
                        ...editModalData,
                        jugador1: { ...editModalData.jugador1, nombre: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700 focus:border-blue-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Cédula de Identidad</label>
                      <input
                        type="text"
                        placeholder="V-12.345.678"
                        value={editModalData.jugador1?.cedula || ''}
                        onChange={(e) => setEditModalData({
                          ...editModalData,
                          jugador1: { ...editModalData.jugador1, cedula: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Teléfono Móvil</label>
                      <input
                        type="text"
                        placeholder="0412-1234567"
                        value={editModalData.jugador1?.telefono || ''}
                        onChange={(e) => setEditModalData({
                          ...editModalData,
                          jugador1: { ...editModalData.jugador1, telefono: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="jugador1@email.com"
                      value={editModalData.jugador1?.email || ''}
                      onChange={(e) => setEditModalData({
                        ...editModalData,
                        jugador1: { ...editModalData.jugador1, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Talla de Franela</label>
                      <select
                        value={editModalData.jugador1?.tallaFranela || 'M'}
                        onChange={(e) => setEditModalData({
                          ...editModalData,
                          jugador1: { ...editModalData.jugador1, tallaFranela: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      >
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(t => (
                          <option key={t} value={t}>Talla {t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Lado de Juego</label>
                      <select
                        value={editModalData.jugador1?.ladoJuego || 'Derecha'}
                        onChange={(e) => setEditModalData({
                          ...editModalData,
                          jugador1: { ...editModalData.jugador1, ladoJuego: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      >
                        <option value="Derecha">Derecha</option>
                        <option value="Revés">Revés</option>
                        <option value="Ambos">Ambos</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Categoría Habitual</label>
                      <input
                        type="text"
                        placeholder="Ej: 4ta"
                        value={editModalData.jugador1?.categoriaHabitual || ''}
                        onChange={(e) => setEditModalData({
                          ...editModalData,
                          jugador1: { ...editModalData.jugador1, categoriaHabitual: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Liga / Torneo Actual</label>
                      <input
                        type="text"
                        placeholder="Ej: Liga Máster / Superliga de Clubes / Ninguno"
                        value={editModalData.jugador1?.torneoActual || ''}
                        onChange={(e) => setEditModalData({
                          ...editModalData,
                          jugador1: { ...editModalData.jugador1, torneoActual: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Historial de Torneos / Resultados</label>
                    <input
                      type="text"
                      placeholder="Ej: Último torneo jugado y posición"
                      value={editModalData.jugador1?.historialTorneos || ''}
                      onChange={(e) => setEditModalData({
                        ...editModalData,
                        jugador1: { ...editModalData.jugador1, historialTorneos: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Alergias / Condiciones Médicas</label>
                    <input
                      type="text"
                      placeholder="Ninguna o detalle"
                      value={editModalData.jugador1?.alergias || ''}
                      onChange={(e) => setEditModalData({
                        ...editModalData,
                        jugador1: { ...editModalData.jugador1, alergias: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                    />
                  </div>
                </div>

                {/* JUGADOR 2 */}
                <div className="bg-navy-900/90 border border-[#A3E229]/30 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#A3E229]/20">
                    <div className="w-6 h-6 rounded-lg bg-[#A3E229]/20 text-[#A3E229] flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h4 className="text-sm font-bold text-white font-orbitron">Datos de Jugador 2</h4>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre y Apellido"
                      value={editModalData.jugador2?.nombre || ''}
                      onChange={(e) => setEditModalData({
                        ...editModalData,
                        jugador2: { ...editModalData.jugador2, nombre: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700 focus:border-[#A3E229]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Cédula de Identidad</label>
                      <input
                        type="text"
                        placeholder="V-12.345.678"
                        value={editModalData.jugador2?.cedula || ''}
                        onChange={(e) => setEditModalData({
                          ...editModalData,
                          jugador2: { ...editModalData.jugador2, cedula: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Teléfono Móvil</label>
                      <input
                        type="text"
                        placeholder="0412-1234567"
                        value={editModalData.jugador2?.telefono || ''}
                        onChange={(e) => setEditModalData({
                          ...editModalData,
                          jugador2: { ...editModalData.jugador2, telefono: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="jugador2@email.com"
                      value={editModalData.jugador2?.email || ''}
                      onChange={(e) => setEditModalData({
                        ...editModalData,
                        jugador2: { ...editModalData.jugador2, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Talla de Franela</label>
                      <select
                        value={editModalData.jugador2?.tallaFranela || 'M'}
                        onChange={(e) => setEditModalData({
                          ...editModalData,
                          jugador2: { ...editModalData.jugador2, tallaFranela: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      >
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(t => (
                          <option key={t} value={t}>Talla {t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Lado de Juego</label>
                      <select
                        value={editModalData.jugador2?.ladoJuego || 'Revés'}
                        onChange={(e) => setEditModalData({
                          ...editModalData,
                          jugador2: { ...editModalData.jugador2, ladoJuego: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      >
                        <option value="Derecha">Derecha</option>
                        <option value="Revés">Revés</option>
                        <option value="Ambos">Ambos</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Categoría Habitual</label>
                      <input
                        type="text"
                        placeholder="Ej: 4ta"
                        value={editModalData.jugador2?.categoriaHabitual || ''}
                        onChange={(e) => setEditModalData({
                          ...editModalData,
                          jugador2: { ...editModalData.jugador2, categoriaHabitual: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Liga / Torneo Actual</label>
                      <input
                        type="text"
                        placeholder="Ej: Liga Máster / Superliga de Clubes / Ninguno"
                        value={editModalData.jugador2?.torneoActual || ''}
                        onChange={(e) => setEditModalData({
                          ...editModalData,
                          jugador2: { ...editModalData.jugador2, torneoActual: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Historial de Torneos / Resultados</label>
                    <input
                      type="text"
                      placeholder="Ej: Último torneo jugado y posición"
                      value={editModalData.jugador2?.historialTorneos || ''}
                      onChange={(e) => setEditModalData({
                        ...editModalData,
                        jugador2: { ...editModalData.jugador2, historialTorneos: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Alergias / Condiciones Médicas</label>
                    <input
                      type="text"
                      placeholder="Ninguna o detalle"
                      value={editModalData.jugador2?.alergias || ''}
                      onChange={(e) => setEditModalData({
                        ...editModalData,
                        jugador2: { ...editModalData.jugador2, alergias: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                    />
                  </div>
                </div>

              </div>

              {/* Botones de acción */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-700/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditModalData(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-navy-800 text-slate-300 font-semibold hover:bg-navy-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {savingEdit ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Guardando Cambios...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Cambios de la Pareja</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL INSCRIBIR PAREJA DESDE EL ADMINISTRADOR */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-gradient-to-b from-navy-800 to-navy-900 border border-[#A3E229]/40 rounded-3xl p-5 sm:p-7 shadow-2xl my-8 max-h-[92vh] flex flex-col">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#A3E229]/20 text-[#A3E229] border border-[#A3E229]/40 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-orbitron text-white flex items-center gap-2">
                    Inscribir Nueva Pareja (Admin)
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-sans border border-emerald-500/30">
                      Registro Manual
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Registra una pareja directamente en el torneo con estatus Confirmado o Preinscrito
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setCreateModalOpen(false)} 
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body Scrollable */}
            <form onSubmit={handleCreateDuplaSubmit} className="overflow-y-auto pr-2 py-4 space-y-6 flex-1 text-xs">
              
              {/* Bloque 1: Categoría, Estado y Datos Financieros */}
              <div className="bg-navy-900/90 border border-[#A3E229]/20 rounded-2xl p-4 sm:p-5 space-y-4">
                <h4 className="text-sm font-bold font-orbitron text-[#A3E229] uppercase tracking-wide flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#A3E229]" />
                  Categoría Oficial y Estado Inicial
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-200 mb-1.5">Categoría Oficial *</label>
                    <select
                      value={newDuplaForm.categoria}
                      onChange={(e) => setNewDuplaForm({ ...newDuplaForm, categoria: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-950 text-white border border-slate-700 focus:border-[#A3E229] font-semibold text-xs"
                    >
                      <option value="">Selecciona Categoría</option>
                      {CATEGORIAS.map(c => (
                        <option key={c.id} value={c.label}>
                          {c.label} ({c.group})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-200 mb-1.5">Estado Inicial *</label>
                    <select
                      value={newDuplaForm.status}
                      onChange={(e) => setNewDuplaForm({ ...newDuplaForm, status: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-950 text-white border border-slate-700 focus:border-[#A3E229] font-semibold text-xs capitalize"
                    >
                      {PLAYER_STATUSES.map(st => (
                        <option key={st} value={st}>
                          {st.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-200 mb-1.5">Método de Pago</label>
                    <select
                      value={newDuplaForm.metodoPago}
                      onChange={(e) => setNewDuplaForm({ ...newDuplaForm, metodoPago: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-950 text-white border border-slate-700 focus:border-[#A3E229] text-xs"
                    >
                      <option value={landingForm.pagoMovilNombre || 'Pago Móvil'}>{landingForm.pagoMovilNombre || 'Pago Móvil'}</option>
                      <option value={landingForm.zelleNombre || 'Zelle'}>{landingForm.zelleNombre || 'Zelle'}</option>
                      <option value={landingForm.cuentaInternacionalNombre || 'Cuenta Internacional'}>{landingForm.cuentaInternacionalNombre || 'Cuenta Internacional (Panamá)'}</option>
                      <option value={landingForm.binancePayNombre || 'Binance'}>{landingForm.binancePayNombre || 'Binance (USDT)'}</option>
                      <option value="Efectivo / Directo en Club">Efectivo / Directo en Club</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-200 mb-1.5">Referencia de Pago</label>
                    <input
                      type="text"
                      placeholder="Ej: PM-94827104 o Efectivo"
                      value={newDuplaForm.referenciaPago}
                      onChange={(e) => setNewDuplaForm({ ...newDuplaForm, referenciaPago: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-950 text-white border border-slate-700 focus:border-[#A3E229] font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Comprobante Opcional */}
                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#A3E229]" />
                    <span className="text-slate-300">
                      Comprobante: {newDuplaForm.comprobantePagoUrl ? (
                        <strong className="text-emerald-300 font-semibold">{newDuplaForm.comprobanteNombre || 'Adjunto'}</strong>
                      ) : (
                        <span className="text-slate-400 italic">Opcional para admin</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-[#A3E229] border border-[#A3E229]/30 text-xs font-semibold transition-colors">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{newDuplaForm.comprobantePagoUrl ? 'Reemplazar Comprobante' : 'Adjuntar Comprobante'}</span>
                      <input type="file" accept="image/*,application/pdf" onChange={handleReceiptUploadNew} className="hidden" />
                    </label>
                    {newDuplaForm.comprobantePagoUrl && (
                      <button
                        type="button"
                        onClick={() => setNewDuplaForm(prev => ({ ...prev, comprobantePagoUrl: '', comprobanteNombre: '' }))}
                        className="px-2.5 py-1.5 rounded-xl bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30 text-xs"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>

                {/* Observaciones Internas Admin */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>Observaciones / Notas Internas (Opcional - Solo Admin)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Notas internas del comité (ej: pago en taquilla, observaciones de categoría, etc.)..."
                    value={newDuplaForm.observaciones || ''}
                    onChange={(e) => setNewDuplaForm({ ...newDuplaForm, observaciones: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700 focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              {/* Bloque 2: Jugador 1 y Jugador 2 en columnas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* JUGADOR 1 */}
                <div className="bg-navy-900/90 border border-blue-500/30 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-blue-500/20">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h4 className="text-sm font-bold text-white font-orbitron">Datos de Jugador 1</h4>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre y Apellido"
                      value={newDuplaForm.jugador1?.nombre || ''}
                      onChange={(e) => setNewDuplaForm({
                        ...newDuplaForm,
                        jugador1: { ...newDuplaForm.jugador1, nombre: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700 focus:border-blue-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Cédula de Identidad</label>
                      <input
                        type="text"
                        placeholder="V-12.345.678"
                        value={newDuplaForm.jugador1?.cedula || ''}
                        onChange={(e) => setNewDuplaForm({
                          ...newDuplaForm,
                          jugador1: { ...newDuplaForm.jugador1, cedula: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Teléfono Móvil</label>
                      <input
                        type="text"
                        placeholder="0412-1234567"
                        value={newDuplaForm.jugador1?.telefono || ''}
                        onChange={(e) => setNewDuplaForm({
                          ...newDuplaForm,
                          jugador1: { ...newDuplaForm.jugador1, telefono: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="jugador1@email.com"
                      value={newDuplaForm.jugador1?.email || ''}
                      onChange={(e) => setNewDuplaForm({
                        ...newDuplaForm,
                        jugador1: { ...newDuplaForm.jugador1, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Talla de Franela</label>
                      <select
                        value={newDuplaForm.jugador1?.tallaFranela || 'M'}
                        onChange={(e) => setNewDuplaForm({
                          ...newDuplaForm,
                          jugador1: { ...newDuplaForm.jugador1, tallaFranela: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      >
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(t => (
                          <option key={t} value={t}>Talla {t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Lado de Juego</label>
                      <select
                        value={newDuplaForm.jugador1?.ladoJuego || 'Derecha'}
                        onChange={(e) => setNewDuplaForm({
                          ...newDuplaForm,
                          jugador1: { ...newDuplaForm.jugador1, ladoJuego: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      >
                        <option value="Derecha">Derecha</option>
                        <option value="Revés">Revés</option>
                        <option value="Ambos">Ambos</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Categoría Habitual</label>
                      <input
                        type="text"
                        placeholder="Ej: 4ta"
                        value={newDuplaForm.jugador1?.categoriaHabitual || ''}
                        onChange={(e) => setNewDuplaForm({
                          ...newDuplaForm,
                          jugador1: { ...newDuplaForm.jugador1, categoriaHabitual: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Liga / Torneo Actual</label>
                      <input
                        type="text"
                        placeholder="Ej: Liga Máster / Superliga de Clubes / Ninguno"
                        value={newDuplaForm.jugador1?.torneoActual || ''}
                        onChange={(e) => setNewDuplaForm({
                          ...newDuplaForm,
                          jugador1: { ...newDuplaForm.jugador1, torneoActual: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Historial de Torneos</label>
                    <input
                      type="text"
                      placeholder="Ej: Último torneo jugado y posición"
                      value={newDuplaForm.jugador1?.historialTorneos || ''}
                      onChange={(e) => setNewDuplaForm({
                        ...newDuplaForm,
                        jugador1: { ...newDuplaForm.jugador1, historialTorneos: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Alergias / Condiciones</label>
                    <input
                      type="text"
                      placeholder="Ninguna o detalle"
                      value={newDuplaForm.jugador1?.alergias || ''}
                      onChange={(e) => setNewDuplaForm({
                        ...newDuplaForm,
                        jugador1: { ...newDuplaForm.jugador1, alergias: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                    />
                  </div>
                </div>

                {/* JUGADOR 2 */}
                <div className="bg-navy-900/90 border border-[#A3E229]/30 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#A3E229]/20">
                    <div className="w-6 h-6 rounded-lg bg-[#A3E229]/20 text-[#A3E229] flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h4 className="text-sm font-bold text-white font-orbitron">Datos de Jugador 2</h4>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre y Apellido"
                      value={newDuplaForm.jugador2?.nombre || ''}
                      onChange={(e) => setNewDuplaForm({
                        ...newDuplaForm,
                        jugador2: { ...newDuplaForm.jugador2, nombre: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700 focus:border-[#A3E229]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Cédula de Identidad</label>
                      <input
                        type="text"
                        placeholder="V-12.345.678"
                        value={newDuplaForm.jugador2?.cedula || ''}
                        onChange={(e) => setNewDuplaForm({
                          ...newDuplaForm,
                          jugador2: { ...newDuplaForm.jugador2, cedula: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Teléfono Móvil</label>
                      <input
                        type="text"
                        placeholder="0412-1234567"
                        value={newDuplaForm.jugador2?.telefono || ''}
                        onChange={(e) => setNewDuplaForm({
                          ...newDuplaForm,
                          jugador2: { ...newDuplaForm.jugador2, telefono: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="jugador2@email.com"
                      value={newDuplaForm.jugador2?.email || ''}
                      onChange={(e) => setNewDuplaForm({
                        ...newDuplaForm,
                        jugador2: { ...newDuplaForm.jugador2, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Talla de Franela</label>
                      <select
                        value={newDuplaForm.jugador2?.tallaFranela || 'M'}
                        onChange={(e) => setNewDuplaForm({
                          ...newDuplaForm,
                          jugador2: { ...newDuplaForm.jugador2, tallaFranela: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      >
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(t => (
                          <option key={t} value={t}>Talla {t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Lado de Juego</label>
                      <select
                        value={newDuplaForm.jugador2?.ladoJuego || 'Revés'}
                        onChange={(e) => setNewDuplaForm({
                          ...newDuplaForm,
                          jugador2: { ...newDuplaForm.jugador2, ladoJuego: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      >
                        <option value="Derecha">Derecha</option>
                        <option value="Revés">Revés</option>
                        <option value="Ambos">Ambos</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Categoría Habitual</label>
                      <input
                        type="text"
                        placeholder="Ej: 4ta"
                        value={newDuplaForm.jugador2?.categoriaHabitual || ''}
                        onChange={(e) => setNewDuplaForm({
                          ...newDuplaForm,
                          jugador2: { ...newDuplaForm.jugador2, categoriaHabitual: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Liga / Torneo Actual</label>
                      <input
                        type="text"
                        placeholder="Ej: Liga Máster / Superliga de Clubes / Ninguno"
                        value={newDuplaForm.jugador2?.torneoActual || ''}
                        onChange={(e) => setNewDuplaForm({
                          ...newDuplaForm,
                          jugador2: { ...newDuplaForm.jugador2, torneoActual: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Historial de Torneos</label>
                    <input
                      type="text"
                      placeholder="Ej: Último torneo jugado y posición"
                      value={newDuplaForm.jugador2?.historialTorneos || ''}
                      onChange={(e) => setNewDuplaForm({
                        ...newDuplaForm,
                        jugador2: { ...newDuplaForm.jugador2, historialTorneos: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Alergias / Condiciones</label>
                    <input
                      type="text"
                      placeholder="Ninguna o detalle"
                      value={newDuplaForm.jugador2?.alergias || ''}
                      onChange={(e) => setNewDuplaForm({
                        ...newDuplaForm,
                        jugador2: { ...newDuplaForm.jugador2, alergias: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 text-white border border-slate-700"
                    />
                  </div>
                </div>

              </div>

              {/* Botones de acción */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-700/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-navy-800 text-slate-300 font-semibold hover:bg-navy-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCreate}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#A3E229] hover:bg-[#8ecb1b] text-navy-950 font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {savingCreate ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Registrando Pareja...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Inscribir Pareja Oficial</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURACIÓN BASE DE DATOS EN LA NUBE (FIRESTORE) */}
      {cloudDbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-navy-800 to-navy-900 border border-blue-400/30 rounded-3xl p-5 sm:p-7 shadow-2xl my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-orbitron">
                    Sincronización en la Nube (Firebase Firestore)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Conecta la aplicación a la nube para sincronizar en tiempo real entre todos los dispositivos
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCloudDbModalOpen(false)} 
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-navy-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Estado Actual */}
            <div className={`p-4 rounded-2xl border mb-5 flex items-start gap-3 ${
              isSupabaseConfigured()
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-200'
            }`}>
              {isSupabaseConfigured() ? (
                <Cloud className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <CloudOff className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <div className="font-bold text-sm text-white mb-0.5 flex items-center gap-2">
                  <span>Estado: {isSupabaseConfigured() ? 'Conectado a Supabase en la Nube (Multi-dispositivo)' : 'Almacenamiento Local (Este navegador)'}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {isSupabaseConfigured() ? (
                    <>
                      La base de datos está conectada a <strong>Supabase</strong> en el proyecto: <strong className="text-emerald-300 font-mono">{getSupabaseProjectRef()}</strong>. Todas las inscripciones, ediciones de duplas y confirmaciones se guardan en tiempo real en la nube y son visibles al instante desde cualquier teléfono o computadora.
                    </>
                  ) : (
                    <>
                      Actualmente el sistema está usando almacenamiento local. Para que las inscripciones y ediciones se sincronicen <strong>en tiempo real en cualquier dispositivo</strong> con tu proyecto de Supabase vinculado a GitHub, ingresa la URL y la Anon Key a continuación.
                    </>
                  )}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCloudConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>URL del Proyecto Supabase (Project URL) *</span>
                  <span className="text-[10px] text-slate-400 font-mono">Ej: https://xyzcompany.supabase.co</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                  value={cloudDbForm.supabaseUrl || ''}
                  onChange={(e) => setCloudDbForm({ ...cloudDbForm, supabaseUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 text-white border border-slate-700 font-mono text-xs focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Clave Pública Anónima (Anon Public Key) *</span>
                  <span className="text-[10px] text-slate-400 font-mono">eyJhbGciOi...</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={cloudDbForm.supabaseAnonKey || ''}
                  onChange={(e) => setCloudDbForm({ ...cloudDbForm, supabaseAnonKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 text-white border border-slate-700 font-mono text-xs focus:border-emerald-400"
                />
              </div>

              <div className="bg-navy-950/80 p-3.5 rounded-2xl border border-slate-800 text-[11px] text-slate-300 space-y-2">
                <span className="font-bold text-[#A3E229] block text-xs">🚀 Pasos para vincular tu Supabase en 1 minuto:</span>
                <p>
                  1. En tu panel de <strong>Supabase</strong>, ve a <strong>Project Settings &gt; API</strong> y copia la <strong>Project URL</strong> y la <strong>anon / public key</strong>.
                </p>
                <p>
                  2. En el menú de Supabase ve a <strong>SQL Editor</strong>, abre el archivo <strong className="text-white font-mono">supabase_schema.sql</strong> (creado en la raíz de este proyecto) y haz clic en <strong>RUN</strong> para crear automáticamente las tablas, índices y permisos de lectura/escritura pública en tiempo real.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-700/80">
                <button
                  type="button"
                  onClick={handleClearCloudConfig}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors"
                >
                  Restablecer a Local
                </button>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setCloudDbModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-navy-700 text-slate-300 font-semibold hover:bg-navy-600 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-navy-950 font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-colors"
                  >
                    <Cloud className="w-4 h-4" />
                    <span>Guardar y Conectar Supabase</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA AGREGAR / EDITAR OBSERVACIONES RÁPIDAS DE LA PAREJA */}
      {observationModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-navy-900 border border-amber-500/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-navy-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-orbitron">Observaciones de la Dupla</h3>
                  <p className="text-xs text-slate-400">
                    {observationModalData.playerNames} • <span className="text-gold-400 font-semibold">{observationModalData.categoria}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setObservationModalData(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveObservation} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Notas / Observaciones del Administrador (Opcional)
                </label>
                <textarea
                  rows={4}
                  autoFocus
                  placeholder="Escribe aquí observaciones privadas del comité (ej: Pago pendiente de $70, horarios solicitados, observaciones médicas, etc.)..."
                  value={observationModalData.observaciones}
                  onChange={(e) => setObservationModalData({
                    ...observationModalData,
                    observaciones: e.target.value
                  })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-navy-950 text-white border border-slate-700 focus:border-amber-400 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400/50 resize-y"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  * Este campo es opcional y solo visible para los administradores y en la exportación de Excel / CSV.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setObservationModalData(null)}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingObservation}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-navy-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {savingObservation ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Observación</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
