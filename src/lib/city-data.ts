import type { ComponentType } from 'react';
import { Gift, Ban } from 'lucide-react';

export interface CityData {
  name: string;
  state: string;
  cardTitle: string;
  cardDescription: string;
  costs: {
    boardTaxSociety: string;
    boardTaxIndividual: string;
    permitTax: string;
    notes?: string[];
    costZeroCampaign?: boolean;
    advocacyNotes?: string;
    tfeNotes?: string;
  };
  deadlines: {
    cnpj: string;
    nfe: string;
  };
  cnaeRestrictions?: {
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    list: string[];
  };
  nfeEmitter?: {
    type: 'integrated' | 'manual' | 'automatic_import';
    description: string;
  };
  additionalCosts: {
    title: string;
    description: string;
    items?: { title: string; value: string }[];
  };
}

export const CITIES_DATA: { [key: string]: CityData } = {
  'São Paulo - SP': {
    name: 'São Paulo',
    state: 'SP',
    cardTitle: 'Informações para Abrir sua Empresa em São Paulo - SP',
    cardDescription: 'Tudo o que você precisa saber para começar com o pé direito.',
    costs: {
      boardTaxSociety: 'R$ 211,01',
      boardTaxIndividual: 'R$ 91,44',
      permitTax: 'R$ 216,23',
      costZeroCampaign: true,
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
      tfeNotes: 'Taxa de Fiscalização de Estabelecimentos (TFE): Em São Paulo, este é um tributo municipal cobrado anualmente em decorrência das atividades de fiscalização.',
    },
    deadlines: {
      cnpj: '6 dias corridos',
      nfe: '29 dias corridos',
    },
    nfeEmitter: {
      type: 'integrated',
      description: 'Emissor de Notas Fiscais integrado à plataforma para facilitar sua rotina.',
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas os valores iniciais da taxa de alvará. Dependendo da sua atividade e município, podem incidir taxas adicionais como AVCB (Bombeiros) e Vigilância Sanitária, que não estão inclusas nesta estimativa. O custo zero incide apenas sobre o valor da taxa da junta comercial.',
    },
  },
  'Rio de Janeiro - RJ': {
    name: 'Rio de Janeiro',
    state: 'RJ',
    cardTitle: 'Informações para Abrir sua Empresa no Rio de Janeiro - RJ',
    cardDescription: 'Tudo o que você precisa saber para começar com o pé direito na Cidade Maravilhosa.',
    costs: {
      boardTaxSociety: 'R$ 600,00',
      boardTaxIndividual: 'R$ 300,00',
      permitTax: 'R$ 1.138,08',
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
    },
    deadlines: {
      cnpj: '10 dias corridos',
      nfe: '39 dias corridos',
    },
    nfeEmitter: {
      type: 'integrated',
      description: 'Emissor de Notas Fiscais integrado à plataforma para facilitar sua rotina.',
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas os valores iniciais da taxa de alvará municipal. Dependendo da sua atividade e município, podem incidir taxas adicionais.',
      items: [
        { title: 'AVCB (Bombeiros) e Taxas Sanitárias', value: 'Podem ser aplicáveis dependendo da atividade.' },
        { title: 'Taxa de Vigilância Sanitária', value: 'Exigida para atividades de saúde ou comércio de alimentos, com valores entre R$ 90,00 e R$ 200,00.' },
      ],
    },
  },
  'Belo Horizonte - MG': {
    name: 'Belo Horizonte',
    state: 'MG',
    cardTitle: 'Informações para Abrir sua Empresa em Belo Horizonte - MG',
    cardDescription: 'Tudo o que você precisa saber para começar seu negócio na capital mineira.',
    costs: {
      boardTaxSociety: 'R$ 268,51',
      boardTaxIndividual: 'R$ 134,26',
      permitTax: 'R$ 154,10',
      costZeroCampaign: true,
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
      tfeNotes: 'Taxa de Fiscalização de Estabelecimentos (TFE): Em Belo Horizonte, este é um tributo municipal cobrado anualmente em decorrência das atividades de fiscalização.',
    },
    deadlines: {
      cnpj: '9 dias corridos',
      nfe: '27 dias corridos',
    },
    nfeEmitter: {
      type: 'integrated',
      description: 'Emissor de Notas Fiscais integrado à plataforma para facilitar sua rotina.',
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas os valores iniciais da taxa de alvará. Dependendo da sua atividade e município, podem incidir taxas adicionais como AVCB (Bombeiros) e Vigilância Sanitária, que não estão inclusas nesta estimativa. O custo zero incide apenas sobre o valor da taxa da junta comercial.',
    },
  },
    'Curitiba - PR': {
    name: 'Curitiba',
    state: 'PR',
    cardTitle: 'Informações para Abrir sua Empresa em Curitiba - PR',
    cardDescription: 'Tudo o que você precisa saber para começar com o pé direito na capital paranaense.',
    costs: {
      boardTaxSociety: 'R$ 128,30',
      boardTaxIndividual: 'R$ 92,40',
      permitTax: 'R$ 323,86',
      costZeroCampaign: true,
      notes: ['Atenção: Empresas enquadradas como ME (Microempresa) são isentas da Taxa de Alvará em Curitiba.'],
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
    },
    deadlines: {
      cnpj: '7 dias corridos',
      nfe: '22 dias corridos',
    },
    nfeEmitter: {
      type: 'integrated',
      description: 'Emissor de Notas Fiscais integrado à plataforma para facilitar sua rotina.',
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas os valores iniciais da taxa de alvará municipal. Dependendo da sua atividade e município, podem incidir taxas adicionais. O custo zero incide apenas sobre o valor da taxa da junta comercial.',
      items: [
        { title: 'Taxa de Bombeiros', value: 'Cobrada para empresas em endereços comerciais, variando de R$ 90,00 a R$ 200,00.' },
        { title: 'Vigilância Sanitária', value: 'Exigida para atividades de saúde ou comércio de alimentos, com valores entre R$ 90,00 e R$ 200,00.' },
      ],
    },
  },
  'Porto Alegre - RS': {
    name: 'Porto Alegre',
    state: 'RS',
    cardTitle: 'Informações para Abrir sua Empresa em Porto Alegre - RS',
    cardDescription: 'Tudo o que você precisa saber para começar seu negócio na capital gaúcha.',
    costs: {
      boardTaxSociety: 'R$ 197,50',
      boardTaxIndividual: 'R$ 114,05',
      permitTax: 'R$ 39,44',
      costZeroCampaign: true,
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
      tfeNotes: 'Taxa de Fiscalização de Estabelecimentos (TFE): Em Porto Alegre, este é um tributo municipal cobrado anualmente em decorrência das atividades de fiscalização.',
    },
    deadlines: {
      cnpj: '7 dias corridos',
      nfe: '27 dias corridos',
    },
    nfeEmitter: {
      type: 'automatic_import',
      description: 'Você pode emitir as Notas Fiscais no site da prefeitura da sua cidade. Nosso sistema faz a importação automática dessas NFs e também, através dele, você importará seu extrato bancário.',
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas os valores iniciais da taxa de alvará. Dependendo da sua atividade e município, podem incidir taxas adicionais como AVCB (Bombeiros) e Vigilância Sanitária, que não estão inclusas nesta estimativa. O custo zero incide apenas sobre o valor da taxa da junta comercial.',
    },
  },
  'Salvador - BA': {
    name: 'Salvador',
    state: 'BA',
    cardTitle: 'Informações para Abrir sua Empresa em Salvador - BA',
    cardDescription: 'Tudo o que você precisa saber para começar seu negócio na primeira capital do Brasil.',
    costs: {
      boardTaxSociety: 'R$ 349,00',
      boardTaxIndividual: 'R$ 151,00',
      permitTax: 'R$ 1.345,27',
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
      tfeNotes: 'Taxa de Fiscalização de Estabelecimentos (TFF): Em Salvador, este é um tributo municipal cobrado anualmente em decorrência das atividades de fiscalização.',
    },
    deadlines: {
      cnpj: '10 dias corridos',
      nfe: '37 dias corridos',
    },
    nfeEmitter: {
      type: 'manual',
      description: 'Você consegue emitir as Notas Fiscais no site da prefeitura da sua cidade ou nos emissores gratuitos encontrados na Internet. Uma vez por mês, você registra os dados das notas fiscais em nosso sistema.',
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas os valores iniciais da taxa de alvará. Dependendo da sua atividade e município, podem incidir taxas adicionais como AVCB (Bombeiros) e Vigilância Sanitária, que não estão inclusas nesta estimativa.',
    },
  },
  'Fortaleza - CE': {
    name: 'Fortaleza',
    state: 'CE',
    cardTitle: 'Informações para Abrir sua Empresa em Fortaleza - CE',
    cardDescription: 'Tudo o que você precisa saber para começar seu negócio na Terra da Luz.',
    costs: {
      boardTaxSociety: 'R$ 260,06',
      boardTaxIndividual: 'R$ 147,85',
      permitTax: 'R$ 473,88',
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
    },
    deadlines: {
      cnpj: '9 dias corridos',
      nfe: '32 dias corridos',
    },
    nfeEmitter: {
      type: 'manual',
      description: 'Dentro do nosso sistema de contabilidade tem um emissor de notas fiscais, para facilitar elas já ficam salvas por lá! E também por lá, vai importar o seu extrato bancário da conta PJ em formato OFX (formato do banco).',
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas valores iniciais da taxa de alvará. Dependendo da sua atividade e município, podem incidir taxas adicionais como AVCB (Bombeiros) e Vigilância Sanitária.',
      items: [
        { title: 'Taxa de Bombeiros', value: 'Cobrada no valor de R$ 2,69 para empresas em endereço residencial.' },
        { title: 'Taxa de Fiscalização de Estabelecimentos (TFE)', value: 'Tributo municipal cobrado anualmente.' },
      ],
    },
  },
  'Recife - PE': {
    name: 'Recife',
    state: 'PE',
    cardTitle: 'Informações para Abrir sua Empresa em Recife - PE',
    cardDescription: 'Tudo o que você precisa saber para começar seu negócio na capital pernambucana.',
    costs: {
      boardTaxSociety: 'R$ 396,00',
      boardTaxIndividual: 'R$ 137,00',
      permitTax: 'R$ 488,36',
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
      tfeNotes: 'Taxa de Fiscalização de Estabelecimentos (TFE): Em Recife, este é um tributo municipal cobrado anualmente em decorrência das atividades de fiscalização.',
    },
    deadlines: {
      cnpj: '10 dias corridos',
      nfe: '42 dias corridos',
    },
    nfeEmitter: {
      type: 'manual',
      description: 'Você pode emitir as Notas Fiscais no site da prefeitura da sua cidade ou nos emissores gratuitos encontrados na Internet. Uma vez por mês você vai importar o arquivo XML no nosso sistema e também por lá, vai importar o seu extrato bancário da conta PJ em formato OFX (formato do banco).',
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas os valores iniciais da taxa de alvará. Dependendo da sua atividade e município, podem incidir taxas adicionais como AVCB (Bombeiros) e Vigilância Sanitária.',
    },
  },
  'Brasília - DF': {
    name: 'Brasília',
    state: 'DF',
    cardTitle: 'Informações para Abrir sua Empresa em Brasília - DF',
    cardDescription: 'Tudo o que você precisa saber para começar seu negócio na capital federal.',
    costs: {
      boardTaxSociety: 'R$ 388,91',
      boardTaxIndividual: 'R$ 197,76',
      permitTax: 'R$ 44,37',
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
    },
    deadlines: {
      cnpj: '9 dias corridos',
      nfe: '38 dias corridos',
    },
    cnaeRestrictions: {
      icon: Ban,
      title: 'CNAEs com Restrições de Endereço',
      description: 'Para os CNAEs abaixo, é permitido somente a abertura de empresa em endereço comercial:',
      list: [
        '8630-5/01 - Atividade médica ambulatorial com recursos para realização de procedimentos cirúrgicos;',
        '8630-5/02 - Atividade médica ambulatorial com recursos para realização de exames complementares;',
        '8610-1/01 - Atividades de atendimento hospitalar, exceto pronto socorro e unidades para atendimento a urgências;',
        '8610-1/02 - Atividades de atendimento em pronto-socorro e unidades hospitalares para atendimento a urgências.',
      ],
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas os valores iniciais da taxa de alvará. Dependendo da sua atividade e município, podem incidir taxas adicionais como AVCB (Bombeiros) e Vigilância Sanitária.',
    },
  },
  'Goiânia - GO': {
    name: 'Goiânia',
    state: 'GO',
    cardTitle: 'Informações para Abrir sua Empresa em Goiânia - GO',
    cardDescription: 'Tudo o que você precisa saber para começar seu negócio na capital goiana.',
    costs: {
      boardTaxSociety: 'R$ 338,00',
      boardTaxIndividual: 'R$ 202,00',
      permitTax: 'R$ 998,43',
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
      tfeNotes: 'Taxa de Fiscalização de Estabelecimentos (TFE): Em Goiânia, este é um tributo municipal cobrado anualmente em decorrência das atividades de fiscalização.',
    },
    deadlines: {
      cnpj: '9 dias corridos',
      nfe: '50 dias corridos',
    },
    nfeEmitter: {
      type: 'manual',
      description: 'Você pode emitir as Notas Fiscais no site da prefeitura da sua cidade ou nos emissores gratuitos encontrados na Internet. Uma vez por mês você vai importar o arquivo XML no nosso sistema e também por lá, vai importar o seu extrato bancário da conta PJ em formato OFX (formato do banco).',
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas os valores iniciais da taxa de alvará. Dependendo da sua atividade e município, podem incidir taxas adicionais como AVCB (Bombeiros) e Vigilância Sanitária.',
    },
  },
  'Manaus - AM': {
    name: 'Manaus',
    state: 'AM',
    cardTitle: 'Informações para Abrir sua Empresa em Manaus - AM',
    cardDescription: 'Tudo o que você precisa saber para começar seu negócio na capital do Amazonas.',
    costs: {
      boardTaxSociety: 'R$ 571,42',
      boardTaxIndividual: 'N/A', // Assuming EI is not applicable or same as society
      permitTax: 'R$ 192,95',
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
    },
    deadlines: {
      cnpj: '12 dias corridos',
      nfe: '45 dias corridos',
    },
    nfeEmitter: {
      type: 'manual',
      description: 'Você consegue emitir as Notas Fiscais no site da prefeitura da sua cidade ou nos emissores gratuitos encontrados na Internet. Uma vez por mês você vai registrar os dados das notas fiscais no nosso sistema e também por lá, vai importar o seu extrato bancário da conta PJ em formato OFX (formato do banco).',
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas os valores iniciais da taxa de alvará. Dependendo da sua atividade e município, podem incidir taxas adicionais como AVCB (Bombeiros) e Vigilância Sanitária.',
    },
  },
  'Florianópolis - SC': {
    name: 'Florianópolis',
    state: 'SC',
    cardTitle: 'Informações para Abrir sua Empresa em Florianópolis - SC',
    cardDescription: 'Tudo o que você precisa saber para começar seu negócio na Ilha da Magia.',
    costs: {
      boardTaxSociety: 'R$ 168,00',
      boardTaxIndividual: 'R$ 82,00',
      permitTax: 'R$ 144,88',
      costZeroCampaign: true,
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
    },
    deadlines: {
      cnpj: '9 dias corridos',
      nfe: '40 dias corridos',
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas os valores iniciais. Dependendo da sua atividade, outras taxas podem ser aplicáveis: \n O Custo Zero refere-se apenas à isenção da taxa da Junta Comercial.',
      items: [
        { title: 'Taxa Sanitária', value: 'A partir de R$ 170,00.' },
        { title: 'Taxa de Bombeiros', value: 'A partir de R$ 50,00 (para áreas de 50m²).' },
        { title: 'Taxa Municipal', value: 'A partir de R$ 500,00 (varia com a atividade).' },
        { title: 'Taxa de Expediente', value: 'R$ 68,22.' },
        { title: 'Taxa Cadastro Emissor NF', value: 'R$ 51,16.' },
        { title: 'Renovação Municipal', value: 'R$ 20,00 (janeiro de cada ano).' },
      ],
    },
  },
  'Campinas - SP': {
    name: 'Campinas',
    state: 'SP',
    cardTitle: 'Informações para Abrir sua Empresa em Campinas - SP',
    cardDescription: 'Tudo o que você precisa saber para começar seu negócio em Campinas.',
    costs: {
      boardTaxSociety: 'R$ 211,01',
      boardTaxIndividual: 'R$ 91,44',
      permitTax: 'R$ 180,00',
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
      tfeNotes: 'Taxa de Fiscalização de Estabelecimentos (TFE): Em Campinas, este é um tributo municipal cobrado anualmente em decorrência das atividades de fiscalização.',
    },
    deadlines: {
      cnpj: '15 dias corridos',
      nfe: '38 dias corridos',
    },
    nfeEmitter: {
      type: 'manual',
      description: 'Você pode emitir as Notas Fiscais no site da prefeitura da sua cidade ou nos emissores gratuitos encontrados na Internet. Uma vez por mês você vai importar o arquivo XML no nosso sistema e também por lá, vai importar o seu extrato bancário da conta PJ em formato OFX (formato do banco).',
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas os valores iniciais da taxa de alvará. Dependendo da sua atividade e município, podem incidir taxas adicionais como AVCB (Bombeiros) e Vigilância Sanitária.',
    },
  },
  'Jundiaí - SP': {
    name: 'Jundiaí',
    state: 'SP',
    cardTitle: 'Informações para Abrir sua Empresa em Jundiaí - SP',
    cardDescription: 'Tudo o que você precisa saber para começar seu negócio em Jundiaí.',
    costs: {
      boardTaxSociety: 'R$ 211,01',
      boardTaxIndividual: 'R$ 91,44',
      permitTax: 'R$ 300,13',
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
      tfeNotes: 'Taxa de Fiscalização de Estabelecimentos (TFE): Em Jundiaí, este é um tributo municipal cobrado anualmente em decorrência das atividades de fiscalização.',
    },
    deadlines: {
      cnpj: '10 dias corridos',
      nfe: '57 dias corridos',
    },
    nfeEmitter: {
      type: 'manual',
      description: 'Você pode emitir as Notas Fiscais no site da prefeitura da sua cidade ou nos emissores gratuitos encontrados na Internet. Uma vez por mês você vai importar o arquivo XML no nosso sistema e também por lá, vai importar o seu extrato bancário da conta PJ em formato OFX (formato do banco).',
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas os valores iniciais da taxa de alvará. Dependendo da sua atividade e município, podem incidir taxas adicionais como AVCB (Bombeiros) e Vigilância Sanitária.',
    },
  },
  'Uberlândia - MG': {
    name: 'Uberlândia',
    state: 'MG',
    cardTitle: 'Informações para Abrir sua Empresa em Uberlândia - MG',
    cardDescription: 'Tudo o que você precisa saber para começar seu negócio em Uberlândia.',
    costs: {
      boardTaxSociety: 'R$ 268,51',
      boardTaxIndividual: 'R$ 134,26',
      permitTax: 'R$ 90,42',
      advocacyNotes: 'Para atividades de advocacia: O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.',
      tfeNotes: 'Taxa de Fiscalização de Estabelecimentos (TFE): Em Uberlândia, este é um tributo municipal cobrado anualmente em decorrência das atividades de fiscalização.',
    },
    deadlines: {
      cnpj: '10 dias corridos',
      nfe: '31 dias corridos',
    },
    nfeEmitter: {
      type: 'manual',
      description: 'Você pode emitir as Notas Fiscais no site da prefeitura da sua cidade ou nos emissores gratuitos encontrados na Internet. Uma vez por mês você vai importar o arquivo XML no nosso sistema e também por lá, vai importar o seu extrato bancário da conta PJ em formato OFX (formato do banco).',
    },
    additionalCosts: {
      title: 'Atenção aos Custos Adicionais',
      description: 'Este simulador contempla apenas os valores iniciais da taxa de alvará. Dependendo da sua atividade e município, podem incidir taxas adicionais como AVCB (Bombeiros) e Vigilância Sanitária.',
    },
  },
};
