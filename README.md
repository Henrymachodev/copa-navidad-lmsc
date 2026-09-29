# 🏆 Copa Navidad LMSC 2026 - Plataforma Web Oficial

Aplicación web moderna y responsiva construida con **React**, **Tailwind CSS**, **Lucide Icons** y **Firebase Firestore** para la inscripción de parejas en el torneo *Copa Navidad de La Marina Sporting Club (LMSC)*.

Incluye:
1. **Landing & Formulario de Inscripción:** Validación en tiempo real para categorías (2da a 7ma Masc, 3ra a 7ma Fem, Master +45) y datos de ambos jugadores.
2. **Integración con Firestore:** Almacenamiento seguro en la nube y tiempo real.
3. **Sistema de Correos de Confirmación:** Opciones con Firebase Cloud Functions o Webhook de Make.com.
4. **Dashboard de Administración Privado:** Tabla de parejas inscritas con búsqueda, filtros y exportación a **Excel (.xlsx)** y **CSV**.

---

## 🚀 1. Instalación y Comandos de Terminal

### Paso 1: Instalar dependencias
En la carpeta raíz del proyecto, ejecuta:
```bash
npm install
```

### Paso 2: Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación se abrirá en `http://localhost:3000`.

### Paso 3: Compilar para producción
```bash
npm run build
```

---

## ⚙️ 2. Configuración de Firebase Firestore

1. Ingresa a la consola de [Firebase Console](https://console.firebase.google.com/) y crea un proyecto (ej: `copa-navidad-lmsc`).
2. En el menú izquierdo, haz clic en **Firestore Database** -> **Crear base de datos**.
3. Selecciona el modo que prefieras (Modo de prueba para desarrollo inicial).
4. Ve a la tuerca ⚙️ **Configuración del proyecto** -> Sección **Tus apps** -> Selecciona el icono Web `</>` para registrar la app.
5. Copia los valores del objeto `firebaseConfig` y pégalos en tu archivo `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=copa-navidad-lmsc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=copa-navidad-lmsc
VITE_FIREBASE_STORAGE_BUCKET=copa-navidad-lmsc.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:...

# Contraseña para entrar al Dashboard de Administrador
VITE_ADMIN_PIN=admin123
VITE_ADMIN_EMAIL=tu_correo@gmail.com
```

### Reglas de Seguridad recomendadas para Firestore:
En la pestaña **Reglas** de Firestore:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inscripciones_copa_navidad/{document} {
      allow create: if true; // Cualquier participante puede registrarse
      allow read, update, delete: if true; // En producción puedes restringir a administradores
    }
  }
}
```

---

## 📧 3. Correos de Confirmación Automáticos

Tienes dos opciones listas:

### Opción A: Webhook con Make.com (Recomendada - Rápida, Gratuita y Sin Tarjeta)
1. Crea una cuenta gratuita en [Make.com](https://www.make.com/).
2. Crea un nuevo Escenario:
   - **Módulo 1:** `Custom Webhook` (Copia la URL generada).
   - **Módulo 2:** `Gmail` o `Email` -> "Send an email" para enviar al Jugador 1 y 2.
   - **Módulo 3:** `Gmail` o `Email` -> "Send an email" para notificar al Administrador.
3. Pega la URL del webhook en tu `.env`:
   ```env
   VITE_WEBHOOK_MAKE_URL=https://hook.eu1.make.com/tu_codigo_aqui
   ```
¡Listo! Cada vez que una pareja se inscriba, Make enviará los correos en menos de 2 segundos.

### Opción B: Firebase Cloud Functions (En la carpeta `/functions`)
El proyecto ya cuenta con el código listo en `functions/index.js` usando Nodemailer.
1. Instala Firebase CLI si no lo tienes:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init functions
   ```
2. Instala dependencias en functions:
   ```bash
   cd functions
   npm install
   ```
3. Configura tus variables de entorno para correo (ej. contraseña de aplicación de Gmail):
   ```bash
   firebase functions:secrets:set SMTP_PASS
   ```
4. Despliega la función:
   ```bash
   firebase deploy --only functions
   ```

---

## 📊 4. Dashboard de Administración & Exportar a Excel

- Puedes acceder al panel de administración haciendo clic en **"Panel Admin"** en el encabezado o en el pie de página.
- Ingresa el PIN (por defecto: `admin123`, configurable en `.env`).
- Podrás:
  - Ver el total de parejas inscritas y distribución por categorías.
  - Buscar jugadores por nombre, correo o teléfono.
  - Filtrar por categoría (2da a 7ma Masc, 3ra a 7ma Fem, Master +45).
  - Hacer clic en **"Exportar Excel (.xlsx)"** para descargar la planilla oficial con formato y fecha.
  - Hacer clic en **"CSV"** para exportación compatible con cualquier sistema.
