// NeuroScope VR - Clinical VR Environments (3 Specialized Environments)
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Info,
  AlertTriangle,
  CheckCircle,
  Headset,
  Mic,
  Heart,
  Wind,
  Sun,
  Sparkles,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

import { supabase } from '@/lib/supabase';

type ClinicalEnvironment = 'anxiety' | 'depression' | 'burnout';

interface VREnvironmentsProps {
  sessionId?: string;
  patientId?: string;
  initialEnvironment?: ClinicalEnvironment;
  initialIntensity?: 1 | 2 | 3;
  isTherapist?: boolean;
  onEnvironmentChange?: (env: ClinicalEnvironment) => void;
  onComfortCheck?: (status: 'comfortable' | 'uncomfortable') => void;
}

// Breathing animation cycle component
const BreathingGuide: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const cycle = async () => {
      // Inhale: 4 seconds
      setPhase('inhale');
      for (let i = 0; i <= 100; i += 2) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 40));
      }

      // Hold: 2 seconds
      setPhase('hold');
      await new Promise(r => setTimeout(r, 2000));

      // Exhale: 6 seconds
      setPhase('exhale');
      for (let i = 100; i >= 0; i -= 1.5) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 40));
      }
    };

    const interval = setInterval(cycle, 14000); // Full cycle every 14s
    cycle();

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const scale = 0.5 + (progress / 100) * 0.5; // Scale from 0.5 to 1.0

  return (
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
      <div className="relative flex flex-col items-center">
        {/* Breathing Sphere */}
        <div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 shadow-2xl transition-transform duration-100 flex items-center justify-center"
          style={{
            transform: `scale(${scale})`,
            boxShadow: `0 0 ${40 + progress * 0.6}px rgba(45, 212, 191, ${0.3 + progress * 0.005})`
          }}
        >
          <Wind className="w-12 h-12 text-white/80" />
        </div>

        {/* Phase Text */}
        <div className="mt-6 text-center">
          <p className="text-2xl font-bold text-white drop-shadow-lg">
            {phase === 'inhale' && 'Inspire...'}
            {phase === 'hold' && 'Segure...'}
            {phase === 'exhale' && 'Expire...'}
          </p>
          <p className="text-sm text-white/70 mt-1">
            {phase === 'inhale' && '4 segundos'}
            {phase === 'hold' && '2 segundos'}
            {phase === 'exhale' && '6 segundos'}
          </p>
        </div>

        {/* Progress Ring */}
        <svg className="absolute -top-4 -left-4 w-40 h-40 -rotate-90 pointer-events-none">
          <circle
            cx="80"
            cy="80"
            r="76"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="3"
          />
          <circle
            cx="80"
            cy="80"
            r="76"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 76}`}
            strokeDashoffset={`${2 * Math.PI * 76 * (1 - progress / 100)}`}
            className="transition-all duration-100"
          />
        </svg>
      </div>
    </div>
  );
};

const VREnvironments: React.FC<VREnvironmentsProps> = ({
  sessionId,
  patientId,
  initialEnvironment = 'anxiety',
  initialIntensity = 1,
  onEnvironmentChange,
  onComfortCheck,
}) => {
  const [currentEnvironment, setCurrentEnvironment] = useState<ClinicalEnvironment>(initialEnvironment);
  const [intensity, setIntensity] = useState<1 | 2 | 3>(initialIntensity);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [natureVolume, setNatureVolume] = useState(0.6);
  const [isAudioDucked, setIsAudioDucked] = useState(false);

  // Comfort check state
  const [isGazing, setIsGazing] = useState(false);
  const [gazeProgress, setGazeProgress] = useState(0);
  const [comfortStatus, setComfortStatus] = useState<'comfortable' | 'neutral' | 'uncomfortable'>('neutral');
  const [isTherapistSpeaking, setIsTherapistSpeaking] = useState(false);
  const [showComfortFeedback, setShowComfortFeedback] = useState(false);

  // Retícula (cursor) position
  const [reticleX, setReticleX] = useState(50);
  const [reticleY, setReticleY] = useState(50);

  // Connection state
  const [isConnected] = useState(true);
  const [therapistName] = useState('Dra. Maria Silva');

  // Refs
  const sceneRef = useRef<any>(null);
  const gazeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gazeStartTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<any>(null);
  const reticleEntityRef = useRef<any>(null);

  // Environment switching
  const switchEnvironment = useCallback((env: ClinicalEnvironment) => {
    setCurrentEnvironment(env);
    onEnvironmentChange?.(env);
  }, [onEnvironmentChange]);

  const nextEnvironment = useCallback(() => {
    const envs: ClinicalEnvironment[] = ['anxiety', 'depression', 'burnout'];
    const currentIndex = envs.indexOf(currentEnvironment);
    const nextIndex = (currentIndex + 1) % envs.length;
    switchEnvironment(envs[nextIndex]);
  }, [currentEnvironment, switchEnvironment]);

  const prevEnvironment = useCallback(() => {
    const envs: ClinicalEnvironment[] = ['anxiety', 'depression', 'burnout'];
    const currentIndex = envs.indexOf(currentEnvironment);
    const prevIndex = (currentIndex - 1 + envs.length) % envs.length;
    switchEnvironment(envs[prevIndex]);
  }, [currentEnvironment, switchEnvironment]);

  // Simulate gyroscope movement for retícula
  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma || 0;
      const beta = event.beta || 0;

      const x = Math.max(10, Math.min(90, 50 + (gamma / 45) * 40));
      const y = Math.max(10, Math.min(90, 50 + (beta / 45) * 40));

      setReticleX(x);
      setReticleY(y);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setReticleX(Math.max(10, Math.min(90, x)));
        setReticleY(Math.max(10, Math.min(90, y)));
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Broadcast gaze and comfort data to Supabase
  useEffect(() => {
    const normalizedSessionId = sessionId || 'demo';
    const channel = supabase.channel(`session:${normalizedSessionId}`);

    channel.on('broadcast', { event: 'mic-status' }, ({ payload }) => {
      setIsTherapistSpeaking(payload.isMicOn);
    }).subscribe();

    // Broadcast every 200ms
    const broadcastInterval = setInterval(() => {
      channel.send({
        type: 'broadcast',
        event: 'telemetry',
        payload: {
          gazeX: reticleX,
          gazeY: reticleY,
          comfortStatus,
          timestamp: new Date().toISOString()
        }
      });
    }, 200);

    return () => {
      clearInterval(broadcastInterval);
      supabase.removeChannel(channel);
    };
  }, [sessionId, reticleX, reticleY, comfortStatus]);

  // Check if retícula is over comfort icon
  useEffect(() => {
    const distance = Math.sqrt(
      Math.pow(reticleX - 50, 2) + Math.pow(reticleY - 50, 2)
    );

    if (distance < 15 && !isGazing) {
      handleGazeStart();
    } else if (distance >= 15 && isGazing) {
      handleGazeEnd();
    }
  }, [reticleX, reticleY]);

  // Handle gaze on comfort icon
  const handleGazeStart = () => {
    if (isGazing) return;

    setIsGazing(true);
    gazeStartTimeRef.current = Date.now();

    gazeTimerRef.current = setInterval(() => {
      if (gazeStartTimeRef.current) {
        const elapsed = Date.now() - gazeStartTimeRef.current;
        const progress = Math.min((elapsed / 2000) * 100, 100);
        setGazeProgress(progress);

        if (elapsed >= 2000) {
          handleComfortCheck();
        }
      }
    }, 50);
  };

  const handleGazeEnd = () => {
    setIsGazing(false);
    setGazeProgress(0);
    gazeStartTimeRef.current = null;

    if (gazeTimerRef.current) {
      clearInterval(gazeTimerRef.current);
      gazeTimerRef.current = null;
    }
  };

  const handleComfortCheck = () => {
    setComfortStatus('comfortable');
    setShowComfortFeedback(true);
    onComfortCheck?.('comfortable');

    // Send to Supabase in real implementation
    console.log('Comfort check triggered:', { sessionId, patientId, timestamp: new Date().toISOString() });

    setTimeout(() => {
      setShowComfortFeedback(false);
      handleGazeEnd();
    }, 2000);
  };

  // Voice command with audio ducking
  const toggleMic = () => {
    setIsMicActive(prev => {
      const newState = !prev;
      // Apply 70% audio ducking when mic is active
      setIsAudioDucked(newState);
      setNatureVolume(newState ? 0.18 : 0.6); // 70% reduction
      return newState;
    });
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      sceneRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Enter VR mode
  const enterVR = () => {
    if (sceneRef.current) {
      // @ts-ignore
      if (sceneRef.current.requestFullscreen) {
        // @ts-ignore
        sceneRef.current.requestFullscreen();
      }
    }
  };

  // No longer using getEnvironmentHTML as a string

  const getSkyColor = () => {
    switch (currentEnvironment) {
      case 'anxiety':
        return intensity === 1 ? '#87CEEB' : intensity === 2 ? '#5DADE2' : '#2E86AB';
      case 'depression':
        return intensity === 1 ? '#FFF9C4' : intensity === 2 ? '#FFF176' : '#FFEE58';
      case 'burnout':
        return intensity === 1 ? '#F0F9FF' : intensity === 2 ? '#BAE6FD' : '#7DD3FC';
      default:
        return '#87CEEB';
    }
  };

  // Render helpers (now returning React elements instead of strings)
  const renderAnxiety = () => (
    <>
      <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" color={intensity === 1 ? '#90EE90' : '#7CB342'}></a-plane>
      {Array.from({ length: intensity * 15 }).map((_, i) => (
        <React.Fragment key={i}>
          <a-cone position={`${(Math.random() - 0.5) * 40} 2 ${(Math.random() - 0.5) * 40 - 10}`} radius-bottom="1.5" radius-top="0" height="4" color={`hsl(${120 + Math.random() * 20}, 60%, 40%)`}></a-cone>
          <a-cylinder position={`${(Math.random() - 0.5) * 40} 1 ${(Math.random() - 0.5) * 40 - 10}`} radius="0.3" height="2" color="#8D6E63"></a-cylinder>
        </React.Fragment>
      ))}
    </>
  );

  const renderDepression = () => (
    <>
      <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" color="#1a1a1a"></a-plane>

      {/* Curved Background Image for Deep Immersion */}
      <a-curvedimage
        src="/assets/environments/depression_bg.jpg"
        height="8"
        radius="12"
        theta-length="180"
        rotation="0 90 0"
        position="0 4 0"
        material="shader: flat; side: double; opacity: 0.9"
      ></a-curvedimage>

      <a-curvedimage
        src="/assets/environments/depression_bg.jpg"
        height="8"
        radius="12"
        theta-length="180"
        rotation="0 270 0"
        position="0 4 0"
        material="shader: flat; side: double; opacity: 0.9"
      ></a-curvedimage>

      {/* Floating Sparkles for Positive Activation */}
      {Array.from({ length: intensity * 20 }).map((_, i) => (
        <a-sphere
          key={i}
          position={`${(Math.random() - 0.5) * 15} ${1 + Math.random() * 4} ${(Math.random() - 0.5) * 15}`}
          radius="0.05"
          color="#FFF9C4"
          animation="property: position; dir: alternate; dur: 3000; easing: easeInOutSine; loop: true; to: ${(Math.random() - 0.5) * 15} ${1.5 + Math.random() * 4} ${(Math.random() - 0.5) * 15}"
          material="emissive: #FFF9C4; emissiveIntensity: 2"
        ></a-sphere>
      ))}

      <a-entity position="0 0.05 -5">
        <a-circle radius="1" rotation="-90 0 0" color="#FFF" material="opacity: 0.2; transparent: true"></a-circle>
        <a-text value="Foco na Luz" align="center" position="0 1.5 0" scale="0.8 0.8 0.8" color="#FFF" font="exo2bold"></a-text>
      </a-entity>
    </>
  );

  const renderBurnout = () => (
    <>
      <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" color="#F3E5AB"></a-plane>
      <a-plane position="0 0.1 -20" rotation="-90 0 0" width="100" height="40" color="#0077be" material="opacity: 0.6; transparent: true">
      </a-plane>
      <a-sphere position="0 15 -50" radius="8" color="#FFD700" material="shader: flat; lighting: false"></a-sphere>
    </>
  );

  // Get environment display info
  const getEnvironmentInfo = () => {
    switch (currentEnvironment) {
      case 'anxiety':
        return {
          name: 'Controle de Ansiedade',
          description: 'Foco em respiração e calma natural',
          icon: Wind,
          color: 'from-emerald-500 to-teal-600'
        };
      case 'depression':
        return {
          name: 'Ativação (Depressão)',
          description: 'Cores vibrantes e estímulos positivos',
          icon: Sparkles,
          color: 'from-yellow-400 to-orange-500'
        };
      case 'burnout':
        return {
          name: 'Descompressão (Burnout)',
          description: 'Isolamento sereno e regeneração',
          icon: Sun,
          color: 'from-blue-400 to-indigo-500'
        };
    }
  };

  const envInfo = getEnvironmentInfo();
  const EnvIcon = envInfo.icon;

  // Load A-Frame script
  useEffect(() => {
    // @ts-ignore
    if (!window.AFRAME) {
      const script = document.createElement('script');
      script.src = 'https://aframe.io/releases/1.4.2/aframe.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div ref={sceneRef} className="relative w-full h-screen bg-slate-900 overflow-hidden">
      {/* A-Frame Scene */}
      <div ref={containerRef} className="absolute inset-0">
        <a-scene
          embedded
          vr-mode-ui="enabled: true"
          renderer="antialias: false; colorManagement: true; precision: medium;"
          // @ts-ignore
          ref={(ref) => { if (ref) sceneRef.current = ref; }}
        >
          <a-assets>
            <img id="depression-bg" src="/assets/environments/depression_bg.jpg" />
          </a-assets>

          <a-sky color={getSkyColor()}></a-sky>
          <a-light type="ambient" color="#BBB" intensity={0.4 + intensity * 0.2}></a-light>
          <a-light type="directional" color="#FFF" intensity={0.6 + intensity * 0.2} position={`${-3 + intensity} 8 5`}></a-light>

          {/* Environments */}
          {currentEnvironment === 'anxiety' && renderAnxiety()}
          {currentEnvironment === 'depression' && renderDepression()}
          {currentEnvironment === 'burnout' && renderBurnout()}

          {/* Immersive HUD (3D) */}
          <a-entity position="0 2.5 -4" rotation="10 0 0">
            <a-plane width="3" height="0.8" color="#000" material="opacity: 0.6; transparent: true" radius="0.1"></a-plane>
            <a-text value={envInfo.name.toUpperCase()} align="center" position="0 0.15 0.01" scale="0.6 0.6 0.6" color="#FFF"></a-text>
            <a-text value="Status: Sincronizado" align="center" position="0 -0.15 0.01" scale="0.4 0.4 0.4" color="#10B981"></a-text>
          </a-entity>

          {/* Comfort Check Icon in 3D */}
          <a-entity position="0 2 -3">
            <a-sphere
              radius="0.3"
              color={comfortStatus === 'comfortable' ? '#10B981' : '#F43F5E'}
            ></a-sphere>
            <a-text
              value="Olhe para confirmar conforto"
              align="center"
              position="0 -0.6 0"
              scale="0.5 0.5 0.5"
              color="white"
            ></a-text>
          </a-entity>

          {/* Camera & Optimized Cursor */}
          <a-entity position="0 1.6 0">
            <a-camera ref={cameraRef} look-controls="enabled: true" wasd-controls="enabled: false">
              <a-entity
                ref={reticleEntityRef}
                cursor="fuse: true; fuseTimeout: 2000"
                position="0 0 -1"
                geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
                material="color: #10B981; shader: flat"
              >
              </a-entity>
            </a-camera>
          </a-entity>
        </a-scene>
      </div>

      {/* Breathing Guide Overlay (only for anxiety) */}
      <BreathingGuide isActive={currentEnvironment === 'anxiety'} />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
          {/* Connection Status */}
          <div className="pointer-events-auto">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Terapeuta: {therapistName}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Environment Switcher */}
          <div className="pointer-events-auto flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={prevEnvironment}
              className="bg-white/90 backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-2 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${envInfo.color} flex items-center justify-center`}>
                  <EnvIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{envInfo.name}</p>
                  <p className="text-xs text-slate-500">{envInfo.description}</p>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="secondary"
              size="icon"
              onClick={nextEnvironment}
              className="bg-white/90 backdrop-blur-sm"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Controls */}
          <div className="pointer-events-auto flex gap-2">
            <Button
              variant={isMicActive ? "default" : "secondary"}
              size="icon"
              onClick={toggleMic}
              className={isMicActive ? "bg-rose-500 text-white" : "bg-white/90 backdrop-blur-sm"}
            >
              <Mic className={`w-5 h-5 ${isMicActive ? 'animate-pulse' : ''}`} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleFullscreen}
              className="bg-white/90 backdrop-blur-sm"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setNatureVolume(v => v === 0 ? 0.6 : 0)}
              className="bg-white/90 backdrop-blur-sm"
            >
              {natureVolume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Audio Ducking Indicator */}
        {isAudioDucked && (
          <div className="absolute top-20 right-4 pointer-events-auto">
            <Card className="bg-amber-100 border-amber-300">
              <CardContent className="p-2 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-medium text-amber-700">Áudio reduzido (70%)</span>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Retícula (Gaze Cursor) */}
        <div
          className="absolute pointer-events-none transition-all duration-100 z-30"
          style={{
            left: `${reticleX}%`,
            top: `${reticleY}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Outer ring */}
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${isGazing ? 'border-emerald-400' : 'border-white/50'
            }`}>
            {/* Inner dot */}
            <div className={`w-2 h-2 rounded-full ${isGazing ? 'bg-emerald-400' : 'bg-white/70'
              }`} />
          </div>

          {/* Gaze progress ring */}
          {isGazing && (
            <svg className="absolute inset-0 w-12 h-12 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="22"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - gazeProgress / 100)}`}
                className="transition-all duration-100"
              />
            </svg>
          )}
        </div>

        {/* Comfort Feedback */}
        {showComfortFeedback && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-auto z-30">
            <Card className="bg-emerald-500 text-white border-none shadow-2xl animate-in fade-in zoom-in duration-300">
              <CardContent className="p-6 flex items-center gap-4">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <p className="text-lg font-bold">Conforto Confirmado!</p>
                  <p className="text-sm opacity-90">Sinal enviado ao terapeuta</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mic Status */}
        {(isMicActive || isTherapistSpeaking) && (
          <div className="absolute top-20 left-4 pointer-events-auto z-20">
            <Card className="bg-rose-500 text-white border-none animate-pulse">
              <CardContent className="p-3 flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isTherapistSpeaking ? 'Terapeuta falando...' : 'Seu microfone está ativo'}
                </span>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bottom Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex justify-between items-end">
            {/* Environment Info */}
            <Card className="bg-white/90 backdrop-blur-sm pointer-events-auto">
              <CardContent className="p-3">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Ambiente</p>
                    <p className="font-medium text-slate-900">{envInfo.name}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <p className="text-xs text-slate-500">Intensidade</p>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          onClick={() => setIntensity(level as 1 | 2 | 3)}
                          className={`w-6 h-6 rounded text-xs font-bold transition-colors ${level <= intensity
                            ? 'bg-gradient-to-br ' + envInfo.color + ' text-white'
                            : 'bg-slate-200 text-slate-400'
                            }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VR Button */}
            <div className="pointer-events-auto">
              <Button
                onClick={enterVR}
                className={`bg-gradient-to-r ${envInfo.color} text-white shadow-lg`}
              >
                <Headset className="w-5 h-5 mr-2" />
                Entrar no VR
              </Button>
            </div>

            {/* Comfort Instructions */}
            <Card className="bg-white/90 backdrop-blur-sm pointer-events-auto max-w-xs">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-teal-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Como usar a Retícula</p>
                    <p className="text-xs text-slate-500">
                      Mova o celular para controlar o cursor. Olhe para o ícone de coração por 2 segundos para confirmar conforto.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto z-20">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Supervisão humana permanente</span>
          </div>
        </div>

        {/* Comfort Icon Overlay (for touch simulation) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20">
          <button
            onMouseDown={handleGazeStart}
            onMouseUp={handleGazeEnd}
            onMouseLeave={handleGazeEnd}
            onTouchStart={handleGazeStart}
            onTouchEnd={handleGazeEnd}
            className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all"
            style={{
              backgroundColor: comfortStatus === 'comfortable' ? '#10B981' : '#F43F5E',
              transform: isGazing ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <Heart className="w-10 h-10 text-white" />

            {/* Gaze Progress Ring */}
            {isGazing && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="38"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - gazeProgress / 100)}`}
                  className="transition-all duration-100"
                />
              </svg>
            )}
          </button>
          <p className="text-white text-center mt-2 text-sm font-medium drop-shadow-lg">
            Toque e segure
          </p>
        </div>
      </div>
    </div>
  );
};

export default VREnvironments;
