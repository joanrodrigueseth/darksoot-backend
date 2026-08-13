import type { CharacterProfile, Contact } from './types';

type ProfileSeed = Omit<CharacterProfile, 'unlocked'>;

const PROFILE_SEEDS: ProfileSeed[] = [
  {
    id: 'lowe',
    name: 'Lowe',
    displayName: 'Lowe Moss',
    status: 'Online agora',
    phone: '+55 78-097',
    pronouns: 'He / Him',
    zodiac: 'Escorpião',
    zodiacSymbol: '♏',
    bio: 'Irmão da Ruby. Se você sabe de alguma coisa… me fala.',
    link: 'findruby.local',
    avatarKey: 'lowe',
    bannerKey: 'lowe_banner',
    mediaKeys: [
      'lowe_media_01',
      'lowe_media_02',
      'lowe_media_03',
      'lowe_media_04',
      'lowe_media_05',
      'lowe_media_06',
      'ruby_notebook',
    ],
  },
  {
    id: 'luke',
    name: 'Luke',
    displayName: 'Luke Hart',
    status: 'Offline',
    phone: '+55 21-520',
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
    phone: '+55 09-764',
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
    name: 'Scarlett',
    displayName: 'Scarlett Vale',
    status: 'Offline',
    phone: '+55 89-155',
    pronouns: 'They / Them',
    zodiac: 'Capricórnio',
    zodiacSymbol: '♑',
    bio: 'Perfil bloqueado por enquanto.',
    link: '',
    avatarKey: 'scar',
    bannerKey: 'scar_banner',
    mediaKeys: [],
  },
  {
    id: 'ruby',
    name: 'Ruby',
    displayName: 'Ruby Moss',
    status: 'Desaparecida',
    phone: '+55 44-319',
    pronouns: 'She / Her',
    zodiac: 'Peixes',
    zodiacSymbol: '♓',
    bio: 'Desaparecida. Último contato: o caderno e o pendrive.',
    link: '',
    avatarKey: 'ruby',
    bannerKey: 'ruby_banner',
    mediaKeys: [],
  },
];

export const CONTACTS: Contact[] = PROFILE_SEEDS.map((p) => ({
  id: p.id,
  name: p.name,
  status: p.status,
  avatarKey: p.avatarKey,
  phone: p.phone,
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
