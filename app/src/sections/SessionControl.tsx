// NeuroScope VR - Session Control (Controle de Sessão)
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  ArrowLeft,
  Heart,
  Activity,
  Eye,
  Settings,
  Trees,
  Sparkles,
  Timer,
  AlertTriangle,
  CheckCircle,
  Radio,
  Monitor
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { PatientWithDASS21 } from '@/types';

interface SessionControlProps {
  patient?: PatientWithDASS21;
}

const SessionControl: React.FC<SessionControlProps> = ({ patient: propPatient }) => {
  const { setCurrentView } = useAuth();
  const [patient] = useState<PatientWithDASS21>(() => propPatient || {
    id: '1',
    therapist_id: 'therapist-1',
    full_name: 'Ana Carolina Mendes',
    email: 'ana.mendes@email.com',
    is_active: true,
    created_at: '',
    updated_at: '',
  });

  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [intensity, setIntensity] = useState<1 | 2 | 3>(1);
  const [environment, setEnvironment] = useState<'anxiety' | 'depression' | 'burnout'>('anxiety');

  // Voice/Audio state
  const [isMicOn, setIsMicOn] = useState(false);
  const [micVolume, setMicVolume] = useState(80);
  const [natureVolume, setNatureVolume] = useState(60);

  // Comfort check state - Telemetry Monitor
  const [comfortStatus, setComfortStatus] = useState<'comfortable' | 'neutral' | 'uncomfortable'>('neutral');
  const [comfortChecks, setComfortChecks] = useState(0);
  const [lastComfortCheck, setLastComfortCheck] = useState<Date | null>(null);
  const [comfortHistory, setComfortHistory] = useState<Array<{ time: string; status: string }>>([]);

  // Telemetry data
  const [gazeX, setGazeX] = useState(0);
  const [gazeY, setGazeY] = useState(0);
  const [headMovement, setHeadMovement] = useState(0);

  // Connection state
  const [patientConnected, setPatientConnected] = useState(false);

  // WebRTC refs
  const localStreamRef = useRef<MediaStream | null>(null);

  // Timer ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Session timer
  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSessionActive]);

  // Real-time telemetry listener
  useEffect(() => {
    if (!isSessionActive || !patient.id) return;

    const normalizedSessionId = (patient.id && patient.id !== '1') ? `session-${patient.id}` : 'demo';
    const channel = supabase.channel(`session:${normalizedSessionId}`);

    channel
      .on('broadcast', { event: 'telemetry' }, ({ payload }) => {
        setGazeX(payload.gazeX);
        setGazeY(payload.gazeY);
        setComfortStatus(payload.comfortStatus);

        if (payload.comfortStatus !== 'neutral') {
          setComfortChecks(c => c + 1);
          setLastComfortCheck(new Date());
          setComfortHistory(h => [...h.slice(-10), {
            time: new Date().toLocaleTimeString('pt-BR'),
            status: payload.comfortStatus
          }]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSessionActive, patient.id]);

  // Simulate head movement based on gaze activity for UI feedback
  useEffect(() => {
    if (isSessionActive && patientConnected) {
      const telemetryInterval = setInterval(() => {
        setHeadMovement(() => Math.abs(Math.sin(Date.now() / 1000) * 100));
      }, 500);
      return () => clearInterval(telemetryInterval);
    }
  }, [isSessionActive, patientConnected]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start session
  const handleStartSession = () => {
    setIsSessionActive(true);
    setPatientConnected(true);
    // In real implementation, this would initialize Supabase realtime session
  };

  // End session
  const handleEndSession = () => {
    setIsSessionActive(false);
    setIsMicOn(false);
    setPatientConnected(false);
    // Stop microphone
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  };

  // Toggle microphone
  const toggleMic = async () => {
    if (!isMicOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setIsMicOn(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Não foi possível acessar o microfone. Verifique as permissões.');
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      setIsMicOn(false);
    }

    // Broadcast mic status
    if (patient.id) {
      const normalizedSessionId = (patient.id && patient.id !== '1') ? `session-${patient.id}` : 'demo';
      supabase.channel(`session:${normalizedSessionId}`).send({
        type: 'broadcast',
        event: 'mic-status',
        payload: { isMicOn: !isMicOn }
      });
    }
  };

  // Simulate comfort check from patient
  const simulateComfortCheck = (status: 'comfortable' | 'neutral' | 'uncomfortable') => {
    setComfortStatus(status);
    setComfortChecks(count => count + 1);
    const now = new Date();
    setLastComfortCheck(now);
    setComfortHistory(history => [...history, {
      time: now.toLocaleTimeString('pt-BR'),
      status
    }]);
  };

  // Get comfort status display
  const getComfortDisplay = () => {
    switch (comfortStatus) {
      case 'comfortable':
        return {
          icon: <Heart className="w-6 h-6 text-emerald-500" />,
          text: 'Paciente Confortável',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
        };
      case 'uncomfortable':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-rose-500" />,
          text: 'Desconforto Detectado',
          color: 'bg-rose-100 text-rose-700 border-rose-300',
        };
      default:
        return {
          icon: <Activity className="w-6 h-6 text-slate-400" />,
          text: 'Aguardando Sinal',
          color: 'bg-slate-100 text-slate-600 border-slate-300',
        };
    }
  };

  const comfortDisplay = getComfortDisplay();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <h1 className="text-lg font-bold text-slate-900">Controle de Sessão</h1>
                <p className="text-xs text-slate-500">Sessão #{patient.id?.slice(-4)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${patientConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className="text-sm text-slate-600">
                  {patientConnected ? 'Paciente Conectado' : 'Aguardando...'}
                </span>
              </div>
              {/* Session Timer */}
              {isSessionActive && (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
                  <Timer className="w-4 h-4 text-slate-500" />
                  <span className="font-mono font-bold text-slate-900">
                    {formatTime(sessionTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Safety Warning */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Supervisão humana permanente obrigatória</span>
            </div>
            <div className="h-4 w-px bg-amber-300" />
            <div className="flex items-center gap-2 text-amber-800">
              <CheckCircle className="w-4 h-4" />
              <span>Sem diagnósticos automáticos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column - Patient Info & Controls */}
          <div className="space-y-6">
            {/* Patient Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-500" />
                  Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-teal-700">
                    {patient.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{patient.full_name}</p>
                    {patient.total_score && (
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          DASS-21: {patient.total_score}/126
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comfort Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Status de Conforto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-xl border-2 ${comfortDisplay.color} flex items-center gap-4`}>
                  {comfortDisplay.icon}
                  <div>
                    <p className="font-semibold">{comfortDisplay.text}</p>
                    {lastComfortCheck && (
                      <p className="text-xs opacity-75">
                        Último check: {lastComfortCheck.toLocaleTimeString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{comfortChecks}</p>
                    <p className="text-xs text-slate-500">Verificações</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{formatTime(sessionTime)}</p>
                    <p className="text-xs text-slate-500">Duração</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Play className="w-5 h-5 text-emerald-500" />
                  Controle da Sessão
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isSessionActive ? (
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    size="lg"
                    onClick={handleStartSession}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Iniciar Sessão
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700"
                    size="lg"
                    onClick={handleEndSession}
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Encerrar Sessão
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Environment Controls */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-500" />
                  Controle do Ambiente VR
                </CardTitle>
                <CardDescription>
                  Ajuste o ambiente e intensidade em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Environment Selection */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">
                    Ambiente
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setEnvironment('anxiety')}
                      className={`p-4 rounded-xl border-2 transition-all ${environment === 'anxiety'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <Trees className={`w-8 h-8 mx-auto mb-2 ${environment === 'anxiety' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <p className={`text-xs font-medium ${environment === 'anxiety' ? 'text-emerald-700' : 'text-slate-600'}`}>
                        Ansiedade
                      </p>
                    </button>
                    <button
                      onClick={() => setEnvironment('burnout')}
                      className={`p-4 rounded-xl border-2 transition-all ${environment === 'burnout'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <Volume2 className={`w-8 h-8 mx-auto mb-2 ${environment === 'burnout' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <p className={`text-xs font-medium ${environment === 'burnout' ? 'text-blue-700' : 'text-slate-600'}`}>
                        Burnout
                      </p>
                    </button>
                    <button
                      onClick={() => setEnvironment('depression')}
                      className={`p-4 rounded-xl border-2 transition-all ${environment === 'depression'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <Sparkles className={`w-8 h-8 mx-auto mb-2 ${environment === 'depression' ? 'text-yellow-600' : 'text-slate-400'}`} />
                      <p className={`text-xs font-medium ${environment === 'depression' ? 'text-yellow-700' : 'text-slate-600'}`}>
                        Depressão
                      </p>
                    </button>
                  </div>
                </div>

                {/* Intensity Slider */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-slate-700">
                      Nível de Intensidade
                    </label>
                    <Badge
                      variant={intensity === 1 ? 'default' : intensity === 2 ? 'secondary' : 'destructive'}
                      className={intensity === 1 ? 'bg-emerald-100 text-emerald-700' : intensity === 2 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}
                    >
                      Nível {intensity}
                    </Badge>
                  </div>
                  <Slider
                    value={[intensity]}
                    onValueChange={(value) => setIntensity(value[0] as 1 | 2 | 3)}
                    min={1}
                    max={3}
                    step={1}
                    disabled={!isSessionActive}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>Calmo</span>
                    <span>Moderado</span>
                    <span>Intenso</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    {intensity === 1 && 'Ambiente tranquilo com poucos estímulos visuais e sonoros. Ideal para relaxamento profundo.'}
                    {intensity === 2 && 'Ambiente moderado com mais elementos visuais e sons da natureza. Equilíbrio entre estímulo e calma.'}
                    {intensity === 3 && 'Ambiente mais intenso com máxima imersão e estímulos. Para treinamento de resiliência.'}
                  </p>
                </div>

                {/* Nature Sounds Volume */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">
                    Volume dos Sons do Ambiente
                  </label>
                  <div className="flex items-center gap-4">
                    <VolumeX className="w-5 h-5 text-slate-400" />
                    <Slider
                      value={[natureVolume]}
                      onValueChange={(value) => setNatureVolume(value[0])}
                      min={0}
                      max={100}
                      step={5}
                      disabled={!isSessionActive}
                      className="flex-1"
                    />
                    <Volume2 className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    {natureVolume}%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* VR Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  Preview do Ambiente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`aspect-video rounded-xl flex items-center justify-center ${environment === 'anxiety'
                  ? 'bg-gradient-to-br from-emerald-800 to-teal-900'
                  : environment === 'burnout'
                    ? 'bg-gradient-to-br from-blue-400 to-indigo-600'
                    : 'bg-gradient-to-br from-yellow-400 to-orange-600'
                  }`}>
                  <div className="text-center text-white">
                    {environment === 'anxiety' ? (
                      <>
                        <Trees className="w-16 h-16 mx-auto mb-2 opacity-80" />
                        <p className="font-medium">Ansiedade (Floresta)</p>
                      </>
                    ) : environment === 'burnout' ? (
                      <>
                        <Volume2 className="w-16 h-16 mx-auto mb-2 opacity-80" />
                        <p className="font-medium">Burnout (Praia)</p>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-16 h-16 mx-auto mb-2 opacity-80" />
                        <p className="font-medium">Depressão (Jardim)</p>
                      </>
                    )}
                    <p className="text-sm opacity-60 mt-1">Intensidade: {intensity}/3</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${intensity >= 1 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <div className={`w-3 h-3 rounded-full ${intensity >= 2 ? 'bg-yellow-400' : 'bg-slate-600'}`} />
                  <div className={`w-3 h-3 rounded-full ${intensity >= 3 ? 'bg-rose-400' : 'bg-slate-600'}`} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Voice Controls & Telemetry */}
          <div className="space-y-6">
            {/* Voice Control */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Radio className="w-5 h-5 text-rose-500" />
                  Comando de Voz
                </CardTitle>
                <CardDescription>
                  Comunique-se com o paciente durante a sessão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mic Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isMicOn ? 'bg-rose-100' : 'bg-slate-200'
                      }`}>
                      {isMicOn ? (
                        <Mic className="w-6 h-6 text-rose-600" />
                      ) : (
                        <MicOff className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {isMicOn ? 'Microfone Ativo' : 'Microfone Desligado'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {isMicOn ? 'Sua voz está sendo transmitida' : 'Clique para ativar'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={isMicOn ? 'default' : 'outline'}
                    size="lg"
                    onClick={toggleMic}
                    disabled={!isSessionActive}
                    className={isMicOn ? 'bg-rose-500 hover:bg-rose-600' : ''}
                  >
                    {isMicOn ? 'Silenciar' : 'Ativar'}
                  </Button>
                </div>

                {/* Mic Volume */}
                {isMicOn && (
                  <div className="p-4 bg-rose-50 rounded-xl">
                    <label className="text-sm font-medium text-rose-700 mb-3 block">
                      Volume da Sua Voz
                    </label>
                    <div className="flex items-center gap-4">
                      <VolumeX className="w-5 h-5 text-rose-400" />
                      <Slider
                        value={[micVolume]}
                        onValueChange={(value) => setMicVolume(value[0])}
                        min={0}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <Volume2 className="w-5 h-5 text-rose-400" />
                    </div>
                    <p className="text-xs text-rose-600 mt-2 text-center">
                      {micVolume}%
                    </p>
                  </div>
                )}

                {/* Voice Status */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${isMicOn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="text-sm font-medium text-slate-700">
                      Status da Conexão de Voz
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {isMicOn
                      ? 'Conexão ativa. O paciente pode ouvir sua voz. Os sons do ambiente serão reduzidos automaticamente.'
                      : 'Microfone desligado. Ative para comunicação com o paciente.'}
                  </p>
                </div>

                {/* Quick Messages */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">
                    Mensagens Rápidas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Respire fundo', 'Você está seguro', 'Muito bem', 'Continue assim'].map((msg) => (
                      <Button
                        key={msg}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // In real implementation, this would send a text message
                          console.log('Sending message:', msg);
                        }}
                        disabled={!isSessionActive}
                      >
                        {msg}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Telemetry Monitor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-blue-500" />
                  Monitor de Telemetria
                </CardTitle>
                <CardDescription>
                  Dados em tempo real do paciente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Gaze Position */}
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Posição do Olhar (Retícula)</p>
                  <div className="flex gap-4">
                    <div>
                      <span className="text-xs text-slate-400">X:</span>
                      <span className="ml-1 font-mono text-sm">{gazeX.toFixed(1)}°</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Y:</span>
                      <span className="ml-1 font-mono text-sm">{gazeY.toFixed(1)}°</span>
                    </div>
                  </div>
                </div>

                {/* Head Movement */}
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Movimentação da Cabeça</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.min(headMovement, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono">{headMovement.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Comfort History */}
                {comfortHistory.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-2">Histórico de Conforto</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {comfortHistory.slice(-5).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">{item.time}</span>
                          <Badge
                            variant="outline"
                            className={
                              item.status === 'comfortable' ? 'border-emerald-300 text-emerald-700' :
                                item.status === 'uncomfortable' ? 'border-rose-300 text-rose-700' :
                                  'border-slate-300 text-slate-600'
                            }
                          >
                            {item.status === 'comfortable' ? 'Confortável' :
                              item.status === 'uncomfortable' ? 'Desconfortável' : 'Neutro'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Debug/Simulation Panel */}
            <Card className="border-dashed border-2">
              <CardHeader>
                <CardTitle className="text-sm text-slate-500">Simulação (Debug)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500 mb-3">
                  Simule sinais do paciente para testar o sistema:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateComfortCheck('comfortable')}
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Conforto
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateComfortCheck('neutral')}
                    className="text-slate-600 border-slate-200 hover:bg-slate-50"
                  >
                    <Activity className="w-4 h-4 mr-1" />
                    Neutro
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateComfortCheck('uncomfortable')}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Alerta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionControl;
