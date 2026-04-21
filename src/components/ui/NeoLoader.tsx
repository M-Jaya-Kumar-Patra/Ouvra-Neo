import Image from "next/image";


export function NeoLoader({ label = "Ouvra Neo", fullScreen = true }) {
  return (
    <div className={fullScreen ? "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] backdrop-blur-xl" : "flex flex-col items-center justify-center py-10"}>
      <div className="relative">
        {/* Animated outer ring */}
        <div className="absolute -inset-4 border-t-2 border-b-2 border-indigo-500/30 rounded-full animate-spin-slow"></div>
        
        {/* Pulsing glow behind the logo */}
        <div className="absolute inset-0 bg-indigo-600/20 blur-3xl animate-pulse-gentle rounded-full"></div>

        {/* The Logo with a shimmer effect */}
        <div className="relative bg-zinc-900/80 p-4 rounded-full border border-zinc-800 shadow-2xl overflow-hidden">
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={80} 
            height={80} 
            className="relative z-10 animate-float"
          />
          {/* Shimmer line that passes over the logo */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
        </div>
      </div>

      {/* Loading Text with glowing dots */}
      <div className="mt-8 text-center">
        <p className="text-indigo-400 font-bold tracking-[0.3em] uppercase text-xs mb-3 animate-pulse">
          {label}
        </p>
        <div className="flex justify-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
}