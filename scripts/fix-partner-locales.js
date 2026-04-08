#!/usr/bin/env node
'use strict';

/**
 * Fix: Partner FR and ES locales (set name, url, logo + description).
 *
 * Usage:
 *   STRAPI_TOKEN=<api-token> node scripts/fix-partner-locales.js
 */

const fs   = require('fs');
const path = require('path');

const STRAPI_URL   = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const MAP_FILE     = path.join(__dirname, 'webflow-id-map.json');

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_TOKEN env variable is required.');
  process.exit(1);
}

// Full partner data keyed by Webflow ID
const PARTNERS = {
  '68122766bd52d8b24770bbbf': {
    name: 'Deaconess Foundation, Vamos Rovaniemi',
    url:  'https://www.hdl.fi/en/',
    fr: 'La Fondation Deaconess est une organisation à but non lucratif et un défenseur audacieux de la dignité humaine. Nous croyons que chaque personne a de la valeur et mérite d\'être incluse. Notre objectif est de garantir une vie décente pour tous. Vamos aide les jeunes de 16 à 29 ans à s\'orienter vers la formation ou l\'emploi. Chez Vamos, les besoins des jeunes sont une priorité, ils sont pris en considération avec bienveillance, et le travail se fait en collaboration avec les acteurs municipaux et d\'autres partenaires.',
    es: 'La Fundación Deaconess es una organización sin fines de lucro y una firme defensora de la dignidad humana. Creemos que todas las personas tienen valor y merecen ser incluidas. Nuestro objetivo es asegurar una vida digna para todos. Vamos ayuda a jóvenes de 16 a 29 años a acceder a la educación o al empleo. En Vamos, se da prioridad a las necesidades de los jóvenes, se les brinda apoyo, y el trabajo se realiza conjuntamente con los municipios y otros actores.',
  },
  '66229957e3be2b5a0270c9c0': {
    name: 'Ensemble pour le respect de la diversité',
    url:  'https://ensemble-rd.com/',
    fr: 'Ensemble pour le respect de la diversité à pour mission d\'agir avec les jeunes afin de promouvoir le respect des différences et engager le dialogue dans le but de bâtir un environnement sans discrimination ni intimidation. Le travail d\'éducation et de sensibilisation favorise une prise de conscience de la part des individu·e·s quant à leur responsabilité face aux différentes formes de discrimination dans leur milieu (racisme, sexisme, homophobie, transphobie, intimidation, etc.).',
    es: 'La misión de "Ensemble pour le respect de la diversité" es trabajar con los jóvenes para promover el respeto por la diversidad y entablar un diálogo con el objetivo de construir un entorno libre de discriminación e intimidación. Su labor de educación y sensibilización permite a las personas tomar conciencia de sus responsabilidades frente a las diversas formas de discriminación en su entorno (racismo, sexismo, homofobia, transfobia, acoso, etc.).',
  },
  '6616fad8c54ed6d67ef30b01': {
    name: 'Quítate las Etiquetas',
    url:  'https://qle.mx/',
    fr: 'Quitate las Etiquetas (Ditch the Label) aide les jeunes de 12 à 25 ans à faire face aux enjeux les plus fréquents, comme la santé mentale, l\'intimidation, l\'identité et les relations.',
    es: 'Quítate las Etiquetas (Ditch The Label) ayuda a los jóvenes de 12 a 25 años a navegar por los problemas que más les afectan; desde la salud mental y el acoso hasta la identidad y las relaciones.',
  },
  '660c5dd26f3f164f6b2f9c34': {
    name: 'ZARA – Zivilcourage und Anti-Rassismus-Arbeit',
    url:  'https://www.zara.or.at/',
    fr: 'Basé en Autriche, ZARA offre des conseils juridiques et psychosociaux aux personnes touchées par le racisme ainsi qu\'aux personnes touchées par la haine en ligne ou qui en sont témoins.',
    es: 'ZARA ofrece asesoramiento jurídico y psicosocial a personas afectadas por el racismo, así como a personas afectadas o testigos del odio en línea en Austria. Zara documenta sistemáticamente todos los informes sobre racismo y odio en línea que nos envía.',
  },
  '660c5d3b5412aaff46782174': {
    name: 'World Anti-Bullying Forum',
    url:  'https://worldantibullyingforum.com/',
    fr: 'Le WABF est l\'occasion parfaite pour apprendre les uns des autres sur les succès de la prévention et de l\'intervention, l\'innovation et les orientations futures en matière d\'intimidation. Ce forum rassemble des chercheurs, des praticiens, des administrateurs scolaires, des jeunes et des membres de la communauté du monde entier.',
    es: 'El "WABF" es un gran lugar para aprender unos de otros sobre los éxitos de prevención e intervención, la innovación y el rumbo de las conversaciones sobre la intimidación a través de la compilación de información de investigadores, profesionales, administradores escolares, jóvenes y miembros de la comunidad de todo el mundo.',
  },
  '660c5d2eb55a6090901ebf0e': {
    name: 'The Polar Academy',
    url:  'https://www.thepolaracademy.org/',
    fr: 'The Polar Academy est une organisation reconnue internationalement qui offre des opportunités uniques aux enfants et aux familles qui en ont le plus besoin.',
    es: '"The Polar Academy" es reconocida internacionalmente como una organización que ofrece verdaderas oportunidades que cambian la vida de los niños y las familias que más lo necesitan.',
  },
  '660c5d1b047595e5510a8ca9': {
    name: '+FORT',
    url:  'https://unpeubeaucoupalafolie.org/en/',
    fr: '+FORT est une application mobile qui offre un soutien aux jeunes victimes d\'intimidation à mieux comprendre ce qu\'ils vivent et à essayer des stratégies pour diminuer l\'intimidation vécue. Elle est le fruit de la collaboration de plusieurs chercheurs du Québec.',
    es: 'Estamos comprometidos a apoyar proyectos tanto clínicos como científicos que busquen no sólo reducir los síntomas de la enfermedad y tratar a los pacientes sino que también aseguren la recuperación del paciente para que mantenga una relación sólida con la comunidad. Esto contribuirá a su reintegración a la sociedad.',
  },
  '660c5cf75412aaff4677e06e': {
    name: 'Fundación NEMI',
    url:  'https://www.nemi.com.mx/',
    fr: 'NEMI est une organisation mexicaine dont l\'objectif est de participer activement au développement social par le biais de programmes scolaires et communautaires.',
    es: 'NEMI es una organización mexicana fundada en 1996 con el objeto de participar activamente en el desarrollo social de México a través de programas escolares y comunitarios.',
  },
  '660c5cdf699907665844641c': {
    name: 'Fondation Jasmin Roy Sophie Desmarais',
    url:  'https://fondationjasminroy.com/en/',
    fr: 'La FJRSD a pour objectif de sensibiliser, d\'éduquer, de soutenir et de proposer des solutions à long terme aux problèmes créés par la violence, la discrimination et l\'intimidation. Cela concerne les établissements d\'enseignement, les lieux de travail et les milieux de vies des personnes âgées.',
    es: 'La FJRSD está comprometido a crear conciencia, educar, apoyar y encontrar soluciones a largo plazo a los problemas de violencia, discriminación e intimidación en todos los ámbitos de la vida, incluidos los entornos educativos, laborales y en los que viven nuestros adultos mayores.',
  },
  '660c5cd345deeb86e7240391': {
    name: 'Ditch The Label',
    url:  'https://www.ditchthelabel.org/',
    fr: 'Ditch the Label aide les jeunes de 12 à 25 ans à faire face aux enjeux les plus fréquents, comme la santé mentale, l\'intimidation, l\'identité et les relations.',
    es: 'Quítate las Etiquetas ayuda a los jóvenes de 12 a 25 años a navegar por los problemas que más les afectan; desde la salud mental y el acoso hasta la identidad y las relaciones.',
  },
  '660c5cc78a5439927f1dc3db': {
    name: 'Dare to Care',
    url:  'https://www.daretocare.ca/',
    fr: 'Dare to Care est un organisme de prévention de lutte contre l\'intimidation reconnu à l\'échelle nationale. Depuis 1999, DTC s\'attaque au problème en offrant des programmes pratiques et efficaces pour les élèves, les enseignantses, les parents et les communautés sportives.',
    es: '"Dare to Care" es un programa de prevención del acoso escolar, ganador de un premio nacional, que ha estado abordando este problema generalizado y paralizante desde 1999 con un esquema práctico y eficaz para estudiantes, educadores y padres.',
  },
  '660c5cbdca8b5a39f75c886b': {
    name: 'Bully Zero',
    url:  'https://www.bullyzero.org.au/',
    fr: 'Bully Zero est une organisation australienne dont la mission est de prévenir et de réduire l\'intimidation par le biais d\'une éducation, d\'un plaidoyer et d\'un soutien fondés sur des données probantes.',
    es: '"Bully Zero" es la principal organización benéfica de Australia sobre la prevención del acoso, cuya misión es prevenir y reducir el acoso.',
  },
  '660c5cb1ce35ab84218d11c9': {
    name: 'Born This Way Foundation',
    url:  'https://bornthisway.foundation/',
    fr: 'La Born This Way Foundation, cofondée et dirigée par Lady Gaga et sa mère, Cynthia Bissett Germanotta, encourage et inspire les jeunes à construire un monde plus humain et plus courageux, qui soutient leur santé mentale et leur bien-être. Fondée sur le lien scientifique entre la gentillesse et la santé mentale, et développée en partenariat avec des jeunes, la fondation s\'appuie sur la recherche, des programmes, des subventions et des partenariats pour mobiliser les jeunes et les connecter à des ressources en santé mentale accessibles. Cette approche prend vie à travers la plateforme de narration Channel Kindness, la formation en santé mentale Be There Certificate, le programme de subvention dirigé par des jeunes Kindness in Community Fund, et bien d\'autres initiatives, touchant chaque année des milliers de jeunes à travers le monde.',
    es: 'Born This Way Foundation, cofundada y dirigida por Lady Gaga y su madre, Cynthia Bissett Germanotta, empodera e inspira a los jóvenes a construir un mundo más amable y valiente que apoye su salud mental y bienestar. Basada en la relación científica entre la bondad y la salud mental, y desarrollada en colaboración con jóvenes, la fundación utiliza la investigación, programas, subvenciones y alianzas para involucrar a los jóvenes y conectarlos con recursos de salud mental accesibles. Este enfoque se materializa a través de la plataforma de relatos Channel Kindness, el curso de formación en salud mental Be There Certificate, el programa de subvenciones liderado por jóvenes Kindness in Community Fund, entre otros, alcanzando a miles de jóvenes en todo el mundo cada año.',
  },
  '660c5ca9cde066e819e3f357': {
    name: 'Bikers Against Bullies USA',
    url:  'https://www.bikersagainstbulliesusa.com/',
    fr: 'BAB USA est une organisation à but non lucratif dont l\'objectif est de sensibiliser et d\'éduquer les enfants et les adultes aux avantages de vivre dans une société où règne le respect.',
    es: '"BAB USA" es una organización sin fines de lucro comprometida con crear conciencia y educar a niños y adultos sobre los beneficios de vivir en una sociedad de respeto mutuo combinado con el autoempoderamiento.',
  },
};

