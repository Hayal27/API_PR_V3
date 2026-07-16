const con = require('../models/db');
const NotificationService = require('../services/notificationService');

// Configure email transporter (optional - will work without email if not configured)
let transporter = null;
try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST ,
        port: process.env.SMTP_PORT ,
        secure: false,
        auth: {
            user: process.env.SMTP_USER ,
            pass: process.env.SMTP_PASS 
        }
    });
    console.log('✅ Email transporter configured');
} catch (error) {
    console.warn('⚠️ Email functionality disabled - nodemailer not configured:', error.message);
    console.warn('   Meetings will be created without email notifications');
}


// =====================================================
// CREATE MEETING
// =====================================================

/**
 * Create a new meeting
 * POST /api/meetings
 */
const createMeeting = async (req, res) => {
    try {
        const user_id = req.user_id;
        const {
            title,
            description,
            meeting_type,
            start_time,
            end_time,
            location,
            meeting_link,
            zoom_meeting_id,
            zoom_passcode,
            priority,
            is_recurring,
            recurrence_pattern,
            agenda,
            participant_ids = [],
            send_email = true
        } = req.body;

        if (!title || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'Title, start time, and end time are required'
            });
        }

        const startTime = new Date(start_time);
        const endTime = new Date(end_time);
        const now = new Date();

        if (startTime < now) {
            return res.status(400).json({
                success: false,
                message: 'Meeting start time cannot be in the past'
            });
        }

        if (endTime <= startTime) {
            return res.status(400).json({
                success: false,
                message: 'Meeting end time must be after start time'
            });
        }

        const shouldSendEmail = send_email === true || send_email === 'true';

        console.log(`📅 Creating meeting: ${title} `);

        // Insert meeting
        const meetingQuery = `
      INSERT INTO meetings (
        title, description, meeting_type, start_time, end_time,
        location, meeting_link, zoom_meeting_id, zoom_passcode, priority, is_recurring, recurrence_pattern,
        agenda, created_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
    `;

        con.query(meetingQuery, [
            title, description, meeting_type, start_time, end_time,
            location, meeting_link, zoom_meeting_id, zoom_passcode, priority, is_recurring, recurrence_pattern,
            agenda, user_id
        ], async (err, result) => {
            if (err) {
                console.error('❌ Error creating meeting:', err.message);
                return res.status(500).json({
                    success: false,
                    message: 'Error creating meeting',
                    error: err.message
                });
            }

            const meeting_id = result.insertId;

            // Add organizer as participant
            const organizerQuery = `
        INSERT INTO meeting_participants(meeting_id, user_id, role, response_status)
VALUES(?, ?, 'organizer', 'accepted')
    `;

            con.query(organizerQuery, [meeting_id, user_id], (err) => {
                if (err) {
                    console.error('⚠️ Error adding organizer:', err.message);
                }
            });

            // Add participants
            if (participant_ids && participant_ids.length > 0) {
                const participantQuery = `
          INSERT INTO meeting_participants(meeting_id, user_id, role, response_status)
VALUES(?, ?, 'required', 'pending')
        `;

                let participantsAdded = 0;
                const uniqueParticipants = [...new Set(participant_ids)].filter(id => id !== user_id);

                for (const participant_id of uniqueParticipants) {
                    con.query(participantQuery, [meeting_id, participant_id], async (err) => {
                        if (err) {
                            console.error(`❌ Error adding participant ${participant_id}: `, err.message);
                        } else {
                            participantsAdded++;

                             // Create in-app and Telegram notification using NotificationService
                             NotificationService.createNotification({
                                 user_id: participant_id,
                                 type: 'meeting',
                                 title: `New Meeting Invitation: ${title}`,
                                 message: `You've been invited to a meeting "${title}" scheduled for ${new Date(start_time).toLocaleString()}`,
                                 priority: priority === 'urgent' ? 'high' : 'medium'
                             }).catch(err => console.error(`⚠️ Error creating notification for ${participant_id}:`, err));

                            // Send email notification
                            if (shouldSendEmail) {
                                await sendMeetingInvitation(meeting_id, participant_id, {
                                    title,
                                    start_time,
                                    end_time,
                                    location,
                                    meeting_link,
                                    zoom_meeting_id,
                                    zoom_passcode,
                                    description,
                                    agenda,
                                    meeting_type,
                                    priority
                                });
                            }
                        }

                        if (participantsAdded === uniqueParticipants.length) {
                            console.log(`✅ Meeting created with ${participantsAdded} participants`);
                        }
                    });
                }
            }

            return res.status(201).json({
                success: true,
                message: 'Meeting created successfully',
                data: {
                    meeting_id,
                    title,
                    participants_count: participant_ids.length
                }
            });
        });
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Unexpected error',
            error: error.message
        });
    }
};

