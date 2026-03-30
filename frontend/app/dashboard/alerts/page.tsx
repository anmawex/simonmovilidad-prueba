export default function AlertsPage() {
  const alerts = [
    { type: "high", vehicle: "A123-B", message: "Bajo nivel de combustible", time: "hace 5 min", status: "Pendiente" },
    { type: "medium", vehicle: "C456-D", message: "Exceso de velocidad (95 km/h)", time: "hace 22 min", status: "Revisado" },
    { type: "low", vehicle: "E789-F", message: "Puerta trasera mal cerrada", time: "hace 1 hora", status: "Pendiente" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-end justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground">Panel de Alertas</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium tracking-wide">Vista protegida. Solo disponible para administradores.</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/40 border-b border-border text-xs uppercase tracking-widest font-bold text-muted-foreground">
                <th className="py-4 px-6 font-semibold">Gravedad</th>
                <th className="py-4 px-6 font-semibold">Vehículo</th>
                <th className="py-4 px-6 font-semibold">Mensaje de Evento</th>
                <th className="py-4 px-6 font-semibold">Tiempo</th>
                <th className="py-4 px-6 font-semibold">Estado</th>
                <th className="py-4 px-6 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {alerts.map((alert, idx) => (
                <tr key={idx} className="hover:bg-muted/20 transition-colors">
                  <td className="py-4 px-6">
                    <span className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest
                      ${alert.type === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        alert.type === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'}
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full ${alert.type === 'high' ? 'bg-red-500' : alert.type === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      {alert.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-foreground text-sm">{alert.vehicle}</td>
                  <td className="py-4 px-6 text-sm text-muted-foreground font-medium">{alert.message}</td>
                  <td className="py-4 px-6 text-xs text-muted-foreground font-semibold uppercase">{alert.time}</td>
                  <td className="py-4 px-6">
                    <span className={`text-xs font-bold uppercase tracking-wider ${alert.status === 'Pendiente' ? 'text-primary' : 'text-muted-foreground'}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-foreground hover:bg-primary px-3 py-1.5 rounded-lg transition-colors border border-primary/20">
                      Resolver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
