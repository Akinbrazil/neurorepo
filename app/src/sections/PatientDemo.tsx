// NeuroScope VR - Patient Demo Mode (Modo Paciente Mestre)
// Ambiente VR completo com todas as funcionalidades de telemetria e comunicação
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Headset, CheckCircle, AlertTriangle, Info, Heart, Wind, Sun, Sparkles,
  Mic, MicOff, Volume2, VolumeX, Maximize2, Minimize2,
  ArrowLeft, ArrowRight, MessageSquare, Activity, User, MapPin
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type ClinicalEnvironment = 'anxiety' | 'depression' | 'burnout';
type ComfortLevel = 'comfortable' | 'neutral' | 'uncomfortable';

// Breathing Guide Component
const BreathingGuide: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const cycle = async () => {
      setPhase('inhale');
      for (let i = 0; i <= 100; i += 2) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 40));
      }
      setPhase('hold');
      await new Promise(r => setTimeout(r, 2000));
      setPhase('exhale');
      for (let i = 100; i >= 0; i -= 1.5) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 40));
      }
    };

    const interval = setInterval(cycle, 14000);
    cycle();
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const scale = 0.5 + (progress / 100) * 0.5;

  return (
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
      <div className="relative flex flex-col items-center">
        <div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 shadow-2xl transition-transform duration-100 flex items-center justify-center"
          style={{
            transform: `scale(${scale})`,
            boxShadow: `0 0 ${40 + progress * 0.6}px rgba(45, 212, 191, ${0.3 + progress * 0.005})`
          }}
        >
          <Wind className="w-12 h-12 text-white/80" />
        </div>
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
        <svg className="absolute -top-4 -left-4 w-40 h-40 -rotate-90 pointer-events-none">
          <circle cx="80" cy="80" r="76" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
          <circle
            cx="80" cy="80" r="76" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 76}`}
            strokeDashoffset={`${2 * Math.PI * 76 * (1 - progress / 100)}`}
            className="transition-all duration-100"
          />
        </svg>
      </div>
    </div>
  );
};

const PatientDemo: React.FC = () => {
  const { setCurrentView } = useAuth();
  
  // ===== SESSION STATE =====
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentEnvironment, setCurrentEnvironment] = useState<ClinicalEnvironment>('anxiety');
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2);
  
  // ===== CONNECTION STATE =====
  const [isConnected, setIsConnected] = useState(false);
  const [therapistName, setTherapistName] = useState('Dr. Demo Master');
  const [therapistSpeaking, setTherapistSpeaking] = useState(false);
  const [therapistMessage, setTherapistMessage] = useState<string | null>(null);
  
  // ===== AUDIO/VR STATE =====
  const [isMicActive, setIsMicActive] = useState(false);
  const [natureVolume, setNatureVolume] = useState(60);
  const [isAudioDucked, setIsAudioDucked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  
  // ===== COMFORT/GAZE STATE =====
  const [isGazing, setIsGazing] = useState(false);
  const [gazeProgress, setGazeProgress] = useState(0);
  const [comfortStatus, setComfortStatus] = useState<ComfortLevel>('neutral');
  const [showComfortFeedback, setShowComfortFeedback] = useState(false);
  const [reticleX, setReticleX] = useState(50);
  const [reticleY, setReticleY] = useState(50);
  
  // ===== REFS =====
  const sceneRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gazeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gazeStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // ===== PARSE URL PARAMETERS =====
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const env = params.get('env') as ClinicalEnvironment;
    const int = params.get('intensity');
    const therapist = params.get('therapist');
    
    if (env && ['anxiety', 'depression', 'burnout'].includes(env)) {
      setCurrentEnvironment(env);
    }
    if (int) setIntensity(parseInt(int) as 1 | 2 | 3);
    if (therapist) setTherapistName(therapist === 'demo-master' ? 'Dr. Demo Master' : 'Terapeuta');
    
    // Load saved permissions
    const savedMic = localStorage.getItem('neuroscope_mic_perm');
    if (savedMic === 'true') setHasMicPermission(true);
  }, []);

  // ===== SESSION TIMER =====
  useEffect(() => {
    if (hasStarted && isConnected) {
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, isConnected]);

  // ===== SUPABASE REALTIME CONNECTION =====
  useEffect(() => {
    if (!hasStarted) return;

    const channel = supabase.channel('session:demo-master');

    channel
      .on('broadcast', { event: 'mic-status' }, ({ payload }: { payload: { isMicOn: boolean } }) => {
        setTherapistSpeaking(payload.isMicOn);
        setIsAudioDucked(payload.isMicOn);
        if (payload.isMicOn) {
          setNatureVolume(18); // 70% reduction
        } else {
          setNatureVolume(60);
        }
      })
      .on('broadcast', { event: 'therapist-message' }, ({ payload }: { payload: { message: string } }) => {
        setTherapistMessage(payload.message);
        setTimeout(() => setTherapistMessage(null), 5000);
      })
      .on('broadcast', { event: 'environment-change' }, ({ payload }: { payload: { environment: ClinicalEnvironment; intensity: 1 | 2 | 3 } }) => {
        if (payload.environment) setCurrentEnvironment(payload.environment);
        if (payload.intensity) setIntensity(payload.intensity);
      })
      .on('broadcast', { event: 'session-ended' }, () => {
        alert('Sessão encerrada pelo terapeuta.');
        handleExit();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // Notify therapist that patient connected
          channel.send({ type: 'broadcast', event: 'patient-connected', payload: {} });
        }
      });

    return () => {
      channel.send({ type: 'broadcast', event: 'patient-disconnected', payload: {} });
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted]);

  // ===== TELEMETRY BROADCAST =====
  useEffect(() => {
    if (!hasStarted || !isConnected) return;

    const channel = supabase.channel('session:demo-master');
    
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

    return () => clearInterval(broadcastInterval);
  }, [hasStarted, isConnected, reticleX, reticleY, comfortStatus]);

  // ===== GAZE TRACKING =====
  useEffect(() => {
    if (!hasStarted) return;

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
  }, [hasStarted]);

  // ===== COMFORT CHECK GAZE DETECTION =====
  useEffect(() => {
    if (!hasStarted) return;

    const distance = Math.sqrt(Math.pow(reticleX - 50, 2) + Math.pow(reticleY - 50, 2));

    if (distance < 15 && !isGazing) {
      handleGazeStart();
    } else if (distance >= 15 && isGazing) {
      handleGazeEnd();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reticleX, reticleY, hasStarted, isGazing]);

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
    
    setTimeout(() => {
      setShowComfortFeedback(false);
      handleGazeEnd();
      setComfortStatus('neutral');
    }, 2000);
  };

  // ===== PERMISSIONS & START =====
  const requestPermissions = async () => {
    setIsRequestingPermission(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      localStorage.setItem('neuroscope_mic_perm', 'true');
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Permission denied:', err);
      setHasMicPermission(false);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const startSession = async () => {
    const DeviceOrientationEventWithPermission = DeviceOrientationEvent as unknown as 
      { requestPermission?: () => Promise<'granted' | 'denied'> };
    
    if (DeviceOrientationEventWithPermission.requestPermission) {
      try {
        const permission = await DeviceOrientationEventWithPermission.requestPermission();
        if (permission !== 'granted') {
          alert('Permissão de sensores necessária para a experiência VR.');
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    setHasStarted(true);
  };

  // ===== CONTROLS =====
  const toggleMic = async () => {
    if (!isMicActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setIsMicActive(true);
      } catch (err) {
        console.error('Mic error:', err);
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      setIsMicActive(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      sceneRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleExit = useCallback(() => {
    setHasStarted(false);
    setIsConnected(false);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setCurrentView('landing');
  }, [setCurrentView]);

  const switchEnvironment = useCallback((direction: 'next' | 'prev') => {
    const envs: ClinicalEnvironment[] = ['anxiety', 'depression', 'burnout'];
    const currentIndex = envs.indexOf(currentEnvironment);
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % envs.length 
      : (currentIndex - 1 + envs.length) % envs.length;
    setCurrentEnvironment(envs[newIndex]);
  }, [currentEnvironment]);

  // ===== ENVIRONMENT HELPERS =====
  const getEnvironmentInfo = () => {
    switch (currentEnvironment) {
      case 'anxiety':
        return {
          name: 'Controle de Ansiedade',
          description: 'Foco em respiração e calma natural',
          icon: Wind,
          color: 'from-emerald-500 to-teal-600',
          textColor: 'text-emerald-600',
          skyColor: intensity === 1 ? '#87CEEB' : intensity === 2 ? '#5DADE2' : '#2E86AB',
          groundColor: intensity === 1 ? '#90EE90' : '#7CB342'
        };
      case 'depression':
        return {
          name: 'Ativação (Depressão)',
          description: 'Cores vibrantes e estímulos positivos',
          icon: Sparkles,
          color: 'from-yellow-400 to-orange-500',
          textColor: 'text-yellow-600',
          skyColor: intensity === 1 ? '#FFF9C4' : intensity === 2 ? '#FFF176' : '#FFEE58',
          groundColor: '#1a1a1a'
        };
      case 'burnout':
        return {
          name: 'Descompressão (Burnout)',
          description: 'Isolamento sereno e regeneração',
          icon: Sun,
          color: 'from-blue-400 to-indigo-500',
          textColor: 'text-blue-600',
          skyColor: intensity === 1 ? '#F0F9FF' : intensity === 2 ? '#BAE6FD' : '#7DD3FC',
          groundColor: '#F3E5AB'
        };
    }
  };

  const envInfo = getEnvironmentInfo();
  const EnvIcon = envInfo.icon;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ===== LOAD A-FRAME =====
  useEffect(() => {
    const win = window as unknown as { AFRAME?: unknown };
    if (!win.AFRAME) {
      const script = document.createElement('script');
      script.src = 'https://aframe.io/releases/1.4.2/aframe.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // ===== WELCOME SCREEN =====
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-8 text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                <Headset className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">NeuroScope VR</h1>
              <p className="text-purple-100 text-sm opacity-90">Plataforma Imersiva de Saúde Mental</p>
              <Badge className="mt-3 bg-white/20 text-white border-white/30">Modo Demo - Paciente</Badge>
            </div>

            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Detalhes da Sessão</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Terapeuta</p>
                        <p className="text-sm font-semibold text-slate-900">{therapistName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Ambiente Selecionado</p>
                        <p className="text-sm font-semibold text-slate-900">{envInfo.name}</p>
                        <p className="text-xs text-slate-400">{envInfo.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Intensidade</p>
                        <p className="text-sm font-semibold text-slate-900">Nível {intensity}/3</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Mic className="w-4 h-4" /> Permissões Necessárias
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mic className={`w-5 h-5 ${hasMicPermission ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <span className="text-sm text-slate-600">Microfone</span>
                    </div>
                    {hasMicPermission ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Permitido</Badge>
                    ) : (
                      <Button size="sm" onClick={requestPermissions} disabled={isRequestingPermission} className="bg-purple-600 hover:bg-purple-700">
                        {isRequestingPermission ? 'Solicitando...' : 'Permitir'}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Para uma experiência fluida, recomendamos o uso de fones de ouvido. 
                    Mova seu dispositivo para controlar a retícula no ambiente VR.
                  </p>
                </div>

                <Button
                  onClick={startSession}
                  disabled={hasMicPermission !== true}
                  className={`w-full h-14 bg-gradient-to-r ${envInfo.color} text-white rounded-xl text-lg font-bold shadow-lg transition-all active:scale-95 ${hasMicPermission !== true ? 'opacity-50 grayscale' : ''}`}
                >
                  <Headset className="w-6 h-6 mr-3" />
                  Iniciar Experiência VR
                </Button>

                {hasMicPermission !== true && (
                  <p className="text-center text-rose-500 text-sm animate-pulse">
                    Por favor, conceda permissão de microfone para continuar.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== VR ENVIRONMENT =====
  return (
    <div ref={sceneRef} className="relative w-full h-screen bg-slate-900 overflow-hidden">
      {/* A-Frame Scene */}
      <div ref={containerRef} className="absolute inset-0">
        <a-scene
          embedded
          vr-mode-ui="enabled: true"
          renderer="antialias: false; colorManagement: true; precision: medium;"
        >
          <a-assets>
            <img id="depression-bg" src="/assets/environments/depression_bg.jpg" alt="" />
          </a-assets>

          {/* Environment Rendering */}
          {currentEnvironment === 'anxiety' && (
            <>
              <a-sky color={envInfo.skyColor}></a-sky>
              <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" color={envInfo.groundColor}></a-plane>
              {Array.from({ length: intensity * 15 }).map((_, i) => (
                <React.Fragment key={i}>
                  <a-cone 
                    position={`${(Math.random() - 0.5) * 40} 2 ${(Math.random() - 0.5) * 40 - 10}`} 
                    radius-bottom="1.5" radius-top="0" height="4" 
                    color={`hsl(${120 + Math.random() * 20}, 60%, 40%)`}
                  ></a-cone>
                  <a-cylinder 
                    position={`${(Math.random() - 0.5) * 40} 1 ${(Math.random() - 0.5) * 40 - 10}`} 
                    radius="0.3" height="2" color="#8D6E63"
                  ></a-cylinder>
                </React.Fragment>
              ))}
              <a-light type="ambient" color="#BBB" intensity={0.4 + intensity * 0.2}></a-light>
              <a-light type="directional" color="#FFF" intensity={0.8} position="-3 8 5"></a-light>
            </>
          )}

          {currentEnvironment === 'depression' && (
            <>
              <a-sky color={envInfo.skyColor}></a-sky>
              <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" color={envInfo.groundColor}></a-plane>
              {Array.from({ length: intensity * 20 }).map((_, i) => (
                <a-sphere
                  key={i}
                  position={`${(Math.random() - 0.5) * 15} ${1 + Math.random() * 4} ${(Math.random() - 0.5) * 15}`}
                  radius="0.05" color="#FFF9C4"
                  animation={`property: position; dir: alternate; dur: ${2000 + Math.random() * 2000}; easing: easeInOutSine; loop: true; to: ${(Math.random() - 0.5) * 15} ${1.5 + Math.random() * 4} ${(Math.random() - 0.5) * 15}`}
                  material="emissive: #FFF9C4; emissiveIntensity: 2"
                ></a-sphere>
              ))}
              <a-text value="Foco na Luz" align="center" position="0 1.5 -5" scale="0.8 0.8 0.8" color="#FFF" font="exo2bold"></a-text>
              <a-light type="ambient" color="#BBB" intensity={0.4 + intensity * 0.2}></a-light>
              <a-light type="point" color="#FFF9C4" intensity={0.8} position="0 5 -5"></a-light>
            </>
          )}

          {currentEnvironment === 'burnout' && (
            <>
              <a-sky color={envInfo.skyColor}></a-sky>
              <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" color={envInfo.groundColor}></a-plane>
              <a-plane position="0 0.1 -20" rotation="-90 0 0" width="100" height="40" color="#0077be" material="opacity: 0.6; transparent: true"></a-plane>
              <a-sphere position="0 15 -50" radius="8" color="#FFD700" material="shader: flat; lighting: false"></a-sphere>
              <a-light type="ambient" color="#BBB" intensity={0.4 + intensity * 0.2}></a-light>
              <a-light type="directional" color="#FFF" intensity={0.8} position="5 10 -5"></a-light>
            </>
          )}

          {/* Camera Rig */}
          <a-entity id="rig">
            <a-camera
              look-controls="enabled: true; magicWindowTrackingEnabled: true"
              wasd-controls="enabled: false"
            >
              <a-entity
                cursor="fuse: true; fuseTimeout: 1500"
                raycaster="objects: .clickable"
                position="0 0 -1"
                geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
                material="color: #10B981; shader: flat"
              />
            </a-camera>
            <a-entity laser-controls="hand: right" raycaster="objects: .clickable"></a-entity>
            <a-entity laser-controls="hand: left" raycaster="objects: .clickable"></a-entity>
          </a-entity>

          {/* Comfort Icon in 3D */}
          <a-entity position="0 2 -3">
            <a-sphere
              radius="0.3"
              color={comfortStatus === 'comfortable' ? '#10B981' : '#F43F5E'}
              class="clickable"
              animation="property: scale; to: 1.1 1.1 1.1; dur: 1000; loop: true; dir: alternate"
            />
            <a-text
              value="Olhe para confirmar conforto"
              align="center"
              position="0 -0.6 0"
              scale="0.5 0.5 0.5"
              color="white"
            />
          </a-entity>
        </a-scene>
      </div>

      {/* Breathing Guide (Anxiety only) */}
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
                  <p className="text-sm font-medium text-slate-900">{isConnected ? 'Conectado' : 'Desconectado'}</p>
                  <p className="text-xs text-slate-500">{therapistName}</p>
                  {sessionTime > 0 && (
                    <p className="text-xs font-mono text-slate-400">{formatTime(sessionTime)}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Environment Switcher */}
          <div className="pointer-events-auto flex items-center gap-2">
            <Button variant="secondary" size="icon" onClick={() => switchEnvironment('prev')} className="bg-white/90 backdrop-blur-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-2 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${envInfo.color} flex items-center justify-center`}>
                  <EnvIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{envInfo.name}</p>
                  <p className="text-xs text-slate-500">Intensidade: {intensity}/3</p>
                </div>
              </CardContent>
            </Card>

            <Button variant="secondary" size="icon" onClick={() => switchEnvironment('next')} className="bg-white/90 backdrop-blur-sm">
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
              {isMicActive ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
            </Button>
            <Button variant="secondary" size="icon" onClick={toggleFullscreen} className="bg-white/90 backdrop-blur-sm">
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
            <Button variant="secondary" size="icon" onClick={() => setNatureVolume(v => v === 0 ? 60 : 0)} className="bg-white/90 backdrop-blur-sm">
              {natureVolume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Button variant="destructive" size="icon" onClick={handleExit} className="bg-rose-500">
              <span className="text-xs font-bold">Sair</span>
            </Button>
          </div>
        </div>

        {/* Audio Ducking Indicator */}
        {isAudioDucked && (
          <div className="absolute top-20 right-4 pointer-events-auto">
            <Card className="bg-amber-100 border-amber-300">
              <CardContent className="p-2 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-medium text-amber-700">Áudio reduzido (terapeuta falando)</span>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Therapist Message */}
        {therapistMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto z-30">
            <Card className="bg-blue-500 text-white border-none shadow-2xl animate-in fade-in slide-in-from-top duration-300">
              <CardContent className="p-4 flex items-center gap-3">
                <MessageSquare className="w-6 h-6" />
                <div>
                  <p className="text-xs opacity-80">Mensagem do terapeuta:</p>
                  <p className="text-lg font-bold">{therapistMessage}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Therapist Speaking Indicator */}
        {therapistSpeaking && (
          <div className="absolute top-20 left-4 pointer-events-auto z-20">
            <Card className="bg-rose-500 text-white border-none animate-pulse">
              <CardContent className="p-3 flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span className="text-sm font-medium">Terapeuta falando...</span>
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
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${isGazing ? 'border-emerald-400' : 'border-white/50'}`}>
            <div className={`w-2 h-2 rounded-full ${isGazing ? 'bg-emerald-400' : 'bg-white/70'}`} />
          </div>
          {isGazing && (
            <svg className="absolute inset-0 w-12 h-12 -rotate-90">
              <circle
                cx="24" cy="24" r="22" fill="none" stroke="#10B981" strokeWidth="3"
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
        {isMicActive && (
          <div className="absolute top-32 left-4 pointer-events-auto z-20">
            <Card className="bg-purple-500 text-white border-none">
              <CardContent className="p-3 flex items-center gap-2">
                <Mic className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Seu microfone está ativo</span>
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

            {/* Instructions */}
            <Card className="bg-white/90 backdrop-blur-sm pointer-events-auto max-w-xs">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-teal-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Como usar</p>
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

        {/* Comfort Icon (Touch Target) */}
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
            {isGazing && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="40" cy="40" r="38" fill="none" stroke="#10B981" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - gazeProgress / 100)}`}
                  className="transition-all duration-100"
                />
              </svg>
            )}
          </button>
          <p className="text-white text-center mt-2 text-sm font-medium drop-shadow-lg">Toque e segure</p>
        </div>
      </div>
    </div>
  );
};

export default PatientDemo;