// =====================================================
// GET MEETINGS
// =====================================================

/**
 * Get meetings for current user
 * GET /api/meetings
 */
const getMeetings = (req, res) => {
    try {
        const user_id = req.user_id;
        const { status, from_date, to_date, limit = 50, offset = 0 } = req.query;

        console.log(`📅 Getting meetings for user: ${user_id} `);

        let query = `
SELECT
m.*,
    COALESCE(e.name, u.user_name) as organizer_name,
    e.email as organizer_email,
    (SELECT COUNT(*) FROM meeting_participants WHERE meeting_id = m.meeting_id) as participant_count,
        (SELECT COUNT(*) FROM meeting_participants WHERE meeting_id = m.meeting_id AND response_status = 'accepted') as accepted_count,
        (SELECT COUNT(*) FROM meeting_participants WHERE meeting_id = m.meeting_id AND notes IS NOT NULL) as reason_count,
            mp.response_status as my_response_status,
            mp.role as my_role,
            mp.notes as my_response_notes
      FROM meetings m
      INNER JOIN meeting_participants mp ON m.meeting_id = mp.meeting_id
      LEFT JOIN users u ON m.created_by = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE mp.user_id = ?
    `;

        const params = [user_id];

        if (status) {
            query += ` AND m.status = ? `;
            params.push(status);
        }

        if (from_date) {
            query += ` AND m.start_time >= ? `;
            params.push(from_date);
        }

        if (to_date) {
            query += ` AND m.end_time <= ? `;
            params.push(to_date);
        }

        query += ` ORDER BY CASE WHEN m.start_time >= NOW() THEN 0 ELSE 1 END, m.start_time ASC LIMIT ? OFFSET ? `;
        params.push(parseInt(limit), parseInt(offset));

        con.query(query, params, (err, results) => {
            if (err) {
                console.error('❌ Error fetching meetings:', err.message);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching meetings',
                    error: err.message
                });
            }

            console.log(`✅ Retrieved ${results.length} meetings`);
            return res.status(200).json({
                success: true,
                data: results,
                count: results.length
            });
        });
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Unexpected error',
            error: error.message
        });
    }
};

// =====================================================
// GET MEETING DETAILS
// =====================================================

/**
 * Get meeting details with participants
 * GET /api/meetings/:meetingId
 */
const getMeetingDetails = (req, res) => {
    try {
        const { meetingId } = req.params;
        const user_id = req.user_id;

        console.log(`📅 Getting meeting details: ${meetingId} `);

        const meetingQuery = `
SELECT
m.*,
    COALESCE(e.name, u.user_name) as organizer_name,
    e.email as organizer_email,
    u.avatar_url as organizer_avatar
      FROM meetings m
      LEFT JOIN users u ON m.created_by = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE m.meeting_id = ?
    `;

        con.query(meetingQuery, [meetingId], (err, meetings) => {
            if (err || meetings.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Meeting not found'
                });
            }

            const meeting = meetings[0];

            // Get participants
            const participantsQuery = `
        SELECT
mp.*,
    COALESCE(e.name, u.user_name) as name,
    e.email,
    u.avatar_url
        FROM meeting_participants mp
        LEFT JOIN users u ON mp.user_id = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        WHERE mp.meeting_id = ?
    ORDER BY mp.role ASC, mp.response_status ASC
      `;

            con.query(participantsQuery, [meetingId], (err, participants) => {
                if (err) {
                    console.error('❌ Error fetching participants:', err.message);
                    return res.status(500).json({
                        success: false,
                        message: 'Error fetching participants',
                        error: err.message
                    });
                }

                console.log(`✅ Retrieved meeting with ${participants.length} participants`);
                return res.status(200).json({
                    success: true,
                    data: {
                        ...meeting,
                        participants
                    }
                });
            });
        });
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Unexpected error',
            error: error.message
        });
    }
};

