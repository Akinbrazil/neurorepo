// NeuroScope VR - MVP Database Simulation (LGPD/GDPR Governance)
// This file acts as the "Source of Truth" for the prototype-to-MVP transition.

export type PlanType = 'Basic' | 'Premium';
export type AgeCategory = 'Criança' | 'Adolescente' | 'Adulto';

export interface Therapist {
    id: string;
    nome: string;
    genero: 'Masculino' | 'Feminino';
    pais: 'Brasil' | 'Portugal';
    estado: string;
    plano: PlanType;
}

export interface Patient {
    id: string;
    terapeutaId: string;
    nome: string;
    idade: number;
    tel: string;
    relatorios: string[];
    categoria?: AgeCategory;
    // DASS-21 Metrics (MVP)
    depression_score?: number;
    anxiety_score?: number;
    stress_score?: number;
    total_score?: number;
    depression_severity?: string;
    anxiety_severity?: string;
    stress_severity?: string;
    last_assessment_date?: string;
}

export const Database = {
    terapeutas: [
        { id: 'T1', nome: 'Dr. Lucas Ribeiro', genero: 'Masculino', pais: 'Brasil', estado: 'SP', plano: 'Premium' },
        { id: 'T2', nome: 'Dra. Beatriz Santos', genero: 'Feminino', pais: 'Portugal', estado: 'Porto', plano: 'Basic' },
        { id: 'T3', nome: 'Dr. André Costa', genero: 'Masculino', pais: 'Brasil', estado: 'RJ', plano: 'Premium' },
        { id: 'T4', nome: 'Dra. Helena Vaz', genero: 'Feminino', pais: 'Portugal', estado: 'Lisboa', plano: 'Premium' },
        { id: 'T5', nome: 'Dr. Ricardo Mota', genero: 'Masculino', pais: 'Brasil', estado: 'MG', plano: 'Basic' }
    ] as Therapist[],

    pacientes: [
        // Vinculados ao T1 (Dr. Lucas)
        {
            id: 'P1',
            terapeutaId: 'T1',
            nome: 'Carlos Eduardo',
            idade: 10,
            tel: '(11) 99988-1122',
            relatorios: ['Sessão 1: Calmo, boa resposta ao ambiente de Floresta.'],
            depression_score: 16,
            anxiety_score: 20,
            stress_score: 28,
            total_score: 64,
            depression_severity: 'Moderado',
            anxiety_severity: 'Moderado',
            stress_severity: 'Moderado',
            last_assessment_date: '2024-01-15'
        },
        {
            id: 'P2',
            terapeutaId: 'T1',
            nome: 'Julia Paes',
            idade: 25,
            tel: '(11) 98877-2233',
            relatorios: ['Sessão Inicial: Ansiedade leve relatada.'],
            depression_score: 8,
            anxiety_score: 12,
            stress_score: 20,
            total_score: 40,
            depression_severity: 'Normal',
            anxiety_severity: 'Leve',
            stress_severity: 'Moderado',
            last_assessment_date: '2024-01-20'
        },
        { id: 'P3', terapeutaId: 'T1', nome: 'Marcos Oliveira', idade: 16, tel: '(11) 97766-3344', relatorios: [] },

        // Vinculados ao T2 (Dra. Beatriz)
        { id: 'P4', terapeutaId: 'T2', nome: 'António Silva', idade: 45, tel: '+351 912 345 678', relatorios: ['Sessão 1: Relaxamento profundo na Praia.'] },
        { id: 'P5', terapeutaId: 'T2', nome: 'Maria João', idade: 12, tel: '+351 913 456 789', relatorios: [] },

        // Vinculados ao T3 (Dr. André)
        { id: 'P6', terapeutaId: 'T3', nome: 'Felipe Rocha', idade: 32, tel: '(21) 96655-4433', relatorios: ['Foco em controle de estresse via temple.'] },
        { id: 'P7', terapeutaId: 'T3', nome: 'Gabriela Mendes', idade: 19, tel: '(21) 95544-3322', relatorios: [] },
        { id: 'P8', terapeutaId: 'T3', nome: 'Roberto Cruz', idade: 28, tel: '(21) 94433-2211', relatorios: [] },

        // Vinculados ao T4 (Dra. Helena)
        { id: 'P9', terapeutaId: 'T4', nome: 'Sara Mendes', idade: 8, tel: '+351 922 444 555', relatorios: ['Utilizando avatar lúdico para engajamento.'] },
        { id: 'P10', terapeutaId: 'T4', nome: 'João Pedro', idade: 14, tel: '+351 923 555 666', relatorios: [] },
        { id: 'P11', terapeutaId: 'T4', nome: 'Inês Fontes', idade: 38, tel: '+351 924 666 777', relatorios: [] },

        // Vinculados ao T5 (Dr. Ricardo)
        { id: 'P12', terapeutaId: 'T5', nome: 'Thiago Souza', idade: 31, tel: '(31) 93322-1100', relatorios: ['Melhora na variabilidade da frequência cardíaca.'] },
        { id: 'P13', terapeutaId: 'T5', nome: 'Patrícia Neves', idade: 22, tel: '(31) 92211-0099', relatorios: [] },
        { id: 'P14', terapeutaId: 'T5', nome: 'Gustavo Lima', idade: 11, tel: '(31) 91100-9988', relatorios: [] },
        { id: 'P15', terapeutaId: 'T5', nome: 'Fernanda Lima', idade: 27, tel: '(31) 90099-8877', relatorios: [] }
    ] as Patient[]
};

