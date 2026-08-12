import type { CharacterProfile, Contact } from './types';

type ProfileSeed = Omit<CharacterProfile, 'unlocked'>;

const PROFILE_SEEDS: ProfileSeed[] = [
  {
    id: 'lowe',
    name: 'Lowe',
    displayName: 'Lowe Moss',
    status: 'Ativo agora',
    phone: '+55 11 986 553',
    pronouns: 'He / Him',
    zodiac: 'Escorpião',
    zodiacSymbol: '♏',
    bio: 'Irmão da Ruby. Se você sabe de alguma coisa… me fala.',
    link: 'findruby.local',
    avatarKey: 'lowe',
    bannerKey: 'lowe_banner',
    mediaKeys: ['ruby_notebook', 'placeholder_1', 'placeholder_2'],
  },
  {
    id: 'luke',
    name: 'Luke',
    displayName: 'Luke Hart',
    status: 'Offline',
    phone: '+55 21 700 114',
    pronouns: 'He / Him',
    zodiac: 'Áries',
    zodiacSymbol: '♈',
    bio: 'Perfil bloqueado por enquanto.',
    link: '',
    avatarKey: 'luke',
    bannerKey: 'luke_banner',
    mediaKeys: [],
  },
  {
    id: 'olivia',
    name: 'Olivia',
    displayName: 'Olivia Reyes',
    status: 'Offline',
    phone: '+55 31 442 908',
    pronouns: 'She / Her',
    zodiac: 'Libra',
    zodiacSymbol: '♎',
    bio: 'Perfil bloqueado por enquanto.',
    link: '',
    avatarKey: 'olivia',
    bannerKey: 'olivia_banner',
    mediaKeys: [],
  },
  {
    id: 'scar',
    name: 'Scar',
    displayName: 'Scar Vale',
    status: 'Offline',
    phone: '+55 41 119 220',
    pronouns: 'They / Them',
    zodiac: 'Capricórnio',
    zodiacSymbol: '♑',
    bio: 'Perfil bloqueado por enquanto.',
    link: '',
    avatarKey: 'scar',
    bannerKey: 'scar_banner',
    mediaKeys: [],
  },
];

export const CONTACTS: Contact[] = PROFILE_SEEDS.map((p) => ({
  id: p.id,
  name: p.name,
  status: p.status,
  avatarKey: p.avatarKey,
  unlocked: p.id === 'lowe',
}));

export function getProfileSeed(contactId: string): ProfileSeed | undefined {
  return PROFILE_SEEDS.find((p) => p.id === contactId);
}

export function buildCharacterProfile(
  contactId: string,
  unlocked: boolean,
): CharacterProfile | null {
  const seed = getProfileSeed(contactId);
  if (!seed) return null;
  return { ...seed, unlocked };
}