// =====================================================
// UPDATE MEETING
// =====================================================

/**
 * Update meeting
 * PUT /api/meetings/:meetingId
 */
const updateMeeting = (req, res) => {
    try {
        const { meetingId } = req.params;
        const user_id = req.user_id;
        const updates = req.body;

        console.log(`📅 Updating meeting: ${meetingId} `);

        // Check if user is organizer
        const checkQuery = `SELECT created_by FROM meetings WHERE meeting_id = ? `;

        con.query(checkQuery, [meetingId], (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Meeting not found'
                });
            }

            if (results[0].created_by !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Only the organizer can update the meeting'
                });
            }

            // Build update query
            const allowedFields = ['title', 'description', 'meeting_type', 'start_time', 'end_time', 'location', 'meeting_link', 'zoom_meeting_id', 'zoom_passcode', 'status', 'priority', 'agenda', 'notes'];
            const updateFields = [];
            const updateValues = [];

            for (const field of allowedFields) {
                if (updates[field] !== undefined) {
                    updateFields.push(`${field} = ?`);
                    updateValues.push(updates[field]);
                }
            }

            if (updateFields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update'
                });
            }

            updateValues.push(meetingId);

            const updateQuery = `
        UPDATE meetings 
        SET ${updateFields.join(', ')}
        WHERE meeting_id = ?
    `;

            con.query(updateQuery, updateValues, (err) => {
                if (err) {
                    console.error('❌ Error updating meeting:', err.message);
                    return res.status(500).json({
                        success: false,
                        message: 'Error updating meeting',
                        error: err.message
                    });
                }

                console.log(`✅ Meeting ${meetingId} updated`);
                return res.status(200).json({
                    success: true,
                    message: 'Meeting updated successfully'
                });
            });
        });
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Unexpected error',
            error: error.message
        });
    }
};

// =====================================================
// DELETE MEETING
// =====================================================

/**
 * Delete/Cancel meeting
 * DELETE /api/meetings/:meetingId
 */
const deleteMeeting = (req, res) => {
    try {
        const { meetingId } = req.params;
        const user_id = req.user_id;

        console.log(`📅 Deleting meeting: ${meetingId} `);

        // Check if user is organizer
        const checkQuery = `SELECT created_by FROM meetings WHERE meeting_id = ? `;

        con.query(checkQuery, [meetingId], (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Meeting not found'
                });
            }

            if (results[0].created_by !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Only the organizer can delete the meeting'
                });
            }

            const deleteQuery = `DELETE FROM meetings WHERE meeting_id = ? `;

            con.query(deleteQuery, [meetingId], (err) => {
                if (err) {
                    console.error('❌ Error deleting meeting:', err.message);
                    return res.status(500).json({
                        success: false,
                        message: 'Error deleting meeting',
                        error: err.message
                    });
                }

                console.log(`✅ Meeting ${meetingId} deleted`);
                return res.status(200).json({
                    success: true,
                    message: 'Meeting deleted successfully'
                });
            });
        });
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Unexpected error',
            error: error.message
        });
    }
};

// =====================================================
// RESPOND TO MEETING INVITATION
// =====================================================

/**
 * Respond to meeting invitation
 * PUT /api/meetings/:meetingId/respond
 */
