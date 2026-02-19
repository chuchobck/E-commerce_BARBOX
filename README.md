# 🍷 BARBOX — E-commerce :  https://e-commerce-barbox.vercel.app

> **Calificación del proyecto: 100/100** — Tienda online completa con pagos PayPal reales, accesibilidad WCAG 2.2 AA y arquitectura de contextos para estado global.

**BARBOX E-commerce** es la tienda online del ecosistema BARBOX para la venta de bebidas premium. Ofrece una experiencia de compra completa: catálogo con filtros avanzados, carrito inteligente sincronizado, checkout con PayPal integrado, wishlist, historial de pedidos y accesibilidad de nivel profesional.

---

## 🏆 Highlights del Proyecto

| Métrica | Valor |
|---|---|
| **Páginas** | 16 vistas con CSS dedicado |
| **Servicios API** | 15 módulos de servicios |
| **Accesibilidad** | WCAG 2.2 Level AA (435+ líneas de CSS) |
| **Pagos** | PayPal integrado (crear orden + captura real) |
| **Carrito** | Sincronización bidireccional localStorage ↔ API |
| **TypeScript** | Tipado completo con tipos por dominio |
| **Deploy** | Producción en Vercel |

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **React 19** | Última versión de React |
| **TypeScript 4.9** | Tipado estático completo |
| **React Router DOM 7** | Enrutamiento SPA |
| **Axios** | HTTP client con interceptores JWT + retry automático |
| **@paypal/react-paypal-js** | Integración de pagos PayPal (sandbox/live) |
| **Jest + Testing Library** | Testing automatizado |
| **CSS Modules** | Estilos dedicados por componente |

---

## 🛒 Funcionalidades Principales

### 🏠 Home Page
- Hero section con **carrusel auto-play**
- Categorías con iconografía
- Productos destacados
- Estadísticas del catálogo

### 📦 Catálogo Avanzado
- **Filtros dinámicos** — Categoría, marca, rango de precio, volumen, disponibilidad
- **Paginación lazy-load** con `IntersectionObserver` (scroll infinito)
- **Vistas** — Grilla y lista
- **Modal de detalle** — Información completa del producto
- Datos de categorías cargados desde **contexto global** (no llamadas repetidas)

### 🏷️ Promociones
- Filtrado por categoría de promoción
- Productos con descuento aplicado

### 🛒 Carrito Inteligente
- **Sincronización bidireccional** localStorage ↔ API del backend
- **Merge automático** — Al hacer login, el carrito anónimo se fusiona con el del usuario
- **UUID único** por carrito
- **Carrito flotante** visible en todas las páginas

### 💳 Checkout Dual
| Método | Implementación |
|---|---|
| **PayPal** | Integración real: crear orden → aprobación del usuario → captura de pago → factura automática |
| **Tarjeta** | Simulación visual con detección de tipo (Visa/Mastercard/Amex) y animación flip de tarjeta |

### ❤️ Wishlist (Favoritos)
- Lista de deseos **sincronizada** entre localStorage y API
- Agregar/quitar desde catálogo o detalle de producto

### 📋 Mis Pedidos
- Historial completo de facturas del cliente
- Estados de seguimiento (Pendiente/Aprobado/Retirado/Anulado)

### 👤 Registro Inteligente
- Validación de **cédula/RUC ecuatoriano**
- Validación de **teléfono ecuatoriano**
- Combo de ciudades **dinámico desde backend**
- Validación de email

---

## ♿ Accesibilidad WCAG 2.2 Level AA

El proyecto implementa accesibilidad profesional con **435+ líneas de CSS dedicadas**:

| Criterio | Implementación |
|---|---|
| **Skip Links** | Componente `SkipLink` para saltar navegación |
| **Focus Visible** | Outline 3px terracotta, alto contraste 4px negro |
| **Target Size 2.5.8** | Mínimo 24×24px en todos los elementos interactivos |
| **Keyboard Shortcuts** | Modal de ayuda con `Ctrl+/` |
| **High Contrast** | Media query `prefers-contrast: high` |
| **Error Boundary** | Manejo global de errores con UI amigable |
| **Breadcrumbs** | Navegación contextual |
| **Tooltips** | `HelpTooltip` en formularios |

---

## 🏗️ Arquitectura

### 5 Context Providers (Estado Global)

