import { type CnaeData } from './types';

// This is a sample list. A real-world application would use a comprehensive database.
export const CNAE_DATA: CnaeData[] = [
  // ANEXO I - Comércio
  { code: '4711-3/02', description: 'Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - supermercados', annex: 'I', presumedProfitRate: 0.08 },
  { code: '4530-7/03', description: 'Comércio a varejo de peças e acessórios novos para veículos automotores', annex: 'I', presumedProfitRate: 0.08 },
  { code: '4781-4/00', description: 'Comércio varejista de artigos do vestuário e acessórios', annex: 'I', presumedProfitRate: 0.08 },
  { code: '4751-2/01', description: 'Comércio varejista especializado de equipamentos e suprimentos de informática', annex: 'I', presumedProfitRate: 0.08 },
  
  // ANEXO II - Indústria
  { code: '1091-1/02', description: 'Fabricação de produtos de padaria e confeitaria com predominância de produção própria', annex: 'II', presumedProfitRate: 0.08 },
  { code: '2511-0/00', description: 'Fabricação de estruturas metálicas', annex: 'II', presumedProfitRate: 0.08 },
  { code: '1412-6/01', description: 'Confecção de peças de vestuário, exceto roupas íntimas e as confeccionadas sob medida', annex: 'II', presumedProfitRate: 0.08 },
  
  // ANEXO III - Serviços
  { code: '7319-0/02', description: 'Promoção de vendas', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8219-9/99', description: 'Preparação de documentos e serviços especializados de apoio administrativo não especificados', annex: 'III', presumedProfitRate: 0.32 },
  { code: '6920-6/01', description: 'Atividades de contabilidade', annex: 'III', presumedProfitRate: 0.32 },
  { code: '7420-0/01', description: 'Atividades de produção de fotografias, exceto aérea e submarina', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8630-5/03', description: 'Atividade médica ambulatorial restrita a consultas', annex: 'III', presumedProfitRate: 0.32 },
  { code: '8650-0/03', description: 'Atividades de psicologia e psicanálise', annex: 'III', presumedProfitRate: 0.32 },

  // ANEXO IV - Serviços
  { code: '4321-5/00', description: 'Instalação e manutenção elétrica', annex: 'IV', presumedProfitRate: 0.32 },
  { code: '4330-4/04', description: 'Serviços de pintura de edifícios em geral', annex: 'IV', presumedProfitRate: 0.32 },
  { code: '7112-0/00', description: 'Serviços de engenharia', annex: 'IV', presumedProfitRate: 0.32 },
  { code: '8121-4/00', description: 'Limpeza em prédios e em domicílios', annex: 'IV', presumedProfitRate: 0.32 },
  
  // ANEXO V - Serviços (Sujeito ao Fator R)
  { code: '6201-5/01', description: 'Desenvolvimento de programas de computador sob encomenda', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '6202-3/00', description: 'Desenvolvimento e licenciamento de programas de computador customizáveis', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '6203-1/00', description: 'Desenvolvimento e licenciamento de programas de computador não-customizáveis', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '6204-0/00', description: 'Consultoria em tecnologia da informação', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '7020-4/00', description: 'Atividades de consultoria em gestão empresarial', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '7311-4/00', description: 'Agências de publicidade', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
  { code: '6311-9/00', description: 'Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet', annex: 'V', requiresFatorR: true, presumedProfitRate: 0.32 },
];
