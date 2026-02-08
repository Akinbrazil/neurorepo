// NeuroScope VR - Patient Demo Mode (Demonstração do Paciente)
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Headset,
  CheckCircle,
  AlertTriangle,
  Info,
  Heart,
  Wind,
  Sun,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';
import VREnvironments from './VREnvironments';

type ClinicalEnvironment = 'anxiety' | 'depression' | 'burnout';

const PatientDemo: React.FC = () => {
  const [isVRActive, setIsVRActive] = useState(false);
  const [currentEnvironment, setCurrentEnvironment] = useState<ClinicalEnvironment>('anxiety');
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2);
  const [isConnected, setIsConnected] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const env = params.get('env') as ClinicalEnvironment;
    const int = params.get('intensity');

    if (env && ['anxiety', 'depression', 'burnout'].includes(env)) {
      setCurrentEnvironment(env);
    }
    if (int) {
      setIntensity(parseInt(int) as 1 | 2 | 3);
    }
  }, []);

  // Simulate connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.05); // 95% uptime
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get environment info
  const getEnvironmentInfo = (env: ClinicalEnvironment) => {
    switch (env) {
      case 'anxiety':
        return {
          name: 'Controle de Ansiedade',
          description: 'Foco em respiração e calma natural',
          icon: Wind,
          color: 'from-emerald-500 to-teal-600',
          textColor: 'text-emerald-600'
        };
      case 'depression':
        return {
          name: 'Ativação (Depressão)',
          description: 'Cores vibrantes e estímulos positivos',
          icon: Sparkles,
          color: 'from-yellow-400 to-orange-500',
          textColor: 'text-yellow-600'
        };
      case 'burnout':
        return {
          name: 'Descompressão (Burnout)',
          description: 'Isolamento sereno e regeneração',
          icon: Sun,
          color: 'from-blue-400 to-indigo-500',
          textColor: 'text-blue-600'
        };
    }
  };

  const envInfo = getEnvironmentInfo(currentEnvironment);
  const EnvIcon = envInfo.icon;

  // Handle comfort check
  const handleComfortCheck = (status: 'comfortable' | 'uncomfortable') => {
    // In real implementation, this would send to Supabase Broadcast
    console.log('Comfort check:', status);
  };

  // Handle environment change
  const handleEnvironmentChange = (env: ClinicalEnvironment) => {
    setCurrentEnvironment(env);
  };

  // Start VR session
  const startVR = () => {
    setIsVRActive(true);
    setShowInstructions(false);
  };

  // Exit VR session
  const exitVR = () => {
    setIsVRActive(false);
  };

  if (isVRActive) {
    return (
      <div className="relative w-full h-screen">
        <VREnvironments
          sessionId="demo"
          patientId="demo-patient"
          initialEnvironment={currentEnvironment}
          initialIntensity={intensity}
          onEnvironmentChange={handleEnvironmentChange}
          onComfortCheck={handleComfortCheck}
        />

        {/* Exit VR Button */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="secondary"
            onClick={exitVR}
            className="bg-white/90 backdrop-blur-sm"
          >
            Sair do VR
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-teal-500 rounded-xl flex items-center justify-center">
                <Headset className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">NeuroScope VR</h1>
                <p className="text-xs text-white/60">Modo Demonstração - Paciente</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <Wifi className="w-3 h-3 mr-1" />
                  Conectado
                </Badge>
              ) : (
                <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Desconectado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <div className={`w-20 h-20 bg-gradient-to-br ${envInfo.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl`}>
                <EnvIcon className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">
                {envInfo.name}
              </h2>
              <p className="text-white/70 text-lg mb-6">
                {envInfo.description}
              </p>

              <div className="flex items-center justify-center gap-4 mb-8">
                <Badge variant="outline" className="border-white/30 text-white/80">
                  Intensidade: {intensity}/3
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white/80">
                  Duração: 5-10 min
                </Badge>
              </div>

              <Button
                onClick={startVR}
                size="lg"
                className={`bg-gradient-to-r ${envInfo.color} text-white shadow-xl hover:shadow-2xl transition-shadow px-8 py-6 text-lg`}
              >
                <Headset className="w-6 h-6 mr-3" />
                Iniciar Experiência VR
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        {showInstructions && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-teal-400" />
                  Como Funciona
                </h3>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm flex-shrink-0">1</span>
                    <span>Clique em "Iniciar Experiência VR" para entrar no ambiente</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm flex-shrink-0">2</span>
                    <span>Mova seu celular para controlar a retícula (cursor)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm flex-shrink-0">3</span>
                    <span>Olhe para o ícone de coração por 2 segundos para confirmar conforto</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm flex-shrink-0">4</span>
                    <span>O terapeuta pode falar com você durante a sessão</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400" />
                  Sinais de Conforto
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                    <div>
                      <p className="text-white font-medium">Estou Confortável</p>
                      <p className="text-white/60 text-sm">Olhe para o ícone verde por 2 segundos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-rose-500/10 rounded-lg border border-rose-500/20">
                    <AlertTriangle className="w-8 h-8 text-rose-400" />
                    <div>
                      <p className="text-white font-medium">Preciso de Ajuda</p>
                      <p className="text-white/60 text-sm">Toque no ícone vermelho para alertar</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Environment Preview */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Ambientes Disponíveis
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {(['anxiety', 'depression', 'burnout'] as ClinicalEnvironment[]).map((env) => {
                const info = getEnvironmentInfo(env);
                const Icon = info.icon;
                const isActive = env === currentEnvironment;
                return (
                  <div
                    key={env}
                    className={`p-4 rounded-xl border-2 transition-all ${isActive
                      ? `border-purple-500 bg-purple-500/20`
                      : 'border-white/10 bg-white/5'
                      }`}
                  >
                    <Icon className={`w-8 h-8 ${info.textColor} mb-2`} />
                    <p className="text-sm font-medium text-white">{info.name}</p>
                    {isActive && (
                      <Badge className="mt-2 bg-purple-500 text-white">Ativo</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Safety Notice */}
        <div className="mt-8 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/20 text-amber-300 rounded-full text-sm border border-amber-500/30">
          <AlertTriangle className="w-4 h-4" />
          <span>Esta sessão é supervisionada pelo terapeuta em tempo real</span>
        </div>
      </main>
    </div>
  );
};

export default PatientDemo;
