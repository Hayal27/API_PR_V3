const db = require('./models/db');
const { promisify } = require('util');
const query = promisify(db.query).bind(db);
const WORKER_COUNT = 10; // Number of distinct employees to seed data for

async function seedData() {
    console.log('--- Starting Comprehensive Dynamic Seeding for User 79 ---');

    try {
        // Disable foreign key checks for seeding
        await query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('Foreign key checks disabled for seeding...');

        // Fetch valid employees and units
        const employees = await query('SELECT employee_id FROM employees LIMIT 20');
        const orgUnits = await query('SELECT id, name FROM organization_structure');

        if (!employees.length || !orgUnits.length) {
            console.error('Missing base data (employees or org units).');
            process.exit(1);
        }

        // Use the first employee as the global user context for consistency if needed, 
        // but distribute created_by across others
        const USER_ID = employees[0].employee_id; 

        // Cleanup ANY existing seed data marked by our system
        console.log('Cleaning up system-generated specific objective details...');
        await query('DELETE FROM `specific_objective_details` WHERE `created_by` IN (?)', [employees.map(e => e.employee_id)]);
        console.log('Cleanup finished.');

        // Fetch valid org units
        const departmentIds = orgUnits.map(u => u.id);
        console.log(`Found ${departmentIds.length} organization units. Picking randomly for each plan...`);

        const years = [2024, 2025, 2026];
        const planCategories = [
            { 
                type: 'default', 
                name: "Software Development Project",
                goalText: "ግብ 1. የIT ካምፓኒዎችን ወደ ፓርኩ በመሳብ የሥራ ዕድልና የውጭ ቀጥተኛ ኢንቨስትመንት መፍጠር",
                details: {
                    name: "የሞባይል አፕሊኬሽን ልማት",
                    description: "የሞባይል አፕሊኬሽን ልማት እና ሙከራ",
                    baseline: "50",
                    plan: "200",
                    measurement: "የሰራተኞች ብዛት",
                    priority: "በጣም አስፈላጊ",
                    progress: 0.75 // 75% done
                }
            },
            {
                type: 'cost',
                name: "Infrastructure Investment",
                goalText: "ግብ 1. የIT ካምፓኒዎችን ወደ ፓርኩ በመሳብ የሥራ ዕድልና የውጭ ቀጥተኛ ኢንቨስትመንት መፍጠር",
                details: {
                    name: "የመሠረተ ልማት ዝርጋታ",
                    description: "የፋይበር ኦፕቲክ ኬብል መዘርጋት እና ማሻሻል",
                    baseline: "100",
                    plan: "500",
                    measurement: "በሚሊዮን ብር",
                    priority: "አስፈላጊ",
                    costType: "capital_project_budget",
                    costName: "ICT Equipments",
                    CIbaseline: 1000000,
                    CIplan: 5000000,
                    progress: 0.4 // 40% done
                }
            },
            {
                type: 'income',
                name: "Park Revenue Generation",
                goalText: "ግብ 2. የቴክኖሎጂ ፓርክ አገልግሎት ጥራት ማሻሻል",
                details: {
                    name: "የቢሮ ኪራይ ገቢ",
                    description: "ከአዳዲስ ተከራዮች የሚገኝ ገቢ",
                    baseline: "10",
                    plan: "50",
                    measurement: "USD",
                    priority: "መደበኛ",
                    incomeExchange: "usd",
                    incomePlanType: "internal",
                    incomeName: "office_rent",
                    CIbaseline: 20000,
                    CIplan: 100000,
                    progress: 1.1 // Overachieved (110%)
                }
            },
            {
                type: 'hr',
                name: "Staff Capacity Building",
                goalText: "ግብ 3. የሰራተኞች አቅም ግንባታ",
                details: {
                    name: "የቴክኒክ ስልጠና",
                    description: "ለሰራተኞች የሚሰጥ የክህሎት ማሳደጊያ ስልጠና",
                    baseline: "20",
                    plan: "80",
                    measurement: "number",
                    priority: "መደበኛ",
                    employeeOf: "internal",
                    employmentType: "full_time",
                    progress: 0.9 // 90% done
                }
            },
            {
                type: 'project',
                name: "Cloud Data Center Expansion",
                goalText: "ግብ 2. የቴክኖሎጂ ፓርክ አገልግሎት ጥራት ማሻሻል",
                details: {
                    name: "የክላውድ ሰርቨር ማሳደጊያ",
                    description: "ተጨማሪ ሰርቨሮችን መግዛት እና መትከል",
                    baseline: "2",
                    plan: "10",
                    measurement: "number",
                    priority: "በጣም አስፈላጊ",
                    projectType: "it_project",
                    progress: 0.2 // 20% done
                }
            }
        ];

        for (const year of years) {
            console.log(`\n--- Seeding for Year: ${year} ---`);

            for (const category of planCategories) {
                // Distribute across employees
                for (let i = 0; i < 5; i++) {
                    const randomEmp = employees[Math.floor(Math.random() * employees.length)];
                    const randomDept = orgUnits[Math.floor(Math.random() * orgUnits.length)];
                    
                    // Variation in performance
                    const performanceBoost = (Math.random() * 0.4) - 0.1; // -10% to +30%
                    const currentProgress = Math.min(1.2, Math.max(0.1, category.details.progress + performanceBoost));

                    // Create Goal
                    const goalResult = await query(
                        'INSERT INTO `goals` (`user_id`, `name`, `description`, `year`, `quarter`, `employee_id`, `created_by`) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [USER_ID, category.goalText, category.goalText, year, 'Q1', randomEmp.employee_id, USER_ID]
                    );
                    const goalId = goalResult.insertId;

                    // Create Objective
                    const objName = `${category.name} Goal`;
                    const objResult = await query(
                        'INSERT INTO `objectives` (`user_id`, `name`, `description`, `year`, `quarter`, `employee_id`, `goal_id`) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [USER_ID, objName, objName, year, 'Q1', randomEmp.employee_id, goalId]
                    );
                    const objectiveId = objResult.insertId;

                    // Create Specific Objective
                    const specObjName = `Execution: ${category.name}`;
                    const specObjResult = await query(
                        'INSERT INTO `specific_objectives` (`user_id`, `objective_id`, `specific_objective_name`, `department_id`, `priority`, `deadline_quarter`, `name`, `count`, `progress`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [USER_ID, objectiveId, specObjName, randomDept.id, category.details.priority, 'Q1', specObjName, 1, 'planned']
                    );
                    const specificObjectiveId = specObjResult.insertId;

                    // Outcomes
                    const d = category.details;
                    const baselineVal = parseFloat(d.baseline);
                    const planVal = parseFloat(d.plan);
                    const actualOutcome = baselineVal + (planVal - baselineVal) * currentProgress;
                    const execPerc = (currentProgress * 100).toFixed(2);

                    let ciOutcome = 0;
                    let ciExec = 0;
                    if (d.CIplan) {
                        ciOutcome = d.CIbaseline + (d.CIplan - d.CIbaseline) * currentProgress;
                        ciExec = (currentProgress * 100).toFixed(2);
                    }

                    const progressStatus = currentProgress >= 1 ? 'completed' : 'started';

                    // Create Specific Objective Detail
                    const detailResult = await query(
                        `INSERT INTO \`specific_objective_details\` (
                            \`user_id\`, \`specific_objective_detailname\`, \`details\`, \`baseline\`, \`plan\`, \`measurement\`, 
                            \`year\`, \`status\`, \`priority\`, \`department_id\`, \`name\`, \`description\`, \`count\`, 
                            \`progress\`, \`created_by\`, \`specific_objective_id\`, \`goal_id\`,
                            \`plan_type\`, \`cost_type\`, \`costName\`, \`income_plan_type\`, \`incomeName\`, \`income_exchange\`, 
                            \`employment_type\`, \`employee_of\`, \`project_type\`,
                            \`CIbaseline\`, \`CIplan\`, \`CIoutcome\`, \`CIexecution_percentage\`, \`execution_percentage\`, \`outcome\`
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            USER_ID, d.name, d.description, d.baseline, d.plan, d.measurement,
                            year, 'Approved', d.priority, randomDept.id, d.name, d.description, 1,
                            progressStatus, randomEmp.employee_id, specificObjectiveId, goalId,
                            category.type,
                            d.costType || null,
                            d.costName || null,
                            d.incomePlanType || null,
                            d.incomeName || null,
                            d.incomeExchange || null,
                            d.employmentType || null,
                            d.employeeOf || null,
                            d.projectType || null,
                            d.CIbaseline || 0, d.CIplan || 0, ciOutcome, ciExec, execPerc, actualOutcome
                        ]
                    );
                    const detailId = detailResult.insertId;

                    // Create Plan
                    const planResult = await query(
                        `INSERT INTO \`plans\` (
                            \`user_id\`, \`department_id\`, \`employee_id\`, \`goal_id\`, \`objective_id\`, 
                            \`specific_objective_id\`, \`specific_objective_detail_id\`, \`status\`, \`year\`, \`department_name\`, \`report_progress\`
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [USER_ID, randomDept.id, randomEmp.employee_id, goalId, objectiveId, specificObjectiveId, detailId, 'Approved', year, randomDept.name, progressStatus]
                    );
                    const planId = planResult.insertId;

                    // Create Approval History
                    await query(
                        'INSERT INTO `approvalworkflow` (`plan_id`, `approver_id`, `status`, `comment`, `comment_writer`) VALUES (?, ?, ?, ?, ?)',
                        [planId, USER_ID, 'completed', 'Seeded System Approval', 'System Admin']
                    );

                    // Create Report record
                    await query(
                        'INSERT INTO `reports` (`plan_id`, `user_id`, `report_content`, `status`, `created_at`) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                        [planId, USER_ID, `Reporting progress for ${category.name} - ${year}`, 'Approved']
                    );

                    console.log(`    Successfully seeded ${category.type} plan with ${execPerc}% execution.`);
                }
            }
        }

        console.log('\nSUCCESS: Comprehensive seeding for User 79 finished successfully!');
    } catch (error) {
        console.error('\nFAILED: Seeding failed.');
        console.error(error);
    } finally {
        // We shouldn't necessarily end the connection if db is a singleton pool or similar
        // but here we want to exit the script.
        process.exit(0);
    }
}

seedData();
