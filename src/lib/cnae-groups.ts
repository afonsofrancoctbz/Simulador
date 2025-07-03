export interface CnaeGroupDetail {
  code: string;
  description: string;
  group: string;
  item: string;
  subItemDescription: string;
}

// Based on Lei Complementar 116/03 for services
export const CNAE_SERVICE_LIST: CnaeGroupDetail[] = [
  {
    code: '6209-1/00',
    description: 'Suporte técnico, manutenção e outros serviços em tecnologia da informação',
    group: '1 - Serviços de informática e congêneres',
    item: '01.07',
    subItemDescription: 'Suporte técnico em informática, inclusive instalação, configuração e manutenção de programas de computação e bancos de dados.'
  },
  {
    code: '6319-4/00',
    description: 'Portais, provedores de conteúdo e outros serviços de informação na internet',
    group: '1 - Serviços de informática e congêneres',
    item: '01.07',
    subItemDescription: 'Suporte técnico em informática, inclusive instalação, configuração e manutenção de programas de computação e bancos de dados.'
  },
  {
    code: '6204-0/00',
    description: 'Consultoria em tecnologia da informação',
    group: '1 - Serviços de informática e congêneres',
    item: '01.06',
    subItemDescription: 'Assessoria e consultoria em informática.'
  },
  {
    code: '6311-9/00',
    description: 'Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet',
    group: '1 - Serviços de informática e congêneres',
    item: '01.03',
    subItemDescription: 'Processamento, armazenamento ou hospedagem de dados, textos, imagens, vídeos, páginas eletrônicas, aplicativos e sistemas de informação, entre outros formatos, e congêneres.'
  },
  {
    code: '6202-3/00',
    description: 'Desenvolvimento e licenciamento de programas de computador customizáveis',
    group: '1 - Serviços de informática e congêneres',
    item: '01.04',
    subItemDescription: 'Elaboração de programas de computadores, inclusive de jogos eletrônicos, independentemente da arquitetura construtiva da máquina em que o programa será executado, incluindo tablets, smartphones e congêneres.'
  },
  {
    code: '6201-5/01',
    description: 'Desenvolvimento de programas de computador sob encomenda',
    group: '1 - Serviços de informática e congêneres',
    item: '01.02',
    subItemDescription: 'Programação.'
  },
  {
    code: '6201-5/02',
    description: 'Web design',
    group: '1 - Serviços de informática e congêneres',
    item: '01.01',
    subItemDescription: 'Análise e desenvolvimento de sistemas e desenho de páginas para a internet (web design).'
  }
];
