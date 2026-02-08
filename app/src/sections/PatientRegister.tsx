// NeuroScope VR - Patient Registration Form
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Save, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const PatientRegister: React.FC = () => {
  const { setCurrentView } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (!formData.full_name.trim()) {
      setError('Nome completo é obrigatório');
      setIsLoading(false);
      return;
    }

    try {
      // In real implementation, this would call Supabase
      // const { data, error } = await createPatient({
      //   ...formData,
      //   therapist_id: user?.id,
      //   is_active: true,
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => {
        setCurrentView('dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar paciente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <h1 className="text-lg font-bold text-slate-900">Novo Paciente</h1>
                <p className="text-xs text-slate-500">Cadastro de paciente</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>Paciente cadastrado com sucesso! Redirecionando...</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-500" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Dados básicos do paciente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="full_name">
                      Nome Completo <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Digite o nome completo"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="paciente@email.com"
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(11) 98765-4321"
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      disabled={isLoading}
                    >
                      <option value="">Selecione</option>
                      <option value="feminino">Feminino</option>
                      <option value="masculino">Masculino</option>
                      <option value="nao_binario">Não-binário</option>
                      <option value="prefiro_nao_dizer">Prefiro não dizer</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Contato de Emergência
                </CardTitle>
                <CardDescription>
                  Pessoa a ser contactada em caso de emergência
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Nome</Label>
                    <Input
                      id="emergency_contact_name"
                      name="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={handleChange}
                      placeholder="Nome do contato"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="emergency_contact_phone"
                        name="emergency_contact_phone"
                        value={formData.emergency_contact_phone}
                        onChange={handleChange}
                        placeholder="(11) 98765-4321"
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  Observações Médicas
                </CardTitle>
                <CardDescription>
                  Informações clínicas relevantes (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="medical_notes">Notas</Label>
                  <textarea
                    id="medical_notes"
                    name="medical_notes"
                    value={formData.medical_notes}
                    onChange={handleChange}
                    placeholder="Histórico médico relevante, medicações, contraindicações..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Aviso de Privacidade</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Os dados do paciente são armazenados de forma segura e em conformidade 
                      com a LGPD. Apenas você terá acesso às informações deste paciente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentView('dashboard')}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-teal-500 to-purple-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Cadastrar Paciente
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default PatientRegister;