async function api(method, endpoint, body) {
  const res = await fetch(`${STRAPI_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${STRAPI_TOKEN}` },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${endpoint} → HTTP ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function main() {
  const map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));

  for (const [wid, entry] of Object.entries(map.partners)) {
    const p = PARTNERS[wid];
    if (!p) { console.log(`⚠ No data for wid ${wid} — skipping`); continue; }

    process.stdout.write(`→ ${p.name} … `);

    // Fetch EN entry to get logo ID, slug, and country documentId
    const { data: en } = await api('GET', `/api/partners/${entry.documentId}?populate[0]=logo&populate[1]=country&locale=en`);
    const logoId      = en.logo?.id ?? null;
    const slug        = en.slug ?? null;
    const countryDocId = en.country?.documentId ?? null;

    for (const locale of ['fr', 'es']) {
      await api('PUT', `/api/partners/${entry.documentId}?locale=${locale}`, {
        data: {
          name: p.name,
          url:  p.url,
          description: p[locale],
          ...(logoId      ? { logo:    logoId }                               : {}),
          ...(slug        ? { slug }                                           : {}),
          ...(countryDocId ? { country: { connect: [{ documentId: countryDocId }] } } : {}),
        },
      });
    }

    console.log('done');
  }

  console.log('\nAll partner locales fixed.');
}

main().catch(err => { console.error('\nFailed:', err.message); process.exit(1); });
