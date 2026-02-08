// NeuroScope VR - Therapist Demo Mode (Demonstração do Terapeuta)
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Headset,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Copy,
  CheckCircle,
  AlertTriangle,
  Activity,
  Wind,
  Sun,
  Sparkles,
  ArrowRight,
  Play,
  Square,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type ClinicalEnvironment = 'anxiety' | 'depression' | 'burnout';
type PatientStatus = 'waiting' | 'connected' | 'in-session' | 'completed';

interface TelemetryData {
  timestamp: number;
  gazeX: number;
  gazeY: number;
  headRotationX: number;
  headRotationY: number;
  comfortLevel: number;
}

interface ComfortEvent {
  id: string;
  timestamp: Date;
  type: 'comfortable' | 'uncomfortable' | 'check-in';
  environment: ClinicalEnvironment;
}

const TherapistDemo: React.FC = () => {
  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [currentEnvironment, setCurrentEnvironment] = useState<ClinicalEnvironment>('anxiety');
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Patient state
  const [patientStatus, setPatientStatus] = useState<PatientStatus>('waiting');
  const [patientName] = useState('Paciente Demo');
  const [patientLink, setPatientLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Telemetry
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [comfortEvents] = useState<ComfortEvent[]>([]);

  // Real-time sync simulation
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Generate patient link on mount
  useEffect(() => {
    const demoToken = 'demo-' + Math.random().toString(36).substring(2, 10);
    const baseUrl = window.location.origin;
    setPatientLink(`${baseUrl}/paciente-demo?token=${demoToken}&env=${currentEnvironment}&intensity=${intensity}`);
  }, [currentEnvironment, intensity]);

  // Real-time sync with Supabase
  useEffect(() => {
    if (!sessionActive) return;

    const channel = supabase.channel('session:demo');

    channel
      .on('broadcast', { event: 'telemetry' }, ({ payload }) => {
        setTelemetry(prev => [...prev.slice(-50), { ...payload, timestamp: Date.now() }]);
        setLastSync(new Date());
      })
      .on('broadcast', { event: 'comfort-check' }, ({ payload }) => {
        // Handle comfort events from patient
        console.log('Comfort event received:', payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionActive]);

  // Simulate patient connection
  useEffect(() => {
    if (sessionActive && patientStatus === 'waiting') {
      const timeout = setTimeout(() => {
        setPatientStatus('connected');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [sessionActive, patientStatus]);

  // Copy patient link
  const copyPatientLink = async () => {
    try {
      await navigator.clipboard.writeText(patientLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Start session
  const startSession = () => {
    setSessionActive(true);
    setPatientStatus('waiting');
  };

  // End session
  const endSession = () => {
    setSessionActive(false);
    setPatientStatus('completed');
    setTelemetry([]);
  };

  // Toggle mic
  const toggleMic = () => {
    const newStatus = !isMicActive;
    setIsMicActive(newStatus);

    // Broadcast mic status to patient
    supabase.channel('session:demo').send({
      type: 'broadcast',
      event: 'mic-status',
      payload: { isMicOn: newStatus }
    });
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Switch environment
  const switchEnvironment = (env: ClinicalEnvironment) => {
    setCurrentEnvironment(env);
    // Update patient link
    const baseUrl = window.location.origin;
    const demoToken = 'demo-' + Math.random().toString(36).substring(2, 10);
    setPatientLink(`${baseUrl}/?view=patient-demo&token=${demoToken}&env=${env}&intensity=${intensity}`);
  };

  // Environment info
  const getEnvironmentInfo = (env: ClinicalEnvironment) => {
    switch (env) {
      case 'anxiety':
        return { name: 'Ansiedade', icon: Wind, color: 'text-emerald-500', bg: 'bg-emerald-50' };
      case 'depression':
        return { name: 'Depressão', icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-50' };
      case 'burnout':
        return { name: 'Burnout', icon: Sun, color: 'text-blue-500', bg: 'bg-blue-50' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-teal-500 rounded-xl flex items-center justify-center">
                <Headset className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">NeuroScope VR</h1>
                <p className="text-xs text-slate-500">Modo Demonstração - Terapeuta</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant={sessionActive ? "default" : "secondary"}
                className={sessionActive ? "bg-emerald-500" : ""}>
                {sessionActive ? 'Sessão Ativa' : 'Sessão Inativa'}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Session Control */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Controle da Sessão
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!sessionActive ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Iniciar Sessão de Demonstração
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                      Inicie uma sessão de demonstração para testar os ambientes VR
                      e os controles do terapeuta em tempo real.
                    </p>
                    <Button onClick={startSession} size="lg" className="bg-purple-600 hover:bg-purple-700">
                      <Play className="w-5 h-5 mr-2" />
                      Iniciar Sessão Demo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Environment Selector */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-3 block">
                        Ambiente Clínico
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['anxiety', 'depression', 'burnout'] as ClinicalEnvironment[]).map((env) => {
                          const info = getEnvironmentInfo(env);
                          const Icon = info.icon;
                          return (
                            <button
                              key={env}
                              onClick={() => switchEnvironment(env)}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${currentEnvironment === env
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-slate-200 hover:border-purple-200 hover:bg-slate-50'
                                }`}
                            >
                              <Icon className={`w-6 h-6 ${info.color} mb-2`} />
                              <p className="text-sm font-medium text-slate-900">{info.name}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Intensity Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium text-slate-700">
                          Intensidade do Ambiente
                        </label>
                        <Badge variant="outline">Nível {intensity}</Badge>
                      </div>
                      <Slider
                        value={[intensity]}
                        onValueChange={(value) => setIntensity(value[0] as 1 | 2 | 3)}
                        min={1}
                        max={3}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>Suave</span>
                        <span>Moderado</span>
                        <span>Intenso</span>
                      </div>
                    </div>

                    {/* Voice Controls */}
                    <div className="flex gap-3">
                      <Button
                        variant={isMicActive ? "default" : "outline"}
                        onClick={toggleMic}
                        className={isMicActive ? "bg-rose-500 hover:bg-rose-600" : ""}
                      >
                        {isMicActive ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />}
                        {isMicActive ? 'Falando...' : 'Falar'}
                      </Button>
                      <Button
                        variant={isMuted ? "default" : "outline"}
                        onClick={toggleMute}
                        className={isMuted ? "bg-slate-700" : ""}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                        {isMuted ? 'Mudo' : 'Som'}
                      </Button>
                      <Button variant="destructive" onClick={endSession} className="ml-auto">
                        <Square className="w-4 h-4 mr-2" />
                        Encerrar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Telemetry Monitor */}
            {sessionActive && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-teal-500" />
                    Monitor de Telemetria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="comfort">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="comfort">Conforto</TabsTrigger>
                      <TabsTrigger value="gaze">Olhar</TabsTrigger>
                      <TabsTrigger value="head">Cabeça</TabsTrigger>
                    </TabsList>

                    <TabsContent value="comfort" className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={telemetry}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="timestamp"
                            tickFormatter={(ts) => new Date(ts).toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          />
                          <YAxis domain={[0, 100]} />
                          <Tooltip
                            labelFormatter={(ts) => new Date(ts).toLocaleTimeString('pt-BR')}
                            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Nível de Conforto']}
                          />
                          <Line
                            type="monotone"
                            dataKey="comfortLevel"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
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

                    <TabsContent value="head" className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={telemetry}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} />
                          <YAxis domain={[-45, 45]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="headRotationX" stroke="#F59E0B" strokeWidth={2} dot={false} name="Rotação X" />
                          <Line type="monotone" dataKey="headRotationY" stroke="#3B82F6" strokeWidth={2} dot={false} name="Rotação Y" />
                        </LineChart>
                      </ResponsiveContainer>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>Última sincronização: {lastSync.toLocaleTimeString('pt-BR')}</span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      Tempo real
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Patient & Events */}
          <div className="space-y-6">
            {/* Patient Link Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Link do Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Status do Paciente</span>
                      <Badge
                        variant={patientStatus === 'connected' ? 'default' : patientStatus === 'waiting' ? 'secondary' : 'outline'}
                        className={patientStatus === 'connected' ? 'bg-emerald-500' : ''}
                      >
                        {patientStatus === 'waiting' && 'Aguardando'}
                        {patientStatus === 'connected' && 'Conectado'}
                        {patientStatus === 'in-session' && 'Em Sessão'}
                        {patientStatus === 'completed' && 'Finalizado'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">{patientName}</p>
                  </div>

                  {sessionActive && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Envie este link para o paciente:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={patientLink}
                            readOnly
                            className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600"
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

                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => window.open(patientLink, '_blank')}
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Abrir Visão do Paciente
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comfort Events */}
            {sessionActive && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Eventos de Conforto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {comfortEvents.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">
                        Nenhum evento registrado ainda
                      </p>
                    ) : (
                      comfortEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`p-3 rounded-lg flex items-center gap-3 ${event.type === 'comfortable' ? 'bg-emerald-50' : 'bg-rose-50'
                            }`}
                        >
                          {event.type === 'comfortable' ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-rose-500" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {event.type === 'comfortable' ? 'Conforto Confirmado' : 'Desconforto'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {event.timestamp.toLocaleTimeString('pt-BR')} • {getEnvironmentInfo(event.environment)?.name || 'Ambiente'}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-500" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" disabled={!sessionActive}>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled={!sessionActive}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Alerta de Segurança
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

export default TherapistDemo;
