import { useEffect, useRef } from 'react';

export type SoundType = 'none' | 'brown-noise' | 'pink-noise';

export const useAmbientSound = (isActive: boolean, isMuted: boolean, type: SoundType = 'brown-noise') => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize Audio Context on demand
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const createNoiseBuffer = (ctx: AudioContext, type: SoundType) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'brown-noise') {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate gain
      }
    } else if (type === 'pink-noise') {
      let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // Compensate gain
        b6 = white * 0.115926;
      }
    }

    return buffer;
  };

  const playSound = () => {
    if (type === 'none') return;
    
    const ctx = initAudio();
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    // Clean up existing nodes
    stopSound();

    const buffer = createNoiseBuffer(ctx, type);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter to make it warmer
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = type === 'brown-noise' ? 400 : 1000;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0; // Start at 0 for fade in

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start();
    
    // Fade in
    gainNode.gain.setTargetAtTime(isMuted ? 0 : 0.5, ctx.currentTime, 1);

    bufferSourceRef.current = source;
    gainNodeRef.current = gainNode;
  };

  const stopSound = () => {
    const source = bufferSourceRef.current;
    const gainNode = gainNodeRef.current;
    const audioContext = audioCtxRef.current;
    bufferSourceRef.current = null;
    gainNodeRef.current = null;

    if (source) {
      try {
        if (gainNode && audioContext) {
          // Fade out before stopping
          gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.5);
          setTimeout(() => {
            try {
              source.stop();
              source.disconnect();
            } catch {
              // The captured source may already have stopped.
            }
          }, 1000);
        } else {
          source.stop();
          source.disconnect();
        }
      } catch {
        // Ignore errors from already stopped nodes
      }
    }
  };

  useEffect(() => {
    if (isActive && !isMuted && type !== 'none') {
      playSound();
    } else {
      stopSound();
    }
    
    return () => {
      stopSound();
    };
  }, [isActive, isMuted, type]);

  useEffect(() => () => {
    const context = audioCtxRef.current;
    audioCtxRef.current = null;
    if (context && context.state !== 'closed') void context.close().catch(() => {});
  }, []);

};
