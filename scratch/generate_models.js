const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');

async function run() {
  const sqlContent = fs.readFileSync(path.join(__dirname, '../models/datase/itpr.sql'), 'utf8');

  // Let's also query the information_schema or describe tables directly from MySQL since connection is active!
  // That way we get 100% accurate column types, nullable, defaults, primary keys, and ENUM values!
  const [tables] = await sequelize.query("SHOW TABLES");
  const tableKey = Object.keys(tables[0])[0];
  const allTableNames = tables.map(t => t[tableKey]);

  console.log(`Found ${allTableNames.length} tables in live MySQL database!`);

  const entitiesDir = path.join(__dirname, '../models/entities');
  if (!fs.existsSync(entitiesDir)) {
    fs.mkdirSync(entitiesDir, { recursive: true });
  }

  const modelNames = [];

  for (const tableName of allTableNames) {
    const [columns] = await sequelize.query(`DESCRIBE \`${tableName}\``);
    
    // Convert table_name to PascalCase ModelName (e.g. plan_pillars -> PlanPillar)
    const singular = tableName.replace(/ies$/, 'y').replace(/s$/, '');
    const modelName = tableName
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    const attributes = {};
    let hasCreatedAt = false;
    let hasUpdatedAt = false;

    for (const col of columns) {
      const fieldName = col.Field;
      if (fieldName === 'created_at') hasCreatedAt = true;
      if (fieldName === 'updated_at') hasUpdatedAt = true;

      const colType = col.Type.toLowerCase();
      let seqType = 'DataTypes.STRING';

      if (colType.startsWith('int') || colType.startsWith('tinyint') || colType.startsWith('smallint') || colType.startsWith('mediumint') || colType.startsWith('bigint')) {
        seqType = 'DataTypes.INTEGER';
      } else if (colType.startsWith('decimal') || colType.startsWith('numeric') || colType.startsWith('float') || colType.startsWith('double')) {
        seqType = 'DataTypes.DECIMAL(15, 4)';
      } else if (colType.startsWith('text') || colType.startsWith('mediumtext') || colType.startsWith('longtext')) {
        seqType = 'DataTypes.TEXT';
      } else if (colType.startsWith('datetime') || colType.startsWith('timestamp')) {
        seqType = 'DataTypes.DATE';
      } else if (colType.startsWith('date')) {
        seqType = 'DataTypes.DATEONLY';
      } else if (colType.startsWith('enum')) {
        const enumValues = col.Type.match(/enum\((.*)\)/i);
        if (enumValues && enumValues[1]) {
          seqType = `DataTypes.ENUM(${enumValues[1]})`;
        } else {
          seqType = 'DataTypes.STRING';
        }
      } else if (colType.startsWith('json')) {
        seqType = 'DataTypes.JSON';
      } else if (colType.startsWith('varchar') || colType.startsWith('char')) {
        const lenMatch = colType.match(/\((\d+)\)/);
        const len = lenMatch ? lenMatch[1] : '255';
        seqType = `DataTypes.STRING(${len})`;
      }

      const attrDef = {
        type: seqType,
        allowNull: col.Null === 'YES',
        primaryKey: col.Key === 'PRI',
        autoIncrement: col.Extra.includes('auto_increment'),
      };

      if (col.Default !== null && col.Default !== undefined && !col.Default.includes('current_timestamp')) {
        attrDef.defaultValue = col.Default;
      }

      attributes[fieldName] = attrDef;
    }

    // Generate code for this model
    let code = `const { DataTypes } = require('sequelize');\n`;
    code += `const { sequelize } = require('../../config/database');\n\n`;
    code += `const ${modelName} = sequelize.define('${modelName}', {\n`;

    for (const [colName, def] of Object.entries(attributes)) {
      code += `  ${colName}: {\n`;
      code += `    type: ${def.type},\n`;
      code += `    allowNull: ${def.allowNull},\n`;
      if (def.primaryKey) code += `    primaryKey: true,\n`;
      if (def.autoIncrement) code += `    autoIncrement: true,\n`;
      if (def.defaultValue !== undefined) code += `    defaultValue: ${JSON.stringify(def.defaultValue)},\n`;
      code += `  },\n`;
    }

    code += `}, {\n`;
    code += `  tableName: '${tableName}',\n`;
    code += `  timestamps: ${hasCreatedAt || hasUpdatedAt},\n`;
    if (hasCreatedAt) code += `  createdAt: 'created_at',\n`;
    if (hasUpdatedAt) code += `  updatedAt: 'updated_at',\n`;
    code += `});\n\n`;
    code += `module.exports = ${modelName};\n`;

    fs.writeFileSync(path.join(entitiesDir, `${modelName}.js`), code);
    modelNames.push({ modelName, tableName });
  }

  // Generate models/index.js that exports all models and associations
  let indexCode = `const { sequelize, Sequelize } = require('../config/database');\n\n`;
  indexCode += `// Import all entities\n`;
  for (const { modelName } of modelNames) {
    indexCode += `const ${modelName} = require('./entities/${modelName}');\n`;
  }

  indexCode += `\n// Associations\n`;
  // Common associations:
  indexCode += `// User & Employee & Role\n`;
  indexCode += `if (typeof Users !== 'undefined' && typeof Employees !== 'undefined') {\n`;
  indexCode += `  Users.belongsTo(Employees, { foreignKey: 'employee_id', as: 'employee' });\n`;
  indexCode += `  Employees.hasOne(Users, { foreignKey: 'employee_id', as: 'user' });\n`;
  indexCode += `}\n`;
  indexCode += `if (typeof Users !== 'undefined' && typeof Roles !== 'undefined') {\n`;
  indexCode += `  Users.belongsTo(Roles, { foreignKey: 'role_id', as: 'role' });\n`;
  indexCode += `  Roles.hasMany(Users, { foreignKey: 'role_id', as: 'users' });\n`;
  indexCode += `}\n`;
  indexCode += `if (typeof Employees !== 'undefined' && typeof Departments !== 'undefined') {\n`;
  indexCode += `  Employees.belongsTo(Departments, { foreignKey: 'department_id', as: 'department' });\n`;
  indexCode += `  Departments.hasMany(Employees, { foreignKey: 'department_id', as: 'employees' });\n`;
  indexCode += `}\n`;

  // Goal & Objective & SpecificObjective
  indexCode += `// Strategic Plan Hierarchy\n`;
  indexCode += `if (typeof Goals !== 'undefined' && typeof PlanPillars !== 'undefined') {\n`;
  indexCode += `  Goals.belongsTo(PlanPillars, { foreignKey: 'pillar_id', as: 'pillar' });\n`;
  indexCode += `  PlanPillars.hasMany(Goals, { foreignKey: 'pillar_id', as: 'goals' });\n`;
  indexCode += `}\n`;
  indexCode += `if (typeof Objectives !== 'undefined' && typeof Goals !== 'undefined') {\n`;
  indexCode += `  Objectives.belongsTo(Goals, { foreignKey: 'goal_id', as: 'goal' });\n`;
  indexCode += `  Goals.hasMany(Objectives, { foreignKey: 'goal_id', as: 'objectives' });\n`;
  indexCode += `}\n`;
  indexCode += `if (typeof SpecificObjectives !== 'undefined' && typeof Objectives !== 'undefined') {\n`;
  indexCode += `  SpecificObjectives.belongsTo(Objectives, { foreignKey: 'objective_id', as: 'objective' });\n`;
  indexCode += `  Objectives.hasMany(SpecificObjectives, { foreignKey: 'objective_id', as: 'specific_objectives' });\n`;
  indexCode += `}\n`;
  indexCode += `if (typeof SpecificObjectiveDetails !== 'undefined' && typeof SpecificObjectives !== 'undefined') {\n`;
  indexCode += `  SpecificObjectiveDetails.belongsTo(SpecificObjectives, { foreignKey: 'specific_objective_id', as: 'specific_objective' });\n`;
  indexCode += `  SpecificObjectives.hasMany(SpecificObjectiveDetails, { foreignKey: 'specific_objective_id', as: 'details' });\n`;
  indexCode += `}\n`;
  indexCode += `if (typeof MonthlyTasks !== 'undefined' && typeof SpecificObjectiveDetails !== 'undefined') {\n`;
  indexCode += `  MonthlyTasks.belongsTo(SpecificObjectiveDetails, { foreignKey: 'specific_objective_detail_id', as: 'detail' });\n`;
  indexCode += `  SpecificObjectiveDetails.hasMany(MonthlyTasks, { foreignKey: 'specific_objective_detail_id', as: 'monthly_tasks' });\n`;
  indexCode += `}\n`;
  indexCode += `if (typeof WeeklyTasks !== 'undefined' && typeof MonthlyTasks !== 'undefined') {\n`;
  indexCode += `  WeeklyTasks.belongsTo(MonthlyTasks, { foreignKey: 'monthly_task_id', as: 'monthly_task' });\n`;
  indexCode += `  MonthlyTasks.hasMany(WeeklyTasks, { foreignKey: 'monthly_task_id', as: 'weekly_tasks' });\n`;
  indexCode += `}\n`;

  // Tasks & Reminders
  indexCode += `if (typeof Tasks !== 'undefined' && typeof Users !== 'undefined') {\n`;
  indexCode += `  Tasks.belongsTo(Users, { foreignKey: 'user_id', as: 'user' });\n`;
  indexCode += `  Tasks.belongsTo(Users, { foreignKey: 'assigned_by', as: 'assigner' });\n`;
  indexCode += `}\n`;
  indexCode += `if (typeof TaskReminders !== 'undefined' && typeof Tasks !== 'undefined') {\n`;
  indexCode += `  TaskReminders.belongsTo(Tasks, { foreignKey: 'task_id', as: 'task' });\n`;
  indexCode += `  Tasks.hasMany(TaskReminders, { foreignKey: 'task_id', as: 'reminders' });\n`;
  indexCode += `}\n`;

  // Export
  indexCode += `\nmodule.exports = {\n`;
  indexCode += `  sequelize,\n`;
  indexCode += `  Sequelize,\n`;
  for (const { modelName } of modelNames) {
    indexCode += `  ${modelName},\n`;
  }
  indexCode += `};\n`;

  fs.writeFileSync(path.join(__dirname, '../models/index.js'), indexCode);

  console.log(`Successfully generated ${modelNames.length} models and models/index.js!`);
  process.exit(0);
}

run().catch(err => {
  console.error('Generator error:', err);
  process.exit(1);
});
