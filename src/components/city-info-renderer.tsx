
"use client";

import type { ComponentType } from 'react';

import CityInfoSection from './city-info-section';
import CuritibaInfoSection from './curitiba-info-section';
import RioInfoSection from './rio-info-section';
import BeloHorizonteInfoSection from './belo-horizonte-info-section';
import FlorianopolisInfoSection from './florianopolis-info-section';
import SalvadorInfoSection from './salvador-info-section';
import PortoAlegreInfoSection from './porto-alegre-info-section';
import FortalezaInfoSection from './fortaleza-info-section';
import RecifeInfoSection from './recife-info-section';
import BrasiliaInfoSection from './brasilia-info-section';
import GoianiaInfoSection from './goiania-info-section';
import ManausInfoSection from './manaus-info-section';
import CampinasInfoSection from './campinas-info-section';
import JundiaiInfoSection from './jundiai-info-section';
import UberlandiaInfoSection from './uberlandia-info-section';

const cityInfoComponents: { [key: string]: ComponentType } = {
  'São Paulo - SP': CityInfoSection,
  'Curitiba - PR': CuritibaInfoSection,
  'Rio de Janeiro - RJ': RioInfoSection,
  'Belo Horizonte - MG': BeloHorizonteInfoSection,
  'Florianópolis - SC': FlorianopolisInfoSection,
  'Salvador - BA': SalvadorInfoSection,
  'Porto Alegre - RS': PortoAlegreInfoSection,
  'Fortaleza - CE': FortalezaInfoSection,
  'Recife - PE': RecifeInfoSection,
  'Brasília - DF': BrasiliaInfoSection,
  'Goiânia - GO': GoianiaInfoSection,
  'Manaus - AM': ManausInfoSection,
  'Campinas - SP': CampinasInfoSection,
  'Jundiaí - SP': JundiaiInfoSection,
  'Uberlândia - MG': UberlandiaInfoSection,
};

export default function CityInfoRenderer({ city }: { city: string | undefined }) {
    if (!city) {
        return null;
    }

    const CityComponent = cityInfoComponents[city];

    return CityComponent ? <CityComponent /> : null;
}
