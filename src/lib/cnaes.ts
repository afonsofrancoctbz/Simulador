import { type CnaeData } from './types';

// This is a sample list. A real-world application would use a comprehensive database.
export const CNAE_DATA: CnaeData[] = [
  // === CONSULTORIA ===
  { code: '7020-4/00', description: 'Atividades de consultoria em gestão empresarial, exceto consultoria técnica específica', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '6911-7/01', description: 'Serviços advocatícios', annex: 'IV', presumedProfitRate: 0.32 },
  { code: '6612-6/05', description: 'Agentes de investimentos em aplicações financeiras (Consultoria Financeira)', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '7319-0/04', description: 'Consultoria em publicidade', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '6204-0/00', description: 'Consultoria em tecnologia da informação', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '6920-6/02', description: 'Atividades de consultoria e auditoria contábil e tributária', annex: 'III', presumedProfitRate: 0.32 },

  // === DESENVOLVIMENTO DE SOFTWARE E TECNOLOGIA ===
  { code: '6201-5/01', description: 'Desenvolvimento de programas de computador sob encomenda', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '6201-5/02', description: 'Web design', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '6203-1/00', description: 'Desenvolvimento e licenciamento de programas de computador não-customizáveis', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '6202-3/00', description: 'Desenvolvimento e licenciamento de programas de computador customizáveis', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '6209-1/00', description: 'Suporte técnico, manutenção e outros serviços em tecnologia da informação', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '6311-9/00', description: 'Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },

  // === EDUCAÇÃO ===
  { code: '8511-2/00', description: 'Educação infantil - creche', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8512-1/00', description: 'Educação infantil - pré-escola', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8513-9/00', description: 'Ensino fundamental', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8520-1/00', description: 'Ensino médio', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8531-7/00', description: 'Educação superior - graduação', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8532-5/00', description: 'Educação superior - graduação e pós-graduação', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8533-3/00', description: 'Educação superior - pós-graduação e extensão', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8541-4/00', description: 'Educação profissional de nível técnico', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8542-2/00', description: 'Educação profissional de nível tecnológico', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8550-3/02', description: 'Atividades de apoio à educação, exceto caixas escolares', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8599-6/03', description: 'Treinamento em informática', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8599-6/04', description: 'Treinamento em desenvolvimento profissional e gerencial', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8599-6/99', description: 'Outras atividades de ensino não especificadas anteriormente', annex: 'III', presumedProfitRate: 0.32 },

  // === ADMINISTRAÇÃO ===
  { code: '8211-3/00', description: 'Serviços combinados de escritório e apoio administrativo', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8219-9/99', description: 'Preparação de documentos e serviços especializados de apoio administrativo', annex: 'III', presumedProfitRate: 0.32 },

  // === ENGENHARIA E ARQUITETURA ===
  { code: '7111-1/00', description: 'Serviços de arquitetura', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '7112-0/00', description: 'Serviços de engenharia', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '7119-7/03', description: 'Serviços de desenho técnico relacionados à arquitetura e engenharia', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '7119-7/99', description: 'Atividades técnicas relacionadas à engenharia e arquitetura não especificadas', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },

  // === SERVIÇOS MÉDICOS E DE SAÚDE ===
  { code: '8630-5/03', description: 'Atividade médica ambulatorial restrita a consultas', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8630-5/04', description: 'Atividade odontológica', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8630-5/02', description: 'Atividade médica ambulatorial com recursos para realização de exames complementares', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '8610-1/02', description: 'Atividades de atendimento em pronto-socorro e unidades hospitalares para atendimento a urgências', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8630-5/01', description: 'Atividade médica ambulatorial com recursos para realização de procedimentos cirúrgicos', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '8610-1/01', description: 'Atividades de atendimento hospitalar, exceto pronto-socorro e unidades para atendimento a urgências', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8650-0/03', description: 'Atividades de psicologia e psicanálise', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8650-0/04', description: 'Atividades de fisioterapia', annex: 'III', presumedProfitRate: 0.32 },

  // === PUBLICIDADE E MARKETING ===
  { code: '7311-4/00', description: 'Agências de publicidade', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '7319-0/02', description: 'Promoção de vendas', annex: 'III', presumedProfitRate: 0.32 },
  { code: '7319-0/03', description: 'Marketing direto', annex: 'III', presumedProfitRate: 0.32 },
  { code: '7319-0/99', description: 'Outras atividades de publicidade não especificadas anteriormente', annex: 'III', presumedProfitRate: 0.32 },

  // === TURISMO ===
  { code: '7912-1/00', description: 'Operadores turísticos', annex: 'III', presumedProfitRate: 0.32 },
  { code: '7911-2/00', description: 'Agências de viagens', annex: 'III', presumedProfitRate: 0.32 },
  { code: '7990-2/00', description: 'Serviços de reservas e outros serviços de turismo não especificados', annex: 'III', presumedProfitRate: 0.32 },

  // === CORRETAGEM DE IMÓVEIS ===
  { code: '6821-8/01', description: 'Corretagem na compra e venda e avaliação de imóveis', annex: 'III', presumedProfitRate: 0.32 },
  { code: '6821-8/02', description: 'Corretagem no aluguel de imóveis', annex: 'III', presumedProfitRate: 0.32 },
  { code: '6822-6/00', description: 'Gestão e administração da propriedade imobiliária', annex: 'III', presumedProfitRate: 0.32 },

  // === OUTROS SERVIÇOS ===
  { code: '6920-6/01', description: 'Atividades de contabilidade', annex: 'III', presumedProfitRate: 0.32 },
  { code: '7420-0/01', description: 'Atividades de produção de fotografias, exceto aérea e submarina', annex: 'III', presumedProfitRate: 0.32 },
  { code: '9313-1/00', description: 'Atividades de condicionamento físico (Academias)', annex: 'III', presumedProfitRate: 0.32 },
  { code: '4321-5/00', description: 'Instalação e manutenção elétrica', annex: 'IV', presumedProfitRate: 0.32 },
  { code: '4330-4/04', description: 'Serviços de pintura de edifícios em geral', annex: 'IV', presumedProfitRate: 0.32 },
  { code: '8121-4/00', description: 'Limpeza em prédios e em domicílios', annex: 'IV', presumedProfitRate: 0.32 },

  // === COMÉRCIO ===
  { code: '4711-3/02', description: 'Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - supermercados', annex: 'I', presumedProfitRate: 0.08 },
  { code: '4530-7/03', description: 'Comércio a varejo de peças e acessórios novos para veículos automotores', annex: 'I', presumedProfitRate: 0.08 },
  { code: '4781-4/00', description: 'Comércio varejista de artigos do vestuário e acessórios', annex: 'I', presumedProfitRate: 0.08 },
  { code: '4751-2/01', description: 'Comércio varejista especializado de equipamentos e suprimentos de informática', annex: 'I', presumedProfitRate: 0.08 },
  
  // === INDÚSTRIA ===
  { code: '1091-1/02', description: 'Fabricação de produtos de padaria e confeitaria com predominância de produção própria', annex: 'II', presumedProfitRate: 0.08 },
  { code: '2511-0/00', description: 'Fabricação de estruturas metálicas', annex: 'II', presumedProfitRate: 0.08 },
  { code: '1412-6/01', description: 'Confecção de peças de vestuário, exceto roupas íntimas e as confeccionadas sob medida', annex: 'II', presumedProfitRate: 0.08 },
];
