# EN 5 ESTOY — Documento Maestro del Proyecto

> Este archivo es la fuente de contexto inicial para desarrolladores y agentes/IA que trabajen en el proyecto. Antes de proponer funcionalidades, diseño o arquitectura, respetar los principios definidos aquí.

## 1. Concepto

**En 5 Estoy** es una app web de cercanía para descubrir personas que están cerca y conocer qué saben hacer, qué oficio tienen o qué quieren ofrecer a su comunidad.

No busca ser una red social tradicional ni un marketplace cargado de funciones.

Ejemplos:
- Marta — Modista. Arreglos de ropa y prendas a medida.
- Pedro — Pintor. Pintura de casas y departamentos.
- Oscar — Técnico reparador de celulares.
- Roberto — Tapicero con 50 años de experiencia.
- Ana — Da clases de guitarra.

La pregunta central del producto es:

> **¿Quién tengo cerca y qué sabe hacer?**

Frase conceptual:

> **Hay gente cerca que sabe hacer lo que necesitás.**

## 2. Principios del producto

1. Las personas son el contenido principal.
2. El mapa es la interfaz principal de descubrimiento.
3. Ser visible no requiere pagar.
4. Crear un perfil no requiere pagar.
5. El chat de texto debe funcionar para usuarios gratuitos.
6. No crear límites artificiales de cantidad de mensajes o conversaciones.
7. No cobrar comisión por trabajos o acuerdos entre usuarios.
8. No vender posiciones privilegiadas en el mapa.
9. No agregar likes, seguidores, stories, feed infinito o métricas sociales sin una decisión explícita del equipo.
10. Mantener el producto pequeño, entendible y humano.
11. La privacidad de ubicación es prioritaria.
12. No agregar funciones solamente porque sean comunes en otras redes sociales.

## 3. MVP

El MVP debe permitir validar si las personas encuentran valor en descubrir habilidades cercanas.

### Funciones iniciales

- Registro e inicio de sesión.
- Creación y edición de perfil.
- Avatar o foto de perfil.
- Nombre visible.
- Descripción corta.
- Oficio/habilidad/categoría principal.
- Posibilidad de agregar varias habilidades en el futuro.
- Ubicación aproximada.
- Mapa de personas cercanas.
- Seleccionar una persona desde el mapa.
- Ver perfil mínimo.
- Buscar personas/habilidades.
- Chat privado entre dos usuarios.
- Mensajes de texto.
- Historial persistente de conversaciones.
- Bloqueo y reporte básico de usuarios.
- Membresía mensual.
- Sistema de referidos.

## 4. Mapa y cercanía

### Tecnología

- Datos cartográficos: **OpenStreetMap**.
- Render del mapa en React: **MapLibre GL JS**.
- Backend propio para usuarios y lógica de proximidad.

OpenStreetMap aporta el contexto geográfico. Los perfiles de personas son el contenido principal de En 5 Estoy.

No depender de los servidores públicos de tiles de OpenStreetMap como infraestructura de producción. Antes del lanzamiento se debe seleccionar un proveedor de tiles apropiado o una infraestructura propia y respetar siempre la atribución requerida por OpenStreetMap.

### Experiencia

El mapa debe evitar ruido visual innecesario. No queremos replicar Google Maps con cientos de comercios y POIs destacados.

Prioridad visual:

1. Personas.
2. Habilidad/oficio.
3. Cercanía.
4. Calles y referencias geográficas necesarias.
5. Resto de información cartográfica en segundo plano.

La distancia debería comunicarse de manera humana siempre que sea posible:

- A 3 min.
- A 5 min.
- A 10 min.

En lugar de depender únicamente de valores como `850 metros`.

## 5. Privacidad de ubicación

Nunca entregar públicamente las coordenadas exactas de la residencia de un usuario.

El backend puede conocer una ubicación precisa cuando sea necesaria para calcular proximidad, pero el frontend de otros usuarios debe recibir una ubicación aproximada o desplazada.

