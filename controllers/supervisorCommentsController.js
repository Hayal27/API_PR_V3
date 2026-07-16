const db = require('../models/db');
const NotificationService = require('../services/notificationService');

// Get all comments for a specific plan with user information and replies
const getCommentsByPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    // Get all comments with user information and reply count
    const query = `
      SELECT 
        sc.comment_id,
        sc.plan_id,
        sc.user_id,
        sc.parent_comment_id,
        sc.comment_text,
        sc.comment_type,
        sc.is_edited,
        sc.created_at,
        sc.updated_at,
        u.user_name,
        e.fname,
        e.lname,
        r.role_name,
        d.name as department_name,
        (SELECT COUNT(*) FROM supervisor_comments WHERE parent_comment_id = sc.comment_id) as reply_count
      FROM supervisor_comments sc
      LEFT JOIN users u ON sc.user_id = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE sc.plan_id = ?
      ORDER BY 
        CASE WHEN sc.parent_comment_id IS NULL THEN sc.comment_id ELSE sc.parent_comment_id END,
        sc.parent_comment_id IS NULL DESC,
        sc.created_at ASC
    `;

    db.query(query, [planId], (error, results) => {
      if (error) {
        console.error('Database error fetching comments:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch comments',
          error: error.message
        });
      }

      // Organize comments and replies
      const comments = [];
      const commentMap = new Map();

      results.forEach(row => {
        const comment = {
          comment_id: row.comment_id,
          plan_id: row.plan_id,
          user_id: row.user_id,
          parent_comment_id: row.parent_comment_id,
          comment_text: row.comment_text,
          comment_type: row.comment_type,
          is_edited: row.is_edited,
          created_at: row.created_at,
          updated_at: row.updated_at,
          user: {
            name: row.user_name,
            user_name: row.user_name,
            fname: row.fname,
            lname: row.lname,
            role_name: row.role_name,
            department_name: row.department_name
          },
          reply_count: row.reply_count,
          replies: []
        };

        if (row.parent_comment_id === null) {
          // This is a main comment
          comments.push(comment);
          commentMap.set(row.comment_id, comment);
        } else {
          // This is a reply
          const parentComment = commentMap.get(row.parent_comment_id);
          if (parentComment) {
            parentComment.replies.push(comment);
          }
        }
      });

      res.json({
        success: true,
        comments: comments,
        total: comments.length
      });
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add a new comment or reply
const addComment = async (req, res) => {
  try {
    const { planId } = req.params;
    const { comment_text, parent_comment_id } = req.body;
    const user_id = req.user_id;

    if (!planId || !comment_text) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID and comment text are required'
      });
    }

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Validate plan exists
    const planCheckQuery = 'SELECT plan_id FROM plans WHERE plan_id = ?';
    db.query(planCheckQuery, [planId], (planError, planResults) => {
      if (planError) {
        console.error('Error checking plan:', planError);
        return res.status(500).json({
          success: false,
          message: 'Failed to validate plan'
        });
      }

      if (planResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }

      // Determine comment type
      const comment_type = parent_comment_id ? 'reply' : 'comment';

      // If it's a reply, validate parent comment exists
      if (parent_comment_id) {
        const parentCheckQuery = 'SELECT comment_id FROM supervisor_comments WHERE comment_id = ? AND plan_id = ?';
        db.query(parentCheckQuery, [parent_comment_id, planId], (parentError, parentResults) => {
          if (parentError || parentResults.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'Invalid parent comment'
            });
          }

          // Insert the reply
          insertComment();
        });
      } else {
        // Insert the main comment
        insertComment();
      }

      function insertComment() {
        const insertQuery = `
          INSERT INTO supervisor_comments 
          (plan_id, user_id, parent_comment_id, comment_text, comment_type)
          VALUES (?, ?, ?, ?, ?)
        `;

        const values = [planId, user_id, parent_comment_id || null, comment_text, comment_type];

        db.query(insertQuery, values, (insertError, insertResults) => {
          if (insertError) {
            console.error('Error inserting comment:', insertError);
            return res.status(500).json({
              success: false,
              message: 'Failed to add comment',
              error: insertError.message
            });
          }

          // Get the newly created comment with user information
          const getNewCommentQuery = `
            SELECT 
              sc.comment_id,
              sc.plan_id,
              sc.user_id,
              sc.parent_comment_id,
              sc.comment_text,
              sc.comment_type,
              sc.is_edited,
              sc.created_at,
              sc.updated_at,
              u.user_name,
              e.fname,
              e.lname,
              r.role_name,
              d.name as department_name
            FROM supervisor_comments sc
            LEFT JOIN users u ON sc.user_id = u.user_id
            LEFT JOIN employees e ON u.employee_id = e.employee_id
            LEFT JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            WHERE sc.comment_id = ?
          `;

          db.query(getNewCommentQuery, [insertResults.insertId], async (getError, getResults) => {
            if (getError || getResults.length === 0) {
              return res.status(500).json({
                success: false,
                message: 'Comment added but failed to retrieve details'
              });
            }

            const newComment = getResults[0];
            const commentResponse = {
              comment_id: newComment.comment_id,
              plan_id: newComment.plan_id,
              user_id: newComment.user_id,
              parent_comment_id: newComment.parent_comment_id,
              comment_text: newComment.comment_text,
              comment_type: newComment.comment_type,
              is_edited: newComment.is_edited,
              created_at: newComment.created_at,
              updated_at: newComment.updated_at,
              user: {
                name: newComment.user_name,
                user_name: newComment.user_name,
                fname: newComment.fname,
                lname: newComment.lname,
                role_name: newComment.role_name,
                department_name: newComment.department_name
              },
              replies: []
            };

            // Trigger notifications
            try {
              // Get plan details for notification
              const planQuery = 'SELECT p.plan_id, g.name as goal_name FROM plans p LEFT JOIN goals g ON p.goal_id = g.goal_id WHERE p.plan_id = ?';
              db.query(planQuery, [planId], async (planError, planResults) => {
                if (!planError && planResults.length > 0) {
                  const planData = planResults[0];
                  const commentData = {
                    comment_id: newComment.comment_id,
                    user_id: newComment.user_id,
                    user_name: newComment.fname && newComment.lname ? `${newComment.fname} ${newComment.lname}` : newComment.user_name,
                    comment_text: newComment.comment_text
                  };

                  if (parent_comment_id) {
                    // This is a reply - get parent comment data
                    const parentQuery = 'SELECT sc.*, u.user_name, e.fname, e.lname FROM supervisor_comments sc LEFT JOIN users u ON sc.user_id = u.user_id LEFT JOIN employees e ON u.employee_id = e.employee_id WHERE sc.comment_id = ?';
                    db.query(parentQuery, [parent_comment_id], async (parentError, parentResults) => {
                      if (!parentError && parentResults.length > 0) {
                        const parentCommentData = {
                          ...parentResults[0],
                          user_name: parentResults[0].fname && parentResults[0].lname ? `${parentResults[0].fname} ${parentResults[0].lname}` : parentResults[0].user_name
                        };
                        await NotificationService.createReplyNotification(commentData, parentCommentData, planData);
                      }
                    });
                  } else {
                    // This is a new comment
                    await NotificationService.createCommentNotification(commentData, planData);
                  }
                }
              });
            } catch (notificationError) {
              console.error('Error creating notification:', notificationError);
              // Don't fail the request if notification fails
            }

            res.status(201).json({
              success: true,
              message: 'Comment added successfully',
              comment: commentResponse
            });
          });
        });
      }
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment_text } = req.body;
    const user_id = req.user_id;

    if (!commentId || !comment_text) {
      return res.status(400).json({
        success: false,
        message: 'Comment ID and comment text are required'
      });
    }

    // Check if comment exists and user owns it
    const checkQuery = 'SELECT user_id FROM supervisor_comments WHERE comment_id = ?';
    db.query(checkQuery, [commentId], (checkError, checkResults) => {
      if (checkError) {
        console.error('Error checking comment ownership:', checkError);
        return res.status(500).json({
          success: false,
          message: 'Failed to validate comment'
        });
      }

      if (checkResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      if (checkResults[0].user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own comments'
        });
      }

      // Update the comment
      const updateQuery = `
        UPDATE supervisor_comments 
        SET comment_text = ?, is_edited = 1, updated_at = CURRENT_TIMESTAMP
        WHERE comment_id = ?
      `;

      db.query(updateQuery, [comment_text, commentId], (updateError, updateResults) => {
        if (updateError) {
          console.error('Error updating comment:', updateError);
          return res.status(500).json({
            success: false,
            message: 'Failed to update comment',
            error: updateError.message
          });
        }

        res.json({
          success: true,
          message: 'Comment updated successfully'
        });
      });
    });

  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user_id = req.user_id;

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: 'Comment ID is required'
      });
    }

    // Check if comment exists and user owns it
    const checkQuery = 'SELECT user_id FROM supervisor_comments WHERE comment_id = ?';
    db.query(checkQuery, [commentId], (checkError, checkResults) => {
      if (checkError) {
        console.error('Error checking comment ownership:', checkError);
        return res.status(500).json({
          success: false,
          message: 'Failed to validate comment'
        });
      }

      if (checkResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      if (checkResults[0].user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own comments'
        });
      }

      // Delete the comment (CASCADE will handle replies)
      const deleteQuery = 'DELETE FROM supervisor_comments WHERE comment_id = ?';
      db.query(deleteQuery, [commentId], (deleteError, deleteResults) => {
        if (deleteError) {
          console.error('Error deleting comment:', deleteError);
          return res.status(500).json({
            success: false,
            message: 'Failed to delete comment',
            error: deleteError.message
          });
        }

        res.json({
          success: true,
          message: 'Comment deleted successfully'
        });
      });
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getCommentsByPlan,
  addComment,
  updateComment,
  deleteComment
};
