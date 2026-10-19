-- ==============================================================================
-- SCHEMA SQL PARA SUPABASE - COPA NAVIDAD LMSC 2026
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase (Dashboard -> SQL Editor)
-- ==============================================================================

-- 1. TABLA DE REGISTROS DE DUPLAS (INSCRIPCIONES)
CREATE TABLE IF NOT EXISTS public.registrations (
    id TEXT PRIMARY KEY,
    categoria TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'preinscrito',
    monto TEXT DEFAULT '$140',
    metodo_pago TEXT,
    referencia_pago TEXT,
    comprobante_url TEXT,
    comprobante_nombre TEXT,
    acepta_reglamento TEXT DEFAULT 'si',
    jugador1 JSONB NOT NULL DEFAULT '{}'::jsonb,
    jugador2 JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas y filtros rápidos
CREATE INDEX IF NOT EXISTS idx_registrations_categoria ON public.registrations(categoria);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations(created_at DESC);

-- 2. TABLA DE CONFIGURACIÓN DEL TORNEO (LANDING, CUPOS, REGLAMENTO)
CREATE TABLE IF NOT EXISTS public.tournament_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA DE PATROCINADORES Y ALIADOS
CREATE TABLE IF NOT EXISTS public.sponsors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tier TEXT,
    logo TEXT NOT NULL,
    link TEXT,
    is_hero BOOLEAN DEFAULT FALSE,
    logo_height INT DEFAULT 65,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA DE USUARIOS ADMINISTRADORES (ROLES Y ACCESOS)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    rol TEXT NOT NULL DEFAULT 'Comité Organizador',
    pin TEXT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. POLÍTICAS DE ACCESO (ROW LEVEL SECURITY - RLS)
-- Habilitar RLS en todas las tablas
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas públicas permisivas para la app web (lectura y registro)
DROP POLICY IF EXISTS "Permitir lectura publica de registros" ON public.registrations;
CREATE POLICY "Permitir lectura publica de registros" ON public.registrations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion publica de registros" ON public.registrations;
CREATE POLICY "Permitir insercion publica de registros" ON public.registrations
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion publica de registros" ON public.registrations;
CREATE POLICY "Permitir actualizacion publica de registros" ON public.registrations
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir eliminacion publica de registros" ON public.registrations;
CREATE POLICY "Permitir eliminacion publica de registros" ON public.registrations
    FOR DELETE USING (true);

-- Configuración y Textos
DROP POLICY IF EXISTS "Permitir acceso total a configuracion" ON public.tournament_config;
CREATE POLICY "Permitir acceso total a configuracion" ON public.tournament_config
    FOR ALL USING (true) WITH CHECK (true);

-- Patrocinadores
DROP POLICY IF EXISTS "Permitir acceso total a patrocinadores" ON public.sponsors;
CREATE POLICY "Permitir acceso total a patrocinadores" ON public.sponsors
    FOR ALL USING (true) WITH CHECK (true);

-- Usuarios Admin
DROP POLICY IF EXISTS "Permitir acceso a usuarios admin" ON public.admin_users;
CREATE POLICY "Permitir acceso a usuarios admin" ON public.admin_users
    FOR ALL USING (true) WITH CHECK (true);

-- 6. HABILITAR REALTIME EN SUPABASE PARA LA TABLA DE REGISTROS Y CONFIGURACIÓN
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.registrations, public.tournament_config, public.sponsors;
COMMIT;
