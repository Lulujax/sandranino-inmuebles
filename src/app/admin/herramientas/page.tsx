'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Eye,
  TrendingUp,
  Info,
  Download,
} from 'lucide-react';
import { MOCK_PROPERTIES } from '@/data/mock-properties';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function HerramientasPage() {
  const { toast } = useToast();
  const [exportOption, setExportOption] = useState('Todos');

  // Cálculo de estadísticas
  const totalVisits = MOCK_PROPERTIES.reduce((acc, curr) => acc + (curr.visits || 0), 0);
  // Visitas este mes (simuladas ~42% del total histórico)
  const currentMonthVisits = Math.round(totalVisits * 0.42);

  const handleExport = (type: 'Excel' | 'PDF') => {
    toast(`Generando descarga de ${type} para: "${exportOption}"...`, 'info');

    // Simulación de descarga CSV/Excel
    setTimeout(() => {
      const filename = `inventario_${exportOption.toLowerCase().replace(/\s+/g, '_')}.${
        type === 'Excel' ? 'csv' : 'pdf'
      }`;
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' +
          encodeURIComponent(
            `Inmuebles Sandra Nino - Filtro: ${exportOption}\nFecha: ${new Date().toLocaleDateString()}\n\n` +
              MOCK_PROPERTIES.map(
                (p) => `${p.title} | ${p.type} | ${p.operation} | $${p.price} | ${p.city}`
              ).join('\n')
          )
      );
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast(`¡Archivo ${filename} descargado con éxito!`, 'success');
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Herramientas y Estadísticas</h2>
        <p className="text-sm text-gray-500">
          Descarga informes de tus propiedades y monitorea el rendimiento de visitas.
        </p>
      </div>

      {/* Sección 1: Exportar Inventario */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-bold text-gray-900">Exportar Inventario</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Descarga un archivo listo para imprimir o enviar a clientes e inversionistas.
          </p>
        </div>

        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            ¿Qué deseas exportar?
          </label>
          <select
            value={exportOption}
            onChange={(e) => setExportOption(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand"
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

        {/* 2 Botones: Excel y PDF */}
        <div className="flex flex-wrap gap-3 pt-2">
          {/* Botón Excel (Verde) */}
          <Button
            type="button"
            variant="success"
            onClick={() => handleExport('Excel')}
            className="gap-2 px-5 py-3 font-semibold shadow-sm"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>📊 Descargar Excel</span>
          </Button>

          {/* Botón PDF (Rojo) */}
          <Button
            type="button"
            variant="danger"
            onClick={() => handleExport('PDF')}
            className="gap-2 px-5 py-3 font-semibold shadow-sm"
          >
            <FileText className="w-5 h-5" />
            <span>📄 Descargar PDF</span>
          </Button>
        </div>
      </div>

      {/* Sección 2: Estadísticas Simples */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-bold text-gray-900">Métricas de Alcance</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Visualizaciones registradas en tu catálogo personal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Visitas Totales"
            value={totalVisits}
            subtitle="Acumulado histórico de tu catálogo"
            icon={Eye}
            iconBg="bg-blue-50"
            iconColor="text-brand"
          />

          <StatCard
            title="Visitas este Mes"
            value={currentMonthVisits}
            subtitle="Últimos 30 días"
            icon={TrendingUp}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-700"
          />
        </div>

        {/* Nota sobre estadísticas por inmueble */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3 text-xs text-gray-600 leading-relaxed">
          <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
          <p>
            Cada vez que un cliente abre la ficha técnica de una propiedad, se registra una visita única. Puedes consultar el número detallado de visitas de cada inmueble específico en la tabla de <strong>Mis Inmuebles</strong> y en tu <strong>Dashboard</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

