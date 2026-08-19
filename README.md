# Reitera

SaaS de repetición espaciada para estudiantes de ciclos formativos. Permite organizar el contenido de estudio en asignaturas, temas y exámenes, y programa automáticamente las sesiones de repaso en función del rendimiento del usuario.

> 🌐 En producción: [reitera.dev](https://reitera.dev)

---

## El problema que resuelve

Estudiar sin un sistema lleva a repasar lo mismo sin criterio o a olvidar temas justo antes del examen. Reitera aplica el algoritmo de repetición espaciada para que cada tema se repase en el momento óptimo, ni antes ni después.

---

## Stack

**Backend**
- Java 21 + Spring Boot 4
- Spring Security + JWT (autenticación stateless)
- Spring Data JPA + Hibernate
- PostgreSQL (alojado en Neon)
- Maven

**Frontend**
- React + Vite
- Vanilla CSS

---

## Arquitectura del backend

El backend sigue una arquitectura por capas con patrones consistentes en todas las entidades:

| Capa | Responsabilidad |
|------|----------------|
| **Entity** | Factory method estático `create()` para construcción controlada |
| **RequestDTO** | Clase plana con validaciones (`@NotBlank`, `@NotNull`) |
| **ResponseDTO** | Record con `fromEntity()` para el mapeo a respuesta |
| **Repository** | Interfaz JPA |
| **Service** | Inyección por constructor, lógica de negocio encapsulada |
| **Controller** | REST puro, delega completamente en el servicio |

---

## Algoritmo de repetición espaciada

Cada sesión de repaso (`ReviewSession`) registra la dificultad percibida por el usuario (`AGAIN`, `HARD`, `NORMAL`, `EASY`) y una puntuación numérica (`score`), y recalcula el intervalo del tema. Es una variante de SM-2: cada `Topic` mantiene un `easeFactor` (arranca en 2.5) y un `currentIntervalDays`, que se ajustan en cada repaso (`ReviewSessionService.calculateNextReviewDate`):

| Dificultad | Próximo intervalo                                              | Cambio en `easeFactor` |
|------------|------------------------------------------------------------------|-------------------------|
| `AGAIN`    | 1 día (reinicio)                                                  | −0.2                    |
| `HARD`     | 2 días si es la primera vez; si no, `intervalo actual × easeFactor × 0.8` | −0.15           |
| `NORMAL`   | 4 días si es la primera vez; si no, `intervalo actual × easeFactor`       | sin cambio      |
| `EASY`     | 6 días si es la primera vez; si no, `intervalo actual × easeFactor × 1.3` | +0.15           |

El `easeFactor` nunca baja de 1.3. La próxima fecha de repaso es `hoy + nuevo intervalo`.

Un tema se considera dominado cuando su `currentIntervalDays` alcanza el umbral `MASTERY_THRESHOLD_DAYS` (30 días) — no es un flag persistido, sino una condición calculada en `Topic.isMastered()`. A partir de ahí, `nextReviewDate` pasa a `null` y el tema deja de aceptar nuevas sesiones: el sistema lo rechaza con `TopicAlreadyMasteredException` en lugar de ignorarlo silenciosamente.

Aparte del intervalo real, cada tema guarda un `displayedProgressDays` pensado para la barra de progreso de la interfaz: en vez de saltar directamente al nuevo intervalo, se desplaza como máximo ±3 días por sesión hacia él, salvo que se alcance el umbral de dominio, en cuyo caso salta directamente a 30.

---

## Estadísticas

El endpoint `GET /api/stats` (`StatsController` → `StatsService`) agrega, todo mediante consultas JPQL sobre `ReviewSession`:

- **Total de repasos** del usuario.
- **Distribución por dificultad** (recuento agrupado por `EASY`/`NORMAL`/`HARD`/`AGAIN`).
- **Actividad de los últimos 35 días** (hoy incluido), como una lista de recuentos diarios pensada para pintar un calendario/heatmap.
- **Puntos débiles**: los 5 temas con más sesiones marcadas `HARD` o `AGAIN`.
- **Temas en riesgo**: temas con al menos 2 sesiones cuya puntuación media (`score`) es menor a 6, ordenados de peor a mejor.
- **Comparativa semanal por asignatura**: de las asignaturas con al menos 2 puntuaciones en los últimos 7 días, calcula la puntuación media por asignatura y devuelve la mejor y la peor; si hay menos de dos asignaturas con datos suficientes, no devuelve comparativa (`null`).

---

## Entidades principales

- `User` — Implementa `UserDetails` de Spring Security
- `Subject` — Asignatura
- `Topic` — Tema dentro de una asignatura; su estado de dominio (`isMastered()`) se calcula a partir de `currentIntervalDays` y `nextReviewDate`, no es un campo persistido
- `Exam` — Examen asociado a una asignatura
- `ReviewSession` — Sesión de repaso con dificultad, puntuación (`score`) y fecha de revisión

---

## Seguridad

Autenticación stateless con JWT:

- Token generado con `userId` como subject (JJWT 0.12.6)
- Filtro `JwtAuthFilter` extendiendo `OncePerRequestFilter`
- Rutas públicas: `/api/auth/register` y `/api/auth/login`; el resto requiere autenticación (configurado en `SecurityConfig`)

---

## Despliegue

- Backend en Railway, construido con Dockerfile multi-stage (Maven → JRE 21)
- Frontend en Cloudflare Pages
- Base de datos PostgreSQL gestionada en Neon
- Dominios propios: [reitera.dev](https://reitera.dev) (frontend) y `api.reitera.dev` (API)
- Perfil `prod` de Spring configurado por variables de entorno (datasource, JWT, CORS)

---

## Estado actual

- [x] CRUD completo: Subject, Topic, Exam, ReviewSession
- [x] Algoritmo de repetición espaciada (variante SM-2)
- [x] Módulo de estadísticas
- [x] Manejo global de excepciones (`@ControllerAdvice`)
- [x] Spring Security + JWT
- [x] Frontend React
- [x] Despliegue en producción

---

## Autoría

El backend está escrito íntegramente por mí. El cliente React se generó con asistencia de IA.

---

*Proyecto personal desarrollado tras el primer curso de DAW (Desarrollo de Aplicaciones Web).*
