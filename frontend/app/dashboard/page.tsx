import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const stats = [
    { title: "Vehículos en Línea", value: "84", change: "+12% vs ayer", positive: true },
    { title: "Alertas Activas", value: "3", change: "-25% vs ayer", positive: true },
    { title: "Combustible Promedio", value: "48%", change: "-5% vs ayer", positive: false },
    { title: "Velocidad Promedio", value: "24 km/h", change: "+2 km/h vs ayer", positive: true },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Dashboard General</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Visualiza el estado global de tu flota en tiempo real.</p>
        </div>
        <button className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          Exportar Reporte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="glass-card p-6 flex flex-col justify-between hover:border-primary/50 transition-colors group cursor-default relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors block" />
            
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 relative z-10">{stat.title}</h3>
            
            <div className="relative z-10">
              <p className="text-4xl font-black text-foreground mb-2">{stat.value}</p>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                <span>{stat.positive ? '↑' : '↓'}</span>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-foreground mb-4">Actividad de la Flota</h3>
          <div className="flex-1 border border-border/50 rounded-xl bg-background/50 flex items-center justify-center">
             <p className="text-muted-foreground text-sm font-medium">Gráfico principal se renderizará aquí</p>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-foreground mb-4">Eventos Recientes</h3>
          <div className="flex-1 space-y-4">
            <div className="p-3 bg-background/50 border border-border/50 rounded-xl flex items-start gap-3">
              <div className="w-2 h-2 mt-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <div>
                <p className="text-sm font-medium text-foreground">Conexión establecida</p>
                <p className="text-xs text-muted-foreground">Flota TR-190 conectada al servidor central.</p>
              </div>
            </div>
            <div className="p-3 bg-background/50 border border-border/50 rounded-xl flex items-start gap-3">
              <div className="w-2 h-2 mt-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <div>
                <p className="text-sm font-medium text-foreground">Mantenimiento sugerido</p>
                <p className="text-xs text-muted-foreground">Vehículo V-42 superó los 10,000km.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
