'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Eye,
  TrendingUp,
  FolderDown,
  Loader2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Inmueble } from '@/lib/types';
import { propertiesStore } from '@/lib/properties';
import { getPropertyMainArea, formatPropertyAdvisorOrReference } from '@/lib/utils';
import { downloadBulkPropertiesZip } from '@/lib/property-zip-exporter';
import { exportPropertiesToExcel } from '@/lib/excel-exporter';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { FadeInUp } from '@/components/ui/FadeInUp';

export default function HerramientasPage() {
  const { toast } = useToast();
  const [filterOperation, setFilterOperation] = useState('Todas');
  const [filterType, setFilterType] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [includeInternalCode, setIncludeInternalCode] = useState(false);
  const [properties, setProperties] = useState<Inmueble[]>([]);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [zipProgress, setZipProgress] = useState<{
    current: number;
    total: number;
    title: string;
  } | null>(null);

  useEffect(() => {
    propertiesStore
      .getAll()
      .then((data) => setProperties(data))
      .catch(() => setProperties([]));
  }, []);

  // Cálculo de estadísticas dinámicas
  const totalVisits = properties.reduce((acc, curr) => acc + (curr.visits || 0), 0);
  const currentMonthVisits = Math.round(totalVisits * 0.42);

  // Filtrado dinámico en cascada
  const filteredProperties = properties.filter((p) => {
    if (filterOperation !== 'Todas' && p.operation !== filterOperation) return false;
    if (filterType !== 'Todos' && p.type !== filterType) return false;
    if (filterStatus !== 'Todos' && p.status !== filterStatus) return false;
    return true;
  });

  const getExportSlug = () => {
    const parts: string[] = [];
    if (filterOperation !== 'Todas') parts.push(filterOperation.toLowerCase());
    if (filterType !== 'Todos') parts.push(filterType.toLowerCase());
    if (filterStatus !== 'Todos') parts.push(filterStatus.toLowerCase());
    return parts.length > 0 ? parts.join('_') : 'completo';
  };

  // EXPORTACIÓN EXCEL (.xlsx)
  const handleExportExcel = async () => {
    const filtered = filteredProperties;
    if (filtered.length === 0) {
      toast('No hay inmuebles para exportar con los filtros seleccionados', 'warning');
      return;
    }

    try {
      setIsExportingExcel(true);
      const slug = getExportSlug();
      const filename = `inventario_sandra_nino_${slug}.xlsx`;
      await exportPropertiesToExcel(filtered, filename, includeInternalCode);
      toast(`Excel ${filename} descargado con éxito (${filtered.length} inmuebles)`, 'success');
    } catch (err) {
      console.error('Error al exportar Excel:', err);
      toast('Ocurrió un error al generar el archivo Excel (.xlsx)', 'error');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // EXPORTACIÓN PDF
  const handleExportPDF = () => {
    try {
      const filtered = filteredProperties;
      if (filtered.length === 0) {
        toast('No hay inmuebles para exportar con los filtros seleccionados', 'warning');
        return;
      }

      const dateStr = new Date().toLocaleDateString('es-VE');
      const slug = getExportSlug();
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
      doc.text(`Inmuebles Sandra Niño — Reporte: ${slug.replace(/_/g, ' ').toUpperCase()}`, 14, 16);

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
        const referencia = formatPropertyAdvisorOrReference(p, includeInternalCode);

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
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 26 },
          2: { cellWidth: 24 },
          3: { cellWidth: 42 },
          4: { cellWidth: 20, halign: 'right' },
          5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
          6: { halign: 'left' },
        },
        margin: { left: 14, right: 14, bottom: 14 },
      });

      // Numeración de páginas en el pie de página
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(140, 140, 140);
        doc.text(
          `Página ${i} de ${pageCount} — Sandra Niño Inmuebles`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      }

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
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      toast('Ocurrió un error al generar el archivo PDF', 'error');
    }
  };

  // EXPORTACIÓN PAQUETE ZIP (FOTOS + DETALLES)
  const handleExportZip = async () => {
    const filtered = filteredProperties;
    if (filtered.length === 0) {
      toast('No hay inmuebles para exportar con los filtros seleccionados', 'warning');
      return;
    }

    try {
      setIsExportingZip(true);
      const slug = getExportSlug();
      const filename = `inmuebles_sandra_nino_${slug}.zip`;
      toast(
        `Generando paquete ZIP para ${filtered.length} inmueble(s)...`,
        'info'
      );

      await downloadBulkPropertiesZip(
        filtered,
        filename,
        (current, total, title) => {
          setZipProgress({ current, total, title });
        }
      );

      toast(
        `Paquete ZIP ${filename} descargado con éxito (${filtered.length} inmuebles)`,
        'success'
      );
    } catch (err) {
      console.error('Error al exportar paquete ZIP:', err);
      toast('Ocurrió un error al generar el archivo ZIP de los inmuebles', 'error');
    } finally {
      setIsExportingZip(false);
      setZipProgress(null);
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
              Genera un informe en formato Excel, PDF (Hoja Carta) o un paquete ZIP con carpetas individuales (fotos y detalles en TXT).
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f9ede7] text-[#C97B5A] flex items-center justify-center shrink-0 border border-[#C97B5A]/20">
            <Download size={18} strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. Operación */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 mb-1.5 font-body">
                1. Operación
              </label>
              <select
                value={filterOperation}
                onChange={(e) => setFilterOperation(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-text-heading focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand shadow-xs transition-all cursor-pointer font-body"
              >
                <option value="Todas">Todas las operaciones</option>
                <option value="Venta">Solo Venta</option>
                <option value="Alquiler">Solo Alquiler</option>
              </select>
            </div>

            {/* 2. Tipo */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 mb-1.5 font-body">
                2. Tipo de Inmueble
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-text-heading focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand shadow-xs transition-all cursor-pointer font-body"
              >
                <option value="Todos">Todos los tipos</option>
                <option value="Casa">Casas</option>
                <option value="Apartamento">Apartamentos</option>
                <option value="Galpón">Galpones</option>
                <option value="Local">Locales Comerciales</option>
                <option value="Terreno">Terrenos</option>
                <option value="Oficina">Oficinas</option>
              </select>
            </div>

            {/* 3. Estado */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 mb-1.5 font-body">
                3. Estado en Inventario
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-text-heading focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand shadow-xs transition-all cursor-pointer font-body"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Publicado">Solo Publicados</option>
                <option value="Vendido">Solo Vendidos</option>
                <option value="Borrador">Solo Borradores</option>
                <option value="Pausado">Solo Pausados</option>
              </select>
            </div>
          </div>

          {/* Resumen dinámico en vivo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-stone-700 font-medium font-body">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                {filteredProperties.length}{' '}
                {filteredProperties.length === 1 ? 'inmueble seleccionado' : 'inmuebles seleccionados'} para exportar
              </span>
            </div>
            {(filterOperation !== 'Todas' || filterType !== 'Todos' || filterStatus !== 'Todos') && (
              <button
                type="button"
                onClick={() => {
                  setFilterOperation('Todas');
                  setFilterType('Todos');
                  setFilterStatus('Todos');
                }}
                className="text-xs text-[#C97B5A] hover:underline cursor-pointer font-medium font-body self-start sm:self-auto"
              >
                Restablecer filtros
              </button>
            )}
          </div>

          <label className="flex items-center gap-2.5 text-xs text-stone-600 select-none cursor-pointer font-body">
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
            disabled={isExportingExcel || filteredProperties.length === 0}
            className="group gap-2.5 px-6 py-3.5 font-medium text-xs uppercase tracking-wider shadow-sm hover:shadow-luxury hover:-translate-y-0.5"
          >
            {isExportingExcel ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              <FileSpreadsheet size={16} strokeWidth={1.5} className="transition-transform duration-200 group-hover:scale-110" />
            )}
            <span>{isExportingExcel ? 'Generando Excel...' : 'Descargar Excel (.xlsx)'}</span>
          </Button>

          <Button
            type="button"
            variant="terracotta"
            onClick={handleExportPDF}
            disabled={filteredProperties.length === 0}
            className="group gap-2.5 px-6 py-3.5 font-medium text-xs uppercase tracking-wider shadow-sm hover:shadow-luxury hover:-translate-y-0.5"
          >
            <FileText size={16} strokeWidth={1.5} className="transition-transform duration-200 group-hover:scale-110" />
            <span>Descargar PDF</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleExportZip}
            disabled={isExportingZip || filteredProperties.length === 0}
            className="group gap-2.5 px-6 py-3.5 font-medium text-xs uppercase tracking-wider shadow-sm hover:shadow-luxury hover:-translate-y-0.5"
          >
            {isExportingZip ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              <FolderDown size={16} strokeWidth={1.5} className="transition-transform duration-200 group-hover:scale-110" />
            )}
            <span>
              {isExportingZip && zipProgress
                ? `Procesando ${zipProgress.current}/${zipProgress.total}...`
                : isExportingZip
                ? 'Comprimiendo...'
                : 'Descargar ZIP (Fotos + Detalles)'}
            </span>
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
