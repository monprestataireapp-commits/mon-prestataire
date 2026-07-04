// European countries and their administrative regions
// Names in French where applicable

export const EUROPEAN_COUNTRIES = [
  { code: 'DE', name: 'Allemagne' },
  { code: 'AT', name: 'Autriche' },
  { code: 'BE', name: 'Belgique' },
  { code: 'BG', name: 'Bulgarie' },
  { code: 'HR', name: 'Croatie' },
  { code: 'DK', name: 'Danemark' },
  { code: 'ES', name: 'Espagne' },
  { code: 'FI', name: 'Finlande' },
  { code: 'FR', name: 'France' },
  { code: 'GR', name: 'Grèce' },
  { code: 'HU', name: 'Hongrie' },
  { code: 'IE', name: 'Irlande' },
  { code: 'IT', name: 'Italie' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'NO', name: 'Norvège' },
  { code: 'NL', name: 'Pays-Bas' },
  { code: 'PL', name: 'Pologne' },
  { code: 'PT', name: 'Portugal' },
  { code: 'CZ', name: 'République tchèque' },
  { code: 'RO', name: 'Roumanie' },
  { code: 'GB', name: 'Royaume-Uni' },
  { code: 'SK', name: 'Slovaquie' },
  { code: 'SI', name: 'Slovénie' },
  { code: 'SE', name: 'Suède' },
  { code: 'CH', name: 'Suisse' },
] as const

