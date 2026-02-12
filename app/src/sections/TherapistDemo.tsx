// NeuroScope VR - Therapist Demo Mode (Modo Mestre/Admin)
// Integra funcionalidades de SessionControl + SessionCockpit para demo completa
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Users, Headset, Mic, MicOff, Volume2, VolumeX, Copy, CheckCircle,
  AlertTriangle, Activity, Wind, Sun, Sparkles, Play, Square, BarChart3,
  Settings, LogOut, Timer, Radio, Monitor, ArrowLeft,
  Heart, MessageSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { type Patient, type Therapist } from '@/lib/db-simulation';
import { useAuth } from '@/contexts/AuthContext';

type ClinicalEnvironment = 'anxiety' | 'depression' | 'burnout';
type PatientStatus = 'waiting' | 'connected' | 'in-session' | 'completed';
type ComfortLevel = 'comfortable' | 'neutral' | 'uncomfortable';

interface TelemetryData {
  timestamp: number;
  gazeX: number;
  gazeY: number;
  headRotationX: number;
  headRotationY: number;
  comfortLevel: number;
  comfortStatus: ComfortLevel;
}

interface ComfortEvent {
  id: string;
  timestamp: Date;
  type: ComfortLevel;
  environment: ClinicalEnvironment;
  notes?: string;
}

