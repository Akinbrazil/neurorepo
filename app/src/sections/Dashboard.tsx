// NeuroScope VR - Clinical Dashboard (Dashboard Clínico)
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  BarChart3
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
import { getClinicalDataForTherapist } from '@/lib/db-simulation';

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
  const { user, logout, setCurrentView } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Database simulation integration
  const clinicalData = getClinicalDataForTherapist('T1'); // Simulating Dr. Lucas
  const [patients] = useState(clinicalData.patients);
  const [sessions] = useState<Session[]>(mockSessions);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  const filteredPatients = patients.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalPatients = patients.length;
  const activeSessions = sessions.filter(s => s.status === 'in_progress').length;
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled').length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;

  const handleViewPatient = (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  const handleStartSession = () => {
    // In a real app, this would set the active patient in AuthContext
    setCurrentView('session-control');
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

      {/* Patient Details Dialog */}
      <Dialog open={showPatientDetails} onOpenChange={setShowPatientDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-to-br from-teal-100 to-purple-100 text-teal-700 text-lg">
                  {selectedPatient?.nome?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p>{selectedPatient?.nome}</p>
                <p className="text-sm font-normal text-slate-500">
                  {selectedPatient?.tel}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Contato</p>
                  <p className="font-medium">{selectedPatient.tel}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Faixa Etária</p>
                  <p className="font-medium">
                    {selectedPatient.idade} anos ({selectedPatient.categoria})
                  </p>
                </div>
              </div>

              {/* DASS-21 Results */}
              {selectedPatient.total_score && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-500" />
                    Última Avaliação DASS-21
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-rose-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-rose-600">
                        {selectedPatient.depression_score}
                      </p>
                      <p className="text-sm text-rose-700 mt-1">Depressão</p>
                      <Badge className={`mt-2 ${getSeverityColor(selectedPatient.depression_severity || '')}`}>
                        {selectedPatient.depression_severity}
                      </Badge>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-amber-600">
                        {selectedPatient.anxiety_score}
                      </p>
                      <p className="text-sm text-amber-700 mt-1">Ansiedade</p>
                      <Badge className={`mt-2 ${getSeverityColor(selectedPatient.anxiety_severity || '')}`}>
                        {selectedPatient.anxiety_severity}
                      </Badge>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-purple-600">
                        {selectedPatient.stress_score}
                      </p>
                      <p className="text-sm text-purple-700 mt-1">Estresse</p>
                      <Badge className={`mt-2 ${getSeverityColor(selectedPatient.stress_severity || '')}`}>
                        {selectedPatient.stress_severity}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Pontuação Total</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {selectedPatient.total_score}/126
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Avaliado em: {new Date(selectedPatient.last_assessment_date || '').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-teal-500 to-purple-600"
                  onClick={() => {
                    setShowPatientDetails(false);
                    handleStartSession();
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Sessão
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCurrentView('dass21-form')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Nova Avaliação DASS-21
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
