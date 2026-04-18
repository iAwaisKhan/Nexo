import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, Volume2, VolumeX, CloudRain, Wind, Waves } from "lucide-react";

type SoundType = 'brown' | 'pink' | 'white';

interface AudioNodes {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  filter: BiquadFilterNode;
}

export const ZenMode: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentSound, setCurrentSound] = useState<SoundType>('brown');
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNodes | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize Audio Context on demand to comply with browser autoplay policies
  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  // Generate perfect synthetic noise mathematically (bug-free, zero dependencies, no 404s)
  const createNoiseBuffer = (ctx: AudioContext, type: SoundType) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of seamless loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      // Pink Noise Approximation (Paul Kellet's algorithm)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // gain compensation
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      // Brown Noise Approximation (Integration of White Noise)
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // gain compensation
      }
    }

    return buffer;
  };

  const playSound = (type: SoundType) => {
    const ctx = initAudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // Stop currently playing
    if (nodesRef.current) {
      nodesRef.current.source.stop();
      nodesRef.current.source.disconnect();
      nodesRef.current.filter.disconnect();
      nodesRef.current.gainNode.disconnect();
    }

    const buffer = createNoiseBuffer(ctx, type);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter to make it sound more natural and pleasant
    const filter = ctx.createBiquadFilter();
    
    if (type === 'brown') {
      filter.type = 'lowpass';
      filter.frequency.value = 400; // Deep rumble
    } else if (type === 'pink') {
      filter.type = 'lowpass';
      filter.frequency.value = 800; // Rain-like
    } else {
      filter.type = 'lowpass';
      filter.frequency.value = 3000; // Wind-like
    }

    const gainNode = ctx.createGain();
    // Fade in
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(0);
    nodesRef.current = { source, gainNode, filter };
    setIsPlaying(true);
  };

  const stopSound = () => {
    if (nodesRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const gainNode = nodesRef.current.gainNode;
      const source = nodesRef.current.source;
      const filter = nodesRef.current.filter;
      
      // Fade out
      gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      
      setTimeout(() => {
        source.stop();
        source.disconnect();
        filter.disconnect();
        gainNode.disconnect();
      }, 1000);
      
      nodesRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSound();
    } else {
      playSound(currentSound);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (nodesRef.current && audioCtxRef.current) {
      nodesRef.current.gainNode.gain.setTargetAtTime(newVol, audioCtxRef.current.currentTime, 0.1);
    }
  };

  const handleSoundChange = (type: SoundType) => {
    setCurrentSound(type);
    if (isPlaying) {
      playSound(type);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (nodesRef.current) {
        nodesRef.current.source.stop();
        nodesRef.current.source.disconnect();
        nodesRef.current.filter.disconnect();
        nodesRef.current.gainNode.disconnect();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="relative z-[90]" ref={menuRef}>
      {/* Zen Mode Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300 ${
          isPlaying 
            ? "bg-white/10 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
            : "bg-black/20 border-white/10 text-white/70 hover:text-white"
        }`}
        title="Zen Mode"
      >
        <Headphones className="w-4 h-4" />
        {isPlaying && (
          <div className="flex items-end gap-[3px] h-4">
            <motion.div animate={{ height: ["4px", "14px", "4px"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0 }} className="w-1 bg-white/70 rounded-full" />
            <motion.div animate={{ height: ["4px", "12px", "4px"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-1 bg-white/70 rounded-full" />
            <motion.div animate={{ height: ["4px", "10px", "4px"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="w-1 bg-white/70 rounded-full" />
          </div>
        )}
      </motion.button>

      {/* Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-3 w-64 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">Zen Mode</h3>
              <button 
                onClick={togglePlay} 
                className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-white/20 text-white' : 'hover:bg-white/5 text-white/70 hover:text-white'}`}
              >
                {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-2 mb-6">
              <SoundOption 
                icon={<Waves className="w-4 h-4" />} 
                label="Deep Focus" 
                desc="Brown Noise"
                active={currentSound === "brown"} 
                onClick={() => handleSoundChange("brown")} 
              />
              <SoundOption 
                icon={<CloudRain className="w-4 h-4" />} 
                label="Gentle Rain" 
                desc="Pink Noise"
                active={currentSound === "pink"} 
                onClick={() => handleSoundChange("pink")} 
              />
              <SoundOption 
                icon={<Wind className="w-4 h-4" />} 
                label="Soft Wind" 
                desc="White Noise"
                active={currentSound === "white"} 
                onClick={() => handleSoundChange("white")} 
              />
            </div>

            {/* Volume Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <span>Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full transition-all hover:[&::-webkit-slider-thumb]:scale-125"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SoundOption = ({ icon, label, desc, active, onClick }: { icon: React.ReactNode, label: string, desc: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
      active 
        ? "bg-white/10 text-white shadow-inner" 
        : "text-white/50 hover:bg-white/5 hover:text-white/90"
    }`}
  >
    <div className={`p-2 rounded-lg ${active ? 'bg-white/10' : 'bg-transparent'}`}>
      {icon}
    </div>
    <div className="flex flex-col items-start text-left">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-[10px] text-white/40 tracking-wider uppercase">{desc}</span>
    </div>
    {active && (
      <motion.div layoutId="activeSound" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
    )}
  </button>
);