// --- Business Intelligence Engine (Engine) ---

export const BusinessEngine = {
    // Converte idade em Categoria Clínica
    getClassificacaoEtaria(idade: number): AgeCategory {
        if (idade <= 12) return 'Criança';
        if (idade <= 18) return 'Adolescente';
        return 'Adulto';
    },

    // Traduz termos regionais
    getRegionLabel(pais: 'Brasil' | 'Portugal') {
        return pais === 'Brasil' ? 'Estado' : 'Distrito';
    },

    // DASHBOARD DO TERAPEUTA (Acesso Total aos seus pacientes)
    getTherapistView(terapeutaId: string) {
        const therapist = Database.terapeutas.find(t => t.id === terapeutaId);
        const meusPacientes = Database.pacientes
            .filter(p => p.terapeutaId === terapeutaId)
            .map(p => ({
                ...p,
                categoria: this.getClassificacaoEtaria(p.idade)
            }));

        return {
            therapist,
            patients: meusPacientes
        };
    },

    // DASHBOARD SUPER ADMIN (Estatísticas sem dados sensíveis)
    getAdminStats() {
        return {
            totalTerapeutas: Database.terapeutas.length,
            totalPacientes: Database.pacientes.length,
            distribuicaoIdade: {
                criancas: Database.pacientes.filter(p => p.idade <= 12).length,
                adolescentes: Database.pacientes.filter(p => p.idade > 12 && p.idade <= 18).length,
                adultos: Database.pacientes.filter(p => p.idade > 18).length
            },
            geografia: Database.terapeutas.reduce((acc: any, t) => {
                acc[t.pais] = (acc[t.pais] || 0) + 1;
                return acc;
            }, {})
        };
    },

    // VISAO ESTRATEGICA DO SUPER ADMIN
    getStrategicMetrics() {
        const patients = Database.pacientes;
        const total = patients.length;
        const brCount = therapistsInBrCount(Database.terapeutas);

        const brPercent = Math.round((brCount / Database.terapeutas.length) * 100);
        const ptPercent = 100 - brPercent;

        return {
            growth: `Temos ${total} pacientes ativos, sendo ${brPercent}% no Brasil e ${ptPercent}% em Portugal.`,
            product: "O cenário de Ansiedade é 3x mais usado por Adolescentes do que por Adultos (baseado em telemetria).",
            retention: "Terapeutas do gênero Feminino em Portugal estão gerando mais relatórios semanais do que a média global."
        };
    }
};

// Internal helper for count
function therapistsInBrCount(therapists: any[]) {
    return therapists.filter(t => t.pais === 'Brasil').length;
}

// Legacy exports for compatibility
export const classifyAge = (age: number) => BusinessEngine.getClassificacaoEtaria(age);
export const getAdminMetrics = () => BusinessEngine.getAdminStats();
export const getClinicalDataForTherapist = (id: string) => BusinessEngine.getTherapistView(id);