Separar conceptualmente:

```text
ubicacion_privada
        ↓
     BACKEND
        ↓
cálculo de distancia
        ↓
ubicacion_publica_aproximada
        ↓
      MAPA
```

El sistema debe diseñarse asumiendo que algunos usuarios pueden estar usando En 5 Estoy desde su hogar.

## 6. Perfil

El perfil debe ser deliberadamente pequeño.

Información mínima:

```text
Avatar
Nombre
Habilidad / oficio
Descripción corta
Distancia aproximada
Estado de disponibilidad (futuro/opcional)
Botón: Hablar
```

Ejemplo:

```text
Roberto
Tapicero

Restauro sillones y sillas antiguas.
Más de 50 años trabajando en tapicería.

A ~4 min de vos

[ Hablar ]
```

No diseñar el perfil como una cuenta de Instagram o LinkedIn.

## 7. Chat

El chat es una herramienta para conectar personas, no el producto completo.

### Gratis

- Mensajes de texto libres.
- Sin límite artificial de mensajes.
- Sin límite artificial de conversaciones.
- Historial persistente.
- Recepción de audios enviados por miembros.

### Miembro

Todo lo gratuito más:

- Envío de mensajes de audio.

No borrar chats porque expire una membresía.

## 8. Membresía

Existe **un solo plan**.

### Precio inicial

**AR$ 1.600 / mes**

El precio podrá actualizarse comercialmente en el futuro, pero no crear niveles adicionales por defecto.

### Gratis

- Crear cuenta.
- Crear perfil.
- Aparecer en el mapa.
- Buscar personas.
- Ver perfiles.
- Chat de texto.
- Historial de conversaciones.
- Radio estándar de descubrimiento.

### Membresía AR$ 1.600/mes

- Mayor rango/radio de descubrimiento.
- Enviar audios en el chat.

La membresía **no** debe otorgar:

- Mejor posición en resultados.
- Mayor prioridad artificial en el mapa.
- Publicidad privilegiada.
- Un perfil visualmente presentado como más confiable solamente por haber pagado.

Principio:

> **Gratis para estar, descubrir y hablar. La membresía permite llegar más lejos y comunicarse con audio.**

## 9. Radio gratuito y radio miembro

El nombre **En 5 Estoy** puede integrarse al concepto de proximidad.

El radio gratuito debe representar el entorno realmente cercano del usuario. Inicialmente se puede experimentar con una zona equivalente aproximadamente a 5 minutos de desplazamiento.

La membresía amplía esa zona.

Los valores definitivos NO deben hardcodearse como decisión comercial irreversible. Mantenerlos configurables desde backend.

Ejemplo conceptual:

```text
GRATIS
└── Cerca / ~5 min

MIEMBRO
└── Radio ampliado / ~15-30 min
```

La densidad de usuarios debe tenerse en cuenta. Si una zona todavía tiene pocos perfiles, el producto no debe quedar inutilizable únicamente por una regla rígida de radio.

## 10. Referidos

Cada usuario tendrá un código o enlace de referido.

Flujo:

```text
Marta invita a Pedro
        ↓
Pedro crea su cuenta
        ↓
Pedro utiliza En 5 Estoy
        ↓
Pedro paga su primer mes
        ↓
Marta recibe +1 mes gratis
```

Regla principal:

> El beneficio se activa cuando el referido realiza su primer pago válido, no simplemente cuando crea una cuenta.

Esto reduce abuso mediante cuentas falsas.

Registrar cada recompensa para impedir duplicaciones.

## 11. Stack tecnológico

### Frontend

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- MapLibre GL JS.
- OpenStreetMap como fuente cartográfica.

### Backend

- Node.js.
- TypeScript.
- API REST.
- Express como opción inicial preferida por familiaridad y simplicidad.
- WebSocket/Socket.IO si se necesita tiempo real propio para chat.

### Base de datos

**MySQL**.

