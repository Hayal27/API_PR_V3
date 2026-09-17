const { sequelize, Sequelize } = require('../config/database');

// Import all entities
const ActionPlanQuarterActivations = require('./entities/ActionPlanQuarterActivations');
const ApprovalWorkflowHistory = require('./entities/ApprovalWorkflowHistory');
const Approvalhierarchy = require('./entities/Approvalhierarchy');
const Approvalworkflow = require('./entities/Approvalworkflow');
const AuditLogs = require('./entities/AuditLogs');
const ChatParticipants = require('./entities/ChatParticipants');
const ChatSettings = require('./entities/ChatSettings');
const Conversations = require('./entities/Conversations');
const Cost = require('./entities/Cost');
const DailyTasks = require('./entities/DailyTasks');
const DataQualityChecks = require('./entities/DataQualityChecks');
const Departments = require('./entities/Departments');
const EmployeePositions = require('./entities/EmployeePositions');
const Employees = require('./entities/Employees');
const Evaluations = require('./entities/Evaluations');
const ForwardedMessages = require('./entities/ForwardedMessages');
const GoalQuarterActivations = require('./entities/GoalQuarterActivations');
const Goals = require('./entities/Goals');
const Income = require('./entities/Income');
const KpiQuarterActivations = require('./entities/KpiQuarterActivations');
const MeetingAttachments = require('./entities/MeetingAttachments');
const MeetingMinutes = require('./entities/MeetingMinutes');
const MeetingParticipants = require('./entities/MeetingParticipants');
const MeetingReminders = require('./entities/MeetingReminders');
const Meetings = require('./entities/Meetings');
const MenuItems = require('./entities/MenuItems');
const MessageAttachments = require('./entities/MessageAttachments');
const MessageMentions = require('./entities/MessageMentions');
const MessageReactions = require('./entities/MessageReactions');
const MessageReadReceipts = require('./entities/MessageReadReceipts');
const Messages = require('./entities/Messages');
const MonthlyTaskAssignees = require('./entities/MonthlyTaskAssignees');
const MonthlyTasks = require('./entities/MonthlyTasks');
const Notifications = require('./entities/Notifications');
const ObjectiveQuarterActivations = require('./entities/ObjectiveQuarterActivations');
const Objectives = require('./entities/Objectives');
const OrganizationGroups = require('./entities/OrganizationGroups');
const OrganizationStructure = require('./entities/OrganizationStructure');
const OrganizationTypes = require('./entities/OrganizationTypes');
const PasswordResetOtp = require('./entities/PasswordResetOtp');
const PlanApprovalSteps = require('./entities/PlanApprovalSteps');
const PlanBreakdownSupervisors = require('./entities/PlanBreakdownSupervisors');
const PlanPillars = require('./entities/PlanPillars');
const PlanTypes = require('./entities/PlanTypes');
const Plans = require('./entities/Plans');
const Positions = require('./entities/Positions');
const ReportAttachments = require('./entities/ReportAttachments');
const Reportfile = require('./entities/Reportfile');
const Reports = require('./entities/Reports');
const RiskFlags = require('./entities/RiskFlags');
const RolePermissions = require('./entities/RolePermissions');
const Roles = require('./entities/Roles');
const SpecificObjectiveDetails = require('./entities/SpecificObjectiveDetails');
const SpecificObjectives = require('./entities/SpecificObjectives');
const SupervisorComments = require('./entities/SupervisorComments');
const SystemSettings = require('./entities/SystemSettings');
const TaskAssignments = require('./entities/TaskAssignments');
const TaskReminders = require('./entities/TaskReminders');
const Tasks = require('./entities/Tasks');
const UserPresence = require('./entities/UserPresence');
const Users = require('./entities/Users');
const WeeklyTaskAssignees = require('./entities/WeeklyTaskAssignees');
const WeeklyTasks = require('./entities/WeeklyTasks');

