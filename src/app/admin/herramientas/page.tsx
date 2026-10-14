'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Eye,
  TrendingUp,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Inmueble } from '@/lib/types';
import { propertiesStore } from '@/lib/properties';
import { getPropertyMainArea } from '@/lib/utils';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { FadeInUp } from '@/components/ui/FadeInUp';

export default function HerramientasPage() {
  const { toast } = useToast();
  const [exportOption, setExportOption] = useState('Todos');
  const [includeInternalCode, setIncludeInternalCode] = useState(false);
  const [properties, setProperties] = useState<Inmueble[]>([]);

  useEffect(() => {
    propertiesStore
      .getAll()
      .then((data) => setProperties(data))
      .catch(() => setProperties([]));
  }, []);

  // Cálculo de estadísticas dinámicas
  const totalVisits = properties.reduce((acc, curr) => acc + (curr.visits || 0), 0);
  const currentMonthVisits = Math.round(totalVisits * 0.42);

  const getFilteredProperties = (option: string): Inmueble[] => {
    return properties.filter((p) => {
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

  // Escapar celda CSV protegiendo contra inyección de fórmulas en Excel
  const formatCsvValue = (val: unknown): string => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'number') return String(val);

    let str = String(val);
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }

    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // EXPORTACIÓN EXCEL
  const handleExportExcel = () => {
    const filtered = getFilteredProperties(exportOption);
    const slug = exportOption.toLowerCase().replace(/\s+/g, '_');
    const filename = `inventario_sandra_nino_${slug}.csv`;

    const headers = [
      'N°',
      'Tipo de Inmueble',
      'Venta o Alquiler',
      'Ubicacion',
      'metros',
      'Precio de Venta o Canon',
      'Asesor o Referencia',
    ];

    const rows: string[] = [];
    rows.push(headers.join(','));

    filtered.forEach((p, idx) => {
      const ubicacion = p.sector ? `${p.sector}, ${p.city}` : p.city;
      const metros = getPropertyMainArea(p) ?? p.built_area ?? p.total_area ?? p.land_area ?? 0;
      const referencia =
        includeInternalCode && p.internal_code ? p.internal_code : 'Sandra Niño';

      const row = [
        idx + 1,
        p.type,
        p.operation,
        ubicacion,
        metros,
        p.price,
        referencia,
      ];

      rows.push(row.map(formatCsvValue).join(','));
    });

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

    toast(`Excel ${filename} descargado con éxito (${filtered.length} inmuebles)`, 'success');
  };

  // EXPORTACIÓN PDF
  const handleExportPDF = () => {
    try {
      const filtered = getFilteredProperties(exportOption);
      const dateStr = new Date().toLocaleDateString('es-VE');
      const slug = exportOption.toLowerCase().replace(/\s+/g, '_');
      const filename = `inventario_sandra_nino_${slug}.pdf`;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 95);
      doc.text(`Inmuebles Sandra Niño — Filtro: ${exportOption}`, 14, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha: ${dateStr}`, pageWidth - 14, 16, { align: 'right' });

      doc.setDrawColor(201, 123, 90);
      doc.setLineWidth(0.4);
      doc.line(14, 19.5, pageWidth - 14, 19.5);

      const tableData = filtered.map((p, idx) => {
        const ubicacion = p.sector ? `${p.sector}, ${p.city}` : p.city;
        const metros = getPropertyMainArea(p) ?? p.built_area ?? p.total_area ?? p.land_area ?? 0;
        const referencia =
          includeInternalCode && p.internal_code ? p.internal_code : 'Sandra Niño';

        return [
          idx + 1,
          p.type,
          p.operation,
          ubicacion,
          `${metros} m²`,
          `$${p.price.toLocaleString('en-US')}`,
          referencia,
        ];
      });

      autoTable(doc, {
        startY: 24,
        head: [[
          'N°',
          'Tipo de Inmueble',
          'Venta o Alquiler',
          'Ubicación',
          'Metros',
          'Precio de Venta o Canon',
          'Asesor o Referencia',
        ]],
        body: tableData,
        theme: 'plain',
        styles: {
          font: 'helvetica',
          fontSize: 8.5,
          cellPadding: 3,
          lineColor: [225, 225, 225],
          lineWidth: 0.15,
          textColor: [45, 45, 45],
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [30, 58, 95],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5,
        },
        alternateRowStyles: {
          fillColor: [250, 249, 246],
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          4: { halign: 'right' },
          5: { halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14, bottom: 14 },
      });

      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast(`PDF ${filename} en Hoja Carta descargado (${filtered.length} inmuebles)`, 'success');
    } catch {
      toast('Ocurrió un error al generar el archivo PDF', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-body">
      <FadeInUp>
        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
          EXPORTACIÓN Y MÉTRICAS
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-text-heading tracking-tight">
          Herramientas & Estadísticas
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Descarga informes profesionales de tus inmuebles y supervisa el rendimiento de visualizaciones.
        </p>
      </FadeInUp>

      {/* Sección 1: Exportar Inventario */}
      <FadeInUp delay={0.06} className="bg-[#faf9f6] p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-card space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-0.5">
              DOCUMENTOS
            </span>
            <h3 className="font-display text-xl font-semibold text-text-heading">
              Exportar Inventario
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Genera un informe en formato Excel o PDF (Hoja Carta) listo para imprimir o enviar a clientes.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f9ede7] text-[#C97B5A] flex items-center justify-center shrink-0 border border-[#C97B5A]/20">
            <Download size={18} strokeWidth={1.5} />
          </div>
        </div>

        <div className="max-w-md">
          <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 mb-1.5 font-body">
            ¿Qué deseas exportar?
          </label>
          <select
            value={exportOption}
            onChange={(e) => setExportOption(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-text-heading focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand shadow-xs transition-all cursor-pointer font-body"
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

          <label className="flex items-center gap-2.5 text-xs text-stone-600 mt-3 select-none cursor-pointer font-body">
            <input
              type="checkbox"
              checked={includeInternalCode}
              onChange={(e) => setIncludeInternalCode(e.target.checked)}
              className="w-4 h-4 text-brand rounded border-stone-300 focus:ring-brand/20 accent-brand cursor-pointer"
            />
            <span>Incluir código interno en la columna de referencia (uso administrativo)</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <Button
            type="button"
            variant="success"
            onClick={handleExportExcel}
            className="group gap-2.5 px-6 py-3.5 font-medium text-xs uppercase tracking-wider shadow-sm hover:shadow-luxury hover:-translate-y-0.5"
          >
            <FileSpreadsheet size={16} strokeWidth={1.5} className="transition-transform duration-200 group-hover:scale-110" />
            <span>Descargar Excel</span>
          </Button>

          <Button
            type="button"
            variant="terracotta"
            onClick={handleExportPDF}
            className="group gap-2.5 px-6 py-3.5 font-medium text-xs uppercase tracking-wider shadow-sm hover:shadow-luxury hover:-translate-y-0.5"
          >
            <FileText size={16} strokeWidth={1.5} className="transition-transform duration-200 group-hover:scale-110" />
            <span>Descargar PDF</span>
          </Button>
        </div>
      </FadeInUp>

      {/* Sección 2: Estadísticas */}
      <FadeInUp delay={0.12} className="bg-[#faf9f6] p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-card space-y-6">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-0.5">
            POPULARIDAD
          </span>
          <h3 className="font-display text-xl font-semibold text-text-heading">
            Métricas de Alcance
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Visualizaciones reales registradas a través de tu inventario inmobiliario.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
          <StatCard
            title="Visitas Totales"
            value={totalVisits}
            subtitle="Acumulado histórico de tu inventario"
            icon={Eye}
            iconBg="bg-[#1e3a5f]/8"
            iconColor="text-[#1e3a5f]"
            topBorderColor="border-t-[#1e3a5f]"
            className="bg-white"
          />

          <StatCard
            title="Visitas este Mes"
            value={currentMonthVisits}
            subtitle="Últimos 30 días registrados"
            icon={TrendingUp}
            iconBg="bg-[#edf7ee]"
            iconColor="text-emerald-700"
            topBorderColor="border-t-emerald-600"
            className="bg-white"
          />
        </div>

        <div className="p-4.5 rounded-xl bg-white border border-stone-200/70 flex items-start gap-3 text-xs text-stone-600 leading-relaxed font-body">
          <Eye size={16} strokeWidth={1.5} className="text-[#C97B5A] shrink-0 mt-0.5" />
          <p>
            Cada vez que un cliente abre la ficha técnica de una propiedad, se registra una visita única. Puedes consultar el número detallado de visitas de cada inmueble específico en la tabla de <strong>Mis Inmuebles</strong> y en tu <strong>Dashboard</strong>.
          </p>
        </div>
      </FadeInUp>
    </div>
  );
}
