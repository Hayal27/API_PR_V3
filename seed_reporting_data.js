const mysql = require('mysql');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'itpr'
};

const USER_ID = 40;
const EMPLOYEE_ID = 109;
const DEPARTMENT_ID = 2;

const connection = mysql.createConnection(dbConfig);

function query(sql, params) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, results) => {
            if (error) {
                console.error('--- SQL ERROR ---');
                console.error('Message:', error.message);
                console.error('Query:', sql);
                console.error('Params:', JSON.stringify(params));
                reject(error);
            }
            else resolve(results);
        });
    });
}

async function seedData() {
    console.log('Connecting to database...');
    connection.connect();

    try {
        const years = [2024, 2025, 2026];
        const planTypes = [
            { type: 'cost', subtypes: ['regular_budget', 'capital_project_budget'] },
            { type: 'income', subtypes: ['internal', 'tenant'] },
            { type: 'hr', subtypes: ['full_time', 'part_time', 'contract', 'internship'] },
            { type: 'project', subtypes: ['it_project', 'construction', 'other'] },
            { type: 'general', subtypes: ['strategy'] }
        ];

        for (const year of years) {
            console.log(`\n--- Seeding for Year: ${year} ---`);

            const goalName = `Strategic Goal ${year}`;
            const goalResult = await query(
                'INSERT INTO `goals` (`user_id`, `name`, `description`, `year`, `quarter`, `employee_id`, `created_by`) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [USER_ID, goalName, goalName, year, 'Q1', EMPLOYEE_ID, USER_ID]
            );
            const goalId = goalResult.insertId;

            const objName = `Objective ${year}`;
            const objResult = await query(
                'INSERT INTO `objectives` (`user_id`, `name`, `description`, `year`, `quarter`, `employee_id`, `goal_id`) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [USER_ID, objName, objName, year, 'Q1', EMPLOYEE_ID, goalId]
            );
            const objectiveId = objResult.insertId;

            const specObjName = `Specific Objective ${year}`;
            const specObjResult = await query(
                'INSERT INTO `specific_objectives` (`user_id`, `objective_id`, `specific_objective_name`, `department_id`, `priority`, `deadline_quarter`, `name`, `count`, `progress`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [USER_ID, objectiveId, specObjName, DEPARTMENT_ID, 'አስፈላጊ', 'Q1', specObjName, 1, 'completed']
            );
            const specificObjectiveId = specObjResult.insertId;

            for (const pt of planTypes) {
                for (const subType of pt.subtypes) {
                    console.log(`  Seeding ${pt.type} - ${subType}`);

                    const detailName = `${pt.type} ${subType} ${year}`;
                    const ciPlan = Math.floor(Math.random() * 5000) + 1000;
                    const ciOutcome = Math.floor(ciPlan * (0.6 + Math.random() * 0.4));
                    const ciExec = Number(((ciOutcome / ciPlan) * 100).toFixed(2));

                    const detailResult = await query(
                        `INSERT INTO \`specific_objective_details\` (
                            \`user_id\`, \`specific_objective_detailname\`, \`details\`, \`baseline\`, \`plan\`, \`measurement\`, 
                            \`year\`, \`status\`, \`priority\`, \`department_id\`, \`name\`, \`description\`, \`count\`, 
                            \`progress\`, \`created_by\`, \`specific_objective_id\`, \`goal_id\`,
                            \`plan_type\`, \`cost_type\`, \`costName\`, \`income_plan_type\`, \`incomeName\`, \`income_exchange\`, 
                            \`employment_type\`, \`employee_of\`, \`project_type\`,
                            \`CIbaseline\`, \`CIplan\`, \`CIoutcome\`, \`CIexecution_percentage\`, \`execution_percentage\`
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            USER_ID, detailName, detailName, '0', '100', 'Present',
                            year, 'Approved', 'አስፈላጊ', DEPARTMENT_ID, detailName, detailName, 1,
                            'completed', 'Ezira', specificObjectiveId, goalId,
                            pt.type,
                            pt.type === 'cost' ? subType : null,
                            pt.type === 'cost' ? 'Sample Cost' : null,
                            pt.type === 'income' ? subType : null,
                            pt.type === 'income' ? 'Sample Income' : null,
                            pt.type === 'income' ? (subType === 'internal' ? 'ETB' : 'USD') : null,
                            pt.type === 'hr' ? subType : null,
                            pt.type === 'hr' ? subType.replace('_', ' ').toUpperCase() : null,
                            pt.type === 'project' ? subType : null,
                            0, ciPlan, ciOutcome, ciExec, ciExec
                        ]
                    );
                    const detailId = detailResult.insertId;

                    const planResult = await query(
                        `INSERT INTO \`plans\` (
                            \`user_id\`, \`department_id\`, \`employee_id\`, \`goal_id\`, \`objective_id\`, 
                            \`specific_objective_id\`, \`specific_objective_detail_id\`, \`status\`, \`year\`, \`department_name\`
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [USER_ID, DEPARTMENT_ID, EMPLOYEE_ID, goalId, objectiveId, specificObjectiveId, detailId, 'Approved', year, 'IT Department']
                    );
                    const planId = planResult.insertId;

                    await query(
                        'INSERT INTO `approvalworkflow` (`plan_id`, `approver_id`, `status`, `comment`, `comment_writer`) VALUES (?, ?, ?, ?, ?)',
                        [planId, EMPLOYEE_ID, 'completed', 'Auto-seeded for reporting', 'System']
                    );
                }
            }
        }
        console.log('\nSUCCESS: Seeding finished successfully!');
    } catch (error) {
        console.error('\nFAILED: Seeding failed.');
    } finally {
        connection.end();
    }
}

seedData();
