'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Eye,
  TrendingUp,
  Info,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MOCK_PROPERTIES } from '@/data/mock-properties';
import { Inmueble } from '@/lib/types';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function HerramientasPage() {
  const { toast } = useToast();
  const [exportOption, setExportOption] = useState('Todos');

  // Cálculo de estadísticas
  const totalVisits = MOCK_PROPERTIES.reduce((acc, curr) => acc + (curr.visits || 0), 0);
  const currentMonthVisits = Math.round(totalVisits * 0.42);

  const getFilteredProperties = (option: string): Inmueble[] => {
    return MOCK_PROPERTIES.filter((p) => {
      switch (option) {
        case 'Solo venta':
          return p.operation === 'Venta';
        case 'Solo alquiler':
          return p.operation === 'Alquiler';
        case 'Galpones en venta':
          return p.type === 'Galpón' && p.operation === 'Venta';
        case 'Galpones en alquiler':
          return p.type === 'Galpón' && p.operation === 'Alquiler';
        case 'Casas en venta':
          return p.type === 'Casa' && p.operation === 'Venta';
        case 'Casas en alquiler':
          return p.type === 'Casa' && p.operation === 'Alquiler';
        case 'Apartamentos en venta':
          return p.type === 'Apartamento' && p.operation === 'Venta';
        case 'Apartamentos en alquiler':
          return p.type === 'Apartamento' && p.operation === 'Alquiler';
        case 'Locales en venta':
          return p.type === 'Local' && p.operation === 'Venta';
        case 'Locales en alquiler':
          return p.type === 'Local' && p.operation === 'Alquiler';
        case 'Solo terrenos':
          return p.type === 'Terreno';
        case 'Solo vendidos':
          return p.status === 'Vendido';
        case 'Solo borradores':
          return p.status === 'Borrador';
        case 'Todos':
        default:
          return true;
      }
    });
  };

  // Función para escapar celdas CSV
  const escapeCsv = (val: unknown): string => {
    if (val === undefined || val === null || val === '') return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // EXPORTACIÓN EXCEL (CSV con UTF-8 BOM, sin fotos, metadata completa)
  const handleExportExcel = () => {
    const filtered = getFilteredProperties(exportOption);
    const dateStr = new Date().toLocaleDateString('es-VE');
    const slug = exportOption.toLowerCase().replace(/\s+/g, '_');
    const filename = `inmuebles_sandra_nino_${slug}.csv`;

    const rows: string[] = [];
    // Fila 1: Título con nombre y filtro
    rows.push(`"Inmuebles Sandra Nino — Filtro: ${exportOption}"`);
    // Fila 2: Fecha
    rows.push(`"Fecha: ${dateStr}"`);
    // Fila 3: Vacía
    rows.push('');
    // Fila 4: Encabezados de columna
    const headers = [
      'Título',
      'Operación',
      'Tipo',
      'Precio USD',
      'Estado',
      'Ciudad/Municipio',
      'Sector',
      'Habitaciones',
      'Baños',
      'Estacionamientos',
      'Área construida (m²)',
      'Área terreno (m²)',
      'Área total (m²)',
      'Año',
      'Código interno',
      'Estado publicación',
      'Fecha de publicación',
    ];
    rows.push(headers.map(escapeCsv).join(','));

    // Filas 5+: Datos (sin URLs ni imágenes)
    filtered.forEach((p) => {
      const dataRow = [
        p.title,
        p.operation,
        p.type,
        p.price,
        p.state,
        p.city,
        p.sector || '-',
        p.bedrooms ?? '-',
        p.bathrooms ?? '-',
        p.parking ?? '-',
        p.built_area ?? '-',
        p.land_area ?? '-',
        p.total_area ?? '-',
        p.year ?? '-',
        p.internal_code || '-',
        p.status,
        new Date(p.created_at).toLocaleDateString('es-VE'),
      ];
      rows.push(dataRow.map(escapeCsv).join(','));
    });

    // Añadir BOM \uFEFF para garantizar UTF-8 en Excel
    const csvContent = '\uFEFF' + rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast(`¡Archivo ${filename} descargado con éxito (${filtered.length} inmuebles)!`, 'success');
  };

  // EXPORTACIÓN PDF (jspdf + jspdf-autotable, sin fotos, tabla estilizada)
  const handleExportPDF = () => {
    try {
      const filtered = getFilteredProperties(exportOption);
      const dateStr = new Date().toLocaleDateString('es-VE');
      const slug = exportOption.toLowerCase().replace(/\s+/g, '_');
      const filename = `inmuebles_sandra_nino_${slug}.pdf`;

      // Crear documento PDF en formato apaisado (Landscape A4) para dar cabida a la metadata
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Header a la izquierda
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(30, 58, 95); // #1e3a5f
      doc.text(`Inmuebles Sandra Nino — Filtro: ${exportOption}`, 14, 15);

      // Fecha a la derecha
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha: ${dateStr}`, 283, 15, { align: 'right' });

      // Línea divisoria decorativa sutil
      doc.setDrawColor(201, 123, 90); // #C97B5A (terracotta)
      doc.setLineWidth(0.4);
      doc.line(14, 18, 283, 18);

      // Filas de datos (sin fotos ni URLs)
      const tableData = filtered.map((p) => [
        p.title,
        p.operation,
        p.type,
        `$${p.price.toLocaleString('en-US')}`,
        p.city,
        p.sector || '-',
        p.bedrooms ?? '-',
        p.bathrooms ?? '-',
        p.parking ?? '-',
        p.built_area ? `${p.built_area}` : '-',
        p.land_area ? `${p.land_area}` : '-',
        p.total_area ? `${p.total_area}` : '-',
        p.year ? `${p.year}` : '-',
        p.internal_code || '-',
        p.status,
        new Date(p.created_at).toLocaleDateString('es-VE'),
      ]);

      // Generar tabla con jspdf-autotable
      autoTable(doc, {
        startY: 22,
        head: [[
          'Título',
          'Operación',
          'Tipo',
          'Precio USD',
          'Ciudad',
          'Sector',
          'Hab.',
          'Baños',
          'Est.',
          'Const.(m²)',
          'Terr.(m²)',
          'Tot.(m²)',
          'Año',
          'Código',
          'Estado',
          'Publicado',
        ]],
        body: tableData,
        theme: 'plain',
        styles: {
          font: 'helvetica',
          fontSize: 7.5,
          cellPadding: 2.2,
          lineColor: [225, 225, 225],
          lineWidth: 0.1,
          textColor: [45, 45, 45],
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [30, 58, 95], // Fondo #1e3a5f
          textColor: [255, 255, 255], // Texto blanco
          fontStyle: 'bold',
          fontSize: 7.5,
          halign: 'left',
        },
        alternateRowStyles: {
          fillColor: [250, 249, 246], // Crema alternado #faf9f6
        },
        columnStyles: {
          0: { cellWidth: 42 }, // Título
          3: { halign: 'right', fontStyle: 'bold' }, // Precio
        },
        margin: { left: 14, right: 14, bottom: 12 },
      });

      // Disparar descarga automática
      doc.save(filename);
      toast(`¡Documento ${filename} generado con éxito (${filtered.length} inmuebles)!`, 'success');
    } catch {
      toast('⚠️ Ocurrió un error al generar el archivo PDF', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans animate-fade-in">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-terracotta block mb-1">
          Exportación y Métricas
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-text-heading tracking-tight">Herramientas & Estadísticas</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Descarga informes profesionales de tus inmuebles y supervisa el rendimiento de visualizaciones.
        </p>
      </div>

      {/* Sección 1: Exportar Inventario */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-card space-y-6">
        <div>
          <h3 className="font-serif text-xl text-text-heading">Exportar Inventario</h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Genera un informe listo para imprimir, compartir o enviar a clientes e inversionistas.
          </p>
        </div>

        <div className="max-w-md">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 font-sans">
            ¿Qué deseas exportar?
          </label>
          <select
            value={exportOption}
            onChange={(e) => setExportOption(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-text-heading focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand shadow-xs transition-all cursor-pointer font-sans"
          >
            <option value="Todos">Todos</option>
            <option value="Solo venta">Solo venta</option>
            <option value="Solo alquiler">Solo alquiler</option>
            <option value="Galpones en venta">Galpones en venta</option>
            <option value="Galpones en alquiler">Galpones en alquiler</option>
            <option value="Casas en venta">Casas en venta</option>
            <option value="Casas en alquiler">Casas en alquiler</option>
            <option value="Apartamentos en venta">Apartamentos en venta</option>
            <option value="Apartamentos en alquiler">Apartamentos en alquiler</option>
            <option value="Locales en venta">Locales en venta</option>
            <option value="Locales en alquiler">Locales en alquiler</option>
            <option value="Solo terrenos">Solo terrenos</option>
            <option value="Solo vendidos">Solo vendidos</option>
            <option value="Solo borradores">Solo borradores</option>
          </select>
        </div>

        {/* 2 Botones: Excel y PDF con iconos animados en hover */}
        <div className="flex flex-wrap gap-4 pt-2">
          {/* Botón Excel (Verde Bosque Refinado) */}
          <Button
            type="button"
            variant="success"
            onClick={handleExportExcel}
            className="group gap-2.5 px-6 py-3.5 font-semibold text-xs uppercase tracking-wider shadow-sm hover:shadow-luxury hover:-translate-y-0.5"
          >
            <FileSpreadsheet className="w-4 h-4 stroke-[2] transition-transform duration-200 group-hover:scale-110" />
            <span>Descargar Excel</span>
          </Button>

          {/* Botón PDF (Terracota / Burdeos refinado) */}
          <Button
            type="button"
            variant="terracotta"
            onClick={handleExportPDF}
            className="group gap-2.5 px-6 py-3.5 font-semibold text-xs uppercase tracking-wider shadow-sm hover:shadow-luxury hover:-translate-y-0.5"
          >
            <FileText className="w-4 h-4 stroke-[2] transition-transform duration-200 group-hover:scale-110" />
            <span>Descargar PDF</span>
          </Button>
        </div>
      </div>

      {/* Sección 2: Estadísticas con AnimatedCounter */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-card space-y-6">
        <div>
          <h3 className="font-serif text-xl text-text-heading">Métricas de Alcance</h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Visualizaciones reales registradas a través de tu catálogo inmobiliario.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
          <StatCard
            title="Visitas Totales"
            value={totalVisits}
            subtitle="Acumulado histórico de tu catálogo"
            icon={Eye}
            iconBg="bg-brand/5"
            iconColor="text-brand"
          />

          <StatCard
            title="Visitas este Mes"
            value={currentMonthVisits}
            subtitle="Últimos 30 días registrados"
            icon={TrendingUp}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-700"
          />
        </div>

        {/* Nota sobre estadísticas por inmueble */}
        <div className="p-4.5 rounded-xl bg-cream-50 border border-stone-200/70 flex items-start gap-3 text-xs text-stone-600 leading-relaxed font-sans">
          <Info className="w-4 h-4 text-terracotta shrink-0 mt-0.5 stroke-[1.75]" />
          <p>
            Cada vez que un cliente abre la ficha técnica de una propiedad, se registra una visita única. Puedes consultar el número detallado de visitas de cada inmueble específico en la tabla de <strong>Mis Inmuebles</strong> y en tu <strong>Dashboard</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
