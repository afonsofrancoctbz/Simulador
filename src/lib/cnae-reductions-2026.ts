// src/lib/cnae-reductions-2026.ts
// Base de dados de reduções IBS/CBS por CNAE conforme Lei Complementar e Regulamentação

export interface NBSReduction {
    nbs: string;
    descricao: string;
    cClassTrib: string;
    cClassTribDescricao: string;
    reducaoIBS: number; // Percentual: 60 = 60%
    reducaoCBS: number; // Percentual: 60 = 60%
    itemLC116: string;
    itemLC116Descricao: string;
  }
  
  export interface CNAEReductionData {
    cnae: string;
    descricao: string;
    reducoes: NBSReduction[];
    // Redução padrão quando não há especificação (usa a mais favorável)
    defaultReduction?: {
      ibs: number;
      cbs: number;
    };
  }
  
  // Base de dados completa de reduções
  export const CNAE_REDUCTIONS_DATABASE: Record<string, CNAEReductionData> = {
    // Tecnologia da Informação - Alta redução
    '6203100': {
      cnae: '6203100',
      descricao: 'Desenvolvimento e licenciamento de programas de computador customizáveis',
      reducoes: [
        {
          nbs: '1.1502.90.00',
          descricao: 'Serviços de análise e desenvolvimento de sistemas não classificados',
          cClassTrib: '010101',
          cClassTribDescricao: 'Análise E Desenvolvimento De Sistemas',
          reducaoIBS: 60,
          reducaoCBS: 60,
          itemLC116: '01.01',
          itemLC116Descricao: 'Análise E Desenvolvimento De Sistemas'
        }
      ],
      defaultReduction: { ibs: 60, cbs: 60 }
    },
  
    '6204000': {
      cnae: '6204000',
      descricao: 'Consultoria em tecnologia da informação',
      reducoes: [
        {
          nbs: '1.1502.90.00',
          descricao: 'Serviços de análise e desenvolvimento de sistemas não classificados',
          cClassTrib: '010101',
          cClassTribDescricao: 'Análise E Desenvolvimento De Sistemas',
          reducaoIBS: 60,
          reducaoCBS: 60,
          itemLC116: '01.01',
          itemLC116Descricao: 'Análise E Desenvolvimento De Sistemas'
        },
        {
          nbs: '1.1502.90.05',
          descricao: 'Serviços de projeto e desenvolvimento, adaptação e instalação de aplicativos',
          cClassTrib: '010201',
          cClassTribDescricao: 'Programação',
          reducaoIBS: 60,
          reducaoCBS: 60,
          itemLC116: '01.02',
          itemLC116Descricao: 'Programação'
        },
        {
          nbs: '1.1502.90.00',
          descricao: 'Serviços de análise e desenvolvimento de sistemas não classificados',
          cClassTrib: '010401',
          cClassTribDescricao: 'Elaboração De Programas De Computadores',
          reducaoIBS: 60,
          reducaoCBS: 60,
          itemLC116: '01.04',
          itemLC116Descricao: 'Elaboração De Programas De Computadores'
        },
        {
          nbs: '1.1510.00.00',
          descricao: 'Serviços de tecnologia da informação (TI) não classificados',
          cClassTrib: '010601',
          cClassTribDescricao: 'Assessoria E Consultoria Em Informática',
          reducaoIBS: 60,
          reducaoCBS: 60,
          itemLC116: '01.06',
          itemLC116Descricao: 'Assessoria E Consultoria Em Informática'
        }
      ],
      defaultReduction: { ibs: 60, cbs: 60 }
    },
  
    // Contabilidade - Profissões Intelectuais (30%)
    '6920601': {
      cnae: '6920601',
      descricao: 'Atividades de contabilidade',
      reducoes: [
        {
          nbs: '1.1302.21.00',
          descricao: 'Serviços de contabilidade',
          cClassTrib: '200052',
          cClassTribDescricao: 'Prestação de serviços de profissões intelectuais',
          reducaoIBS: 30,
          reducaoCBS: 30,
          itemLC116: '17.19',
          itemLC116Descricao: 'Contabilidade, Inclusive Serviços Técnicos E Auxiliares'
        },
        {
          nbs: '1.1302.22.00',
          descricao: 'Serviços de escrituração mercantil',
          cClassTrib: '200052',
          cClassTribDescricao: 'Prestação de serviços de profissões intelectuais',
          reducaoIBS: 30,
          reducaoCBS: 30,
          itemLC116: '17.19',
          itemLC116Descricao: 'Contabilidade, Inclusive Serviços Técnicos E Auxiliares'
        }
      ],
      defaultReduction: { ibs: 30, cbs: 30 }
    },
  
    '6920602': {
      cnae: '6920602',
      descricao: 'Atividades de consultoria e auditoria contábil e tributária',
      reducoes: [
        {
          nbs: '1.1302.11.00',
          descricao: 'Serviços de auditoria contábil',
          cClassTrib: '200052',
          cClassTribDescricao: 'Prestação de serviços de profissões intelectuais',
          reducaoIBS: 30,
          reducaoCBS: 30,
          itemLC116: '17.16',
          itemLC116Descricao: 'Auditoria'
        }
      ],
      defaultReduction: { ibs: 30, cbs: 30 }
    },
  
    // Advocacia - Profissões Intelectuais (30%)
    '6911701': {
      cnae: '6911701',
      descricao: 'Serviços advocatícios',
      reducoes: [
        {
          nbs: '1.1301.10.00',
          descricao: 'Serviços de representação e consultoria jurídica criminal',
          cClassTrib: '200052',
          cClassTribDescricao: 'Prestação de serviços de profissões intelectuais',
          reducaoIBS: 30,
          reducaoCBS: 30,
          itemLC116: '17.14',
          itemLC116Descricao: 'Advocacia'
        },
        {
          nbs: '1.1301.20.00',
          descricao: 'Serviços de representação e consultoria jurídica em outras áreas',
          cClassTrib: '200052',
          cClassTribDescricao: 'Prestação de serviços de profissões intelectuais',
          reducaoIBS: 30,
          reducaoCBS: 30,
          itemLC116: '17.14',
          itemLC116Descricao: 'Advocacia'
        },
        {
          nbs: '1.1301.90.00',
          descricao: 'Serviços jurídicos não classificados',
          cClassTrib: '200052',
          cClassTribDescricao: 'Prestação de serviços de profissões intelectuais',
          reducaoIBS: 30,
          reducaoCBS: 30,
          itemLC116: '17.14',
          itemLC116Descricao: 'Advocacia'
        }
      ],
      defaultReduction: { ibs: 30, cbs: 30 }
    },
  
    // Arquitetura e Engenharia - Profissões Intelectuais (30%)
    '7111100': {
      cnae: '7111100',
      descricao: 'Serviços de arquitetura',
      reducoes: [
        {
          nbs: '1.1402.11.00',
          descricao: 'Serviços de consultoria em arquitetura',
          cClassTrib: '200052',
          cClassTribDescricao: 'Prestação de serviços de profissões intelectuais',
          reducaoIBS: 30,
          reducaoCBS: 30,
          itemLC116: '07.01',
          itemLC116Descricao: 'Engenharia, Agronomia, Arquitetura'
        },
        {
          nbs: '1.1402.12.00',
          descricao: 'Serviços de arquitetura para projetos de construções residenciais',
          cClassTrib: '200052',
          cClassTribDescricao: 'Prestação de serviços de profissões intelectuais',
          reducaoIBS: 30,
          reducaoCBS: 30,
          itemLC116: '07.01',
          itemLC116Descricao: 'Engenharia, Agronomia, Arquitetura'
        },
        {
          nbs: '1.1402.13.00',
          descricao: 'Serviços de arquitetura para projetos de construções não residenciais',
          cClassTrib: '200052',
          cClassTribDescricao: 'Prestação de serviços de profissões intelectuais',
          reducaoIBS: 30,
          reducaoCBS: 30,
          itemLC116: '07.01',
          itemLC116Descricao: 'Engenharia, Agronomia, Arquitetura'
        }
      ],
      defaultReduction: { ibs: 30, cbs: 30 }
    },
  
    '7112000': {
      cnae: '7112000',
      descricao: 'Serviços de engenharia',
      reducoes: [
        {
          nbs: '1.1403.10.00',
          descricao: 'Serviços de consultoria em engenharia',
          cClassTrib: '200038',
          cClassTribDescricao: 'Fornecimento dos insumos agropecuários e aquícolas - Anexo IX',
          reducaoIBS: 60,
          reducaoCBS: 60,
          itemLC116: '07.01',
          itemLC116Descricao: 'Engenharia, Agronomia, Agrimensura'
        },
        {
          nbs: '1.1403.21.10',
          descricao: 'Serviços de engenharia para projetos de construção residencial',
          cClassTrib: '200052',
          cClassTribDescricao: 'Prestação de serviços de profissões intelectuais',
          reducaoIBS: 30,
          reducaoCBS: 30,
          itemLC116: '07.01',
          itemLC116Descricao: 'Engenharia, Agronomia, Agrimensura'
        },
        {
          nbs: '1.1403.30.00',
          descricao: 'Serviços de gerenciamento de projetos de construção',
          cClassTrib: '200052',
          cClassTribDescricao: 'Prestação de serviços de profissões intelectuais',
          reducaoIBS: 30,
          reducaoCBS: 30,
          itemLC116: '07.01',
          itemLC116Descricao: 'Engenharia, Agronomia, Agrimensura'
        }
      ],
      defaultReduction: { ibs: 30, cbs: 30 }
    },
  
    // Construção Civil - Obras (60% via Anexo IV)
    '4120400': {
      cnae: '4120400',
      descricao: 'Construção de edifícios',
      reducoes: [
        {
          nbs: '1.0101.11.00',
          descricao: 'Construção de edificações residenciais de um e dois pavimentos',
          cClassTrib: '200046',
          cClassTribDescricao: 'Operações com bens imóveis',
          reducaoIBS: 50,
          reducaoCBS: 50,
          itemLC116: '07.02',
          itemLC116Descricao: 'Execução de Obras de Construção Civil'
        },
        {
          nbs: '1.0101.11.00',
          descricao: 'Construção de edificações residenciais de um e dois pavimentos',
          cClassTrib: '200045',
          cClassTribDescricao: 'Obras de Construção Civil - Anexo IV',
          reducaoIBS: 60,
          reducaoCBS: 60,
          itemLC116: '07.02',
          itemLC116Descricao: 'Execução de Obras de Construção Civil'
        },
        {
          nbs: '1.0101.12.00',
          descricao: 'Construção de edificações residenciais com mais de dois pavimentos',
          cClassTrib: '200045',
          cClassTribDescricao: 'Obras de Construção Civil - Anexo IV',
          reducaoIBS: 60,
          reducaoCBS: 60,
          itemLC116: '07.02',
          itemLC116Descricao: 'Execução de Obras de Construção Civil'
        }
      ],
      defaultReduction: { ibs: 60, cbs: 60 }
    },
  
    // Saúde - Alta redução (60%)
    '8610101': {
      cnae: '8610101',
      descricao: 'Atividades de atendimento hospitalar, exceto pronto-socorro e unidades para atendimento a urgências',
      reducoes: [
        {
          nbs: '1.2301.14.00',
          descricao: 'Serviços prestados em Unidades de Terapia Intensiva',
          cClassTrib: '200029',
          cClassTribDescricao: 'Fornecimento dos serviços de saúde humana - Anexo III',
          reducaoIBS: 60,
          reducaoCBS: 60,
          itemLC116: '04.03',
          itemLC116Descricao: 'Hospitais, Clínicas, Laboratórios'
        },
        {
          nbs: '1.2301.15.00',
          descricao: 'Serviços de atendimento de urgência',
          cClassTrib: '200029',
          cClassTribDescricao: 'Fornecimento dos serviços de saúde humana - Anexo III',
          reducaoIBS: 60,
          reducaoCBS: 60,
          itemLC116: '04.03',
          itemLC116Descricao: 'Hospitais, Clínicas, Laboratórios'
        }
      ],
      defaultReduction: { ibs: 60, cbs: 60 }
    },
  
    '8630501': {
      cnae: '8630501',
      descricao: 'Atividade médica ambulatorial com recursos para realização de procedimentos cirúrgicos',
      reducoes: [
        {
          nbs: '1.2301.11.00',
          descricao: 'Serviços cirúrgicos',
          cClassTrib: '200029',
          cClassTribDescricao: 'Fornecimento dos serviços de saúde humana - Anexo III',
          reducaoIBS: 60,
          reducaoCBS: 60,
          itemLC116: '04.03',
          itemLC116Descricao: 'Hospitais, Clínicas, Laboratórios'
        },
        {
          nbs: '1.2301.21.00',
          descricao: 'Serviços de clínica médica',
          cClassTrib: '200029',
          cClassTribDescricao: 'Fornecimento dos serviços de saúde humana - Anexo III',
          reducaoIBS: 60,
          reducaoCBS: 60,
          itemLC116: '04.03',
          itemLC116Descricao: 'Hospitais, Clínicas, Laboratórios'
        }
      ],
      defaultReduction: { ibs: 60, cbs: 60 }
    },
  
    // Educação (60%)
    '8511200': {
      cnae: '8511200',
      descricao: 'Educação infantil - creche',
      reducoes: [
        {
          nbs: '1.2201.11.00',
          descricao: 'Serviços de creche ou entidade equivalente',
          cClassTrib: '200028',
          cClassTribDescricao: 'Fornecimento dos serviços de educação - Anexo II',
          reducaoIBS: 60,
          reducaoCBS: 60,
          itemLC116: '08.01',
          itemLC116Descricao: 'Ensino Regular Pré-Escolar, Fundamental, Médio E Superior'
        }
      ],
      defaultReduction: { ibs: 60, cbs: 60 }
    },
  
    '8531700': {
      cnae: '8531700',
      descricao: 'Educação superior - graduação',
      reducoes: [
        {
          nbs: '1.2204.10.00',
          descricao: 'Serviços educacionais de graduação',
          cClassTrib: '200028',
          cClassTribDescricao: 'Fornecimento dos serviços de educação - Anexo II',
          reducaoIBS: 60,
          reducaoCBS: 60,
          itemLC116: '08.01',
          itemLC116Descricao: 'Ensino Regular Pré-Escolar, Fundamental, Médio E Superior'
        },
        {
          nbs: '1.2204.10.00',
          descricao: 'Serviços educacionais de graduação',
          cClassTrib: '200025',
          cClassTribDescricao: 'Fornecimento dos serviços de educação relacionados ao Prouni',
          reducaoIBS: 30,
          reducaoCBS: 100,
          itemLC116: '08.01',
          itemLC116Descricao: 'Ensino Regular Pré-Escolar, Fundamental, Médio E Superior'
        }
      ],
      defaultReduction: { ibs: 60, cbs: 60 }
    },
  
    // Turismo (40%)
    '5510801': {
      cnae: '5510801',
      descricao: 'Hotéis',
      reducoes: [
        {
          nbs: '1.0303.11.00',
          descricao: 'Serviços de hospedagem em quartos com alimentação e gorjeta',
          cClassTrib: '200048',
          cClassTribDescricao: 'Hotelaria, Parques de Diversão e Parques Temáticos',
          reducaoIBS: 40,
          reducaoCBS: 40,
          itemLC116: '09.01',
          itemLC116Descricao: 'Hospedagem de Qualquer Natureza'
        }
      ],
      defaultReduction: { ibs: 40, cbs: 40 }
    },
  
    '7911200': {
      cnae: '7911200',
      descricao: 'Agências de viagens',
      reducoes: [
        {
          nbs: '1.1805.40.00',
          descricao: 'Serviços de operadoras de turismo',
          cClassTrib: '200051',
          cClassTribDescricao: 'Agências de Turismo',
          reducaoIBS: 40,
          reducaoCBS: 40,
          itemLC116: '09.02',
          itemLC116Descricao: 'Agenciamento, Organização de Turismo'
        }
      ],
      defaultReduction: { ibs: 40, cbs: 40 }
    },
  
    // CNAEs sem redução (tributação integral)
    '4711301': {
      cnae: '4711301',
      descricao: 'Comércio varejista de mercadorias em geral',
      reducoes: [],
      defaultReduction: { ibs: 0, cbs: 0 }
    }
  
    // TODO: Adicionar os demais CNAEs do documento...
  };
  
  /**
   * Busca a redução de IVA para um CNAE específico
   * @param cnaeCode Código do CNAE
   * @param nbsCode Código NBS (opcional)
   * @param cClassTrib Classificação tributária (opcional)
   * @returns Objeto com reduções de IBS e CBS em percentual (0-100)
   */
  export function getIvaReductionByCnae(
    cnaeCode: string,
    nbsCode?: string,
    cClassTrib?: string
  ): { reducaoIBS: number; reducaoCBS: number } {
    const cnaeData = CNAE_REDUCTIONS_DATABASE[cnaeCode];
    
    // Se CNAE não encontrado, retorna sem redução
    if (!cnaeData) {
      console.warn(`CNAE ${cnaeCode} não encontrado na base de reduções`);
      return { reducaoIBS: 0, reducaoCBS: 0 };
    }
  
    // Se não há reduções cadastradas, usa default
    if (cnaeData.reducoes.length === 0) {
      return {
        reducaoIBS: cnaeData.defaultReduction?.ibs ?? 0,
        reducaoCBS: cnaeData.defaultReduction?.cbs ?? 0
      };
    }
  
    // Busca exata: NBS + cClassTrib
    if (nbsCode && cClassTrib) {
      const exact = cnaeData.reducoes.find(
        r => r.nbs === nbsCode && r.cClassTrib === cClassTrib
      );
      if (exact) {
        return {
          reducaoIBS: exact.reducaoIBS,
          reducaoCBS: exact.reducaoCBS
        };
      }
    }
  
    // Busca por NBS apenas
    if (nbsCode) {
      const byNbs = cnaeData.reducoes.filter(r => r.nbs === nbsCode);
      if (byNbs.length > 0) {
        // Se há múltiplas opções, pega a mais favorável
        const best = byNbs.reduce((prev, curr) => {
          const prevTotal = prev.reducaoIBS + prev.reducaoCBS;
          const currTotal = curr.reducaoIBS + curr.reducaoCBS;
          return currTotal > prevTotal ? curr : prev;
        });
        return {
          reducaoIBS: best.reducaoIBS,
          reducaoCBS: best.reducaoCBS
        };
      }
    }
  
    // Busca por cClassTrib apenas
    if (cClassTrib) {
      const byClass = cnaeData.reducoes.find(r => r.cClassTrib === cClassTrib);
      if (byClass) {
        return {
          reducaoIBS: byClass.reducaoIBS,
          reducaoCBS: byClass.reducaoCBS
        };
      }
    }
  
    // Fallback: usa a redução mais favorável disponível
    if (cnaeData.reducoes.length > 0) {
      const best = cnaeData.reducoes.reduce((prev, curr) => {
        const prevTotal = prev.reducaoIBS + prev.reducaoCBS;
        const currTotal = curr.reducaoIBS + curr.reducaoCBS;
        return currTotal > prevTotal ? curr : prev;
      });
      return {
        reducaoIBS: best.reducaoIBS,
        reducaoCBS: best.reducaoCBS
      };
    }
  
    // Última alternativa: default
    return {
      reducaoIBS: cnaeData.defaultReduction?.ibs ?? 0,
      reducaoCBS: cnaeData.defaultReduction?.cbs ?? 0
    };
  }
  
  /**
   * Lista todas as opções de NBS disponíveis para um CNAE
   */
  export function getNBSOptionsByCnae(cnaeCode: string): NBSReduction[] {
    const cnaeData = CNAE_REDUCTIONS_DATABASE[cnaeCode];
    return cnaeData?.reducoes || [];
  }
  
  /**
   * Verifica se um CNAE tem múltiplas opções de redução
   */
  export function hasMultipleReductionOptions(cnaeCode: string): boolean {
    const cnaeData = CNAE_REDUCTIONS_DATABASE[cnaeCode];
    return (cnaeData?.reducoes?.length ?? 0) > 1;
  }