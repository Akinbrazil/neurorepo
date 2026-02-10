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

// --- Helpers de Governança ---

/**
 * Classifica a faixa etária conforme política clínica
 */
export const classifyAge = (age: number): AgeCategory => {
    if (age < 13) return 'Criança';
    if (age < 18) return 'Adolescente';
    return 'Adulto';
};

/**
 * Agregadores de Negócio para o Super Admin (CEO)
 * Garante que nomes e dados sensíveis dos pacientes NÃO vazem para o CRM Adm.
 */
export const getAdminMetrics = () => {
    const therapists = Database.terapeutas;
    const patients = Database.pacientes;

    // Distribuição Geográfica
    const geoDist = therapists.reduce((acc: any, t) => {
        acc[t.pais] = (acc[t.pais] || 0) + 1;
        return acc;
    }, {});

    // Distribuição por Plano
    const planDist = therapists.reduce((acc: any, t) => {
        acc[t.plano] = (acc[t.plano] || 0) + 1;
        return acc;
    }, {});

    // Volume total de pacientes por categoria (sem nomes)
    const patientCategories = patients.reduce((acc: any, p) => {
        const cat = classifyAge(p.idade);
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    return {
        totalTherapists: therapists.length,
        totalPatients: patients.length,
        geo: geoDist,
        plans: planDist,
        categories: patientCategories,
        activeSessions: 42 // Simulação de tempo real fixa por enquanto
    };
};

/**
 * Filtro Clínico para Terapeutas
 * Retorna dados detalhados apenas dos pacientes vinculados ao ID solicitado.
 */
export const getClinicalDataForTherapist = (therapistId: string) => {
    const therapist = Database.terapeutas.find(t => t.id === therapistId);
    const myPatients = Database.pacientes
        .filter(p => p.terapeutaId === therapistId)
        .map(p => ({
            ...p,
            categoria: classifyAge(p.idade)
        }));

    return {
        therapist,
        patients: myPatients
    };
};
