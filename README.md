# ✂️ BarberSaaS — Sistema de Gestión para Barberías

> Plataforma SaaS full-stack para la gestión integral de barberías: reservas, staff, servicios y sucursales — lista para producción con Docker.

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://supabase.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docs.docker.com/compose)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 📌 ¿Qué es BarberSaaS?

Sistema web multi-rol para barberías con soporte de múltiples sucursales. Permite a **dueños** administrar el negocio completo, a **barberos** gestionar su agenda diaria y a **clientes** reservar turnos desde cualquier dispositivo.

Construido con una arquitectura moderna: API REST stateless con Spring Boot + JWT en el backend, y una SPA React completamente tipada en el frontend. El stack completo levanta con un solo comando Docker.

---

## 🖥️ Demo visual

| Login | Panel Cliente | Wizard de Reservas | Panel Admin |
|:-----:|:-------------:|:------------------:|:-----------:|
| ![Login](https://github.com/user-attachments/assets/f787df48-7564-4241-b294-ffacddc92d8e) | ![Cliente](https://github.com/user-attachments/assets/9456ccda-4964-4792-8da6-33ca319affd1) | ![Wizard](https://github.com/user-attachments/assets/1ade4547-a967-49f7-9e61-af3996d65c70) | ![Admin](https://github.com/user-attachments/assets/f3b97925-c79c-4762-81f9-6f235d5789c0) |

---

## ✨ Funcionalidades

### 👤 Cliente
- Registro e inicio de sesión con JWT
- **Wizard de reservas en 5 pasos**: sucursal → servicio → barbero → horario → confirmación
- Barberos filtrados automáticamente según la sucursal seleccionada
- Slots de horario calculados en tiempo real según disponibilidad y duración del servicio
- Historial de turnos con estado en tiempo real (PENDIENTE / COMPLETADO / CANCELADO)
- Cancelación de turnos propios con un click

### ✂️ Barbero
- Agenda diaria filtrada automáticamente por usuario autenticado
- Cambio de estado de turnos: **Completado** / **Cancelado**
- Registro de clientes **walk-in** (sin cuenta previa) desde el mismo panel
- Slots disponibles calculados en tiempo real, validando solapamientos

### 🏢 Dueño / Admin
- Dashboard con métricas globales: usuarios, servicios, sucursales y turnos
- Tabla de últimos turnos con cliente, barbero, servicio, fecha y estado
- Turno walk-in disponible también desde el panel administrativo
- **CRUD de Staff** — alta y baja de barberos
- **CRUD de Servicios** — nombre, duración en minutos y precio
- **CRUD de Sucursales** — nombre, dirección y teléfono
- **Gestión de horarios** por barbero, día y sucursal
- Soft delete con badge visual de estado (INACTIVO / CERRADA)

---

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│                     Docker Compose                       │
│                                                          │
│  ┌───────────────┐        ┌────────────────────────┐     │
│  │   Frontend    │        │       Backend          │     │
│  │  React + Vite │◄──────►│    Spring Boot 4       │     │
│  │  Nginx :80    │  HTTP  │    Java 17 :8080       │     │
│  └───────────────┘        └──────────┬─────────────┘     │
│                                      │ JPA / Hibernate   │
│                                      ▼                   │
│                            ┌─────────────────┐           │
│                            │   PostgreSQL    │           │
│                            │   (Supabase)    │           │
│                            └─────────────────┘           │
└──────────────────────────────────────────────────────────┘
```

**Flujo de autenticación:**
```
Cliente → POST /api/auth/login → JWT (24h) → Bearer Token en cada request
                                              ↓
                                    JwtFilter valida → Controller → Service → DB
```

---

## 🛠️ Stack tecnológico

### Backend
| Tecnología | Versión | Rol |
|---|---|---|
| Java | 17 | Lenguaje |
| Spring Boot | 4.0.3 | Framework principal |
| Spring Security + JJWT | 0.11.5 | Autenticación JWT stateless |
| Spring Data JPA + Hibernate | — | ORM y persistencia |
| PostgreSQL | — | Base de datos (Supabase cloud) |
| BCrypt | — | Hash de contraseñas |
| Maven | 3.8+ | Build tool |

### Frontend
| Tecnología | Versión | Rol |
|---|---|---|
| React | 18.3.1 | UI |
| TypeScript | 5 | Tipado estático |
| Vite | 6 | Bundler y dev server |
| React Router | v7 | Navegación SPA |
| Tailwind CSS | v4 | Estilos utilitarios |
| shadcn/ui + Radix UI | — | Componentes accesibles |
| Sonner | — | Notificaciones toast |
| Lucide React | — | Iconografía |

### Infraestructura
| Tecnología | Rol |
|---|---|
| Docker + Docker Compose | Orquestación de servicios |
| Nginx | Servidor y reverse proxy del frontend |
| Supabase | PostgreSQL gestionado en la nube |

---

## 🔐 Seguridad

- **BCrypt** para hash de contraseñas — nunca expuestas en respuestas (patrón DTO)
- **JWT Bearer Token** firmado con HMAC-SHA256, validez de 24 horas
- **JwtFilter** intercepta y valida cada request antes del controlador
- **CORS** configurado por origen explícito, sin wildcards en producción
- **Soft delete** en lugar de DELETE físico — preserva integridad referencial histórica

### Matriz de permisos

| Endpoint | CLIENTE | BARBERO | DUEÑO |
|---|:---:|:---:|:---:|
| `POST /api/auth/login` | ✅ | ✅ | ✅ |
| `POST /api/auth/register` | ✅ | ✅ | ✅ |
| `POST /api/auth/setup` | ✅ solo 1 vez | ✅ solo 1 vez | ✅ solo 1 vez |
| `GET /api/turnos` | ✅ propios | ✅ propios | ✅ todos |
| `POST /api/turnos` | ✅ | ✅ | ✅ |
| `PUT /api/turnos/{id}/estado` | ✅ | ✅ | ✅ |
| `POST /api/turnos/walkin` | ❌ | ✅ | ✅ |
| `GET /api/usuarios/barberos` | ✅ | ✅ | ✅ |
| `GET /api/usuarios` | ❌ | ❌ | ✅ |
| `DELETE /api/usuarios/{id}` | ❌ | ❌ | ✅ |
| `POST /api/auth/crear-staff` | ❌ | ❌ | ✅ |
| `POST/DELETE /api/servicios/**` | ❌ | ❌ | ✅ |
| `POST/DELETE /api/sucursales/**` | ❌ | ❌ | ✅ |
| `POST/DELETE /api/horarios/**` | ❌ | ❌ | ✅ |

---

## ✨ Decisiones técnicas destacadas

**Validación de solapamiento anti-overbooking**

La validación se ejecuta en base de datos con una query JPQL que compara intervalos. Evita condiciones de carrera si dos requests llegan simultáneamente:

```java
@Query("""
    SELECT t FROM Turno t
    WHERE t.barbero.id    = :barberoId
      AND t.estado       != 'CANCELADO'
      AND t.fechaHoraInicio < :fin
      AND t.fechaHoraFin   > :inicio
""")
List<Turno> findSolapados(Long barberoId, LocalDateTime inicio, LocalDateTime fin);
```

**Cálculo automático de `fechaHoraFin`**

El backend calcula el fin del turno a partir de la duración del servicio. El cliente solo envía la hora de inicio:

```java
LocalDateTime fin = inicio.plusMinutes(servicio.getDuracionMinutos());
turno.setFechaHoraFin(fin);
```

**HTTP client centralizado (`apiClient.ts`)**

Todas las llamadas pasan por un único wrapper que agrega el JWT automáticamente y redirige al login si el token expira:

```typescript
if (response.status === 401) {
  localStorage.clear();
  window.location.href = '/';
  throw new Error("Sesión expirada");
}
```

**Setup de primer administrador auto-bloqueante**

El endpoint `POST /api/auth/setup` crea el primer usuario DUEÑO sin requerir autenticación. Una vez que existe al menos un DUEÑO en la base de datos, el endpoint devuelve `403` permanentemente — sin flags de entorno ni intervención manual:

```java
if (usuarioRepository.existsByRol("DUEÑO")) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body("{\"error\": \"El sistema ya fue inicializado.\"}");
}
```

---

## 📁 Estructura del repositorio

```
BarberSaaS/
├── backend/
│   └── src/main/java/com/example/bareberiaapi/
│       ├── controller/         → Endpoints REST
│       ├── service/            → Lógica de negocio
│       ├── repository/         → JPA + queries JPQL
│       ├── entity/             → Modelos JPA
│       ├── security/           → JWT, filtros, SecurityConfig
│       ├── config/             → CORS, GlobalExceptionHandler
│       └── dto/                → AuthResponse, LoginRequest, UsuarioDTO, WalkInRequest
│
├── frontend/src/app/
│   ├── components/
│   │   ├── admin/              → AdminDashboard, StaffManagement,
│   │   │                         ServicesManagement, BranchManagement, ScheduleConfig
│   │   ├── barber/             → BarberLayout, BarberDashboard, WalkInModal
│   │   ├── client/             → ClientLayout, ClientDashboard, BookingWizard
│   │   ├── auth/               → ProtectedRoute
│   │   ├── login/              → LoginPage
│   │   └── ui/                 → Componentes shadcn/ui
│   ├── utils/
│   │   └── apiClient.ts        → HTTP client centralizado con JWT
│   ├── constants.ts            → Tokens de diseño y sistema de temas
│   └── routes.tsx              → Router con rutas protegidas por rol
│
├── docs/                       → Capturas de pantalla
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚙️ Instalación y ejecución

### Prerrequisitos
- [Docker](https://www.docker.com/get-started) y Docker Compose
- Una base de datos PostgreSQL (podés usar [Supabase](https://supabase.com) gratis)

### 1. Clonar el repositorio

```bash
git clone https://github.com/MateoBertello/Sistema-SaaS-de-Gesti-n-para-Barber-as-.git
cd Sistema-SaaS-de-Gesti-n-para-Barber-as-
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Completar `.env`:

```env
DB_URL=jdbc:postgresql://<host>:<puerto>/<nombre_db>
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
JWT_SECRET=cambia_esto_por_una_clave_segura_de_32_caracteres
```

### 3. Levantar el stack

```bash
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost |
| API REST | http://localhost:8080/api |

### 4. Crear el primer administrador

La primera vez que levantás el sistema, no existe ningún usuario DUEÑO. Ejecutá este request una sola vez:

```bash
curl -X POST http://localhost:8080/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Tu Nombre",
    "email": "admin@tudominio.com",
    "contrasena": "tu-contraseña-segura"
  }'
```

La respuesta incluye el JWT listo para usar. Desde ese momento el endpoint queda bloqueado para siempre — cualquier llamada posterior devuelve `403 El sistema ya fue inicializado.`

### Desarrollo local (sin Docker)

```bash
# Backend
cd backend && ./mvnw spring-boot:run

# Frontend (otra terminal)
cd frontend && npm install && npm run dev
```

---

## 🚀 Deploy

El proyecto está diseñado para deployarse en cualquier servidor con Docker:

- **Railway** — soporta Docker Compose directamente
- **Render** — servicios separados de backend y frontend
- **VPS (DigitalOcean, Vultr)** — máximo control con el mismo `docker compose up`

---

## 👨‍💻 Autor

**Mateo Bertello** — Desarrollador Back

[![GitHub](https://img.shields.io/badge/GitHub-MateoBertello-181717?style=flat-square&logo=github)](https://github.com/MateoBertello)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Mateo_Bertello-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/mateo-ignacio-bertello-3386193a0)
