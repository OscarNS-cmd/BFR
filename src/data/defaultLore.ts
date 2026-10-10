import { LoreDocument, ImageAsset } from '../types/lore';
import { parseFrontmatter, calculateDocumentStats } from '../utils/frontmatter';
import { computeBidirectionalLinks } from '../utils/wikilinks';

const rawDocs: { path: string; raw: string }[] = [
  // 1. PERSONAJE: Valerius Ashborn
  {
    path: 'Personajes/Valerius-Ashborn.md',
    raw: `---
title: "Valerius Ashborn"
type: character
tags: ["protagonista", "realeza", "exiliado", "guerrero", "aethelgard"]
status: completed
date: "318 E.S."
faction: "Orden de la Ceniza"
race: "Humano / Linaje Solar"
role: "Heredero Proscrito del Trono de Obsidiana"
image: "/src/assets/images/character_valerius_1791503606246.jpg"
attributes:
  Edad: "34 inviernos"
  Título: "Comandante de los Quebrantados"
  Armamento: "Mandoble Rúnico de Ignis"
  Afiliación: "Orden de la Ceniza"
  Estado: "Vivo (En el Exilio)"
relationships:
  - target: "Lyra Vespera"
    relation: "Aliada renuente y consejera mágica"
  - target: "Rey Aldor IV"
    relation: "Padre (fallecido bajo misteriosas circunstancias)"
  - target: "Bastión de Cenizas"
    relation: "Antigua fortaleza natal que juró recuperar"
  - target: "Sombradraco Ancestral"
    relation: "Bestia vinculada tras el Duelo de la Cima"
---

# Valerius Ashborn

[!Infobox]

> *"La corona no se forja en oro reposado, sino en el yunque de las brasas que consumieron nuestro hogar."*  
> — Valerius frente a las puertas del [[Bastión de Cenizas]]

## Biografía y Orígenes

Hijo primogénito del difunto [[Rey Aldor IV]], Valerius fue entrenado desde su juventud en la milicia del bastión y en los antiguos ritos solares. Durante la noche conocida como el [[El Gran Cataclismo de Cenizas]], fue falsamente acusado del regicidio de su padre por los señores del [[Cónclave Astral]], viéndose obligado a huir con los restos leales de la [[Orden de la Ceniza]].

### Rasgos Distintivos y Habilidades
- **Esgrima de Ignis:** Porta el legendario mandoble imbuido en fuego arcaico, capaz de rasgar la niebla espectral.
- **Marca de la Ceniza:** Una runa grabada a fuego en su mejilla derecha que vibra en presencia de un [[Sombradraco Ancestral]].
- **Liderazgo Táctico:** Capacidad de coordinar fuerzas menores contra ejércitos colosales en terreno escarpado.

## Relaciones Principales

| Personaje / Entidad | Naturaleza del Vínculo | Estado Actual |
| :--- | :--- | :--- |
| [[Lyra Vespera]] | Vínculo de juramento; custodia del [[Astrolabio de las Siete Esferas]] | Activa |
| [[Rey Aldor IV]] | Padre biológico y mentor de armas | Fallecido (Año 314 E.S.) |
| [[Sombradraco Ancestral]] | Pacto de sangre de la Cordillera Sombría | Bestia Guardiana |

## Apariciones en la Narrativa
- [[Capítulo 1: El Despertar del Velo de Ceniza]] (Punto de Vista Principal)
- [[Capítulo 2: La Cripta de los Reyes Olvidados]]
`,
  },

  // 2. PERSONAJE: Lyra Vespera
  {
    path: 'Personajes/Lyra-Vespera.md',
    raw: `---
title: "Lyra Vespera"
type: character
tags: ["arcana", "académica", "vidente", "cónclave"]
status: completed
date: "318 E.S."
faction: "Cónclave Astral"
race: "Elfa de los Valles Brumosos"
role: "Gran Astrónoma y Tejedora de Runas"
attributes:
  Edad: "112 años (apariencia de 28)"
  Especialidad: "Astrología Adivinatoria y Manipulación del Éter"
  Herramienta: "Astrolabio de las Siete Esferas"
  Lealtad: "Neutral / Secreta a Valerius"
relationships:
  - target: "Valerius Ashborn"
    relation: "Compañera de viaje y guía astrológica"
  - target: "Astrolabio de las Siete Esferas"
    relation: "Artefacto familiar heredado de la Primera Dinastía"
---

# Lyra Vespera

[!Infobox]

> *"Los astros no dictan sentencias absolutas; simplemente trazan las corrientes por donde las voluntades fuertes deben navegar."*

## Descripción del Personaje

Lyra es una de las mentes más brillantes que jamás haya egresado de las torres del [[Cónclave Astral]]. Dotada de una percepción extrasensorial que le permite observar los hilos invisibles del destino, desertó de su orden cuando descubrió que el consejo planeaba utilizar el [[Astrolabio de las Siete Esferas]] para abrir la brecha abisal.

### Habilidades Arcanas
1. **Tejido Astral:** Genera escudos translúcidos de polvo estelar capaces de repeler proyectiles físicos y magias elementales.
2. **Descifrado de Eclipses:** Predice con exactitud milimétrica las mareas de ceniza y los movimientos migratorios del [[Sombradraco Ancestral]].
3. **Sentido Resonante:** Rastrea reliquias de civilizaciones caídas a través de las pulsaciones tectónicas.

## Alianzas Estratégicas
Colabora en la clandestinidad con [[Valerius Ashborn]] para desenmascarar a los verdaderos conspiradores del [[Bastión de Cenizas]].
`,
  },

  // 3. CRIATURA: Sombradraco Ancestral
  {
    path: 'Bestiario/Sombradraco-Ancestral.md',
    raw: `---
title: "Sombradraco Ancestral"
type: creature
tags: ["bestiario", "dragón", "sombra", "apex", "aethelgard"]
status: completed
danger_level: "Cataclísmico"
habitat: "Cumbres del Bastión de Cenizas y Ruinas de Veridia"
diet: "Residuos de éter concentrado y minerales incandescentes"
weaknesses: "Luz solar condensada y plata rúnica bendecida"
image: "/src/assets/images/creature_sombradraco_1791503614475.jpg"
attributes:
  Envergadura: "42 metros de punta a punta"
  Clasificación: "Draco Etéreo de la Primera Era"
  Comportamiento: "Solitario, territorial, altamente inteligente"
relationships:
  - target: "Valerius Ashborn"
    relation: "Pacto milenario tras el Duelo del Cráter"
  - target: "Bastión de Cenizas"
    relation: "Nidal ancestral en las gargantas de basalto"
---

# Sombradraco Ancestral

[!Infobox]

## Registro del Bestiario Imperial

El Sombradraco Ancestral (*Draco Umbra Ignis*) es uno de los últimos ejemplares de la prole primigenia que sobrevivió a la era en que los cielos ardían. Sus escamas están compuestas de placas de obsidiana volcánica densa, entrelazadas con venas bioluminiscentes violetas que canalizan fuego espectral.

### Atributos Biológicos y Reglas de Combate
- **Aliento Espectral:** No exhala fuego ordinario, sino una llamarada de plasma umbrío a temperaturas que desintegran el acero ordinario en microsegundos sin emitir humo visible.
- **Manto Sombrío:** Cuando cae el crepúsculo, el dragón puede refractar la luz a su alrededor, volviéndose virtualmente imperceptible a menos que despliegue sus fauces.
- **Resonancia de Ceniza:** Su rugido perturba la concentración mágica de los lanzadores de conjuros en un radio de 500 metros.

### Materiales Alquímicos y Botín
- **Gema Corazón de Sombradraco:** Fuente inagotable de propulsión energética para artefactos como el [[Astrolabio de las Siete Esferas]].
- **Escamas de Basalto Umbrío:** Utilizadas para forjar la armadura impenetrable de [[Valerius Ashborn]].
`,
  },

  // 4. HISTORIA: Capítulo 1
  {
    path: 'Historias/Capitulo-1-El-Despertar-del-Velo.md',
    raw: `---
title: "Capítulo 1: El Despertar del Velo de Ceniza"
type: story
book: "El Ocaso de las Cenizas"
arc: "Libro I: La Llama del Destierro"
chapterNumber: 1
status: completed
pov: "Valerius Ashborn"
wordCountTarget: 3500
tags: ["capitulo", "novela", "inicio", "batalla"]
date: "318 E.S. - Primavera"
relationships:
  - target: "Valerius Ashborn"
    relation: "Personaje principal y punto de vista"
  - target: "Lyra Vespera"
    relation: "Aparición crucial en el clímax de la escena"
  - target: "Bastión de Cenizas"
    relation: "Escenario de la emboscada"
---

# Capítulo 1: El Despertar del Velo de Ceniza

El viento soplaba desde las cumbres de basalto cargado del hedor inconfundible del azufre quemado. A lo lejos, las torres del [[Bastión de Cenizas]] se recortaban como colmillos negros contra el horizonte en llamas.

Valerius ajustó la correa de cuero desgastado sobre su hombro derecho. El peso de su mandoble rúnico era un recordatorio constante de la promesa hecha a su padre, el [[Rey Aldor IV]].

—Si avanzamos por el desfiladero antes de que los astrónomos del [[Cónclave Astral]] completen el ritual, no habrá retorno —advirtió la voz suave pero inflexible de [[Lyra Vespera]], emergiendo entre la bruma con su túnica azul índigo ondeando al viento.

En sus manos enguantadas, el [[Astrolabio de las Siete Esferas]] giraba con un zumbido metálico silencioso, proyectando constelaciones doradas sobre el suelo de grava.

—El retorno dejó de ser una opción el día en que las campanas del bastión doblaron por mi muerte —respondió [[Valerius Ashborn]], dando un paso al frente hacia el abismo.

### Objetivos y Tensión Dramática
- **Objetivo del Protagonista:** Cruzar la línea de patrullas sin alertar a los espías de la corte.
- **Conflicto:** Lyra detecta una anomalía en las corrientes del tiempo provocada por el despertar del [[Sombradraco Ancestral]].
- **Resolución:** El grupo alcanza la entrada a las catacumbas secretas al pie del glaciar de obsidiana.
`,
  },

  // 5. HISTORIA: Capítulo 2
  {
    path: 'Historias/Capitulo-2-La-Cripta-de-los-Reyes.md',
    raw: `---
title: "Capítulo 2: La Cripta de los Reyes Olvidados"
type: story
book: "El Ocaso de las Cenizas"
arc: "Libro I: La Llama del Destierro"
chapterNumber: 2
status: in_progress
pov: "Lyra Vespera"
wordCountTarget: 4000
tags: ["capitulo", "misterio", "cripta", "magia"]
date: "318 E.S."
relationships:
  - target: "Lyra Vespera"
    relation: "Punto de vista narrativo"
  - target: "Rey Aldor IV"
    relation: "Descubrimiento de su sepulcro profanado"
  - target: "Astrolabio de las Siete Esferas"
    relation: "Llave de resonancia de la puerta sellada"
---

# Capítulo 2: La Cripta de los Reyes Olvidados

El silencio de las profundidades era más pesado que cualquier armadura. Cada gota que caía desde las estalactitas fosforescentes resonaba como el tic-tac de un reloj ancestral.

Lyra sostenía el [[Astrolabio de las Siete Esferas]] con reverencia. Los anillos de bronce comenzaron a alinearse de manera autónoma, atraídos por la vibración que emanaba de la tumba central: el mausoleo del [[Rey Aldor IV]].

—Alguien abrió este sarcófago desde adentro —susurró ella, tocando los sellos de cera rotos.

[[Valerius Ashborn]] desenvainó tres cuartas partes de su hoja. El fuego rúnico iluminó las paredes de la cripta, revelando frescos que databan del [[El Gran Cataclismo de Cenizas]].
`,
  },

  // 6. LUGAR: Bastión de Cenizas
  {
    path: 'Lugares/Bastion-de-Cenizas.md',
    raw: `---
title: "Bastión de Cenizas"
type: location
tags: ["capital", "fortaleza", "volcánico", "aethelgard"]
status: completed
date: "Fundado en el 102 E.S."
image: "/src/assets/images/location_bastion_1791503623434.jpg"
attributes:
  Tipo: "Ciudadela Fortificada y Sede de Gobierno"
  Ubicación: "Garganta de las Cenizas, Cordillera del Ocaso"
  Población: "85,000 habitantes en la parte baja; 3,000 en la acrópolis"
  Defensas: "Triple muralla de basalto, fosos de magma canalizado"
relationships:
  - target: "Valerius Ashborn"
    relation: "Heredero legítimo del bastión"
  - target: "Orden de la Ceniza"
    relation: "Guarnición militar histórica"
  - target: "Sombradraco Ancestral"
    relation: "Nidifica en los riscos exteriores superiores"
---

# Bastión de Cenizas

[!Infobox]

> *"Una corona de piedra suspendida sobre un mar de lava y tormentas celestiales."*

## Descripción Geográfica y Arquitectura

El Bastión de Cenizas es la mayor obra de ingeniería militar del continente. Erigido directamente sobre el borde de una gigantesca falla tectónica, aprovecha las corrientes térmicas subterráneas tanto para la metalurgia rúnica como para alimentar las barreras cinéticas que resguardan la ciudadela alta.

### Distritos Principales
1. **La Acrópolis de Obsidiana:** Residencia real donde gobernaba el linaje de los Ashborn.
2. **Las Forjas del Foso:** Complejo cavernoso donde herreros enanos y humanos funden aleaciones mágicas.
3. **El Velo Exterior:** Campamentos de refugiados y comerciantes protegidos por la muralla inferior.
`,
  },

  // 7. ARTEFACTO: Astrolabio de las Siete Esferas
  {
    path: 'Objetos/Astrolabio-de-las-Siete-Esferas.md',
    raw: `---
title: "Astrolabio de las Siete Esferas"
type: note
tags: ["artefacto", "reliquia", "astronomía", "mágico"]
status: completed
image: "/src/assets/images/item_astrolabe_1791503632849.jpg"
attributes:
  Creador: "Maestro Arquitecto Oron en el año 44 E.S."
  Material: "Latón celestial, hierro meteorítico y esfera de ámbar astral"
  Poder: "Manipulación de coordenadas espaciales y cronomancia menor"
relationships:
  - target: "Lyra Vespera"
    relation: "Portadora y única intérprete viva de sus engranajes"
  - target: "Cónclave Astral"
    relation: "Buscado intensamente por los inquisidores de la orden"
---

# Astrolabio de las Siete Esferas

[!Infobox]

## Historia y Funcionamiento

Forjado antes del advenimiento del [[El Gran Cataclismo de Cenizas]], este instrumento astronómico no solo rastrea la posición de las estrellas y planetas, sino también las fracturas en el tejido de la realidad causadas por los viajes dimensionales.

En su centro reposa una esfera de ámbar fosforescente que absorbe la luz solar y la transforma en coordenadas de navegación etérea. Quien domine sus siete anillos de cálculo puede abrir las puertas selladas del [[Bastión de Cenizas]].
`,
  },

  // 8. CRONOLOGÍA: El Gran Cataclismo de Cenizas
  {
    path: 'Cronologia/Gran-Cataclismo-de-Cenizas.md',
    raw: `---
title: "El Gran Cataclismo de Cenizas"
type: timeline
tags: ["evento", "cataclismo", "historia", "cronologia"]
status: completed
era: "Era de las Sombras"
year: "Año 0 E.S."
date: "0 E.S."
relationships:
  - target: "Bastión de Cenizas"
    relation: "Único bastión que resistió la ola inicial de ceniza tóxica"
  - target: "Sombradraco Ancestral"
    relation: "Despertaron en masa de las fosas abisales"
---

# El Gran Cataclismo de Cenizas

Fue el acontecimiento fundacional que partió la historia de Aethelgard en dos mitades irreconciliables. La rotura del Núcleo Astral en los cielos desató una tormenta de ceniza mágica que duró setenta días y setenta noches, sepultando reinos enteros y dando inicio a la actual Era de las Sombras.

## Diagrama Cronológico y Secuencia de Eventos

\`\`\`mermaid
timeline
  title Crónica de la Caída de Aethelgard
  Año 0 E.S. : Ruptura del Núcleo Astral
             : Descenso de las Cenizas Tóxicas
  Año 102 E.S. : Fundación del Bastión de Cenizas
               : Pacto de las Forjas
  Año 180 E.S. : Nacimiento de la Orden de la Ceniza
  Año 314 E.S. : Misterioso regicidio del Rey Aldor IV
  Año 318 E.S. : Exilio y rebelión de Valerius Ashborn
\`\`\`
`,
  },

  // 9. FACCIÓN: Orden de la Ceniza & Árbol Genealógico
  {
    path: 'Facciones/Orden-de-la-Ceniza.md',
    raw: `---
title: "Orden de la Ceniza"
type: faction
tags: ["facción", "militar", "honor", "caballeros"]
status: completed
attributes:
  Líder Actual: "Valerius Ashborn (en el exilio)"
  Sede Histórica: "Bastión de Cenizas"
  Doctrina: "Lealtad a la corona y protección de los vulnerables"
relationships:
  - target: "Valerius Ashborn"
    relation: "Líder supremo y heredero juramentado"
  - target: "Cónclave Astral"
    relation: "Enemigos políticos declarados tras la conspiración"
---

# Orden de la Ceniza

Hermandad militar de guerreros dedicados a la guardia del trono de obsidiana y a la contención de las bestias del abismo.

## Árbol Dinástico y Relaciones de Mando

\`\`\`mermaid
graph TD
  Aldor[Rey Aldor IV] --> Valerius[Príncipe Valerius Ashborn]
  Aldor --> Garrick[Lord Canciller Garrick]
  Valerius --> Lyra[Lyra Vespera - Consejera]
  Valerius --> Drake[Sombradraco - Guardián]
  Garrick -.-> Conclave[Cónclave Astral - Usurpadores]
\`\`\`
`,
  },
];

