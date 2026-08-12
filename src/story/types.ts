export type StoryMessage =
  | { from: 'npc'; kind: 'text'; text: string; delayMs?: number }
  | { from: 'npc'; kind: 'image'; assetKey: string; caption?: string; delayMs?: number };

export type StoryChoice = {
  id: string;
  /** Texto mostrado na lista de opções (com A)/B) se quiser) */
  label: string;
  next: string;
  /** Bolhas enviadas pela MC ao escolher (se omitido, usa o label sem A)/B)) */
  replies?: string[];
};

export type StoryAction = {
  setFlag?: string;
  unlockMinigame?: 'pendrive_match3';
};

export type StoryNode = {
  id: string;
  contactId: 'lowe';
  /** Apenas mensagens do NPC — a MC só fala via choices */
  messages: StoryMessage[];
  choices?: StoryChoice[];
  next?: string;
  onEnter?: StoryAction[];
};

export type RenderedMessage = {
  id: string;
  from: 'npc' | 'mc';
  kind: 'text' | 'image';
  text?: string;
  assetKey?: string;
  caption?: string;
  delayMs?: number;
  createdAt: string;
};

export type ChatEvent =
  | { type: 'unlock_minigame'; gameId: 'pendrive_match3' }
  | { type: 'chapter_complete'; chapterId: string }
  | { type: 'set_flag'; flag: string };

export type Contact = {
  id: string;
  name: string;
  status: string;
  avatarKey: string;
  unlocked: boolean;
};

export type CharacterProfile = {
  id: string;
  name: string;
  displayName: string;
  status: string;
  phone: string;
  pronouns: string;
  zodiac: string;
  zodiacSymbol: string;
  bio: string;
  link: string;
  avatarKey: string;
  bannerKey: string;
  mediaKeys: string[];
  unlocked: boolean;
};