const respondToMeeting = (req, res) => {
    try {
        const { meetingId } = req.params;
        const user_id = req.user_id;
        const { response_status, notes } = req.body;

        if (!['accepted', 'declined', 'tentative'].includes(response_status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid response status'
            });
        }

        console.log(`📅 User ${user_id} responding to meeting ${meetingId}: ${response_status} with notes: ${notes}`);

        const updateQuery = `
      UPDATE meeting_participants
      SET response_status = ?, notes = ?
    WHERE meeting_id = ? AND user_id = ?
        `;

        con.query(updateQuery, [response_status, notes || null, meetingId, user_id], (err, result) => {
            if (err) {
                console.error('❌ Error updating response:', err.message);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating response',
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Participant not found'
                });
            }

            console.log(`✅ Response updated`);
            return res.status(200).json({
                success: true,
                message: 'Response updated successfully'
            });
        });
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Unexpected error',
            error: error.message
        });
    }
};

// =====================================================
// GET MEETING STATS
// =====================================================

/**
 * Get meeting statistics for user
 * GET /api/meetings/stats
 */
const getMeetingStats = (req, res) => {
    try {
        const user_id = req.user_id;

        console.log(`📊 Getting meeting stats for user: ${user_id} `);

        const statsQuery = `
SELECT
COUNT(*) as total_meetings,
    SUM(CASE WHEN m.status = 'scheduled' AND m.start_time > NOW() THEN 1 ELSE 0 END) as upcoming_meetings,
    SUM(CASE WHEN m.status = 'scheduled' AND DATE(m.start_time) = CURDATE() THEN 1 ELSE 0 END) as today_meetings,
    SUM(CASE WHEN m.status = 'completed' THEN 1 ELSE 0 END) as completed_meetings,
    SUM(CASE WHEN mp.response_status = 'pending' AND m.start_time > NOW() THEN 1 ELSE 0 END) as pending_responses,
    SUM(CASE WHEN m.priority = 'urgent' AND m.start_time > NOW() THEN 1 ELSE 0 END) as urgent_meetings
      FROM meetings m
      INNER JOIN meeting_participants mp ON m.meeting_id = mp.meeting_id
      WHERE mp.user_id = ?
    `;

        con.query(statsQuery, [user_id], (err, results) => {
            if (err) {
                console.error('❌ Error fetching stats:', err.message);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching stats',
                    error: err.message
                });
            }

            const stats = results[0] || {};
            console.log(`✅ Stats retrieved`);
            return res.status(200).json({
                success: true,
                stats
            });
        });
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Unexpected error',
            error: error.message
        });
    }
};

// =====================================================
// SEND MEETING INVITATION EMAIL
// =====================================================

