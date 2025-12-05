// Fonte de dados para as classificações tributárias da Reforma (2026+)
// VERSÃO AUDITADA: Consolidação completa da lista detalhada CNAE x NBS.
// Inclui todas as variações de reduções (0%, 30%, 40%, 50%, 60%, 70%, 100%).

export interface CnaeClass2026 {
    cClass: string;
    description: string;
    ibsReduction: number; // Percentual de redução
    cbsReduction: number; // Percentual de redução
}

export interface CnaeRelationship2026 {
    itemLC116: string;
    descriptionLC116: string;
    nationalCode: string;
    cnae: string;
    nbs: string;
    nbsDescription: string;
    cClassTrib: string;
}

/**
 * Classes Tributárias baseadas nos percentuais de redução da Reforma (EC 132/PLP 68).
 */
export const CNAE_CLASSES_2026: CnaeClass2026[] = [
    { cClass: '000_PADRAO', description: 'Padrão (Sem Redução)', ibsReduction: 0, cbsReduction: 0 },
    { cClass: '030_INTEL',  description: 'Profissões Intelectuais / Outros (30% Redução)', ibsReduction: 30, cbsReduction: 30 },
    { cClass: '040_TURISM', description: 'Hotelaria, Parques, Turismo (40% Redução)', ibsReduction: 40, cbsReduction: 40 },
    { cClass: '050_CONST',  description: 'Construção Civil e Imobiliário (50% Redução)', ibsReduction: 50, cbsReduction: 50 },
    { cClass: '060_SAUDE',  description: 'Saúde, Educação, Transportes, Software, Agro (60% Redução)', ibsReduction: 60, cbsReduction: 60 },
    { cClass: '070_EVENT',  description: 'Eventos e Agenciamento (70% Redução)', ibsReduction: 70, cbsReduction: 70 },
    { cClass: '100_PESQ',   description: 'Pesquisa, Desenv. e Educação Superior (100% Redução)', ibsReduction: 100, cbsReduction: 100 },
    // Casos Híbridos
    { cClass: 'ED_SUP_PROUNI', description: 'Educação Superior (Prouni - Híbrido)', ibsReduction: 60, cbsReduction: 100 } 
];

export const CNAE_CLASSES_2026_MAP = CNAE_CLASSES_2026.reduce((acc, curr) => {
    acc[curr.cClass] = curr;
    return acc;
}, {} as Record<string, CnaeClass2026>);

/**
 * Relacionamento CNAE -> NBS -> Classe Tributária
 * Auditoria: Todos os itens da lista original foram verificados e incluídos.
 */
