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

type ClinicalEnvironment = 'breathing-temple' | 'sunrise-meadow' | 'sensory-void';

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
  initialEnvironment = 'breathing-temple',
  initialIntensity = 2,
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
  const [showComfortFeedback, setShowComfortFeedback] = useState(false);
  
  // Retícula (cursor) position
  const [reticleX, setReticleX] = useState(50);
  const [reticleY, setReticleY] = useState(50);
  
  // Connection state
  const [isConnected] = useState(true);
  const [therapistName] = useState('Dra. Maria Silva');

  // Refs
  const sceneRef = useRef<HTMLDivElement>(null);
  const gazeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gazeStartTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Environment switching
  const switchEnvironment = useCallback((env: ClinicalEnvironment) => {
    setCurrentEnvironment(env);
    onEnvironmentChange?.(env);
  }, [onEnvironmentChange]);

  const nextEnvironment = useCallback(() => {
    const envs: ClinicalEnvironment[] = ['breathing-temple', 'sunrise-meadow', 'sensory-void'];
    const currentIndex = envs.indexOf(currentEnvironment);
    const nextIndex = (currentIndex + 1) % envs.length;
    switchEnvironment(envs[nextIndex]);
  }, [currentEnvironment, switchEnvironment]);

  const prevEnvironment = useCallback(() => {
    const envs: ClinicalEnvironment[] = ['breathing-temple', 'sunrise-meadow', 'sensory-void'];
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

  // Get environment A-Frame HTML
  const getEnvironmentHTML = () => {
    const baseScene = `
      <a-sky color="${getSkyColor()}"></a-sky>
      <a-light type="ambient" color="#BBB" intensity="${0.4 + intensity * 0.2}"></a-light>
      <a-light type="directional" color="#FFF" intensity="${0.6 + intensity * 0.2}" position="${-3 + intensity} 8 5"></a-light>
      
      <!-- Camera -->
      <a-entity position="0 1.6 0">
        <a-camera look-controls="enabled: true" wasd-controls="enabled: false">
          <a-cursor color="#10B981" fuse="true" fuse-timeout="2000"></a-cursor>
        </a-camera>
      </a-entity>
    `;

    switch (currentEnvironment) {
      case 'breathing-temple':
        return getBreathingTempleHTML() + baseScene;
      case 'sunrise-meadow':
        return getSunriseMeadowHTML() + baseScene;
      case 'sensory-void':
        return getSensoryVoidHTML() + baseScene;
      default:
        return baseScene;
    }
  };

  const getSkyColor = () => {
    switch (currentEnvironment) {
      case 'breathing-temple':
        return intensity === 1 ? '#0F4C5C' : intensity === 2 ? '#0A3A47' : '#052830';
      case 'sunrise-meadow':
        return intensity === 1 ? '#FFE4B5' : intensity === 2 ? '#FFD700' : '#FFA500';
      case 'sensory-void':
        return '#0A0A0F';
      default:
        return '#87CEEB';
    }
  };

  // Environment 1: Guided Breathing Temple (Anxiety)
  const getBreathingTempleHTML = () => {
    return `
      <!-- Ground - Reflective water surface -->
      <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" 
        color="#1A3A4A" 
        material="metalness: 0.8; roughness: 0.2; opacity: 0.9; transparent: true">
      </a-plane>
      
      <!-- Temple Pillars -->
      ${Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 8;
        const z = Math.sin(angle) * 8 - 10;
        return `
          <a-cylinder position="${x} 4 ${z}" radius="0.6" height="8" 
            color="#2D5A6B" material="metalness: 0.3; roughness: 0.7"></a-cylinder>
          <a-cylinder position="${x} 8.5 ${z}" radius="0.8" height="1" 
            color="#3D7A8B" material="metalness: 0.4; roughness: 0.6"></a-cylinder>
        `;
      }).join('')}
      
      <!-- Central Breathing Sphere (Animated via CSS) -->
      <a-sphere id="breathing-sphere" position="0 3 -10" radius="1.5" 
        color="#2DD4BF" 
        material="emissive: #0D9488; emissiveIntensity: 0.5; opacity: 0.8; transparent: true"
        animation="property: scale; dir: alternate; dur: 4000; to: 1.5 1.5 1.5; loop: true; easing: easeInOutSine">
      </a-sphere>
      
      <!-- Floating Particles -->
      ${Array.from({ length: intensity * 8 }).map(() => `
        <a-sphere position="${(Math.random() - 0.5) * 30} ${2 + Math.random() * 6} ${-5 - Math.random() * 20}" 
          radius="${0.05 + Math.random() * 0.1}" 
          color="#5EEAD4"
          material="emissive: #5EEAD4; emissiveIntensity: 0.8; opacity: 0.6; transparent: true"
          animation="property: position; to: ${(Math.random() - 0.5) * 30} ${4 + Math.random() * 4} ${-5 - Math.random() * 20}; dur: ${8000 + Math.random() * 4000}; loop: true; dir: alternate; easing: easeInOutSine">
        </a-sphere>
      `).join('')}
      
      <!-- Soft Glow Lights -->
      <a-light type="point" color="#2DD4BF" intensity="0.8" position="0 5 -10" distance="20"></a-light>
      <a-light type="point" color="#0891B2" intensity="0.4" position="-5 3 -8" distance="15"></a-light>
      <a-light type="point" color="#0891B2" intensity="0.4" position="5 3 -8" distance="15"></a-light>
    `;
  };

  // Environment 2: Sunrise Meadow (Depression)
  const getSunriseMeadowHTML = () => {
    return `
      <!-- Ground - Lush grass -->
      <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" 
        color="#7CB342" 
        material="roughness: 0.9">
      </a-plane>
      
      <!-- Hills -->
      <a-sphere position="-20 0 -30" radius="25" 
        color="#8BC34A" 
        material="roughness: 1"
        scale="1 0.3 1">
      </a-sphere>
      <a-sphere position="25 0 -35" radius="30" 
        color="#9CCC65" 
        material="roughness: 1"
        scale="1 0.25 1">
      </a-sphere>
      
      <!-- Bright Flowers -->
      ${Array.from({ length: intensity * 12 }).map(() => `
        <a-entity position="${(Math.random() - 0.5) * 50} 0.3 ${(Math.random() - 0.5) * 40 - 10}">
          <a-cylinder radius="0.02" height="0.5" color="#4A6741"></a-cylinder>
          <a-sphere position="0 0.3 0" radius="0.15" 
            color="hsl(${30 + Math.random() * 50}, 90%, 60%)"
            material="emissive: hsl(${30 + Math.random() * 50}, 70%, 30%); emissiveIntensity: 0.3">
          </a-sphere>
        </a-entity>
      `).join('')}
      
      <!-- Butterflies -->
      ${Array.from({ length: intensity * 4 }).map((_, i) => `
        <a-entity position="${(Math.random() - 0.5) * 30} ${2 + Math.random() * 3} ${-5 - Math.random() * 20}"
          animation="property: position; to: ${(Math.random() - 0.5) * 30} ${3 + Math.random() * 2} ${-5 - Math.random() * 20}; dur: ${6000 + i * 1000}; loop: true; dir: alternate; easing: easeInOutSine">
          <a-plane width="0.3" height="0.2" color="#FF9800" 
            animation="property: rotation; to: 0 30 0; dur: 200; loop: true; dir: alternate"></a-plane>
          <a-plane width="0.3" height="0.2" color="#FF9800" position="-0.3 0 0" rotation="0 180 0"
            animation="property: rotation; to: 0 150 0; dur: 200; loop: true; dir: alternate"></a-plane>
        </a-entity>
      `).join('')}
      
      <!-- Sun -->
      <a-sphere position="0 15 -50" radius="8" 
        color="#FFD700"
        material="emissive: #FFD700; emissiveIntensity: 1; shader: flat">
      </a-sphere>
      
      <!-- Sun rays -->
      <a-light type="directional" color="#FFF8DC" intensity="1.2" position="0 15 -50"></a-light>
      <a-light type="hemisphere" color="#87CEEB" groundColor="#7CB342" intensity="0.6"></a-light>
    `;
  };

  // Environment 3: Sensory Neutral Void (Burnout)
  const getSensoryVoidHTML = () => {
    return `
      <!-- Floating Platform -->
      <a-circle position="0 0 -5" radius="5" rotation="-90 0 0"
        color="#1A1A2E"
        material="metalness: 0.5; roughness: 0.5; opacity: 0.7; transparent: true">
      </a-circle>
      
      <!-- Starfield -->
      ${Array.from({ length: intensity * 20 }).map(() => `
        <a-sphere position="${(Math.random() - 0.5) * 100} ${Math.random() * 50 - 10} ${-20 - Math.random() * 80}" 
          radius="${0.02 + Math.random() * 0.08}" 
          color="#FFFFFF"
          material="emissive: #FFFFFF; emissiveIntensity: ${0.5 + Math.random() * 0.5}; shader: flat"
          animation="property: material.emissiveIntensity; to: 0.2; dur: ${2000 + Math.random() * 3000}; loop: true; dir: alternate">
        </a-sphere>
      `).join('')}
      
      <!-- Floating Lotus Flowers -->
      ${Array.from({ length: intensity * 3 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 20;
        const z = -10 - Math.random() * 20;
        const y = 1 + Math.random() * 2;
        return `
          <a-entity position="${x} ${y} ${z}"
            animation="property: position; to: ${x} ${y + 0.5} ${z}; dur: ${5000 + i * 1000}; loop: true; dir: alternate; easing: easeInOutSine"
            animation__rotate="property: rotation; to: 0 360 0; dur: ${20000 + i * 5000}; loop: true; easing: linear">
            <!-- Lotus petals -->
            ${Array.from({ length: 6 }).map((_, j) => {
              const angle = (j / 6) * Math.PI * 2;
              const px = Math.cos(angle) * 0.3;
              const pz = Math.sin(angle) * 0.3;
              return `
                <a-cone position="${px} 0 ${pz}" radius-bottom="0.15" radius-top="0" height="0.5"
                  rotation="30 ${(j / 6) * 360} 0"
                  color="#E8D5F2"
                  material="emissive: #D4A5E8; emissiveIntensity: 0.2; opacity: 0.8; transparent: true">
                </a-cone>
              `;
            }).join('')}
            <a-sphere radius="0.1" color="#F0E6FA" material="emissive: #E8D5F2; emissiveIntensity: 0.3"></a-sphere>
          </a-entity>
        `;
      }).join('')}
      
      <!-- Nebula effect (soft colored lights) -->
      <a-light type="point" color="#9D4EDD" intensity="0.3" position="-10 5 -20" distance="30"></a-light>
      <a-light type="point" color="#5A189A" intensity="0.2" position="10 8 -25" distance="30"></a-light>
      <a-light type="point" color="#C77DFF" intensity="0.25" position="0 10 -30" distance="40"></a-light>
      
      <!-- Soft ambient glow -->
      <a-light type="ambient" color="#1A0B2E" intensity="0.5"></a-light>
    `;
  };

  // Get environment display info
  const getEnvironmentInfo = () => {
    switch (currentEnvironment) {
      case 'breathing-temple':
        return {
          name: 'Templo da Respiração',
          description: 'Ansiedade - Respiração guiada',
          icon: Wind,
          color: 'from-cyan-500 to-teal-600'
        };
      case 'sunrise-meadow':
        return {
          name: 'Prado do Amanhecer',
          description: 'Depressão - Energia positiva',
          icon: Sun,
          color: 'from-amber-400 to-orange-500'
        };
      case 'sensory-void':
        return {
          name: 'Vazio Sensorial',
          description: 'Burnout - Descanso mental',
          icon: Sparkles,
          color: 'from-violet-500 to-purple-600'
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
      <div 
        ref={containerRef}
        className="absolute inset-0"
        dangerouslySetInnerHTML={{
          __html: `
            <a-scene embedded vr-mode-ui="enabled: true" renderer="antialias: true; colorManagement: true;">
              ${getEnvironmentHTML()}
              
              <!-- Comfort Check Icon in 3D -->
              <a-entity position="0 2 -3">
                <a-sphere
                  radius="0.3"
                  color="${comfortStatus === 'comfortable' ? '#10B981' : '#F43F5E'}"
                  animation="property: scale; to: 1.1 1.1 1.1; dur: 1000; loop: true; dir: alternate"
                ></a-sphere>
                <a-text
                  value="Olhe para confirmar conforto"
                  align="center"
                  position="0 -0.6 0"
                  scale="0.5 0.5 0.5"
                  color="white"
                ></a-text>
              </a-entity>
            </a-scene>
          `
        }}
      />

      {/* Breathing Guide Overlay (only for breathing-temple) */}
      <BreathingGuide isActive={currentEnvironment === 'breathing-temple'} />

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
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
            isGazing ? 'border-emerald-400' : 'border-white/50'
          }`}>
            {/* Inner dot */}
            <div className={`w-2 h-2 rounded-full ${
              isGazing ? 'bg-emerald-400' : 'bg-white/70'
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
        {isMicActive && (
          <div className="absolute top-20 left-4 pointer-events-auto z-20">
            <Card className="bg-rose-500 text-white border-none">
              <CardContent className="p-3 flex items-center gap-2">
                <Mic className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Terapeuta falando...</span>
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
                          className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                            level <= intensity 
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
