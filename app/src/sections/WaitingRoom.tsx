// NeuroScope VR - Sala de Espera (Isolated Patient Portal - Vision C)
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Clock, Headset, CheckCircle, Loader2 } from 'lucide-react';

interface WaitingRoomProps {
    therapistName?: string;
    clinicName?: string;
    environment?: string;
    sessionToken?: string;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
    therapistName = 'Seu Terapeuta',
    clinicName = 'NeuroScope VR',
    environment = 'Floresta Calma',
    sessionToken
}) => {
    const [isReady, setIsReady] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        // Simula o pré-carregamento de assets
        const interval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsReady(true);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);

        return () => clearInterval(interval);
    }, []);

    const handleEnterVR = () => {
        // Redireciona para o ambiente VR com o token
        const params = new URLSearchParams(window.location.search);
        const patientId = params.get('patientId');
        const therapistId = params.get('therapistId');
        const env = params.get('env') || environment;

        window.location.href = `/?view=vr-environment&room=${sessionToken}&env=${env}&patientId=${patientId}&therapistId=${therapistId}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-purple-600 rounded-3xl mb-4 shadow-lg">
                        <Brain className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{clinicName}</h1>
                    <p className="text-slate-600">Terapia de Realidade Virtual</p>
                </div>

                {/* Main Card */}
                <Card className="shadow-2xl border-none overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-teal-500 to-purple-600 text-white p-6">
                        <CardTitle className="text-2xl font-bold text-center">
                            Sessão de Relaxamento Guiado
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        {/* Session Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <Headset className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Terapeuta</p>
                                    <p className="font-semibold text-slate-900">{therapistName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Duração</p>
                                    <p className="font-semibold text-slate-900">15 minutos</p>
                                </div>
                            </div>
                        </div>

                        {/* Environment */}
                        <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-100">
                            <p className="text-sm text-slate-600 mb-1">Ambiente Selecionado</p>
                            <p className="text-lg font-bold text-teal-700">{environment}</p>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-teal-500" />
                                Antes de Começar
                            </h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-teal-500 mt-0.5">•</span>
                                    <span>Sente-se confortavelmente em um local tranquilo</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-teal-500 mt-0.5">•</span>
                                    <span>Use fones de ouvido para melhor imersão</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-teal-500 mt-0.5">•</span>
                                    <span>Garanta uma conexão Wi-Fi estável</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-teal-500 mt-0.5">•</span>
                                    <span>Permita o acesso aos sensores quando solicitado</span>
                                </li>
                            </ul>
                        </div>

                        {/* Loading Progress */}
                        {!isReady && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Carregando ambiente...</span>
                                    <span className="font-semibold text-teal-600">{loadingProgress}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-teal-500 to-purple-600 transition-all duration-300"
                                        style={{ width: `${loadingProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Enter Button */}
                        <Button
                            onClick={handleEnterVR}
                            disabled={!isReady}
                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 shadow-lg"
                        >
                            {isReady ? (
                                <>
                                    <Headset className="w-5 h-5 mr-2" />
                                    Entrar no Ambiente
                                </>
                            ) : (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Preparando...
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    Sessão segura e criptografada • {clinicName}
                </p>
            </div>
        </div>
    );
};

export default WaitingRoom;