export const INITIAL_IMAGES: ImageAsset[] = [
  {
    id: 'img-valerius',
    name: 'Retrato de Valerius Ashborn',
    url: '/src/assets/images/character_valerius_1791503606246.jpg',
    category: 'character',
    tags: ['valerius', 'príncipe', 'armadura', 'protagonista'],
    linkedDocs: ['valerius-ashborn'],
    addedAt: Date.now() - 3600000,
  },
  {
    id: 'img-sombradraco',
    name: 'Bestiario: Sombradraco Ancestral',
    url: '/src/assets/images/creature_sombradraco_1791503614475.jpg',
    category: 'creature',
    tags: ['dragón', 'bestia', 'obsidiana', 'sombradraco'],
    linkedDocs: ['sombradraco-ancestral'],
    addedAt: Date.now() - 3000000,
  },
  {
    id: 'img-bastion',
    name: 'Vista Panorámica del Bastión de Cenizas',
    url: '/src/assets/images/location_bastion_1791503623434.jpg',
    category: 'location',
    tags: ['bastión', 'fortaleza', 'volcán', 'capital'],
    linkedDocs: ['bastion-de-cenizas'],
    addedAt: Date.now() - 2500000,
  },
  {
    id: 'img-astrolabio',
    name: 'Reliquia: Astrolabio de las Siete Esferas',
    url: '/src/assets/images/item_astrolabe_1791503632849.jpg',
    category: 'artifact',
    tags: ['reliquia', 'astronomía', 'magia', 'artefacto'],
    linkedDocs: ['astrolabio-de-las-siete-esferas'],
    addedAt: Date.now() - 1800000,
  },
];

export function getInitialLoreDocuments(): LoreDocument[] {
  const docs: LoreDocument[] = rawDocs.map((item) => {
    const fileName = item.path.split('/').pop() || 'nota.md';
    const id = fileName.replace(/\.md$/, '').toLowerCase();
    const { frontmatter, content } = parseFrontmatter(item.raw);
    const stats = calculateDocumentStats(item.raw);

    return {
      id,
      universeId: 'univ-demo-aethelgard',
      fileName,
      path: item.path,
      frontmatter,
      content,
      rawMarkdown: item.raw,
      wordCount: stats.wordCount,
      readingTimeMinutes: stats.readingTimeMinutes,
      lastModified: Date.now() - Math.floor(Math.random() * 86400000),
    };
  });

  return computeBidirectionalLinks(docs);
}
