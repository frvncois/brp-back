#!/usr/bin/env node
'use strict';

/**
 * Seed: Categories (EN default + FR + ES localizations)
 *
 * Usage:
 *   STRAPI_TOKEN=<api-token> node scripts/seed-categories.js
 *
 * Saves Webflow→Strapi mapping to scripts/webflow-id-map.json
 */

const fs   = require('fs');
const path = require('path');

const STRAPI_URL   = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const MAP_FILE     = path.join(__dirname, 'webflow-id-map.json');

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_TOKEN env variable is required.\n  Usage: STRAPI_TOKEN=<token> node scripts/seed-categories.js');
  process.exit(1);
}

// audience: null means no audience type assigned
const CATEGORIES = [
  // ── Adult (10) ──────────────────────────────────────────────────────────────
  { wid: '6700340d2d936f77afc048b6', audience: 'adult',    slug: 'what-are-the-long-term-effects-of-being-bullied-2',                             en: 'What are the long-term effects of being bullied?',                                        fr: 'Quels sont les effets à long terme de l\'harcèlement ?',                                             es: '¿Cuáles son los efectos a largo plazo de ser acosado?' },
  { wid: '6700123bde750f8977c4d1a2', audience: 'adult',    slug: 'why-do-bullies-exist-a',                                                         en: 'Why do bullies exist?',                                                                   fr: 'Pourquoi les intimidateurs existent-ils ?',                                                          es: '¿Por qué existen los acosadores?' },
  { wid: '6700121fb72860ccaee19dd6', audience: 'adult',    slug: 'how-do-i-stop-bullying-others-a',                                                en: 'How do I stop bullying others?',                                                          fr: 'Comment arrêter de harceler les autres ?',                                                           es: '¿Cómo dejo de acosar a otros?' },
  { wid: '6700120511cca9cbb82db52f', audience: 'adult',    slug: 'what-do-i-do-when-i-witness-racism-a',                                           en: 'What do I do when I witness racism?',                                                     fr: 'Que dois-je faire lorsque je suis témoin de racisme ?',                                              es: '¿Qué hago cuando soy testigo de racismo?' },
  { wid: '670011e8c3b0d7abb1b5478d', audience: 'adult',    slug: 'my-friends-wont-talk-to-me-anymore-what-can-i-do-a',                             en: 'My friends won\'t talk to me anymore. What can I do?',                                    fr: 'Mes amis ne me parlent plus. Qu\'est-ce que je peux faire ?',                                        es: 'Mis amigos ya no quieren hablar conmigo. ¿Qué puedo hacer?' },
  { wid: '670011cbf9942a91ca7557af', audience: 'adult',    slug: 'how-can-i-overcome-cyberbullying-a',                                             en: 'How can I overcome cyberbullying?',                                                       fr: 'Comment surmonter la cyberintimidation ?',                                                           es: '¿Cómo puedo superar el ciberacoso?' },
  { wid: '670011ac72e9b58704173373', audience: 'adult',    slug: 'what-is-considered-bullying-a',                                                   en: 'What is considered bullying?',                                                            fr: 'Qu\'est-ce qui est considéré comme de l\'intimidation ?',                                            es: '¿Qué se considera acoso escolar?' },
  { wid: '67001179c3b0d7abb1b4c1a1', audience: 'adult',    slug: 'how-can-i-recognize-bullying-a',                                                  en: 'How can I recognize bullying?',                                                           fr: 'Comment reconnaître le harcèlement ?',                                                               es: '¿Qué se considera acoso escolar?' },
  { wid: '6700114bde750f8977c39efa', audience: 'adult',    slug: 'when-does-banter-become-bullying-a',                                              en: 'When does banter become bullying?',                                                       fr: 'Quand la plaisanterie devient-elle de l\'intimidation ?',                                            es: '¿Cuándo se convierte la broma en acoso?' },
  { wid: '67001123a261bb0d99a75611', audience: 'adult',    slug: 'get-inspired-a',                                                                  en: 'Get inspired!',                                                                           fr: 'Laissez-vous inspirer !',                                                                            es: '¡Inspírate!' },

  // ── Parent (18) ─────────────────────────────────────────────────────────────
  { wid: '660c5ac7f4b0828e89983898', audience: 'parent',   slug: 'what-is-considered-bullying',                                                     en: 'What is considered bullying?',                                                            fr: 'Qu\'est-ce qui est considéré comme de l\'intimidation ?',                                            es: '¿Qué se considera acoso?' },
  { wid: '660c5ac7f63e67063a056375', audience: 'parent',   slug: 'how-can-i-keep-my-child-from-bullying-others',                                    en: 'How can I keep my child from bullying others?',                                           fr: 'Comment puis-je empêcher mon enfant d\'intimider les autres ?',                                      es: '¿Cómo puedo evitar que mi hijo acose a otros?' },
  { wid: '660c5ac7631a8fd1c3312ea0', audience: 'parent',   slug: 'how-can-i-start-a-conversation-with-my-child-about-bullying',                     en: 'How can I start a conversation with my child about bullying?',                            fr: 'Comment puis-je entamer une conversation avec mon enfant au sujet de l\'intimidation ?',             es: '¿Cómo puedo iniciar una conversación con mi hijo sobre el acoso?' },
  { wid: '660c5ac75412aaff46751a82', audience: 'parent',   slug: 'when-does-banter-become-bullying',                                                en: 'When does banter become bullying?',                                                       fr: 'Quand est-ce que la plaisanterie devient de l\'intimidation ?',                                      es: '¿Cuándo se convierte la broma en acoso?' },
  { wid: '660c5ac7342b949bc78b32bf', audience: 'parent',   slug: 'my-child-is-being-bullied-at-school-what-can-i-do',                               en: 'My child is being bullied at school. What can I do?',                                     fr: 'Mon enfant est intimidé à l\'école. Que puis-je faire ?',                                            es: 'Mi hijo está siendo acosado en la escuela. ¿Qué puedo hacer?' },
  { wid: '660c5ac7bc03d5ce7df86e65', audience: 'parent',   slug: 'how-can-i-keep-my-child-safe-online',                                             en: 'How can I keep my child safe online?',                                                    fr: 'Comment puis-je assurer la sécurité de mon enfant en ligne ?',                                       es: '¿Cómo puedo mantener a mi hijo seguro en línea?' },
  { wid: '660c5ac756beceaf4a559ef8', audience: 'parent',   slug: 'how-can-i-help-my-child-overcome-bullying',                                       en: 'How can I help my child overcome bullying?',                                              fr: 'Comment puis-je aider mon enfant à surmonter l\'intimidation ?',                                     es: '¿Cómo puedo ayudar a mi hijo a superar el acoso?' },
  { wid: '660c5ac72a74a3b33b1bec7c', audience: 'parent',   slug: 'when-is-it-time-to-get-professional-help-for-my-child',                           en: 'When is it time to get professional help for my child?',                                  fr: 'Quand est-il temps de chercher de l\'aide professionnelle pour mon enfant ?',                        es: '¿Cuándo es el momento de obtener ayuda profesional para mi hijo?' },
  { wid: '660c5ac7cde066e819e22bff', audience: 'parent',   slug: 'how-can-i-recognize-the-warning-signs-if-my-child-is-being-bullied',              en: 'How can I recognize the warning signs if my child is being bullied?',                     fr: 'Comment puis-je reconnaître les signes avant-coureurs si mon enfant est intimidé ?',                 es: '¿Cómo puedo reconocer las señales de advertencia si mi hijo está siendo acosado?' },
  { wid: '660c5ac8ce35ab84218b30ba', audience: 'parent',   slug: 'what-are-the-long-term-effects-of-being-bullied-60c89',                           en: 'What are the long-term effects of being bullied?',                                        fr: 'Quels sont les effets à long terme de l\'intimidation ?',                                            es: '¿Cuáles son los efectos a largo plazo de ser acosado?' },
  { wid: '6616d67a7dd8ed5f4b106b7e', audience: 'parent',   slug: 'a-how-can-i-practice-kind-behavior-with-my-child',                                en: 'How can I practice kind behavior with my child?',                                         fr: 'Comment puis-je pratiquer un comportement bienveillant avec mon enfant ?',                           es: '¿Cómo puedo practicar un comportamiento amable con mi hijo?' },
  { wid: '6617d07b547d1117a29b1462', audience: 'parent',   slug: 'a-get-inspired',                                                                  en: 'Get inspired!',                                                                           fr: 'Laissez-vous inspirer ?',                                                                            es: '¡Inspírate!' },
  { wid: '6616aa7fa71a72fc94f5afcf', audience: 'parent',   slug: 'e-when-does-banter-become-bullying',                                              en: 'When does banter become bullying?',                                                       fr: 'Quand est-ce que la plaisanterie devient de l\'intimidation ?',                                      es: '¿Cuándo se convierte la broma en acoso?' },
  { wid: '6616aa41c92600cd463b5e34', audience: 'parent',   slug: 'c-how-can-i-recognize-bullying',                                                  en: 'How can I recognize bullying?',                                                           fr: 'Qu\'est-ce qui est considéré comme de l\'intimidation ?',                                            es: '¿Qué se considera acoso escolar?' },
  { wid: '6616aa0d16ffc1830e9ec33c', audience: 'parent',   slug: 'c-when-does-banter-become-bullying',                                              en: 'When does banter become bullying?',                                                       fr: 'Quand est-ce que la plaisanterie devient de l\'intimidation ?',                                      es: '¿Cuándo se convierte la broma en acoso?' },
  { wid: '6616a93970143aac448aa621', audience: 'parent',   slug: 'b-how-can-i-talk-to-parents-about-their-child-being-bullied',                     en: 'How can I talk to parents about their child being bullied?',                              fr: 'Comment puis-je parler aux parents d\'un enfant qui est intimidé ?',                                 es: '¿Cómo puedo hablar con los padres sobre su hijo siendo acosado?' },
  // #27 and #28 are duplicates of #24 and #25 (same Webflow IDs) — skipped

  // ── Teacher (13) ────────────────────────────────────────────────────────────
  { wid: '660c5ac8697c42f695826119', audience: 'teacher',  slug: 'what-are-the-long-term-effects-of-being-bullied',                                 en: 'What are the long-term effects of being bullied?',                                        fr: 'Quels sont les effets à long terme de l\'intimidation ?',                                            es: '¿Cuáles son los efectos a largo plazo de ser acosado?' },
  { wid: '660c5ac8342b949bc78b34c6', audience: 'teacher',  slug: 'how-can-i-recognize-if-one-of-my-students-is-a-victim-of-bullying',               en: 'How can I recognize if one of my students is a victim of bullying?',                      fr: 'Comment puis-je reconnaître si l\'un de mes élèves est victime d\'intimidation ?',                  es: '¿Cómo puedo reconocer si uno de mis estudiantes es víctima de acoso?' },
  { wid: '660c5ac89ac96028f228f96b', audience: 'teacher',  slug: 'how-can-my-students-safely-report-bullying-incidents',                            en: 'How can my students safely report bullying incidents?',                                    fr: 'Comment mes élèves peuvent-ils signaler en toute sécurité les incidents d\'intimidation ?',          es: '¿Cómo mis estudiantes pueden reportar de forma segura incidentes de acoso?' },
  { wid: '660c5ac8b55a6090901c0200', audience: 'teacher',  slug: 'how-can-i-talk-to-a-bullys-parents-about-their-childs-behaviour',                 en: 'How can I talk to a bully\'s parents about their child\'s behaviour?',                    fr: 'Comment puis-je parler aux parents d\'un intimidateur du comportement de leur enfant ?',             es: '¿Cómo puedo hablar con los padres de un acosador sobre su comportamiento?' },
  { wid: '660c5ac738505fd4d5f5179b', audience: 'teacher',  slug: 'how-can-i-talk-to-parents-about-their-child-being-bullied',                       en: 'How can I talk to parents about their child being bullied?',                              fr: 'Comment puis-je parler aux parents d\'un enfant qui est intimidé ?',                                 es: '¿Cómo puedo hablar con los padres sobre su hijo siendo acosado?' },
  { wid: '660c5ac7cde066e819e22c26', audience: 'teacher',  slug: 'how-do-i-handle-a-bully-in-my-classroom',                                         en: 'How do I handle a bully in my classroom?',                                                fr: 'Comment gérer un intimidateur dans ma classe ?',                                                     es: '¿Cómo manejo a un acosador en mi aula?' },
  { wid: '660c5ac7dd97ebc73461f1b5', audience: 'teacher',  slug: 'when-is-it-time-to-talk-to-parents-about-their-child-bullying-or-being-bullied',  en: 'When is it time to talk to parents about their child bullying or being bullied?',         fr: 'Quand est-il temps de parler aux parents d\'un enfant qui intimide ou est intimidé ?',               es: '¿Cuándo es el momento de hablar con los padres sobre su hijo acosando o siendo acosado?' },
  { wid: '660c5ac7f63e67063a0563e5', audience: 'teacher',  slug: 'what-are-some-anti-bullying-activities-i-can-do-with-my-students',                en: 'What are some Anti-Bullying activities I can do with my students?',                       fr: 'Quelles sont certaines activités anti-intimidation que je peux faire avec mes élèves ?',             es: '¿Cuáles son algunas actividades anti-acoso que puedo hacer con mis estudiantes?' },
  { wid: '660c5ac7de0d4915006c6ef8', audience: 'teacher',  slug: 'one-of-my-students-is-being-bullied-what-can-i-do',                               en: 'One of my students is being bullied. What can I do?',                                     fr: 'Un de mes élèves est intimidé. Que puis-je faire ?',                                                 es: 'Uno de mis estudiantes está siendo acosado. ¿Qué puedo hacer?' },
  { wid: '66229bf9ab5332294ab95a9b', audience: 'teacher',  slug: 'how-can-i-help-my-students-with-cyberbullying',                                   en: 'How can I help my students with cyberbullying?',                                          fr: 'Comment aider mes élèves avec la cyberintimidation?',                                                es: '¿Cómo puedo ayudar a mis alumnos con el ciberacoso?' },
  { wid: '6617d09b547d1117a29b31ee', audience: 'teacher',  slug: 'b-get-inspired',                                                                  en: 'Get inspired!',                                                                           fr: 'Laissez-vous inspirer ?',                                                                            es: '¡Inspírate!' },
  { wid: '6616a906baee1f9ab0a46cae', audience: 'teacher',  slug: 'b-when-does-banter-become-bullying',                                              en: 'When does banter become bullying?',                                                       fr: 'Quand est-ce que la plaisanterie devient de l\'intimidation ?',                                      es: '¿Cuándo se convierte la broma en acoso?' },
  { wid: '6616a8b6393b7c37a920af3a', audience: 'teacher',  slug: 'b---what-is-considered-bullying',                                                 en: 'What is considered bullying?',                                                            fr: 'Qu\'est-ce qui est considéré comme de l\'intimidation ?',                                            es: '¿Qué se considera acoso escolar?' },

  // ── Coach (10) ──────────────────────────────────────────────────────────────
  { wid: '660c5ac8889881bee4cb6f1f', audience: 'coach',    slug: 'what-are-the-long-term-effects-of-being-bullied-f6cb4',                           en: 'What are the long-term effects of being bullied?',                                        fr: 'Quels sont les effets à long terme de l\'intimidation ?',                                            es: '¿Cuáles son los efectos a largo plazo de ser acosado?' },
  { wid: '660c5ac845deeb86e7221b90', audience: 'coach',    slug: 'how-can-i-recognize-if-one-of-my-students-is-a-victim-of-bullying-3df9d',         en: 'How can I recognize if one of my students is a victim of bullying?',                      fr: 'Comment puis-je reconnaître si l\'un de mes élèves est victime d\'intimidation ?',                  es: '¿Cómo puedo reconocer si uno de mis estudiantes es víctima de acoso?' },
  { wid: '660c5ac8706c8c704cfaee8e', audience: 'coach',    slug: 'how-can-my-students-safely-report-bullying-incidents-db72e',                      en: 'How can my students safely report bullying incidents?',                                    fr: 'Comment mes élèves peuvent-ils signaler en toute sécurité les incidents d\'intimidation ?',          es: '¿Cómo mis estudiantes pueden reportar de forma segura incidentes de acoso?' },
  { wid: '660c5ac8578348c88806abc9', audience: 'coach',    slug: 'what-are-some-anti-bullying-activities-i-can-do-with-my-students-2126d',          en: 'What are some Anti-Bullying activities I can do with my students?',                       fr: 'Quelles sont certaines activités anti-intimidation que je peux faire avec mes élèves ?',             es: '¿Cuáles son algunas actividades anti-acoso que puedo hacer con mis estudiantes?' },
  { wid: '660c5ac8342b949bc78b3515', audience: 'coach',    slug: 'how-can-i-talk-to-a-bullys-parents-about-their-childs-behaviour-40dbe',           en: 'How can I talk to a bully\'s parents about their child\'s behaviour?',                    fr: 'Comment puis-je parler aux parents d\'un intimidateur du comportement de leur enfant ?',             es: '¿Cómo puedo hablar con los padres de un acosador sobre su comportamiento?' },
  { wid: '660c5ac815d142678b70c000', audience: 'coach',    slug: 'when-is-it-time-to-talk-to-parents-about-their-child-bullying-or-being-bullied-bd284', en: 'When is it time to talk to parents about their child bullying or being bullied?',      fr: 'Quand est-il temps de parler aux parents d\'un enfant qui intimide ou est intimidé ?',               es: '¿Cuándo es el momento de hablar con los padres sobre su hijo acosando o siendo acosado?' },
  { wid: '660c5ac86f3f164f6b2cbc53', audience: 'coach',    slug: 'how-can-i-talk-to-parents-about-their-child-being-bullied-72807',                 en: 'How can I talk to parents about their child being bullied?',                              fr: 'Comment puis-je parler aux parents d\'un enfant qui est intimidé ?',                                 es: '¿Cómo puedo hablar con los padres sobre su hijo siendo acosado?' },
  { wid: '660c5ac8c70cb2e592308522', audience: 'coach',    slug: 'how-do-i-handle-a-bully-in-my-classroom-5cc74',                                   en: 'How do I handle a bully in my classroom?',                                                fr: 'Comment gérer un intimidateur dans ma classe ?',                                                     es: '¿Cómo manejo a un acosador en mi aula?' },
  { wid: '660c5ac8b55a6090901c023c', audience: 'coach',    slug: 'one-of-my-students-is-being-bullied-what-can-i-do-69c6b',                         en: 'One of my students is being bullied. What can I do?',                                     fr: 'Un de mes élèves est intimidé. Que puis-je faire ?',                                                 es: 'Uno de mis estudiantes está siendo acosado. ¿Qué puedo hacer?' },
  { wid: '6617d0b2ceb7312d1c56d8c1', audience: 'coach',    slug: 'd-get-inspired',                                                                  en: 'Get inspired!',                                                                           fr: 'Laissez-vous inspirer ?',                                                                            es: '¡Inspírate!' },

  // ── Kid (12) ────────────────────────────────────────────────────────────────
  { wid: '660c5ac92a74a3b33b1bee22', audience: 'kid',      slug: 'what-are-the-long-term-effects-of-being-bullied-90c5c',                           en: 'What are the long-term effects of being bullied?',                                        fr: 'Quels sont les effets à long terme de l\'intimidation ?',                                            es: '¿Cuáles son los efectos a largo plazo de ser acosado?' },
  { wid: '660c5ac914250a416fca435e', audience: 'kid',      slug: 'my-friends-are-bullying-another-student-and-want-me-to-join-in-what-should-i-do', en: 'My friends are bullying another student and want me to join in. What should I do?',       fr: 'Mes amis intimident un autre élève et veulent que je me joigne à eux. Que devrais-je faire ?',       es: 'Mis amigos están acosando a otro estudiante y quieren que me una a ellos. ¿Qué debería hacer?' },
  // #54 — fixed FR/ES translations
  { wid: '660c5ac9fa9ab223a3b24972', audience: 'kid',      slug: 'my-friends-wont-talk-to-me-anymore-what-can-i-do',                                en: 'My friends won\'t talk to me anymore. What can I do?',                                    fr: 'Mes amis ne veulent plus me parler. Que puis-je faire ?',                                            es: 'Mis amigos ya no quieren hablar conmigo. ¿Qué puedo hacer?' },
  { wid: '660c5ac90366c7a0070aea2d', audience: 'kid',      slug: 'how-can-i-overcome-cyberbullying',                                                en: 'How can I overcome cyberbullying?',                                                       fr: 'Comment surmonter le cyberharcèlement ?',                                                            es: '¿Cómo puedo superar el ciberacoso?' },
  { wid: '660c5ac9fe8455079daf9a51', audience: 'kid',      slug: 'why-do-bullies-exist',                                                            en: 'Why do bullies exist?',                                                                   fr: 'Pourquoi les intimidateurs existent-ils ?',                                                          es: '¿Por qué existen los acosadores?' },
  { wid: '660c5ac945deeb86e7221cb2', audience: 'kid',      slug: 'what-do-i-do-when-i-witness-racism',                                              en: 'What do I do when I witness racism?',                                                     fr: 'Que faire lorsque je suis témoin de racisme ?',                                                      es: '¿Qué hago cuando soy testigo de racismo?' },
  { wid: '660c5ac946528f2be3232b72', audience: 'kid',      slug: 'how-do-i-open-up-to-someone-about-bullying',                                      en: 'How do I open up to someone about bullying?',                                             fr: 'Comment ouvrir le dialogue avec quelqu\'un au sujet de l\'intimidation ?',                           es: '¿Cómo me abro a alguien sobre el acoso escolar?' },
  { wid: '660c5ac925e29e84014d9429', audience: 'kid',      slug: 'how-do-i-stop-bullying-others',                                                   en: 'How do I stop bullying others?',                                                          fr: 'Comment puis-je arrêter d\'intimider les autres ?',                                                  es: '¿Cómo dejo de acosar a otros?' },
  { wid: '660c5ac99a2cc136baae9dd9', audience: 'kid',      slug: 'how-do-i-deal-with-friends-who-are-bullying-me',                                  en: 'How do I deal with friends who are bullying me?',                                         fr: 'Comment gérer des amis qui m\'intimident ?',                                                         es: '¿Cómo trato con amigos que me están acosando?' },
  { wid: '660c5ac9ce35ab84218b316b', audience: 'kid',      slug: 'im-being-bullied-at-school-what-can-i-do',                                        en: 'I\'m being bullied at school. What can I do?',                                            fr: 'Je suis intimidé(e) à l\'école. Que puis-je faire ?',                                                es: 'Estoy siendo acosado en la escuela. ¿Qué puedo hacer?' },
  { wid: '660c5ac80aa2734474adec17', audience: 'kid',      slug: 'how-can-i-take-action-when-my-friend-is-being-bullied',                           en: 'How can I take action when my friend is being bullied?',                                  fr: 'Comment puis-je agir lorsque mon ami(e) est intimidé(e) ?',                                          es: '¿Cómo puedo actuar cuando mi amigo está siendo acosado?' },
  { wid: '660c5ac815d142678b70c043', audience: 'kid',      slug: 'how-can-i-recognize-bullying',                                                    en: 'How can I recognize bullying?',                                                           fr: 'Qu\'est-ce qui est considéré comme de l\'intimidation ?',                                            es: '¿Qué se considera acoso escolar?' },
  { wid: '6617d0a970d797b9dd824b40', audience: 'kid',      slug: 'c-get-inspired',                                                                  en: 'Get inspired!',                                                                           fr: 'Laissez-vous inspirer ?',                                                                            es: '¡Inspírate!' },

  // ── Teenager (11 — 8 drafts, imported anyway) ───────────────────────────────
  { wid: '660c5acadc2827bbc80166f4', audience: 'teenager', slug: 'what-are-the-long-term-effects-of-being-bullied-366ff',                           en: 'What are the long-term effects of being bullied?',                                        fr: 'Quels sont les effets à long terme de l\'intimidation ?',                                            es: '¿Cuáles son los efectos a largo plazo de ser acosado?' },
  { wid: '660c5ac97b399707dd3c310f', audience: 'teenager', slug: 'why-do-bullies-exist-89f9a',                                                      en: 'Why do bullies exist?',                                                                   fr: 'Pourquoi les intimidateurs existent-ils ?',                                                          es: '¿Por qué existen los acosadores?' },
  { wid: '660c5ac91878e41540f1e1fc', audience: 'teenager', slug: 'how-can-i-recognize-bullying-a290b',                                              en: 'How can I recognize bullying?',                                                           fr: 'Comment reconnaître le harcèlement ?',                                                               es: '¿Cómo puedo reconocer el acoso?' },
  { wid: '6617d0bd9ee84e596d944b8d', audience: 'teenager', slug: 'e-get-inspired',                                                                  en: 'Get inspired!',                                                                           fr: 'Laissez-vous inspirer ?',                                                                            es: '¡Inspírate!' },
  { wid: '660c5acac1af3dedd12dc02c', audience: 'teenager', slug: 'my-friends-are-bullying-another-student-15b1a',                                   en: 'My friends are bullying another student and want me to join in. What should I do?',       fr: 'Mes amis intimident un autre élève et veulent que je me joigne à eux. Que devrais-je faire ?',       es: 'Mis amigos están acosando a otro estudiante y quieren que me una a ellos. ¿Qué debería hacer?' },
  { wid: '660c5aca8c6cc996f08db479', audience: 'teenager', slug: 'how-can-i-overcome-cyberbullying-c7fe8',                                          en: 'How can I overcome cyberbullying?',                                                       fr: 'Comment surmonter le cyberharcèlement ?',                                                            es: '¿Cómo puedo superar el ciberacoso?' },
  { wid: '660c5aca8a5439927f1bbb27', audience: 'teenager', slug: 'my-friends-wont-talk-to-me-anymore-1c2d5',                                        en: 'My friends won\'t talk to me anymore. What can I do?',                                    fr: 'Mes amis ne veulent plus me parler. Que puis-je faire ?',                                            es: 'Mis amigos ya no quieren hablar conmigo. ¿Qué puedo hacer?' },
  { wid: '660c5aca706c8c704cfaf005', audience: 'teenager', slug: 'what-do-i-do-when-i-witness-racism-26b87',                                        en: 'What do I do when I witness racism?',                                                     fr: 'Que faire lorsque je suis témoin de racisme ?',                                                      es: '¿Qué hago cuando soy testigo de racismo?' },
  { wid: '660c5acaa0409d9886cd6ef6', audience: 'teenager', slug: 'how-do-i-stop-bullying-others-f4933',                                             en: 'How do I stop bullying others?',                                                          fr: 'Comment puis-je arrêter d\'intimider les autres ?',                                                  es: '¿Cómo dejo de acosar a otros?' },
  { wid: '660c5acaf4b0828e89983bac', audience: 'teenager', slug: 'how-do-i-open-up-to-someone-about-bullying-39e35',                                en: 'How do I open up to someone about bullying?',                                             fr: 'Comment ouvrir le dialogue avec quelqu\'un au sujet de l\'intimidation ?',                           es: '¿Cómo me abro a alguien sobre el acoso escolar?' },
  { wid: '660c5ac90aa2734474adef63', audience: 'teenager', slug: 'how-do-i-deal-with-friends-who-are-bullying-me-1dd42',                            en: 'How do I deal with friends who are bullying me?',                                         fr: 'Comment gérer des amis qui m\'intimident ?',                                                         es: '¿Cómo trato con amigos que me están acosando?' },
  { wid: '660c5ac914250a416fca437b', audience: 'teenager', slug: 'how-can-i-take-action-when-my-friend-is-being-bullied-7698d',                     en: 'How can I take action when my friend is being bullied?',                                  fr: 'Comment puis-je agir lorsque mon ami(e) est intimidé(e) ?',                                          es: '¿Cómo puedo actuar cuando mi amigo está siendo acosado?' },
  { wid: '660c5ac906640360f86ce8d5', audience: 'teenager', slug: 'im-being-bullied-at-school-what-can-i-do-6e514',                                  en: 'I\'m being bullied at school. What can I do?',                                            fr: 'Je suis intimidé(e) à l\'école. Que puis-je faire ?',                                                es: 'Estoy siendo acosado en la escuela. ¿Qué puedo hacer?' },
];

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

  map.categories = map.categories || {};

  // Deduplicate: skip any wid already seeded in a previous run
  const toSeed = CATEGORIES.filter(c => !map.categories[c.wid]);

  console.log(`Seeding ${toSeed.length} categories (${CATEGORIES.length - toSeed.length} already in map)…\n`);

  for (const c of toSeed) {
    process.stdout.write(`→ [${c.audience ?? 'no-type'}] ${c.en.slice(0, 60)} … `);

    // 1. Create EN entry (default locale), or recover if already exists
    let id, documentId;
    try {
      const { data: en } = await api('POST', '/api/categories', {
        data: {
          name: c.en,
          slug: c.slug,
          ...(c.audience ? { audience: c.audience } : {}),
        },
      });
      ({ id, documentId } = en);
    } catch (err) {
      if (!err.message.includes('must be unique')) throw err;
      // Slug already exists (created in a previous partial run) — fetch it
      const { data } = await api('GET', `/api/categories?filters[slug][$eq]=${encodeURIComponent(c.slug)}&locale=en`);
      if (!data || data.length === 0) throw new Error(`Slug collision but could not find existing entry for slug: ${c.slug}`);
      ({ id, documentId } = data[0]);
      process.stdout.write('(recovered) ');
    }

    // 2. FR localization
    await api('PUT', `/api/categories/${documentId}?locale=fr`, {
      data: { name: c.fr, slug: c.slug },
    });

    // 3. ES localization
    await api('PUT', `/api/categories/${documentId}?locale=es`, {
      data: { name: c.es, slug: c.slug },
    });

    map.categories[c.wid] = { id, documentId, name: c.en };
    console.log(`id=${id}, documentId=${documentId}`);

    // Persist after each item so partial runs are resumable
    fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
  }

  console.log(`\nDone. Mapping saved → ${MAP_FILE}`);
}

main().catch(err => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
