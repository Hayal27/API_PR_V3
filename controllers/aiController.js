const db = require('../models/db');
const axios = require('axios');
const { promisify } = require('util');
const dbQuery = promisify(db.query).bind(db);

// Supported active Groq models in prioritized fallback order (verified working models)
const CANDIDATE_MODELS = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b'
];

// Contextual intelligent fallback generator when external LLM is temporarily unreachable
function generateIntelligentFallbackReply(userQuestion, userProfile, data, allowedMenus = []) {
    const q = (userQuestion || '').toLowerCase();
    const isAmharic = /[\u1200-\u137F]/.test(userQuestion || '');
    const isBilingual = /both|ሁለቱም|በሁለቱም|amharic and english|english and amharic/i.test(userQuestion || '');
    const name = userProfile ? (userProfile.fname || userProfile.user_name || 'Team Member') : 'Team Member';
    const roleName = userProfile?.role_name || 'Staff Member';
    const roleTier = data.roleTier || (userProfile?.role_name?.toLowerCase().includes('admin') ? 'global' : 'staff');
    const { myReceivedTasks = [], myDailyTasks = [], mySentTasks = [], myPlans = [], subordinatesList = [] } = data;

    // ── ROLE & PERMISSION GUARD (STRICT ROLE RESTRICTION) ─────────────────────
    const isAskingAdmin = q.includes('admin') || q.includes('user management') || q.includes('delete user') || 
                         q.includes('org structure') || q.includes('settings') || q.includes('logs') || 
                         q.includes('audit') || q.includes('permission') || q.includes('አስተዳዳሪ') || 
                         q.includes('ተጠቃሚ') || q.includes('መዋቅር') || q.includes('ሴቲንግ');

    if (isAskingAdmin && roleTier !== 'global') {
        const amharicAdmin = `⚠️ **የፈቃድ ገደብ ማሳሰቢያ (Permission Notice)**

ይቅርታ **${name}**፣ የተጠቃሚዎች አስተዳደር፣ ሲስተም ሴቲንግ፣ የክትትል ሎግ እና የተቋም መዋቅር ለስርዓት አስተዳዳሪዎች (**Administrators**) ብቻ የተፈቀዱ ናቸው። የእርስዎ የስራ ድርሻ ይህንን መረጃ የማግኘት ፈቃድ የለውም።

የእርስዎ የአሁን ሚና **${roleName}** ሲሆን፣ የሚከተሉትን የተፈቀዱ ተግባራት ማከናወን ይችላሉ፡
- 📋 ስትራቴጂክ ዕቅዶችን ማዘጋጀትና ማቅረብ፡ **[አዲስ ዕቅድ ማዘጋጃ / Add Strategic Plan](/plan/PlanSteps/Add)**
- 📑 ያቀረቧቸውን ዕቅዶች መከታተል፡ **[ያቀረብኳቸው ዕቅዶች / My Submitted Plans](/plan/View_myplan)**
- 📥 የተሰጡዎትን ተግባራት መከታተል፡ **[የተሰጡኝ ተግባራት / Received Tasks](/tasks/assignment/received)**
- 📅 የዕለት ተዕለት ተግባራትን መመዝገብ፡ **[የዕለት ተግባራት / Daily Planner](/tasks/daily)**
- 📊 የስራ አፈጻጸም ሪፖርት ማቅረብ፡ **[ሪፖርት ማቅረቢያ / Submit Report](/report/Add)**`;

        const englishAdmin = `⚠️ **Access Control Notice**

Hello **${name}**, system administration, user account management, audit logs, and organizational structure settings are restricted to **System Administrators**. Your current role does not have permission to view or manage this administrative data.

As a **${roleName}**, you are authorized to access:
- 📋 Formulate & Submit Plans: **[Add Strategic Plan](/plan/PlanSteps/Add)**
- 📑 Track Submission Status: **[My Submitted Plans](/plan/View_myplan)**
- 📥 Execute Assigned Tasks: **[Received Tasks](/tasks/assignment/received)**
- 📅 Log Daily Agenda: **[Daily Planner](/tasks/daily)**
- 📊 Submit Progress Reports: **[Submit Report](/report/Add)**`;

        if (isBilingual) return `${amharicAdmin}\n\n---\n\n${englishAdmin}`;
        if (isAmharic) return amharicAdmin;
        return englishAdmin;
    }

    const isAskingApproval = q.includes('approve') || q.includes('hierarchy approval') || q.includes('subordinate') || q.includes('ማጽደቅ') || q.includes('የበታች');
    if (isAskingApproval && roleTier === 'staff') {
        const amharicApproval = `⚠️ **የፈቃድ ገደብ ማሳሰቢያ (Permission Notice)**

ይቅርታ **${name}**፣ የዕቅድ እና የስራ አፈጻጸም ማጽደቅ እንዲሁም የበታች ሰራተኞች ክትትል ተግባራት ለኃላፊዎች (**Supervisors & Directors**) ብቻ የተፈቀዱ ናቸው።

የእርስዎ ሚና **${roleName}** በመሆኑ የራስዎን ዕቅድ ማዘጋጀትና ለኃላፊዎ ማቅረብ ይችላሉ፡
- 🚀 አዲስ ዕቅድ ለማቅረብ፡ **[አዲስ ዕቅድ ማዘጋጃ / Add Strategic Plan](/plan/PlanSteps/Add)**
- 📑 ያቀረቡትን ዕቅድ ሁኔታ ለመከታተል፡ **[ያቀረብኳቸው ዕቅዶች / My Submitted Plans](/plan/View_myplan)**
- 📥 የተሰጡዎትን ተግባራት ለማከናወን፡ **[የተሰጡኝ ተግባራት / Received Tasks](/tasks/assignment/received)**`;

        const englishApproval = `⚠️ **Access Control Notice**

Hello **${name}**, plan approval workflows and subordinate tracking are restricted to designated **Supervisors and Directors**.

As a **${roleName}**, you can formulate your plans and submit them for review:
- 🚀 Formulate a New Plan: **[Add Strategic Plan](/plan/PlanSteps/Add)**
- 📑 Track Submission Status: **[My Submitted Plans](/plan/View_myplan)**
- 📥 Execute Assigned Tasks: **[Received Tasks](/tasks/assignment/received)**`;

        if (isBilingual) return `${amharicApproval}\n\n---\n\n${englishApproval}`;
        if (isAmharic) return amharicApproval;
        return englishApproval;
    }

    // ── 1. STRATEGIC PLANNING ────────────────────────────────────────────────
    if (q.includes('plan') || q.includes('create') || q.includes('objective') || q.includes('kpi') || q.includes('goal') || q.includes('step') || q.includes('ዕቅድ') || q.includes('ግቦች') || q.includes('ማዘጋጀት')) {
        const amharicContent = `### 📋 በስርዓቱ ውስጥ አዲስ ስትራቴጂክ ዕቅድ እንዴት ማዘጋጀት እንደሚቻል (Step-by-Step Guide)

በኢትዮጵያ አይቲ ፓርክ የዕቅድ እና ሪፖርት ማኔጅመንት ስርዓት ውስጥ ስትራቴጂክ ዕቅድ ለማዘጋጀት የሚከተሉትን 5 ደረጃዎች በቅደም ተከተል ይከተሉ፡

---

#### 1️⃣ **ደረጃ 1፡ የዕቅድ ማዘጋጃውን ይክፈቱ (Open Planning Wizard)**
- በቀጥታ ወደ ዕቅድ ማዘጋጃ ቅጽ ይሂዱ፡ **[አዲስ ዕቅድ ማዘጋጃ / Add Strategic Plan](/plan/PlanSteps/Add)**

#### 2️⃣ **ደረጃ 2፡ የስትራቴጂክ ዓላማን ይምረጡ (Select Strategic Goal)**
- ከተቆልቋዩ ዝርዝር ውስጥ የተቋሙን 5 ዓመት ምሰሶ (Pillar) እና ዓመታዊ ግብ (Goal) ይምረጡ።

#### 3️⃣ **ደረጃ 3፡ ዋና ዋና ግቦችን ይግለጹ (Define Objectives & Specific Objectives)**
- የክፍልዎን ወይም የዳይሬክቶሬትዎን ዋና ዓላማዎች እና ዝርዝር ንዑስ ግቦች ያስገቡ።

#### 4️⃣ **ደረጃ 4፡ ቁልፍ የአፈጻጸም አመልካቾችን (KPIs) ይሙሉ**
- መነሻ እሴት (Baseline) እና የዒላማ እሴት (Target Value) ያስገቡ።
- የክብደት ድርሻ (Weight) ድምር 100% መሆኑን ያረጋግጡ።
- የሩብ ዓመት (Q1, Q2, Q3, Q4) ክፍፍሎችን ይምረጡ።

#### 5️⃣ **ደረጃ 5፡ ያረጋግጡ እና ያቅርቡ (Submit for Approval)**
- መረጃውን ከመረመሩ በኋላ **Submit** የሚለውን ይጫኑ። ዕቅዱ ወደ ኃላፊዎ እንዲፀድቅ ይላካል።
- ሁኔታውን በማንኛውም ጊዜ እዚህ መከታተል ይችላሉ፡ **[ያቀረብኳቸው ዕቅዶች / My Submitted Plans](/plan/View_myplan)**

> 💡 **ምክር / Pro Tip:** ዕቅዱን ከማቅረብዎ በፊት የተቋሙን ስትራቴጂክ ዕቅዶች በ**[የተቋሙ ስትራቴጂክ ዕቅዶች / Organization Plans](/plan/ViewOrgPlan)** ላይ በመመልከት ከድርጅቱ ግቦች ጋር መጣጣሙን ያረጋግጡ።

---

### 🔗 ቀጥታ ማስፈንጠሪያዎች (Quick Navigation Links):
- 🚀 **[አዲስ ዕቅድ ማዘጋጃ / Add Strategic Plan](/plan/PlanSteps/Add)**
- 📑 **[ያቀረብኳቸው ዕቅዶች / My Submitted Plans](/plan/View_myplan)**
- 🏢 **[የተቋሙ ስትራቴጂክ ዕቅዶች / Organization Plans](/plan/ViewOrgPlan)**
${roleTier !== 'staff' ? '- ⚖️ **[የግቦችና የሩብ ዓመታት ቅንብር / Goal Config](/goal-config)**\n- 🧩 **[የተግባራት ክፍፍል / Action Plan Breakdown](/plan/action-plan-breakdown)**' : ''}`;

        const englishContent = `### 📋 Step-by-Step Guide: How to Create a Plan in This System

To create and submit an institutional plan in the Ethiopian IT Park Management System, follow these 5 core steps in the user interface:

---

#### 1️⃣ **Step 1: Launch the Planning Wizard**
- Open the plan formulation wizard directly: **[Add Strategic Plan](/plan/PlanSteps/Add)**

#### 2️⃣ **Step 2: Select Corporate Pillar & Goal**
- Select the 5-year corporate pillar and target annual corporate goal from the dropdown menu.

#### 3️⃣ **Step 3: Formulate Objectives & Specific Objectives**
- Define your department's core Objective, then break it down into Specific Objectives.

#### 4️⃣ **Step 4: Define Measurable KPIs & Quantitative Targets**
- Enter baseline value (starting point) and target outcome.
- Ensure total KPI weights balance to **100%**.
- Select the active quarters (Q1, Q2, Q3, Q4).

#### 5️⃣ **Step 5: Review & Submit for Approval**
- Verify all entries and click **Submit**. Your plan will route for supervisory review.
- Monitor review status anytime in **[My Submitted Plans](/plan/View_myplan)**.

> 💡 **Pro Tip:** Before submitting, inspect overarching institutional targets in **[Organization Strategic Plans](/plan/ViewOrgPlan)** to ensure strategic alignment.

---

### 🔗 Quick Navigation Links:
- 🚀 **[Add Strategic Plan Wizard](/plan/PlanSteps/Add)**
- 📑 **[My Submitted Plans](/plan/View_myplan)**
- 🏢 **[Organization Strategic Plans](/plan/ViewOrgPlan)**
${roleTier !== 'staff' ? '- 🧩 **[Action Plan Breakdown](/plan/action-plan-breakdown)**\n- ⚖️ **[Goal & KPI Config](/goal-config)**' : ''}`;

        if (isBilingual) return `${amharicContent}\n\n---\n\n${englishContent}`;
        if (isAmharic) return amharicContent;
        return englishContent;
    }

    // ── 2. TASKS & DAILY AGENDA ──────────────────────────────────────────────
    if (q.includes('task') || q.includes('assign') || q.includes('delegate') || q.includes('received') || q.includes('daily') || q.includes('ተግባር') || q.includes('ስራ') || q.includes('ዕለታዊ')) {
        const amharicTasks = `### ⚡ የተግባራት እና የዕለት ስራዎች ማኔጅመንት (Task Operations)

በስርዓቱ ውስጥ ተግባራትን ለመከታተል፣ ለመፈፀም እና ለማስተዳደር የሚከተሉትን ደረጃዎች ይጠቀሙ፡

1. **የተሰጡዎትን ተግባራት መፈፀም (Execute Received Tasks):**
   - ወደ **[የተሰጡኝ ተግባራት / Received Tasks](/tasks/assignment/received)** በመሄድ የተሰጡዎትን ስራዎች ይመልከቱ።
   - የስራውን ሁኔታ (\`በሂደት ላይ / in_progress\`፣ \`ተጠናቋል / completed\`) ያዘምኑ እና ማስረጃዎችን ያያይዙ።
2. **የዕለት ተዕለት ተግባራትን ማቀድ (Daily Planner):**
   - በ**[የዕለት ተግባራት / Daily Planner](/tasks/daily)** የዛሬውን የስራ ሰዓት እና ዝርዝር ተግባራት ይመዝግቡ።
${roleTier !== 'staff' ? `3. **ለቡድን አባላት ስራ ማስተላለፍ (Delegate Tasks):**\n   - በ**[አዲስ ተግባር ማስተላለፊያ / Assign New Task](/tasks/assignment/assign)** ለሰራተኞች ስራዎችን ከማጠናቀቂያ ቀን ጋር ይመድቡ።\n   - የተላለፉ ተግባራትን በ**[የተላለፉ ተግባራት / Sent Tasks Tracking](/tasks/assignment/sent)** ይከታተሉ።` : ''}

---

### 🔗 ቀጥታ ማስፈንጠሪያዎች (Quick Links):
- 📥 **[የተሰጡኝ ተግባራት / Received Tasks](/tasks/assignment/received)**
- 📅 **[የዕለት ተግባራት / Daily Planner](/tasks/daily)**
${roleTier !== 'staff' ? '- 📤 **[አዲስ ተግባር ማስተላለፊያ / Assign New Task](/tasks/assignment/assign)**\n- 📊 **[የተላለፉ ተግባራት ክትትል / Sent Tasks](/tasks/assignment/sent)**' : ''}`;

        const englishTasks = `### ⚡ Task Operations & Workload Workflow

Here is how to manage, execute, and track operational tasks across the system:

1. **Executing Tasks Assigned to You:**
   - Open **[Received Tasks](/tasks/assignment/received)** to inspect assignments delegated to you.
   - Update your progress status (\`in_progress\`, \`completed\`) and attach verification evidence.
2. **Managing Your Daily Schedule:**
   - Open **[Daily Planner](/tasks/daily)** to schedule your day with time blocks, priorities, and hourly routines.
${roleTier !== 'staff' ? `3. **Delegating Tasks to Team Members:**\n   - Open **[Assign New Task](/tasks/assignment/assign)** to delegate deliverables with due dates.\n   - Review submissions and verify completions in **[Sent Tasks Tracking](/tasks/assignment/sent)**.` : ''}

---

### 🔗 Quick Links:
- 📥 **[Received Tasks](/tasks/assignment/received)**
- 📅 **[Daily Planner](/tasks/daily)**
${roleTier !== 'staff' ? '- 📤 **[Assign New Task](/tasks/assignment/assign)**\n- 📊 **[Sent Tasks Tracking](/tasks/assignment/sent)**' : ''}`;

        if (isBilingual) return `${amharicTasks}\n\n---\n\n${englishTasks}`;
        if (isAmharic) return amharicTasks;
        return englishTasks;
    }

    // ── 3. REPORTS ───────────────────────────────────────────────────────────
    if (q.includes('report') || q.includes('analytic') || q.includes('performance') || q.includes('ሪፖርት') || q.includes('አፈጻጸም')) {
        const amharicReports = `### 📊 የስራ አፈጻጸም ሪፖርት ማቅረቢያ መመሪያ (Reporting Guide)

1. **ወቅታዊ የስራ አፈጻጸም ሪፖርት ማቅረብ:**
   - ወደ **[ሪፖርት ማቅረቢያ / Submit Report](/report/Add)** ይሂዱ።
   - የጸደቀውን ቁልፍ የአፈጻጸም አመልካች (KPI) ይምረጡ።
   - በእቅዱ መሰረት የተከናወነውን ትክክለኛ ውጤት እና የማረጋገጫ ሰነዶችን አያይዘው ያቅርቡ።
2. **ያቀረቧቸውን ሪፖርቶች መከታተል:**
   - ያለፉ ሪፖርቶችን ሁኔታ በ**[ያቀረብኳቸው ሪፖርቶች / My Reports](/report/View_myreport)** ይከታተሉ።

---

### 🔗 ቀጥታ ማስፈንጠሪያዎች (Quick Links):
- 📝 **[ሪፖርት ማቅረቢያ / Submit Report](/report/Add)**
- 📂 **[ያቀረብኳቸው ሪፖርቶች / My Reports](/report/View_myreport)**
${roleTier === 'global' ? '- 💼 **[የአመራር ሪፖርቶች / Executive Reports](/reports/executive)**\n- 💾 **[ዳታ ኤክስፖርት / Export Data](/reports/export)**' : ''}`;

        const englishReports = `### 📊 Performance Reporting Guide

1. **Submitting Progress Reports:**
   - Navigate to: **[Submit Report](/report/Add)**
   - Select your approved Specific Objective Detail (KPI).
   - Enter actual achieved progress against planned targets and attach supporting verification files.
2. **Tracking Submitted Reports:**
   - View past submissions and approval states in: **[My Reports](/report/View_myreport)**

---

### 🔗 Quick Links:
- 📝 **[Submit Report](/report/Add)**
- 📂 **[My Reports](/report/View_myreport)**
${roleTier === 'global' ? '- 💼 **[Executive Reports](/reports/executive)**\n- 💾 **[Export Data](/reports/export)**' : ''}`;

        if (isBilingual) return `${amharicReports}\n\n---\n\n${englishReports}`;
        if (isAmharic) return amharicReports;
        return englishReports;
    }

    // ── 4. GENERAL WELCOME ───────────────────────────────────────────────────
    if (isAmharic) {
        return `ሰላም **${name}**! እኔ Master Mind የኢትዮጵያ አይቲ ፓርክ አስተዋይ የ AI ኦፕሬቲንግ ረዳት ነኝ።

የእርስዎ ሚና **${roleName}** ሲሆን፣ በስርዓቱ ውስጥ የተፈቀዱትን የሚከተሉትን ዋና ዋና ተግባራት ማከናወን ይችላሉ፡
- 📋 **ስትራቴጂክ ዕቅድ ለማዘጋጀት**፡ **[አዲስ ዕቅድ ማዘጋጃ / Add Strategic Plan](/plan/PlanSteps/Add)**
- 📥 **የተሰጡዎትን ተግባራት ለመመልከት**፡ **[የተሰጡኝ ተግባራት / Received Tasks](/tasks/assignment/received)**
- 📅 **የዕለት ስራዎችን ለመመዝገብ**፡ **[የዕለት ተግባራት / Daily Planner](/tasks/daily)**
- 📊 **አፈጻጸም ሪፖርት ለማቅረብ**፡ **[ሪፖርት ማቅረቢያ / Submit Report](/report/Add)**

እባክዎ ስለ ዕቅድ፣ ተግባራት፣ ወይም አጠቃላይ የስርዓቱ አጠቃቀም ማንኛውንም ጥያቄ ይጠይቁኝ!`;
    }
    return `Hello **${name}**! I am Master Mind, your Ethiopian IT Park AI Operating Assistant.

Your authenticated role is **${roleName}**. Here are the primary workflows available to you:
- 📋 **Formulate Strategic Plans**: **[Add Strategic Plan](/plan/PlanSteps/Add)**
- 📥 **Manage Received Tasks**: **[Received Tasks](/tasks/assignment/received)**
- 📅 **Log Daily Agenda**: **[Daily Planner](/tasks/daily)**
- 📊 **Submit Progress Reports**: **[Submit Report](/report/Add)**

Feel free to ask me for step-by-step guidance on how to navigate the portal, manage your tasks, or submit updates!`;
}

