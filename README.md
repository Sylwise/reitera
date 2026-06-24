# Reitera

SaaS de repetición espaciada para estudiantes de ciclos formativos. Permite organizar el contenido de estudio en asignaturas, temas y exámenes, y programa automáticamente las sesiones de repaso en función del rendimiento del usuario.

> 🚧 En desarrollo activo — pendiente de despliegue.

---

## El problema que resuelve

Estudiar sin un sistema lleva a repasar lo mismo sin criterio o a olvidar temas justo antes del examen. Reitera aplica el algoritmo de repetición espaciada para que cada tema se repase en el momento óptimo, ni antes ni después.

---

## Stack

**Backend**
- Java 21 + Spring Boot 3
- Spring Security + JWT (autenticación stateless)
- Spring Data JPA + Hibernate
- MySQL
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

Cada sesión de repaso (`ReviewSession`) registra la dificultad percibida por el usuario y calcula la próxima fecha de revisión:

| Dificultad | Próximo repaso |
|------------|---------------|
| `EASY`     | +21 días      |
| `NORMAL`   | +14 días      |
| `HARD`     | +7 días       |

Un tema marcado como dominado (`mastered = true`) no acepta nuevas sesiones — el sistema lo rechaza con una excepción específica en lugar de ignorarlo silenciosamente.

---

## Entidades principales

- `User` — Implementa `UserDetails` de Spring Security
- `Subject` — Asignatura
- `Topic` — Tema dentro de una asignatura, con estado `mastered`
- `Exam` — Examen asociado a una asignatura
- `ReviewSession` — Sesión de repaso con dificultad y fecha de próxima revisión

---

## Seguridad

Autenticación stateless con JWT:

- Token generado con `userId` como subject (JJWT 0.12.6)
- Filtro `JwtAuthFilter` extendiendo `OncePerRequestFilter`
- Rutas públicas (`/auth/**`) y protegidas configuradas en `SecurityConfig`

---

## Estado actual

- [x] CRUD completo: Subject, Topic, Exam, ReviewSession
- [x] Algoritmo de repetición espaciada
- [x] Manejo global de excepciones (`@ControllerAdvice`)
- [x] Spring Security + JWT
- [x] Frontend React
- [ ] Despliegue

---

*Proyecto personal desarrollado tras el primer curso de DAW (Desarrollo de Aplicaciones Web).*
