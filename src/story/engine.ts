import { loweChapter1Nodes, chapter1StartNodeId } from './chapter1/lowe';
import { CONTACTS } from './profiles';
import type {
  ChatEvent,
  RenderedMessage,
  StoryChoice,
  StoryMessage,
  StoryNode,
} from './types';

export { CONTACTS };

const nodeMap = new Map<string, StoryNode>(
  loweChapter1Nodes.map((n) => [n.id, n]),
);
export function getNode(nodeId: string): StoryNode | undefined {
  return nodeMap.get(nodeId);
}

export function getStartNodeId(contactId: string): string | null {
  if (contactId === 'lowe') return chapter1StartNodeId;
  return null;
}

export function personalizeText(text: string, displayName: string): string {
  return text
    .replace(/\{\{MC\}\}/gi, displayName)
    .replace(/\bMc\b/g, displayName)
    .replace(/\bMC\b/g, displayName);
}

/** Atualiza menções ao nome do jogador em mensagens já salvas. */
export function rewritePlayerNameInText(
  text: string,
  oldName: string,
  newName: string,
): string {
  if (!text || oldName === newName) return text;
  let out = text;
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (oldName.trim()) {
    out = out.replace(new RegExp(`\\b${escape(oldName.trim())}\\b`, 'g'), newName);
  }
  out = personalizeText(out, newName);
  return out;
}

export function renderMessages(
  messages: StoryMessage[],
  displayName: string,
  idPrefix: string,
): RenderedMessage[] {
  const now = Date.now();
  return messages.map((m, i) => {
    const base = {
      id: `${idPrefix}_${i}`,
      from: 'npc' as const,
      delayMs: m.delayMs,
      createdAt: new Date(now + i).toISOString(),
    };
    if (m.kind === 'image') {
      return {
        ...base,
        kind: 'image' as const,
        assetKey: m.assetKey,
        caption: m.caption,
      };
    }
    return {
      ...base,
      kind: 'text' as const,
      text: personalizeText(m.text, displayName),
    };
  });
}

function renderMcReplies(
  replies: string[],
  displayName: string,
): RenderedMessage[] {
  const now = Date.now();
  return replies.map((text, i) => ({
    id: `mc_${now}_${i}`,
    from: 'mc' as const,
    kind: 'text' as const,
    text: personalizeText(text, displayName),
    createdAt: new Date(now + i).toISOString(),
  }));
}

export function choiceReplies(choice: StoryChoice): string[] {
  if (choice.replies && choice.replies.length > 0) return choice.replies;
  return [choice.label.replace(/^[AB]\)\s*/, '')];
}

export function collectOnEnterEvents(node: StoryNode): ChatEvent[] {
  const events: ChatEvent[] = [];
  for (const action of node.onEnter ?? []) {
    if (action.unlockMinigame) {
      events.push({ type: 'unlock_minigame', gameId: action.unlockMinigame });
    }
    if (action.setFlag === 'chapter1_complete') {
      events.push({ type: 'chapter_complete', chapterId: '1' });
      events.push({ type: 'set_flag', flag: action.setFlag });
    } else if (action.setFlag) {
      events.push({ type: 'set_flag', flag: action.setFlag });
    }
  }
  return events;
}

export type AdvanceResult = {
  newMessages: RenderedMessage[];
  currentNodeId: string;
  pendingChoices: StoryChoice[] | null;
  events: ChatEvent[];
};

/**
 * Entra num nó: aplica onEnter, adiciona mensagens NPC, para em choices
 * ou segue next até wait/choices.
 */
export function playFromNode(
  startNodeId: string,
  displayName: string,
  playerReplies?: string[],
): AdvanceResult {
  const newMessages: RenderedMessage[] = [];
  const events: ChatEvent[] = [];
  let currentNodeId = startNodeId;
  let pendingChoices: StoryChoice[] | null = null;
  let guard = 0;

  if (playerReplies && playerReplies.length > 0) {
    newMessages.push(...renderMcReplies(playerReplies, displayName));
  }

  while (guard++ < 20) {
    const node = getNode(currentNodeId);
    if (!node) break;

    events.push(...collectOnEnterEvents(node));
    newMessages.push(
      ...renderMessages(node.messages, displayName, `${node.id}_${Date.now()}`),
    );

    if (node.choices && node.choices.length > 0) {
      pendingChoices = node.choices;
      break;
    }

    if (node.next) {
      currentNodeId = node.next;
      const next = getNode(currentNodeId);
      if (
        next &&
        next.messages.length === 0 &&
        !next.choices &&
        !next.next
      ) {
        break;
      }
      // nó só com choices (ex.: após decrypt) — entra e para nas choices
      if (
        next &&
        next.messages.length === 0 &&
        next.choices &&
        next.choices.length > 0
      ) {
        events.push(...collectOnEnterEvents(next));
        pendingChoices = next.choices;
        break;
      }
      continue;
    }

    break;
  }

  return { newMessages, currentNodeId, pendingChoices, events };
}

export function findChoice(
  nodeId: string,
  choiceId: string,
): StoryChoice | undefined {
  const node = getNode(nodeId);
  return node?.choices?.find((c) => c.id === choiceId);
}

/** Resolve a escolha a partir do nó atual ou das pendingChoices salvas. */
export function resolveChoice(
  currentNodeId: string | null | undefined,
  choiceId: string,
  pendingChoices?: StoryChoice[] | null,
): StoryChoice | undefined {
  if (currentNodeId) {
    const fromNode = findChoice(currentNodeId, choiceId);
    if (fromNode) return fromNode;
  }
  const fromPending = pendingChoices?.find((c) => c.id === choiceId);
  if (fromPending) return fromPending;
  return undefined;
}

export function liveChoicesForNode(
  nodeId: string | null | undefined,
): StoryChoice[] | null {
  if (!nodeId) return null;
  const node = getNode(nodeId);
  return node?.choices?.length ? node.choices : null;
}
