export default function MapPage() {
  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] pb-10">
      <div className="flex border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground">Mapa en Tiempo Real</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium tracking-wide">
            Vista geoespacial interactiva de todos tus activos conectados.
          </p>
        </div>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col relative">
        <div className="absolute top-4 left-4 z-10 glass-card p-3 shadow-lg flex flex-col gap-2">
           <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Flota Activa</p>
           <p className="text-3xl font-black text-primary">84</p>
        </div>
        
        <div className="flex-1 bg-secondary/30 flex items-center justify-center">
          <div className="text-center group p-12 hover:scale-105 transition-transform duration-500">
            <span className="text-6xl mb-6 block drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">🗺️</span>
            <p className="text-muted-foreground font-medium text-lg">
              [ MapLibre GL JS Placeholder ]
            </p>
            <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
              El servidor web socket enviará la data geo-JSON para renderizar aquí.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