const sendMeetingInvitation = async (meeting_id, participant_id, meetingDetails) => {
    try {
        // Get participant email
        const userQuery = `
      SELECT u.user_name, e.email, e.name
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE u.user_id = ?
    `;

        con.query(userQuery, [participant_id], async (err, users) => {
            if (err || users.length === 0 || !users[0].email) {
                console.error(`⚠️ Cannot send email to user ${participant_id}: No email found`);
                return;
            }

            const user = users[0];
            const { title, start_time, end_time, location, meeting_link, zoom_meeting_id, zoom_passcode, description, agenda, meeting_type, priority } = meetingDetails;

            const mailOptions = {
                from: process.env.SMTP_USER || 'noreply@company.com',
                to: user.email,
                subject: `${priority === 'urgent' ? '🚨 Urgent: ' : ''}Meeting Invitation: ${title}`,
                html: `
                  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background: ${priority === 'urgent' ? '#f44336' : '#0084ff'}; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">${priority === 'urgent' ? '🚨 Urgent Meeting' : '📅 Meeting Invitation'}</h1>
                    </div>
                    <div style="border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; padding: 30px; background: #fff;">
                      <h2 style="margin-top: 0; color: #333; font-size: 20px;">${title}</h2>
                      ${meeting_type ? `<p style="color: #666; font-style: italic;">Type: ${meeting_type.replace('-', ' ')}</p>` : ''}
                      
                      <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>🕒 When:</strong> ${new Date(start_time).toLocaleString()} - ${new Date(end_time).toLocaleTimeString()}</p>
                        ${location ? `<p style="margin: 5px 0;"><strong>📍 Where:</strong> ${location}</p>` : ''}
                      </div>

                      ${description ? `
                        <div style="margin-bottom: 20px;">
                            <h3 style="font-size: 16px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Description</h3>
                            <p>${description}</p>
                        </div>
                      ` : ''}

                      ${agenda ? `
                        <div style="margin-bottom: 20px;">
                            <h3 style="font-size: 16px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Agenda</h3>
                            <p style="white-space: pre-line;">${agenda}</p>
                        </div>
                      ` : ''}

                      ${(meeting_link || zoom_meeting_id) ? `
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; border-left: 4px solid #0084ff;">
                          <h3 style="margin-top: 0; font-size: 16px; color: #0084ff;">Join Details</h3>
                          ${meeting_link ? `<p style="margin: 5px 0;"><strong>🔗 Link:</strong> <a href="${meeting_link}" style="color: #0084ff;">Click to Join</a></p>` : ''}
                          ${zoom_meeting_id ? `<p style="margin: 5px 0;"><strong>🎥 ID:</strong> ${zoom_meeting_id}</p>` : ''}
                          ${zoom_passcode ? `<p style="margin: 5px 0;"><strong>🔒 Passcode:</strong> ${zoom_passcode}</p>` : ''}
                        </div>
                      ` : ''}

                      <div style="margin-top: 30px; text-align: center;">
                        <a href="${process.env.APP_URL || 'http://localhost:3000'}/meetings" style="background: #0084ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">View Full Details</a>
                      </div>
                    </div>
                    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
                        This is an automated notification from your EITPRV2 Workspace.
                    </p>
                  </div>
                `
            };

            try {
                if (!transporter) {
                    console.warn(`⚠️ Email not sent to ${user.email} - email transporter not configured`);
                    return;
                }

                await transporter.sendMail(mailOptions);
                console.log(`✅ Email sent to ${user.email} `);

                // Mark email as sent
                con.query(
                    'UPDATE meeting_participants SET email_sent = 1 WHERE meeting_id = ? AND user_id = ?',
                    [meeting_id, participant_id],
                    (err) => {
                        if (err) console.error('⚠️ Error updating email_sent flag:', err.message);
                    }
                );
            } catch (error) {
                console.error(`❌ Error sending email to ${user.email}: `, error.message);
            }
        });
    } catch (error) {
        console.error('❌ Error in sendMeetingInvitation:', error.message);
    }
};

const sendPostponeEmail = async (meeting_id, participant_id, meetingDetails) => {
    try {
        const userQuery = `
            SELECT u.user_name, e.email, e.name
            FROM users u
            LEFT JOIN employees e ON u.employee_id = e.employee_id
            WHERE u.user_id = ?
        `;

        con.query(userQuery, [participant_id], async (err, users) => {
            if (err || users.length === 0 || !users[0].email) {
                return;
            }

            const user = users[0];
            const { title, new_start_time, new_end_time, reason } = meetingDetails;

            const mailOptions = {
                from: process.env.SMTP_USER || 'noreply@company.com',
                to: user.email,
                subject: `Meeting Postponed: ${title}`,
                html: `
                  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background: #ff9800; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">📅 Meeting Rescheduled</h1>
                    </div>
                    <div style="border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; padding: 30px; background: #fff;">
                      <h2 style="margin-top: 0; color: #333; font-size: 20px;">${title}</h2>
                      <p style="color: #666;">The meeting has been rescheduled.</p>
                      
                      <div style="background: #fff3e0; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800;">
                        <p style="margin: 5px 0;"><strong>📅 New Date & Time:</strong></p>
                        <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">${new Date(new_start_time).toLocaleString()} - ${new Date(new_end_time).toLocaleTimeString()}</p>
                      </div>

                      ${reason ? `
                        <div style="margin-bottom: 20px;">
                            <h3 style="font-size: 16px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Reason</h3>
                            <p>${reason}</p>
                        </div>
                      ` : ''}

                      <div style="margin-top: 30px; text-align: center;">
                        <a href="${process.env.APP_URL || 'http://localhost:3000'}/meetings" style="background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">View Updated Meeting</a>
                      </div>
                    </div>
                    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
                        This is an automated notification from your EITPRV2 Workspace.
                    </p>
                  </div>
                `
            };

            if (transporter) {
                await transporter.sendMail(mailOptions);
                console.log(`✅ Postpone email sent to ${user.email}`);
            }
        });
    } catch (error) {
        console.error('❌ Error in sendPostponeEmail:', error.message);
    }
};