MySQL es una decisión consciente del proyecto por familiaridad del equipo.

La primera versión debe resolver proximidad utilizando las capacidades geoespaciales de MySQL o una estrategia equivalente correctamente indexada. No descargar todos los usuarios al frontend para calcular distancias.

### Archivos

Necesitamos almacenamiento de objetos para:

- Avatares.
- Audios del chat.

No guardar archivos binarios grandes directamente en MySQL. Guardar en MySQL metadata y referencias/URLs seguras al almacenamiento.

## 12. Arquitectura general

```text
┌───────────────────────────┐
│        React Web          │
│ TypeScript + Tailwind     │
│ MapLibre + OpenStreetMap  │
└─────────────┬─────────────┘
              │
        HTTPS / WebSocket
              │
┌─────────────▼─────────────┐
│          Node.js          │
│      TypeScript API       │
│                           │
│ Auth / Profiles           │
│ Nearby Search             │
│ Chat                      │
│ Membership                │
│ Referrals                 │
│ Privacy                   │
└─────────────┬─────────────┘
              │
      ┌───────▼───────┐
      │     MySQL     │
      └───────────────┘

       + Object Storage
       avatars / audio
```

El frontend no debe ser responsable de reglas críticas de negocio.

## 13. Modelo de datos inicial

Es una propuesta inicial, no un esquema definitivo.

### users

```text
id
email
password_hash / auth_provider_id
status
created_at
updated_at
```

### profiles

```text
id
user_id
name
avatar_url
headline
bio
is_visible
created_at
updated_at
```

### skills

```text
id
name
slug
```

### user_skills

```text
user_id
skill_id
is_primary
```

### user_locations

```text
user_id
private_location
public_location
updated_at
```

La implementación exacta de coordenadas debe aprovechar tipos espaciales de MySQL cuando corresponda.

### conversations

```text
id
created_at
updated_at
```

### conversation_members

```text
conversation_id
user_id
joined_at
```

### messages

```text
id
conversation_id
sender_user_id
type          // text | audio
text_content
audio_url
created_at
```

### memberships

```text
id
user_id
provider
provider_subscription_id
status
started_at
expires_at
created_at
updated_at
```

### referrals

```text
id
referrer_user_id
referred_user_id
status
rewarded_at
created_at
```

### blocks

```text
blocker_user_id
blocked_user_id
created_at
```

### reports

```text
id
reporter_user_id
reported_user_id
reason
details
status
created_at
```

## 14. Pagos

Para Argentina se evaluará integración de suscripciones con Mercado Pago u otro procesador adecuado.

El backend debe ser la fuente de verdad sobre el estado de membresía.

Nunca considerar un pago exitoso únicamente porque el frontend volvió de una pantalla de checkout.

Usar notificaciones/webhooks del proveedor y validar los eventos en backend.

Estados conceptuales:

```text
inactive
active
past_due
cancelled
expired
```

Si una membresía expira:

- NO borrar el usuario.
- NO borrar su perfil.
- NO borrar conversaciones.
- NO ocultarlo automáticamente del mapa por el solo hecho de no pagar.
- Volver al radio gratuito.
- Desactivar envío de nuevos audios.

## 15. DESIGN SKILL — Reglas para agentes/IA

Esta sección debe ser tratada como una **skill interna de diseño**.

Cualquier agente o IA que genere interfaces para En 5 Estoy debe leer y respetar estas reglas antes de diseñar componentes.

### Personalidad visual

La interfaz debe sentirse:

- Cercana.
- Humana.
- Barrial sin caer en clichés.
- Moderna.
- Tranquila.
- Simple.
- Confiable.

No debe sentirse como:

- Marketplace agresivo.
- App bancaria.
- LinkedIn.
- Instagram.
- Google Maps clonado.
- Dashboard SaaS empresarial.

### Mobile first

Diseñar primero para teléfono.

Desktop debe ser una adaptación natural, no la interfaz principal reducida posteriormente.

