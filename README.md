# Inventario Inmobiliario: tu catálogo personal, bajo tu control

Un sistema web para asesores inmobiliarios que quieren tener sus inmuebles ordenados en un solo lugar: fotos, datos, descripciones y una página pública propia, con la posibilidad de descargar todo tu inventario con un solo botón.

## El problema que resuelve

Si trabajas con varios inmuebles a la vez, probablemente vives esto:

- Las fotos están repartidas entre el celular, la computadora y los chats de WhatsApp.
- Cada vez que publicas en Mercado Libre, Facebook Marketplace o en tu página, tienes que volver a escribir la misma descripción y los mismos datos.
- Cuando un prospecto pregunta, buscas entre mensajes viejos para encontrar el precio o la dirección.
- No tienes un respaldo ordenado de tu inventario, y depender de una publicación ajena significa depender de sus reglas.

Este sistema reúne todo en un solo lugar que tú controlas.

## Qué puedes hacer

- **Tu catálogo personal:** registra cada inmueble una sola vez (datos, medidas, precio, fotos y descripción) y úsalo en todos los canales.
- **Página pública propia:** cada inmueble tiene su ficha con fotos, datos y enlace para compartir por WhatsApp, redes o donde quieras.
- **Control total:** tú decides qué se muestra al público y qué queda solo para ti. Puedes marcar un inmueble como vendido, pausarlo o eliminarlo.
- **Información privada que nunca sale a la web:** ubicación exacta, notas internas y fotos de fachada de enfrente solo las ves tú, con tu sesión iniciada, en tu ficha y en tus descargas. El público no las ve.
- **Buscador y filtros:** encuentra inmuebles por texto (incluido el código interno) y por precio.

## Un solo botón para descargar todo tu inventario

En la sección **Herramientas** del panel, el botón **Descargar ZIP (Fotos + Detalles)** genera un único archivo con una carpeta por inmueble. Cada carpeta contiene:

- **Todas las fotos** del inmueble.
- **`descripcion_y_detalles.txt`**: un archivo de texto listo para copiar y pegar en Mercado Libre, Facebook Marketplace u otro portal. Incluye:
  - Título en mayúsculas y precio (venta o alquiler).
  - Tipo de inmueble y código de referencia interno.
  - Ubicación (sector, ciudad, estado).
  - Características: habitaciones, baños, estacionamientos, construcción, terreno, área total y más.
  - Descripción redactada para publicar.
  - Enlace a tu ficha pública.
  - Fotos de fachada y ubicación exacta, solo en tu copia privada.

El ZIP se descarga aplicado a los inmuebles que tengas filtrados en ese momento, así que puedes sacar solo los disponibles, solo una zona o solo una operación.

Desde la misma sección también puedes descargar:

- **Excel (.xlsx)** con el listado completo de tu inventario.
- **PDF en hoja carta** para imprimir o enviar un catálogo.

## Cómo funciona

1. **Inicia sesión** con tu correo y contraseña de asesor. Si la olvidas, recuperas el acceso por correo.
2. **Completa tu perfil** con tu nombre, WhatsApp y redes sociales. Esto aparece en tu página pública.
3. **Publica tus inmuebles** con el asistente paso a paso: datos, fotos y descripción.
4. **Comparte** la ficha pública o descarga el ZIP para publicar en otros portales.
5. **Mantén el inventario al día:** marca vendidos, pausa o actualiza precios en cualquier momento.

## Capacidad y almacenamiento

- El sistema usa el plan gratuito de almacenamiento de 1 GB.
- La capacidad recomendada es de **350 inmuebles** dentro de ese plan. El panel muestra cuánto espacio usas, tanto en el inventario como en el perfil.
- Si necesitas más espacio en el futuro, se puede contratar capacidad adicional.

## Contacto

[NECESITA ACLARACIÓN: ¿qué número de WhatsApp o enlace de contacto va aquí para que los asesores te escriban?]

---

## Para desarrolladores

### Tecnologías

- Next.js 16 con React 19 y TypeScript.
- Tailwind CSS para los estilos.
- Supabase para la base de datos, autenticación y almacenamiento de fotos.
- Generación de archivos en el navegador: JSZip (ZIP), jsPDF (PDF) y xlsx-js-style (Excel).
- sharp para optimizar imágenes.

### Instalación local

```bash
npm install
```

Crea un archivo `.env.local` en la raíz con estas variables (sus valores van en tu proyecto de Supabase, nunca en el código ni en el repositorio):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run build`: compilación de producción.
- `npm run start`: arranca la versión compilada.
- `npm run cambiar-correo`: cambia el correo de acceso del asesor (`scripts/cambiar-correo.mjs`).

Los scripts de `scripts/` también incluyen la optimización masiva de imágenes (`optimizar-imagenes.mjs`) y la actualización retroactiva de referencias (`actualizar-ref-retroactivo.mjs`).

### Base de datos

Los scripts SQL de la carpeta `supabase/` ajustan descripciones y referencias de las publicaciones. Revísalos antes de ejecutarlos en una base de datos con datos reales.

### Estructura principal

- `src/app/admin/`: panel privado del asesor (inventario, publicar, perfil, herramientas).
- `src/app/inventario/` y `src/app/inmueble/[id]/`: páginas públicas.
- `src/lib/property-zip-exporter.ts`: genera el ZIP y el TXT de cada inmueble.
- `src/lib/excel-exporter.ts`: genera el Excel del inventario.
- `src/lib/zip-export-manager.ts`: controla las descargas y su progreso.
- `src/lib/private-info.ts`: manejo de la información privada y las fotos de fachada.
