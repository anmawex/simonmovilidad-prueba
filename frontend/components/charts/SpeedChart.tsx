'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { SensorReading } from '@/types'

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
)

interface Props {
  readings: SensorReading[]
}

export default function SpeedChart({ readings }: Props) {
  const labels = readings.map(r =>
    new Date(r.recorded_at).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  )

  const data = {
    labels,
    datasets: [
      {
        label: 'Velocidad (km/h)',
        data: readings.map(r => r.speed),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'line'>) => `${(ctx.parsed.y ?? 0).toFixed(1)} km/h`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        title: { display: true, text: 'km/h' },
      },
      x: {
        ticks: { maxTicksLimit: 8 },
      },
    },
  }

  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Sin datos de velocidad
      </div>
    )
  }

  return <Line data={data} options={options} />
}