export const CNAE_LC116_RELATIONSHIP: CnaeRelationship2026[] = [
    // ==========================================
    // AGROPECUÁRIA E FLORESTAL
    // ==========================================
    { itemLC116: '00.00', descriptionLC116: 'Agricultura', nationalCode: '000000', cnae: '0161003', nbs: '1.0103.20.00', nbsDescription: 'Serviços de preparação de terrenos e de canteiros de obras', cClassTrib: '050_CONST' },
    { itemLC116: '01.01', descriptionLC116: 'Tecnologia Florestal', nationalCode: '000000', cnae: '0203100', nbs: '1.1502.90.04', nbsDescription: 'Serviços de projeto, desenvolvimento e instalação de aplicativos e programas não p', cClassTrib: '060_SAUDE' },

    // ==========================================
    // TECNOLOGIA DA INFORMAÇÃO (TI)
    // ==========================================
    { itemLC116: '01.03', descriptionLC116: 'Hospedagem Sites', nationalCode: '000000', cnae: '1830003', nbs: '1.1506.10.00', nbsDescription: 'Serviços de hospedagem de sítios eletrônicos na rede mundial de computadores', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.03', descriptionLC116: 'Hospedagem Sites', nationalCode: '000000', cnae: '6190601', nbs: '1.1506.10.00', nbsDescription: 'Serviços de hospedagem de sítios eletrônicos na rede mundial de computadores', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.05', descriptionLC116: 'Licenciamento', nationalCode: '000000', cnae: '6190601', nbs: '1.1103.29.00', nbsDescription: 'Licenciamento de direitos sobre programas de computador e bancos de dados', cClassTrib: '000_PADRAO' },
    
    // CNAE 6201501
    { itemLC116: '01.01', descriptionLC116: 'Desenvolvimento', nationalCode: '000000', cnae: '6201501', nbs: '1.1502.10.00', nbsDescription: 'Serviços de projeto e desenvolvimento de aplicativos e programas', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.01', descriptionLC116: 'Desenvolvimento', nationalCode: '000000', cnae: '6201501', nbs: '1.1502.20.00', nbsDescription: 'Serviços de projeto e desenvolvimento de aplicativos (TI)', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.06', descriptionLC116: 'Suporte TI', nationalCode: '000000', cnae: '6201501', nbs: '1.1507.20.00', nbsDescription: 'Serviços de gerenciamento de sistemas computacionais', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.06', descriptionLC116: 'Suporte TI', nationalCode: '000000', cnae: '6201501', nbs: '1.1507.90.00', nbsDescription: 'Serviços de gerenciamento n.e.', cClassTrib: '000_PADRAO' },

    // CNAE 6202300
    { itemLC116: '01.01', descriptionLC116: 'Desenvolvimento', nationalCode: '000000', cnae: '6202300', nbs: '1.1502.10.00', nbsDescription: 'Serviços de projeto e desenvolvimento de aplicativos e programas', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.01', descriptionLC116: 'Desenvolvimento', nationalCode: '000000', cnae: '6202300', nbs: '1.1502.20.00', nbsDescription: 'Serviços de projeto e desenvolvimento de aplicativos (TI)', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.06', descriptionLC116: 'Suporte TI', nationalCode: '000000', cnae: '6202300', nbs: '1.1507.20.00', nbsDescription: 'Serviços de gerenciamento de sistemas computacionais', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.05', descriptionLC116: 'Licenciamento', nationalCode: '000000', cnae: '6202300', nbs: '1.1103.23.00', nbsDescription: 'Licenciamento de direitos sobre bancos de dados', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.05', descriptionLC116: 'Licenciamento', nationalCode: '000000', cnae: '6202300', nbs: '1.1103.29.00', nbsDescription: 'Licenciamento de direitos sobre programas de computador', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.01', descriptionLC116: 'Desenvolvimento', nationalCode: '000000', cnae: '6202300', nbs: '1.1502.90.03', nbsDescription: 'Desenvolvimento parcial', cClassTrib: '000_PADRAO' },

    // CNAE 6203100
    { itemLC116: '01.01', descriptionLC116: 'Desenvolvimento', nationalCode: '000000', cnae: '6203100', nbs: '1.1502.10.00', nbsDescription: 'Serviços de projeto e desenvolvimento de aplicativos e programas', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.06', descriptionLC116: 'Suporte TI', nationalCode: '000000', cnae: '6203100', nbs: '1.1507.20.00', nbsDescription: 'Serviços de gerenciamento de sistemas computacionais', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.05', descriptionLC116: 'Licenciamento', nationalCode: '000000', cnae: '6203100', nbs: '1.1103.23.00', nbsDescription: 'Licenciamento de direitos sobre bancos de dados', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.05', descriptionLC116: 'Licenciamento', nationalCode: '000000', cnae: '6203100', nbs: '1.1103.29.00', nbsDescription: 'Licenciamento de direitos sobre programas de computador', cClassTrib: '000_PADRAO' },

    // CNAE 6204000 (Consultoria TI) - Atenção: Contém itens com 60%
    { itemLC116: '01.01', descriptionLC116: 'Consultoria TI', nationalCode: '000000', cnae: '6204000', nbs: '1.1502.10.00', nbsDescription: 'Serviços de projeto e desenvolvimento de aplicativos e programas', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.06', descriptionLC116: 'Gerenciamento TI', nationalCode: '000000', cnae: '6204000', nbs: '1.1507.10.00', nbsDescription: 'Serviços de gerenciamento de redes em tecnologia da informação', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.06', descriptionLC116: 'Gerenciamento TI', nationalCode: '000000', cnae: '6204000', nbs: '1.1507.20.00', nbsDescription: 'Serviços de gerenciamento de sistemas computacionais', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.01', descriptionLC116: 'Consultoria TI', nationalCode: '000000', cnae: '6204000', nbs: '1.1502.90.05', nbsDescription: 'Serviços de TI especializados', cClassTrib: '060_SAUDE' }, // REDUÇÃO 60%
    { itemLC116: '01.06', descriptionLC116: 'Gerenciamento TI', nationalCode: '000000', cnae: '6204000', nbs: '1.1507.90.00', nbsDescription: 'Serviços de gerenciamento n.e.', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.01', descriptionLC116: 'Consultoria TI', nationalCode: '000000', cnae: '6204000', nbs: '1.1510.00.00', nbsDescription: 'Outros serviços de TI', cClassTrib: '060_SAUDE' }, // REDUÇÃO 60%

    { itemLC116: '01.05', descriptionLC116: 'Licenciamento', nationalCode: '000000', cnae: '6311900', nbs: '1.1103.23.00', nbsDescription: 'Licenciamento de direitos sobre bancos de dados', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.05', descriptionLC116: 'Licenciamento', nationalCode: '000000', cnae: '6311900', nbs: '1.1103.29.00', nbsDescription: 'Licenciamento de direitos sobre programas de computador', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.05', descriptionLC116: 'Licenciamento', nationalCode: '000000', cnae: '6319400', nbs: '1.1103.23.00', nbsDescription: 'Licenciamento de direitos sobre bancos de dados', cClassTrib: '000_PADRAO' },
    { itemLC116: '01.01', descriptionLC116: 'Segurança TI', nationalCode: '000000', cnae: '8020000', nbs: '1.1501.20.00', nbsDescription: 'Serviços de segurança em tecnologia da informação (TI)', cClassTrib: '060_SAUDE' },

    // ==========================================
    // SAÚDE HUMANA (Grupo 86, 32, 87) - REDUÇÃO 60%
    // ==========================================
    { itemLC116: '04.01', descriptionLC116: 'Saúde', nationalCode: '000000', cnae: '3250706', nbs: '1.2301.99.00', nbsDescription: 'Outros serviços de saúde humana (Prótese)', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.01', descriptionLC116: 'Saúde', nationalCode: '000000', cnae: '3250709', nbs: '1.2301.93.00', nbsDescription: 'Serviços laboratoriais', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.22', descriptionLC116: 'Planos Saúde', nationalCode: '000000', cnae: '6550200', nbs: '1.0910.10.00', nbsDescription: 'Serviços de planos privados de assistência à saúde', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.23', descriptionLC116: 'Planos Saúde', nationalCode: '000000', cnae: '6629100', nbs: '1.0910.90.00', nbsDescription: 'Serviços de planos privados de assistência à saúde n.e.', cClassTrib: '060_SAUDE' },
    
    // Grupo 86 (Completo)
    { itemLC116: '04.03', descriptionLC116: 'Hospitais', nationalCode: '000000', cnae: '8610101', nbs: '1.2301.10.00', nbsDescription: 'Serviços hospitalares', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.03', descriptionLC116: 'Hospitais', nationalCode: '000000', cnae: '8610102', nbs: '1.2301.15.00', nbsDescription: 'Serviços de atendimento de urgência', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.03', descriptionLC116: 'Medicina', nationalCode: '000000', cnae: '8630501', nbs: '1.2301.11.00', nbsDescription: 'Serviços cirúrgicos', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.03', descriptionLC116: 'Medicina', nationalCode: '000000', cnae: '8630502', nbs: '1.2301.21.00', nbsDescription: 'Serviços de clínica médica (com exames)', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.01', descriptionLC116: 'Medicina', nationalCode: '000000', cnae: '8630503', nbs: '1.2301.21.00', nbsDescription: 'Serviços de clínica médica (consultas)', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.01', descriptionLC116: 'Odontologia', nationalCode: '000000', cnae: '8630504', nbs: '1.2301.23.00', nbsDescription: 'Serviços odontológicos', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.01', descriptionLC116: 'Vacinação', nationalCode: '000000', cnae: '8630506', nbs: '1.2301.99.00', nbsDescription: 'Serviços de vacinação e imunização humana', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.01', descriptionLC116: 'Reprodução', nationalCode: '000000', cnae: '8630507', nbs: '1.2301.12.00', nbsDescription: 'Serviços ginecológicos e obstétricos (Reprodução Humana)', cClassTrib: '060_SAUDE' },
    
    // Grupo 8640 (Diagnóstico)
    { itemLC116: '04.01', descriptionLC116: 'Diagnóstico', nationalCode: '000000', cnae: '8640201', nbs: '1.2301.93.00', nbsDescription: 'Laboratórios de anatomia patológica e citológica', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.01', descriptionLC116: 'Diagnóstico', nationalCode: '000000', cnae: '8640202', nbs: '1.2301.93.00', nbsDescription: 'Laboratórios clínicos', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.01', descriptionLC116: 'Diagnóstico', nationalCode: '000000', cnae: '8640204', nbs: '1.2301.94.00', nbsDescription: 'Serviços de tomografia', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.01', descriptionLC116: 'Diagnóstico', nationalCode: '000000', cnae: '8640205', nbs: '1.2301.94.00', nbsDescription: 'Serviços de diagnóstico por imagem', cClassTrib: '060_SAUDE' },
    
    // Grupo 8650 (Atividades de profissionais da área de saúde)
    { itemLC116: '04.01', descriptionLC116: 'Enfermagem', nationalCode: '000000', cnae: '8650001', nbs: '1.2301.91.00', nbsDescription: 'Serviços de enfermagem', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.01', descriptionLC116: 'Nutrição', nationalCode: '000000', cnae: '8650002', nbs: '1.2301.99.00', nbsDescription: 'Serviços de nutrição', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.01', descriptionLC116: 'Psicologia', nationalCode: '000000', cnae: '8650003', nbs: '1.2301.98.00', nbsDescription: 'Serviços de psicologia', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.01', descriptionLC116: 'Fisioterapia', nationalCode: '000000', cnae: '8650004', nbs: '1.2301.92.00', nbsDescription: 'Serviços de fisioterapia', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.01', descriptionLC116: 'Fonoaudiologia', nationalCode: '000000', cnae: '8650006', nbs: '1.2301.99.00', nbsDescription: 'Serviços de fonoaudiologia', cClassTrib: '060_SAUDE' },

    // Outros Saúde
    { itemLC116: '04.01', descriptionLC116: 'Saúde', nationalCode: '000000', cnae: '8720401', nbs: '1.2301.22.00', nbsDescription: 'Serviços médicos especializados', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.01', descriptionLC116: 'Saúde', nationalCode: '000000', cnae: '8720401', nbs: '1.2301.98.00', nbsDescription: 'Serviços de psicologia', cClassTrib: '060_SAUDE' },
    { itemLC116: '04.01', descriptionLC116: 'Saúde', nationalCode: '000000', cnae: '8720401', nbs: '1.2304.19.00', nbsDescription: 'Serviço de reabilitação vocacional n.e.', cClassTrib: '030_INTEL' },

    // ==========================================
    // VETERINÁRIA
    // ==========================================
    { itemLC116: '05.01', descriptionLC116: 'Veterinária', nationalCode: '000000', cnae: '3822000', nbs: '1.1405.21.00', nbsDescription: 'Serviços hospitalares, com ou sem internação, para animais de corte', cClassTrib: '060_SAUDE' },
    { itemLC116: '05.01', descriptionLC116: 'Veterinária', nationalCode: '000000', cnae: '3822000', nbs: '1.1405.22.00', nbsDescription: 'Serviços de atendimento, assistência ou tratamento para animais de corte', cClassTrib: '060_SAUDE' },
    { itemLC116: '05.01', descriptionLC116: 'Veterinária/Agro', nationalCode: '000000', cnae: '7490103', nbs: '1.1405.22.00', nbsDescription: 'Serviços de atendimento, assistência ou tratamento para animais de corte', cClassTrib: '060_SAUDE' },
    { itemLC116: '05.01', descriptionLC116: 'Veterinária/Agro', nationalCode: '000000', cnae: '7490103', nbs: '1.1405.21.00', nbsDescription: 'Serviços hospitalares, com ou sem internação, para animais de corte', cClassTrib: '060_SAUDE' },
    { itemLC116: '05.01', descriptionLC116: 'Veterinária', nationalCode: '000000', cnae: '7500100', nbs: '1.1405.90.00', nbsDescription: 'Serviços veterinários n.e. (Regime 30%)', cClassTrib: '030_INTEL' },
    { itemLC116: '05.01', descriptionLC116: 'Veterinária', nationalCode: '000000', cnae: '7500100', nbs: '1.1405.11.00', nbsDescription: 'Serviços hospitalares, com ou sem internação, para animais domésticos', cClassTrib: '000_PADRAO' },
    { itemLC116: '05.01', descriptionLC116: 'Veterinária', nationalCode: '000000', cnae: '7500100', nbs: '1.1405.12.00', nbsDescription: 'Serviços de atendimento, assistência ou tratamento para animais domésticos', cClassTrib: '000_PADRAO' },
    { itemLC116: '05.01', descriptionLC116: 'Veterinária', nationalCode: '000000', cnae: '7500100', nbs: '1.1405.90.00', nbsDescription: 'Serviços veterinários n.e. (Regime 0%)', cClassTrib: '000_PADRAO' },

    // ==========================================
    // CONSTRUÇÃO CIVIL E INFRAESTRUTURA
    // ==========================================
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4211101', nbs: '1.0102.11.00', nbsDescription: 'Serviços de construção de autoestradas, ruas e estradas (Regime 50%)', cClassTrib: '050_CONST' },
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4211101', nbs: '1.0102.11.00', nbsDescription: 'Serviços de construção de autoestradas, ruas e estradas (Regime 60%)', cClassTrib: '060_SAUDE' },
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4211101', nbs: '1.0102.12.00', nbsDescription: 'Serviços de construção de ferrovias', cClassTrib: '050_CONST' },
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4211101', nbs: '1.0102.13.00', nbsDescription: 'Serviços de construção de pistas de pouso e infraestrutura aeroportuária', cClassTrib: '050_CONST' },
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4211101', nbs: '1.0102.20.00', nbsDescription: 'Serviços de construção de pontes, autoestradas elevadas e túneis', cClassTrib: '050_CONST' },
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4212000', nbs: '1.0102.20.00', nbsDescription: 'Serviços de construção de pontes, autoestradas elevadas e túneis', cClassTrib: '060_SAUDE' },
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4311801', nbs: '1.0103.10.00', nbsDescription: 'Serviços de demolição (Regime 50%)', cClassTrib: '050_CONST' },
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4311801', nbs: '1.0103.10.00', nbsDescription: 'Serviços de demolição (Regime 60%)', cClassTrib: '060_SAUDE' },
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4399101', nbs: '1.1403.30.00', nbsDescription: 'Serviços de gerenciamento de projetos de construção', cClassTrib: '030_INTEL' },
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4399102', nbs: '1.0105.50.00', nbsDescription: 'Serviços de montagem de estruturas de aço (Regime 50%)', cClassTrib: '050_CONST' },
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4399102', nbs: '1.0105.50.00', nbsDescription: 'Serviços de montagem de estruturas de aço (Regime 60%)', cClassTrib: '060_SAUDE' },
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4399103', nbs: '1.0105.60.00', nbsDescription: 'Serviços de alvenaria (Regime 50%)', cClassTrib: '050_CONST' },
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4399103', nbs: '1.0105.60.00', nbsDescription: 'Serviços de alvenaria (Regime 60%)', cClassTrib: '060_SAUDE' },
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4399199', nbs: '1.0105.90.00', nbsDescription: 'Serviços especializados de construção n.e. (Regime 50%)', cClassTrib: '050_CONST' },
    { itemLC116: '07.02', descriptionLC116: 'Construção Civil', nationalCode: '000000', cnae: '4399199', nbs: '1.0105.90.00', nbsDescription: 'Serviços especializados de construção n.e. (Regime 60%)', cClassTrib: '060_SAUDE' },
    { itemLC116: '11.02', descriptionLC116: 'Vigilância/Transporte', nationalCode: '000000', cnae: '5221400', nbs: '1.1001.12.10', nbsDescription: 'Serviços de administração e locação, sublocação, arrendamento, direito de passagem', cClassTrib: '070_EVENT' },
    { itemLC116: '11.02', descriptionLC116: 'Operação Rodovias', nationalCode: '000000', cnae: '5221400', nbs: '1.0604.21.00', nbsDescription: 'Serviços de operação de rodovias', cClassTrib: '000_PADRAO' },
    { itemLC116: '11.02', descriptionLC116: 'Operação Rodovias', nationalCode: '000000', cnae: '5221400', nbs: '1.0604.22.00', nbsDescription: 'Serviços de operação de pontes e túneis', cClassTrib: '000_PADRAO' },

    // ==========================================
    // HOTELARIA
    // ==========================================
    // CNAE 5510801 (Hotéis) - 7 Variações
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510801', nbs: '1.0303.12.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, s/serviços de cozinha', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510801', nbs: '1.0303.13.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, c/cozinha', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510801', nbs: '1.0303.14.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, c/assistência', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Camping', nationalCode: '000000', cnae: '5510801', nbs: '1.0303.20.00', nbsDescription: 'Serviços de acampamentos turísticos (camping)', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510801', nbs: '1.0303.90.00', nbsDescription: 'Serviços de hospedagem para visitantes n.e.', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem Estudante', nationalCode: '000000', cnae: '5510801', nbs: '1.0304.10.00', nbsDescription: 'Serviços de hospedagem para estudantes', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem Trabalhador', nationalCode: '000000', cnae: '5510801', nbs: '1.0304.20.00', nbsDescription: 'Serviços de hospedagem para trabalhadores', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510801', nbs: '1.0304.90.00', nbsDescription: 'Serviços de hospedagem, exceto para visitantes n.e.', cClassTrib: '040_TURISM' },

    // CNAE 5510802 (Apart Hotéis) - 7 Variações
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510802', nbs: '1.0303.13.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, c/cozinha', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510802', nbs: '1.0303.14.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, c/assistência', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Camping', nationalCode: '000000', cnae: '5510802', nbs: '1.0303.20.00', nbsDescription: 'Serviços de acampamentos turísticos (camping)', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510802', nbs: '1.0303.90.00', nbsDescription: 'Serviços de hospedagem para visitantes n.e.', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510802', nbs: '1.0304.10.00', nbsDescription: 'Serviços de hospedagem para estudantes', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510802', nbs: '1.0304.20.00', nbsDescription: 'Serviços de hospedagem para trabalhadores', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510802', nbs: '1.0304.90.00', nbsDescription: 'Serviços de hospedagem, exceto para visitantes n.e.', cClassTrib: '040_TURISM' },

    // CNAE 5510803 (Motéis) - 7 Variações
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510803', nbs: '1.0303.13.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, c/cozinha', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510803', nbs: '1.0303.14.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, c/assistência', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Camping', nationalCode: '000000', cnae: '5510803', nbs: '1.0303.20.00', nbsDescription: 'Serviços de acampamentos turísticos (camping)', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510803', nbs: '1.0303.90.00', nbsDescription: 'Serviços de hospedagem para visitantes n.e.', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510803', nbs: '1.0304.10.00', nbsDescription: 'Serviços de hospedagem para estudantes', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510803', nbs: '1.0304.20.00', nbsDescription: 'Serviços de hospedagem para trabalhadores', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5510803', nbs: '1.0304.90.00', nbsDescription: 'Serviços de hospedagem, exceto para visitantes n.e.', cClassTrib: '040_TURISM' },

    // CNAE 5590601 (Albergues) - 7 Variações
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590601', nbs: '1.0303.13.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, c/cozinha', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590601', nbs: '1.0303.14.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, c/assistência', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Camping', nationalCode: '000000', cnae: '5590601', nbs: '1.0303.20.00', nbsDescription: 'Serviços de acampamentos turísticos (camping)', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590601', nbs: '1.0303.90.00', nbsDescription: 'Serviços de hospedagem para visitantes n.e.', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590601', nbs: '1.0304.10.00', nbsDescription: 'Serviços de hospedagem para estudantes', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590601', nbs: '1.0304.20.00', nbsDescription: 'Serviços de hospedagem para trabalhadores', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590601', nbs: '1.0304.90.00', nbsDescription: 'Serviços de hospedagem, exceto para visitantes n.e.', cClassTrib: '040_TURISM' },

    // CNAE 5590602 (Campings) - 7 Variações
    { itemLC116: '09.01', descriptionLC116: 'Camping', nationalCode: '000000', cnae: '5590602', nbs: '1.0303.13.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, c/cozinha', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Camping', nationalCode: '000000', cnae: '5590602', nbs: '1.0303.14.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, c/assistência', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Camping', nationalCode: '000000', cnae: '5590602', nbs: '1.0303.20.00', nbsDescription: 'Serviços de acampamentos turísticos (camping)', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Camping', nationalCode: '000000', cnae: '5590602', nbs: '1.0303.90.00', nbsDescription: 'Serviços de hospedagem para visitantes n.e.', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Camping', nationalCode: '000000', cnae: '5590602', nbs: '1.0304.10.00', nbsDescription: 'Serviços de hospedagem para estudantes', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Camping', nationalCode: '000000', cnae: '5590602', nbs: '1.0304.20.00', nbsDescription: 'Serviços de hospedagem para trabalhadores', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Camping', nationalCode: '000000', cnae: '5590602', nbs: '1.0304.90.00', nbsDescription: 'Serviços de hospedagem, exceto para visitantes n.e.', cClassTrib: '040_TURISM' },

    // CNAE 5590603 (Pensões) - 7 Variações
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590603', nbs: '1.0303.12.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, s/serviços de cozinha', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590603', nbs: '1.0303.13.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, c/cozinha', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590603', nbs: '1.0303.14.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, c/assistência', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Camping', nationalCode: '000000', cnae: '5590603', nbs: '1.0303.20.00', nbsDescription: 'Serviços de acampamentos turísticos (camping)', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590603', nbs: '1.0303.90.00', nbsDescription: 'Serviços de hospedagem para visitantes n.e.', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590603', nbs: '1.0304.10.00', nbsDescription: 'Serviços de hospedagem para estudantes', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590603', nbs: '1.0304.20.00', nbsDescription: 'Serviços de hospedagem para trabalhadores', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590603', nbs: '1.0304.90.00', nbsDescription: 'Serviços de hospedagem, exceto para visitantes n.e.', cClassTrib: '040_TURISM' },

    // CNAE 5590699 (Outros Alojamentos) - 7 Variações
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590699', nbs: '1.0303.12.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, s/serviços de cozinha', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590699', nbs: '1.0303.13.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, c/cozinha', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590699', nbs: '1.0303.14.00', nbsDescription: 'Serviços de hospedagem em quartos para visitantes, c/assistência', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Camping', nationalCode: '000000', cnae: '5590699', nbs: '1.0303.20.00', nbsDescription: 'Serviços de acampamentos turísticos (camping)', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590699', nbs: '1.0303.90.00', nbsDescription: 'Serviços de hospedagem para visitantes n.e.', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590699', nbs: '1.0304.10.00', nbsDescription: 'Serviços de hospedagem para estudantes', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590699', nbs: '1.0304.20.00', nbsDescription: 'Serviços de hospedagem para trabalhadores', cClassTrib: '040_TURISM' },
    { itemLC116: '09.01', descriptionLC116: 'Hospedagem', nationalCode: '000000', cnae: '5590699', nbs: '1.0304.90.00', nbsDescription: 'Serviços de hospedagem, exceto para visitantes n.e.', cClassTrib: '040_TURISM' },

    // ==========================================
    // TURISMO
    // ==========================================
    // CNAE 7911200 (Agências de Viagens) - 23 Itens completos
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.0401.17.10', nbsDescription: 'Serviços de transporte rodoviário para passeios turísticos (sightseeing)', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.0401.17.20', nbsDescription: 'Serviços de transporte ferroviário para passeios turísticos (sightseeing)', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.0401.17.90', nbsDescription: 'Serviços de transporte terrestre para passeios turísticos (sightseeing) n.e.', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.0401.23.00', nbsDescription: 'Serviços de transporte aquaviário para passeios turísticos (sightseeing)', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.0401.43.00', nbsDescription: 'Serviços de transporte aéreo para passeios turísticos (sightseeing)', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.0402.13.20', nbsDescription: 'Serviços de fretamento eventual ou turístico, nacional, exceto local', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.40.00', nbsDescription: 'Serviços de operadoras de turismo', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.11.00', nbsDescription: 'Serviços de reservas para transporte aéreo de passageiros', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.12.00', nbsDescription: 'Serviços de reservas para transporte ferroviário de passageiros', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.13.00', nbsDescription: 'Serviços de reservas para transporte rodoviário de passageiros', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.14.00', nbsDescription: 'Serviços de reservas de carros de aluguel', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.19.00', nbsDescription: 'Serviços de reservas para transporte de passageiros n.e.', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.21.00', nbsDescription: 'Serviços de reservas de hospedagem, exceto em unidades compartilhadas', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.22.00', nbsDescription: 'Serviços de reservas e intercâmbio de unidades compartilhadas (time-share)', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.23.00', nbsDescription: 'Serviços de reservas em cruzeiros', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.24.00', nbsDescription: 'Serviços de reservas de pacotes turísticos', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.31.00', nbsDescription: 'Serviços de reservas para centros de convenções, auditórios e salas de exposições', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.32.00', nbsDescription: 'Serviços de reservas de ingressos para eventos de entretenimento e recreativos', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.39.00', nbsDescription: 'Serviços de reservas n.e.', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.50.00', nbsDescription: 'Serviços de guias turísticos', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.61.00', nbsDescription: 'Serviços de promoção turística', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7911200', nbs: '1.1805.62.00', nbsDescription: 'Serviços de informação a visitantes', cClassTrib: '000_PADRAO' },

    // CNAE 7912100 (Operadores Turísticos) - 23 Itens completos
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.0401.17.10', nbsDescription: 'Serviços de transporte rodoviário para passeios turísticos (sightseeing)', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.0401.17.20', nbsDescription: 'Serviços de transporte ferroviário para passeios turísticos (sightseeing)', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.0401.17.90', nbsDescription: 'Serviços de transporte terrestre para passeios turísticos (sightseeing) n.e.', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.0401.23.00', nbsDescription: 'Serviços de transporte aquaviário para passeios turísticos (sightseeing)', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.0401.43.00', nbsDescription: 'Serviços de transporte aéreo para passeios turísticos (sightseeing)', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.0402.13.20', nbsDescription: 'Serviços de fretamento eventual ou turístico, nacional, exceto local', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.40.00', nbsDescription: 'Serviços de operadoras de turismo', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.11.00', nbsDescription: 'Serviços de reservas para transporte aéreo de passageiros', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.12.00', nbsDescription: 'Serviços de reservas para transporte ferroviário de passageiros', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.13.00', nbsDescription: 'Serviços de reservas para transporte rodoviário de passageiros', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.14.00', nbsDescription: 'Serviços de reservas de carros de aluguel', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.19.00', nbsDescription: 'Serviços de reservas para transporte de passageiros n.e.', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.21.00', nbsDescription: 'Serviços de reservas de hospedagem, exceto em unidades compartilhadas', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.22.00', nbsDescription: 'Serviços de reservas e intercâmbio de unidades compartilhadas (time-share)', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.23.00', nbsDescription: 'Serviços de reservas em cruzeiros', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.24.00', nbsDescription: 'Serviços de reservas de pacotes turísticos', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.31.00', nbsDescription: 'Serviços de reservas para centros de convenções, auditórios e salas de exposições', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.32.00', nbsDescription: 'Serviços de reservas de ingressos para eventos de entretenimento e recreativos', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.39.00', nbsDescription: 'Serviços de reservas n.e.', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.50.00', nbsDescription: 'Serviços de guias turísticos', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.61.00', nbsDescription: 'Serviços de promoção turística', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7912100', nbs: '1.1805.62.00', nbsDescription: 'Serviços de informação a visitantes', cClassTrib: '000_PADRAO' },

    // CNAE 7990200 (Outros serviços turismo) - 23 Itens completos
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.0401.17.10', nbsDescription: 'Serviços de transporte rodoviário para passeios turísticos (sightseeing)', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.0401.17.20', nbsDescription: 'Serviços de transporte ferroviário para passeios turísticos (sightseeing)', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.0401.17.90', nbsDescription: 'Serviços de transporte terrestre para passeios turísticos (sightseeing) n.e.', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.0401.23.00', nbsDescription: 'Serviços de transporte aquaviário para passeios turísticos (sightseeing)', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.0401.43.00', nbsDescription: 'Serviços de transporte aéreo para passeios turísticos (sightseeing)', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.0402.13.20', nbsDescription: 'Serviços de fretamento eventual ou turístico, nacional, exceto local', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.40.00', nbsDescription: 'Serviços de operadoras de turismo', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.11.00', nbsDescription: 'Serviços de reservas para transporte aéreo de passageiros', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.12.00', nbsDescription: 'Serviços de reservas para transporte ferroviário de passageiros', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.13.00', nbsDescription: 'Serviços de reservas para transporte rodoviário de passageiros', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.14.00', nbsDescription: 'Serviços de reservas de carros de aluguel', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.19.00', nbsDescription: 'Serviços de reservas para transporte de passageiros n.e.', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.21.00', nbsDescription: 'Serviços de reservas de hospedagem, exceto em unidades compartilhadas', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.22.00', nbsDescription: 'Serviços de reservas e intercâmbio de unidades compartilhadas (time-share)', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.23.00', nbsDescription: 'Serviços de reservas em cruzeiros', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.24.00', nbsDescription: 'Serviços de reservas de pacotes turísticos', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.31.00', nbsDescription: 'Serviços de reservas para centros de convenções, auditórios e salas de exposições', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.32.00', nbsDescription: 'Serviços de reservas de ingressos para eventos de entretenimento e recreativos', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.39.00', nbsDescription: 'Serviços de reservas n.e.', cClassTrib: '000_PADRAO' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.50.00', nbsDescription: 'Serviços de guias turísticos', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.61.00', nbsDescription: 'Serviços de promoção turística', cClassTrib: '040_TURISM' },
    { itemLC116: '09.02', descriptionLC116: 'Turismo', nationalCode: '000000', cnae: '7990200', nbs: '1.1805.62.00', nbsDescription: 'Serviços de informação a visitantes', cClassTrib: '000_PADRAO' },

    // ==========================================
    // IMOBILIÁRIO E JURÍDICO
    // ==========================================
    { itemLC116: '10.05', descriptionLC116: 'Adm Imóveis', nationalCode: '000000', cnae: '6822600', nbs: '1.1001.11.00', nbsDescription: 'Serviços de administração e locação de imóveis residenciais', cClassTrib: '050_CONST' },
    { itemLC116: '10.05', descriptionLC116: 'Adm Imóveis', nationalCode: '000000', cnae: '6822600', nbs: '1.1001.12.90', nbsDescription: 'Serviços de administração e locação de outros imóveis não residenciais', cClassTrib: '050_CONST' },
    
    // CNAE 6911701 (Advocacia)
    { itemLC116: '17.13', descriptionLC116: 'Advocacia', nationalCode: '000000', cnae: '6911701', nbs: '1.1301.10.00', nbsDescription: 'Serviços de representação e consultoria jurídica criminal', cClassTrib: '030_INTEL' },
    { itemLC116: '17.14', descriptionLC116: 'Advocacia', nationalCode: '000000', cnae: '6911701', nbs: '1.1301.20.00', nbsDescription: 'Serviços de representação e consultoria jurídica em outras áreas do direito', cClassTrib: '030_INTEL' },
    { itemLC116: '17.14', descriptionLC116: 'Advocacia', nationalCode: '000000', cnae: '6911701', nbs: '1.1301.90.00', nbsDescription: 'Serviços jurídicos não classificados em subposições anteriores', cClassTrib: '030_INTEL' },
    
    // Contabilidade
    { itemLC116: '17.19', descriptionLC116: 'Contabilidade', nationalCode: '000000', cnae: '6920601', nbs: '1.1302.21.00', nbsDescription: 'Serviços de contabilidade', cClassTrib: '030_INTEL' },
    { itemLC116: '17.19', descriptionLC116: 'Contabilidade', nationalCode: '000000', cnae: '6920601', nbs: '1.1302.22.00', nbsDescription: 'Serviços de escrituração mercantil', cClassTrib: '030_INTEL' },
    { itemLC116: '17.20', descriptionLC116: 'Auditoria', nationalCode: '000000', cnae: '6920602', nbs: '1.1302.11.00', nbsDescription: 'Serviços de auditoria contábil', cClassTrib: '030_INTEL' },

    // ==========================================
    // ENGENHARIA, CONSULTORIA, PESQUISA
    // ==========================================
    // CNAE 7020400 (Consultoria)
    { itemLC116: '17.06', descriptionLC116: 'Assessoria', nationalCode: '000000', cnae: '7020400', nbs: '1.1401.31.00', nbsDescription: 'Serviços de assessoria de imprensa', cClassTrib: '000_PADRAO' },
    { itemLC116: '17.06', descriptionLC116: 'Assessoria', nationalCode: '000000', cnae: '7020400', nbs: '1.1401.31.00', nbsDescription: 'Serviços de assessoria de imprensa (Regime 60%)', cClassTrib: '060_SAUDE' },
    { itemLC116: '17.06', descriptionLC116: 'Relações Públicas', nationalCode: '000000', cnae: '7020400', nbs: '1.1401.32.00', nbsDescription: 'Serviços de relações públicas', cClassTrib: '030_INTEL' },
    { itemLC116: '17.06', descriptionLC116: 'Relações Públicas', nationalCode: '000000', cnae: '7020400', nbs: '1.1401.32.00', nbsDescription: 'Serviços de relações públicas (Regime 60%)', cClassTrib: '060_SAUDE' },

    // CNAE 7112000 (Engenharia)
    { itemLC116: '07.01', descriptionLC116: 'Engenharia', nationalCode: '000000', cnae: '7112000', nbs: '1.1403.27.00', nbsDescription: 'Serviços de engenharia para projetos de distribuição de água e rede de esgoto', cClassTrib: '030_INTEL' },
    { itemLC116: '07.01', descriptionLC116: 'Engenharia', nationalCode: '000000', cnae: '7112000', nbs: '1.1403.29.00', nbsDescription: 'Serviços de engenharia para outros projetos', cClassTrib: '060_SAUDE' },
    { itemLC116: '07.03', descriptionLC116: 'Gerenciamento Obras', nationalCode: '000000', cnae: '7112000', nbs: '1.1403.30.00', nbsDescription: 'Serviços de gerenciamento de projetos de construção', cClassTrib: '030_INTEL' },
    { itemLC116: '07.01', descriptionLC116: 'Engenharia', nationalCode: '000000', cnae: '7112000', nbs: '1.1403.90.00', nbsDescription: 'Serviços de engenharia não classificados em subposições anteriores', cClassTrib: '030_INTEL' },

    // CNAE 7210000 (Pesquisa)
    { itemLC116: '00.00', descriptionLC116: 'Pesquisa', nationalCode: '000000', cnae: '7210000', nbs: '1.1201.11.00', nbsDescription: 'Serviços de pesquisa e desenvolvimento em ciências físicas', cClassTrib: '100_PESQ' },

    // CNAE 7312200 (Publicidade)
    { itemLC116: '10.08', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7312200', nbs: '1.1103.33.00', nbsDescription: 'Licenciamento de direitos de autor de obras publicitárias', cClassTrib: '000_PADRAO' },
    { itemLC116: '10.08', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7312200', nbs: '1.1104.20.00', nbsDescription: 'Licenciamento de direitos sobre marcas', cClassTrib: '000_PADRAO' },
    { itemLC116: '10.08', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7312200', nbs: '1.1106.33.00', nbsDescription: 'Cessão temporária de direitos de autor de obras publicitárias', cClassTrib: '000_PADRAO' },
    { itemLC116: '10.08', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7312200', nbs: '1.1107.33.00', nbsDescription: 'Cessão definitiva de direitos de obras publicitárias', cClassTrib: '000_PADRAO' },
    { itemLC116: '10.08', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7312200', nbs: '1.1108.20.00', nbsDescription: 'Cessão definitiva de direitos sobre marcas', cClassTrib: '000_PADRAO' },

    // CNAE 7319001 (Criação de Estandes - Eventos)
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '7319001', nbs: '1.1805.31.00', nbsDescription: 'Serviços de reservas para centros de convenções, auditórios e salas de exposições', cClassTrib: '070_EVENT' },
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '7319001', nbs: '1.1806.61.00', nbsDescription: 'Serviços de assistência e organização de convenções', cClassTrib: '070_EVENT' },
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '7319001', nbs: '1.1806.62.00', nbsDescription: 'Serviços de assistência e organização de feiras de negócios', cClassTrib: '070_EVENT' },
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '7319001', nbs: '1.1806.63.00', nbsDescription: 'Serviços de assistência e organização de exposições e outros eventos', cClassTrib: '070_EVENT' },
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '7319001', nbs: '1.2508.00.00', nbsDescription: 'Serviços recreativos, culturais e desportivos n.e.', cClassTrib: '070_EVENT' },

    // CNAE 7319004 (Consultoria Publicidade)
    { itemLC116: '17.06', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7319004', nbs: '1.1103.33.00', nbsDescription: 'Licenciamento de direitos de autor de obras publicitárias', cClassTrib: '000_PADRAO' },
    { itemLC116: '17.06', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7319004', nbs: '1.1104.20.00', nbsDescription: 'Licenciamento de direitos sobre marcas', cClassTrib: '000_PADRAO' },
    { itemLC116: '17.06', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7319004', nbs: '1.1106.33.00', nbsDescription: 'Cessão temporária de direitos de autor de obras publicitárias', cClassTrib: '000_PADRAO' },
    { itemLC116: '17.06', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7319004', nbs: '1.1107.33.00', nbsDescription: 'Cessão definitiva de direitos de obras publicitárias', cClassTrib: '000_PADRAO' },
    { itemLC116: '17.06', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7319004', nbs: '1.1108.20.00', nbsDescription: 'Cessão definitiva de direitos sobre marcas', cClassTrib: '000_PADRAO' },

    // CNAE 7319099 (Outras Publicidades)
    { itemLC116: '17.06', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7319099', nbs: '1.1103.33.00', nbsDescription: 'Licenciamento de direitos de autor de obras publicitárias', cClassTrib: '000_PADRAO' },
    { itemLC116: '17.06', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7319099', nbs: '1.1104.20.00', nbsDescription: 'Licenciamento de direitos sobre marcas', cClassTrib: '000_PADRAO' },
    { itemLC116: '17.06', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7319099', nbs: '1.1106.33.00', nbsDescription: 'Cessão temporária de direitos de autor de obras publicitárias', cClassTrib: '000_PADRAO' },
    { itemLC116: '17.06', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7319099', nbs: '1.1107.33.00', nbsDescription: 'Cessão definitiva de direitos de obras publicitárias', cClassTrib: '000_PADRAO' },
    { itemLC116: '17.06', descriptionLC116: 'Publicidade', nationalCode: '000000', cnae: '7319099', nbs: '1.1108.20.00', nbsDescription: 'Cessão definitiva de direitos sobre marcas', cClassTrib: '000_PADRAO' },

    // CNAE 7320300 (Pesquisa de Mercado - 100% Redução)
    { itemLC116: '17.06', descriptionLC116: 'Pesquisa Mercado', nationalCode: '000000', cnae: '7320300', nbs: '1.1201.50.00', nbsDescription: 'Serviços de pesquisa e desenvolvimento em ciências agrárias', cClassTrib: '100_PESQ' },
    { itemLC116: '17.06', descriptionLC116: 'Pesquisa Mercado', nationalCode: '000000', cnae: '7320300', nbs: '1.1202.10.00', nbsDescription: 'Serviços de pesquisa e desenvolvimento em psicologia', cClassTrib: '100_PESQ' },
    { itemLC116: '17.06', descriptionLC116: 'Pesquisa Mercado', nationalCode: '000000', cnae: '7320300', nbs: '1.1202.20.00', nbsDescription: 'Serviços de pesquisa e desenvolvimento em ciências econômicas', cClassTrib: '100_PESQ' },
    { itemLC116: '17.06', descriptionLC116: 'Pesquisa Mercado', nationalCode: '000000', cnae: '7320300', nbs: '1.1202.30.00', nbsDescription: 'Serviços de pesquisa e desenvolvimento em direito', cClassTrib: '100_PESQ' },
    { itemLC116: '17.06', descriptionLC116: 'Pesquisa Mercado', nationalCode: '000000', cnae: '7320300', nbs: '1.1202.40.00', nbsDescription: 'Serviços de pesquisa e desenvolvimento em línguas e literatura', cClassTrib: '100_PESQ' },
    { itemLC116: '17.06', descriptionLC116: 'Pesquisa Mercado', nationalCode: '000000', cnae: '7320300', nbs: '1.1202.90.00', nbsDescription: 'Serviços de pesquisa e desenvolvimento em ciências sociais e humanidades n.e.', cClassTrib: '100_PESQ' },
    { itemLC116: '17.06', descriptionLC116: 'Pesquisa Mercado', nationalCode: '000000', cnae: '7320300', nbs: '1.1203.00.00', nbsDescription: 'Serviços de pesquisa e desenvolvimento interdisciplinar', cClassTrib: '100_PESQ' },

    // CNAE 7490199
    { itemLC116: '17.06', descriptionLC116: 'Serviços Técnicos', nationalCode: '000000', cnae: '7490199', nbs: '1.1415.00.00', nbsDescription: 'Outros serviços profissionais, técnicos e gerenciais n.e.', cClassTrib: '030_INTEL' },
    { itemLC116: '17.06', descriptionLC116: 'Meteorologia', nationalCode: '000000', cnae: '7490199', nbs: '1.1404.30.00', nbsDescription: 'Serviços meteorológicos e de previsão do tempo', cClassTrib: '000_PADRAO' },

    // CNAE 8211300 (Apoio Adm - Eventos)
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '8211300', nbs: '1.1805.31.00', nbsDescription: 'Serviços de reservas para centros de convenções, auditórios e salas de exposições', cClassTrib: '070_EVENT' },
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '8211300', nbs: '1.1806.61.00', nbsDescription: 'Serviços de assistência e organização de convenções', cClassTrib: '070_EVENT' },
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '8211300', nbs: '1.1806.62.00', nbsDescription: 'Serviços de assistência e organização de feiras de negócios', cClassTrib: '070_EVENT' },
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '8211300', nbs: '1.1806.63.00', nbsDescription: 'Serviços de assistência e organização de exposições e outros eventos', cClassTrib: '070_EVENT' },
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '8211300', nbs: '1.2508.00.00', nbsDescription: 'Serviços recreativos, culturais e desportivos n.e.', cClassTrib: '070_EVENT' },
    { itemLC116: '17.02', descriptionLC116: 'Apoio Adm', nationalCode: '000000', cnae: '8211300', nbs: '1.1806.40.00', nbsDescription: 'Serviços combinados de escritório e apoio administrativo', cClassTrib: '000_PADRAO' },

    // CNAE 8230002 (Casas de Festas)
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '8230002', nbs: '1.1805.31.00', nbsDescription: 'Serviços de reservas para centros de convenções, auditórios e salas de exposições', cClassTrib: '070_EVENT' },
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '8230002', nbs: '1.1806.61.00', nbsDescription: 'Serviços de assistência e organização de convenções', cClassTrib: '070_EVENT' },
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '8230002', nbs: '1.1806.62.00', nbsDescription: 'Serviços de assistência e organização de feiras de negócios', cClassTrib: '070_EVENT' },
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '8230002', nbs: '1.1806.63.00', nbsDescription: 'Serviços de assistência e organização de exposições e outros eventos', cClassTrib: '070_EVENT' },
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '8230002', nbs: '1.2508.00.00', nbsDescription: 'Serviços recreativos, culturais e desportivos n.e.', cClassTrib: '070_EVENT' },

    // CNAE 8299799 (Pesquisa e Eventos)
    { itemLC116: '00.00', descriptionLC116: 'Pesquisa', nationalCode: '000000', cnae: '8299799', nbs: '1.1201.90.00', nbsDescription: 'Serviços de pesquisa e desenvolvimento em ciências, engenharia e tecnologia n.e.', cClassTrib: '100_PESQ' },
    { itemLC116: '12.08', descriptionLC116: 'Eventos', nationalCode: '000000', cnae: '8299799', nbs: '1.2508.00.00', nbsDescription: 'Serviços recreativos, culturais e desportivos n.e.', cClassTrib: '070_EVENT' },

    // CNAE 8411600 (Planejamento Urbano)
    { itemLC116: '07.01', descriptionLC116: 'Planejamento', nationalCode: '000000', cnae: '8411600', nbs: '1.1402.21.00', nbsDescription: 'Serviços de planejamento urbano (Regime 0%)', cClassTrib: '000_PADRAO' },
    { itemLC116: '07.01', descriptionLC116: 'Planejamento', nationalCode: '000000', cnae: '8411600', nbs: '1.1402.21.00', nbsDescription: 'Serviços de planejamento urbano (Regime 60%)', cClassTrib: '060_SAUDE' },

    // ==========================================
    // EDUCAÇÃO
    // ==========================================
    // CNAE 8531700 (Educação Superior)
    { itemLC116: '08.01', descriptionLC116: 'Educação', nationalCode: '000000', cnae: '8531700', nbs: '1.2204.10.00', nbsDescription: 'Serviços educacionais de graduação (Regime 60%)', cClassTrib: '060_SAUDE' },
    { itemLC116: '08.01', descriptionLC116: 'Educação', nationalCode: '000000', cnae: '8531700', nbs: '1.2204.10.00', nbsDescription: 'Serviços educacionais de graduação (Prouni)', cClassTrib: 'ED_SUP_PROUNI' },

    // CNAE 8542200 (Educação Tecnológica)
    { itemLC116: '08.01', descriptionLC116: 'Educação', nationalCode: '000000', cnae: '8542200', nbs: '1.2204.40.00', nbsDescription: 'Serviços educacionais de cursos sequenciais (Regime 60%)', cClassTrib: '060_SAUDE' },
    { itemLC116: '08.01', descriptionLC116: 'Educação', nationalCode: '000000', cnae: '8542200', nbs: '1.2204.40.00', nbsDescription: 'Serviços educacionais de cursos sequenciais (Prouni)', cClassTrib: 'ED_SUP_PROUNI' },

    // CNAE 8593700 (Idiomas)
    { itemLC116: '08.01', descriptionLC116: 'Educação', nationalCode: '000000', cnae: '8593700', nbs: '1.2205.13.00', nbsDescription: 'Serviços de educação em línguas estrangeiras e de sinais (Regime 60%)', cClassTrib: '060_SAUDE' },
    { itemLC116: '08.01', descriptionLC116: 'Educação', nationalCode: '000000', cnae: '8593700', nbs: '1.2205.13.00', nbsDescription: 'Serviços de educação em línguas estrangeiras e de sinais (Regime 0%)', cClassTrib: '000_PADRAO' },

    // ==========================================
    // CULTURA E ENTRETENIMENTO
    // ==========================================
    // CNAE 9002701 (Atuação Artística)
    { itemLC116: '12.01', descriptionLC116: 'Artes', nationalCode: '000000', cnae: '9002701', nbs: '1.2503.10.00', nbsDescription: 'Serviços de atuação artística (Regime 0%)', cClassTrib: '000_PADRAO' },
    { itemLC116: '12.01', descriptionLC116: 'Artes', nationalCode: '000000', cnae: '9002701', nbs: '1.2503.10.00', nbsDescription: 'Serviços de atuação artística (Regime 60%)', cClassTrib: '060_SAUDE' },
    { itemLC116: '12.01', descriptionLC116: 'Artes', nationalCode: '000000', cnae: '9002701', nbs: '1.2503.20.00', nbsDescription: 'Serviços de autores, compositores, escultores, pintores e outros artistas', cClassTrib: '000_PADRAO' },

    // CNAE 9102301 (Museus)
    { itemLC116: '12.01', descriptionLC116: 'Cultura', nationalCode: '000000', cnae: '9102301', nbs: '1.2504.11.00', nbsDescription: 'Serviços de museus (Regime 60%)', cClassTrib: '060_SAUDE' },
    { itemLC116: '12.01', descriptionLC116: 'Cultura', nationalCode: '000000', cnae: '9102301', nbs: '1.2504.11.00', nbsDescription: 'Serviços de museus (Regime 0%)', cClassTrib: '000_PADRAO' },

    // CNAE 9102302
    { itemLC116: '07.01', descriptionLC116: 'Engenharia', nationalCode: '000000', cnae: '9102302', nbs: '1.1403.10.00', nbsDescription: 'Serviços de consultoria em engenharia', cClassTrib: '060_SAUDE' },
    { itemLC116: '12.01', descriptionLC116: 'Cultura', nationalCode: '000000', cnae: '9102302', nbs: '1.2504.12.00', nbsDescription: 'Serviços de preservação e operação de locais e construções históricas', cClassTrib: '000_PADRAO' },

    // CNAE 9321200 (Parques)
    { itemLC116: '12.05', descriptionLC116: 'Parques', nationalCode: '000000', cnae: '9321200', nbs: '1.2507.10.00', nbsDescription: 'Serviços de parques temáticos de diversão', cClassTrib: '040_TURISM' },
    { itemLC116: '12.05', descriptionLC116: 'Parques', nationalCode: '000000', cnae: '9321200', nbs: '1.2507.90.00', nbsDescription: 'Serviços de parques de diversão e atrações similares n.e.', cClassTrib: '040_TURISM' },

    // ==========================================
    // EXTRAS DO CSV (Ourivesaria, Arte)
    // ==========================================
    { itemLC116: '39.01', descriptionLC116: 'Ourivesaria', nationalCode: '390101', cnae: '9529103', nbs: '1.2002.20.00', nbsDescription: 'Serviços de manutenção e reparação de relógios e joias', cClassTrib: '000_PADRAO' },
    { itemLC116: '39.01', descriptionLC116: 'Ourivesaria', nationalCode: '390101', cnae: '9529106', nbs: '1.2002.20.00', nbsDescription: 'Serviços de manutenção e reparação de relógios e joias', cClassTrib: '000_PADRAO' },
    { itemLC116: '40.01', descriptionLC116: 'Obras de Arte', nationalCode: '400101', cnae: '5913800', nbs: '1.1109.90.00', nbsDescription: 'Cessão definitiva de outros direitos', cClassTrib: '000_PADRAO' },
    { itemLC116: '40.01', descriptionLC116: 'Obras de Arte', nationalCode: '400101', cnae: '7740300', nbs: '1.1109.90.00', nbsDescription: 'Cessão definitiva de outros direitos', cClassTrib: '000_PADRAO' }
];