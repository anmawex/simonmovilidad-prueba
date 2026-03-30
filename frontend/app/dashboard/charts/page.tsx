export default function ChartsPage() {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground">Análisis de Datos e Histórico</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium tracking-wide">
            Gráficos históricos para evaluar la eficiencia de la flota.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card flex flex-col min-h-[400px]">
          <div className="border-b border-white/5 p-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">Promedio de Velocidad Semanal</h3>
            <button className="text-xs font-bold uppercase tracking-widest text-primary border border-primary/20 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
              CSV
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-background/50 m-4 rounded-xl border border-dashed border-border p-4">
            <p className="text-muted-foreground font-medium text-center">Chart.js renderizará el gráfico de Líneas aquí.</p>
          </div>
        </div>
        
        <div className="glass-card flex flex-col min-h-[400px]">
          <div className="border-b border-white/5 p-4 flex justify-between items-center">
             <h3 className="text-lg font-bold text-foreground">Estado de Batería y Sensores</h3>
             <button className="text-xs font-bold uppercase tracking-widest text-primary border border-primary/20 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
              CSV
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-background/50 m-4 rounded-xl border border-dashed border-border p-4">
             <p className="text-muted-foreground font-medium text-center">Chart.js renderizará el gráfico de Barras aquí.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
