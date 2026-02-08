// NeuroScope VR - Login Page
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Eye, EyeOff, Loader2, ArrowLeft, Shield, Terminal, User, Activity } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, register, error, isLoading, clearError, setCurrentView } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerCrp, setRegisterCrp] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(loginEmail, loginPassword);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!acceptTerms) {
      return;
    }
    await register(registerEmail, registerPassword, registerName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => setCurrentView('landing')}
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">NeuroScope VR</h1>
          <p className="text-slate-600">Acesso para Profissionais</p>
        </div>

        {/* Alert for errors */}
        {error && (
          <Alert className="mb-4" variant={error.includes('Verifique') ? 'default' : 'destructive'}>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Login/Register Tabs */}
        <Card className="border-slate-200 shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Bem-vindo de volta</CardTitle>
                <CardDescription>
                  Entre com suas credenciais para acessar o dashboard clínico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Criar conta</CardTitle>
                <CardDescription>
                  Cadastro exclusivo para psicólogos com CRP ativo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      placeholder="Dr. Maria Silva"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="crp">Número do CRP</Label>
                    <Input
                      id="crp"
                      placeholder="06/123456"
                      value={registerCrp}
                      onChange={(e) => setRegisterCrp(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-slate-500">
                      Informe seu registro no Conselho Regional de Psicologia
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Senha</Label>
                    <div className="relative">
                      <Input
                        id="registerPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Mínimo 8 caracteres
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1"
                      required
                    />
                    <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                      Declaro ser psicólogo(a) com CRP ativo e aceito os{' '}
                      <button type="button" className="text-teal-600 hover:underline">
                        Termos de Uso
                      </button>{' '}
                      e{' '}
                      <button type="button" className="text-teal-600 hover:underline">
                        Política de Privacidade
                      </button>
                    </Label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                    disabled={isLoading || !acceptTerms}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Security notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Shield className="w-4 h-4" />
          <span>Conexão segura com criptografia SSL</span>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800 text-center">
            <strong>Demo:</strong> Use qualquer email e senha para testar
          </p>
        </div>

        {/* Developer Quick Access */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-4 text-slate-500">
            <Terminal className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Modo Desenvolvedor</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentView('therapist-demo')}
              className="border-slate-300 hover:bg-slate-100 flex flex-col items-center py-6 h-auto gap-2"
            >
              <Activity className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-medium">Entrar como Terapeuta</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentView('patient-demo')}
              className="border-slate-300 hover:bg-slate-100 flex flex-col items-center py-6 h-auto gap-2"
            >
              <User className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-medium">Entrar como Paciente</span>
            </Button>
          </div>
          <p className="mt-4 text-center text-[10px] text-slate-400">
            Acesso rápido para testes de interface e sincronização.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