// =====================================================
// POSTPONE MEETING
// =====================================================

const postponeMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const user_id = req.user_id;
        const { new_start_time, new_end_time, reason } = req.body;

        if (!new_start_time || !new_end_time) {
            return res.status(400).json({
                success: false,
                message: 'New start and end times are required'
            });
        }

        const newStartTime = new Date(new_start_time);
        const newEndTime = new Date(new_end_time);
        const now = new Date();

        if (newStartTime < now) {
            return res.status(400).json({
                success: false,
                message: 'New start time cannot be in the past'
            });
        }

        if (newEndTime <= newStartTime) {
            return res.status(400).json({
                success: false,
                message: 'New end time must be after start time'
            });
        }

        // Check if user is organizer
        const checkQuery = 'SELECT created_by, title FROM meetings WHERE meeting_id = ?';
        con.query(checkQuery, [meetingId], (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Meeting not found'
                });
            }

            if (results[0].created_by !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Only organizer can postpone the meeting'
                });
            }

            const meetingTitle = results[0].title;

            // Update meeting times and status
            const updateQuery = `
                UPDATE meetings 
                SET start_time = ?, end_time = ?, status = 'rescheduled', notes = CONCAT(COALESCE(notes, ''), '\nPostponed: ', ?)
                WHERE meeting_id = ?
            `;

            con.query(updateQuery, [new_start_time, new_end_time, reason || 'No reason provided', meetingId], (err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Error postponing meeting'
                    });
                }

                // Notify all participants
                const participantsQuery = 'SELECT user_id FROM meeting_participants WHERE meeting_id = ? AND user_id != ?';
                con.query(participantsQuery, [meetingId, user_id], (err, participants) => {
                    if (!err && participants.length > 0) {
                        participants.forEach(participant => {
                            // In-app notification
                            const notificationQuery = `
                                INSERT INTO notifications (user_id, type, title, message, created_at)
                                VALUES (?, 'meeting', ?, ?, NOW())
                            `;
                            const notifTitle = `Meeting Postponed: ${meetingTitle}`;
                            const notifMessage = `The meeting "${meetingTitle}" has been rescheduled to ${new Date(new_start_time).toLocaleString()}. ${reason ? 'Reason: ' + reason : ''}`;

                            con.query(notificationQuery, [participant.user_id, notifTitle, notifMessage]);

                            // Send email notification
                            sendPostponeEmail(meetingId, participant.user_id, {
                                title: meetingTitle,
                                new_start_time,
                                new_end_time,
                                reason
                            });
                        });
                    }
                });

                console.log(`✅ Meeting postponed: ${meetingId}`);
                return res.status(200).json({
                    success: true,
                    message: 'Meeting postponed successfully'
                });
            });
        });
    } catch (error) {
        console.error('❌ Error postponing meeting:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Unexpected error',
            error: error.message
        });
    }
};

// =====================================================
// END MEETING
// =====================================================

const endMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const user_id = req.user_id;
        const { summary, action_items } = req.body;

        // Check if user is organizer
        const checkQuery = 'SELECT created_by, title FROM meetings WHERE meeting_id = ?';
        con.query(checkQuery, [meetingId], (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Meeting not found'
                });
            }

            if (results[0].created_by !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Only organizer can end the meeting'
                });
            }

            const meetingTitle = results[0].title;

            // Update meeting status
            const updateQuery = `
                UPDATE meetings 
                SET status = 'completed', notes = CONCAT(COALESCE(notes, ''), '\nSummary: ', ?)
                WHERE meeting_id = ?
            `;

            con.query(updateQuery, [summary || 'Meeting completed', meetingId], (err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Error ending meeting'
                    });
                }

                // Add meeting minutes if provided
                if (summary || action_items) {
                    const minutesQuery = `
                        INSERT INTO meeting_minutes (meeting_id, content, action_items, recorded_by)
                        VALUES (?, ?, ?, ?)
                    `;
                    con.query(minutesQuery, [meetingId, summary || 'Meeting completed', action_items, user_id]);
                }

                // Notify all participants
                const participantsQuery = 'SELECT user_id FROM meeting_participants WHERE meeting_id = ? AND user_id != ?';
                con.query(participantsQuery, [meetingId, user_id], (err, participants) => {
                    if (!err && participants.length > 0) {
                        participants.forEach(participant => {
                            const notificationQuery = `
                                INSERT INTO notifications (user_id, type, title, message, created_at)
                                VALUES (?, 'meeting', ?, ?, NOW())
                            `;
                            const notifTitle = `Meeting Ended: ${meetingTitle}`;
                            const notifMessage = `The meeting "${meetingTitle}" has been completed. ${summary ? 'Summary: ' + summary : ''}`;

                            con.query(notificationQuery, [participant.user_id, notifTitle, notifMessage]);
                        });
                    }
                });

                console.log(`✅ Meeting ended: ${meetingId}`);
                return res.status(200).json({
                    success: true,
                    message: 'Meeting ended successfully'
                });
            });
        });
    } catch (error) {
        console.error('❌ Error ending meeting:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Unexpected error',
            error: error.message
        });
    }
};

// =====================================================
// UPLOAD MEETING ATTACHMENTS
// =====================================================

