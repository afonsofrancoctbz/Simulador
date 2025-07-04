import { type CnaeData } from './types';

export const CNAE_DATA: CnaeData[] = [
  // --- SAÚDE E BEM-ESTAR ---
  {
    code: '8630-5/03',
    description: 'Atividade médica ambulatorial restrita a consultas',
    category: 'Saúde e Bem-estar',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    ivaReduction: 0.6,
    notes: 'Atividade regulamentada pelo CRM. Exige registro da empresa e indicação de Responsável Técnico. Não pode ser MEI.'
  },
  {
    code: '8650-0/01',
    description: 'Atividades de enfermagem',
    category: 'Saúde e Bem-estar',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    ivaReduction: 0.6,
    notes: 'Atividade regulamentada pelo COREN. Exige registro da empresa e indicação de Responsável Técnico.'
  },
  {
    code: '8650-0/02',
    description: 'Atividades de fonoaudiologia',
    category: 'Saúde e Bem-estar',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    ivaReduction: 0.6,
    notes: 'Atividade regulamentada pelo CREFONO. Exige registro da empresa e indicação de Responsável Técnico.'
  },
  {
    code: '8650-0/03',
    description: 'Atividades de psicologia e psicanálise',
    category: 'Saúde e Bem-estar',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    ivaReduction: 0.6,
    notes: 'Atividade regulamentada pelo CRP. Exige registro da empresa e indicação de Responsável Técnico.'
  },
  {
    code: '8650-0/04',
    description: 'Atividades de fisioterapia',
    category: 'Saúde e Bem-estar',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    ivaReduction: 0.6,
    notes: 'Atividade regulamentada pelo CREFITO. Exige registro da empresa e indicação de Responsável Técnico.'
  },
  {
    code: '8650-0/05',
    description: 'Atividades de terapia ocupacional',
    category: 'Saúde e Bem-estar',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    ivaReduction: 0.6,
    notes: 'Atividade regulamentada pelo CREFITO. Exige registro da empresa e indicação de Responsável Técnico.'
  },
  {
    code: '8650-0/06',
    description: 'Atividades de nutrição',
    category: 'Saúde e Bem-estar',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    ivaReduction: 0.6,
    notes: 'Atividade regulamentada pelo CRN. Exige registro da empresa e indicação de Responsável Técnico.'
  },
  {
    code: '3250-7/06',
    description: 'Serviços de prótese dentária',
    category: 'Saúde e Bem-estar',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    ivaReduction: 0.6,
    notes: 'Atividade regulamentada pelo CRO. Exige registro da empresa e indicação de Responsável Técnico.'
  },
  {
    code: '3250-7/09',
    description: 'Serviço de laboratório óptico',
    category: 'Saúde e Bem-estar',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    ivaReduction: 0.6,
    notes: 'Atividade regulamentada pelo CBOO. Exige registro da empresa e indicação de Responsável Técnico.'
  },

  // --- TECNOLOGIA DA INFORMAÇÃO ---
  {
    code: '6201-5/01',
    description: 'Desenvolvimento de programas de computador sob encomenda',
    category: 'Tecnologia da Informação',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '6201-5/02',
    description: 'Web design',
    category: 'Tecnologia da Informação',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '6202-3/00',
    description: 'Desenvolvimento e licenciamento de programas de computador customizáveis',
    category: 'Tecnologia da Informação',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '6203-1/00',
    description: 'Desenvolvimento e licenciamento de programas de computador não-customizáveis',
    category: 'Tecnologia da Informação',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '6204-0/00',
    description: 'Consultoria em tecnologia da informação',
    category: 'Tecnologia da Informação',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '6209-1/00',
    description: 'Suporte técnico, manutenção e outros serviços em tecnologia da informação',
    category: 'Tecnologia da Informação',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    notes: 'Atividade regulamentada pelo CREA. Exige registro da empresa e indicação de Responsável Técnico.'
  },
  {
    code: '6311-9/00',
    description: 'Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet',
    category: 'Tecnologia da Informação',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '6319-4/00',
    description: 'Portais, provedores de conteúdo e outros serviços de informação na internet',
    category: 'Tecnologia da Informação',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: false
  },

  // --- ENGENHARIA, ARQUITETURA E DESIGN ---
  {
    code: '7111-1/00',
    description: 'Serviços de arquitetura',
    category: 'Engenharia, Arquitetura e Design',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    ivaReduction: 0.3,
    notes: 'Atividade regulamentada pelo CAU. Exige registro da empresa e um Responsável Técnico arquiteto.'
  },
  {
    code: '7112-0/00',
    description: 'Serviços de engenharia',
    category: 'Engenharia, Arquitetura e Design',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    ivaReduction: 0.3,
    notes: 'Atividade regulamentada pelo CREA. Exige registro da empresa e um Responsável Técnico engenheiro.'
  },
  {
    code: '7119-7/03',
    description: 'Serviços de desenho técnico relacionados à arquitetura e engenharia',
    category: 'Engenharia, Arquitetura e Design',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '7410-2/02',
    description: 'Design de interiores',
    category: 'Engenharia, Arquitetura e Design',
    annex: 'IV',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false,
    notes: 'Apesar de poder ser Simples Nacional Anexo IV, é mais comum a tributação no Anexo III.'
  },
  
  // --- CONSULTORIA E GESTÃO ---
  {
    code: '7020-4/00',
    description: 'Atividades de consultoria em gestão empresarial',
    category: 'Consultoria e Gestão Empresarial',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    notes: 'Atividade regulamentada pelo CRA. Exige registro da empresa e indicação de Responsável Técnico.'
  },

  // --- PUBLICIDADE E MARKETING ---
  {
    code: '7311-4/00',
    description: 'Agências de publicidade',
    category: 'Publicidade e Marketing',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '7319-0/02',
    description: 'Promoção de vendas',
    category: 'Publicidade e Marketing',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '7319-0/03',
    description: 'Marketing direto',
    category: 'Publicidade e Marketing',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '7319-0/04',
    description: 'Consultoria em publicidade',
    category: 'Publicidade e Marketing',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '5911-1/02',
    description: 'Produção de filmes para publicidade',
    category: 'Publicidade e Marketing',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },

  // --- EDUCAÇÃO E TREINAMENTO ---
  {
    code: '8599-6/03',
    description: 'Treinamento em informática',
    category: 'Educação e Treinamento',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false,
    ivaReduction: 0.6
  },
  {
    code: '8599-6/04',
    description: 'Treinamento em desenvolvimento profissional e gerencial',
    category: 'Educação e Treinamento',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false,
    ivaReduction: 0.6
  },
  {
    code: '8599-6/05',
    description: 'Cursos preparatórios para concursos',
    category: 'Educação e Treinamento',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false,
    ivaReduction: 0.6
  },
  {
    code: '8599-6/99',
    description: 'Outras atividades de ensino não especificadas anteriormente',
    category: 'Educação e Treinamento',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: false,
    ivaReduction: 0.6
  },
  
  // --- SERVIÇOS ADMINISTRATIVOS E DE APOIO ---
  {
    code: '8211-3/00',
    description: 'Serviços combinados de escritório e apoio administrativo',
    category: 'Serviços Administrativos e de Apoio',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '8219-9/99',
    description: 'Preparação de documentos e serviços especializados de apoio administrativo não especificados anteriormente',
    category: 'Serviços Administrativos e de Apoio',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '8230-0/01',
    description: 'Serviços de organização de feiras, congressos, exposições e festas',
    category: 'Serviços Administrativos e de Apoio',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '8230-0/02',
    description: 'Casas de festas e eventos',
    category: 'Serviços Administrativos e de Apoio',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },

  // --- ATIVIDADES JURÍDICAS E CONTÁBEIS ---
  {
    code: '6911-7/01',
    description: 'Serviços advocatícios',
    category: 'Atividades Jurídicas e Contábeis',
    annex: 'IV',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: true,
    ivaReduction: 0.3,
    notes: 'Atividade regulamentada pela OAB. É obrigatório o registro da sociedade na OAB e deve ser composta apenas por advogados.'
  },
  {
    code: '6920-6/01',
    description: 'Atividades de contabilidade',
    category: 'Atividades Jurídicas e Contábeis',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    ivaReduction: 0.3,
    notes: 'Atividade regulamentada pelo CRC. Exige registro da empresa e um Responsável Técnico contador.'
  },
  {
    code: '6911-7/02',
    description: 'Atividades auxiliares da justiça',
    category: 'Atividades Jurídicas e Contábeis',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: true
  },

  // --- REPRESENTAÇÃO COMERCIAL ---
  {
    code: '4512-9/01',
    description: 'Representantes comerciais e agentes do comércio de veículos automotores',
    category: 'Representação Comercial',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    notes: 'Atividade regulamentada pelo CORE. Obrigatório registro da PJ no conselho.'
  },
  {
    code: '4530-7/06',
    description: 'Representantes comerciais e agentes do comércio de peças e acessórios para veículos automotores',
    category: 'Representação Comercial',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    notes: 'Atividade regulamentada pelo CORE. Obrigatório registro da PJ no conselho.'
  },
  {
    code: '4619-2/00',
    description: 'Representantes comerciais e agentes do comércio de mercadorias em geral não especializado',
    category: 'Representação Comercial',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    notes: 'Atividade regulamentada pelo CORE. Obrigatório registro da PJ no conselho.'
  },
  {
    code: '4618-4/99',
    description: 'Outros representantes comerciais e agentes do comércio especializado em produtos não especificados',
    category: 'Representação Comercial',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    notes: 'Atividade regulamentada pelo CORE. Obrigatório registro da PJ no conselho.'
  },

  // --- ATIVIDADES ARTÍSTICAS, CRIATIVAS E DE ESPETÁCULOS ---
  {
    code: '9001-9/01',
    description: 'Produção teatral',
    category: 'Atividades artísticas, criativas e de espetáculos',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false,
    ivaReduction: 0.6
  },
  {
    code: '9001-9/02',
    description: 'Produção musical',
    category: 'Atividades artísticas, criativas e de espetáculos',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false,
    ivaReduction: 0.6
  },
  {
    code: '9001-9/03',
    description: 'Produção de espetáculos de dança',
    category: 'Atividades artísticas, criativas e de espetáculos',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false,
    ivaReduction: 0.6
  },
  {
    code: '9001-9/04',
    description: 'Produção de espetáculos circenses, de marionetes e similares',
    category: 'Atividades artísticas, criativas e de espetáculos',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false,
    ivaReduction: 0.6
  },
  {
    code: '9001-9/05',
    description: 'Produção de espetáculos de rodeios, vaquejadas e similares',
    category: 'Atividades artísticas, criativas e de espetáculos',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false,
    ivaReduction: 0.6
  },
  {
    code: '9001-9/06',
    description: 'Atividades de sonorização e de iluminação',
    category: 'Atividades artísticas, criativas e de espetáculos',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false,
    ivaReduction: 0.6
  },
  {
    code: '9001-9/99',
    description: 'Artes cênicas, espetáculos e atividades complementares',
    category: 'Atividades artísticas, criativas e de espetáculos',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false,
    ivaReduction: 0.6
  },
  
  // --- ALUGUÉIS E GESTÃO DE ATIVOS ---
  {
    code: '7739-0/01',
    description: 'Aluguel de máquinas para extração de minérios e petróleo, sem operador',
    category: 'Aluguéis não-imobiliários e gestão de ativos intangíveis',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '7739-0/02',
    description: 'Aluguel de equipamentos científicos, médicos e hospitalares, sem operador',
    category: 'Aluguéis não-imobiliários e gestão de ativos intangíveis',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '7739-0/03',
    description: 'Aluguel de palcos, coberturas e outras estruturas de uso temporário, exceto andaimes',
    category: 'Aluguéis não-imobiliários e gestão de ativos intangíveis',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '7739-0/99',
    description: 'Aluguel de outras máquinas e equipamentos comerciais e industriais',
    category: 'Aluguéis não-imobiliários e gestão de ativos intangíveis',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '7740-3/00',
    description: 'Gestão de ativos intangíveis não financeiros',
    category: 'Aluguéis não-imobiliários e gestão de ativos intangíveis',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: true,
    notes: 'Atividade regulamentada. O enquadramento no Anexo III depende do Fator R.'
  },

  // --- DIVERSOS ---
  {
    code: '4399-1/01',
    description: 'Administração de obras',
    category: 'Construção Civil',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: true,
    notes: 'Atividade regulamentada pelo CREA ou CAU. Exige registro da empresa e indicação de Responsável Técnico.'
  },
  {
    code: '4751-2/02',
    description: 'Recarga de cartuchos para equipamentos de informática',
    category: 'Serviços de Tecnologia',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '6612-6/05',
    description: 'Agentes de investimentos em aplicações financeiras',
    category: 'Serviços Financeiros e Imobiliários',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: true,
    notes: 'Atividade regulamentada pela CVM. É obrigatório o registro da PJ.'
  },
  {
    code: '7420-0/01',
    description: 'Atividades de produção de fotografias, exceto aérea e submarina',
    category: 'Fotografia e Design',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '7490-1/05',
    description: 'Agenciamento de profissionais para atividades esportivas, culturais e artísticas',
    category: 'Agenciamento e Representação',
    annex: 'V',
    requiresFatorR: true,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '9319-1/01',
    description: 'Produção e promoção de eventos esportivos',
    category: 'Turismo e Eventos',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '5911-1/99',
    description: 'Atividades de produção cinematográfica, de vídeos e de programas de televisão não especificadas anteriormente',
    category: 'Mídia e Audiovisual',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '5912-0/01',
    description: 'Serviços de dublagem',
    category: 'Mídia e Audiovisual',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '5912-0/02',
    description: 'Serviços de mixagem sonora em produção audiovisual',
    category: 'Mídia e Audiovisual',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '5912-0/99',
    description: 'Atividades de pós-produção cinematográfica, de vídeos e de programas de televisão não especificadas anteriormente',
    category: 'Mídia e Audiovisual',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '5913-8/00',
    description: 'Distribuição cinematográfica, de vídeo e de programas de televisão',
    category: 'Mídia e Audiovisual',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  {
    code: '5920-1/00',
    description: 'Atividades de gravação de som e de edição de música',
    category: 'Mídia e Audiovisual',
    annex: 'III',
    requiresFatorR: false,
    presumedProfitRate: 0.32,
    isRegulated: false
  },
  // COMÉRCIO VAREJISTA (ANEXO I)
  {
    code: '4744-0/99',
    description: 'Comércio varejista de materiais de construção em geral',
    category: 'Comércio Varejista',
    annex: 'I',
    requiresFatorR: false,
    presumedProfitRate: 0.08,
    isRegulated: false
  },
  {
    code: '4751-2/01',
    description: 'Comércio varejista especializado de equipamentos e suprimentos de informática',
    category: 'Comércio Varejista',
    annex: 'I',
    requiresFatorR: false,
    presumedProfitRate: 0.08,
    isRegulated: false
  },
  {
    code: '4753-9/00',
    description: 'Comércio varejista especializado de eletrodomésticos e equipamentos de áudio e vídeo',
    category: 'Comércio Varejista',
    annex: 'I',
    requiresFatorR: false,
    presumedProfitRate: 0.08,
    isRegulated: false
  },
  {
    code: '4761-0/03',
    description: 'Comércio varejista de artigos de papelaria',
    category: 'Comércio Varejista',
    annex: 'I',
    requiresFatorR: false,
    presumedProfitRate: 0.08,
    isRegulated: false
  },
  {
    code: '4781-4/00',
    description: 'Comércio varejista de artigos do vestuário e acessórios',
    category: 'Comércio Varejista',
    annex: 'I',
    requiresFatorR: false,
    presumedProfitRate: 0.08,
    isRegulated: false
  },
  {
    code: '4789-0/01',
    description: 'Comércio varejista de suvenires, bijuterias e artesanatos',
    category: 'Comércio Varejista',
    annex: 'I',
    requiresFatorR: false,
    presumedProfitRate: 0.08,
    isRegulated: false
  }
];
