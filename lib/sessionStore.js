// In-memory session store with automatic cleanup for inactive sessions
const sessions = new Map();
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

function touch(sessionId) {
  const session = sessions.get(sessionId);
  if (session) {
    session.lastActive = Date.now();
  }
}

function createSession(sessionId, data) {
  sessions.set(sessionId, {
    ...data,
    lastActive: Date.now(),
  });
}

function getSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  touch(sessionId);
  return session;
}

function updateSession(sessionId, updates) {
  const session = sessions.get(sessionId);
  if (!session) return false;
  Object.assign(session, updates, { lastActive: Date.now() });
  return true;
}

function deleteSession(sessionId) {
  return sessions.delete(sessionId);
}

// Cleanup expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActive > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}, 5 * 60 * 1000);

export { createSession, getSession, updateSession, deleteSession };
