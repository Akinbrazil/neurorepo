// NeuroScope VR - Landing Page (Portal Institucional)
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  Headset, 
  Shield, 
  Users, 
  Activity, 
  Clock,
  CheckCircle,
  ArrowRight,
  Heart,
  Sparkles,
  Building2,
  Stethoscope,
  Calendar,
  Play,
  BarChart3,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Mic
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { setCurrentView } = useAuth();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Headset className="w-8 h-8 text-teal-500" />,
      title: 'Experiência Imersiva',
      description: 'Ambientes virtuais terapêuticos em 360° diretamente no navegador, sem necessidade de instalação.'
    },
    {
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      title: 'Avaliação Neuropsicológica',
      description: 'Ferramentas clínicas validadas como DASS-21 integradas à experiência imersiva.'
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-500" />,
      title: 'Segurança Clínica',
      description: 'Protocolos de segurança com supervisão humana permanente e verificação de conforto do paciente.'
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: 'Controle em Tempo Real',
      description: 'O terapeuta controla o ambiente VR do paciente em tempo real durante toda a sessão.'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Avaliação Inicial',
      description: 'Aplicação da escala DASS-21 para estabelecer baseline de depressão, ansiedade e estresse.'
    },
    {
      step: 2,
      title: 'Sessões de Imersão',
      description: 'Sessões semanais de 5-10 minutos em ambientes VR calmantes (Floresta ou Sala de Aula).' 
    },
    {
      step: 3,
      title: 'Controle do Terapeuta',
      description: 'O psicólogo ajusta intensidade e comunica-se via intercom em tempo real.'
    },
    {
      step: 4,
      title: 'Avaliação Final',
      description: 'Reaplicação do DASS-21 e geração de relatório comparativo com métricas de evolução.'
    }
  ];

  const forCompanies = [
    {
      title: 'Bem-Estar Corporativo',
      description: 'Programa de 8 semanas para redução de estresse ocupacional e prevenção de burnout.'
    },
    {
      title: 'Relatórios Agregados',
      description: 'Dashboards anônimos para RH acompanharem o bem-estar geral da equipe.'
    },
    {
      title: 'ROI Mensurável',
      description: 'Redução de 40% nos sintomas de ansiedade e melhora na produtividade.'
    },
    {
      title: 'LGPD Compliant',
      description: 'Todos os dados são anonimizados para relatórios corporativos.'
    }
  ];

  const forPsychologists = [
    {
      title: 'Ferramenta Clínica',
      description: 'Plataforma validada para avaliação neuropsicológica e intervenção imersiva.'
    },
    {
      title: 'Controle Total',
      description: 'Ajuste de intensidade, comunicação por voz e monitoramento de conforto em tempo real.'
    },
    {
      title: 'Histórico Completo',
      description: 'Acompanhamento de evolução do paciente com gráficos baseline vs follow-up.'
    },
    {
      title: 'Sem Instalação',
      description: 'Pacientes acessam via link - não precisam instalar aplicativos.'
    }
  ];

  const programWeeks = [
    {
      week: 1,
      title: 'Avaliação Baseline',
      description: 'Aplicação do DASS-21 e primeira imersão de familiarização'
    },
    {
      week: 2,
      title: 'Introdução à Respiração',
      description: 'Técnicas de respiração guiada em ambiente natural calmante'
    },
    {
      week: 3,
      title: 'Mindfulness Imersivo',
      description: 'Práticas de atenção plena com estímulos controlados'
    },
    {
      week: 4,
      title: 'Regulação Emocional',
      description: 'Exercícios de identificação e regulação de estados emocionais'
    },
    {
      week: 5,
      title: 'Exposição Graduada',
      description: 'Introdução controlada a estímulos moderados de estresse'
    },
    {
      week: 6,
      title: 'Resiliência Cognitiva',
      description: 'Treinamento de flexibilidade cognitiva sob pressão'
    },
    {
      week: 7,
      title: 'Integração',
      description: 'Sessão combinada aplicando todas as técnicas aprendidas'
    },
    {
      week: 8,
      title: 'Avaliação Final',
      description: 'Reaplicação do DASS-21 e planejamento de manutenção'
    }
  ];

  const benefits = [
    'Redução de 40% nos sintomas de ansiedade em 8 semanas',
    'Melhora significativa na qualidade do sono',
    'Aumento da capacidade de concentração e foco',
    'Redução dos níveis de cortisol salivar',
    'Melhora no bem-estar geral e qualidade de vida'
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
                NeuroScope VR
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('como-funciona')} className="text-sm text-slate-600 hover:text-slate-900">
                Como Funciona
              </button>
              <button onClick={() => scrollToSection('para-empresas')} className="text-sm text-slate-600 hover:text-slate-900">
                Para Empresas
              </button>
              <button onClick={() => scrollToSection('para-psicologos')} className="text-sm text-slate-600 hover:text-slate-900">
                Para Psicólogos
              </button>
              <button onClick={() => scrollToSection('programa')} className="text-sm text-slate-600 hover:text-slate-900">
                Programa
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentView('login')}
                className="hidden sm:flex text-slate-600 hover:text-slate-900"
              >
                Entrar
              </Button>
              <Button
                onClick={() => setShowDemoModal(true)}
                className="hidden sm:flex bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white"
              >
                Agendar Demo
              </Button>
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <div className="flex flex-col gap-3">
                <button onClick={() => scrollToSection('como-funciona')} className="text-left py-2 text-slate-600">
                  Como Funciona
                </button>
                <button onClick={() => scrollToSection('para-empresas')} className="text-left py-2 text-slate-600">
                  Para Empresas
                </button>
                <button onClick={() => scrollToSection('para-psicologos')} className="text-left py-2 text-slate-600">
                  Para Psicólogos
                </button>
                <button onClick={() => scrollToSection('programa')} className="text-left py-2 text-slate-600">
                  Programa
                </button>
                <Button
                  onClick={() => {
                    setShowDemoModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-teal-500 to-purple-600"
                >
                  Agendar Demo
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Nova plataforma de bem-estar corporativo</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Terapia Imersiva para o{' '}
                <span className="bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
                  Bem-Estar Mental
                </span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                NeuroScope VR é uma plataforma completa de realidade virtual para 
                avaliação neuropsicológica e programas de bem-estar corporativo. 
                Experiência imersiva, controle clínico em tempo real e resultados mensuráveis.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => setShowDemoModal(true)}
                  className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white px-8"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Demo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection('como-funciona')}
                  className="border-slate-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Como Funciona
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Sem instalação</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>100% no navegador</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Supervisão clínica</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-purple-500 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
                <div className="aspect-square bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-center space-y-4">
                    <Headset className="w-24 h-24 text-teal-400 mx-auto" />
                    <div className="text-white text-lg font-medium">Ambiente VR</div>
                    <div className="flex justify-center gap-2">
                      <span className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs">Floresta</span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">Sala de Aula</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <Activity className="w-6 h-6 text-teal-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900">8</div>
                    <div className="text-xs text-slate-500">Semanas</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900">10</div>
                    <div className="text-xs text-slate-500">Min/Sessão</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <Heart className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900">40%</div>
                    <div className="text-xs text-slate-500">Redução</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Um processo simples e eficaz de 4 passos para transformar o bem-estar mental da sua equipe
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <Card key={index} className="border-slate-100 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Para Empresas Section */}
      <section id="para-empresas" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Building2 className="w-4 h-4" />
                <span>Para Empresas</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Bem-Estar Corporativo com Resultados Mensuráveis
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Ofereça aos seus colaboradores uma solução inovadora de saúde mental 
                baseada em evidências científicas. Reduza o absenteísmo e aumente a 
                produtividade com sessões de apenas 5-10 minutos por semana.
              </p>
              <div className="space-y-4">
                {forCompanies.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                className="mt-8 bg-gradient-to-r from-teal-500 to-purple-600"
                onClick={() => setShowDemoModal(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Apresentação para RH
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-teal-500 rounded-3xl blur-3xl opacity-20" />
              <Card className="relative">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                    <h3 className="text-xl font-bold text-slate-900">Dashboard para RH</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Participação no Programa</span>
                        <span className="text-sm font-bold text-emerald-600">87%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full w-[87%] bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Redução de Estresse</span>
                        <span className="text-sm font-bold text-blue-600">38%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full w-[38%] bg-blue-500 rounded-full" />
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Satisfação dos Colaboradores</span>
                        <span className="text-sm font-bold text-purple-600">94%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full w-[94%] bg-purple-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    * Dados anonimizados em conformidade com a LGPD
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Para Psicólogos Section */}
      <section id="para-psicologos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-rose-500 rounded-3xl blur-3xl opacity-20" />
              <Card className="relative">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Stethoscope className="w-8 h-8 text-purple-500" />
                    <h3 className="text-xl font-bold text-slate-900">Dashboard Clínico</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500 mb-2">Paciente: Ana Carolina M.</p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-xs">D: 8/21</span>
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">A: 10/21</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">E: 14/21</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500 mb-2">Controles da Sessão</p>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-teal-500 text-white rounded text-xs">Nível 2</span>
                        <span className="px-3 py-1 bg-rose-500 text-white rounded text-xs flex items-center gap-1">
                          <Mic className="w-3 h-3" /> Voz Ativa
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">Paciente Confortável</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium mb-6">
                <Stethoscope className="w-4 h-4" />
                <span>Para Psicólogos</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Uma Ferramenta Clínica Poderosa
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Integre a realidade virtual à sua prática clínica. Controle o ambiente 
                do paciente em tempo real, monitore o conforto e acompanhe a evolução 
                com dados objetivos.
              </p>
              <div className="space-y-4">
                {forPsychologists.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                className="mt-8 bg-gradient-to-r from-purple-500 to-teal-500"
                onClick={() => setCurrentView('login')}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Acessar como Profissional
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Por que escolher o NeuroScope VR?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Nossa plataforma combina tecnologia de ponta com rigor clínico para oferecer 
              a melhor experiência terapêutica imersiva disponível.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-slate-100 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 8-Week Program Section */}
      <section id="programa" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Programa de 8 Semanas
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Um programa estruturado e progressivo, desenvolvido por especialistas 
              em psicologia e neurociência para maximizar resultados.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programWeeks.map((week, index) => (
              <Card key={index} className="border-slate-200 hover:border-teal-300 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {week.week}
                    </div>
                    <span className="text-sm text-slate-500">Semana</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{week.title}</h3>
                  <p className="text-slate-600 text-sm">{week.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Resultados Comprovados
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Estudos clínicos demonstram a eficácia da terapia imersiva VR na redução 
                de sintomas de ansiedade, estresse e depressão.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-teal-500 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white">
                <div className="text-center mb-8">
                  <Activity className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Estatísticas de Resultados</h3>
                  <p className="text-slate-400">Baseado em 500+ pacientes tratados</p>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Redução de Ansiedade</span>
                      <span className="text-teal-400 font-bold">42%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[42%] bg-gradient-to-r from-teal-400 to-teal-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Redução de Estresse</span>
                      <span className="text-purple-400 font-bold">38%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[38%] bg-gradient-to-r from-purple-400 to-purple-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Melhora no Sono</span>
                      <span className="text-rose-400 font-bold">51%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[51%] bg-gradient-to-r from-rose-400 to-rose-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Satisfação dos Pacientes</span>
                      <span className="text-emerald-400 font-bold">94%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[94%] bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-20 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg border border-amber-100">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Protocolos de Segurança Clínica
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-500" />
                      Supervisão Humana Permanente
                    </h3>
                    <p className="text-slate-600 text-sm">
                      O terapeuta mantém controle total do ambiente VR durante toda a sessão, 
                      podendo ajustar a intensidade e intervir imediatamente quando necessário.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-500" />
                      Verificação de Conforto
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Sistema de gaze tracking permite que o paciente sinalize conforto 
                      a qualquer momento, com feedback imediato no dashboard do terapeuta.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-500" />
                      Sem Diagnósticos Automáticos
                    </h3>
                    <p className="text-slate-600 text-sm">
                      A plataforma é uma ferramenta de apoio clínico. Todos os diagnósticos 
                      devem ser realizados por profissionais qualificados e registrados no CRP.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-500" />
                      Privacidade e LGPD
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Todos os dados dos pacientes são criptografados e armazenados em 
                      conformidade com a Lei Geral de Proteção de Dados (LGPD).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Pronto para transformar sua prática clínica?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Junte-se a centenas de psicólogos que já utilizam o NeuroScope VR 
            para oferecer terapia imersiva de última geração.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setShowDemoModal(true)}
              className="bg-white text-purple-700 hover:bg-slate-100 px-8"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Demonstração
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setCurrentView('login')}
              className="border-white text-white hover:bg-white/10 px-8"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Acessar Plataforma
            </Button>
          </div>
          <p className="text-white/60 text-sm mt-6">
            Cadastro exclusivo para profissionais de psicologia com CRP ativo
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-8 h-8 text-teal-400" />
                <span className="text-xl font-bold text-white">NeuroScope VR</span>
              </div>
              <p className="text-sm">
                Plataforma de realidade virtual para avaliação neuropsicológica 
                e bem-estar corporativo.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('como-funciona')} className="hover:text-teal-400">Como Funciona</button></li>
                <li><button onClick={() => scrollToSection('para-empresas')} className="hover:text-teal-400">Para Empresas</button></li>
                <li><button onClick={() => scrollToSection('para-psicologos')} className="hover:text-teal-400">Para Psicólogos</button></li>
                <li><button onClick={() => setCurrentView('login')} className="hover:text-teal-400">Dashboard</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  contato@neuroscopevr.com.br
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  (11) 4000-0000
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  São Paulo, SP
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>Termos de Uso</li>
                <li>Política de Privacidade</li>
                <li>LGPD</li>
                <li>Consentimento Informado</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>© 2024 NeuroScope VR. Todos os direitos reservados.</p>
            <p className="mt-2">
              <span className="text-amber-400">⚠️</span> Este é um protótipo de demonstração. 
              Não utilize para tratamento real sem validação clínica apropriada.
            </p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Demonstração</DialogTitle>
            <DialogDescription>
              Preencha seus dados e entraremos em contato para agendar uma demonstração personalizada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="demo-name">Nome Completo</Label>
              <Input id="demo-name" placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-email">Email Profissional</Label>
              <Input id="demo-email" type="email" placeholder="seu@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-phone">Telefone</Label>
              <Input id="demo-phone" placeholder="(11) 98765-4321" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-type">Tipo de Interesse</Label>
              <select id="demo-type" className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm">
                <option value="">Selecione</option>
                <option value="empresa">Bem-Estar Corporativo (Empresa)</option>
                <option value="psicologo">Uso Clínico (Psicólogo)</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-teal-500 to-purple-600"
              onClick={() => {
                setShowDemoModal(false);
                alert('Obrigado! Entraremos em contato em breve.');
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Solicitar Demonstração
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">ou</span>
              </div>
            </div>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowDemoModal(false);
                setCurrentView('therapist-demo');
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Experimentar Demo Agora
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
