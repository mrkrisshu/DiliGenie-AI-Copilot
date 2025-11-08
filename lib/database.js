/**
 * Database utilities for conversation history
 * Uses JSON file-based storage (no compilation needed)
 */

const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// In-memory storage with JSON persistence
let db = {
  conversations: [],
  messages: [],
  documents: [],
};

const DB_FILE = "./data/jarvis-db.json";

/**
 * Save database to file
 */
function saveDatabase() {
  try {
    const dbDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Error saving database:", err);
  }
}

/**
 * Initialize database (load from file if exists)
 */
function initDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf8");
      db = JSON.parse(data);
    } catch (err) {
      console.error("Error loading database:", err);
    }
  }
  return db;
}

/**
 * Create a new conversation
 */
function createConversation(title = "New Conversation") {
  initDatabase();

  const conversation = {
    id: uuidv4(),
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.conversations.push(conversation);
  saveDatabase();

  return conversation;
}

/**
 * Add message to conversation
 */
function addMessage(conversationId, role, content, metadata = {}) {
  initDatabase();

  const message = {
    id: uuidv4(),
    conversation_id: conversationId,
    role,
    content,
    created_at: new Date().toISOString(),
    metadata: JSON.stringify(metadata),
  };

  db.messages.push(message);

  // Update conversation updated_at
  const conversation = db.conversations.find((c) => c.id === conversationId);
  if (conversation) {
    conversation.updated_at = new Date().toISOString();
  }

  saveDatabase();

  return message;
}

/**
 * Get conversation by ID
 */
function getConversation(conversationId) {
  initDatabase();
  return db.conversations.find((c) => c.id === conversationId) || null;
}

/**
 * Get messages for conversation
 */
function getMessages(conversationId, limit = 50) {
  initDatabase();

  return db.messages
    .filter((m) => m.conversation_id === conversationId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-limit)
    .map((m) => ({
      ...m,
      metadata: m.metadata ? JSON.parse(m.metadata) : {},
    }));
}

/**
 * Get all conversations
 */
function getAllConversations(limit = 20) {
  initDatabase();

  return db.conversations
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, limit);
}

/**
 * Delete conversation and its messages
 */
function deleteConversation(conversationId) {
  initDatabase();

  db.conversations = db.conversations.filter((c) => c.id !== conversationId);
  db.messages = db.messages.filter((m) => m.conversation_id !== conversationId);

  saveDatabase();
}

/**
 * Add document record
 */
function addDocument(name, type, size, metadata = {}) {
  initDatabase();

  const document = {
    id: uuidv4(),
    name,
    type,
    size,
    uploaded_at: new Date().toISOString(),
    pinned: false,
    metadata: JSON.stringify(metadata),
  };

  db.documents.push(document);
  saveDatabase();

  return document;
}

/**
 * Get all documents
 */
function getAllDocuments() {
  initDatabase();

  return db.documents
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned - a.pinned;
      return new Date(b.uploaded_at) - new Date(a.uploaded_at);
    })
    .map((d) => ({
      ...d,
      metadata: d.metadata ? JSON.parse(d.metadata) : {},
    }));
}

/**
 * Toggle document pinned status
 */
function toggleDocumentPin(documentId) {
  initDatabase();

  const document = db.documents.find((d) => d.id === documentId);
  if (document) {
    document.pinned = !document.pinned;
    saveDatabase();
    return { ...document, metadata: JSON.parse(document.metadata || "{}") };
  }
  return null;
}

/**
 * Delete document
 */
function deleteDocument(documentId) {
  initDatabase();

  db.documents = db.documents.filter((d) => d.id !== documentId);
  saveDatabase();
}

/**
 * Get document by ID
 */
function getDocument(documentId) {
  initDatabase();

  const document = db.documents.find((d) => d.id === documentId);
  if (document) {
    return { ...document, metadata: JSON.parse(document.metadata || "{}") };
  }
  return null;
}

/**
 * Search conversations by content
 */
function searchConversations(query, limit = 10) {
  initDatabase();

  const lowerQuery = query.toLowerCase();
  const matchingConversations = new Set();

  db.messages.forEach((message) => {
    if (message.content.toLowerCase().includes(lowerQuery)) {
      matchingConversations.add(message.conversation_id);
    }
  });

  return db.conversations
    .filter(
      (c) =>
        c.title.toLowerCase().includes(lowerQuery) ||
        matchingConversations.has(c.id)
    )
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, limit);
}

/**
 * Update conversation title
 */
function updateConversationTitle(conversationId, title) {
  initDatabase();

  const conversation = db.conversations.find((c) => c.id === conversationId);
  if (conversation) {
    conversation.title = title;
    conversation.updated_at = new Date().toISOString();
    saveDatabase();
  }
}

/**
 * Get database stats
 */
function getStats() {
  initDatabase();

  return {
    conversations: db.conversations.length,
    messages: db.messages.length,
    documents: db.documents.length,
    total_size: fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0,
  };
}

module.exports = {
  initDatabase,
  createConversation,
  addMessage,
  getConversation,
  getMessages,
  getAllConversations,
  deleteConversation,
  addDocument,
  getAllDocuments,
  toggleDocumentPin,
  deleteDocument,
  getDocument,
  searchConversations,
  updateConversationTitle,
  getStats,
};
