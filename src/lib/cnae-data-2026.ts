

// Fonte de dados para as classificações tributárias da Reforma (2026+)
// Baseado na tabela fornecida.

export interface CnaeClass2026 {
    cClass: string;
    description: string;
    ibsReduction: number; // Percentual de redução (ex: 60 para 60%)
    cbsReduction: number; // Percentual de redução (ex: 60 para 60%)
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

export const CNAE_CLASSES_2026: CnaeClass2026[] = [
    { cClass: '000001', description: 'Situações tributadas integralmente pelo IBS e CBS.', ibsReduction: 0, cbsReduction: 0 },
    { cClass: '200028', description: 'Serviços de educação (Anexo II)', ibsReduction: 60, cbsReduction: 60 },
    { cClass: '200029', description: 'Serviços de saúde humana (Anexo III)', ibsReduction: 60, cbsReduction: 60 },
    { cClass: '200039', description: 'Serviços e licenciamento para produções nacionais artísticas (Anexo X)', ibsReduction: 60, cbsReduction: 60 },
    { cClass: '200041', description: 'Serviço de educação desportiva (art. 141. I)', ibsReduction: 60, cbsReduction: 60 },
    { cClass: '200045', description: 'Projetos de reabilitação urbana de zonas históricas', ibsReduction: 60, cbsReduction: 60 },
    { cClass: '200047', description: 'Bares e Restaurantes', ibsReduction: 40, cbsReduction: 40 },
    { cClass: '200048', description: 'Hotelaria, Parques de Diversão e Temáticos', ibsReduction: 40, cbsReduction: 40 },
    { cClass: '200049', description: 'Transporte coletivo de passageiros rodoviário, ferroviário e hidroviário', ibsReduction: 40, cbsReduction: 40 },
    { cClass: '200051', description: 'Agências de Turismo', ibsReduction: 40, cbsReduction: 40 },
    { cClass: '200052', description: 'Serviços de profissão intelectual, científica ou artística', ibsReduction: 30, cbsReduction: 30 },
];

export const CNAE_CLASSES_2026_MAP = CNAE_CLASSES_2026.reduce((acc, curr) => {
    acc[curr.cClass] = curr;
    return acc;
}, {} as Record<string, CnaeClass2026>);


export const CNAE_LC116_RELATIONSHIP: CnaeRelationship2026[] = [
    { itemLC116: '01.01', descriptionLC116: 'Análise E Desenvolvimento De Sistemas.', nationalCode: '010101', cnae: '6201501', nbs: '1.1502.10.00', nbsDescription: 'Serviços de projeto, desenvolvimento e instalação de aplicativos e programas não personalizados (não customizados)', cClassTrib: '000001'},
    { itemLC116: '01.01', descriptionLC116: 'Análise E Desenvolvimento De Sistemas.', nationalCode: '010101', cnae: '6202300', nbs: '1.1502.10.00', nbsDescription: 'Serviços de projeto, desenvolvimento e instalação de aplicativos e programas não personalizados (não customizados)', cClassTrib: '000001'},
    { itemLC116: '39.01', descriptionLC116: 'Serviços De Ourivesaria E Lapidação (Quando O Material For Fornecido Pelo Tomador Do Serviço).', nationalCode: '390101', cnae: '9529106', nbs: '1.2002.20.00', nbsDescription: 'Serviços de manutenção e reparação de relógios e joias', cClassTrib: '000001'},
    { itemLC116: '40.01', descriptionLC116: 'Obras De Arte Sob Encomenda.', nationalCode: '400101', cnae: '9002702', nbs: '1.2503.20.00', nbsDescription: 'Serviços de autores, compositores, escultores, pintores e outros artistas, exceto os de atuação artística', cClassTrib: '000001'},
    { itemLC116: '17.02', descriptionLC116: 'Organização de festas e recepções; bufê (exceto o fornecimento de alimentação e bebidas, que fica sujeito ao ICMS)', nationalCode: '170201', cnae: '8230001', nbs: '1.2401.10.00', nbsDescription: 'Serviços de organização de feiras de negócios, congressos, convenções e outros eventos similares', cClassTrib: '000001' },
    { itemLC116: '35.01', descriptionLC116: 'Serviços de reportagem, assessoria de imprensa, jornalismo e relações públicas.', nationalCode: '350101', cnae: '7020400', nbs: '1.1301.21.00', nbsDescription: 'Serviços de relações públicas e comunicação', cClassTrib: '000001' },
    { itemLC116: '07.01', descriptionLC116: 'Engenharia, agronomia, agrimensura, arquitetura, geologia, urbanismo, paisagismo e congêneres.', nationalCode: '070101', cnae: '7112000', nbs: '1.1403.22.11', nbsDescription: 'Serviços de engenharia para projetos de exploração de minerais', cClassTrib: '200052' },
    { itemLC116: '08.01', descriptionLC116: 'Educação infantil, ensino fundamental, médio e superior.', nationalCode: '080101', cnae: '8531700', nbs: '1.2204.10.00', nbsDescription: 'Serviços educacionais de graduação', cClassTrib: '200028' },
    { itemLC116: '08.01', descriptionLC116: 'Educação infantil, ensino fundamental, médio e superior.', nationalCode: '080101', cnae: '8531700', nbs: '1.2204.10.00', nbsDescription: 'Serviços educacionais de graduação (Prouni)', cClassTrib: '200025' },
    // DADOS ADICIONADOS
    { itemLC116: '01.01', descriptionLC116: 'Desenvolvimento de software', nationalCode: '010101', cnae: '6203100', nbs: '1.1502.90.00', nbsDescription: 'Serviços de projeto e desenvolvimento de aplicativos e programas em tecnologia da informação (TI) não classificados em subposições anteriores', cClassTrib: '200039' },
    { itemLC116: '01.01', descriptionLC116: 'Consultoria em TI', nationalCode: '010101', cnae: '6204000', nbs: '1.1502.90.00', nbsDescription: 'Serviços de projeto e desenvolvimento de aplicativos e programas em tecnologia da informação (TI) não classificados em subposições anteriores', cClassTrib: '200039' },
    { itemLC116: '01.01', descriptionLC116: 'Desenvolvimento de software', nationalCode: '010101', cnae: '0203100', nbs: '1.1502.90.04', nbsDescription: 'Serviços de projeto e desenvolvimento de aplicativos e programas em tecnologia da informação (TI) não classificados em subposições anteriores', cClassTrib: '200039' },
    { itemLC116: '01.01', descriptionLC116: 'Consultoria em TI', nationalCode: '010101', cnae: '6204000', nbs: '1.1502.90.05', nbsDescription: 'Serviços de projeto e desenvolvimento de aplicativos e programas em tecnologia da informação (TI) não classificados em subposições anteriores', cClassTrib: '200039' },
    { itemLC116: '01.01', descriptionLC116: 'Segurança em TI', nationalCode: '010101', cnae: '8020002', nbs: '1.1501.20.00', nbsDescription: 'Serviços de segurança em tecnologia da informação (TI)', cClassTrib: '200039' },
    { itemLC116: '01.01', descriptionLC116: 'Segurança em TI', nationalCode: '010101', cnae: '8020000', nbs: '1.1501.20.00', nbsDescription: 'Serviços de segurança em tecnologia da informação (TI)', cClassTrib: '200039' },
    { itemLC116: '01.01', descriptionLC116: 'Outros serviços de TI', nationalCode: '010101', cnae: '6204000', nbs: '1.1510.00.00', nbsDescription: 'Serviços de tecnologia da informação (TI) não classificados em subposições anteriores', cClassTrib: '200039' },
    { itemLC116: '01.01', descriptionLC116: 'Outros serviços de TI', nationalCode: '010101', cnae: '8299799', nbs: '1.1510.00.00', nbsDescription: 'Serviços de tecnologia da informação (TI) não classificados em subposições anteriores', cClassTrib: '200039' },
    { itemLC116: '01.01', descriptionLC116: 'Portais Web', nationalCode: '010101', cnae: '6319400', nbs: '1.1502.30.00', nbsDescription: 'Serviços de projeto e desenvolvimento de estruturas e conteúdo de páginas eletrônicas', cClassTrib: '200039' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços de saúde', nationalCode: '040101', cnae: '8630503', nbs: '1.2301.22.00', nbsDescription: 'Serviços médicos especializados', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços de saúde', nationalCode: '040101', cnae: '8630599', nbs: '1.2301.22.00', nbsDescription: 'Serviços médicos especializados', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços de saúde', nationalCode: '040101', cnae: '8640299', nbs: '1.2301.22.00', nbsDescription: 'Serviços médicos especializados', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços laboratoriais', nationalCode: '040101', cnae: '3250709', nbs: '1.2301.93.00', nbsDescription: 'Serviços laboratoriais', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços laboratoriais', nationalCode: '040101', cnae: '8640201', nbs: '1.2301.93.00', nbsDescription: 'Serviços laboratoriais', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços laboratoriais', nationalCode: '040101', cnae: '8640202', nbs: '1.2301.93.00', nbsDescription: 'Serviços laboratoriais', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços laboratoriais', nationalCode: '040101', cnae: '8640203', nbs: '1.2301.93.00', nbsDescription: 'Serviços laboratoriais', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços laboratoriais', nationalCode: '040101', cnae: '8640204', nbs: '1.2301.93.00', nbsDescription: 'Serviços laboratoriais', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços laboratoriais', nationalCode: '040101', cnae: '8640206', nbs: '1.2301.93.00', nbsDescription: 'Serviços laboratoriais', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços laboratoriais', nationalCode: '040101', cnae: '8640210', nbs: '1.2301.93.00', nbsDescription: 'Serviços laboratoriais', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços laboratoriais', nationalCode: '040101', cnae: '8640211', nbs: '1.2301.93.00', nbsDescription: 'Serviços laboratoriais', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços laboratoriais', nationalCode: '040101', cnae: '8640212', nbs: '1.2301.93.00', nbsDescription: 'Serviços laboratoriais', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços laboratoriais', nationalCode: '040101', cnae: '8640213', nbs: '1.2301.93.00', nbsDescription: 'Serviços laboratoriais', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços laboratoriais', nationalCode: '040101', cnae: '8640214', nbs: '1.2301.93.00', nbsDescription: 'Serviços laboratoriais', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Diagnóstico por imagem', nationalCode: '040101', cnae: '8640205', nbs: '1.2301.94.00', nbsDescription: 'Serviços de diagnóstico por imagem', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Diagnóstico por imagem', nationalCode: '040101', cnae: '8640207', nbs: '1.2301.94.00', nbsDescription: 'Serviços de diagnóstico por imagem', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Diagnóstico por imagem', nationalCode: '040101', cnae: '8640208', nbs: '1.2301.94.00', nbsDescription: 'Serviços de diagnóstico por imagem', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Diagnóstico por imagem', nationalCode: '040101', cnae: '8640209', nbs: '1.2301.94.00', nbsDescription: 'Serviços de diagnóstico por imagem', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Diagnóstico por imagem', nationalCode: '040101', cnae: '8640299', nbs: '1.2301.94.00', nbsDescription: 'Serviços de diagnóstico por imagem', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços cirúrgicos', nationalCode: '040101', cnae: '8630501', nbs: '1.2301.11.00', nbsDescription: 'Serviços cirúrgicos', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços ginecológicos', nationalCode: '040101', cnae: '8630502', nbs: '1.2301.12.00', nbsDescription: 'Serviços ginecológicos e obstétricos', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços ginecológicos', nationalCode: '040101', cnae: '8630503', nbs: '1.2301.12.00', nbsDescription: 'Serviços ginecológicos e obstétricos', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços ginecológicos', nationalCode: '040101', cnae: '8630507', nbs: '1.2301.12.00', nbsDescription: 'Serviços ginecológicos e obstétricos', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços psiquiátricos', nationalCode: '040101', cnae: '8630501', nbs: '1.2301.13.00', nbsDescription: 'Serviços psiquiátricos', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'UTI', nationalCode: '040101', cnae: '8610101', nbs: '1.2301.14.00', nbsDescription: 'Serviços prestados em Unidades de Terapia Intensiva', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'UTI', nationalCode: '040101', cnae: '8610102', nbs: '1.2301.14.00', nbsDescription: 'Serviços prestados em Unidades de Terapia Intensiva', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'UTI', nationalCode: '040101', cnae: '8630501', nbs: '1.2301.14.00', nbsDescription: 'Serviços prestados em Unidades de Terapia Intensiva', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Urgência', nationalCode: '040101', cnae: '8610101', nbs: '1.2301.15.00', nbsDescription: 'Serviços de atendimento de urgência', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Urgência', nationalCode: '040101', cnae: '8610102', nbs: '1.2301.15.00', nbsDescription: 'Serviços de atendimento de urgência', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Urgência', nationalCode: '040101', cnae: '8630501', nbs: '1.2301.15.00', nbsDescription: 'Serviços de atendimento de urgência', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços hospitalares', nationalCode: '040101', cnae: '8610101', nbs: '1.2301.19.00', nbsDescription: 'Serviços hospitalares não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços hospitalares', nationalCode: '040101', cnae: '8610102', nbs: '1.2301.19.00', nbsDescription: 'Serviços hospitalares não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços hospitalares', nationalCode: '040101', cnae: '8630501', nbs: '1.2301.19.00', nbsDescription: 'Serviços hospitalares não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços hospitalares', nationalCode: '040101', cnae: '8630502', nbs: '1.2301.19.00', nbsDescription: 'Serviços hospitalares não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços hospitalares', nationalCode: '040101', cnae: '8660700', nbs: '1.2301.19.00', nbsDescription: 'Serviços hospitalares não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Clínica médica', nationalCode: '040101', cnae: '8630501', nbs: '1.2301.21.00', nbsDescription: 'Serviços de clínica médica', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Clínica médica', nationalCode: '040101', cnae: '8630502', nbs: '1.2301.21.00', nbsDescription: 'Serviços de clínica médica', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Clínica médica', nationalCode: '040101', cnae: '8630503', nbs: '1.2301.21.00', nbsDescription: 'Serviços de clínica médica', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Clínica médica', nationalCode: '040101', cnae: '8630599', nbs: '1.2301.21.00', nbsDescription: 'Serviços de clínica médica', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Clínica médica', nationalCode: '040101', cnae: '8660700', nbs: '1.2301.21.00', nbsDescription: 'Serviços de clínica médica', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Enfermagem', nationalCode: '040101', cnae: '8650001', nbs: '1.2301.91.00', nbsDescription: 'Serviços de enfermagem', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Parto e pós-parto', nationalCode: '040101', cnae: '8650099', nbs: '1.2301.97.00', nbsDescription: 'Serviços de assistência ao parto e pós-parto', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Outros serviços de saúde', nationalCode: '040101', cnae: '8650003', nbs: '1.2301.99.00', nbsDescription: 'Outros serviços de saúde humana não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Outros serviços de saúde', nationalCode: '040101', cnae: '8650005', nbs: '1.2301.99.00', nbsDescription: 'Outros serviços de saúde humana não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Outros serviços de saúde', nationalCode: '040101', cnae: '8650006', nbs: '1.2301.99.00', nbsDescription: 'Outros serviços de saúde humana não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Outros serviços de saúde', nationalCode: '040101', cnae: '8650007', nbs: '1.2301.99.00', nbsDescription: 'Outros serviços de saúde humana não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Outros serviços de saúde', nationalCode: '040101', cnae: '8650099', nbs: '1.2301.99.00', nbsDescription: 'Outros serviços de saúde humana não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Outros serviços de saúde', nationalCode: '040101', cnae: '8690901', nbs: '1.2301.99.00', nbsDescription: 'Outros serviços de saúde humana não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Outros serviços de saúde', nationalCode: '040101', cnae: '8690999', nbs: '1.2301.99.00', nbsDescription: 'Outros serviços de saúde humana não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Fisioterapia', nationalCode: '040101', cnae: '8650004', nbs: '1.2301.92.00', nbsDescription: 'Serviços de fisioterapia', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Saúde domiciliar', nationalCode: '040101', cnae: '8712300', nbs: '1.2301.99.00', nbsDescription: 'Outros serviços de saúde humana não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Nutrição', nationalCode: '040101', cnae: '8650002', nbs: '1.2301.99.00', nbsDescription: 'Outros serviços de saúde humana não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços ginecológicos', nationalCode: '040101', cnae: '8630502', nbs: '1.2301.97.00', nbsDescription: 'Serviços de assistência ao parto e pós-parto', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços ginecológicos', nationalCode: '040101', cnae: '8630503', nbs: '1.2301.97.00', nbsDescription: 'Serviços de assistência ao parto e pós-parto', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Serviços ginecológicos', nationalCode: '040101', cnae: '8630507', nbs: '1.2301.97.00', nbsDescription: 'Serviços de assistência ao parto e pós-parto', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Odontologia', nationalCode: '040101', cnae: '8630504', nbs: '1.2301.23.00', nbsDescription: 'Serviços odontológicos', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Prótese dentária', nationalCode: '040101', cnae: '3250706', nbs: '1.2301.99.00', nbsDescription: 'Outros serviços de saúde humana não classificados em subposições anteriores', cClassTrib: '200029' },
    { itemLC116: '04.01', descriptionLC116: 'Psicologia', nationalCode: '040101', cnae: '8650003', nbs: '1.2301.98.00', nbsDescription: 'Serviços de psicologia', cClassTrib: '200029' },
    { itemLC116: '08.01', descriptionLC116: 'Creche', nationalCode: '080101', cnae: '8511200', nbs: '1.2201.11.00', nbsDescription: 'Serviços de creche ou entidade equivalente', cClassTrib: '200028' },
    { itemLC116: '08.01', descriptionLC116: 'Pré-escola', nationalCode: '080101', cnae: '8512100', nbs: '1.2201.12.00', nbsDescription: 'Serviços de pré-escola', cClassTrib: '200028' },
    { itemLC116: '08.01', descriptionLC116: 'Ensino fundamental', nationalCode: '080101', cnae: '8513900', nbs: '1.2201.20.00', nbsDescription: 'Serviços de ensino fundamental', cClassTrib: '200028' },
    { itemLC116: '08.01', descriptionLC116: 'Ensino médio', nationalCode: '080101', cnae: '8520100', nbs: '1.2201.30.00', nbsDescription: 'Serviços de ensino médio', cClassTrib: '200028' },
    { itemLC116: '08.01', descriptionLC116: 'Educação técnica', nationalCode: '080101', cnae: '8541400', nbs: '1.2202.00.00', nbsDescription: 'Serviços de educação técnica de nível médio', cClassTrib: '200028' },
    { itemLC116: '08.01', descriptionLC116: 'EJA fundamental', nationalCode: '080101', cnae: '8513900', nbs: '1.2203.10.00', nbsDescription: 'Serviços de ensino fundamental de jovens e adultos', cClassTrib: '200028' },
    { itemLC116: '08.01', descriptionLC116: 'EJA médio', nationalCode: '080101', cnae: '8520100', nbs: '1.2203.20.00', nbsDescription: 'Serviços de ensino médio de jovens e adultos', cClassTrib: '200028' },
    { itemLC116: '08.01', descriptionLC116: 'Extensão', nationalCode: '080101', cnae: '8533300', nbs: '1.2204.30.00', nbsDescription: 'Serviços educacionais de extensão', cClassTrib: '200028' },
    { itemLC116: '08.01', descriptionLC116: 'Cursos sequenciais', nationalCode: '080101', cnae: '8542200', nbs: '1.2204.40.00', nbsDescription: 'Serviços educacionais de cursos sequenciais', cClassTrib: '200028' },
    { itemLC116: '08.01', descriptionLC116: 'Idiomas', nationalCode: '080101', cnae: '8593700', nbs: '1.2205.13.00', nbsDescription: 'Serviços de educação em línguas estrangeiras e de sinais', cClassTrib: '200028' },
    { itemLC116: '09.01', descriptionLC116: 'Corretagem de seguros', nationalCode: '090101', cnae: '6622300', nbs: '1.0906.12.00', nbsDescription: 'Serviços de corretagem de seguros saúde', cClassTrib: '200052' },
    { itemLC116: '12.01', descriptionLC116: 'Produção artística', nationalCode: '120101', cnae: '9001901', nbs: '1.2502.20.00', nbsDescription: 'Serviços de produção e apresentação de atuações artísticas ao vivo', cClassTrib: '200039' },
    { itemLC116: '13.01', descriptionLC116: 'Projeção de filmes', nationalCode: '130101', cnae: '1830002', nbs: '1.2501.50.00', nbsDescription: 'Serviços de projeção de filmes', cClassTrib: '200039' },
    { itemLC116: '13.01', descriptionLC116: 'Projeção de filmes', nationalCode: '130101', cnae: '5914600', nbs: '1.2501.50.00', nbsDescription: 'Serviços de projeção de filmes', cClassTrib: '200039' },
    { itemLC116: '14.01', descriptionLC116: 'Serviços funerários', nationalCode: '140101', cnae: '9603303', nbs: '1.1405.30.00', nbsDescription: 'Serviços funerários, de cremação e de embalsamamento de animais', cClassTrib: '200029' },
    { itemLC116: '14.01', descriptionLC116: 'Serviços funerários', nationalCode: '140101', cnae: '9603301', nbs: '1.2603.00.00', nbsDescription: 'Serviços funerários, de cremação e de embalsamamento', cClassTrib: '200029' },
    { itemLC116: '17.01', descriptionLC116: 'Assessoria de imprensa', nationalCode: '170101', cnae: '7020400', nbs: '1.1401.31.00', nbsDescription: 'Serviços de assessoria de imprensa', cClassTrib: '200052' },
    { itemLC116: '17.01', descriptionLC116: 'Relações públicas', nationalCode: '170101', cnae: '7020400', nbs: '1.1401.32.00', nbsDescription: 'Serviços de relações públicas', cClassTrib: '200052' },
    { itemLC116: '18.01', descriptionLC116: 'Atuação artística', nationalCode: '180101', cnae: '9002701', nbs: '1.2503.10.00', nbsDescription: 'Serviços de atuação artística', cClassTrib: '200039' },
    { itemLC116: '19.01', descriptionLC116: 'Museus', nationalCode: '190101', cnae: '9102301', nbs: '1.2504.11.00', nbsDescription: 'Serviços de museus', cClassTrib: '200039' },
];

/**
 * Busca a redução de IVA para um CNAE específico
 * @param cnaeCode Código do CNAE
 * @param cClassTrib Classificação tributária (opcional)
 * @returns Objeto com reduções de IBS e CBS em percentual (0-100)
 */
export function getReductionForActivity(
    cnaeCode: string,
    cClassTrib?: string
): { reducaoIBS: number; reducaoCBS: number; cClassTrib: string } {
    const defaultReduction = { reducaoIBS: 0, reducaoCBS: 0, cClassTrib: '000001' };
    const numericCode = cnaeCode.replace(/\D/g, '');

    const cnaeOptions = CNAE_LC116_RELATIONSHIP.filter(rel => rel.cnae === numericCode);
    if (cnaeOptions.length === 0) return defaultReduction;

    let targetOption: CnaeRelationship2026 | undefined;

    if (cClassTrib) {
        targetOption = cnaeOptions.find(opt => opt.cClassTrib === cClassTrib);
    }

    if (!targetOption) {
        // Se não houver uma seleção específica, ou a seleção for inválida, pegue a primeira opção como padrão.
        targetOption = cnaeOptions[0];
    }
    
    const cClassInfo = CNAE_CLASSES_2026_MAP[targetOption.cClassTrib];
    if (!cClassInfo) return { ...defaultReduction, cClassTrib: targetOption.cClassTrib };

    return {
        reducaoIBS: cClassInfo.ibsReduction,
        reducaoCBS: cClassInfo.cbsReduction,
        cClassTrib: targetOption.cClassTrib
    };
}
