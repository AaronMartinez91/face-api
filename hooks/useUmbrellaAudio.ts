// hooks/useUmbrellaAudio.ts
"use client";

import { useEffect, useRef } from "react";

export const useUmbrellaAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Inicializar AudioContext (solo en cliente)
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Beep UI sutil (botones)
  const playBeep = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  };

  // Scanning sound (tech/futurista)
  const playScanning = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 300;
    oscillator.type = "sawtooth";
    
    filter.type = "lowpass";
    filter.frequency.value = 1000;
    
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    
    // Sweep frequency
    oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
    oscillator.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.6);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.6);
  };

  // Access Granted (tono de éxito)
  const playGranted = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    
    // Dos tonos ascendentes
    [440, 554.37].forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";
      
      const startTime = ctx.currentTime + (i * 0.1);
      gainNode.gain.setValueAtTime(0.15, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  };

  // Access Denied (alarma sutil)
  const playDenied = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    
    // Tres pulsos bajos
    [0, 0.15, 0.3].forEach((offset) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 200;
      oscillator.type = "square";
      
      const startTime = ctx.currentTime + offset;
      gainNode.gain.setValueAtTime(0.1, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.12);
    });
  };

  // Ambiente de fondo sutil (loop)
  const playAmbience = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 60;
    oscillator.type = "sine";
    
    filter.type = "lowpass";
    filter.frequency.value = 200;
    
    gainNode.gain.setValueAtTime(0.02, ctx.currentTime); // Muy bajo

    oscillator.start();
    
    return () => {
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      oscillator.stop(ctx.currentTime + 1);
    };
  };

  return {
    playBeep,
    playScanning,
    playGranted,
    playDenied,
    playAmbience,
  };
};