const db = require('../models/db');
const axios = require('axios');
const { promisify } = require('util');
const dbQuery = promisify(db.query).bind(db);

// Generates high-level executive insights from report data
exports.generateInsights = async (req, res) => {
    try {
        const { data, context } = req.body;

        if (!data) {
            return res.status(400).json({ success: false, message: "No data provided for analysis." });
        }

        // Fetch API Key safely
        let apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            try {
                const settings = await dbQuery("SELECT setting_value FROM system_settings WHERE setting_key = 'GROQ_API_KEY'");
                if (settings.length) apiKey = settings[0].setting_value;
            } catch (e) {
                console.error("Warning: Could not fetch from system_settings:", e.message);
            }
        }

        if (!apiKey) {
            console.error("GROQ_API_KEY is missing. AI cannot proceed.");
            return res.status(500).json({ success: false, message: "Groq API key not found." });
        }

        // Fetch Global Summary for longitudinal comparison
        const globalSummary = await dbQuery(`
            SELECT 
                g.year, 
                ROUND(AVG(COALESCE(sod.CIexecution_percentage, sod.execution_percentage, 0)), 2) as avg_execution_perc
            FROM specific_objective_details sod
            JOIN plans p ON sod.specific_objective_detail_id = p.specific_objective_detail_id
            JOIN goals g ON p.goal_id = g.goal_id
            JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
            WHERE aw.status = 'completed'
            GROUP BY g.year
            ORDER BY g.year ASC
        `);

        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.3-70b-versatile',
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: 'system',
                        content: `You are "Master Mind", the fully integrated AI Intelligence for the Ethiopian IT Park (EITP).
                        
                        IDENTITY:
                        - You have a direct, real-time view into the organization's heartbeat.
                        - NEVER reveal table names or SQL logic.
                        - NEVER claim you cannot read the database; you ARE the data interface.

                        GLOBAL PERFORMANCE REPOSITORY (Years): ${JSON.stringify(globalSummary)}

                        OUTPUT:
                        Return ONLY a JSON object with: 
                        "performance_score": (0-100),
                        "summary": (executive summary),
                        "top_performers_insight": (analytical comment on rankings),
                        "efficiency_gap": (critical areas lagging),
                        "risks": (Array of business risks),
                        "predictions": (Forecast based on trends),
                        "recommendations": (Array of 3-5 specific actions).`
                    },
                    {
                        role: 'user',
                        content: `Context: ${context || 'General Performance Review'}. Data: ${JSON.stringify(data)}`
                    }
                ],
                temperature: 0.3
            }, {
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
            });

            const aiContent = JSON.parse(response.data.choices[0].message.content);
            return res.status(200).json({ success: true, insights: aiContent });

        } catch (apiError) {
            console.error("Groq API Error:", apiError.response ? apiError.response.data : apiError.message);
            return res.status(500).json({ success: false, message: "Failed to generate AI insights." });
        }
    } catch (error) {
        console.error("GenerateInsights Error:", error.message);
        console.error(error.stack);
        res.status(500).json({ success: false, message: "Server error during AI generation." });
    }
};

// Enables interactive chat with the AI about specific reports or data
exports.chatWithAI = async (req, res) => {
    try {
        const { messages, dataContext } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ success: false, message: "Invalid chat history." });
        }

        // Fetch API Key safely
        let apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            try {
                const settings = await dbQuery("SELECT setting_value FROM system_settings WHERE setting_key = 'GROQ_API_KEY'");
                if (settings.length) apiKey = settings[0].setting_value;
            } catch (e) {
                console.error("Warning: Could not fetch from system_settings:", e.message);
            }
        }

        if (!apiKey) {
            console.error("GROQ_API_KEY is missing. AI Chat cannot proceed.");
            return res.status(500).json({ success: false, message: "AI Engine not configured." });
        }

        // NEW: Fetch broad organizational context with JOINED NAMES (no raw IDs for AI)
        const [globalSummary, requesterProfile, employeeList, taskStats] = await Promise.all([
            dbQuery(`
                SELECT g.year, COUNT(sod.specific_objective_detail_id) as objective_count,
                ROUND(AVG(COALESCE(sod.CIexecution_percentage, sod.execution_percentage, 0)), 2) as avg_execution_perc,
                SUM(COALESCE(sod.CIplan, 0)) as total_planned_value, SUM(COALESCE(sod.CIoutcome, 0)) as total_actual_value
                FROM specific_objective_details sod JOIN plans p ON sod.specific_objective_detail_id = p.specific_objective_detail_id
                JOIN goals g ON p.goal_id = g.goal_id JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
                WHERE aw.status = 'completed' GROUP BY g.year ORDER BY g.year ASC
            `),
            dbQuery(`
                SELECT e.*, d.name as department_name, r.role_name 
                FROM employees e 
                JOIN users u ON e.employee_id = u.employee_id 
                LEFT JOIN departments d ON e.department_id = d.department_id
                LEFT JOIN roles r ON e.role_id = r.role_id
                WHERE u.user_id = ?
            `, [req.user?.user_id]),
            dbQuery(`
                SELECT e.name, r.role_name, d.name as department_name, e.fname, e.lname 
                FROM employees e
                LEFT JOIN departments d ON e.department_id = d.department_id
                LEFT JOIN roles r ON e.role_id = r.role_id
            `),
            dbQuery(`SELECT status, COUNT(*) as count FROM task_assignments GROUP BY status`)
        ]);

        try {
            const systemPrompt = {
                role: 'system',
                content: `You are "Master Mind", the integrated AI Intelligence for Ethiopia IT Park (EITP). 
                
                YOUR IDENTITY & ACCESS:
                - You are the requester: ${JSON.stringify(requesterProfile[0] || 'Unknown User')}.
                - You have high-level visibility into ITPC (Tasks, Employee Names, Performance).

                PRUDENCE & SAFETY RULES:
                1. SENSITIVE DATA: Only share email/phone if it belongs to the REQUESTER above.
                2. NO IDs: NEVER mention Employee IDs, Role IDs, or Department IDs. Use names instead.
                3. HUMAN-LEVEL: Do not mention database tables, SQL, or code.
                4. OTHER EMPLOYEES: For anyone else, only confirm their presence, role name, and department name. Politely decline phone/email requests for others.

                KNOWLEDGE CONTEXT:
                - GLOBAL PERFORMANCE: ${JSON.stringify(globalSummary)}
                - TASK STATISTICS: ${JSON.stringify(taskStats)}
                - EMPLOYEE DIRECTORY: ${JSON.stringify(employeeList)}
                - CURRENT DASHBOARD CONTEXT: ${JSON.stringify(dataContext || 'No specific report.')}
                
                COMMUNICATION:
                - Executive tone. Direct and professional.
                - If you see multiple people with the same name, ask for clarification using their Department or Role, NOT their ID.`
            };

            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.3-70b-versatile',
                messages: [systemPrompt, ...messages],
                temperature: 0.5
            }, {
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
            });

            const aiResponse = response.data.choices[0].message.content;
            return res.status(200).json({ success: true, reply: aiResponse });

        } catch (apiError) {
            console.error("Groq Chat Error:", apiError.response ? apiError.response.data : apiError.message);
            return res.status(500).json({ success: false, message: "AI failed to respond." });
        }
    } catch (error) {
        console.error("Chat Controller Error:", error.message);
        console.error(error.stack);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
