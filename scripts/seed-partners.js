#!/usr/bin/env node
'use strict';

/**
 * Seed: Partners (with logo upload from Webflow CDN)
 *
 * Usage:
 *   STRAPI_TOKEN=<api-token> node scripts/seed-partners.js
 *
 * Reads country documentIds from webflow-id-map.json (run seed-countries.js first).
 * Saves Webflow→Strapi mapping back to webflow-id-map.json.
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');
const http  = require('http');

const STRAPI_URL   = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const MAP_FILE     = path.join(__dirname, 'webflow-id-map.json');

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_TOKEN env variable is required.\n  Usage: STRAPI_TOKEN=<token> node scripts/seed-partners.js');
  process.exit(1);
}

// country field = Webflow country ID (resolved to Strapi documentId at runtime via map)
const PARTNERS = [
  {
    wid: '68122766bd52d8b24770bbbf',
    name: 'Deaconess Foundation, Vamos Rovaniemi',
    slug: 'deaconess-foundation-vamos-rovaniemi',
    url: 'https://www.hdl.fi/en/',
    countryWid: '681226d9ac7d04e4b62b5b03', // Finland
    description: 'The Deaconess Foundation is a non-profit organisation and bold champion of human dignity. We believe that everyone is valuable and deserves to be included. Our goal is a decent life for everyone. Vamos helps 16–29 year-olds towards school and employment. At Vamos, priority is given to the needs of young people, young people are cared about, and work is carried out jointly with municipal and other actors. ',
    description_fr: 'La Fondation Deaconess est une organisation à but non lucratif et un défenseur audacieux de la dignité humaine. Nous croyons que chaque personne a de la valeur et mérite d\'être incluse. Notre objectif est de garantir une vie décente pour tous. Vamos aide les jeunes de 16 à 29 ans à s\'orienter vers la formation ou l\'emploi. Chez Vamos, les besoins des jeunes sont une priorité, ils sont pris en considération avec bienveillance, et le travail se fait en collaboration avec les acteurs municipaux et d\'autres partenaires.',
    description_es: 'La Fundación Deaconess es una organización sin fines de lucro y una firme defensora de la dignidad humana. Creemos que todas las personas tienen valor y merecen ser incluidas. Nuestro objetivo es asegurar una vida digna para todos. Vamos ayuda a jóvenes de 16 a 29 años a acceder a la educación o al empleo. En Vamos, se da prioridad a las necesidades de los jóvenes, se les brinda apoyo, y el trabajo se realiza conjuntamente con los municipios y otros actores.',
    logo: null,
  },
  {
    wid: '66229957e3be2b5a0270c9c0',
    name: 'Ensemble pour le respect de la diversité',
    slug: 'ensemble-pour-le-respect-de-la-diversite',
    url: 'https://ensemble-rd.com/',
    countryWid: '660c5c5353b452108ea87e67', // Canada
    description: 'Ensemble pour le respect de la diversité\'s mission is to work with young people to promote respect for differences and engage in dialogue with the aim of building an environment free from discrimination and intimidation. Their education and awareness-raising work enables individuals to become aware of their responsibilities in the face of the various forms of discrimination in their environment (racism, sexism, homophobia, transphobia, harassment, etc.).',
    description_fr: 'Ensemble pour le respect de la diversité à pour mission d\'agir avec les jeunes afin de promouvoir le respect des différences et engager le dialogue dans le but de bâtir un environnement sans discrimination ni intimidation. Le travail d\'éducation et de sensibilisation favorise une prise de conscience de la part des individu·e·s quant à leur responsabilité face aux différentes formes de discrimination dans leur milieu (racisme, sexisme, homophobie, transphobie, intimidation, etc.).',
    description_es: 'La misión de "Ensemble pour le respect de la diversité" es trabajar con los jóvenes para promover el respeto por la diversidad y entablar un diálogo con el objetivo de construir un entorno libre de discriminación e intimidación. Su labor de educación y sensibilización permite a las personas tomar conciencia de sus responsabilidades frente a las diversas formas de discriminación en su entorno (racismo, sexismo, homofobia, transfobia, acoso, etc.).',
    logo: { url: 'https://uploads-ssl.webflow.com/660c56ff22b3eb5bb777492f/662298fd18589e6e1a58500a_Verti-couleur-desc.png', filename: 'Verti-couleur-desc.png' },
  },
  {
    wid: '6616fad8c54ed6d67ef30b01',
    name: 'Quítate las Etiquetas',
    slug: 'quitate-las-etiquetas',
    url: 'https://qle.mx/',
    countryWid: '660c5c689a2cc136bab0eb1e', // Mexico
    description: 'Ditch the Label (Quitate las Etiquetas) helps young people aged 12-25 navigate the issues affecting them the most; from mental health and bullying to identity and relationships.',
    description_fr: 'Quitate las Etiquetas (Ditch the Label) aide les jeunes de 12 à 25 ans à faire face aux enjeux les plus fréquents, comme la santé mentale, l\'intimidation, l\'identité et les relations.',
    description_es: 'Quítate las Etiquetas (Ditch The Label) ayuda a los jóvenes de 12 a 25 años a navegar por los problemas que más les afectan; desde la salud mental y el acoso hasta la identidad y las relaciones.',
    logo: { url: 'https://uploads-ssl.webflow.com/660c56ff22b3eb5bb777492f/661ed542fff598648d496249_Las_Etiquas.png', filename: 'Las_Etiquas.png' },
  },
  {
    wid: '660c5dd26f3f164f6b2f9c34',
    name: 'ZARA – Zivilcourage und Anti-Rassismus-Arbeit',
    slug: 'zara---zivilcourage-und-anti-rassismus-arbeit',
    url: 'https://www.zara.or.at/',
    countryWid: '660c5c8114250a416fcc4b72', // Austria
    description: 'ZARA offers legal and psychosocial counselling to people affected by racism as well as to people affected by or witnessing online hate in Austria. Zara systematically document all reports on racism and online hate submitted to us.',
    description_fr: 'Basé en Autriche, ZARA offre des conseils juridiques et psychosociaux aux personnes touchées par le racisme ainsi qu\'aux personnes touchées par la haine en ligne ou qui en sont témoins.',
    description_es: 'ZARA ofrece asesoramiento jurídico y psicosocial a personas afectadas por el racismo, así como a personas afectadas o testigos del odio en línea en Austria. Zara documenta sistemáticamente todos los informes sobre racismo y odio en línea que nos envía.',
    logo: { url: 'https://uploads-ssl.webflow.com/660c56ff22b3eb5bb777492f/661ed550026e96475e930c4c_zara.png', filename: 'zara.png' },
  },
  {
    wid: '660c5d3b5412aaff46782174',
    name: 'World Anti-Bullying Forum',
    slug: 'world-anti-bullying-forum',
    url: 'https://worldantibullyingforum.com/',
    countryWid: '660c5c7866a8169111f1f12d', // Global
    description: 'The WABF is a great showcase to learn from one another on prevention and intervention successes, innovation, and future directions on bullying through the gathering of researchers, practitioners, school administrators, youth, and community members from across the globe.',
    description_fr: 'Le WABF est l\'occasion parfaite pour apprendre les uns des autres sur les succès de la prévention et de l\'intervention, l\'innovation et les orientations futures en matière d\'intimidation. Ce forum rassemble des chercheurs, des praticiens, des administrateurs scolaires, des jeunes et des membres de la communauté du monde entier.',
    description_es: 'El "WABF" es un gran lugar para aprender unos de otros sobre los éxitos de prevención e intervención, la innovación y el rumbo de las conversaciones sobre la intimidación a través de la compilación de información de investigadores, profesionales, administradores escolares, jóvenes y miembros de la comunidad de todo el mundo.',
    logo: { url: 'https://uploads-ssl.webflow.com/660c56ff22b3eb5bb777492f/661ed5696722df885438aa7a_WABF.png', filename: 'WABF.png' },
  },
  {
    wid: '660c5d2eb55a6090901ebf0e',
    name: 'The Polar Academy',
    slug: 'the-polar-academy',
    url: 'https://www.thepolaracademy.org/',
    countryWid: '660c5c70628092adfbcc3d7c', // Scotland
    description: 'The Polar Academy is a transformative youth charity that believes that every young person living in darkness deserves to find their true spirit. Inspiration through exploration.',
    description_fr: 'The Polar Academy est une organisation reconnue internationalement qui offre des opportunités uniques aux enfants et aux familles qui en ont le plus besoin.',
    description_es: '"The Polar Academy" es reconocida internacionalmente como una organización que ofrece verdaderas oportunidades que cambian la vida de los niños y las familias que más lo necesitan.',
    logo: { url: 'https://uploads-ssl.webflow.com/660c56ff22b3eb5bb777492f/661ed577026e96475e93310a_polar_academy.png', filename: 'polar_academy.png' },
  },
  {
    wid: '660c5d1b047595e5510a8ca9',
    name: '+FORT',
    slug: 'fondation-de-linstitut-universitaire-en-sante-mentale-de-montreal',
    url: 'https://unpeubeaucoupalafolie.org/en/',
    countryWid: '660c5c5353b452108ea87e67', // Canada
    description: '+FORT Stronger than Bullying is a mobile application that offers support to young victims of bullying. The app helps them to better understand what they\'re going through and offers them strategies to help diminish bullying. It is the result of collaboration by several Quebec researchers. ',
    description_fr: '+FORT est une application mobile qui offre un soutien aux jeunes victimes d\'intimidation à mieux comprendre ce qu\'ils vivent et à essayer des stratégies pour diminuer l\'intimidation vécue. Elle est le fruit de la collaboration de plusieurs chercheurs du Québec. ',
    description_es: 'Estamos comprometidos a apoyar proyectos tanto clínicos como científicos que busquen no sólo reducir los síntomas de la enfermedad y tratar a los pacientes sino que también aseguren la recuperación del paciente para que mantenga una relación sólida con la comunidad. Esto contribuirá a su reintegración a la sociedad.',
    logo: { url: 'https://uploads-ssl.webflow.com/660c56ff22b3eb5bb777492f/661ed5926b0e1a405356b88a_plus_fort.png', filename: 'plus_fort.png' },
  },
  {
    wid: '660c5cf75412aaff4677e06e',
    name: 'Fundación NEMI',
    slug: 'fundacion-nemi',
    url: 'https://www.nemi.com.mx/',
    countryWid: '660c5c689a2cc136bab0eb1e', // Mexico
    description: 'NEMI is a Mexican organization with the aim of participating actively in Mexico\'s social development through school and community programs.',
    description_fr: 'NEMI est une organisation mexicaine dont l\'objectif est de participer activement au développement social par le biais de programmes scolaires et communautaires.',
    description_es: 'NEMI es una organización mexicana fundada en 1996 con el objeto de participar activamente en el desarrollo social de México a través de programas escolares y comunitarios.',
    logo: { url: 'https://uploads-ssl.webflow.com/660c56ff22b3eb5bb777492f/661ed59e2f0e4e86e0f7dc43_NEMI.png', filename: 'NEMI.png' },
  },
  {
    wid: '660c5cdf699907665844641c',
    name: 'Fondation Jasmin Roy Sophie Desmarais',
    slug: 'fondation-jasmin-roy-sophie-desmarais',
    url: 'https://fondationjasminroy.com/en/',
    countryWid: '660c5c5353b452108ea87e67', // Canada
    description: 'FJRSD aims to raise awareness, educate, support and propose long-term solutions to the problems created by violence, discrimination and bullying. This includes educational establishments, work environments and senior populations.',
    description_fr: 'La FJRSD a pour objectif de sensibiliser, d\'éduquer, de soutenir et de proposer des solutions à long terme aux problèmes créés par la violence, la discrimination et l\'intimidation. Cela concerne les établissements d\'enseignement, les lieux de travail et les milieux de vies des personnes âgées.',
    description_es: 'La FJRSD está comprometido a crear conciencia, educar, apoyar y encontrar soluciones a largo plazo a los problemas de violencia, discriminación e intimidación en todos los ámbitos de la vida, incluidos los entornos educativos, laborales y en los que viven nuestros adultos mayores.',
    logo: { url: 'https://uploads-ssl.webflow.com/660c56ff22b3eb5bb777492f/661ed5bd2f0e4e86e0f81399_JSR.png', filename: 'JSR.png' },
  },
  {
    wid: '660c5cd345deeb86e7240391',
    name: 'Ditch The Label',
    slug: 'ditch-the-label',
    url: 'https://www.ditchthelabel.org/',
    countryWid: '660c5c5e631a8fd1c332c0b9', // United Kingdom
    description: 'Ditch the Label helps young people aged 12-25 navigate the issues affecting them the most; from mental health and bullying to identity and relationships.',
    description_fr: 'Ditch the Label aide les jeunes de 12 à 25 ans à faire face aux enjeux les plus fréquents, comme la santé mentale, l\'intimidation, l\'identité et les relations.',
    description_es: 'Quítate las Etiquetas ayuda a los jóvenes de 12 a 25 años a navegar por los problemas que más les afectan; desde la salud mental y el acoso hasta la identidad y las relaciones.',
    logo: { url: 'https://uploads-ssl.webflow.com/660c56ff22b3eb5bb777492f/661ed5cfe3806203feb3c02a_Ditch_Label.png', filename: 'Ditch_Label.png' },
  },
  {
    wid: '660c5cc78a5439927f1dc3db',
    name: 'Dare to Care',
    slug: 'dare-to-care',
    url: 'https://www.daretocare.ca/',
    countryWid: '660c5c5353b452108ea87e67', // Canada
    description: 'Dare to Care is a national award winning bully prevention program that has been tackling the issue since 1999 with practical and effective programming for school and sport communities.',
    description_fr: 'Dare to Care est un organisme de prévention de lutte contre l\'intimidation reconnu à l\'échelle nationale. Depuis 1999, DTC s\'attaque au problème en offrant des programmes pratiques et efficaces pour les élèves, les enseignantses, les parents et les communautés sportives. ',
    description_es: '"Dare to Care" es un programa de prevención del acoso escolar, ganador de un premio nacional, que ha estado abordando este problema generalizado y paralizante desde 1999 con un esquema práctico y eficaz para estudiantes, educadores y padres.',
    logo: { url: 'https://uploads-ssl.webflow.com/660c56ff22b3eb5bb777492f/661ed5e5d08e94d55c6bd274_Dare_2_Care.png', filename: 'Dare_2_Care.png' },
  },
  {
    wid: '660c5cbdca8b5a39f75c886b',
    name: 'Bully Zero',
    slug: 'bully-zero',
    url: 'https://www.bullyzero.org.au/',
    countryWid: '660c5c4d8a12e469d58e5834', // Australia
    description: 'Bully Zero is Australia\'s leading bullying prevention organisation, whose mission is to prevent and reduce bullying through evidence-based education, advocacy, and support.',
    description_fr: 'Bully Zero est une organisation australienne dont la mission est de prévenir et de réduire l\'intimidation par le biais d\'une éducation, d\'un plaidoyer et d\'un soutien fondés sur des données probantes.',
    description_es: '"Bully Zero" es la principal organización benéfica de Australia sobre la prevención del acoso, cuya misión es prevenir y reducir el acoso.',
    logo: { url: 'https://uploads-ssl.webflow.com/660c56ff22b3eb5bb777492f/661ed5f0b2220529d4d8ca91_bully_zero.png', filename: 'bully_zero.png' },
  },
  {
    wid: '660c5cb1ce35ab84218d11c9',
    name: 'Born This Way Foundation',
    slug: 'born-this-way-foundation',
    url: 'https://bornthisway.foundation/',
    countryWid: '660c5c449a2cc136bab0c043', // United States
    description: 'Born This Way Foundation, co-founded and led by Lady Gaga and her mother, Cynthia Bissett Germanotta, empowers and inspires young people to build a kinder, braver world that supports their mental health and wellbeing. Based on the scientific link between kindness and mental health and built in partnership with young people, the Foundation leverages research, programs, grantmaking, and partnerships to engage young people and connect them with accessible mental health resources. This approach comes to life through the storytelling platform Channel Kindness, the mental health training course Be There Certificate, the youth-led grantmaking program Kindness in Community Fund, and more, reaching thousands of young people around the world each year.',
    description_fr: 'La Born This Way Foundation, cofondée et dirigée par Lady Gaga et sa mère, Cynthia Bissett Germanotta, encourage et inspire les jeunes à construire un monde plus humain et plus courageux, qui soutient leur santé mentale et leur bien-être. Fondée sur le lien scientifique entre la gentillesse et la santé mentale, et développée en partenariat avec des jeunes, la fondation s\'appuie sur la recherche, des programmes, des subventions et des partenariats pour mobiliser les jeunes et les connecter à des ressources en santé mentale accessibles. Cette approche prend vie à travers la plateforme de narration Channel Kindness, la formation en santé mentale Be There Certificate, le programme de subvention dirigé par des jeunes Kindness in Community Fund, et bien d\'autres initiatives, touchant chaque année des milliers de jeunes à travers le monde.',
    description_es: 'Born This Way Foundation, cofundada y dirigida por Lady Gaga y su madre, Cynthia Bissett Germanotta, empodera e inspira a los jóvenes a construir un mundo más amable y valiente que apoye su salud mental y bienestar. Basada en la relación científica entre la bondad y la salud mental, y desarrollada en colaboración con jóvenes, la fundación utiliza la investigación, programas, subvenciones y alianzas para involucrar a los jóvenes y conectarlos con recursos de salud mental accesibles. Este enfoque se materializa a través de la plataforma de relatos Channel Kindness, el curso de formación en salud mental Be There Certificate, el programa de subvenciones liderado por jóvenes Kindness in Community Fund, entre otros, alcanzando a miles de jóvenes en todo el mundo cada año.',
    logo: { url: 'https://cdn.prod.website-files.com/660c56ff22b3eb5bb777492f/661ed5fdd08e94d55c6bd2d7_Born_this_way.png', filename: 'Born_this_way.png' },
  },
  {
    wid: '660c5ca9cde066e819e3f357',
    name: 'Bikers Against Bullies USA',
    slug: 'bikers-against-bullies-usa',
    url: 'https://www.bikersagainstbulliesusa.com/',
    countryWid: '660c5c449a2cc136bab0c043', // United States
    description: 'BAB USA is a nonprofit organization committed to creating awareness and educating both children and adults on the benefits of living in a society of respect for each other. ',
    description_fr: 'BAB USA est une organisation à but non lucratif dont l\'objectif est de sensibiliser et d\'éduquer les enfants et les adultes aux avantages de vivre dans une société où règne le respect.',
    description_es: '"BAB USA" es una organización sin fines de lucro comprometida con crear conciencia y educar a niños y adultos sobre los beneficios de vivir en una sociedad de respeto mutuo combinado con el autoempoderamiento.',
    logo: { url: 'https://uploads-ssl.webflow.com/660c56ff22b3eb5bb777492f/661ed60a6722df8854397824_Bikers_USA.png', filename: 'Bikers_USA.png' },
  },
];

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] || 'image/png' }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function uploadLogo(logoUrl, filename) {
  const { buffer, contentType } = await downloadBuffer(logoUrl);

  const boundary = `----FormBoundary${Date.now()}`;
  const header = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`
  );
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body   = Buffer.concat([header, buffer, footer]);

  const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  const text = await uploadRes.text();
  if (!uploadRes.ok) throw new Error(`Logo upload failed for ${filename} → HTTP ${uploadRes.status}: ${text}`);

  const [file] = JSON.parse(text);
  return file.id;
}

async function api(method, endpoint, body) {
  const res = await fetch(`${STRAPI_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${endpoint} → HTTP ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function main() {
  const map = fs.existsSync(MAP_FILE)
    ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'))
    : {};

  if (!map.countries) throw new Error('No countries in map — run seed-countries.js first.');
  map.partners = map.partners || {};

  const toSeed = PARTNERS.filter(p => !map.partners[p.wid]);
  console.log(`Seeding ${toSeed.length} partners (${PARTNERS.length - toSeed.length} already in map)…\n`);

  for (const p of toSeed) {
    process.stdout.write(`→ ${p.name} … `);

    const countryEntry = map.countries[p.countryWid];
    if (!countryEntry) throw new Error(`Country not found in map for wid: ${p.countryWid}`);

    // Upload logo if present
    let logoId = null;
    if (p.logo) {
      process.stdout.write('uploading logo … ');
      logoId = await uploadLogo(p.logo.url, p.logo.filename);
    }

    const { data } = await api('POST', '/api/partners', {
      data: {
        name: p.name,
        slug: p.slug,
        url: p.url,
        description: p.description,
        country: countryEntry.documentId,
        ...(logoId ? { logo: logoId } : {}),
      },
    });

    const { id, documentId } = data;

    // FR localization
    await api('PUT', `/api/partners/${documentId}?locale=fr`, {
      data: {
        name: p.name,
        url: p.url,
        description: p.description_fr,
        ...(logoId ? { logo: logoId } : {}),
      },
    });

    // ES localization
    await api('PUT', `/api/partners/${documentId}?locale=es`, {
      data: {
        name: p.name,
        url: p.url,
        description: p.description_es,
        ...(logoId ? { logo: logoId } : {}),
      },
    });

    map.partners[p.wid] = { id, documentId, name: p.name };
    console.log(`id=${id}, documentId=${documentId}`);

    fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
  }

  console.log(`\nDone. Mapping saved → ${MAP_FILE}`);
}

main().catch(err => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