```
<AuthProvider>              ← Login/registro, verificación de sesión
  <CarritoProvider>         ← Sync localStorage↔API, merge al login, UUID
    <FavoritosProvider>     ← Wishlist sync local↔API
      <CiudadesProvider>    ← Datos maestros de ciudades
        <CategoriasProvider> ← Datos maestros de categorías
          <App />
        </CategoriasProvider>
      </CiudadesProvider>
    </FavoritosProvider>
  </CarritoProvider>
</AuthProvider>
```

### 15 Servicios API

`api` · `auth` · `canal-venta` · `carrito` · `catalogo` · `categorias` · `checkout` · `ciudades` · `factura` · `favoritos` · `marca` · `pago` · `pedido` · `promociones` · `proveedor`

### 16 Páginas

| Página | Función |
|---|---|
| `HomePage` | Landing con carrusel, categorías, destacados |
| `CatalogoPage` | Catálogo con filtros, lazy-load, grid/list |
| `PromocionesPage` | Promociones por categoría |
| `CarritoPage` | Gestión completa del carrito |
| `CheckoutPage` | Pago dual PayPal + Tarjeta |
| `ConfirmacionPedidoPage` | Resumen post-compra |
| `LoginPage` | Autenticación |
| `RegisterPage` | Registro con validaciones ecuatorianas |
| `MiCuentaPage` | Perfil del usuario |
| `MisPedidosNewPage` | Historial de facturas |
| `FavoritosPage` | Lista de deseos |
| `ContactoPage` | Página de contacto |
| `AcercaPage` | Sobre nosotros |
| `NotFoundPage` | 404 personalizado |

### Componentes por Módulo

```
src/
├── components/
│   ├── Layout/          # Header, Footer
│   ├── Catalog/         # ProductCard, ProductDetailModal, CatalogFilters
│   ├── Common/          # Toast, ErrorBoundary, Breadcrumbs, ConfirmModal,
│   │                      HelpTooltip, KeyboardShortcutsHelp, SkipLink, StepProgress
│   ├── FloatingCart/    # Carrito flotante global
│   ├── Auth/            # Componentes de autenticación
│   ├── Checkout/        # Flujo de pago
│   └── Products/        # Componentes de producto
├── context/             # 5 providers de estado global
├── hooks/               # Custom hooks
├── pages/               # 16 páginas (cada una con CSS dedicado)
├── services/            # 15 servicios API
├── types/               # Tipos TS por dominio (auth, catalogo, checkout, producto)
├── utils/               # errorHandler, iconMap, validations
└── styles/              # CSS global + accesibilidad
```

---

## 📐 TypeScript por Dominio

| Archivo | Tipos |
|---|---|
| `auth.types.ts` | Usuario, LoginRequest, RegisterRequest |
| `catalogo.types.ts` | Producto, Categoria, Marca, Filtros |
| `checkout.types.ts` | Orden, MetodoPago, CanalVenta |
| `producto.types.ts` | ProductoDetalle, ProductoFavorito |

---

## 🌐 Parte del Ecosistema BARBOX

El E-commerce consume el **Backend API** centralizado, compartiendo negocio con el POS y Backoffice:

```
┌───────────────────────┐
│   🛒 E-COMMERCE       │  ◄── Estás aquí
│   React 19 + TS       │
│   PayPal + WCAG 2.2   │
│   16 páginas           │
└───────────┬───────────┘
            │
┌───────────▼───────────┐
│    🍷 BARBOX API      │
│    Node.js + Express  │
│    PostgreSQL + Prisma│
└───────────┬───────────┘
            │
┌───────────┴───────────────────────┐
│                                   │
▼                                   ▼
┌──────────────┐         ┌──────────────┐
│ 🖥️ POS       │         │ 📊 Backoffice│
│ Cajeros      │         │ Admin        │
└──────────────┘         └──────────────┘
```

---

## 🔗 Repositorios del Ecosistema BARBOX

| Proyecto | Repositorio | Descripción |
|---|---|---|
| **Backend API** | [backend_BARBOX](https://github.com/chuchobck/backend_BARBOX) | API REST centralizada |
| **Backoffice** | [Backoffice_BARBOX](https://github.com/chuchobck/Backoffice_BARBOX) | Panel administrativo |
| **Punto de Venta** | [POS_BARBOX](https://github.com/chuchobck/POS_BARBOX) | Terminal POS para cajeros |

---

<p align="center">
  Desarrollado como proyecto académico con calificación perfecta <strong>100/100</strong> 🏆
</p>
