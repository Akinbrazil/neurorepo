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
    Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BusinessEngine, Database } from '@/lib/db-simulation';
import type { Therapist } from '@/lib/db-simulation';

const AdminCRM: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [simPais, setSimPais] = useState<'Brasil' | 'Portugal'>('Brasil');
    const metrics = BusinessEngine.getAdminStats();
    const insights = BusinessEngine.getStrategicMetrics();

    // Simulated data for the CEO Dashboard based on the new simulation
    const stats = [
        { label: 'Total de Terapeutas', value: metrics.totalTerapeutas.toString(), icon: Users, trend: 'Global', trendUp: true },
        { label: 'Pacientes na Base', value: metrics.totalPacientes.toString(), icon: Activity, trend: 'Monitorados', trendUp: true },
        { label: 'Compliance LGPD', value: '100%', icon: Shield, trend: 'Auditado', trendUp: true },
        { label: 'Distribuição (BR/PT)', value: `${metrics.geografia['Brasil'] || 0}/${metrics.geografia['Portugal'] || 0}`, icon: Globe, trend: 'Países', trendUp: true },
    ];

    const recentLogins = Database.terapeutas.map((t: Therapist, i: number) => ({
        id: i + 1,
        name: t.nome,
        role: t.plano === 'Premium' ? 'Master' : 'Basic',
        ip: `191.${242 - i}.12.${42 + i}`,
        device: i % 2 === 0 ? 'Desktop (Chrome)' : 'VR Headset (Quest 3)',
        time: `${i + 2} mins ago`
    }));

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 italic">Governança CEO</h1>
                    <p className="text-slate-500">Métricas de Negócio & Distribuição NeuroScope VR</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline">Relatório LGPD</Button>
                    <Button className="bg-gradient-to-r from-teal-500 to-purple-600">Exportar Dados BI</Button>
                </div>
            </div>

            {/* Strategic Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-teal-500/10 to-purple-600/10 border-teal-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-teal-800 uppercase flex items-center gap-2">
                            <ArrowUpRight className="w-4 h-4" /> Crescimento
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700 font-medium">{insights.growth}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-teal-500/10 border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-blue-800 uppercase flex items-center gap-2">
                            <Monitor className="w-4 h-4" /> Produto
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700 font-medium">{insights.product}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-rose-600/10 border-purple-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-purple-800 uppercase flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Retenção
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700 font-medium">{insights.retention}</p>
                    </CardContent>
                </Card>
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
                                <div className={`flex items-center text-xs font-medium text-slate-400`}>
                                    {stat.trend}
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

                {/* System Health / Dynamic UI Demo */}
                <div className="space-y-8">
                    <Card className="border-teal-200 bg-teal-50/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-md font-bold text-teal-900 flex items-center gap-2">
                                <Settings className="w-4 h-4" /> Simulator: Dynamic UI Engine
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Selecione o País</label>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={simPais === 'Brasil' ? 'default' : 'outline'}
                                        onClick={() => setSimPais('Brasil')}
                                        className="flex-1"
                                    >Brasil</Button>
                                    <Button
                                        size="sm"
                                        variant={simPais === 'Portugal' ? 'default' : 'outline'}
                                        onClick={() => setSimPais('Portugal')}
                                        className="flex-1"
                                    >Portugal</Button>
                                </div>
                            </div>
                            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                                <div className="space-y-1">
                                    <label id="label-regiao" className="text-xs font-bold text-teal-600 uppercase">
                                        {BusinessEngine.getRegionLabel(simPais)} de Atuação
                                    </label>
                                    <Input placeholder={`Digite o ${BusinessEngine.getRegionLabel(simPais).toLowerCase()}...`} />
                                </div>
                                <p className="text-[10px] text-slate-400 italic">
                                    * A Engine mudou a etiqueta para <b>{BusinessEngine.getRegionLabel(simPais)}</b> automaticamente.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Distribuição por Região</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Database.terapeutas.slice(0, 4).map((t: Therapist) => (
                                <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{t.estado}</p>
                                        <p className="text-[10px] text-slate-500 uppercase">{BusinessEngine.getRegionLabel(t.pais)}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">{t.pais}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

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
        </div>
    );
};

export default AdminCRM;
