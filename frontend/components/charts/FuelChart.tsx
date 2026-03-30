'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  TooltipItem,
} from 'chart.js'
import type { Chart } from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { SensorReading } from '@/types'

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Filler
)

interface Props {
  readings: SensorReading[]
}

// Colorea la línea de rojo cuando el combustible es crítico
function getLineColor(readings: SensorReading[]): string[] {
  return readings.map(r => r.fuel_autonomy < 1.0 ? '#ef4444' : '#10b981')
}

export default function FuelChart({ readings }: Props) {
  const labels = readings.map(r =>
    new Date(r.recorded_at).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  )

  const data = {
    labels,
    datasets: [
      {
        label: 'Combustible (%)',
        data: readings.map(r => r.fuel_level),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: getLineColor(readings),
      },
      {
        label: 'Autonomía (horas)',
        data: readings.map(r => r.fuel_autonomy),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.05)',
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        yAxisID: 'y2',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'line'>) => {
            const val = (ctx.parsed.y ?? 0).toFixed(ctx.datasetIndex === 0 ? 1 : 2)
            if (ctx.datasetIndex === 0) return `Combustible: ${val}%`
            return `Autonomía: ${val}h`
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        title: { display: true, text: 'Combustible (%)' },
      },
      y2: {
        min: 0,
        position: 'right' as const,
        title: { display: true, text: 'Autonomía (h)' },
        grid: { drawOnChartArea: false },
      },
      x: {
        ticks: { maxTicksLimit: 8 },
      },
    },
  }

  // Línea de alerta en 1 hora de autonomía
  const alertPlugin = {
    id: 'alertLine',
    afterDraw(chart: Chart<'line'>) {
      const { ctx, chartArea, scales } = chart
      if (!chartArea) return
      const y = scales.y2?.getPixelForValue(1)
      if (!y) return
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(chartArea.left, y)
      ctx.lineTo(chartArea.right, y)
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 4])
      ctx.stroke()
      ctx.fillStyle = '#ef4444'
      ctx.font = '11px sans-serif'
      ctx.fillText('⚠ 1h autonomía', chartArea.right - 90, y - 4)
      ctx.restore()
    },
  }

  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Sin datos de combustible
      </div>
    )
  }

  return <Line data={data} options={options} plugins={[alertPlugin]} />
}