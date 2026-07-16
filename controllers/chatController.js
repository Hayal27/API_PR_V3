const con = require("../models/db");

// =====================================================
// CONVERSATION MANAGEMENT
// =====================================================

/**
 * Get all conversations for a user
 * GET /api/chat/conversations
 */
const getConversations = (req, res) => {
  try {
    const user_id = req.user_id;

    console.log(`📨 Getting conversations for user: ${user_id}`);

    const query = `
      SELECT 
        c.conversation_id,
        c.title,
        c.conversation_type as type,
        c.created_by,
        c.is_archived,
        c.created_at,
        c.updated_at,
        COUNT(DISTINCT cp.user_id) as participant_count,
        (SELECT content FROM messages WHERE conversation_id = c.conversation_id ORDER BY sent_at DESC LIMIT 1) as last_message,
        (SELECT sent_at FROM messages WHERE conversation_id = c.conversation_id ORDER BY sent_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.conversation_id AND sent_at > COALESCE(cp.last_read_at, '1970-01-01')) as unread_count,
        (SELECT GROUP_CONCAT(COALESCE(e.name, u.user_name) SEPARATOR ', ') FROM chat_participants cp2 
         LEFT JOIN users u ON cp2.user_id = u.user_id 
         LEFT JOIN employees e ON u.employee_id = e.employee_id 
         WHERE cp2.conversation_id = c.conversation_id AND cp2.user_id != ?) as participant_names,
        (SELECT COALESCE(u.avatar_url, '') FROM users u 
         LEFT JOIN employees e ON u.employee_id = e.employee_id
         WHERE u.user_id = (SELECT user_id FROM chat_participants WHERE conversation_id = c.conversation_id AND user_id != ? LIMIT 1) LIMIT 1) as avatar_url
      FROM conversations c
      INNER JOIN chat_participants cp ON c.conversation_id = cp.conversation_id
      WHERE cp.user_id = ? AND c.is_archived = 0
      GROUP BY c.conversation_id
      ORDER BY c.updated_at DESC
    `;

    con.query(query, [user_id, user_id, user_id], (err, results) => {
      if (err) {
        console.error("❌ Error fetching conversations:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching conversations",
          error: err.message
        });
      }

      console.log(`✅ Retrieved ${results.length} conversations`);
      return res.status(200).json({
        success: true,
        data: results,
        count: results.length
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Create a new conversation
 * POST /api/chat/conversations
 */
const createConversation = (req, res) => {
  try {
    const user_id = req.user_id;
    const { title, conversation_type, participant_ids } = req.body;

    if (!title || !conversation_type) {
      return res.status(400).json({
        success: false,
        message: "Title and conversation type are required"
      });
    }

    console.log(`🆕 Creating conversation: ${title} (${conversation_type})`);

    const conversationQuery = `
      INSERT INTO conversations (title, conversation_type, created_by)
      VALUES (?, ?, ?)
    `;

    con.query(conversationQuery, [title, conversation_type, user_id], (err, result) => {
      if (err) {
        console.error("❌ Error creating conversation:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error creating conversation",
          error: err.message
        });
      }

      const conversation_id = result.insertId;
      console.log(`✅ Conversation created with ID: ${conversation_id}`);

      // Add participants
      const participants = [user_id, ...(participant_ids || [])];
      const uniqueParticipants = [...new Set(participants)];

      const participantQuery = `
        INSERT INTO chat_participants (conversation_id, user_id, is_admin)
        VALUES (?, ?, ?)
      `;

      let participantsAdded = 0;
      uniqueParticipants.forEach((pid, index) => {
        const isAdmin = pid === user_id ? 1 : 0;
        con.query(participantQuery, [conversation_id, pid, isAdmin], (err) => {
          if (err) {
            console.error("❌ Error adding participant:", err.message);
          } else {
            participantsAdded++;
            if (participantsAdded === uniqueParticipants.length) {
              console.log(`✅ Added ${participantsAdded} participants`);
              return res.status(201).json({
                success: true,
                message: "Conversation created successfully",
                data: {
                  conversation_id,
                  title,
                  conversation_type,
                  participant_count: uniqueParticipants.length
                }
              });
            }
          }
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Get conversation details with participants
 * GET /api/chat/conversations/:conversationId
 */
const getConversationDetails = (req, res) => {
  try {
    const { conversationId } = req.params;
    const user_id = req.user_id;

    console.log(`📋 Getting details for conversation: ${conversationId}`);

    const query = `
      SELECT 
        c.*,
        COUNT(DISTINCT cp.user_id) as participant_count
      FROM conversations c
      LEFT JOIN chat_participants cp ON c.conversation_id = cp.conversation_id
      WHERE c.conversation_id = ?
      GROUP BY c.conversation_id
    `;

    con.query(query, [conversationId], (err, results) => {
      if (err) {
        console.error("❌ Error fetching conversation:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching conversation",
          error: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found"
        });
      }

      const conversation = results[0];

      // Get participants
      const participantsQuery = `
        SELECT 
          cp.participant_id,
          cp.user_id,
          cp.joined_at,
          cp.is_admin,
          cp.is_muted,
          e.name,
          e.email
        FROM chat_participants cp
        LEFT JOIN employees e ON cp.user_id = e.employee_id
        WHERE cp.conversation_id = ?
      `;

      con.query(participantsQuery, [conversationId], (err, participants) => {
        if (err) {
          console.error("❌ Error fetching participants:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error fetching participants",
            error: err.message
          });
        }

        console.log(`✅ Retrieved conversation with ${participants.length} participants`);
        return res.status(200).json({
          success: true,
          data: {
            ...conversation,
            participants
          }
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

// =====================================================
// MESSAGE MANAGEMENT
// =====================================================

/**
 * Get messages for a conversation
 * GET /api/chat/conversations/:conversationId/messages
 */
const getMessages = (req, res) => {
  try {
    const { conversationId } = req.params;
    const user_id = req.user_id;
    const { limit = 50, offset = 0 } = req.query;

    console.log(`💬 Getting messages for conversation: ${conversationId}`);

    const query = `
      SELECT 
        m.*,
        COALESCE(e.name, u.user_name) as sender_name,
        e.email as sender_email,
        u.avatar_url as sender_avatar,
        (SELECT COUNT(*) FROM message_reactions WHERE message_id = m.message_id) as reaction_count
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE m.conversation_id = ? AND m.is_deleted = 0
      ORDER BY m.sent_at DESC
      LIMIT ? OFFSET ?
    `;

    con.query(query, [conversationId, parseInt(limit), parseInt(offset)], (err, messages) => {
      if (err) {
        console.error("❌ Error fetching messages:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching messages",
          error: err.message
        });
      }

      // Mark messages as read
      const readQuery = `
        INSERT INTO message_read_receipts (message_id, user_id)
        SELECT m.message_id, ?
        FROM messages m
        WHERE m.conversation_id = ? AND m.sender_id != ? AND m.message_id NOT IN (
          SELECT message_id FROM message_read_receipts WHERE user_id = ?
        )
        ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP
      `;

      con.query(readQuery, [user_id, conversationId, user_id, user_id], (err) => {
        if (err) {
          console.error("⚠️  Error marking messages as read:", err.message);
        }

        // Update last read time
        const updateLastReadQuery = `
          UPDATE chat_participants
          SET last_read_at = CURRENT_TIMESTAMP
          WHERE conversation_id = ? AND user_id = ?
        `;

        con.query(updateLastReadQuery, [conversationId, user_id], (err) => {
          if (err) {
            console.error("⚠️  Error updating last read time:", err.message);
          }

          console.log(`✅ Retrieved ${messages.length} messages`);
          return res.status(200).json({
            success: true,
            data: messages.reverse(),
            count: messages.length
          });
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Send a message
 * POST /api/chat/conversations/:conversationId/messages
 */
const sendMessage = (req, res) => {
  try {
    const { conversationId } = req.params;
    const user_id = req.user_id;
    const { content, message_type = 'text', file_path = null, file_name = null, metadata = null } = req.body;

    if (!content && message_type === 'text') {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }

    console.log(`✉️  Sending message to conversation: ${conversationId}, type: ${message_type}`);

    const query = `
      INSERT INTO messages (conversation_id, sender_id, content, message_type, file_path, file_name, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    con.query(query, [conversationId, user_id, content, message_type, file_path, file_name, metadata], (err, result) => {
      if (err) {
        console.error("❌ Error sending message:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error sending message",
          error: err.message
        });
      }

      const message_id = result.insertId;

      // Update conversation updated_at
      const updateConvQuery = `
        UPDATE conversations
        SET updated_at = CURRENT_TIMESTAMP
        WHERE conversation_id = ?
      `;

      con.query(updateConvQuery, [conversationId], (err) => {
        if (err) {
          console.error("⚠️  Error updating conversation:", err.message);
        }

        console.log(`✅ Message sent with ID: ${message_id}`);
        return res.status(201).json({
          success: true,
          message: "Message sent successfully",
          data: {
            message_id,
            conversation_id: conversationId,
            sender_id: user_id,
            content,
            message_type,
            metadata,
            sent_at: new Date()
          }
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Edit a message
 * PUT /api/chat/messages/:messageId
 */
const editMessage = (req, res) => {
  try {
    const { messageId } = req.params;
    const user_id = req.user_id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }

    console.log(`✏️  Editing message: ${messageId}`);

    const query = `
      UPDATE messages
      SET content = ?, is_edited = 1, edited_at = CURRENT_TIMESTAMP
      WHERE message_id = ? AND sender_id = ?
    `;

    con.query(query, [content, messageId, user_id], (err, result) => {
      if (err) {
        console.error("❌ Error editing message:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error editing message",
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized or message not found"
        });
      }

      console.log(`✅ Message edited successfully`);
      return res.status(200).json({
        success: true,
        message: "Message edited successfully"
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Delete a message
 * DELETE /api/chat/messages/:messageId
 */
const deleteMessage = (req, res) => {
  try {
    const { messageId } = req.params;
    const user_id = req.user_id;

    console.log(`🗑️  Deleting message: ${messageId}`);

    const query = `
      UPDATE messages
      SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP
      WHERE message_id = ? AND sender_id = ?
    `;

    con.query(query, [messageId, user_id], (err, result) => {
      if (err) {
        console.error("❌ Error deleting message:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error deleting message",
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized or message not found"
        });
      }

      console.log(`✅ Message deleted successfully`);
      return res.status(200).json({
        success: true,
        message: "Message deleted successfully"
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

// =====================================================
// DIRECT MESSAGE HELPERS
// =====================================================

/**
 * Get or create a direct message conversation
 * POST /api/chat/direct-message
 */
const getOrCreateDirectMessage = (req, res) => {
  try {
    const user_id = req.user_id;
    const { recipient_id } = req.body;

    if (!recipient_id) {
      return res.status(400).json({
        success: false,
        message: "Recipient ID is required"
      });
    }

    console.log(`💌 Getting/creating DM between ${user_id} and ${recipient_id}`);

    // Check if conversation exists
    const checkQuery = `
      SELECT c.conversation_id
      FROM conversations c
      INNER JOIN chat_participants cp1 ON c.conversation_id = cp1.conversation_id AND cp1.user_id = ?
      INNER JOIN chat_participants cp2 ON c.conversation_id = cp2.conversation_id AND cp2.user_id = ?
      WHERE c.conversation_type = 'direct'
      LIMIT 1
    `;

    con.query(checkQuery, [user_id, recipient_id], (err, results) => {
      if (err) {
        console.error("❌ Error checking conversation:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error checking conversation",
          error: err.message
        });
      }

      if (results.length > 0) {
        console.log(`✅ Found existing DM conversation: ${results[0].conversation_id}`);
        return res.status(200).json({
          success: true,
          data: { conversation_id: results[0].conversation_id }
        });
      }

      // Create new conversation
      const createQuery = `
        INSERT INTO conversations (title, conversation_type, created_by)
        VALUES (?, 'direct', ?)
      `;

      con.query(createQuery, [`DM_${user_id}_${recipient_id}`, user_id], (err, result) => {
        if (err) {
          console.error("❌ Error creating conversation:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error creating conversation",
            error: err.message
          });
        }

        const conversation_id = result.insertId;

        // Add participants
        const participantQuery = `
          INSERT INTO chat_participants (conversation_id, user_id, is_admin)
          VALUES (?, ?, ?)
        `;

        con.query(participantQuery, [conversation_id, user_id, 1], (err) => {
          if (err) {
            console.error("❌ Error adding participant 1:", err.message);
            return res.status(500).json({
              success: false,
              message: "Error creating conversation",
              error: err.message
            });
          }

          con.query(participantQuery, [conversation_id, recipient_id, 0], (err) => {
            if (err) {
              console.error("❌ Error adding participant 2:", err.message);
              return res.status(500).json({
                success: false,
                message: "Error creating conversation",
                error: err.message
              });
            }

            console.log(`✅ Created new DM conversation: ${conversation_id}`);
            return res.status(201).json({
              success: true,
              data: { conversation_id }
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

// =====================================================
// PRESENCE & STATUS MANAGEMENT
// =====================================================

/**
 * Get active users
 * GET /api/chat/active-users
 */
const getActiveUsers = (req, res) => {
  try {
    const user_id = req.user_id;

    console.log(`👥 Getting active users for user: ${user_id}`);

    // Query users table with employees info
    const query = `
      SELECT 
        u.user_id,
        COALESCE(e.name, u.user_name) as name,
        COALESCE(e.email, '') as email,
        COALESCE(u.avatar_url, '') as profile_picture,
        COALESCE(up.status, 'offline') as status,
        COALESCE(up.is_online, 0) as is_online,
        COALESCE(up.last_seen, NOW()) as last_seen,
        0 as has_conversation
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN user_presence up ON u.user_id = up.user_id
      WHERE u.user_id != ?
      ORDER BY COALESCE(up.is_online, 0) DESC, COALESCE(up.last_seen, NOW()) DESC
      LIMIT 100
    `;

    con.query(query, [user_id], (err, results) => {
      if (err) {
        console.error("❌ Error fetching active users:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching active users",
          error: err.message
        });
      }

      console.log(`✅ Retrieved ${results.length} active users`);
      return res.status(200).json({
        success: true,
        data: results,
        count: results.length
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Get all users (not just active)
 * GET /api/chat/all-users
 */
const getAllUsers = (req, res) => {
  try {
    const user_id = req.user_id;

    console.log(`👥 Getting all users for user: ${user_id}`);

    // Query users table with employees info
    const query = `
      SELECT 
        u.user_id,
        COALESCE(e.name, u.user_name) as name,
        COALESCE(e.email, '') as email,
        COALESCE(u.avatar_url, '') as profile_picture,
        COALESCE(up.status, 'offline') as status,
        COALESCE(up.is_online, 0) as is_online,
        COALESCE(up.last_seen, NOW()) as last_seen,
        0 as has_conversation
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN user_presence up ON u.user_id = up.user_id
      WHERE u.user_id != ?
      ORDER BY COALESCE(up.is_online, 0) DESC, COALESCE(e.name, u.user_name) ASC
      LIMIT 200
    `;

    con.query(query, [user_id], (err, results) => {
      if (err) {
        console.error("❌ Error fetching all users:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching users",
          error: err.message
        });
      }

      console.log(`✅ Retrieved ${results.length} users`);
      return res.status(200).json({
        success: true,
        data: results,
        count: results.length
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Update user presence/status
 * PUT /api/chat/presence
 */
const updatePresence = (req, res) => {
  try {
    const user_id = req.user_id;
    const { status = 'online' } = req.body;

    console.log(`🟢 Updating presence for user ${user_id}: ${status}`);

    const query = `
      INSERT INTO user_presence (user_id, is_online, status)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        is_online = VALUES(is_online),
        status = VALUES(status),
        last_seen = CURRENT_TIMESTAMP
    `;

    const is_online = status !== 'offline' ? 1 : 0;
    con.query(query, [user_id, is_online, status], (err) => {
      if (err) {
        console.error("❌ Error updating presence:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error updating presence",
          error: err.message
        });
      }

      console.log(`✅ Presence updated`);
      return res.status(200).json({
        success: true,
        message: "Presence updated successfully"
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

// =====================================================
// USER SEARCH
// =====================================================

/**
 * Search users
 * GET /api/chat/search-users?q=query
 */
const searchUsers = (req, res) => {
  try {
    const user_id = req.user_id;
    const { q = '' } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters"
      });
    }

    console.log(`🔍 Searching users: ${q}`);

    const query = `
      SELECT 
        u.user_id,
        COALESCE(e.name, u.user_name) as name,
        COALESCE(e.email, '') as email,
        COALESCE(u.avatar_url, '') as profile_picture,
        COALESCE(e.department_id, 0) as department_id,
        up.status,
        up.is_online,
        (SELECT COUNT(*) FROM conversations c 
         INNER JOIN chat_participants cp1 ON c.conversation_id = cp1.conversation_id 
         INNER JOIN chat_participants cp2 ON c.conversation_id = cp2.conversation_id 
         WHERE cp1.user_id = ? AND cp2.user_id = u.user_id AND c.conversation_type = 'direct') as has_conversation
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN user_presence up ON u.user_id = up.user_id
      WHERE (COALESCE(e.name, u.user_name) LIKE ? OR COALESCE(e.email, '') LIKE ?) AND u.user_id != ?
      LIMIT 20
    `;

    const searchTerm = `%${q}%`;
    con.query(query, [user_id, searchTerm, searchTerm, user_id], (err, results) => {
      if (err) {
        console.error("❌ Error searching users:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error searching users",
          error: err.message
        });
      }

      console.log(`✅ Found ${results.length} users`);
      return res.status(200).json({
        success: true,
        data: results,
        count: results.length
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

// =====================================================
// MESSAGE ATTACHMENTS
// =====================================================

/**
 * Add message attachment
 * POST /api/chat/messages/:messageId/attachments
 */
const addAttachment = (req, res) => {
  try {
    const { messageId } = req.params;
    const { file_name, file_path, file_type, file_size } = req.body;
    const user_id = req.user_id;

    if (!file_name || !file_path) {
      return res.status(400).json({
        success: false,
        message: "File name and path are required"
      });
    }

    console.log(`📎 Adding attachment to message ${messageId}`);

    const query = `
      INSERT INTO message_attachments (message_id, file_name, file_path, file_type, file_size, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    con.query(query, [messageId, file_name, file_path, file_type, file_size, user_id], (err, result) => {
      if (err) {
        console.error("❌ Error adding attachment:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error adding attachment",
          error: err.message
        });
      }

      console.log(`✅ Attachment added with ID: ${result.insertId}`);
      return res.status(201).json({
        success: true,
        message: "Attachment added successfully",
        data: { attachment_id: result.insertId }
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

// =====================================================
// MESSAGE MENTIONS & TAGGING
// =====================================================

/**
 * Add mention to message
 * POST /api/chat/messages/:messageId/mentions
 */
const addMention = (req, res) => {
  try {
    const { messageId } = req.params;
    const { mentioned_user_id } = req.body;

    if (!mentioned_user_id) {
      return res.status(400).json({
        success: false,
        message: "Mentioned user ID is required"
      });
    }

    console.log(`@️ Adding mention to message ${messageId}`);

    const query = `
      INSERT INTO message_mentions (message_id, mentioned_user_id)
      VALUES (?, ?)
    `;

    con.query(query, [messageId, mentioned_user_id], (err, result) => {
      if (err) {
        console.error("❌ Error adding mention:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error adding mention",
          error: err.message
        });
      }

      console.log(`✅ Mention added`);
      return res.status(201).json({
        success: true,
        message: "Mention added successfully"
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

// =====================================================
// MESSAGE FORWARDING
// =====================================================

/**
 * Forward message
 * POST /api/chat/messages/:messageId/forward
 */
const forwardMessage = (req, res) => {
  try {
    const { messageId } = req.params;
    const { target_conversation_id } = req.body;
    const user_id = req.user_id;

    if (!target_conversation_id) {
      return res.status(400).json({
        success: false,
        message: "Target conversation ID is required"
      });
    }

    console.log(`➡️  Forwarding message ${messageId} to conversation ${target_conversation_id}`);

    // Get original message
    const getMessageQuery = `SELECT * FROM messages WHERE message_id = ?`;

    con.query(getMessageQuery, [messageId], (err, messages) => {
      if (err || messages.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Message not found"
        });
      }

      const originalMessage = messages[0];

      // Create forwarded message
      const createMessageQuery = `
        INSERT INTO messages (conversation_id, sender_id, content, message_type, file_path, file_name)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      con.query(createMessageQuery, [
        target_conversation_id,
        user_id,
        `[Forwarded] ${originalMessage.content}`,
        originalMessage.message_type,
        originalMessage.file_path,
        originalMessage.file_name
      ], (err, result) => {
        if (err) {
          console.error("❌ Error forwarding message:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error forwarding message",
            error: err.message
          });
        }

        const forwarded_message_id = result.insertId;

        // Track forwarding
        const trackForwardQuery = `
          INSERT INTO forwarded_messages (original_message_id, forwarded_message_id, forwarded_by)
          VALUES (?, ?, ?)
        `;

        con.query(trackForwardQuery, [messageId, forwarded_message_id, user_id], (err) => {
          if (err) {
            console.error("⚠️  Error tracking forward:", err.message);
          }

          console.log(`✅ Message forwarded with ID: ${forwarded_message_id}`);
          return res.status(201).json({
            success: true,
            message: "Message forwarded successfully",
            data: { forwarded_message_id }
          });
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

// =====================================================
// ORGANIZATION GROUP CHATS
// =====================================================

/**
 * Create organization group chat
 * POST /api/chat/organization-groups
 */
const createOrganizationGroup = (req, res) => {
  try {
    const user_id = req.user_id;
    const { group_name, group_description, organization_id, department_id, participant_ids = [] } = req.body;

    if (!group_name) {
      return res.status(400).json({
        success: false,
        message: "Group name is required"
      });
    }

    console.log(`🏢 Creating organization group: ${group_name}`);

    // Create conversation
    const conversationQuery = `
      INSERT INTO conversations (title, conversation_type, created_by)
      VALUES (?, 'group', ?)
    `;

    con.query(conversationQuery, [group_name, user_id], (err, result) => {
      if (err) {
        console.error("❌ Error creating conversation:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error creating conversation",
          error: err.message
        });
      }

      const conversation_id = result.insertId;

      // Create organization group
      const groupQuery = `
        INSERT INTO organization_groups (conversation_id, organization_id, department_id, group_name, group_description, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      con.query(groupQuery, [conversation_id, organization_id, department_id, group_name, group_description, user_id], (err, result) => {
        if (err) {
          console.error("❌ Error creating group:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error creating group",
            error: err.message
          });
        }

        // Add participants
        const participants = [user_id, ...(participant_ids || [])];
        const uniqueParticipants = [...new Set(participants)];

        const participantQuery = `
          INSERT INTO chat_participants (conversation_id, user_id, is_admin)
          VALUES (?, ?, ?)
        `;

        let participantsAdded = 0;
        uniqueParticipants.forEach((pid) => {
          const isAdmin = pid === user_id ? 1 : 0;
          con.query(participantQuery, [conversation_id, pid, isAdmin], (err) => {
            if (err) {
              console.error("❌ Error adding participant:", err.message);
            } else {
              participantsAdded++;
              if (participantsAdded === uniqueParticipants.length) {
                console.log(`✅ Organization group created with ${participantsAdded} participants`);
                return res.status(201).json({
                  success: true,
                  message: "Organization group created successfully",
                  data: {
                    group_id: result.insertId,
                    conversation_id,
                    group_name,
                    participant_count: uniqueParticipants.length
                  }
                });
              }
            }
          });
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Get organization groups
 * GET /api/chat/organization-groups
 */
const getOrganizationGroups = (req, res) => {
  try {
    const user_id = req.user_id;
    const { organization_id, department_id } = req.query;

    console.log(`🏢 Getting organization groups for user: ${user_id}`);

    let query = `
      SELECT 
        og.*,
        c.updated_at,
        COUNT(DISTINCT cp.user_id) as member_count,
        (SELECT content FROM messages WHERE conversation_id = og.conversation_id ORDER BY sent_at DESC LIMIT 1) as last_message,
        (SELECT sent_at FROM messages WHERE conversation_id = og.conversation_id ORDER BY sent_at DESC LIMIT 1) as last_message_time
      FROM organization_groups og
      INNER JOIN conversations c ON og.conversation_id = c.conversation_id
      INNER JOIN chat_participants cp ON c.conversation_id = cp.conversation_id
      WHERE cp.user_id = ?
    `;

    const params = [user_id];

    if (organization_id) {
      query += ` AND og.organization_id = ?`;
      params.push(organization_id);
    }

    if (department_id) {
      query += ` AND og.department_id = ?`;
      params.push(department_id);
    }

    query += ` GROUP BY og.group_id ORDER BY c.updated_at DESC`;

    con.query(query, params, (err, results) => {
      if (err) {
        console.error("❌ Error fetching groups:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching groups",
          error: err.message
        });
      }

      console.log(`✅ Retrieved ${results.length} organization groups`);
      return res.status(200).json({
        success: true,
        data: results,
        count: results.length
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Add participant to group
 * POST /api/chat/groups/:groupId/participants
 */
const addParticipantToGroup = (req, res) => {
  try {
    const { groupId } = req.params;
    const { participant_ids = [] } = req.body;
    const user_id = req.user_id;

    if (!participant_ids || participant_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Participant IDs are required"
      });
    }

    console.log(`👥 Adding ${participant_ids.length} participants to group ${groupId}`);

    // Get conversation_id from group
    const getGroupQuery = `
      SELECT conversation_id FROM organization_groups WHERE group_id = ?
    `;

    con.query(getGroupQuery, [groupId], (err, groups) => {
      if (err || groups.length === 0) {
        console.error("❌ Error finding group:", err?.message || "Group not found");
        return res.status(404).json({
          success: false,
          message: "Group not found"
        });
      }

      const conversation_id = groups[0].conversation_id;

      // Add participants
      const participantQuery = `
        INSERT INTO chat_participants (conversation_id, user_id, is_admin)
        VALUES (?, ?, 0)
        ON DUPLICATE KEY UPDATE joined_at = CURRENT_TIMESTAMP
      `;

      let addedCount = 0;
      let errorCount = 0;

      participant_ids.forEach((pid) => {
        con.query(participantQuery, [conversation_id, pid], (err) => {
          if (err) {
            console.error("❌ Error adding participant:", err.message);
            errorCount++;
          } else {
            addedCount++;
          }

          if (addedCount + errorCount === participant_ids.length) {
            console.log(`✅ Added ${addedCount} participants to group`);
            return res.status(200).json({
              success: true,
              message: `Added ${addedCount} participants to group`,
              data: {
                added: addedCount,
                failed: errorCount
              }
            });
          }
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Remove participant from group
 * DELETE /api/chat/groups/:groupId/participants/:participantId
 */
const removeParticipantFromGroup = (req, res) => {
  try {
    const { groupId, participantId } = req.params;
    const user_id = req.user_id;

    console.log(`👥 Removing participant ${participantId} from group ${groupId}`);

    // Get conversation_id from group
    const getGroupQuery = `
      SELECT conversation_id FROM organization_groups WHERE group_id = ?
    `;

    con.query(getGroupQuery, [groupId], (err, groups) => {
      if (err || groups.length === 0) {
        console.error("❌ Error finding group:", err?.message || "Group not found");
        return res.status(404).json({
          success: false,
          message: "Group not found"
        });
      }

      const conversation_id = groups[0].conversation_id;

      // Remove participant
      const removeQuery = `
        DELETE FROM chat_participants 
        WHERE conversation_id = ? AND user_id = ?
      `;

      con.query(removeQuery, [conversation_id, participantId], (err, result) => {
        if (err) {
          console.error("❌ Error removing participant:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error removing participant",
            error: err.message
          });
        }

        console.log(`✅ Participant removed from group`);
        return res.status(200).json({
          success: true,
          message: "Participant removed from group"
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Get group participants
 * GET /api/chat/groups/:groupId/participants
 */
const getGroupParticipants = (req, res) => {
  try {
    const { groupId } = req.params;

    console.log(`👥 Getting participants for group ${groupId}`);

    const query = `
      SELECT 
        cp.participant_id,
        cp.user_id,
        COALESCE(e.name, u.user_name) as name,
        COALESCE(e.email, '') as email,
        COALESCE(u.avatar_url, '') as profile_picture,
        cp.is_admin,
        cp.joined_at
      FROM chat_participants cp
      INNER JOIN organization_groups og ON cp.conversation_id = og.conversation_id
      LEFT JOIN users u ON cp.user_id = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE og.group_id = ?
      ORDER BY cp.is_admin DESC, COALESCE(e.name, u.user_name) ASC
    `;

    con.query(query, [groupId], (err, results) => {
      if (err) {
        console.error("❌ Error fetching participants:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching participants",
          error: err.message
        });
      }

      console.log(`✅ Retrieved ${results.length} participants`);
      return res.status(200).json({
        success: true,
        data: results,
        count: results.length
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Add participant to group
 * POST /api/chat/groups/:groupId/add-participant
 */
const addParticipantToGroupChat = (req, res) => {
  try {
    const { groupId } = req.params;
    const { user_id } = req.body;
    const requester_id = req.user_id;

    console.log(`👤 Adding participant ${user_id} to group ${groupId}`);

    // First, check if requester is admin of the group
    const adminQuery = `
      SELECT cp.is_admin FROM chat_participants cp
      INNER JOIN organization_groups og ON cp.conversation_id = og.conversation_id
      WHERE og.group_id = ? AND cp.user_id = ?
    `;

    con.query(adminQuery, [groupId, requester_id], (err, adminResults) => {
      if (err || !adminResults.length || !adminResults[0].is_admin) {
        return res.status(403).json({
          success: false,
          message: "Only group admins can add participants"
        });
      }

      // Get conversation_id from group
      const getConvQuery = `SELECT conversation_id FROM organization_groups WHERE group_id = ?`;

      con.query(getConvQuery, [groupId], (err, convResults) => {
        if (err || !convResults.length) {
          return res.status(404).json({
            success: false,
            message: "Group not found"
          });
        }

        const conversation_id = convResults[0].conversation_id;

        // Add participant
        const addQuery = `
          INSERT INTO chat_participants (conversation_id, user_id, joined_at, is_admin)
          VALUES (?, ?, NOW(), 0)
        `;

        con.query(addQuery, [conversation_id, user_id], (err) => {
          if (err) {
            console.error("❌ Error adding participant:", err.message);
            return res.status(500).json({
              success: false,
              message: "Error adding participant",
              error: err.message
            });
          }

          console.log(`✅ Participant ${user_id} added to group ${groupId}`);
          return res.status(200).json({
            success: true,
            message: "Participant added successfully",
            data: { user_id, group_id: groupId }
          });
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Remove participant from group
 * DELETE /api/chat/groups/:groupId/remove-participant/:userId
 */
const removeParticipantFromGroupChat = (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const requester_id = req.user_id;

    console.log(`👤 Removing participant ${userId} from group ${groupId}`);

    // Check if requester is admin
    const adminQuery = `
      SELECT cp.is_admin FROM chat_participants cp
      INNER JOIN organization_groups og ON cp.conversation_id = og.conversation_id
      WHERE og.group_id = ? AND cp.user_id = ?
    `;

    con.query(adminQuery, [groupId, requester_id], (err, adminResults) => {
      if (err || !adminResults.length || !adminResults[0].is_admin) {
        return res.status(403).json({
          success: false,
          message: "Only group admins can remove participants"
        });
      }

      // Get conversation_id
      const getConvQuery = `SELECT conversation_id FROM organization_groups WHERE group_id = ?`;

      con.query(getConvQuery, [groupId], (err, convResults) => {
        if (err || !convResults.length) {
          return res.status(404).json({
            success: false,
            message: "Group not found"
          });
        }

        const conversation_id = convResults[0].conversation_id;

        // Remove participant
        const removeQuery = `
          DELETE FROM chat_participants 
          WHERE conversation_id = ? AND user_id = ?
        `;

        con.query(removeQuery, [conversation_id, userId], (err) => {
          if (err) {
            console.error("❌ Error removing participant:", err.message);
            return res.status(500).json({
              success: false,
              message: "Error removing participant",
              error: err.message
            });
          }

          console.log(`✅ Participant ${userId} removed from group ${groupId}`);
          return res.status(200).json({
            success: true,
            message: "Participant removed successfully",
            data: { user_id: userId, group_id: groupId }
          });
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Update group settings (name, description)
 * PUT /api/chat/groups/:groupId
 */
const updateGroupSettings = (req, res) => {
  try {
    const { groupId } = req.params;
    const { group_name, group_description } = req.body;
    const requester_id = req.user_id;

    console.log(`⚙️  Updating group ${groupId} settings`);

    // Check if requester is admin
    const adminQuery = `
      SELECT cp.is_admin FROM chat_participants cp
      INNER JOIN organization_groups og ON cp.conversation_id = og.conversation_id
      WHERE og.group_id = ? AND cp.user_id = ?
    `;

    con.query(adminQuery, [groupId, requester_id], (err, adminResults) => {
      if (err || !adminResults.length || !adminResults[0].is_admin) {
        return res.status(403).json({
          success: false,
          message: "Only group admins can update group settings"
        });
      }

      // Update group
      const updateQuery = `
        UPDATE organization_groups 
        SET group_name = COALESCE(?, group_name),
            group_description = COALESCE(?, group_description),
            updated_at = NOW()
        WHERE group_id = ?
      `;

      con.query(updateQuery, [group_name, group_description, groupId], (err) => {
        if (err) {
          console.error("❌ Error updating group:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error updating group",
            error: err.message
          });
        }

        console.log(`✅ Group ${groupId} settings updated`);
        return res.status(200).json({
          success: true,
          message: "Group settings updated successfully"
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Make user admin of group
 * POST /api/chat/groups/:groupId/make-admin/:userId
 */
const makeGroupAdmin = (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const requester_id = req.user_id;

    console.log(`👑 Making user ${userId} admin of group ${groupId}`);

    // Check if requester is admin
    const adminQuery = `
      SELECT cp.is_admin FROM chat_participants cp
      INNER JOIN organization_groups og ON cp.conversation_id = og.conversation_id
      WHERE og.group_id = ? AND cp.user_id = ?
    `;

    con.query(adminQuery, [groupId, requester_id], (err, adminResults) => {
      if (err || !adminResults.length || !adminResults[0].is_admin) {
        return res.status(403).json({
          success: false,
          message: "Only group admins can promote users"
        });
      }

      // Get conversation_id
      const getConvQuery = `SELECT conversation_id FROM organization_groups WHERE group_id = ?`;

      con.query(getConvQuery, [groupId], (err, convResults) => {
        if (err || !convResults.length) {
          return res.status(404).json({
            success: false,
            message: "Group not found"
          });
        }

        const conversation_id = convResults[0].conversation_id;

        // Update participant
        const updateQuery = `
          UPDATE chat_participants 
          SET is_admin = 1
          WHERE conversation_id = ? AND user_id = ?
        `;

        con.query(updateQuery, [conversation_id, userId], (err) => {
          if (err) {
            console.error("❌ Error promoting user:", err.message);
            return res.status(500).json({
              success: false,
              message: "Error promoting user",
              error: err.message
            });
          }

          console.log(`✅ User ${userId} is now an admin of group ${groupId}`);
          return res.status(200).json({
            success: true,
            message: "User promoted to admin successfully"
          });
        });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

// =====================================================
// FILE UPLOAD
// =====================================================

/**
 * Upload files
 * POST /api/chat/upload
 */
const uploadFile = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    const uploadedFiles = req.files.map(file => ({
      file_name: file.originalname,
      file_path: `/uploads/${file.filename}`,
      file_type: file.mimetype,
      file_size: file.size
    }));

    console.log(`✅ Uploaded ${uploadedFiles.length} files`);
    return res.status(201).json({
      success: true,
      message: "Files uploaded successfully",
      data: uploadedFiles
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

// =====================================================
// MESSAGE REACTIONS
// =====================================================

/**
 * Add reaction to message
 * POST /api/chat/messages/:messageId/reactions
 */
const addReaction = (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const user_id = req.user_id;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: "Emoji is required"
      });
    }

    console.log(`👍 Adding reaction ${emoji} to message ${messageId}`);

    const query = `
      INSERT INTO message_reactions (message_id, user_id, emoji)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
    `;

    con.query(query, [messageId, user_id, emoji], (err) => {
      if (err) {
        console.error("❌ Error adding reaction:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error adding reaction",
          error: err.message
        });
      }

      // Update reaction count in messages table
      const updateCountQuery = `
        UPDATE messages 
        SET reaction_count = (SELECT COUNT(*) FROM message_reactions WHERE message_id = ?)
        WHERE message_id = ?
      `;

      con.query(updateCountQuery, [messageId, messageId], (err) => {
        if (err) {
          console.error("⚠️ Error updating reaction count:", err.message);
        }
      });

      console.log(`✅ Reaction added`);
      return res.status(201).json({
        success: true,
        message: "Reaction added successfully"
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

/**
 * Remove reaction from message
 * DELETE /api/chat/messages/:messageId/reactions
 */
const removeReaction = (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.query; // Pass emoji as query param if needed, or delete all from user
    const user_id = req.user_id;

    console.log(`👎 Removing reaction from message ${messageId}`);

    let query = `DELETE FROM message_reactions WHERE message_id = ? AND user_id = ?`;
    const params = [messageId, user_id];

    if (emoji) {
      query += ` AND emoji = ?`;
      params.push(emoji);
    }

    con.query(query, params, (err) => {
      if (err) {
        console.error("❌ Error removing reaction:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error removing reaction",
          error: err.message
        });
      }

      // Update reaction count in messages table
      const updateCountQuery = `
        UPDATE messages 
        SET reaction_count = (SELECT COUNT(*) FROM message_reactions WHERE message_id = ?)
        WHERE message_id = ?
      `;

      con.query(updateCountQuery, [messageId, messageId], (err) => {
        if (err) {
          console.error("⚠️ Error updating reaction count:", err.message);
        }
      });

      console.log(`✅ Reaction removed`);
      return res.status(200).json({
        success: true,
        message: "Reaction removed successfully"
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unexpected error",
      error: error.message
    });
  }
};

module.exports = {
  getConversations,
  createConversation,
  getConversationDetails,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  getOrCreateDirectMessage,
  getActiveUsers,
  getAllUsers,
  updatePresence,
  searchUsers,
  addAttachment,
  addMention,
  forwardMessage,
  createOrganizationGroup,
  getOrganizationGroups,
  addParticipantToGroup,
  removeParticipantFromGroup,
  getGroupParticipants,
  addParticipantToGroupChat,
  removeParticipantFromGroupChat,
  updateGroupSettings,
  makeGroupAdmin,
  uploadFile,
  addReaction,
  removeReaction
};
