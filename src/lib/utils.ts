import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(date))
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.substring(0, n - 1) + '…' : str
}

export const REGIONS_FRANCE = [
  'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne',
  'Centre-Val de Loire', 'Corse', 'Grand Est', 'Guadeloupe', 'Guyane',
  'Hauts-de-France', 'Île-de-France', 'La Réunion', 'Martinique',
  'Mayotte', 'Normandie', 'Nouvelle-Aquitaine', 'Occitanie',
  'Pays de la Loire', "Provence-Alpes-Côte d'Azur",
]

export const DEPARTMENTS_FRANCE = [
  { code: '01', name: 'Ain', region: 'Auvergne-Rhône-Alpes' },
  { code: '02', name: 'Aisne', region: 'Hauts-de-France' },
  { code: '03', name: 'Allier', region: 'Auvergne-Rhône-Alpes' },
  { code: '06', name: 'Alpes-Maritimes', region: "Provence-Alpes-Côte d'Azur" },
  { code: '13', name: 'Bouches-du-Rhône', region: "Provence-Alpes-Côte d'Azur" },
  { code: '14', name: 'Calvados', region: 'Normandie' },
  { code: '17', name: 'Charente-Maritime', region: 'Nouvelle-Aquitaine' },
  { code: '21', name: "Côte-d'Or", region: 'Bourgogne-Franche-Comté' },
  { code: '29', name: 'Finistère', region: 'Bretagne' },
  { code: '30', name: 'Gard', region: 'Occitanie' },
  { code: '31', name: 'Haute-Garonne', region: 'Occitanie' },
  { code: '33', name: 'Gironde', region: 'Nouvelle-Aquitaine' },
  { code: '34', name: 'Hérault', region: 'Occitanie' },
  { code: '35', name: 'Ille-et-Vilaine', region: 'Bretagne' },
  { code: '38', name: 'Isère', region: 'Auvergne-Rhône-Alpes' },
  { code: '44', name: 'Loire-Atlantique', region: 'Pays de la Loire' },
  { code: '45', name: 'Loiret', region: 'Centre-Val de Loire' },
  { code: '49', name: 'Maine-et-Loire', region: 'Pays de la Loire' },
  { code: '57', name: 'Moselle', region: 'Grand Est' },
  { code: '59', name: 'Nord', region: 'Hauts-de-France' },
  { code: '60', name: 'Oise', region: 'Hauts-de-France' },
  { code: '62', name: 'Pas-de-Calais', region: 'Hauts-de-France' },
  { code: '67', name: 'Bas-Rhin', region: 'Grand Est' },
  { code: '69', name: 'Rhône', region: 'Auvergne-Rhône-Alpes' },
  { code: '75', name: 'Paris', region: 'Île-de-France' },
  { code: '76', name: 'Seine-Maritime', region: 'Normandie' },
  { code: '77', name: 'Seine-et-Marne', region: 'Île-de-France' },
  { code: '78', name: 'Yvelines', region: 'Île-de-France' },
  { code: '80', name: 'Somme', region: 'Hauts-de-France' },
  { code: '83', name: 'Var', region: "Provence-Alpes-Côte d'Azur" },
  { code: '84', name: 'Vaucluse', region: "Provence-Alpes-Côte d'Azur" },
  { code: '91', name: 'Essonne', region: 'Île-de-France' },
  { code: '92', name: 'Hauts-de-Seine', region: 'Île-de-France' },
  { code: '93', name: 'Seine-Saint-Denis', region: 'Île-de-France' },
  { code: '94', name: 'Val-de-Marne', region: 'Île-de-France' },
  { code: '95', name: "Val-d'Oise", region: 'Île-de-France' },
]
