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
  KeyRound
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  getRegistrations, 
  deleteRegistration, 
  updateRegistrationStatus,
  getCategoryLimits, 
  saveCategoryLimits,
  getSponsors, 
  saveSponsor, 
  deleteSponsor,
  getLandingConfig,
  saveLandingConfig,
  subscribeToLandingConfig,
  PLAYER_STATUSES,
  DEFAULT_MAX_PAIRS_PER_CATEGORY,
  DEFAULT_LANDING_CONFIG,
  subscribeToRegistrations,
  ADMIN_ROLES,
  getAdminUsers,
  saveAdminUser,
  deleteAdminUser
} from '../services/firebase';
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

  // Cupos por categoría
  const [limits, setLimits] = useState({ defaultMax: DEFAULT_MAX_PAIRS_PER_CATEGORY });
  const [editingLimits, setEditingLimits] = useState(false);

  // Configuración de Contenidos & Landing
  const [landingForm, setLandingForm] = useState(DEFAULT_LANDING_CONFIG);
  const [savingLanding, setSavingLanding] = useState(false);

  // Patrocinadores
  const [sponsorsList, setSponsorsList] = useState([]);
  const [sponsorModal, setSponsorModal] = useState(null);

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

  // Cambio de status de un jugador / pareja
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRegistrationStatus(id, newStatus);
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      setFeedback({ 
        type: 'success', 
        message: `Estado actualizado a "${newStatus.toUpperCase()}". ${newStatus === 'confirmado' ? '¡Ahora es visible en Parejas Confirmadas!' : ''}` 
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
      'Monto': r.monto || '$150',
      'Método de Pago': r.metodoPago || 'No especificado',
      'Referencia / ID Pago': r.referenciaPago || 'Sin referencia',
      'Comprobante Adjunto': r.comprobantePagoUrl ? 'SÍ' : 'NO',

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
      { wch: 22 }, // Referencia
      { wch: 14 }, // Comprobante
      
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
      'Nro', 'Fecha', 'Categoria', 'Status', 'Monto', 'Metodo_Pago', 'Referencia_Pago', 'Comprobante_Adjunto',
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
      clean(r.monto || '$150'),
      clean(r.metodoPago || ''),
      clean(r.referenciaPago || ''),
      clean(r.comprobantePagoUrl ? 'SI' : 'NO'),

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
    <div className="min-h-screen bg-navy-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* BARRA SUPERIOR ADMIN */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center font-bold">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Panel de Administración Oficial
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Copa Navidad LMSC 2026 • Control de Inscripciones, Landing, Cupos y Patrocinadores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden sm:flex flex-col items-end text-right pr-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-gold-400" />
                {currentUser.nombre || 'Administrador'}
              </span>
              <span className="text-[10px] text-gold-400 font-semibold uppercase tracking-wider">
                {currentUser.rol || 'Super Admin'}
              </span>
            </div>
          )}

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-2 transition-colors"
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
            ? 'bg-red-500/20 text-red-200 border-red-500/40' 
            : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
        }`}>
          {feedback.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* PESTAÑAS DE ADMINISTRACIÓN */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('inscripciones')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'inscripciones'
              ? 'bg-gold-500 text-navy-900 shadow-glow-gold'
              : 'bg-navy-800 text-slate-300 hover:text-white border border-slate-700/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Inscripciones ({totalInscritos})</span>
        </button>

        <button
          onClick={() => setActiveTab('landing')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'landing'
              ? 'bg-gold-500 text-navy-900 shadow-glow-gold'
              : 'bg-navy-800 text-slate-300 hover:text-white border border-slate-700/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Contenidos & Landing</span>
        </button>

        <button
          onClick={() => setActiveTab('cupos')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'cupos'
              ? 'bg-gold-500 text-navy-900 shadow-glow-gold'
              : 'bg-navy-800 text-slate-300 hover:text-white border border-slate-700/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Control de Cupos</span>
        </button>

        <button
          onClick={() => setActiveTab('patrocinadores')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'patrocinadores'
              ? 'bg-gold-500 text-navy-900 shadow-glow-gold'
              : 'bg-navy-800 text-slate-300 hover:text-white border border-slate-700/60'
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>Patrocinadores ({sponsorsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'roles'
              ? 'bg-gold-500 text-navy-900 shadow-glow-gold'
              : 'bg-navy-800 text-slate-300 hover:text-white border border-slate-700/60'
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
                    placeholder="Cupos Limitados (24 parejas por categoría)"
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
                    Fechas Oficiales del Torneo
                  </label>
                  <input
                    type="text"
                    value={landingForm.heroFechas || ''}
                    onChange={(e) => setLandingForm({ ...landingForm, heroFechas: e.target.value })}
                    placeholder="del xx al xx de diciembre"
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sede Oficial
                  </label>
                  <input
                    type="text"
                    value={landingForm.heroSede || ''}
                    onChange={(e) => setLandingForm({ ...landingForm, heroSede: e.target.value })}
                    placeholder="La Marina Sport Club, Lechería"
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
                  placeholder="Cierra el año compitiendo en el evento de pádel..."
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

            {/* SECCIÓN B: DETALLES DE CADA MÉTODO DE PAGO */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">
                2. Cuentas y Datos de los Métodos de Pago
              </h3>
              <p className="text-xs text-slate-400">
                Esta información se despliega de forma dinámica a los jugadores al seleccionar su forma de pago.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1">
                    Datos de Pago Móvil (Tasa BCV)
                  </label>
                  <textarea
                    rows="4"
                    value={landingForm.pagoMovilDetalle || ''}
                    onChange={(e) => setLandingForm({ ...landingForm, pagoMovilDetalle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 font-mono text-slate-300 border border-slate-700 text-xs"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-400 mb-1">
                    Datos de Zelle (USD)
                  </label>
                  <textarea
                    rows="4"
                    value={landingForm.zelleDetalle || ''}
                    onChange={(e) => setLandingForm({ ...landingForm, zelleDetalle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 font-mono text-slate-300 border border-slate-700 text-xs"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-400 mb-1">
                    Datos de Banesco Panamá (USD)
                  </label>
                  <textarea
                    rows="4"
                    value={landingForm.banescoPanamaDetalle || ''}
                    onChange={(e) => setLandingForm({ ...landingForm, banescoPanamaDetalle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 font-mono text-slate-300 border border-slate-700 text-xs"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1">
                    Datos de Binance Pay (USDT)
                  </label>
                  <textarea
                    rows="4"
                    value={landingForm.binancePayDetalle || ''}
                    onChange={(e) => setLandingForm({ ...landingForm, binancePayDetalle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 font-mono text-slate-300 border border-slate-700 text-xs"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* SECCIÓN C: GESTIÓN DE REGLAMENTO OFICIAL (PDF < 1MB & ENLACE & TEXTO) */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                3. Reglamento Oficial del Club y Torneo
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
                className="px-8 py-3 rounded-2xl bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-sm flex items-center gap-2 shadow-glow-gold transition-all"
              >
                <Save className="w-5 h-5" />
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-gold-400" />
                  Gestión de Patrocinadores & Aliados
                </h2>
                <p className="text-xs text-slate-400">
                  Asigna logos y enlaces externos para cada marca. Se visualizarán en la web pública en escala de grises con hover a color.
                </p>
              </div>

              <button
                onClick={() => setSponsorModal({ id: '', name: '', tier: 'Auspiciador Oficial', logo: '', link: 'https://' })}
                className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-900 text-xs font-bold flex items-center gap-2 shadow-glow-gold"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Patrocinador</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sponsorsList.map(sp => (
                <div key={sp.id} className="bg-navy-800/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300">
                        {sp.tier}
                      </span>
                      {sp.link && (
                        <a href={sp.link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

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

                    <h4 className="text-sm font-bold text-white mt-1">{sp.name}</h4>
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
                className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-900 text-xs font-bold flex items-center gap-2 shadow-glow-gold transition-all"
              >
                <Plus className="w-4 h-4" />
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

              {/* Botones de Exportar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exportar Excel</span>
                </button>

                <button
                  onClick={exportToCSV}
                  className="px-3.5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
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

                          {/* Acciones: Ver Ficha & Eliminar */}
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
                  placeholder="Ej: /assets/sponsor_el_parador.png o https://..."
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
                  placeholder="Ej: clave123 o pin numérico"
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

    </div>
  );
}
