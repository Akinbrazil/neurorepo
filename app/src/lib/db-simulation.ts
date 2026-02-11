// NeuroScope VR - MVP Database Simulation (LGPD/GDPR Governance)
// This file acts as the "Source of Truth" for the prototype-to-MVP transition.

export type PlanType = 'Basic' | 'Premium';
export type AgeCategory = 'Criança' | 'Adolescente' | 'Adulto';

export interface Clinic {
    id: string;
    nome: string;
    cnpj_nif: string;
    plano: PlanType;
    pais: 'Brasil' | 'Portugal';
}

export interface Manager {
    id: string;
    clinicId: string;
    nome: string;
    email: string;
    role: 'Admin';
}

export interface Therapist {
    id: string;
    clinicId?: string; // Vinculado a uma clínica no SaaS
    nome: string;
    genero: 'Masculino' | 'Feminino';
    pais: 'Brasil' | 'Portugal';
    estado: string;
    plano: PlanType;
}

export type PatientStatus = 'Em tratamento' | 'Alta' | 'Pausado';

export interface Patient {
    id: string;
    terapeutaId: string;
    clinicId?: string;
    nome: string;
    idade: number;
    tel: string;
    email: string;
    cidCode?: string; // Vision B: CID-10 Support
    status: PatientStatus;
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

export type ComfortLevel = 'comfortable' | 'neutral' | 'uncomfortable';

export interface LiveSession {
    sessionId: string;
    patientId: string;
    therapistId: string;
    status: 'active' | 'ended';
    comfortLevel: ComfortLevel;
    lastUpdate: string;
    environment: string;
}

export const Database = {
    clinicas: [
        { id: 'C1', nome: 'NeuroCenter SP', cnpj_nif: '12.345.678/0001-99', plano: 'Premium', pais: 'Brasil' },
        { id: 'C2', nome: 'Clínica Luz Lisboa', cnpj_nif: '500123456', plano: 'Premium', pais: 'Portugal' }
    ] as Clinic[],

    gestores: [
        { id: 'M1', clinicId: 'C1', nome: 'Sabin CEO', email: 'sabin@neurocenter.com', role: 'Admin' }
    ] as Manager[],

    terapeutas: [
        { id: 'T1', clinicId: 'C1', nome: 'Dr. Lucas Ribeiro', genero: 'Masculino', pais: 'Brasil', estado: 'SP', plano: 'Premium' },
        { id: 'T2', clinicId: 'C2', nome: 'Dra. Beatriz Santos', genero: 'Feminino', pais: 'Portugal', estado: 'Porto', plano: 'Basic' },
        { id: 'T3', clinicId: 'C1', nome: 'Dr. André Costa', genero: 'Masculino', pais: 'Brasil', estado: 'RJ', plano: 'Premium' },
        { id: 'T4', nome: 'Dra. Helena Vaz', genero: 'Feminino', pais: 'Portugal', estado: 'Lisboa', plano: 'Premium' },
        { id: 'T5', nome: 'Dr. Ricardo Mota', genero: 'Masculino', pais: 'Brasil', estado: 'MG', plano: 'Basic' }
    ] as Therapist[],

    pacientes: [
        // Vinculados ao T1 (Dr. Lucas)
        {
            id: 'P1',
            terapeutaId: 'T1',
            clinicId: 'C1',
            nome: 'Carlos Eduardo',
            idade: 10,
            tel: '(11) 99988-1122',
            email: 'carlos@email.com',
            cidCode: 'F41.1', // Ansiedade Generalizada
            status: 'Em tratamento',
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
            clinicId: 'C1',
            nome: 'Julia Paes',
            idade: 25,
            tel: '(11) 98877-2233',
            email: 'julia@email.com',
            cidCode: 'F32.9', // Depressão não especificada
            status: 'Em tratamento',
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
        { id: 'P3', terapeutaId: 'T1', clinicId: 'C1', nome: 'Marcos Oliveira', idade: 16, tel: '(11) 97766-3344', email: 'marcos@email.com', cidCode: 'F41.0', status: 'Pausado', relatorios: [] },

        // Vinculados ao T2 (Dra. Beatriz)
        { id: 'P4', terapeutaId: 'T2', nome: 'António Silva', idade: 45, tel: '+351 912 345 678', email: 'antonio@email.pt', relatorios: ['Sessão 1: Relaxamento profundo na Praia.'] },
        { id: 'P5', terapeutaId: 'T2', nome: 'Maria João', idade: 12, tel: '+351 913 456 789', email: 'maria@email.pt', relatorios: [] },

        // Vinculados ao T3 (Dr. André)
        { id: 'P6', terapeutaId: 'T3', nome: 'Felipe Rocha', idade: 32, tel: '(21) 96655-4433', email: 'felipe@email.com', relatorios: ['Foco em controle de estresse via temple.'] },
        { id: 'P7', terapeutaId: 'T3', nome: 'Gabriela Mendes', idade: 19, tel: '(21) 95544-3322', email: 'gabriela@email.com', relatorios: [] },
        { id: 'P8', terapeutaId: 'T3', nome: 'Roberto Cruz', idade: 28, tel: '(21) 94433-2211', email: 'roberto@email.com', relatorios: [] },

        // Vinculados ao T4 (Dra. Helena)
        { id: 'P9', terapeutaId: 'T4', nome: 'Sara Mendes', idade: 8, tel: '+351 922 444 555', email: 'sara@email.pt', relatorios: ['Utilizando avatar lúdico para engajamento.'] },
        { id: 'P10', terapeutaId: 'T4', nome: 'João Pedro', idade: 14, tel: '+351 923 555 666', email: 'joao@email.pt', relatorios: [] },
        { id: 'P11', terapeutaId: 'T4', nome: 'Inês Fontes', idade: 38, tel: '+351 924 666 777', email: 'ines@email.pt', relatorios: [] },

        // Vinculados ao T5 (Dr. Ricardo)
        { id: 'P12', terapeutaId: 'T5', nome: 'Thiago Souza', idade: 31, tel: '(31) 93322-1100', email: 'thiago@email.com', relatorios: ['Melhora na variabilidade da frequência cardíaca.'] },
        { id: 'P13', terapeutaId: 'T5', nome: 'Patrícia Neves', idade: 22, tel: '(31) 92211-0099', email: 'patricia@email.com', relatorios: [] },
        { id: 'P14', terapeutaId: 'T5', nome: 'Gustavo Lima', idade: 11, tel: '(31) 91100-9988', email: 'gustavo@email.com', relatorios: [] },
        { id: 'P15', terapeutaId: 'T5', nome: 'Fernanda Lima', idade: 27, tel: '(31) 90099-8877', email: 'fernanda@email.com', relatorios: [] }
    ] as Patient[],

    // MVP Real-time simulation state
    liveSessions: [] as LiveSession[]
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
    },

    // MONITORAMENTO DE SESSOES (LOG ADMIN)
    registrarLogSessao(sessionId: string, ambiente: string) {
        console.log(`[LOG ADMIN] Sessão ${sessionId} iniciada. Ambiente: ${ambiente}.`);
        // Aqui futuramente persistimos no Supabase
    },

    // DASHBOARD DO GESTOR (Visão de Produtividade da Clínica)
    getManagerView(clinicId: string) {
        const clinica = Database.clinicas.find(c => c.id === clinicId);
        const terapeutasDaClinica = Database.terapeutas.filter(t => t.clinicId === clinicId);
        const pacientesDaClinica = Database.pacientes.filter(p => p.clinicId === clinicId);

        return {
            clinica,
            totalTerapeutas: terapeutasDaClinica.length,
            totalPacientes: pacientesDaClinica.length,
            produtividade: terapeutasDaClinica.map(t => ({
                nome: t.nome,
                pacientes: Database.pacientes.filter(p => p.terapeutaId === t.id).length
            }))
        };
    },

    // FILTROS AVANÇADOS (Vision B)
    getPatientsByPathology(terapeutaId: string, pathology: string) {
        return Database.pacientes.filter(p =>
            p.terapeutaId === terapeutaId &&
            p.cidCode?.startsWith(pathology)
        );
    },

    getPatientsByStatus(terapeutaId: string, status: PatientStatus) {
        return Database.pacientes.filter(p =>
            p.terapeutaId === terapeutaId &&
            p.status === status
        );
    },

    // --- TELEMETRIA DE CONFORTO (Vision A) ---

    // Atualiza ou cria uma sessão ao vivo
    updateLiveComfort(patientId: string, therapistId: string, level: ComfortLevel, environment: string) {
        const sessionId = `live-${patientId}`;
        const existingIdx = Database.liveSessions.findIndex(s => s.sessionId === sessionId);

        const update: LiveSession = {
            sessionId,
            patientId,
            therapistId,
            status: 'active',
            comfortLevel: level,
            lastUpdate: new Date().toISOString(),
            environment
        };

        if (existingIdx > -1) {
            Database.liveSessions[existingIdx] = update;
        } else {
            Database.liveSessions.push(update);
        }

        // Também registra no Log Admin (Segregação: CEO vê que houve update, mas não o dado sensível aqui)
        this.registrarLogSessao(sessionId, `ComfortUpdate: ${level}`);

        return update;
    },

    // Busca sessões ativas para um terapeuta
    getActiveSessionsForTherapist(therapistId: string) {
        return Database.liveSessions.filter(s => s.therapistId === therapistId && s.status === 'active');
    },

    // Encerra uma sessão ao vivo
    endLiveSession(patientId: string) {
        const sessionId = `live-${patientId}`;
        const idx = Database.liveSessions.findIndex(s => s.sessionId === sessionId);
        if (idx > -1) {
            Database.liveSessions[idx].status = 'ended';
            console.log(`[LOG ADMIN] Sessão ${sessionId} encerrada.`);
        }
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
