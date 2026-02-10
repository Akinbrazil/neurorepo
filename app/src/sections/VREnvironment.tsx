/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

// NeuroScope VR - VR Environment (Ambiente Imersivo)
import React, { useEffect, useRef, useState } from 'react';
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
  User,
  MapPin,
  Clock,
  ChevronRight
} from 'lucide-react';

interface VREnvironmentProps {
  environment?: 'floresta' | 'sala-aula';
  initialIntensity?: 1 | 2 | 3;
}

// Register A-Frame XR Engine for adaptive controls
if (typeof window !== 'undefined' && (window as any).AFRAME) {
  const AFRAME = (window as any).AFRAME;
  if (!AFRAME.components['neuro-xr-engine']) {
    AFRAME.registerComponent('neuro-xr-engine', {
      init: function () {
        const urlParams = new URLSearchParams(window.location.search);
        const env = urlParams.get('env');

        this.el.addEventListener('enter-vr', () => {
          console.log("Modo Oculus/VR Ativado");
        });

        console.log("NEURO-ENGINE Inicializado. Ambiente: " + (env || "padrao"));
      }
    });
  }
}

const VREnvironment: React.FC<VREnvironmentProps> = ({
  environment: initialEnvironment = 'floresta',
  initialIntensity = 1,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [environment, setEnvironment] = useState<'floresta' | 'sala-aula'>(initialEnvironment);
  const [intensity] = useState<1 | 2 | 3>(initialIntensity);

  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

  const [isMicActive] = useState(false);
  const [natureVolume, setNatureVolume] = useState(0.6);

  const [isGazing, setIsGazing] = useState(false);
  const [gazeProgress, setGazeProgress] = useState(0);
  const [comfortStatus, setComfortStatus] = useState<'comfortable' | 'neutral' | 'uncomfortable'>('neutral');
  const [showComfortFeedback, setShowComfortFeedback] = useState(false);

  const [reticleX, setReticleX] = useState(50);
  const [reticleY, setReticleY] = useState(50);

  const [isConnected] = useState(true);
  const [therapistName] = useState('Dra. Maria Silva');

  const sceneRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gazeTimerRef = useRef<any>(null);
  const gazeStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const envParam = urlParams.get('env');

    if (envParam === 'ansiedade_lago' || envParam === 'lago' || envParam === 'floresta') {
      setEnvironment('floresta');
    } else if (envParam === 'depressao_floresta' || envParam === 'sala-aula' || envParam === 'escola') {
      setEnvironment('sala-aula');
    } else if (envParam === 'burnout_cabana' || envParam === 'cabana') {
      setEnvironment('floresta');
    }
  }, []);

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

  useEffect(() => {
    if (!hasStarted) return;

    const distance = Math.sqrt(Math.pow(reticleX - 50, 2) + Math.pow(reticleY - 50, 2));

    if (distance < 15 && !isGazing) {
      setIsGazing(true);
      gazeStartTimeRef.current = Date.now();
      gazeTimerRef.current = window.setInterval(() => {
        if (gazeStartTimeRef.current) {
          const elapsed = Date.now() - gazeStartTimeRef.current;
          const progress = Math.min((elapsed / 2000) * 100, 100);
          setGazeProgress(progress);
          if (elapsed >= 2000) {
            setComfortStatus('comfortable');
            setShowComfortFeedback(true);
            window.setTimeout(() => {
              setShowComfortFeedback(false);
              setIsGazing(false);
              setGazeProgress(0);
              gazeStartTimeRef.current = null;
              if (gazeTimerRef.current) {
                clearInterval(gazeTimerRef.current);
                gazeTimerRef.current = null;
              }
            }, 2000);
          }
        }
      }, 50);
    } else if (distance >= 15 && isGazing) {
      setIsGazing(false);
      setGazeProgress(0);
      gazeStartTimeRef.current = null;
      if (gazeTimerRef.current) {
        clearInterval(gazeTimerRef.current);
        gazeTimerRef.current = null;
      }
    }
  }, [reticleX, reticleY, hasStarted, isGazing]);

  const startSession = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission !== 'granted') {
          alert("Permissao de sensores necessaria.");
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    setHasStarted(true);
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

  const enterVR = () => {
    if (sceneRef.current) {
      const el = (sceneRef.current as any);
      if (el.requestFullscreen) el.requestFullscreen();
    }
  };

  const getEnvironmentColors = () => {
    if (environment === 'floresta') {
      return {
        sky: intensity === 1 ? '#87CEEB' : intensity === 2 ? '#5DADE2' : '#2E86AB',
        ground: intensity === 1 ? '#90EE90' : intensity === 2 ? '#7CB342' : '#558B2F',
      };
    }
    return {
      sky: intensity === 1 ? '#E0F2FE' : intensity === 2 ? '#BAE6FD' : '#7DD3FC',
      ground: intensity === 1 ? '#F8FAFC' : intensity === 2 ? '#F1F5F9' : '#E2E8F0',
    };
  };

  const colors = getEnvironmentColors();

  useEffect(() => {
    if (!(window as any).AFRAME) {
      const script = document.createElement('script');
      script.src = 'https://aframe.io/releases/1.4.2/aframe.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const generateAFrameHTML = () => {
    let forestElements = "";
    if (environment === "floresta") {
      for (let i = 0; i < intensity * 5; i++) {
        const posX = ((Math.random() - 0.5) * 40).toString();
        const posY = (1 + Math.random() * 2).toString();
        const posZ = ((Math.random() - 0.5) * 40 - 10).toString();
        const h = (120 + Math.random() * 40).toString();
        const l = (30 + Math.random() * 20).toString();
        forestElements += '<a-cone position="' + posX + ' ' + posY + ' ' + posZ + '" radius-bottom="1.5" radius-top="0" height="4" color="hsl(' + h + ', 60%, ' + l + '%)"></a-cone>';
        forestElements += '<a-cylinder position="' + posX + ' 1 ' + posZ + '" radius="0.3" height="2" color="#8D6E63"></a-cylinder>';
      }
    } else {
      forestElements = '<a-plane position="0 0.01 -10" rotation="-90 0 0" width="30" height="30" color="#E2E8F0"></a-plane>' +
        '<a-plane position="0 5 -25" width="30" height="10" color="#F1F5F9"></a-plane>' +
        '<a-plane position="-15 5 -10" rotation="0 90 0" width="30" height="10" color="#F8FAFC"></a-plane>' +
        '<a-plane position="15 5 -10" rotation="0 -90 0" width="30" height="10" color="#F8FAFC"></a-plane>' +
        '<a-plane position="0 4 -24.8" width="12" height="6" color="#1E293B"></a-plane>';
      for (let i = 0; i < intensity * 3; i++) {
        const posX = ((Math.random() - 0.5) * 20).toString();
        const posZ = (-10 - Math.random() * 10).toString();
        forestElements += '<a-box position="' + posX + ' 1 ' + posZ + '" width="2" height="1" depth="1" color="#CBD5E1"></a-box>';
      }
    }

    const comfortColor = comfortStatus === 'comfortable' ? '#10B981' : '#F43F5E';
    const lightInt = (0.5 + intensity * 0.2).toString();

    return '<a-scene embedded vr-mode-ui="enabled: true" renderer="antialias: true; colorManagement: true;" neuro-xr-engine>' +
      '<a-sky color="' + colors.sky + '"></a-sky>' +
      '<a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" color="' + colors.ground + '"></a-plane>' +
      forestElements +
      '<a-light type="ambient" color="#BBB" intensity="' + lightInt + '"></a-light>' +
      '<a-light type="directional" color="#FFF" intensity="0.8" position="-5 10 5"></a-light>' +
      '<a-entity position="0 2 -3">' +
      '<a-sphere class="clickable" radius="0.3" color="' + comfortColor + '" animation="property: scale; to: 1.1 1.1 1.1; dur: 1000; loop: true; dir: alternate"></a-sphere>' +
      '<a-text value="Olhe para confirmar conforto" align="center" position="0 -0.6 0" scale="0.5 0.5 0.5" color="white"></a-text>' +
      '</a-entity>' +
      '<a-entity position="0 1.6 0">' +
      '<a-camera look-controls="enabled: true" wasd-controls="enabled: false">' +
      '<a-cursor color="#10B981" fuse="true" fuse-timeout="2000"></a-cursor>' +
      '</a-camera>' +
      '</a-entity>' +
      '</a-scene>';
  };

  if (!hasStarted) {
    return (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-8 text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                <Headset className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">NeuroScope VR</h1>
              <p className="text-purple-100 text-sm opacity-90">Plataforma Imersiva de Saude Mental</p>
            </div>

            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Detalhes da Sessao</h2>
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
                        <p className="text-sm font-semibold text-slate-900">
                          {environment === 'floresta' ? 'Floresta Calma' : 'Sala de Aula Virtual'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Horario de Inicio</p>
                        <p className="text-sm font-semibold text-slate-900">Hoje as {currentTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Para uma experiencia fluida, solicitaremos acesso aos sensores de movimento do seu dispositivo. Recomendamos o uso de fones de ouvido.
                  </p>
                </div>

                <Button
                  onClick={() => { void startSession(); }}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-indigo-200 group"
                >
                  Iniciar Sessao Imersiva
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <p className="text-center text-[10px] text-slate-400">
                  (c) 2026 NeuroScope VR. Todos os direitos reservados.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div ref={sceneRef} className="relative w-full h-screen bg-slate-900 overflow-hidden">
      <div
        ref={containerRef}
        className="absolute inset-0"
        dangerouslySetInnerHTML={{ __html: generateAFrameHTML() }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
          <div className="pointer-events-auto">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{isConnected ? 'Conectado' : 'Desconectado'}</p>
                  <p className="text-xs text-slate-500">Terapeuta: {therapistName}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="pointer-events-auto flex gap-2">
            <Button variant="secondary" size="icon" onClick={toggleFullscreen} className="bg-white/90 backdrop-blur-sm">
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
            <Button variant="secondary" size="icon" onClick={() => setNatureVolume(v => v === 0 ? 0.6 : 0)} className="bg-white/90 backdrop-blur-sm">
              {natureVolume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <div className="absolute pointer-events-none transition-all duration-100" style={{ left: reticleX.toString() + "%", top: reticleY.toString() + "%", transform: 'translate(-50%, -50%)' }}>
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${isGazing ? 'border-emerald-400' : 'border-white/50'}`}>
            <div className={`w-2 h-2 rounded-full ${isGazing ? 'bg-emerald-400' : 'bg-white/70'}`} />
          </div>
          {isGazing && (
            <svg className="absolute inset-0 w-12 h-12 -rotate-90">
              <circle cx="24" cy="24" r="22" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray={(2 * Math.PI * 22).toString()} strokeDashoffset={(2 * Math.PI * 22 * (1 - gazeProgress / 100)).toString()} className="transition-all duration-100" />
            </svg>
          )}
        </div>

        {showComfortFeedback && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-auto">
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

        {isMicActive && (
          <div className="absolute top-20 left-4 pointer-events-auto">
            <Card className="bg-rose-500 text-white border-none">
              <CardContent className="p-3 flex items-center gap-2">
                <Mic className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Terapeuta falando...</span>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex justify-between items-end">
            <Card className="bg-white/90 backdrop-blur-sm pointer-events-auto">
              <CardContent className="p-3">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Ambiente</p>
                    <p className="font-medium text-slate-900">{environment === 'floresta' ? 'Floresta Calma' : 'Sala de Aula Virtual'}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <p className="text-xs text-slate-500">Intensidade</p>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3].map(level => (
                        <div key={level} className={`w-2 h-2 rounded-full ${level <= intensity ? 'bg-purple-500' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="pointer-events-auto">
              <Button onClick={enterVR} className="bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-lg">
                <Headset className="w-5 h-5 mr-2" />
                Entrar no VR
              </Button>
            </div>
            <Card className="bg-white/90 backdrop-blur-sm pointer-events-auto max-w-xs">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-teal-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Como usar a Reticula</p>
                    <p className="text-xs text-slate-500">Mova o celular para controlar o cursor. Olhe para o icone de coracao por 2 segundos para confirmar conforto.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Supervisao humana permanente</span>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <button
            onMouseOver={() => { }}
            onFocus={() => { }}
            className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all"
            style={{ backgroundColor: comfortStatus === 'comfortable' ? '#10B981' : '#F43F5E', transform: isGazing ? 'scale(1.1)' : 'scale(1)' }}
          >
            <Heart className="w-10 h-10 text-white" />
            {isGazing && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="38" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray={(2 * Math.PI * 38).toString()} strokeDashoffset={(2 * Math.PI * 38 * (1 - gazeProgress / 100)).toString()} className="transition-all duration-100" />
              </svg>
            )}
          </button>
          <p className="text-white text-center mt-2 text-sm font-medium drop-shadow-lg">Toque e segure</p>
        </div>
      </div>
    </div>
  );
};

export default VREnvironment;
