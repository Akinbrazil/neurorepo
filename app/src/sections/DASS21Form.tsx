// NeuroScope VR - DASS-21 Assessment Form
// Escala de Depressão, Ansiedade e Estresse - 21 itens
// Scores are multiplied by 2 to match DASS-42 standards
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Activity, 
  Brain,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Info,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// DASS-21 Questions - Categorias conforme manual oficial
const dass21Questions = [
  // Escala de Estresse (Stress)
  { id: 1, text: 'Eu achei difícil me acalmar', category: 'stress' },
  { id: 6, text: 'Eu tendi a reagir de forma exagerada às situações', category: 'stress' },
  { id: 8, text: 'Eu senti que estava gastando muita energia nervosa', category: 'stress' },
  { id: 11, text: 'Eu me senti nervoso/a e agitado/a', category: 'stress' },
  { id: 12, text: 'Eu achei difícil relaxar', category: 'stress' },
  { id: 14, text: 'Eu me senti inquieto/a e agitado/a', category: 'stress' },
  { id: 18, text: 'Eu senti que estava sendo muito sensível e emotivo/a', category: 'stress' },
  
  // Escala de Ansiedade (Anxiety)
  { id: 2, text: 'Eu senti a boca seca', category: 'anxiety' },
  { id: 4, text: 'Eu tive dificuldade para respirar (por exemplo, respiração ofegante ou falta de ar mesmo sem ter feito nenhum esforço físico)', category: 'anxiety' },
  { id: 7, text: 'Eu senti tremores (por exemplo, nas mãos)', category: 'anxiety' },
  { id: 9, text: 'Eu me preocupei com situações em que poderia entrar em pânico e fazer papel de bobo/a', category: 'anxiety' },
  { id: 15, text: 'Eu senti que estava prestes a entrar em pânico', category: 'anxiety' },
  { id: 19, text: 'Eu percebi o coração batendo (por exemplo, batimento cardíaco acelerado)', category: 'anxiety' },
  { id: 20, text: 'Eu senti medo sem motivo', category: 'anxiety' },
  
  // Escala de Depressão (Depression)
  { id: 3, text: 'Eu não consegui ter sentimentos positivos', category: 'depression' },
  { id: 5, text: 'Eu achei difícil ter iniciativa para fazer as coisas', category: 'depression' },
  { id: 10, text: 'Eu senti que não tinha nada a esperar', category: 'depression' },
  { id: 13, text: 'Eu me senti deprimido/a e sem esperança', category: 'depression' },
  { id: 16, text: 'Eu não consegui me entusiasmar com nada', category: 'depression' },
  { id: 17, text: 'Eu senti que não tinha valor como pessoa', category: 'depression' },
  { id: 21, text: 'Eu senti que a vida não tinha sentido', category: 'depression' },
];

// Response options - Escala DASS-21
const responseOptions = [
  { value: 0, label: 'Não se aplicou de nenhuma forma', description: 'A mim de modo nenhum' },
  { value: 1, label: 'Aplicou-se em algum grau', description: 'A mim até certo ponto, ou por algum tempo' },
  { value: 2, label: 'Aplicou-se em um grau considerável', description: 'A mim consideravelmente, ou por uma boa parte do tempo' },
  { value: 3, label: 'Aplicou-se muito', description: 'A mim muito, ou na maioria das vezes' },
];

