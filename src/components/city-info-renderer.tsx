
"use client";

import CityInfoSection from './city-info-section';
import { CITIES_DATA } from '@/lib/city-data';

export default function CityInfoRenderer({ city }: { city: string | undefined }) {
    if (!city) {
        return null;
    }

    const cityData = CITIES_DATA[city];

    return cityData ? <CityInfoSection data={cityData} /> : null;
}
