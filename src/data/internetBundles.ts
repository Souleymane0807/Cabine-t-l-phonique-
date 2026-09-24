import { DataBundle, Operator } from '../types';

export const DATA_BUNDLES: Record<Operator, DataBundle[]> = {
  Orange: [
    { id: 'ora-flash-200', name: 'Pass Flash', volume: '250 Mo', validity: '2 Heures', price: 200, operator: 'Orange' },
    { id: 'ora-jour-500', name: 'Pass Jour 500', volume: '1.2 Go', validity: '24 Heures', price: 500, operator: 'Orange', popular: true },
    { id: 'ora-3j-1000', name: 'Pass 3 Jours', volume: '2.5 Go', validity: '3 Jours', price: 1000, operator: 'Orange', popular: true },
    { id: 'ora-sem-2000', name: 'Pass Semaine', volume: '5 Go', validity: '7 Jours', price: 2000, operator: 'Orange', popular: true },
    { id: 'ora-mois-5000', name: 'Pass Mois Standard', volume: '15 Go', validity: '30 Jours', price: 5000, operator: 'Orange', popular: true },
    { id: 'ora-mois-10000', name: 'Pass Maxi Mois', volume: '35 Go', validity: '30 Jours', price: 10000, operator: 'Orange' },
    { id: 'ora-nuit-500', name: 'Pass Nuit Illimité', volume: 'Illimité (23h-06h)', validity: '1 Nuit', price: 500, operator: 'Orange' },
  ],
  MTN: [
    { id: 'mtn-maxi-300', name: 'Maxi Data 300', volume: '450 Mo', validity: '24 Heures', price: 300, operator: 'MTN' },
    { id: 'mtn-maxi-500', name: 'Maxi Data Jour', volume: '1.5 Go', validity: '24 Heures', price: 500, operator: 'MTN', popular: true },
    { id: 'mtn-maxi-1000', name: 'Maxi Data 3 Jours', volume: '3 Go', validity: '3 Jours', price: 1000, operator: 'MTN', popular: true },
    { id: 'mtn-maxi-2000', name: 'Maxi Data Semaine', volume: '6 Go', validity: '7 Jours', price: 2000, operator: 'MTN', popular: true },
    { id: 'mtn-maxi-5000', name: 'Maxi Data Mois', volume: '20 Go', validity: '30 Jours', price: 5000, operator: 'MTN', popular: true },
    { id: 'mtn-maxi-10000', name: 'Maxi Data Giga+', volume: '45 Go', validity: '30 Jours', price: 10000, operator: 'MTN' },
  ],
  Moov: [
    { id: 'moov-in-200', name: "Moov'in Flash", volume: '300 Mo', validity: '24 Heures', price: 200, operator: 'Moov' },
    { id: 'moov-in-500', name: "Moov'in Jour", volume: '1.5 Go', validity: '24 Heures', price: 500, operator: 'Moov', popular: true },
    { id: 'moov-in-1000', name: "Moov'in 3 Jours", volume: '3.2 Go', validity: '3 Jours', price: 1000, operator: 'Moov', popular: true },
    { id: 'moov-in-2000', name: "Moov'in Semaine", volume: '7 Go', validity: '7 Jours', price: 2000, operator: 'Moov', popular: true },
    { id: 'moov-in-5000', name: "Moov'in Mois", volume: '22 Go', validity: '30 Jours', price: 5000, operator: 'Moov', popular: true },
    { id: 'moov-in-10000', name: "Moov'in Ultra", volume: '50 Go', validity: '30 Jours', price: 10000, operator: 'Moov' },
  ],
  Wave: [
    { id: 'wave-pass-500', name: 'Pass Data Wave 500', volume: '1.2 Go', validity: '24 Heures', price: 500, operator: 'Wave' },
    { id: 'wave-pass-1000', name: 'Pass Data Wave 1000', volume: '3 Go', validity: '3 Jours', price: 1000, operator: 'Wave', popular: true },
    { id: 'wave-pass-2000', name: 'Pass Data Wave Semaine', volume: '6 Go', validity: '7 Jours', price: 2000, operator: 'Wave', popular: true },
    { id: 'wave-pass-5000', name: 'Pass Data Wave Mois', volume: '20 Go', validity: '30 Jours', price: 5000, operator: 'Wave', popular: true },
  ],
};
