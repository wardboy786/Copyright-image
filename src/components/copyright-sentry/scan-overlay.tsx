
export function ScanOverlay() {
  const primaryColor = 'hsl(var(--primary))';
  const primaryColorRgb = '47 133 247'; // Corresponds to hsl(217 91% 60%)

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
        {/* Main scanning beam */}
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 shadow-[0_0_20px_var(--tw-shadow-color)] shadow-primary/60 animate-scan" style={{'--tw-shadow-color': primaryColor} as React.CSSProperties}>
            <div className="absolute top-0 left-0 w-full h-[100px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
        </div>
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 bg-repeat animate-gridPulse"
          style={{ 
            backgroundImage: `
              linear-gradient(hsla(${primaryColorRgb}, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, hsla(${primaryColorRgb}, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '25px 25px'
          }}
        />
        
        {/* Corner brackets */}
        <div className="absolute top-4 left-4 right-4 bottom-4">
            <div className="absolute w-12 h-12 border-2 border-primary/60 animate-cornerPulse top-0 left-0 border-r-0 border-b-0 rounded-tl-md" style={{filter: `drop-shadow(0 0 8px hsla(${primaryColorRgb}, 0.3))`}}/>
            <div className="absolute w-12 h-12 border-2 border-primary/60 animate-cornerPulse top-0 right-0 border-l-0 border-b-0 rounded-tr-md" style={{filter: `drop-shadow(0 0 8px hsla(${primaryColorRgb}, 0.3))`}}/>
            <div className="absolute w-12 h-12 border-2 border-primary/60 animate-cornerPulse bottom-0 left-0 border-r-0 border-t-0 rounded-bl-md" style={{filter: `drop-shadow(0 0 8px hsla(${primaryColorRgb}, 0.3))`}}/>
            <div className="absolute w-12 h-12 border-2 border-primary/60 animate-cornerPulse bottom-0 right-0 border-l-0 border-t-0 rounded-br-md" style={{filter: `drop-shadow(0 0 8px hsla(${primaryColorRgb}, 0.3))`}}/>
        </div>
        
        {/* Particles */}
        {[...Array(5)].map((_, i) => (
             <div key={`p-${i}`} className="absolute w-1 h-1 bg-primary/80 rounded-full shadow-[0_0_6px_var(--tw-shadow-color)] shadow-primary/60 animate-particleFloat" style={{
                left: `${10 + i * 20}%`, 
                animationDelay: `${i * 0.5}s`,
                '--tw-shadow-color': primaryColor
            } as React.CSSProperties} />
        ))}
        
        {/* Holographic shimmer */}
        <div className="absolute top-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        
        {/* Radial pulses */}
        {[...Array(3)].map((_, i) => (
            <div key={`pulse-${i}`} className="absolute top-1/2 left-1/2 w-20 h-20 -mt-10 -ml-10 rounded-full border border-primary/30 animate-radialPulse" style={{animationDelay: `${i * 0.5}s`}}/>
        ))}
        
        {/* Data streams */}
        {[...Array(5)].map((_, i) => (
            <div key={`ds-${i}`} className="absolute top-0 w-px h-full bg-gradient-to-b from-transparent via-primary/40 to-transparent animate-dataStream" style={{
                left: `${15 + i * 15}%`,
                animationDelay: `${i * 0.3}s`
            }} />
        ))}
        
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.1)_80%,rgba(0,0,0,0.2)_100%)]"/>
        
        {/* Status indicator */}
        <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-black/60 border border-primary/40 rounded-full text-primary text-[11px] font-semibold tracking-wider backdrop-blur-sm animate-statusBlink shadow-[0_0_15px_var(--tw-shadow-color)] shadow-primary/30" style={{'--tw-shadow-color': primaryColor} as React.CSSProperties}>
          SCANNING...
        </div>
    </div>
  );
}