// Strict Zero Backend Exposure Detector
function isLeakingBackendInfo(text) {
    if (!text || typeof text !== 'string') return false;
    const lower = text.toLowerCase();

    // 1. Controller and backend JS filenames
    if (/(\b\w+controller(\.js)?|\bcontroller\s*:\s*\w+|\b[\w-]+\.js\b)/i.test(text)) return true;

    // 2. REST API endpoints, HTTP verbs & routes
    if (/(\/api\/|api\s*endpoint|backend\s*api|curl\s+|http\s*(get|post|put|delete))/i.test(text)) return true;
    if (/\b(post|get|put|delete|patch)\s+\/[a-z0-9_-]+/i.test(text)) return true;

    // 3. Technical payloads, database tables, schema, cURL, or error codes
    if (lower.includes('approvalworkflow') || lower.includes('specific_objective_details') || lower.includes('database table') || lower.includes('db schema') || lower.includes('db table') || lower.includes('database schema')) return true;
    if (lower.includes('curl command') || lower.includes('key payload') || lower.includes('typical payload') || lower.includes('request payload')) return true;
    if (lower.includes('backend apis') || lower.includes('backend controller') || lower.includes('cheat‑sheet (endpoints)') || lower.includes('cheat-sheet (endpoints)')) return true;
    if (lower.includes('400 bad request') || lower.includes('422 unprocessable') || lower.includes('500 internal')) return true;

    // 4. Code / JSON structures representing APIs
    if (/\{\s*"(name|title|goal_id|pillar_id|objective_id)"\s*:/i.test(text)) return true;

    return false;
}

// Helper to call Groq with automatic model fallback
async function callGroqWithFallback(payload, apiKey) {
    let lastError = null;
    for (const model of CANDIDATE_MODELS) {
        try {
            const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                ...payload,
                model
            }, {
                headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
                timeout: 25000
            });
            if (res.data?.choices?.[0]?.message?.content) {
                return res.data;
            }
        } catch (err) {
            console.warn(`Groq model ${model} failed:`, err.response ? (err.response.data?.error?.message || err.response.status) : err.message);
            lastError = err;
        }
    }
    throw lastError || new Error("All candidate AI models failed to respond.");
}

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
        let globalSummary = [];
        try {
            globalSummary = await dbQuery(`
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
        } catch (e) {
            console.warn("Notice fetching global summary:", e.message);
        }

        try {
            const groqRes = await callGroqWithFallback({
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
            }, apiKey);

            const aiContent = JSON.parse(groqRes.choices[0].message.content);
            return res.status(200).json({ success: true, insights: aiContent });

        } catch (apiError) {
            console.error("Groq API Error in generateInsights:", apiError.message);
            return res.status(500).json({ success: false, message: "Failed to generate AI insights." });
        }
    } catch (error) {
        console.error("GenerateInsights Error:", error.message);
        res.status(500).json({ success: false, message: "Server error during AI generation." });
    }
};

// Enables interactive chat with the AI about specific reports, real-time tasks, controls, and system data
exports.chatWithAI = async (req, res) => {
    try {
        const { messages, dataContext } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ success: false, message: "Invalid chat history." });
        }

        const userId = req.user_id || req.user?.user_id || req.body?.user_id;

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

        // 1. Fetch authenticated user profile & organizational placement
        let userProfile = null;
        let roleTier = 'staff'; // 'global', 'supervisor', 'staff'
        let isGlobal = false;
        let isSupervisor = false;
        let subordinateEmpIds = new Set();
        let subordinatesList = [];
        let subordinateTasks = [];
        let subordinateDailyTasks = [];

        // Personal tasks and schedule
        let myDailyTasks = [];
        let myReceivedTasks = [];
        let mySentTasks = [];
        let myMeetings = [];
        let myPlans = [];

        // Global stats (for admin/ceo or general context)
        let orgTaskStats = [];
        let globalSummary = [];

        if (userId) {
            try {
                const userRows = await dbQuery(`
                    SELECT 
                        u.user_id, u.user_name, u.employee_id, u.role_id, 
                        LOWER(COALESCE(r.role_name, '')) as role_name,
                        r.hierarchy_level,
                        e.fname, e.lname, e.email, e.phone, e.position,
                        d.department_id, d.name as department_name,
                        e.supervisor_id,
                        (SELECT CONCAT(s.fname, ' ', s.lname) FROM employees s WHERE s.employee_id = e.supervisor_id) as supervisor_name
                    FROM users u
                    LEFT JOIN employees e ON u.employee_id = e.employee_id
                    LEFT JOIN roles r ON u.role_id = r.role_id
                    LEFT JOIN departments d ON e.department_id = d.department_id
                    WHERE u.user_id = ?
                `, [userId]);

                if (userRows.length > 0) {
                    userProfile = userRows[0];
                    const roleId = Number(userProfile.role_id) || 0;
                    const hLevel = Number(userProfile.hierarchy_level) || 99;
                    const rName = userProfile.role_name || '';
                    const myEmpId = userProfile.employee_id;

                    // Determine Tier:
                    // Global (Admin / CEO / Executive)
                    isGlobal = [1, 2, 3, 9, 29, 33].includes(roleId) ||
                        hLevel <= 3 ||
                        rName.includes('ceo') ||
                        rName.includes('admin') ||
                        rName.includes('deputy') ||
                        rName.includes('executive') ||
                        rName.includes('director general');

                    // Check if Supervisor (Head / Director / Manager / Lead / has direct reports)
                    isSupervisor = isGlobal ||
                        rName.includes('head') ||
                        rName.includes('director') ||
                        rName.includes('manager') ||
                        rName.includes('supervisor') ||
                        rName.includes('lead');

                    // 2. Resolve Subordinates via Hierarchical Reporting & Organization Structure
                    if (myEmpId) {
                        try {
                            const [allEmps, allPositions, allNodes] = await Promise.all([
                                dbQuery('SELECT employee_id, supervisor_id, department_id, fname, lname, position, email, phone FROM employees'),
                                dbQuery('SELECT employee_id, org_node_id FROM employee_positions').catch(() => []),
                                dbQuery('SELECT id, parent_id, name FROM organization_structure').catch(() => [])
                            ]);

                            // BFS 1: Supervisor reporting chain downwards
                            const queueEmps = [myEmpId];
                            const visitedEmps = new Set([myEmpId]);
                            while (queueEmps.length > 0) {
                                const cur = queueEmps.shift();
                                (allEmps || []).filter(e => e.supervisor_id === cur && e.employee_id !== cur).forEach(e => {
                                    if (!visitedEmps.has(e.employee_id)) {
                                        visitedEmps.add(e.employee_id);
                                        subordinateEmpIds.add(e.employee_id);
                                        queueEmps.push(e.employee_id);
                                    }
                                });
                            }

                            // BFS 2: Organization structure sub-tree
                            const myHeldNodes = (allPositions || [])
                                .filter(p => p.employee_id === myEmpId)
                                .map(p => p.org_node_id)
                                .concat((allEmps || []).filter(e => e.employee_id === myEmpId).map(e => e.department_id))
                                .filter(Boolean);

                            if (myHeldNodes.length > 0) {
                                const descendantNodes = new Set();
                                const queueNodes = [...myHeldNodes];
                                while (queueNodes.length > 0) {
                                    const nodeId = queueNodes.shift();
                                    (allNodes || []).filter(n => n.parent_id === nodeId).forEach(child => {
                                        if (!descendantNodes.has(child.id)) {
                                            descendantNodes.add(child.id);
                                            queueNodes.push(child.id);
                                        }
                                    });
                                }

                                (allPositions || [])
                                    .filter(p => (descendantNodes.has(p.org_node_id) || myHeldNodes.includes(p.org_node_id)) && p.employee_id !== myEmpId)
                                    .forEach(p => subordinateEmpIds.add(p.employee_id));

                                (allEmps || [])
                                    .filter(e => (descendantNodes.has(e.department_id) || myHeldNodes.includes(e.department_id)) && e.employee_id !== myEmpId)
                                    .forEach(e => subordinateEmpIds.add(e.employee_id));
                            }

                            if (subordinateEmpIds.size > 0) {
                                isSupervisor = true;
                            }
                        } catch (subErr) {
                            console.warn("Subordinate hierarchy resolution notice:", subErr.message);
                        }
                    }

                    if (isGlobal) {
                        roleTier = 'global';
                    } else if (isSupervisor) {
                        roleTier = 'supervisor';
                    } else {
                        roleTier = 'staff';
                    }

                    // 3. Fetch Personal Real-Time Tasks, Schedule, and Records
                    const [dailyTasksRes, receivedTasksRes, sentTasksRes, meetingsRes, plansRes] = await Promise.all([
                        // Personal daily tasks (Today & recent)
                        dbQuery(`
                            SELECT daily_task_id, title, description, priority, status, 
                                   DATE_FORMAT(task_date, '%Y-%m-%d') as task_date,
                                   start_time, end_time, category, notes
                            FROM daily_tasks
                            WHERE user_id = ?
                            ORDER BY task_date DESC, created_at DESC
                            LIMIT 15
                        `, [userId]).catch(() => []),

                        // Tasks assigned to current user (Received)
                        dbQuery(`
                            SELECT 
                                ta.assignment_id, ta.title, ta.description, ta.priority, ta.status, 
                                DATE_FORMAT(ta.due_date, '%Y-%m-%d') as due_date,
                                ta.category,
                                CONCAT(COALESCE(e_by.fname, u_by.user_name), ' ', COALESCE(e_by.lname, '')) as assigned_by_name,
                                r_by.role_name as assigned_by_role,
                                d_by.name as assigned_by_department
                            FROM task_assignments ta
                            LEFT JOIN users u_by ON ta.assigned_by = u_by.user_id
                            LEFT JOIN employees e_by ON u_by.employee_id = e_by.employee_id
                            LEFT JOIN roles r_by ON u_by.role_id = r_by.role_id
                            LEFT JOIN departments d_by ON e_by.department_id = d_by.department_id
                            WHERE ta.assigned_to = ?
                            ORDER BY 
                                CASE WHEN ta.status IN ('pending', 'in_progress') THEN 0 ELSE 1 END,
                                ta.due_date ASC,
                                ta.created_at DESC
                            LIMIT 20
                        `, [userId]).catch(() => []),

                        // Tasks assigned by current user (Delegated/Sent)
                        dbQuery(`
                            SELECT 
                                ta.assignment_id, ta.title, ta.priority, ta.status, 
                                DATE_FORMAT(ta.due_date, '%Y-%m-%d') as due_date,
                                ta.category,
                                CONCAT(COALESCE(e_to.fname, u_to.user_name), ' ', COALESCE(e_to.lname, '')) as assigned_to_name,
                                r_to.role_name as assigned_to_role
                            FROM task_assignments ta
                            LEFT JOIN users u_to ON ta.assigned_to = u_to.user_id
                            LEFT JOIN employees e_to ON u_to.employee_id = e_to.employee_id
                            LEFT JOIN roles r_to ON u_to.role_id = r_to.role_id
                            WHERE ta.assigned_by = ?
                            ORDER BY ta.created_at DESC
                            LIMIT 15
                        `, [userId]).catch(() => []),

                        // Upcoming and scheduled meetings
                        dbQuery(`
                            SELECT 
                                m.meeting_id, m.title, m.meeting_type, 
                                DATE_FORMAT(m.start_time, '%Y-%m-%d %H:%i') as start_time,
                                DATE_FORMAT(m.end_time, '%Y-%m-%d %H:%i') as end_time,
                                m.location, m.meeting_link, m.status, m.priority, m.agenda
                            FROM meetings m
                            LEFT JOIN meeting_participants mp ON m.meeting_id = mp.meeting_id
                            WHERE (m.created_by = ? OR mp.user_id = ?) AND m.status != 'cancelled'
                            GROUP BY m.meeting_id
                            ORDER BY m.start_time DESC
                            LIMIT 8
                        `, [userId, userId]).catch(() => []),

                        // Submitted plans
                        dbQuery(`
                            SELECT p.plan_id, sod.specific_objective_name, p.status as plan_status,
                                   DATE_FORMAT(p.created_at, '%Y-%m-%d') as created_date
                            FROM plans p
                            JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
                            WHERE p.user_id = ?
                            ORDER BY p.created_at DESC LIMIT 5
                        `, [userId]).catch(() => [])
                    ]);

                    myDailyTasks = dailyTasksRes || [];
                    myReceivedTasks = receivedTasksRes || [];
                    mySentTasks = sentTasksRes || [];
                    myMeetings = meetingsRes || [];
                    myPlans = plansRes || [];

                    // 4. If Supervisor or Global, fetch Subordinate details & live tasks
                    if ((isSupervisor || isGlobal) && subordinateEmpIds.size > 0) {
                        try {
                            const subEmpArray = Array.from(subordinateEmpIds);
                            const subUsers = await dbQuery(`
                                SELECT 
                                    u.user_id, u.user_name, e.employee_id,
                                    CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as name,
                                    e.email, e.phone, e.position,
                                    COALESCE(d.name, 'General Directorate') as department_name,
                                    (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = u.user_id AND status = 'pending') as pending_count,
                                    (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = u.user_id AND status = 'in_progress') as in_progress_count,
                                    (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = u.user_id AND status = 'completed') as completed_count
                                FROM users u
                                JOIN employees e ON u.employee_id = e.employee_id
                                LEFT JOIN departments d ON e.department_id = d.department_id
                                WHERE e.employee_id IN (?)
                                ORDER BY e.fname ASC
                            `, [subEmpArray]).catch(() => []);

                            subordinatesList = subUsers || [];
                            const subUserIds = subordinatesList.map(su => su.user_id).filter(Boolean);

                            if (subUserIds.length > 0) {
                                const [subTasksRes, subDailyRes] = await Promise.all([
                                    dbQuery(`
                                        SELECT 
                                            ta.assignment_id, ta.title, ta.priority, ta.status, 
                                            DATE_FORMAT(ta.due_date, '%Y-%m-%d') as due_date,
                                            CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as assigned_to_name
                                        FROM task_assignments ta
                                        JOIN users u ON ta.assigned_to = u.user_id
                                        JOIN employees e ON u.employee_id = e.employee_id
                                        WHERE ta.assigned_to IN (?) AND ta.status IN ('pending', 'in_progress')
                                        ORDER BY ta.due_date ASC
                                        LIMIT 25
                                    `, [subUserIds]).catch(() => []),

                                    dbQuery(`
                                        SELECT 
                                            dt.daily_task_id, dt.title, dt.priority, dt.status, 
                                            DATE_FORMAT(dt.task_date, '%Y-%m-%d') as task_date,
                                            CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as employee_name
                                        FROM daily_tasks dt
                                        JOIN users u ON dt.user_id = u.user_id
                                        JOIN employees e ON u.employee_id = e.employee_id
                                        WHERE dt.user_id IN (?)
                                        ORDER BY dt.task_date DESC
                                        LIMIT 15
                                    `, [subUserIds]).catch(() => [])
                                ]);

                                subordinateTasks = subTasksRes || [];
                                subordinateDailyTasks = subDailyRes || [];
                            }
                        } catch (subFetchErr) {
                            console.warn("Notice fetching subordinate details:", subFetchErr.message);
                        }
                    }
                }
            } catch (userErr) {
                console.warn("Notice fetching user context:", userErr.message);
            }
        }

        // 5. Query allowed menu items for this user's specific role for access control
        let allowedMenuItems = [];
        try {
            const roleId = Number(userProfile?.role_id) || 0;
            if (isGlobal || roleId === 1 || roleId === 33) {
                allowedMenuItems = await dbQuery(`
                    SELECT DISTINCT mi.name, mi.path, mi.icon
                    FROM menu_items mi
                    WHERE mi.is_active = 1 AND mi.path IS NOT NULL AND mi.path != '' AND mi.path != '#'
                    ORDER BY mi.sort_order ASC, mi.id ASC
                `);
            } else {
                allowedMenuItems = await dbQuery(`
                    SELECT DISTINCT mi.name, mi.path, mi.icon
                    FROM menu_items mi
                    JOIN role_permissions rp ON mi.id = rp.menu_item_id
                    WHERE rp.role_id = ? AND rp.can_view = 1 AND mi.is_active = 1
                      AND mi.path IS NOT NULL AND mi.path != '' AND mi.path != '#'
                    ORDER BY mi.sort_order ASC, mi.id ASC
                `, [roleId]);
            }
        } catch (menuErr) {
            console.warn("Notice fetching user allowed menus:", menuErr.message);
        }

        // Standard bilingual mapping for application routes
        const MENU_BILINGUAL_MAP = {
            '/': 'ዳሽቦርድ / Dashboard',
            '/plan/PlanSteps/Add': 'አዲስ ዕቅድ ማዘጋጃ / Add Strategic Plan',
            '/plan/View_myplan': 'ያቀረብኳቸው ዕቅዶች / My Submitted Plans',
            '/Stategy-plan/View': 'የስትራቴጂክ ዕቅዶች ዳሽቦርድ / Strategy Plans Overview',
            '/plan/ViewOrgPlan': 'የተቋሙ ስትራቴጂክ ዕቅዶች / Organization Plans',
            '/plan/hierarchy-approvals': 'የዕቅድ ማጽደቂያ / Hierarchy Plan Approvals',
            '/plan/action-plan-breakdown': 'የተግባራት ክፍፍል / Action Plan Breakdown',
            '/plan-pillars': 'የስትራቴጂክ ምሰሶዎች / Plan Pillars',
            '/goal-config': 'የግቦችና ሩብ ዓመታት ቅንብር / Goal Configuration',
            '/tasks/daily': 'የዕለት ተግባራት / Daily Planner',
            '/tasks/assignment/received': 'የተሰጡኝ ተግባራት / Received Tasks',
            '/tasks/management': 'የስራ ተግባራቴ / My Tasks',
            '/staff/tasks': 'የስራ ተግባራቴ / My Tasks',
            '/tasks/assignment/assign': 'አዲስ ተግባር ማስተላለፊያ / Assign New Task',
            '/tasks/assignment/sent': 'የተላለፉ ተግባራት ክትትል / Sent Tasks Tracking',
            '/tasks/assignment/subordinates': 'የቡድን አባላት ስራዎች / Team Subordinates',
            '/kpi/my-assigned': 'የተመደቡ ኬፒአይዎች / KPI Position Assignment',
            '/report/Add': 'ሪፖርት ማቅረቢያ / Submit Report',
            '/report/View_myreport': 'ያቀረብኳቸው ሪፖርቶች / My Reports',
            '/report/overall': 'አጠቃላይ ሪፖርትና AI ትንበያ / Overall Reporting & AI',
            '/reports/executive': 'የአመራር ሪፖርት / Executive Report',
            '/reports/export': 'ዳታ ኤክስፖርት / Export Data',
            '/ProfilePictureUpload': 'የግል መረጃ / Profile',
            '/UserTable': 'የተጠቃሚዎች ዝርዝር / User Management',
            '/EmployeeForm': 'አዲስ ሰራተኛ መመዝገቢያ / Add Employee',
            '/admin/org-structure': 'የተቋም መዋቅር / Organization Structure',
            '/admin/employee-positions': 'የሰራተኞች የስራ መደብ / Employee Positions',
            '/settings': 'ሲስተም ሴቲንግ / Settings',
            '/menu-permissions': 'የፈቃድ አስተዳደር / Menu Permissions',
            '/admin/logs': 'የስርዓቱ ክትትል ሎግ / Audit Trail & Logs'
        };

        const allowedLinksFormatted = (allowedMenuItems.length > 0 ? allowedMenuItems : [
            { name: 'Add Strategic Plan', path: '/plan/PlanSteps/Add' },
            { name: 'My Submitted Plans', path: '/plan/View_myplan' },
            { name: 'Received Tasks', path: '/tasks/assignment/received' },
            { name: 'Daily Planner', path: '/tasks/daily' },
            { name: 'Submit Report', path: '/report/Add' },
            { name: 'My Reports', path: '/report/View_myreport' },
            { name: 'Profile', path: '/ProfilePictureUpload' }
        ]).map(m => {
            const label = MENU_BILINGUAL_MAP[m.path] || m.name;
            return `- [${label}](${m.path})`;
        }).join('\n');

        try {
            // Build the comprehensive knowledge system prompt
            const systemPrompt = {
                role: 'system',
                content: `You are "Master Mind", the executive, user-friendly, and highly intelligent AI Operating Assistant for the Ethiopian IT Park Management System.

====================================================================
AUTHENTICATED USER CONTEXT & ACCESS TIER:
====================================================================
- Full Name: ${userProfile ? `${userProfile.fname || ''} ${userProfile.lname || ''}`.trim() : 'Guest User'}
- Role & Title: ${userProfile?.role_name || 'Team Member'} (${userProfile?.position || 'Staff'})
- Department: ${userProfile?.department_name || 'General Directorate'}
- Supervisor: ${userProfile?.supervisor_name || 'Leadership'}
- Access Tier: ${roleTier.toUpperCase()} (${roleTier === 'global' ? 'Full Corporate & Administrative Visibility' : roleTier === 'supervisor' ? 'Team Leadership & Subordinate Oversight' : 'Self-Service & Individual Workflows'})

====================================================================
STRICT ROLE-BASED ACCESS CONTROL & CONFIDENTIALITY:
====================================================================
The user's permitted UI pages are strictly limited to the following:
${allowedLinksFormatted}

CRITICAL PERMISSION ENFORCEMENT RULES:
1. ONLY reference and provide navigation links to pages that are explicitly in the permitted list above or appropriate for the user's Access Tier (${roleTier}).
2. IF THE USER ASKS ABOUT A PAGE, FEATURE, OR FUNCTION THAT IS RESTRICTED OR NOT PERMITTED FOR THEIR ROLE (such as standard staff asking how to configure organization structure, manage users, modify system settings, access audit logs, or perform supervisor hierarchy approvals):
   - YOU MUST NOT explain the internal steps, features, or details of that restricted page.
   - YOU MUST NOT allow the user to know confidential operational details of restricted administrative or leadership functions.
   - Politely inform the user that their current role (${userProfile?.role_name || 'Staff'}) does not have permission to access that feature, and that it is restricted to System Administrators or Department Supervisors.
   - Immediately redirect and guide the user to their authorized workflows (such as [አዲስ ዕቅድ ማዘጋጃ / Add Strategic Plan](/plan/PlanSteps/Add), [ያቀረብኳቸው ዕቅዶች / My Submitted Plans](/plan/View_myplan), [የተሰጡኝ ተግባራት / Received Tasks](/tasks/assignment/received), [የዕለት ተግባራት / Daily Planner](/tasks/daily), or [ሪፖርት ማቅረቢያ / Submit Report](/report/Add)).

====================================================================
ZERO BACKEND & API EXPOSURE (FRONTEND UI ONLY):
====================================================================
- ABSOLUTELY NEVER mention backend files, JavaScript controllers (e.g. *.js, aiController.js, pillarController.js, etc.).
- ABSOLUTELY NEVER mention raw REST API endpoints (e.g. "POST /api/...", "GET /api/..."), HTTP methods, query params, or status codes.
- ABSOLUTELY NEVER mention database tables (e.g. specific_objective_details, approvalworkflow, users, etc.) or SQL statements.
- ABSOLUTELY NEVER output JSON payloads, request bodies, or cURL commands.
- ALL instructions must strictly describe the user-facing web interface:
  * Name of the sidebar menu or header item to click.
  * Which buttons to click (e.g. "Add Strategic Plan", "Submit", "Filter", "Save").
  * Which dropdowns, form inputs, or modal windows to interact with.
  * Real business logic explained in simple, human terms (e.g. "Make sure your KPI baseline is entered and target weights add up to 100%").

====================================================================
BILINGUAL LANGUAGE RULES (AMHARIC & ENGLISH):
====================================================================
- Understand the user's prompt language and intent:
  1. If the user asks in Amharic (ይህም የአማርኛ ፊደላት ሲኖሩበት):
     * Respond primarily and fluently in Amharic (በአማርኛ).
     * Provide clear, step-by-step guidance using natural Ethiopian professional terminology (e.g. ስትራቴጂክ ዕቅድ፣ ቁልፍ የአፈጻጸም አመልካች / KPI፣ የተሰጡ ተግባራት፣ የዕለት ስራዎች፣ ሪፖርት).
     * Use bilingual button links: [የአማርኛ ስም / English Name](/path) so the user can easily find the button on their screen.
  2. If the user asks in English:
     * Respond in English with clear, structured steps and navigation links [Page Name](/path).
  3. If the user asks for both languages (e.g. "in both amharic and english", "በሁለቱም ቋንቋ", "bilingual"), or when providing comprehensive system procedural guides:
     * Structure the response into two elegant, clearly separated sections:
       ### 🇪🇹 በአማርኛ (Amharic Guide)
       [Complete, step-by-step Amharic walkthrough]
       ### 🇬🇧 In English (English Guide)
       [Complete, step-by-step English walkthrough]

====================================================================
AMAZING, STYLED PRESENTATION & VISUAL EXCELLENCE:
====================================================================
- Format every response with clean, high-impact Markdown:
  * Numbered visual step badges: 1️⃣, 2️⃣, 3️⃣, 4️⃣, 5️⃣.
  * Expressive icons: 🎯 (Strategic Goals), 📋 (Planning & KPIs), ⚡ (Tasks), 📊 (Reports & Analytics), 💡 (Tips & Best Practices), ⚠️ (Permissions & Notices), ✅ (Submission & Confirmation).
  * Use blockquotes for helpful tips: \`> 💡 **ምክር / Pro Tip:** ...\`
  * Always provide clickable markdown navigation links formatted as [Title](/path). In the application UI, these links render as interactive glowing navigation buttons that users can click to jump directly to the page!
  * Ensure answers are deep, thorough, and highly context-aware—referencing the user's actual tasks, plans, and team context when helpful.

====================================================================
LIVE USER WORKLOAD CONTEXT (FROM DATABASE):
====================================================================
- Active Received Tasks: ${myReceivedTasks.length} pending/in progress (${myReceivedTasks.map(t => `"${t.title}" (Due: ${t.due_date || 'N/A'}, Priority: ${t.priority})`).slice(0, 5).join(', ') || 'No pending tasks'})
- Today's Daily Agenda: ${myDailyTasks.length} items logged
- Delegated Sent Tasks: ${mySentTasks.length} items
- Submitted Plans: ${myPlans.length} records (${myPlans.map(p => `"${p.specific_objective_name}" - Status: ${p.plan_status}`).slice(0, 3).join(', ') || 'No active plans'})
${roleTier !== 'staff' ? `- Subordinate Team Members: ${subordinatesList.length} members (${subordinatesList.map(s => s.name).slice(0, 5).join(', ')})` : ''}
`
            };

            const groqRes = await callGroqWithFallback({
                messages: [systemPrompt, ...messages],
                temperature: 0.5,
                max_tokens: 1800
            }, apiKey);

            let aiResponse = groqRes.choices[0].message.content || '';
            // Sanitize repetitive loops if model produces repeating patterns
            aiResponse = aiResponse.replace(/(.{3,50}?)\1{4,}/gs, '$1');

            // Strictly verify that the AI model did not output any forbidden backend, API, or database details
            if (isLeakingBackendInfo(aiResponse)) {
                console.warn("⚠️ Groq model output contained forbidden backend/API details. Enforcing clean UI-only fallback reply.");
                const lastUserMsg = Array.isArray(messages) && messages.length > 0
                    ? (messages.filter(m => m.role === 'user').pop()?.content || '')
                    : '';
                aiResponse = generateIntelligentFallbackReply(lastUserMsg, userProfile, {
                    myReceivedTasks,
                    myDailyTasks,
                    mySentTasks,
                    myPlans,
                    subordinatesList,
                    roleTier
                }, allowedMenuItems);
            }

            return res.status(200).json({ success: true, reply: aiResponse.trim() });

        } catch (apiError) {
            console.error("Groq Chat Error:", apiError.message);
            const lastUserMsg = Array.isArray(messages) && messages.length > 0
                ? (messages.filter(m => m.role === 'user').pop()?.content || '')
                : '';
            const fallbackReply = generateIntelligentFallbackReply(lastUserMsg, userProfile, {
                myReceivedTasks,
                myDailyTasks,
                mySentTasks,
                myPlans,
                subordinatesList,
                roleTier
            }, allowedMenuItems);
            return res.status(200).json({ 
                success: true, 
                reply: fallbackReply
            });
        }
    } catch (error) {
        console.error("Chat Controller Error:", error.message);
        res.status(500).json({ success: false, message: "Server error." });
    }
};