export const REGIONS_BY_COUNTRY: Record<string, string[]> = {
  // France — 13 régions métropolitaines + 5 outre-mer (same as REGIONS_FRANCE in utils.ts)
  FR: [
    'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne',
    'Centre-Val de Loire', 'Corse', 'Grand Est', 'Guadeloupe', 'Guyane',
    'Hauts-de-France', 'Île-de-France', 'La Réunion', 'Martinique',
    'Mayotte', 'Normandie', 'Nouvelle-Aquitaine', 'Occitanie',
    'Pays de la Loire', "Provence-Alpes-Côte d'Azur",
  ],

  // Belgique — 10 provinces + Bruxelles-Capitale
  BE: [
    'Anvers', 'Brabant flamand', 'Brabant wallon', 'Bruxelles-Capitale',
    'Flandre occidentale', 'Flandre orientale', 'Hainaut', 'Liège',
    'Limbourg', 'Luxembourg', 'Namur',
  ],

  // Suisse — 26 cantons
  CH: [
    'Appenzell Rhodes-Extérieures', 'Appenzell Rhodes-Intérieures', 'Argovie',
    'Bâle-Campagne', 'Bâle-Ville', 'Berne', 'Fribourg', 'Genève',
    'Glaris', 'Grisons', 'Jura', 'Lucerne', 'Neuchâtel', 'Nidwald',
    'Obwald', 'Saint-Gall', 'Schaffhouse', 'Schwyz', 'Soleure',
    'Tessin', 'Thurgovie', 'Uri', 'Valais', 'Vaud', 'Zoug', 'Zurich',
  ],

  // Luxembourg — 4 régions (anciennement 12 cantons, regroupés)
  LU: [
    'Centre', 'Est', 'Nord', 'Sud',
  ],

  // Allemagne — 16 Bundesländer
  DE: [
    'Bade-Wurtemberg', 'Basse-Saxe', 'Bavière', 'Berlin', 'Brandebourg',
    'Brême', 'Hambourg', 'Hesse', 'Mecklembourg-Poméranie-Occidentale',
    'Rhénanie-du-Nord-Westphalie', 'Rhénanie-Palatinat', 'Sarre',
    'Saxe', 'Saxe-Anhalt', 'Schleswig-Holstein', 'Thuringe',
  ],

  // Espagne — 17 communautés autonomes + 2 villes autonomes
  ES: [
    'Andalousie', 'Aragon', 'Asturies', 'Baléares', 'Canaries',
    'Cantabrie', 'Castille-et-León', 'Castille-La Manche', 'Catalogne',
    'Ceuta', 'Communauté valencienne', 'Estrémadure', 'Galice',
    'La Rioja', 'Madrid', 'Melilla', 'Murcie', 'Navarre', 'Pays basque',
  ],

  // Italie — 20 régions
  IT: [
    'Abruzzes', 'Basilicate', 'Calabre', 'Campanie', 'Émilie-Romagne',
    'Frioul-Vénétie Julienne', 'Latium', 'Ligurie', 'Lombardie',
    'Marches', 'Molise', 'Ombrie', 'Piémont', 'Pouilles', 'Sardaigne',
    'Sicile', 'Toscane', 'Trentin-Haut-Adige', 'Val d\'Aoste', 'Vénétie',
  ],

  // Portugal — 18 districts + 2 régions autonomes
  PT: [
    'Aveiro', 'Beja', 'Braga', 'Bragance', 'Castelo Branco',
    'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisbonne',
    'Madère', 'Portalegre', 'Porto', 'Açores', 'Santarém',
    'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu',
  ],

  // Pays-Bas — 12 provinces
  NL: [
    'Brabant-Septentrional', 'Drenthe', 'Flevoland', 'Frise',
    'Gueldre', 'Groningue', 'Hollande-Méridionale', 'Hollande-Septentrionale',
    'Limbourg', 'Overijssel', 'Utrecht', 'Zélande',
  ],

  // Autriche — 9 Bundesländer
  AT: [
    'Basse-Autriche', 'Burgenland', 'Carinthie', 'Haute-Autriche',
    'Salzbourg', 'Styrie', 'Tyrol', 'Vienne', 'Vorarlberg',
  ],

  // Royaume-Uni — 4 nations constitutives
  GB: [
    'Angleterre', 'Écosse', 'Irlande du Nord', 'Pays de Galles',
  ],

  // Irlande — 4 provinces
  IE: [
    'Connacht', 'Leinster', 'Munster', 'Ulster',
  ],

  // Danemark — 5 régions
  DK: [
    'Danemark-du-Sud', 'Jutland central', 'Jutland du Nord',
    'Sjælland', 'Hovedstaden',
  ],

  // Suède — 21 län (comtés)
  SE: [
    'Blekinge', 'Dalécarlie', 'Gävleborg', 'Gotland', 'Halland',
    'Jämtland', 'Jönköping', 'Kalmar', 'Kronoberg', 'Norrbotten',
    'Östergötland', 'Örebro', 'Scanie', 'Södermanland', 'Stockholm',
    'Uppsala', 'Värmland', 'Västerbotten', 'Västernorrland',
    'Västmanland', 'Västra Götaland',
  ],

  // Norvège — 11 fylker (comtés, depuis 2024)
  NO: [
    'Agder', 'Akershus', 'Buskerud', 'Finnmark', 'Innlandet',
    'Møre og Romsdal', 'Nordland', 'Oslo', 'Rogaland', 'Telemark',
    'Troms', 'Trøndelag', 'Vestfold', 'Vestland',
  ],

  // Finlande — 19 régions
  FI: [
    'Åland', 'Carélie du Nord', 'Carélie du Sud', 'Finlande centrale',
    'Kainuu', 'Kanta-Häme', 'Kymenlaakso', 'Laponie',
    'Ostrobotnie', 'Ostrobotnie centrale', 'Ostrobotnie du Sud',
    'Päijät-Häme', 'Pirkanmaa', 'Pohjanmaa', 'Satakunta',
    'Savonie du Nord', 'Savonie du Sud', 'Uusimaa', 'Varsinais-Suomi',
  ],

  // Pologne — 16 voïvodies
  PL: [
    'Basse-Silésie', 'Couïavie-Poméranie', 'Grande-Pologne',
    'Łódź', 'Lublin', 'Lubusz', 'Mazovie', 'Opole',
    'Petite-Pologne', 'Podlachie', 'Poméranie', 'Poméranie occidentale',
    'Précarpatie', 'Sainte-Croix', 'Silésie', 'Varmie-Mazurie',
  ],

  // République tchèque — 14 régions (kraje)
  CZ: [
    'Bohême centrale', 'Bohême du Sud', 'Hradec Králové', 'Karlovy Vary',
    'Liberec', 'Moravie du Sud', 'Moravie-Silésie', 'Olomouc',
    'Pardubice', 'Plzeň', 'Prague', 'Ústí nad Labem',
    'Vysočina', 'Zlín',
  ],

  // Croatie — 21 comitats (županije)
  HR: [
    'Bjelovar-Bilogora', 'Brod-Posavina', 'Dubrovnik-Neretva',
    'Istrie', 'Karlovac', 'Koprivnica-Križevci', 'Krapina-Zagorje',
    'Lika-Senj', 'Međimurje', 'Osijek-Baranja', 'Požega-Slavonie',
    'Primorje-Gorski Kotar', 'Sisak-Moslavina', 'Slavonie-Baranja',
    'Split-Dalmatie', 'Šibenik-Knin', 'Varaždin', 'Ville de Zagreb',
    'Virovitica-Podravina', 'Vukovar-Srijem', 'Zadar', 'Zagreb',
  ],

  // Grèce — 13 régions (perifereies)
  GR: [
    'Attique', 'Crète', 'Égée-Méridionale', 'Égée-Septentrionale',
    'Épire', 'Grèce-Centrale', 'Grèce-Occidentale', 'Îles Ioniennes',
    'Macédoine-Centrale', 'Macédoine-Occidentale', 'Macédoine-Orientale-et-Thrace',
    'Péloponnèse', 'Thessalie',
  ],

  // Roumanie — 8 régions de développement
  RO: [
    'Bucarest-Ilfov', 'Centre', 'Nord-Est', 'Nord-Ouest',
    'Ouest', 'Sud (Munténie)', 'Sud-Est', 'Sud-Ouest (Olténie)',
  ],

  // Bulgarie — 6 régions de planification
  BG: [
    'Nord-Est', 'Nord-Ouest', 'Nord-Central',
    'Sud-Est', 'Sud-Ouest', 'Sud-Central',
  ],

  // Hongrie — 19 comitats + Budapest
  HU: [
    'Baranya', 'Bács-Kiskun', 'Békés', 'Borsod-Abaúj-Zemplén',
    'Budapest', 'Csongrád-Csanád', 'Fejér', 'Győr-Moson-Sopron',
    'Hajdú-Bihar', 'Heves', 'Jász-Nagykun-Szolnok', 'Komárom-Esztergom',
    'Nógrád', 'Pest', 'Somogy', 'Szabolcs-Szatmár-Bereg',
    'Tolna', 'Vas', 'Veszprém', 'Zala',
  ],

  // Slovaquie — 8 régions (kraje)
  SK: [
    'Banská Bystrica', 'Bratislava', 'Košice', 'Nitra',
    'Prešov', 'Trenčín', 'Trnava', 'Žilina',
  ],

  // Slovénie — 12 régions statistiques
  SI: [
    'Carinthie slovène', 'Carniole-Intérieure', 'Drave',
    'Haute-Carniole', 'Littoral-Karst', 'Moyenne-Savinja',
    'Mur', 'Pomurska', 'Savinja', 'Slovénie centrale',
    'Slovénie du Sud-Est', 'Zasavska',
  ],
}