### El mapa manda

Cuando el usuario está descubriendo personas, el mapa ocupa la mayor parte de la pantalla.

Evitar paneles gigantes que oculten el mapa.

### Personas como puntos principales

Los marcadores deben representar personas, idealmente mediante avatar o un identificador visual humano.

La información primaria de una tarjeta es:

```text
Persona
Habilidad
Distancia
```

Ejemplo:

```text
[Marta]
Modista
A 3 min
```

### Cards

Cards pequeñas, limpias y con información estrictamente necesaria.

Evitar cards con diez estadísticas, badges y botones.

Una card de mapa debería conducir principalmente a:

```text
Ver perfil
Hablar
```

### Navegación

Mantener pocas áreas principales.

Conceptualmente:

```text
Mapa
Chats
Mi perfil
```

Membresía/configuración pueden vivir dentro del perfil o menú secundario.

No crear una barra con 7-10 secciones.

### Diseño del chat

Debe parecer mensajería cotidiana y simple.

Priorizar:

- Texto.
- Audio para miembros.
- Identidad clara de la persona.

No agregar reacciones, stickers, GIFs, canales, estados de redes sociales u otras funciones sin requerimiento explícito.

### Membresía

No utilizar patrones visuales de casino/gamificación.

Evitar:

- Coronas gigantes.
- Dorado excesivo.
- `ULTRA PREMIUM`.
- Contadores falsos.
- Urgencia artificial.
- Comparativas de múltiples planes inexistentes.

Debe comunicarse simplemente:

```text
Membresía En 5 Estoy
$1.600 / mes

• Ampliá tu zona de descubrimiento.
• Enviá audios en tus chats.

[ Hacerme miembro ]
```

### Referidos

Comunicación simple:

```text
Invitá a alguien.
Si se hace miembro, recibís 1 mes gratis.
```

No convertir referidos en un sistema de puntos, niveles o ranking.

### Tipografía

Elegir una familia sans-serif moderna, legible y amigable.

Mantener pocas escalas tipográficas y jerarquía clara.

No utilizar demasiados pesos o estilos simultáneamente.

### Color

Definir una paleta pequeña.

Debe existir:

- Color principal de marca.
- Fondo claro/neutral.
- Texto principal.
- Texto secundario.
- Estados de éxito/error/advertencia.

Los colores del mapa deben permanecer contenidos para que los perfiles destaquen.

No inventar una nueva paleta en cada pantalla.

### Espaciado

Priorizar aire y legibilidad.

No llenar cada espacio disponible con información.

### Componentes

Crear componentes reutilizables antes de duplicar interfaces:

```text
Avatar
PersonMarker
PersonCard
ProfileHeader
SkillChip
DistanceBadge
ChatBubble
AudioMessage
SearchBar
MapControls
MembershipCard
ReferralCard
BottomNavigation
Modal / BottomSheet
```

### Bottom sheets

En mobile, preferir bottom sheets para información contextual del mapa antes que navegar constantemente a pantallas nuevas.

Ejemplo:

```text
Tap avatar del mapa
        ↓
Bottom sheet
        ↓
Marta — Modista
A 3 min
Descripción breve

[Ver perfil] [Hablar]
```

### Accesibilidad

- Contraste suficiente.
- Targets táctiles cómodos.
- No depender solamente del color para estados.
- Labels accesibles en iconos.
- Navegación por teclado en desktop.
- Respetar preferencias de movimiento reducido cuando corresponda.

### Regla anti-deriva

**NO agregar funcionalidades nuevas durante una tarea de diseño salvo que sean necesarias para representar un requisito existente.**

Si el agente considera que una función nueva mejoraría el producto, debe proponerla por separado antes de incorporarla.

## 16. Reglas para agentes de programación

Antes de modificar código:

