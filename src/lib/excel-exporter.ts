import type { Inmueble } from './types';
import { getPropertyMainArea, formatPropertyAdvisorOrReference } from './utils';
import { triggerFileDownload } from './property-zip-exporter';

/**
 * Carga xlsx-js-style bajo demanda para generar hojas de cálculo con
 * estilos visuales completos (colores institucionales, fuentes, bordes)
 * sin sobrecargar el bundle de carga inicial de la página.
 */
async function loadXLSX(): Promise<typeof import('xlsx-js-style')> {
  const mod = await import('xlsx-js-style');
  return ((mod as unknown as { default: typeof import('xlsx-js-style') }).default ||
    mod) as unknown as typeof import('xlsx-js-style');
}

/**
 * Exporta un listado de inmuebles a un archivo Excel (.xlsx) con el mismo
 * diseño y estilo profesional que el reporte PDF (Navy Blue, Terracota, filas alternas y bordes).
 */
export async function exportPropertiesToExcel(
  properties: Inmueble[],
  filename: string,
  includeInternalCode = false
): Promise<void> {
  const XLSX = await loadXLSX();

  // Paleta de diseño institucional idéntica al PDF de Sandra Niño
  const COLOR_NAVY = '1E3A5F';        // Azul profundo institucional (Cabeceras y títulos)
  const COLOR_TERRACOTTA = 'C97B5A';   // Terracota (Líneas de acento de marca)
  const COLOR_CREAM = 'FAF9F6';        // Crema suave para filas alternas (idéntico al PDF)
  const COLOR_WHITE = 'FFFFFF';        // Blanco para filas pares
  const COLOR_SUBTITLE_BG = 'F5F1EA';  // Beige cálido suave para barra de metadatos
  const COLOR_BORDER = 'E5E7EB';       // Gris suave para bordes de celdas (idéntico al PDF)
  const COLOR_HEADER_BORDER = '2C5282';
  const COLOR_TEXT_DARK = '1F2937';
  const COLOR_TEXT_MUTED = '57534E';

  const thinBorder = {
    top: { style: 'thin', color: { rgb: COLOR_BORDER } },
    bottom: { style: 'thin', color: { rgb: COLOR_BORDER } },
    left: { style: 'thin', color: { rgb: COLOR_BORDER } },
    right: { style: 'thin', color: { rgb: COLOR_BORDER } },
  };

  const titleCellStyle = {
    font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: COLOR_WHITE } },
    fill: { fgColor: { rgb: COLOR_NAVY } },
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  const subtitleCellStyle = {
    font: { name: 'Calibri', sz: 9.5, italic: true, color: { rgb: COLOR_TEXT_MUTED } },
    fill: { fgColor: { rgb: COLOR_SUBTITLE_BG } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      bottom: { style: 'medium', color: { rgb: COLOR_TERRACOTTA } },
    },
  };

  const headerCellStyle = (align: 'center' | 'left' | 'right') => ({
    font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: COLOR_WHITE } },
    fill: { fgColor: { rgb: COLOR_NAVY } },
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: COLOR_HEADER_BORDER } },
      bottom: { style: 'medium', color: { rgb: COLOR_TERRACOTTA } },
      left: { style: 'thin', color: { rgb: COLOR_HEADER_BORDER } },
      right: { style: 'thin', color: { rgb: COLOR_HEADER_BORDER } },
    },
  });

  const dataCellStyle = (
    align: 'center' | 'left' | 'right',
    isOdd: boolean,
    bold = false,
    textColor = COLOR_TEXT_DARK
  ) => ({
    font: { name: 'Calibri', sz: 10, bold, color: { rgb: textColor } },
    fill: { fgColor: { rgb: isOdd ? COLOR_CREAM : COLOR_WHITE } },
    alignment: { horizontal: align, vertical: 'center' },
    border: thinBorder,
  });

  const dateStr = new Date().toLocaleDateString('es-VE');

  // Construcción de la matriz de celdas con datos y estilos
  const rows: any[][] = [];

  // Fila 1: Banner de título principal (Combinado A1:G1)
  rows.push([
    { v: 'INMUEBLES SANDRA NIÑO — INVENTARIO DE PROPIEDADES', t: 's', s: titleCellStyle },
    { v: '', t: 's', s: titleCellStyle },
    { v: '', t: 's', s: titleCellStyle },
    { v: '', t: 's', s: titleCellStyle },
    { v: '', t: 's', s: titleCellStyle },
    { v: '', t: 's', s: titleCellStyle },
    { v: '', t: 's', s: titleCellStyle },
  ]);

  // Fila 2: Subtítulo con fecha y resumen (Combinado A2:G2)
  rows.push([
    {
      v: `Informe Oficial • Fecha: ${dateStr} • ${properties.length} inmueble(s) listado(s)`,
      t: 's',
      s: subtitleCellStyle,
    },
    { v: '', t: 's', s: subtitleCellStyle },
    { v: '', t: 's', s: subtitleCellStyle },
    { v: '', t: 's', s: subtitleCellStyle },
    { v: '', t: 's', s: subtitleCellStyle },
    { v: '', t: 's', s: subtitleCellStyle },
    { v: '', t: 's', s: subtitleCellStyle },
  ]);

  // Fila 3: Separador limpio
  rows.push([
    { v: '', t: 's' },
    { v: '', t: 's' },
    { v: '', t: 's' },
    { v: '', t: 's' },
    { v: '', t: 's' },
    { v: '', t: 's' },
    { v: '', t: 's' },
  ]);

  // Fila 4: Encabezados de la tabla
  rows.push([
    { v: 'N°', t: 's', s: headerCellStyle('center') },
    { v: 'Tipo de Inmueble', t: 's', s: headerCellStyle('left') },
    { v: 'Venta o Alquiler', t: 's', s: headerCellStyle('center') },
    { v: 'Ubicación', t: 's', s: headerCellStyle('left') },
    { v: 'Metros (m²)', t: 's', s: headerCellStyle('right') },
    { v: 'Precio de Venta o Canon (USD)', t: 's', s: headerCellStyle('right') },
    { v: 'Asesor o Referencia', t: 's', s: headerCellStyle('left') },
  ]);

  // Filas 5+: Registros de inmuebles con filas alternas y formato
  properties.forEach((p, idx) => {
    const isOdd = idx % 2 === 1; // Alternancia de color crema idéntica al PDF
    const ubicacion = p.sector ? `${p.sector}, ${p.city}` : p.city;
    const metros = getPropertyMainArea(p) ?? p.built_area ?? p.total_area ?? p.land_area ?? 0;
    const referencia = formatPropertyAdvisorOrReference(p, includeInternalCode);

    rows.push([
      { v: idx + 1, t: 'n', s: dataCellStyle('center', isOdd, false, '6B7280') },
      { v: p.type || '', t: 's', s: dataCellStyle('left', isOdd, true, COLOR_TEXT_DARK) },
      { v: p.operation || '', t: 's', s: dataCellStyle('center', isOdd, false, COLOR_TEXT_DARK) },
      { v: ubicacion, t: 's', s: dataCellStyle('left', isOdd, false, COLOR_TEXT_DARK) },
      { v: Number(metros) || 0, t: 'n', z: '#,##0', s: dataCellStyle('right', isOdd, false, COLOR_TEXT_DARK) },
      { v: Number(p.price) || 0, t: 'n', z: '"$"#,##0', s: dataCellStyle('right', isOdd, true, COLOR_NAVY) },
      { v: referencia, t: 's', s: dataCellStyle('left', isOdd, false, COLOR_TEXT_DARK) },
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Combinaciones de celdas para encabezados
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  ];

  // Alturas de filas optimizadas (Encabezados generosos y filas cómodas)
  const rowHeights = [
    { hpt: 30 }, // Título
    { hpt: 20 }, // Subtítulo
    { hpt: 8 },  // Separador
    { hpt: 26 }, // Cabeceras
    ...properties.map(() => ({ hpt: 22 })),
  ];
  ws['!rows'] = rowHeights;

  // Anchos de columna óptimos para legibilidad total sin truncamiento
  ws['!cols'] = [
    { wch: 7 },   // N°
    { wch: 20 },  // Tipo de Inmueble
    { wch: 18 },  // Venta o Alquiler
    { wch: 34 },  // Ubicación
    { wch: 15 },  // Metros (m²)
    { wch: 26 },  // Precio de Venta o Canon (USD)
    { wch: 38 },  // Asesor o Referencia
  ];

  // Filtros automáticos nativos de Excel en la fila de cabeceras (Fila 4)
  if (properties.length > 0) {
    ws['!autofilter'] = { ref: `A4:G${4 + properties.length}` };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  triggerFileDownload(blob, finalFilename);
}