// Severity thresholds for DASS-21 (multiplied by 2 for DASS-42 equivalent)
const getSeverityLabel = (score: number, type: 'depression' | 'anxiety' | 'stress') => {
  if (type === 'depression') {
    if (score <= 9) return 'Normal';
    if (score <= 13) return 'Leve';
    if (score <= 20) return 'Moderado';
    if (score <= 27) return 'Grave';
    return 'Extremamente Grave';
  }
  if (type === 'anxiety') {
    if (score <= 7) return 'Normal';
    if (score <= 9) return 'Leve';
    if (score <= 14) return 'Moderado';
    if (score <= 19) return 'Grave';
    return 'Extremamente Grave';
  }
  // stress
  if (score <= 14) return 'Normal';
  if (score <= 18) return 'Leve';
  if (score <= 25) return 'Moderado';
  if (score <= 33) return 'Grave';
  return 'Extremamente Grave';
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Normal':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'Leve':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'Moderado':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'Grave':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'Extremamente Grave':
      return 'bg-rose-100 text-rose-700 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const DASS21Form: React.FC = () => {
  const { setCurrentView } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    depression: number;
    anxiety: number;
    stress: number;
    total: number;
    depressionSeverity: string;
    anxietySeverity: string;
    stressSeverity: string;
  } | null>(null);

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [dass21Questions[currentQuestion].id]: value }));
    
    // Auto-advance after selection
    if (currentQuestion < dass21Questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    let depression = 0;
    let anxiety = 0;
    let stress = 0;

    Object.entries(answers).forEach(([questionId, value]) => {
      const question = dass21Questions.find(q => q.id === parseInt(questionId));
      if (question) {
        if (question.category === 'depression') depression += value;
        else if (question.category === 'anxiety') anxiety += value;
        else if (question.category === 'stress') stress += value;
      }
    });

    // Multiply by 2 to match DASS-42 standards
    const depressionScore = depression * 2;
    const anxietyScore = anxiety * 2;
    const stressScore = stress * 2;

    return {
      depression: depressionScore,
      anxiety: anxietyScore,
      stress: stressScore,
      total: depressionScore + anxietyScore + stressScore,
      depressionSeverity: getSeverityLabel(depressionScore, 'depression'),
      anxietySeverity: getSeverityLabel(anxietyScore, 'anxiety'),
      stressSeverity: getSeverityLabel(stressScore, 'stress'),
    };
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(answers).length < dass21Questions.length) {
      setError('Por favor, responda todas as questões');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const calculatedResults = calculateResults();
      setResults(calculatedResults);
      
      // In real implementation, save to Supabase
      // await createDASS21Score({...})
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowResults(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar avaliação');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / dass21Questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  // Chart data for results
  const chartData = results ? [
    { name: 'Depressão', score: results.depression, severity: results.depressionSeverity },
    { name: 'Ansiedade', score: results.anxiety, severity: results.anxietySeverity },
    { name: 'Estresse', score: results.stress, severity: results.stressSeverity },
  ] : [];

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')}>
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar
                </Button>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Resultados DASS-21</h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-emerald-200 bg-emerald-50 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-800">Avaliação Concluída</p>
                  <p className="text-sm text-emerald-700">Resultados calculados conforme escala DASS-21 (multiplicados por 2 para equivalência DASS-42)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className={`border-2 ${getSeverityColor(results.depressionSeverity)}`}>
              <CardContent className="p-6 text-center">
                <Brain className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                <p className="text-4xl font-bold text-slate-900">{results.depression}</p>
                <p className="text-sm text-slate-500 mt-1">Depressão</p>
                <Badge className={`mt-3 ${getSeverityColor(results.depressionSeverity)}`}>
                  {results.depressionSeverity}
                </Badge>
                <p className="text-xs text-slate-400 mt-2">Escala: 0-42</p>
              </CardContent>
            </Card>

            <Card className={`border-2 ${getSeverityColor(results.anxietySeverity)}`}>
              <CardContent className="p-6 text-center">
                <Activity className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <p className="text-4xl font-bold text-slate-900">{results.anxiety}</p>
                <p className="text-sm text-slate-500 mt-1">Ansiedade</p>
                <Badge className={`mt-3 ${getSeverityColor(results.anxietySeverity)}`}>
                  {results.anxietySeverity}
                </Badge>
                <p className="text-xs text-slate-400 mt-2">Escala: 0-42</p>
              </CardContent>
            </Card>

            <Card className={`border-2 ${getSeverityColor(results.stressSeverity)}`}>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-10 h-10 text-purple-500 mx-auto mb-3" />
                <p className="text-4xl font-bold text-slate-900">{results.stress}</p>
                <p className="text-sm text-slate-500 mt-1">Estresse</p>
                <Badge className={`mt-3 ${getSeverityColor(results.stressSeverity)}`}>
                  {results.stressSeverity}
                </Badge>
                <p className="text-xs text-slate-400 mt-2">Escala: 0-42</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-500" />
                Visualização dos Resultados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 42]} />
                    <Tooltip 
                      formatter={(value: number) => [`Pontuação: ${value}`, '']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <ReferenceLine y={14} stroke="#10B981" strokeDasharray="3 3" label="Normal" />
                    <Bar 
                      dataKey="score" 
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Total Score */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Pontuação Total DASS-21</p>
                  <p className="text-3xl font-bold text-slate-900">{results.total}/126</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Data da Avaliação</p>
                  <p className="font-medium text-slate-900">
                    {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interpretation Guide */}
          <Card className="mb-6 bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Guia de Interpretação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900 mb-2">Depressão</p>
                  <ul className="space-y-1 text-slate-600">
                    <li>Normal: 0-9</li>
                    <li>Leve: 10-13</li>
                    <li>Moderado: 14-20</li>
                    <li>Grave: 21-27</li>
                    <li>Ext. Grave: 28+</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 mb-2">Ansiedade</p>
                  <ul className="space-y-1 text-slate-600">
                    <li>Normal: 0-7</li>
                    <li>Leve: 8-9</li>
                    <li>Moderado: 10-14</li>
                    <li>Grave: 15-19</li>
                    <li>Ext. Grave: 20+</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 mb-2">Estresse</p>
                  <ul className="space-y-1 text-slate-600">
                    <li>Normal: 0-14</li>
                    <li>Leve: 15-18</li>
                    <li>Moderado: 19-25</li>
                    <li>Grave: 26-33</li>
                    <li>Ext. Grave: 34+</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCurrentView('dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-teal-500 to-purple-600"
              onClick={() => {
                // In real implementation, generate PDF report
                console.log('Generating report...');
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório PDF
            </Button>
          </div>
        </main>
      </div>
    );
  }

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
                <h1 className="text-lg font-bold text-slate-900">Avaliação DASS-21</h1>
                <p className="text-xs text-slate-500">Escala de Depressão, Ansiedade e Estresse</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Questão {currentQuestion + 1} de {dass21Questions.length}</span>
            <span>{answeredCount} respondidas</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Question Card */}
        <Card className="min-h-[400px]">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={`capitalize ${
                  dass21Questions[currentQuestion].category === 'depression' ? 'border-rose-300 text-rose-700 bg-rose-50' :
                  dass21Questions[currentQuestion].category === 'anxiety' ? 'border-amber-300 text-amber-700 bg-amber-50' :
                  'border-purple-300 text-purple-700 bg-purple-50'
                }`}
              >
                {dass21Questions[currentQuestion].category === 'depression' && 'Depressão'}
                {dass21Questions[currentQuestion].category === 'anxiety' && 'Ansiedade'}
                {dass21Questions[currentQuestion].category === 'stress' && 'Estresse'}
              </Badge>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {dass21Questions[currentQuestion].text}
            </CardTitle>
            <CardDescription>
              Por favor, leia cada afirmação e selecione a opção que indica 
              quanto ela se aplicou a você na última semana.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {responseOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    answers[dass21Questions[currentQuestion].id] === option.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[dass21Questions[currentQuestion].id] === option.value
                        ? 'border-teal-500 bg-teal-500'
                        : 'border-slate-300'
                    }`}>
                      {answers[dass21Questions[currentQuestion].id] === option.value && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${
                        answers[dass21Questions[currentQuestion].id] === option.value
                          ? 'text-teal-900'
                          : 'text-slate-700'
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-sm text-slate-500">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentQuestion === dass21Questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isLoading || answeredCount < dass21Questions.length}
              className="bg-gradient-to-r from-teal-500 to-purple-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalizar Avaliação
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              disabled={!answers[dass21Questions[currentQuestion].id]}
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Instructions */}
        <Card className="mt-6 bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Instruções</p>
                <p className="text-sm text-amber-700 mt-1">
                  Responda com base em como você se sentiu na última semana. 
                  Não há respostas certas ou erradas. Seja o mais honesto possível 
                  para obter uma avaliação precisa. Os resultados serão multiplicados 
                  por 2 para equivalência com a escala DASS-42 completa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DASS21Form;
