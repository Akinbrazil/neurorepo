import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    Activity,
    Shield,
    Globe,
    Monitor,
    Clock,
    MoreVertical,
    Search,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const AdminCRM: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Simulated data for the CEO Dashboard
    const stats = [
        { label: 'Total de Terapeutas', value: '124', icon: Users, trend: '+12%', trendUp: true },
        { label: 'Sessões Ativas', value: '42', icon: Activity, trend: '+5%', trendUp: true },
        { label: 'Compliance LGPD', value: '100%', icon: Shield, trend: 'Estável', trendUp: true },
        { label: 'Uso de Banda (VR)', value: '1.2 TB', icon: Globe, trend: '+18%', trendUp: false },
    ];

    const recentLogins = [
        { id: 1, name: 'Dr. Roberto Santos', role: 'Therapist', ip: '191.242.12.42', device: 'Desktop (Chrome)', time: '2 mins ago' },
        { id: 2, name: 'Ana Carolina (Admin)', role: 'Admin', ip: '187.12.33.109', device: 'Desktop (Edge)', time: '15 mins ago' },
        { id: 3, name: 'Clínica Bem-Estar', role: 'Company', ip: '201.55.12.8', device: 'Mobile (Safari)', time: '45 mins ago' },
        { id: 4, name: 'Lucas Ferreira', role: 'Therapist', ip: '177.34.22.11', device: 'Desktop (Chrome)', time: '1 hour ago' },
        { id: 5, name: 'Juliana Lima', role: 'Therapist', ip: '189.22.90.55', device: 'VR Headset (Oculus)', time: '3 hours ago' },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">CRM Administrativo</h1>
                    <p className="text-slate-500">Visão Geral do CEO - Painel de Controle NeuroScope VR</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline">Exportar Relatórios</Button>
                    <Button className="bg-gradient-to-r from-teal-500 to-purple-600">Configurações Master</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-slate-200">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <stat.icon className="w-5 h-5 text-teal-600" />
                                </div>
                                <div className={`flex items-center text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {stat.trend}
                                    {stat.trendUp ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Logins List */}
                <Card className="lg:col-span-2 border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold">Monitoramento de Acessos (IP/Device)</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por nome ou IP..."
                                className="pl-10 h-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Usuário</th>
                                        <th className="px-4 py-3 font-semibold">Role</th>
                                        <th className="px-4 py-3 font-semibold">Endereço IP</th>
                                        <th className="px-4 py-3 font-semibold">Dispositivo</th>
                                        <th className="px-4 py-3 font-semibold">Acesso</th>
                                        <th className="px-4 py-3 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentLogins.map((login) => (
                                        <tr key={login.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="font-semibold text-slate-900">{login.name}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${login.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                                    login.role === 'Company' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-teal-100 text-teal-700'
                                                    }`}>
                                                    {login.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-slate-600 font-mono">{login.ip}</td>
                                            <td className="px-4 py-4 text-slate-600">
                                                <div className="flex items-center gap-2 text-xs">
                                                    {login.device.includes('Desktop') ? <Monitor className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                                                    {login.device}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                    <Clock className="w-3 h-3" />
                                                    {login.time}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* System Health */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Saúde da Infraestrutura</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 font-medium">Latência Média VR</span>
                                <span className="text-teal-600 font-bold">14ms</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full w-[14%] bg-teal-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 font-medium">Carga do Banco (Supabase)</span>
                                <span className="text-purple-600 font-bold">28%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full w-[28%] bg-purple-500" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-sm font-semibold text-slate-900 mb-3">Alertas Recentes</h4>
                            <div className="space-y-3">
                                <div className="flex gap-3 text-xs p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-100">
                                    <Shield className="w-4 h-4 shrink-0" />
                                    <p>Múltiplas tentativas de login bloqueadas no IP 45.12.33.109</p>
                                </div>
                                <div className="flex gap-3 text-xs p-3 bg-teal-50 text-teal-800 rounded-lg border border-teal-100">
                                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                                    <p>Novo pico de acesso simultâneo: 65 usuários às 14:00</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminCRM;