const TherapistDemo: React.FC = () => {
  const { setCurrentView } = useAuth();

  // ===== MASTER DEMO MODE SETUP =====
  // @ts-expect-error - masterTherapist is used in JSX
  const [masterTherapist] = useState<Therapist>({
    id: 'DEMO-MASTER',
    nome: 'Dr. Demo Master',
    genero: 'Masculino',
    pais: 'Brasil',
    estado: 'SP',
    plano: 'Premium'
  });

  const [demoPatients] = useState<Patient[]>([
    {
      id: 'DEMO-P1',
      terapeutaId: 'DEMO-MASTER',
      clinicId: 'DEMO-CLINIC',
      nome: 'Ana Carolina Mendes',
      idade: 28,
      tel: '(11) 99999-8888',
      email: 'ana.demo@email.com',
      cidCode: 'F41.1',
      status: 'Em tratamento',
      relatorios: ['Demo: Paciente exemplo'],
      depression_score: 12,
      anxiety_score: 18,
      stress_score: 24,
      total_score: 54,
      depression_severity: 'Leve',
      anxiety_severity: 'Moderado',
      stress_severity: 'Moderado',
      last_assessment_date: new Date().toISOString().split('T')[0]
    }
  ]);

  const [selectedPatient] = useState<Patient>(demoPatients[0]);

  // ===== SESSION STATE =====
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentEnvironment, setCurrentEnvironment] = useState<ClinicalEnvironment>('anxiety');
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2);

  // ===== AUDIO/VOICE STATE =====
  const [isMicOn, setIsMicOn] = useState(false);
  const [micVolume, setMicVolume] = useState(80);
  const [natureVolume, setNatureVolume] = useState(60);
  const localStreamRef = useRef<MediaStream | null>(null);

  // ===== PATIENT STATE =====
  // @ts-expect-error - patientStatus is used via setPatientStatus
  const [patientStatus, setPatientStatus] = useState<PatientStatus>('waiting');
  const [patientLink, setPatientLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [patientConnected, setPatientConnected] = useState(false);

  // ===== TELEMETRY STATE =====
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [comfortStatus, setComfortStatus] = useState<ComfortLevel>('neutral');
  const [comfortChecks, setComfortChecks] = useState(0);
  const [lastComfortCheck, setLastComfortCheck] = useState<Date | null>(null);
  const [comfortEvents, setComfortEvents] = useState<ComfortEvent[]>([]);
  const [gazeX, setGazeX] = useState(50);
  const [gazeY, setGazeY] = useState(50);
  const [headMovement, setHeadMovement] = useState(0);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // ===== CLINICAL NOTES =====
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const recognitionRef = useRef<any>(null);

  // ===== AUTO SIMULATION =====
  const [autoSimulate, setAutoSimulate] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ===== GENERATE PATIENT LINK =====
  useEffect(() => {
    const baseUrl = window.location.origin;
    setPatientLink(`${baseUrl}/?view=patient-demo&env=${currentEnvironment}&intensity=${intensity}&therapist=demo-master`);
  }, [currentEnvironment, intensity]);

  // ===== SESSION TIMER =====
  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionActive]);

  // ===== WEB SPEECH API FOR TRANSCRIPTION =====
  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + transcriptPiece + ' ');
          }
        }
      };
    }
  }, []);

  // ===== SUPABASE REALTIME SYNC =====
  useEffect(() => {
    if (!sessionActive) return;

    const channel = supabase.channel('session:demo-master');

    channel
      .on('broadcast', { event: 'telemetry' }, ({ payload }: { payload: { gazeX: number; gazeY: number; comfortStatus: ComfortLevel } }) => {
        const newData = {
          ...payload,
          timestamp: Date.now(),
          comfortLevel: payload.comfortStatus === 'comfortable' ? 100 : payload.comfortStatus === 'uncomfortable' ? 0 : 50,
          headRotationX: 0,
          headRotationY: 0
        };
        setTelemetry(prev => [...prev.slice(-50), newData]);
        setGazeX(payload.gazeX || 50);
        setGazeY(payload.gazeY || 50);
        setComfortStatus(payload.comfortStatus || 'neutral');
        setLastSync(new Date());

        if (payload.comfortStatus && payload.comfortStatus !== 'neutral') {
          setComfortChecks(c => c + 1);
          setLastComfortCheck(new Date());
          setComfortEvents(prev => [...prev.slice(-9), {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: payload.comfortStatus,
            environment: currentEnvironment
          }]);
        }
      })
      .on('broadcast', { event: 'patient-connected' }, () => {
        setPatientStatus('connected');
        setPatientConnected(true);
      })
      .on('broadcast', { event: 'patient-disconnected' }, () => {
        setPatientStatus('waiting');
        setPatientConnected(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionActive, currentEnvironment]);

  // ===== AUTO SIMULATION MODE =====
  useEffect(() => {
    if (autoSimulate && sessionActive) {
      simIntervalRef.current = setInterval(() => {
        const channel = supabase.channel('session:demo-master');
        channel.send({
          type: 'broadcast',
          event: 'telemetry',
          payload: {
            gazeX: 30 + Math.random() * 40,
            gazeY: 30 + Math.random() * 40,
            comfortStatus: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'comfortable' : 'uncomfortable') : 'neutral',
            headRotationX: (Math.random() - 0.5) * 30,
            headRotationY: (Math.random() - 0.5) * 30,
          }
        });

        setHeadMovement(() => Math.abs(Math.sin(Date.now() / 1000) * 100));
      }, 1000);
    } else {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    }

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [autoSimulate, sessionActive]);

  // ===== HELPERS =====
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyPatientLink = async () => {
    try {
      await navigator.clipboard.writeText(patientLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const startSession = () => {
    setSessionActive(true);
    setPatientStatus('waiting');
    setSessionTime(0);
    setTelemetry([]);
    setComfortEvents([]);

    setTimeout(() => {
      setPatientStatus('connected');
      setPatientConnected(true);
      supabase.channel('session:demo-master').send({
        type: 'broadcast',
        event: 'patient-connected',
        payload: {}
      });
    }, 3000);
  };

  const endSession = () => {
    setSessionActive(false);
    setPatientStatus('completed');
    setPatientConnected(false);
    setIsMicOn(false);
    setAutoSimulate(false);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    supabase.channel('session:demo-master').send({
      type: 'broadcast',
      event: 'session-ended',
      payload: {}
    });
  };

  const handleNotesChange = (val: string) => {
    setClinicalNotes(val);
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 1000);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const toggleMic = async () => {
    if (!isMicOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setIsMicOn(true);

        supabase.channel('session:demo-master').send({
          type: 'broadcast',
          event: 'mic-status',
          payload: { isMicOn: true }
        });
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

      supabase.channel('session:demo-master').send({
        type: 'broadcast',
        event: 'mic-status',
        payload: { isMicOn: false }
      });
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const simulateComfortCheck = (status: ComfortLevel) => {
    setComfortStatus(status);
    setComfortChecks(c => c + 1);
    const now = new Date();
    setLastComfortCheck(now);
    setComfortEvents(prev => [...prev.slice(-9), {
      id: Date.now().toString(),
      timestamp: now,
      type: status,
      environment: currentEnvironment
    }]);

    supabase.channel('session:demo-master').send({
      type: 'broadcast',
      event: 'telemetry',
      payload: { gazeX, gazeY, comfortStatus: status, timestamp: Date.now() }
    });
  };

  const switchEnvironment = (env: ClinicalEnvironment) => {
    setCurrentEnvironment(env);
    const baseUrl = window.location.origin;
    setPatientLink(`${baseUrl}/?view=patient-demo&env=${env}&intensity=${intensity}&therapist=demo-master`);

    supabase.channel('session:demo-master').send({
      type: 'broadcast',
      event: 'environment-change',
      payload: { environment: env, intensity }
    });
  };

  const getEnvironmentInfo = (env: ClinicalEnvironment) => {
    switch (env) {
      case 'anxiety':
        return { name: 'Ansiedade', icon: Wind, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-500', gradient: 'from-emerald-500 to-teal-600' };
      case 'depression':
        return { name: 'Depressão', icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-500', gradient: 'from-yellow-400 to-orange-500' };
      case 'burnout':
        return { name: 'Burnout', icon: Sun, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-500', gradient: 'from-blue-400 to-indigo-500' };
    }
  };

  const getComfortDisplay = () => {
    switch (comfortStatus) {
      case 'comfortable':
        return { icon: Heart, text: 'Paciente Confortável', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', pulse: true };
      case 'uncomfortable':
        return { icon: AlertTriangle, text: 'Desconforto Detectado', color: 'bg-rose-100 text-rose-700 border-rose-300', pulse: true };
      default:
        return { icon: Activity, text: 'Aguardando Sinal', color: 'bg-slate-100 text-slate-600 border-slate-300', pulse: false };
    }
  };

  const comfortDisplay = getComfortDisplay();
  const ComfortIcon = comfortDisplay.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== HEADER ===== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('landing')}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
              <div className="h-8 w-px bg-slate-200" />
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-teal-500 rounded-xl flex items-center justify-center">
                <Headset className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">NeuroScope VR</h1>
                <p className="text-xs text-slate-500">Modo Demo Mestre - Terapeuta</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {sessionActive && (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
                  <Timer className="w-4 h-4 text-slate-500" />
                  <span className="font-mono font-bold text-slate-900">{formatTime(sessionTime)}</span>
                </div>
              )}
              <Badge variant={sessionActive ? "default" : "secondary"} className={sessionActive ? "bg-emerald-500" : ""}>
                {sessionActive ? 'Sessão Ativa' : 'Sessão Inativa'}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('landing')}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== SAFETY WARNING ===== */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Modo Demonstração - Dados simulados</span>
            </div>
            <div className="h-4 w-px bg-amber-300" />
            <div className="flex items-center gap-2 text-amber-800">
              <CheckCircle className="w-4 h-4" />
              <span>Todos os recursos disponíveis</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ===== LEFT COLUMN - PATIENT INFO & CONTROLS ===== */}
          <div className="space-y-6">
            {/* Patient Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-500" />
                  Paciente (Demo)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-teal-700">
                    {selectedPatient.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{selectedPatient.nome}</p>
                    <p className="text-xs text-slate-500">{selectedPatient.idade} anos • CID: {selectedPatient.cidCode}</p>
                    {selectedPatient.total_score && (
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          DASS-21: {selectedPatient.total_score}/126
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Patient Link */}
                {sessionActive && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <label className="text-xs font-medium text-slate-600 mb-2 block">Link do Paciente:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={patientLink}
                        readOnly
                        className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyPatientLink}
                        className={linkCopied ? 'bg-emerald-50 border-emerald-200' : ''}
                      >
                        {linkCopied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
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
                  <ComfortIcon className={`w-6 h-6 ${comfortDisplay.pulse ? 'animate-pulse' : ''}`} />
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
                {!sessionActive ? (
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    size="lg"
                    onClick={startSession}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Iniciar Sessão Demo
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700"
                    size="lg"
                    onClick={endSession}
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Encerrar Sessão
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ===== MIDDLE COLUMN - ENVIRONMENT & MONITOR ===== */}
          <div className="space-y-6 lg:col-span-2">
            {/* Environment Control */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-500" />
                  Controle do Ambiente VR
                </CardTitle>
                <CardDescription>Ajuste o ambiente e intensidade em tempo real</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Environment Selection */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">Ambiente</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['anxiety', 'depression', 'burnout'] as ClinicalEnvironment[]).map((env) => {
                      const info = getEnvironmentInfo(env);
                      const Icon = info.icon;
                      const isActive = env === currentEnvironment;
                      return (
                        <button
                          key={env}
                          onClick={() => switchEnvironment(env)}
                          disabled={!sessionActive}
                          className={`p-4 rounded-xl border-2 transition-all ${isActive
                            ? `${info.border} ${info.bg}`
                            : 'border-slate-200 hover:border-slate-300'
                            } ${!sessionActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Icon className={`w-8 h-8 mx-auto mb-2 ${isActive ? info.color : 'text-slate-400'}`} />
                          <p className={`text-xs font-medium ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                            {info.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Intensity Slider */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-slate-700">Nível de Intensidade</label>
                    <Badge variant={intensity === 1 ? 'default' : intensity === 2 ? 'secondary' : 'destructive'}
                      className={intensity === 1 ? 'bg-emerald-100 text-emerald-700' : intensity === 2 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}>
                      Nível {intensity}
                    </Badge>
                  </div>
                  <Slider
                    value={[intensity]}
                    onValueChange={(value) => setIntensity(value[0] as 1 | 2 | 3)}
                    min={1}
                    max={3}
                    step={1}
                    disabled={!sessionActive}
                  />
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>Calmo</span>
                    <span>Moderado</span>
                    <span>Intenso</span>
                  </div>
                </div>

                {/* Nature Volume */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">Volume dos Sons do Ambiente</label>
                  <div className="flex items-center gap-4">
                    <VolumeX className="w-5 h-5 text-slate-400" />
                    <Slider
                      value={[natureVolume]}
                      onValueChange={(value) => setNatureVolume(value[0])}
                      min={0}
                      max={100}
                      step={5}
                      disabled={!sessionActive}
                      className="flex-1"
                    />
                    <Volume2 className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">{natureVolume}%</p>
                </div>
              </CardContent>
            </Card>

            {/* Monitor Clínico */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-purple-600" />
                    <CardTitle className="text-lg">Monitor Clínico</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px] animate-pulse border-purple-200 text-purple-600 uppercase">
                    Ao Vivo
                  </Badge>
                </div>
                <CardDescription>Perspectiva e reações do paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Visual Monitor */}
                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative border-4 border-slate-800 shadow-inner">
                  <div className={`absolute inset-0 opacity-40 ${currentEnvironment === 'anxiety' ? 'bg-gradient-to-br from-emerald-900 to-teal-950' :
                    currentEnvironment === 'depression' ? 'bg-gradient-to-br from-yellow-700 to-orange-900' :
                      'bg-gradient-to-br from-blue-900 to-indigo-950'
                    }`} />

                  {/* Gaze Pointer */}
                  {patientConnected && (
                    <div
                      className="absolute w-12 h-12 border-4 border-white/40 rounded-full flex items-center justify-center transition-all duration-100 ease-out shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                      style={{ left: `${gazeX}%`, top: `${gazeY}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}

                  {!patientConnected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin" />
                        <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Aguardando Conexão...</span>
                      </div>
                    </div>
                  )}

                  {/* Info Overlay */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <Badge className="bg-black/40 backdrop-blur-md border-white/10 text-[9px] uppercase">
                      {currentEnvironment}
                    </Badge>
                    <Badge className="bg-black/40 backdrop-blur-md border-white/10 text-[9px]">
                      GAZE: {gazeX.toFixed(0)}, {gazeY.toFixed(0)}
                    </Badge>
                  </div>
                </div>

                {/* Clinical Notes */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-500" /> ANOTAÇÕES CLÍNICAS
                    </label>
                    {saveStatus === 'saved' && (
                      <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> AUTO-SALVO
                      </span>
                    )}
                  </div>
                  <Textarea
                    value={clinicalNotes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Escreva aqui suas observações clínicas, diagnósticos e reações observadas durante a sessão..."
                    className="h-32 bg-slate-50/50 resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ===== RIGHT COLUMN - VOICE, TELEMETRY & DEBUG ===== */}
          <div className="space-y-6">
            {/* Voice Control */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Radio className="w-5 h-5 text-rose-500" />
                  Comando de Voz
                </CardTitle>
                <CardDescription>Comunique-se com o paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mic Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isMicOn ? 'bg-rose-100' : 'bg-slate-200'}`}>
                      {isMicOn ? <Mic className="w-6 h-6 text-rose-600" /> : <MicOff className="w-6 h-6 text-slate-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{isMicOn ? 'Microfone Ativo' : 'Microfone Desligado'}</p>
                      <p className="text-sm text-slate-500">{isMicOn ? 'Sua voz está sendo transmitida' : 'Clique para ativar'}</p>
                    </div>
                  </div>
                  <Button variant={isMicOn ? 'default' : 'outline'} size="lg" onClick={toggleMic} disabled={!sessionActive}
                    className={isMicOn ? 'bg-rose-500 hover:bg-rose-600' : ''}>
                    {isMicOn ? 'Silenciar' : 'Ativar'}
                  </Button>
                </div>

                {/* Mic Volume */}
                {isMicOn && (
                  <div className="p-4 bg-rose-50 rounded-xl">
                    <label className="text-sm font-medium text-rose-700 mb-3 block">Volume da Sua Voz</label>
                    <div className="flex items-center gap-4">
                      <VolumeX className="w-5 h-5 text-rose-400" />
                      <Slider value={[micVolume]} onValueChange={(value) => setMicVolume(value[0])} min={0} max={100} step={5} className="flex-1" />
                      <Volume2 className="w-5 h-5 text-rose-400" />
                    </div>
                    <p className="text-xs text-rose-600 mt-2 text-center">{micVolume}%</p>
                  </div>
                )}

                {/* Quick Messages */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">Mensagens Rápidas</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Respire fundo', 'Você está seguro', 'Muito bem', 'Continue assim'].map((msg) => (
                      <Button key={msg} variant="outline" size="sm" disabled={!sessionActive} onClick={() => {
                        supabase.channel('session:demo-master').send({
                          type: 'broadcast', event: 'therapist-message', payload: { message: msg }
                        });
                      }}>
                        {msg}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transcription */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    Transcrição
                  </CardTitle>
                  <Button size="sm" variant={isRecording ? 'destructive' : 'outline'} onClick={toggleRecording} disabled={!sessionActive} className="h-7 text-xs">
                    {isRecording ? 'Parar' : 'Gravar'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-24 overflow-y-auto bg-slate-100 rounded-lg p-3 text-xs text-slate-700 font-mono">
                  {transcript || 'Aguardando gravação...'}
                </div>
              </CardContent>
            </Card>

            {/* Telemetry Monitor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-500" />
                  Telemetria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Gaze Position */}
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Posição do Olhar</p>
                  <div className="flex gap-4 font-mono text-sm">
                    <div><span className="text-slate-400">X:</span> {gazeX.toFixed(1)}%</div>
                    <div><span className="text-slate-400">Y:</span> {gazeY.toFixed(1)}%</div>
                  </div>
                </div>

                {/* Head Movement */}
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Movimentação da Cabeça</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(headMovement, 100)}%` }} />
                    </div>
                    <span className="text-xs font-mono">{headMovement.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Comfort Events */}
                {comfortEvents.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg max-h-32 overflow-y-auto">
                    <p className="text-xs text-slate-500 mb-2">Histórico de Conforto</p>
                    <div className="space-y-1">
                      {comfortEvents.slice(-5).map((event) => (
                        <div key={event.id} className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">{event.timestamp.toLocaleTimeString('pt-BR')}</span>
                          <Badge variant="outline" className={
                            event.type === 'comfortable' ? 'border-emerald-300 text-emerald-700' :
                              event.type === 'uncomfortable' ? 'border-rose-300 text-rose-700' :
                                'border-slate-300 text-slate-600'
                          }>
                            {event.type === 'comfortable' ? 'Confortável' : event.type === 'uncomfortable' ? 'Desconfortável' : 'Neutro'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Sync: {lastSync.toLocaleTimeString('pt-BR')}</span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Tempo real
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Debug/Simulation Panel */}
            <Card className="border-dashed border-2 border-purple-300">
              <CardHeader>
                <CardTitle className="text-sm text-purple-600 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Painel de Simulação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Auto-simular dados</span>
                  <Button size="sm" variant={autoSimulate ? "default" : "outline"} onClick={() => setAutoSimulate(!autoSimulate)} disabled={!sessionActive}
                    className={autoSimulate ? "bg-purple-500" : ""}>
                    {autoSimulate ? 'ON' : 'OFF'}
                  </Button>
                </div>

                <p className="text-[10px] text-slate-500">Simule sinais do paciente:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => simulateComfortCheck('comfortable')} disabled={!sessionActive}
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs">
                    <Heart className="w-3 h-3 mr-1" />Conforto
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => simulateComfortCheck('neutral')} disabled={!sessionActive}
                    className="text-slate-600 border-slate-200 hover:bg-slate-50 text-xs">
                    <Activity className="w-3 h-3 mr-1" />Neutro
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => simulateComfortCheck('uncomfortable')} disabled={!sessionActive}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />Alerta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ===== TELEMETRY CHARTS (FULL WIDTH) ===== */}
        {sessionActive && telemetry.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-500" />
                Gráficos de Telemetria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="comfort">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="comfort">Conforto</TabsTrigger>
                  <TabsTrigger value="gaze">Olhar</TabsTrigger>
                  <TabsTrigger value="combined">Combinado</TabsTrigger>
                </TabsList>

                <TabsContent value="comfort" className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={telemetry}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip labelFormatter={(ts) => new Date(ts).toLocaleTimeString('pt-BR')} formatter={(value: number) => [`${value.toFixed(1)}%`, 'Nível de Conforto']} />
                      <Area type="monotone" dataKey="comfortLevel" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="gaze" className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetry}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="gazeX" stroke="#8B5CF6" strokeWidth={2} dot={false} name="X" />
                      <Line type="monotone" dataKey="gazeY" stroke="#EC4899" strokeWidth={2} dot={false} name="Y" />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="combined" className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetry}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} />
                      <YAxis yAxisId="left" domain={[0, 100]} />
                      <YAxis yAxisId="right" orientation="right" domain={[-45, 45]} />
                      <Tooltip />
                      <Line yAxisId="left" type="monotone" dataKey="comfortLevel" stroke="#10B981" strokeWidth={2} dot={false} name="Conforto" />
                      <Line yAxisId="right" type="monotone" dataKey="headRotationX" stroke="#F59E0B" strokeWidth={2} dot={false} name="Rotação X" />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TherapistDemo;