const uploadAttachments = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const user_id = req.user_id;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        console.log(`📎 Uploading ${files.length} attachments for meeting ${meetingId}`);

        // Insert attachment records
        const insertQuery = `
            INSERT INTO meeting_attachments (meeting_id, file_name, file_path, file_type, file_size, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        let uploadedCount = 0;
        const uploadPromises = files.map(file => {
            return new Promise((resolve, reject) => {
                con.query(insertQuery, [
                    meetingId,
                    file.originalname,
                    file.path,
                    file.mimetype,
                    file.size,
                    user_id
                ], (err) => {
                    if (err) {
                        console.error(`❌ Error saving attachment ${file.originalname}:`, err.message);
                        reject(err);
                    } else {
                        uploadedCount++;
                        resolve();
                    }
                });
            });
        });

        await Promise.all(uploadPromises);

        console.log(`✅ ${uploadedCount} attachments uploaded successfully`);
        return res.status(200).json({
            success: true,
            message: `${uploadedCount} file(s) uploaded successfully`,
            count: uploadedCount
        });
    } catch (error) {
        console.error('❌ Error uploading attachments:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error uploading attachments',
            error: error.message
        });
    }
};

// =====================================================
// GET MEETING ATTACHMENTS
// =====================================================

const getAttachments = (req, res) => {
    try {
        const { meetingId } = req.params;

        console.log(`📎 Getting attachments for meeting ${meetingId}`);

        const query = `
            SELECT 
                ma.*,
                COALESCE(e.name, u.user_name) as uploaded_by_name
            FROM meeting_attachments ma
            LEFT JOIN users u ON ma.uploaded_by = u.user_id
            LEFT JOIN employees e ON u.employee_id = e.employee_id
            WHERE ma.meeting_id = ?
            ORDER BY ma.uploaded_at DESC
        `;

        con.query(query, [meetingId], (err, results) => {
            if (err) {
                console.error('❌ Error fetching attachments:', err.message);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching attachments',
                    error: err.message
                });
            }

            console.log(`✅ Retrieved ${results.length} attachments`);
            return res.status(200).json({
                success: true,
                data: results,
                count: results.length
            });
        });
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Unexpected error',
            error: error.message
        });
    }
};

// =====================================================
// DELETE MEETING ATTACHMENT
// =====================================================

const deleteAttachment = (req, res) => {
    try {
        const { attachmentId } = req.params;
        const user_id = req.user_id;

        console.log(`📎 Deleting attachment ${attachmentId}`);

        // Get attachment details and check permissions
        const checkQuery = `
            SELECT ma.*, m.created_by 
            FROM meeting_attachments ma
            JOIN meetings m ON ma.meeting_id = m.meeting_id
            WHERE ma.attachment_id = ?
        `;

        con.query(checkQuery, [attachmentId], (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Attachment not found'
                });
            }

            const attachment = results[0];

            // Only organizer or uploader can delete
            if (attachment.created_by !== user_id && attachment.uploaded_by !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to delete this attachment'
                });
            }

            // Delete file from filesystem
            const fs = require('fs');
            if (fs.existsSync(attachment.file_path)) {
                fs.unlinkSync(attachment.file_path);
            }

            // Delete from database
            const deleteQuery = 'DELETE FROM meeting_attachments WHERE attachment_id = ?';
            con.query(deleteQuery, [attachmentId], (err) => {
                if (err) {
                    console.error('❌ Error deleting attachment:', err.message);
                    return res.status(500).json({
                        success: false,
                        message: 'Error deleting attachment',
                        error: err.message
                    });
                }

                console.log(`✅ Attachment ${attachmentId} deleted`);
                return res.status(200).json({
                    success: true,
                    message: 'Attachment deleted successfully'
                });
            });
        });
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Unexpected error',
            error: error.message
        });
    }
};

// =====================================================
// SEND ON-DEMAND TELEGRAM REMINDER
// =====================================================

/**
 * Send an immediate Telegram reminder to all linked participants
 * POST /api/meetings/:meetingId/remind
 */
const sendMeetingReminder = async (req, res) => {
    try {
        const { meetingId } = req.params;

        // Get meeting details
        const meetingResults = await new Promise((resolve, reject) => {
            con.query(
                `SELECT meeting_id, title, start_time, end_time, location, meeting_link FROM meetings WHERE meeting_id = ?`,
                [meetingId],
                (err, rows) => err ? reject(err) : resolve(rows)
            );
        });

        if (!meetingResults.length) {
            return res.status(404).json({ success: false, message: 'Meeting not found' });
        }

        const meeting = meetingResults[0];

        // Get all Telegram-linked participants
        const participants = await new Promise((resolve, reject) => {
            con.query(
                `SELECT mp.user_id, e.name, e.telegram_chat_id
                 FROM meeting_participants mp
                 JOIN users u ON mp.user_id = u.user_id
                 JOIN employees e ON u.employee_id = e.employee_id
                 WHERE mp.meeting_id = ? AND e.telegram_chat_id IS NOT NULL`,
                [meetingId],
                (err, rows) => err ? reject(err) : resolve(rows)
            );
        });

        if (!participants.length) {
            return res.status(200).json({
                success: false,
                message: 'No participants have linked their Telegram accounts. They can link via the Telegram bot.'
            });
        }

        const timeStr = new Date(meeting.start_time).toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const locationStr = meeting.location ? `\n📍 ${meeting.location}` : '';
        const linkStr = meeting.meeting_link ? `\n🔗 ${meeting.meeting_link}` : '';
        const message = `📅 *Meeting Reminder*\n\n*${meeting.title}*\n🕐 ${timeStr}${locationStr}${linkStr}\n\nThis is an on-demand reminder from your organizer.`;

        let sentCount = 0;
        for (const p of participants) {
            await NotificationService.sendTelegramNotification(p.user_id, '📅 Meeting Reminder', message, 'meeting');
            sentCount++;
        }

        return res.status(200).json({
            success: true,
            message: `Telegram reminder sent to ${sentCount} participant(s).`
        });

    } catch (error) {
        console.error('❌ Error sending meeting reminder:', error.message);
        return res.status(500).json({ success: false, message: 'Error sending reminders', error: error.message });
    }
};

module.exports = {
    createMeeting,
    getMeetings,
    getMeetingDetails,
    updateMeeting,
    deleteMeeting,
    respondToMeeting,
    getMeetingStats,
    postponeMeeting,
    endMeeting,
    uploadAttachments,
    getAttachments,
    deleteAttachment,
    sendMeetingReminder
};
