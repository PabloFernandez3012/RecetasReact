# Recetas de Pablo

Aplicación de recetas con frontend en React y backend en Node.js/Express. Permite crear, listar, editar y eliminar recetas con categorías, imágenes por URL, búsqueda por texto y selección por categorías. Incluye cambio de tema claro/oscuro y un pie de página con acceso rápido a categorías.

---

## Demo

**Sitio en producción:** https://recetas-react-weld.vercel.app

---

## Etiquetas

`react` `vite` `node` `express` `sqlite` `recetas` `crud` `vercel` `render` `railway`

---

## Tabla de contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Gestión de estado con useState](#gestión-de-estado-con-usestate)
- [Requisitos](#requisitos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Desarrollo local](#desarrollo-local)
- [Variables de entorno](#variables-de-entorno-del-frontend)
- [Despliegue](#despliegue)
- [Importación de recetas](#importación-de-recetas-a-la-base-de-datos)
- [Scripts útiles](#scripts-útiles)
- [Notas](#notas)

---

## Características

- **CRUD completo** de recetas (título, descripción, ingredientes, pasos, imagen, categorías)
- **Filtro por categorías** y búsqueda por texto en títulos, descripciones, ingredientes y pasos
- **Menú MegaMenu** con categorías y pie de página con enlaces rápidos
- **Tema claro/oscuro** con selector y persistencia en localStorage
- **Frontend desacoplado** del backend mediante `VITE_API_BASE`
- **Persistencia con SQLite** mediante `better-sqlite3`, migración inicial desde JSON y script de importación

---

## Tecnologías

### Frontend
- React 18
- Vite
- React Router
- SCSS

### Backend
- Node.js
- Express
- better-sqlite3
- nanoid
- CORS

### Herramientas
- concurrently
- nodemon

---

## Gestión de estado con useState

El proyecto utiliza el hook `useState` de React para manejar el estado local en los componentes. A continuación se detallan los casos de uso:

### 📄 RecipeList.jsx (Lista de recetas)
```javascript
const [recipes, setRecipes] = useState([])      // Almacena el array de recetas
const [loading, setLoading] = useState(true)    // Controla el estado de carga
```
- **Propósito:** Gestionar la lista completa de recetas obtenidas del backend y el estado de carga durante el fetch.

### 📖 RecipeDetail.jsx (Detalle de receta)
```javascript
const [recipe, setRecipe] = useState(null)      // Almacena los datos de una receta
const [loading, setLoading] = useState(true)    // Estado de carga
const [error, setError] = useState('')          // Manejo de errores
```
- **Propósito:** Gestionar los detalles de una receta específica, el estado de carga y posibles errores en la petición.

### ✏️ RecipeForm.jsx (Formulario de recetas)
```javascript
const [data, setData] = useState(empty)         // Datos del formulario
const [loading, setLoading] = useState(false)   // Estado durante el envío
```
- **Propósito:** Controlar los campos del formulario (título, ingredientes, pasos, etc.) y el estado de envío al guardar.

### 🍔 MegaMenu.jsx (Menú de navegación)
```javascript
const [open, setOpen] = useState(false)         // Estado del menú (abierto/cerrado)
```
- **Propósito:** Alternar la visibilidad del menú desplegable en dispositivos móviles.

### 🌓 ThemeToggle.jsx (Selector de tema)
```javascript
const [isDark, setIsDark] = useState(() => {
  return localStorage.getItem('theme') === 'dark'
})
```
- **Propósito:** Mantener y sincronizar el tema (claro/oscuro) con localStorage para persistencia entre sesiones.

### Patrón de uso

El proyecto sigue el patrón tradicional de React con `useState` + `useEffect` para:
- Fetching de datos desde la API REST
- Gestión de estados de UI (loading, errores)
- Manejo de formularios controlados
- Interacciones del usuario (menús, temas)

---

## Requisitos

- **Node.js** 18 o superior

---

## Estructura del proyecto

```
recetas/
  backend/
    src/
      db.js
      server.js
      data/
        recipes.json   # Fuente opcional para migración/importación
      scripts/
        import-recipes.js
    package.json
  frontend/
    src/
      components/
      pages/
      styles.scss
      App.jsx
      main.jsx
    index.html
    package.json
  package.json
  README.md
```

---

## Desarrollo local

Instalación de dependencias en monorepo y ejecución en paralelo de frontend y backend.

```powershell
# En la raíz del repositorio
npm install

# Levanta backend (http://localhost:3001) y frontend (http://localhost:5173)
npm run dev
```

**Nota:** Durante el desarrollo, el frontend consume la API en la misma máquina usando rutas relativas a `/api` a través de la configuración de desarrollo.

---

## Variables de entorno del frontend

Para producción, el frontend necesita la URL base del backend mediante `VITE_API_BASE`.

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_BASE` | URL base del backend | `https://tu-backend.onrender.com` |

**Configuración en Vercel:**
1. Ve a Project Settings → Environment Variables
2. Agrega la variable `VITE_API_BASE`
3. Realiza un redeploy

---

## Despliegue

### Frontend (Vercel)
- **URL de producción:** https://recetas-react-weld.vercel.app
- Este repositorio ya está configurado para deploy automático
- **Importante:** Configurar `VITE_API_BASE` apuntando al backend público

### Backend (Render / Railway)

**Servicios recomendados:** Render o Railway

| Configuración | Valor |
|---------------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

---

### Endpoints del backend

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Estado de la API |
| `GET` | `/api/recipes` | Lista de recetas |
| `GET` | `/api/recipes/:id` | Detalle de receta |
| `POST` | `/api/recipes` | Crea una receta |
| `PUT` | `/api/recipes/:id` | Actualiza una receta |
| `DELETE` | `/api/recipes/:id` | Elimina una receta |

**Estructura de receta:**

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "ingredients": ["string"],
  "steps": ["string"],
  "image": "string",
  "category": ["string"],
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

---

## Importación de recetas a la base de datos

El backend incluye un script para importar recetas desde un archivo JSON o módulo JS (ESM) que exporte un array de recetas.

### Uso

```powershell
# Desde la carpeta backend (o usando -w backend desde la raíz)
npm run import:recipes -- ./src/data/recipes.json

# También puedes pasar un archivo externo
node src/scripts/import-recipes.js C:\\ruta\\a\\mis-recetas.json
```

**Nota:** La primera ejecución de la API migrará automáticamente desde `backend/src/data/recipes.json` a SQLite si la tabla está vacía.

---

## Scripts útiles

| Script | Comando | Descripción |
|--------|---------|-------------|
| Desarrollo | `npm run dev` | Backend y frontend en paralelo |
| Backend solo | `npm start` | Inicia solo el backend |
| Build frontend | `npm run build` | Compila el frontend |
| Importar recetas | `npm run import:recipes -w backend` | Ejecuta el importador en el backend |

---

## Notas

- **Seguridad:** El proyecto no incluye autenticación. Si lo despliegas públicamente, considera añadir auth y rate limiting.
- **Persistencia:** SQLite en archivo con WAL habilitado. El archivo se ubica en `backend/src/data/recipes.db`.

---

## Licencia

Este proyecto es de c�digo abierto bajo licencia MIT.
