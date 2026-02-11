// NeuroScope VR - Session Cockpit (Digital Twin & Real-time Control - Vision A)
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Mic, MicOff, Volume2, VolumeX,
    Activity, Eye, Headset, AlertCircle, CheckCircle,
    Maximize2, Minimize2, ArrowLeft
} from 'lucide-react';
import { BusinessEngine } from '@/lib/db-simulation';
import { useAuth } from '@/contexts/AuthContext';

interface SessionCockpitProps {
    patientId: string;
    therapistId: string;
    sessionId: string;
}

const SessionCockpit: React.FC<SessionCockpitProps> = ({
    patientId,
    therapistId,
    sessionId
}) => {
    const { setCurrentView } = useAuth();
    const [intensity, setIntensity] = useState(1);
    const [isMicActive, setIsMicActive] = useState(false);
    const [isListening, setIsListening] = useState(true);
    const [notes, setNotes] = useState('');
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [liveSession, setLiveSession] = useState<any>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const recognitionRef = useRef<any>(null);

    // Polling para buscar dados da sessão ao vivo
    useEffect(() => {
        const interval = setInterval(() => {
            const sessions = BusinessEngine.getActiveSessionsForTherapist(therapistId);
            const current = sessions.find(s => s.patientId === patientId);
            setLiveSession(current);
        }, 1000);

        return () => clearInterval(interval);
    }, [therapistId, patientId]);

    // Web Speech API para transcrição
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'pt-BR';

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptPiece = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        setTranscript(prev => prev + transcriptPiece + ' ');
                    } else {
                        interimTranscript += transcriptPiece;
                    }
                }
            };
        }
    }, []);

    const handleToggleRecording = () => {
        if (!recognitionRef.current) return;

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsRecording(!isRecording);
    };

    const handleIntensityChange = (value: number[]) => {
        const newIntensity = value[0] as 1 | 2 | 3;
        setIntensity(newIntensity);
        // Aqui você enviaria via Socket.io para o VREnvironment
        console.log(`[COCKPIT] Ajustando intensidade para: ${newIntensity}`);
    };

    const handleEndSession = () => {
        BusinessEngine.endLiveSession(patientId);
        window.close();
    };

    const getComfortColor = (level: string) => {
        switch (level) {
            case 'comfortable': return 'bg-emerald-500';
            case 'uncomfortable': return 'bg-rose-500 animate-pulse';
            default: return 'bg-amber-500';
        }
    };

    const getComfortLabel = (level: string) => {
        switch (level) {
            case 'comfortable': return 'Excelente';
            case 'uncomfortable': return 'Desconforto';
            default: return 'Neutro';
        }
    };

    return (
        <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setCurrentView('dashboard')}
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Headset className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg">Cockpit de Supervisão</h1>
                        <p className="text-slate-400 text-sm">Sessão: {sessionId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {liveSession && (
                        <Badge className={`${getComfortColor(liveSession.comfortLevel)} text-white border-none px-4 py-2`}>
                            <Activity className="w-4 h-4 mr-2" />
                            {getComfortLabel(liveSession.comfortLevel)}
                        </Badge>
                    )}
                    <Button
                        variant="destructive"
                        onClick={handleEndSession}
                        className="bg-rose-600 hover:bg-rose-700"
                    >
                        Encerrar Sessão
                    </Button>
                </div>
            </header>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
                {/* Left Panel - Controls */}
                <div className="col-span-3 space-y-4 overflow-y-auto">
                    {/* Audio Controls */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-white text-sm flex items-center gap-2">
                                <Volume2 className="w-4 h-4" />
                                Controles de Áudio
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Button
                                    variant={isMicActive ? 'default' : 'outline'}
                                    className={`flex-1 ${isMicActive ? 'bg-teal-600 hover:bg-teal-700' : 'border-slate-600 text-slate-300'}`}
                                    onClick={() => setIsMicActive(!isMicActive)}
                                >
                                    {isMicActive ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />}
                                    Falar
                                </Button>
                                <Button
                                    variant={isListening ? 'default' : 'outline'}
                                    className={`flex-1 ${isListening ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-slate-300'}`}
                                    onClick={() => setIsListening(!isListening)}
                                >
                                    {isListening ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                                    Ouvir
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Intensity Control */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-white text-sm flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                Intensidade do Ambiente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Simples</span>
                                    <span>Moderado</span>
                                    <span>Intenso</span>
                                </div>
                                <Slider
                                    value={[intensity]}
                                    onValueChange={handleIntensityChange}
                                    min={1}
                                    max={3}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="text-center">
                                    <Badge className="bg-teal-600 text-white">
                                        Nível {intensity}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transcription */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white text-sm flex items-center gap-2">
                                    <Mic className="w-4 h-4" />
                                    Transcrição
                                </CardTitle>
                                <Button
                                    size="sm"
                                    variant={isRecording ? 'destructive' : 'outline'}
                                    onClick={handleToggleRecording}
                                    className="h-7 text-xs"
                                >
                                    {isRecording ? 'Parar' : 'Gravar'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-32 overflow-y-auto bg-slate-900 rounded-lg p-3 text-xs text-slate-300 font-mono">
                                {transcript || 'Aguardando gravação...'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Center - Digital Twin / Mirroring */}
                <div className="col-span-6 flex flex-col">
                    <Card className="flex-1 bg-slate-800 border-slate-700 overflow-hidden">
                        <CardHeader className="pb-3 border-b border-slate-700">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white text-sm flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    Visão do Paciente (Digital Twin)
                                </CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 border-slate-600 text-slate-300"
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                >
                                    {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 h-full flex items-center justify-center bg-slate-900">
                            <div className="text-center text-slate-500">
                                <Eye className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-sm">Espelhamento de câmera em desenvolvimento</p>
                                <p className="text-xs mt-2">WebRTC ou Socket.io para transmissão de orientação</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel - Notes */}
                <div className="col-span-3 flex flex-col">
                    <Card className="flex-1 bg-slate-800 border-slate-700 flex flex-col">
                        <CardHeader className="pb-3 border-b border-slate-700">
                            <CardTitle className="text-white text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Anotações Clínicas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-4 flex flex-col">
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Digite suas observações durante a sessão..."
                                className="flex-1 bg-slate-900 border-slate-700 text-slate-200 resize-none"
                            />
                            <Button
                                className="mt-4 bg-teal-600 hover:bg-teal-700"
                                onClick={() => console.log('[COCKPIT] Salvando notas:', notes)}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Salvar Anotações
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SessionCockpit;
