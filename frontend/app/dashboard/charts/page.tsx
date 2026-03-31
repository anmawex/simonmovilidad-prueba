"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useVehicles } from "@/hooks/useVehicles";
import { useVehicleHistory } from "@/hooks/useVehicleHistory";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { SensorReading, WSMessage } from "@/types";

const SpeedChart = dynamic(() => import("@/components/charts/SpeedChart"), {
	ssr: false,
});
const FuelChart = dynamic(() => import("@/components/charts/FuelChart"), {
	ssr: false,
});

export default function ChartsPage() {
	const { vehicles, loading: loadingVehicles } = useVehicles();
	const [selectedId, setSelectedId] = useState("");
	const { readings, loading, error, addReading } =
		useVehicleHistory(selectedId);

	// Recibe lecturas en tiempo real y las agrega al gráfico
	const handleMessage = useCallback(
		(msg: WSMessage) => {
			if (msg.event !== "sensor_reading") return;
			addReading(msg.payload as SensorReading);
		},
		[addReading],
	);

	useWebSocket(handleMessage);

	const latest = readings[readings.length - 1];

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold text-gray-800">
					Gráficos históricos
				</h1>

				{/* Selector de vehículo */}
				<select
					value={selectedId}
					onChange={(e) => setSelectedId(e.target.value)}
					className="bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
					<option value="" className="bg-slate-900 text-slate-100">
						Selecciona un vehículo
					</option>
					{vehicles?.map((v) => (
						<option
							key={v.id}
							value={v.id}
							className="bg-slate-900 text-slate-100">
							{v.name} — {v.device_id}
						</option>
					))}
				</select>
			</div>

			{/* Cards de resumen */}
			{latest && (
				<div className="grid grid-cols-3 gap-4">
					<StatCard
						label="Velocidad actual"
						value={`${latest.speed.toFixed(1)} km/h`}
						color="blue"
					/>
					<StatCard
						label="Combustible"
						value={`${latest.fuel_level.toFixed(1)}%`}
						color={latest.fuel_level < 20 ? "red" : "green"}
					/>
					<StatCard
						label="Autonomía restante"
						value={`${latest.fuel_autonomy.toFixed(2)}h`}
						color={latest.fuel_autonomy < 1 ? "red" : "amber"}
					/>
				</div>
			)}

			{!selectedId && (
				<p className="text-gray-400 text-sm text-center mt-8">
					Selecciona un vehículo para ver sus gráficos
				</p>
			)}

			{loading && <p className="text-gray-400 text-sm">Cargando datos...</p>}
			{error && <p className="text-red-500 text-sm">{error}</p>}

			{selectedId && !loading && (
				<div className="grid grid-cols-1 gap-6">
					{/* Gráfico de velocidad */}
					<div className="bg-white rounded-xl shadow p-4">
						<h2 className="text-sm font-medium text-gray-600 mb-3">
							Velocidad
						</h2>
						<div className="h-56">
							<SpeedChart readings={readings} />
						</div>
					</div>

					{/* Gráfico de combustible */}
					<div className="bg-white rounded-xl shadow p-4">
						<h2 className="text-sm font-medium text-gray-600 mb-3">
							Combustible y autonomía
						</h2>
						<div className="h-56">
							<FuelChart readings={readings} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// Componente auxiliar de tarjeta de stat
function StatCard({
	label,
	value,
	color,
}: {
	label: string;
	value: string;
	color: "blue" | "green" | "red" | "amber";
}) {
	const colors = {
		blue: "bg-blue-50  text-blue-700",
		green: "bg-green-50 text-green-700",
		red: "bg-red-50   text-red-700",
		amber: "bg-amber-50 text-amber-700",
	};

	return (
		<div className={`rounded-xl p-4 ${colors[color]}`}>
			<p className="text-xs font-medium opacity-70 mb-1">{label}</p>
			<p className="text-2xl font-semibold">{value}</p>
		</div>
	);
}
