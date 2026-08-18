import type { StoryNode } from './types';

/**
 * Capítulo 1 — cada mensagem da MC exige toque em Mensagem... + opção.
 * Sem prefixos A/B; o app mostra só o texto da opção.
 */
export const loweChapter1Nodes: StoryNode[] = [
  {
    id: 'lowe_hi',
    contactId: 'lowe',
    messages: [{ from: 'npc', kind: 'text', text: 'Oi Mc' }],
    choices: [
      { id: 'r_oi', label: 'Oi?', replies: ['Oi?'], next: 'lowe_introduces' },
      {
        id: 'r_oi_premium',
        label: 'Lowe? Sou eu. Senti que alguma coisa estava errada.',
        replies: ['Lowe? Sou eu. Senti que alguma coisa estava errada.'],
        next: 'lowe_sensed',
        premium: true,
        priceGems: 15,
      },
    ],
  },
  {
    id: 'lowe_sensed',
    contactId: 'lowe',
    onEnter: [{ setFlag: 'premium_greeting' }],
    messages: [
      { from: 'npc', kind: 'text', text: 'Mc…' },
      { from: 'npc', kind: 'text', text: 'Então você também sentiu.' },
      {
        from: 'npc',
        kind: 'text',
        text: 'Sou eu. O Lowe, irmão da Ruby.',
      },
    ],
    choices: [
      {
        id: 'r_premium_how',
        label: 'Como vocês estão?',
        replies: ['Como vocês estão?'],
        next: 'lowe_asks_ruby',
      },
    ],
  },
  {
    id: 'lowe_introduces',
    contactId: 'lowe',
    messages: [
      { from: 'npc', kind: 'text', text: 'Sou eu, o Lowe, irmão da Ruby' },
    ],
    choices: [
      {
        id: 'r_recognize_1',
        label: 'Ah meu Deus, Lowe?',
        replies: ['Ah meu Deus, Lowe?'],
        next: 'mc_recognize_2',
      },
    ],
  },
  {
    id: 'mc_recognize_2',
    contactId: 'lowe',
    messages: [],
    choices: [
      {
        id: 'r_recognize_2',
        label: 'Desculpa, não consegui te reconhecer pela sua foto',
        replies: ['Desculpa, não consegui te reconhecer pela sua foto'],
        next: 'mc_recognize_3',
      },
    ],
  },
  {
    id: 'mc_recognize_3',
    contactId: 'lowe',
    messages: [],
    choices: [
      {
        id: 'r_recognize_3',
        label: 'Como vocês estão?',
        replies: ['Como vocês estão?'],
        next: 'lowe_asks_ruby',
      },
    ],
  },
  {
    id: 'lowe_asks_ruby',
    contactId: 'lowe',
    messages: [
      { from: 'npc', kind: 'text', text: 'Mc' },
      { from: 'npc', kind: 'text', text: 'Você viu minha irmã recentemente?' },
    ],
    choices: [
      {
        id: 'r_not_seen_1',
        label: 'Não, Lowe, eu não a vi',
        replies: ['Não, Lowe, eu não a vi'],
        next: 'mc_not_seen_2',
      },
    ],
  },
  {
    id: 'mc_not_seen_2',
    contactId: 'lowe',
    messages: [],
    choices: [
      {
        id: 'r_not_seen_2',
        label: 'Eu não a vejo desde que vocês se mudaram',
        replies: ['Eu não a vejo desde que vocês se mudaram'],
        next: 'lowe_sorry',
      },
    ],
  },
  {
    id: 'lowe_sorry',
    contactId: 'lowe',
    messages: [
      { from: 'npc', kind: 'text', text: 'Ah' },
      { from: 'npc', kind: 'text', text: 'Ok' },
      { from: 'npc', kind: 'text', text: 'Desculpe o incômodo' },
    ],
    choices: [
      {
        id: 'r_wait_1',
        label: 'Lowe, espera',
        replies: ['Lowe, espera'],
        next: 'mc_wait_2',
      },
    ],
  },
  {
    id: 'mc_wait_2',
    contactId: 'lowe',
    messages: [],
    choices: [
      {
        id: 'r_wait_2',
        label: 'Aconteceu alguma coisa?',
        replies: ['Aconteceu alguma coisa?'],
        next: 'lowe_missing',
      },
    ],
  },
  {
    id: 'lowe_missing',
    contactId: 'lowe',
    messages: [
      { from: 'npc', kind: 'text', text: 'Mc' },
      { from: 'npc', kind: 'text', text: 'Minha irmã sumiu' },
    ],
    choices: [
      { id: 'r_what', label: 'O quê?', replies: ['O quê?'], next: 'lowe_details' },
    ],
  },
  {
    id: 'lowe_details',
    contactId: 'lowe',
    messages: [
      {
        from: 'npc',
        kind: 'text',
        text: 'Ela não volta pra casa há dois dias. O celular dá direto na caixa postal.',
      },
    ],
    choices: [
      {
        id: 'c1_a',
        label: 'Meu Deus, Lowe... Vocês já falaram com a polícia?',
        replies: ['Meu Deus, Lowe... Vocês já falaram com a polícia?'],
        next: 'lowe_notebook',
      },
      {
        id: 'c1_b',
        label: 'Como assim? Tem certeza de que ela não está na casa de algum amigo?',
        replies: [
          'Como assim? Tem certeza de que ela não está na casa de algum amigo?',
        ],
        next: 'lowe_notebook',
      },
    ],
  },
  {
    id: 'lowe_notebook',
    contactId: 'lowe',
    messages: [
      {
        from: 'npc',
        kind: 'text',
        text: 'A polícia diz que precisa de 48 horas pra tratar como desaparecimento oficial, mas eu CONHEÇO a minha irmã. Ela nunca faria isso.',
      },
      { from: 'npc', kind: 'text', text: 'Na verdade, eu te chamei porque' },
      {
        from: 'npc',
        kind: 'text',
        text: 'Eu estava mexendo nas coisas dela hoje cedo no quarto... tentando achar qualquer pista.',
      },
      {
        from: 'npc',
        kind: 'text',
        text: 'E achei um caderno antigo. Tinha um número anotado com uma estrela do lado. Era o seu.',
      },
      {
        from: 'npc',
        kind: 'image',
        assetKey: 'ruby_notebook',
        caption: 'Caderno da Ruby',
      },
      {
        from: 'npc',
        kind: 'text',
        text: "Do lado do seu número tinha uma frase: 'Se tudo der errado, a MC vai saber o que fazer com a chave.'",
      },
    ],
    choices: [
      {
        id: 'c2_a',
        label: '"A chave"? Do que ela está falando?',
        replies: ['"A chave"? Do que ela está falando?'],
        next: 'lowe_pendrive',
      },
      {
        id: 'c2_b',
        label: 'Lowe, a gente não se fala há anos. Eu não faço ideia do que isso significa.',
        replies: [
          'Lowe, a gente não se fala há anos. Eu não faço ideia do que isso significa.',
        ],
        next: 'lowe_pendrive',
      },
    ],
  },
  {
    id: 'lowe_pendrive',
    contactId: 'lowe',
    messages: [
      { from: 'npc', kind: 'text', text: 'Eu também não fazia ideia' },
      {
        from: 'npc',
        kind: 'text',
        text: 'Até achar um pendrive escondido na capinha do celular antigo dela',
      },
      {
        from: 'npc',
        kind: 'text',
        text: 'Está protegido por uma criptografia que eu nunca vi na vida.',
      },
      {
        from: 'npc',
        kind: 'text',
        text: 'Eu sei que você entende dessas coisas de tecnologia, MC. A Ruby sempre me falava disso quando vocês eram mais novas.',
      },
      {
        from: 'npc',
        kind: 'text',
        text: 'Preciso que você me ajude a abrir esse arquivo. É a única pista que eu tenho.',
      },
      { from: 'npc', kind: 'text', text: 'Por favor.' },
    ],
    choices: [
      {
        id: 'c3_a',
        label: 'Claro Lowe, me envie o arquivo!',
        replies: ['Claro Lowe, me envie o arquivo!'],
        next: 'lowe_send_pendrive',
      },
      {
        id: 'c3_b',
        label: 'Me deixe ver o arquivo',
        replies: ['Me deixe ver o arquivo'],
        next: 'lowe_send_pendrive',
      },
    ],
  },
  {
    id: 'lowe_send_pendrive',
    contactId: 'lowe',
    messages: [
      {
        from: 'npc',
        kind: 'text',
        text: 'Mandando o arquivo agora. Qualquer coisa estranha que aparecer… me avisa.',
      },
      {
        from: 'npc',
        kind: 'text',
        text: '[arquivo] ruby_pendrive.enc',
      },
    ],
    onEnter: [{ unlockMinigame: 'pendrive_match3' }, { setFlag: 'pendrive_received' }],
    next: 'lowe_await_decrypt',
  },
  {
    id: 'lowe_await_decrypt',
    contactId: 'lowe',
    messages: [],
  },
  {
    id: 'lowe_after_decrypt',
    contactId: 'lowe',
    messages: [],
    choices: [
      {
        id: 'r_opened',
        label: 'Consegui abrir o pendrive.',
        replies: ['Consegui abrir o pendrive.'],
        next: 'lowe_react_open',
      },
    ],
  },
  {
    id: 'lowe_react_open',
    contactId: 'lowe',
    messages: [{ from: 'npc', kind: 'text', text: 'Sério?! O que tem aí?' }],
    choices: [
      {
        id: 'r_forum',
        label: 'Uma pasta com prints… e um link pra um fórum. Algo sobre “carvão” e “fumaça”.',
        replies: [
          'Uma pasta com prints… e um link pra um fórum. Algo sobre “carvão” e “fumaça”.',
        ],
        next: 'lowe_chapter1_close',
      },
    ],
  },
  {
    id: 'lowe_chapter1_close',
    contactId: 'lowe',
    messages: [
      {
        from: 'npc',
        kind: 'text',
        text: 'Isso não faz sentido. Ruby nunca falou de fórum nenhum.',
      },
      {
        from: 'npc',
        kind: 'text',
        text: 'Mc… obrigado. Eu te mando o grupo dos amigos dela. Eles precisam te conhecer.',
      },
      {
        from: 'npc',
        kind: 'text',
        text: 'Amanhã. Por hoje… tenta descansar. Eu também vou tentar.',
      },
    ],
    onEnter: [{ setFlag: 'chapter1_complete' }],
    next: 'lowe_chapter1_end',
  },
  {
    id: 'lowe_chapter1_end',
    contactId: 'lowe',
    messages: [],
  },
];

export const chapter1StartNodeId = 'lowe_hi';