// Associations
// User & Employee & Role
if (typeof Users !== 'undefined' && typeof Employees !== 'undefined') {
  Users.belongsTo(Employees, { foreignKey: 'employee_id', as: 'employee' });
  Employees.hasOne(Users, { foreignKey: 'employee_id', as: 'user' });
}
if (typeof Users !== 'undefined' && typeof Roles !== 'undefined') {
  Users.belongsTo(Roles, { foreignKey: 'role_id', as: 'role' });
  Roles.hasMany(Users, { foreignKey: 'role_id', as: 'users' });
}
if (typeof Employees !== 'undefined' && typeof Departments !== 'undefined') {
  Employees.belongsTo(Departments, { foreignKey: 'department_id', as: 'department' });
  Departments.hasMany(Employees, { foreignKey: 'department_id', as: 'employees' });
}
// Strategic Plan Hierarchy
if (typeof Goals !== 'undefined' && typeof PlanPillars !== 'undefined') {
  Goals.belongsTo(PlanPillars, { foreignKey: 'pillar_id', as: 'pillar' });
  PlanPillars.hasMany(Goals, { foreignKey: 'pillar_id', as: 'goals' });
}
if (typeof Objectives !== 'undefined' && typeof Goals !== 'undefined') {
  Objectives.belongsTo(Goals, { foreignKey: 'goal_id', as: 'goal' });
  Goals.hasMany(Objectives, { foreignKey: 'goal_id', as: 'objectives' });
}
if (typeof SpecificObjectives !== 'undefined' && typeof Objectives !== 'undefined') {
  SpecificObjectives.belongsTo(Objectives, { foreignKey: 'objective_id', as: 'objective' });
  Objectives.hasMany(SpecificObjectives, { foreignKey: 'objective_id', as: 'specific_objectives' });
}
if (typeof SpecificObjectiveDetails !== 'undefined' && typeof SpecificObjectives !== 'undefined') {
  SpecificObjectiveDetails.belongsTo(SpecificObjectives, { foreignKey: 'specific_objective_id', as: 'specific_objective' });
  SpecificObjectives.hasMany(SpecificObjectiveDetails, { foreignKey: 'specific_objective_id', as: 'objective_details' });
}
if (typeof MonthlyTasks !== 'undefined' && typeof SpecificObjectiveDetails !== 'undefined') {
  MonthlyTasks.belongsTo(SpecificObjectiveDetails, { foreignKey: 'specific_objective_detail_id', as: 'detail' });
  SpecificObjectiveDetails.hasMany(MonthlyTasks, { foreignKey: 'specific_objective_detail_id', as: 'monthly_tasks' });
}
if (typeof WeeklyTasks !== 'undefined' && typeof MonthlyTasks !== 'undefined') {
  WeeklyTasks.belongsTo(MonthlyTasks, { foreignKey: 'monthly_task_id', as: 'monthly_task' });
  MonthlyTasks.hasMany(WeeklyTasks, { foreignKey: 'monthly_task_id', as: 'weekly_tasks' });
}
if (typeof Tasks !== 'undefined' && typeof Users !== 'undefined') {
  Tasks.belongsTo(Users, { foreignKey: 'user_id', as: 'user' });
  Tasks.belongsTo(Users, { foreignKey: 'assigned_by', as: 'assigner' });
}
if (typeof TaskReminders !== 'undefined' && typeof Tasks !== 'undefined') {
  TaskReminders.belongsTo(Tasks, { foreignKey: 'task_id', as: 'task' });
  Tasks.hasMany(TaskReminders, { foreignKey: 'task_id', as: 'reminders' });
}

module.exports = {
  sequelize,
  Sequelize,
  ActionPlanQuarterActivations,
  ApprovalWorkflowHistory,
  Approvalhierarchy,
  Approvalworkflow,
  AuditLogs,
  ChatParticipants,
  ChatSettings,
  Conversations,
  Cost,
  DailyTasks,
  DataQualityChecks,
  Departments,
  EmployeePositions,
  Employees,
  Evaluations,
  ForwardedMessages,
  GoalQuarterActivations,
  Goals,
  Income,
  KpiQuarterActivations,
  MeetingAttachments,
  MeetingMinutes,
  MeetingParticipants,
  MeetingReminders,
  Meetings,
  MenuItems,
  MessageAttachments,
  MessageMentions,
  MessageReactions,
  MessageReadReceipts,
  Messages,
  MonthlyTaskAssignees,
  MonthlyTasks,
  Notifications,
  ObjectiveQuarterActivations,
  Objectives,
  OrganizationGroups,
  OrganizationStructure,
  OrganizationTypes,
  PasswordResetOtp,
  PlanApprovalSteps,
  PlanBreakdownSupervisors,
  PlanPillars,
  PlanTypes,
  Plans,
  Positions,
  ReportAttachments,
  Reportfile,
  Reports,
  RiskFlags,
  RolePermissions,
  Roles,
  SpecificObjectiveDetails,
  SpecificObjectives,
  SupervisorComments,
  SystemSettings,
  TaskAssignments,
  TaskReminders,
  Tasks,
  UserPresence,
  Users,
  WeeklyTaskAssignees,
  WeeklyTasks,
};
