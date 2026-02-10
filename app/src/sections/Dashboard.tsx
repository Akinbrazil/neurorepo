// NeuroScope VR - Clinical Dashboard (Dashboard Clínico)
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Brain,
  Users,
  Calendar,
  Activity,
  LogOut,
  Search,
  Plus,
  Play,
  FileText,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingDown,
  BarChart3,
  Headset
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts';
import type { Session } from '@/types';
import { BusinessEngine } from '@/lib/db-simulation';
import type { Patient } from '@/lib/db-simulation';

// Mock data for demonstration
const mockSessions: Session[] = [
  {
    id: 's1',
    patient_id: 'P1',
    therapist_id: 'T1',
    session_number: 5,
    environment_type: 'sala-aula',
    duration_minutes: 30,
    intensity_level: 1,
    status: 'completed',
    started_at: '2024-01-24T14:00:00Z',
    ended_at: '2024-01-24T14:30:00Z',
    patient_comfort_checks: 8,
    therapist_notes: 'Excelente progresso. Ansiedade reduzida significativamente.',
    patient_feedback: '',
    created_at: '2024-01-24T14:00:00Z',
    updated_at: '2024-01-24T14:30:00Z',
    patient_name: 'Carlos Eduardo',
    patient_email: 'carlos@email.com',
    patient_phone: '(11) 99988-1122',
  },
  {
    id: 's3',
    patient_id: '3',
    therapist_id: 'therapist-1',
    session_number: 1,
    environment_type: 'floresta',
    duration_minutes: undefined,
    intensity_level: 1,
    status: 'scheduled',
    started_at: undefined,
    ended_at: undefined,
    patient_comfort_checks: 0,
    therapist_notes: '',
    patient_feedback: '',
    created_at: '2024-01-26T09:00:00Z',
    updated_at: '2024-01-26T09:00:00Z',
    patient_name: 'Juliana Pereira Santos',
    patient_email: 'juliana.santos@email.com',
    patient_phone: '(11) 94567-8901',
  },
];

// Mock evolution data for charts
const evolutionData = [
  { week: 'Baseline', depressao: 16, ansiedade: 20, estresse: 28 },
  { week: 'Semana 2', depressao: 14, ansiedade: 18, estresse: 26 },
  { week: 'Semana 4', depressao: 12, ansiedade: 14, estresse: 22 },
  { week: 'Semana 6', depressao: 10, ansiedade: 12, estresse: 20 },
  { week: 'Semana 8', depressao: 8, ansiedade: 10, estresse: 16 },
];

const comparisonData = [
  { metric: 'Depressão', baseline: 16, followup: 8 },
  { metric: 'Ansiedade', baseline: 20, followup: 10 },
  { metric: 'Estresse', baseline: 28, followup: 16 },
];

