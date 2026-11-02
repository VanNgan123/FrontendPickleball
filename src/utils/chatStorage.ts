export const AGENT_SESSION_STORAGE_KEY = "pickleball-agent-session-id";
export const AGENT_SESSION_AUTH_STORAGE_KEY = "pickleball-agent-session-auth";
export const CHAT_MESSAGES_STORAGE_KEY = "pickleball-agent-messages";
export const CHAT_OPEN_STORAGE_KEY = "pickleball-agent-open";
export const CHAT_STORAGE_CLEARED_EVENT = "pickleball-agent-chat-cleared";
export const CHAT_OPEN_REQUESTED_EVENT = "pickleball-agent-chat-open-requested";

const getSessionStorage = () => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
};

export const clearAgentChatStorage = () => {
  const storage = getSessionStorage();
  if (!storage) return;

  storage.removeItem(AGENT_SESSION_STORAGE_KEY);
  storage.removeItem(AGENT_SESSION_AUTH_STORAGE_KEY);
  storage.removeItem(CHAT_MESSAGES_STORAGE_KEY);
  storage.removeItem(CHAT_OPEN_STORAGE_KEY);
  window.dispatchEvent(new Event(CHAT_STORAGE_CLEARED_EVENT));
};

export const openAgentChat = () => {
  const storage = getSessionStorage();
  storage?.setItem(CHAT_OPEN_STORAGE_KEY, "true");
  window.dispatchEvent(new Event(CHAT_OPEN_REQUESTED_EVENT));
};