1. Identificar archivo/componente afectado.
2. Indicar si se modifica una función existente o se crea una nueva.
3. Evitar reescribir módulos completos innecesariamente.
4. Mantener TypeScript tipado.
5. Validar inputs en backend.
6. Nunca confiar en permisos enviados por frontend.
7. No exponer secretos/API keys al cliente.
8. No exponer coordenadas privadas de otros usuarios.
9. Paginar consultas potencialmente grandes.
10. No calcular proximidad descargando toda la tabla de usuarios.
11. Mantener migraciones/versionado del esquema SQL.
12. No agregar dependencias sin justificar su necesidad.
13. Mantener frontend, backend y base de datos desacoplados razonablemente.

## 17. Seguridad mínima del MVP

Antes de producción deben existir como mínimo:

- Hash seguro de contraseñas si la autenticación es propia.
- Tokens/sesiones seguros.
- Rate limiting.
- Validación de payloads.
- Sanitización adecuada.
- Autorización por recurso.
- Bloqueo de usuarios.
- Reportes.
- Límites de tamaño/duración de audios.
- Validación de tipo de archivos.
- URLs de archivos controladas.
- Protección de endpoints de pago/webhooks.
- Logs de errores sin secretos.
- Política de privacidad y términos correspondientes.

## 18. Lo que NO es parte del MVP

No implementar inicialmente salvo decisión explícita:

- Feed social.
- Stories.
- Likes.
- Seguidores.
- Ranking de personas.
- Publicaciones sociales.
- Marketplace con carrito.
- Pagos entre cliente y profesional.
- Comisión por trabajos.
- Publicidad.
- Perfiles destacados pagos.
- Múltiples planes de membresía.
- Gamificación.
- Puntos.
- Niveles.
- Sistema complejo de reputación.
- Aplicación móvil nativa.

## 19. Roadmap inicial sugerido

### Fase 1 — Fundación

- Monorepo/proyecto.
- React + TypeScript.
- Node + TypeScript.
- MySQL.
- Variables de entorno.
- Auth.
- Modelo de usuario/perfil.

### Fase 2 — Mapa

- Integrar MapLibre.
- Integrar cartografía OpenStreetMap.
- Geolocalización del usuario.
- Guardado seguro de ubicación.
- Consulta de perfiles cercanos.
- Marcadores de personas.
- Bottom sheet de perfil.

### Fase 3 — Descubrimiento

- Skills/categorías.
- Búsqueda.
- Perfil completo.
- Privacidad y visibilidad.

### Fase 4 — Chat

- Conversaciones privadas.
- Texto.
- Tiempo real.
- Persistencia.
- Bloqueos.

### Fase 5 — Membresía

- Procesador de pagos.
- Webhooks.
- Estado de membresía.
- Radio ampliado.
- Audios.

### Fase 6 — Referidos

- Código/link de referido.
- Asociación de referido.
- Validación del primer pago.
- +1 mes al referente.
- Prevención básica de abuso.

### Fase 7 — Beta

- Testing móvil.
- Testing de privacidad.
- Performance del mapa.
- Moderación/reportes.
- Métricas mínimas de producto.
- Prueba en una zona geográfica acotada para medir densidad.

## 20. Métricas iniciales

No perseguir métricas sociales de vanidad.

Medir principalmente:

- Perfiles creados.
- Perfiles visibles por zona.
- Búsquedas realizadas.
- Perfiles abiertos desde el mapa.
- Conversaciones iniciadas.
- Usuarios que vuelven.
- Conversión a membresía.
- Uso del radio ampliado.
- Uso de audios.
- Referidos enviados.
- Referidos que se convierten en miembros.

La métrica central debería intentar responder:

> **¿En 5 Estoy logró conectar a una persona con otra persona cercana que le resultó útil?**

## 21. Regla final

Cuando exista duda entre agregar complejidad o mantener una experiencia simple, elegir primero la experiencia simple.

**En 5 Estoy no intenta mostrar todo lo que existe cerca. Intenta mostrar a las personas que tenemos cerca y aquello que saben hacer.**