const Dashboard: React.FC = () => {
  const { setCurrentView } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Database simulation integration
  const clinicalData = BusinessEngine.getTherapistView('T1'); // Simulating Dr. Lucas
  const [patients] = useState(clinicalData.patients);
  const [sessions] = useState<Session[]>(mockSessions);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [sessionNote, setSessionNote] = useState('');

  // VR Session states
  const [selectedEnvironment, setSelectedEnvironment] = useState('ansiedade_lago');
  const [generatedLink, setGeneratedLink] = useState('');
  const [showLinkDisplay, setShowLinkDisplay] = useState(false);

  const filteredPatients = patients.filter((p: Patient) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
    // Reset VR link when switching patients
    setGeneratedLink('');
    setShowLinkDisplay(false);
  };

  const handleStartSession = () => {
    // In a real app, this would set the active patient in AuthContext
    setCurrentView('session-control');
  };

  const handleGenerateVRLink = () => {
    const sessionId = Math.random().toString(36).substring(7);
    const baseUrl = window.location.origin + '/vrsession'; // Using current origin for demo
    const linkFinal = `${baseUrl}?room=${sessionId}&env=${selectedEnvironment}&user=patient`;

    setGeneratedLink(linkFinal);
    setShowLinkDisplay(true);

    // Business Intelligence Log (CEO Monitoring)
    BusinessEngine.registrarLogSessao(sessionId, selectedEnvironment);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("Link copiado! Envie por WhatsApp ou SMS para o paciente.");
  };

  const handleSendWhatsApp = () => {
    if (!selectedPatient || !generatedLink) return;
    const message = window.encodeURIComponent(
      `Olá ${selectedPatient.nome}, aqui é o seu terapeuta. \n\nClique no link abaixo para iniciarmos nossa sessão de VR hoje: \n${generatedLink}`
    );
    // Removing non-numeric characters from phone for wa.me
    const cleanPhone = selectedPatient.tel.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(url, '_blank');
  };

  const handleSendEmail = () => {
    if (!selectedPatient || !generatedLink) return;
    const subject = window.encodeURIComponent("Sua Sessão de Realidade Virtual");
    const body = window.encodeURIComponent(`Link para acesso: ${generatedLink}`);
    window.location.href = `mailto:${selectedPatient.email}?subject=${subject}&body=${body}`;
  };

  const handleSaveReport = () => {
    if (!sessionNote) return;
    // Simulate saving (Admin side would only see a log: "T1 created report for P1")
    console.log(`Log capturado: Terapeuta T1 criou um relatório para paciente ${selectedPatient?.id} às ${new Date().toLocaleTimeString()} (IP: Local)`);
    alert("Relatório salvo com sucesso no banco de dados criptografado.");
    setSessionNote('');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Normal':
        return 'bg-emerald-100 text-emerald-700';
      case 'Leve':
        return 'bg-yellow-100 text-yellow-700';
      case 'Moderado':
        return 'bg-orange-100 text-orange-700';
      case 'Grave':
        return 'bg-red-100 text-red-700';
      case 'Extremamente Grave':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'in_progress':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-emerald-100 text-emerald-700">Concluída</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-700">Em Andamento</Badge>;
      case 'scheduled':
        return <Badge variant="default" className="bg-amber-100 text-amber-700">Agendada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">NeuroScope VR</h1>
                <p className="text-xs text-slate-500">Dashboard Clínico</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{user?.full_name || 'Dr. Usuário'}</p>
                <p className="text-xs text-slate-500">{user?.crp_number || 'CRP: 06/00000'}</p>
              </div>
              <Avatar className="w-10 h-10 border-2 border-teal-200">
                <AvatarFallback className="bg-gradient-to-br from-teal-100 to-purple-100 text-teal-700">
                  {user?.full_name?.charAt(0) || 'D'}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-5 h-5 text-slate-500" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalPatients}</p>
                <p className="text-sm text-slate-500">Pacientes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activeSessions}</p>
                <p className="text-sm text-slate-500">Sessões Ativas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{scheduledSessions}</p>
                <p className="text-sm text-slate-500">Agendadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{completedSessions}</p>
                <p className="text-sm text-slate-500">Concluídas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Evolution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-teal-500" />
                Evolução do Programa (8 Semanas)
              </CardTitle>
              <CardDescription>
                Visualização da evolução dos escores DASS-21 ao longo do programa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 42]} />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine y={14} stroke="#10B981" strokeDasharray="3 3" label="Dep. Normal" />
                    <Line type="monotone" dataKey="depressao" name="Depressão" stroke="#F43F5E" strokeWidth={2} />
                    <Line type="monotone" dataKey="ansiedade" name="Ansiedade" stroke="#F59E0B" strokeWidth={2} />
                    <Line type="monotone" dataKey="estresse" name="Estresse" stroke="#8B5CF6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Baseline vs Follow-up */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Baseline vs Follow-up
              </CardTitle>
              <CardDescription>
                Comparação entre avaliação inicial e final do programa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis domain={[0, 42]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="baseline" name="Baseline" fill="#94A3B8" />
                    <Bar dataKey="followup" name="Follow-up" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 font-medium">Redução média: 50%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="patients" className="gap-2">
              <Users className="w-4 h-4" />
              Pacientes
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Calendar className="w-4 h-4" />
              Sessões
            </TabsTrigger>
          </TabsList>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => setCurrentView('patient-register')}
                className="bg-gradient-to-r from-teal-500 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Paciente
              </Button>
            </div>

            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Paciente</TableHead>
                      <TableHead className="min-w-[150px]">Contato</TableHead>
                      <TableHead className="min-w-[220px]">DASS-21 (Dep/Ans/Est)</TableHead>
                      <TableHead className="min-w-[120px]">Última Avaliação</TableHead>
                      <TableHead className="text-right min-w-[150px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-slate-100 text-slate-600">
                                {patient.nome.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900">{patient.nome}</p>
                              <p className="text-sm text-slate-500">
                                {patient.idade} anos
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="w-3 h-3" />
                              {patient.tel}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {patient.total_score ? (
                            <div className="space-y-1">
                              <div className="flex gap-1">
                                <Badge className={getSeverityColor(patient.depression_severity || '')}>
                                  D: {patient.depression_score}
                                </Badge>
                                <Badge className={getSeverityColor(patient.anxiety_severity || '')}>
                                  A: {patient.anxiety_score}
                                </Badge>
                                <Badge className={getSeverityColor(patient.stress_severity || '')}>
                                  E: {patient.stress_score}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500">
                                Total: {patient.total_score}/126
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">Não avaliado</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {patient.last_assessment_date ? (
                            <span className="text-sm text-slate-600">
                              {new Date(patient.last_assessment_date).toLocaleDateString('pt-BR')}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPatient(patient)}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStartSession()}
                              className="bg-gradient-to-r from-teal-500 to-purple-600"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Iniciar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Sessões</CardTitle>
                <CardDescription>
                  Visualize todas as sessões realizadas e agendadas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Paciente</TableHead>
                      <TableHead className="min-w-[80px]">Sessão</TableHead>
                      <TableHead className="min-w-[150px]">Ambiente</TableHead>
                      <TableHead className="min-w-[100px]">Intensidade</TableHead>
                      <TableHead className="min-w-[100px]">Duração</TableHead>
                      <TableHead className="min-w-[150px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <p className="font-medium text-slate-900">{session.patient_name}</p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">#{session.session_number}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {session.environment_type === 'sala-aula' ? 'Sala de Aula' : session.environment_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {[1, 2, 3].map((level) => (
                              <div
                                key={level}
                                className={`w-2 h-2 rounded-full ${level <= session.intensity_level
                                  ? 'bg-purple-500'
                                  : 'bg-slate-200'
                                  }`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {session.duration_minutes ? (
                            <span className="text-sm text-slate-600">{session.duration_minutes} min</span>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(session.status)}
                            {getStatusBadge(session.status)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Patient Details Dialog / Ficha do Paciente */}
      <Dialog open={showPatientDetails} onOpenChange={setShowPatientDetails}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-slate-50">
          <div className="flex flex-col h-full max-h-[90vh]">
            <header className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 border-2 border-teal-100">
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-purple-600 text-white text-xl font-bold">
                    {selectedPatient?.nome?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Prontuário Digital: <span className="text-teal-600">{selectedPatient?.nome}</span>
                  </h2>
                  <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-200 border-none px-3 py-1 mt-1">
                    {selectedPatient ? BusinessEngine.getClassificacaoEtaria(selectedPatient.idade) : 'Adulto'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPatientDetails(false)}>Fechar</Button>
                <Button size="sm" className="bg-gradient-to-r from-teal-500 to-purple-600" onClick={handleStartSession}>
                  <Play className="w-4 h-4 mr-2" /> Iniciar VR
                </Button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Dados Gerais */}
                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Dados Gerais</h3>
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <p className="text-xs text-slate-500">Idade</p>
                        <p className="font-semibold text-slate-900">{selectedPatient?.idade} anos</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500">Telefone</p>
                        <p className="font-semibold text-slate-900">{selectedPatient?.tel}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500">Localização</p>
                        <p className="text-sm font-medium text-slate-700">
                          {selectedPatient && (() => {
                            const terapeuta = BusinessEngine.getTherapistView('T1').therapist;
                            const regiao = terapeuta ? BusinessEngine.getRegionLabel(terapeuta.pais) : 'Estado';
                            return `${terapeuta?.pais} (${regiao}: ${terapeuta?.estado})`;
                          })()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* DASS-21 Summary */}
                  {selectedPatient?.total_score && (
                    <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                      <p className="text-xs font-bold text-teal-700 uppercase mb-2">Último DASS-21</p>
                      <div className="flex justify-between items-end">
                        <span className="text-2xl font-black text-teal-800">{selectedPatient.total_score}</span>
                        <span className="text-[10px] text-teal-600 mb-1">Score Total / 126</span>
                      </div>
                    </div>
                  )}

                  {/* VR Control Panel */}
                  <div className="pt-4 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Controle Virtual</h3>
                    <Card className="border-purple-200 bg-purple-50/30">
                      <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Ambiente Imersivo</label>
                          <select
                            value={selectedEnvironment}
                            onChange={(e) => setSelectedEnvironment(e.target.value)}
                            className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="ansiedade_lago">Ansiedade: Lago de Vidro</option>
                            <option value="depressao_floresta">Depressão: Floresta Viva</option>
                            <option value="burnout_cabana">Burnout: Cabana Acolhedora</option>
                          </select>
                        </div>

                        <Button
                          onClick={handleGenerateVRLink}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold"
                        >
                          <Headset className="w-4 h-4 mr-2" /> Iniciar Sessão Imersiva
                        </Button>

                        {showLinkDisplay && (
                          <div className="p-3 bg-white border border-purple-100 rounded-lg space-y-2 animate-in slide-in-from-top-2 duration-300">
                            <p className="text-[10px] font-medium text-slate-500">Envie este link para o paciente:</p>
                            <code className="block p-2 bg-slate-50 rounded border border-slate-100 text-[10px] text-purple-600 break-all font-mono">
                              {generatedLink}
                            </code>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={handleCopyLink} className="flex-1 text-[10px] h-8">
                                Copiar
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 text-[10px] h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={handleSendWhatsApp}
                              >
                                <Phone className="w-3 h-3 mr-1" /> WhatsApp
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 text-[10px] h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handleSendEmail}
                              >
                                <FileText className="w-3 h-3 mr-1" /> E-mail
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Evolução Clínica */}
                <section className="md:col-span-2 space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Evolução Clínica</h3>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                      {selectedPatient?.relatorios && selectedPatient.relatorios.length > 0 ? (
                        selectedPatient.relatorios.map((rel, idx) => (
                          <div key={idx} className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant="outline" className="text-[10px] font-mono text-slate-400">
                                {new Date().toLocaleDateString('pt-BR')}
                              </Badge>
                              <FileText className="w-3 h-3 text-slate-300" />
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed italic">"{rel}"</p>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                          <Activity className="w-8 h-8 opacity-20" />
                          <p className="text-sm italic">Nenhum histórico disponível</p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-white border-t border-slate-200">
                      <textarea
                        value={sessionNote}
                        onChange={(e) => setSessionNote(e.target.value)}
                        placeholder="Escreva o relatório da sessão de hoje..."
                        className="w-full h-24 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none transition-all"
                      />
                      <div className="flex justify-end mt-3">
                        <Button
                          onClick={handleSaveReport}
                          disabled={!sessionNote}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                        >
                          Salvar Evolução
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
