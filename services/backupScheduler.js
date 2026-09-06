const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const con = require('../models/db');
const { logAudit, AUDIT_ACTIONS } = require('../middleware/auditLogger');

let XLSX = null;
try {
    XLSX = require('xlsx');
} catch (e) {
    console.warn('[BackupScheduler] Optional module "xlsx" not installed on backend. Excel generation will fallback to JSON.');
}

// ── Directory Setup ──────────────────────────────────────────────────────────
const BACKUPS_DIR = path.join(__dirname, '..', 'backups');
const CONFIG_FILE = path.join(__dirname, '..', 'config', 'backup_scheduler.json');

if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}
const configDir = path.dirname(CONFIG_FILE);
if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
}

// ── Default Configuration ───────────────────────────────────────────────────
const DEFAULT_CONFIG = {
    enabled: true,
    frequency: 'daily',         // 'daily', 'weekly', 'monthly', 'every_6h', 'every_12h'
    time: '02:00',              // HH:MM (24h)
    day_of_week: 0,             // 0 = Sunday (for weekly)
    day_of_month: 1,            // 1st of month (for monthly)
    format: 'sql',              // 'sql', 'json', 'xlsx', 'all'
    type: 'full',               // 'full', 'strategic', 'wbs', 'hr'
    custom_tables: [],
    include_ddl: true,
    include_drop: true,
    retention_count: 15,        // Keep last N backups, auto-prune older ones
    notify_admin: true,
    last_run: null,
    last_status: null,
    last_message: null,
    last_filename: null,
    last_size_kb: null
};

// ── Table Category Constants ────────────────────────────────────────────────
const TABLE_PRESETS = {
    strategic: [
        'main_goals', 'specific_objectives', 'specific_objective_details', 'specific_objective_details_kpis',
        'strategic_themes', 'strategic_pillars', 'reports', 'report_submissions'
    ],
    wbs: [
        'task_breakdown', 'task_breakdown_actions', 'task_breakdown_progress', 'task_breakdown_delegations',
        'task_assignments', 'daily_tasks', 'kpi_assignments'
    ],
    hr: [
        'employees', 'employee_profiles', 'departments', 'org_units', 'org_structure_nodes',
        'unit_members', 'evaluation_criterias', 'employee_evaluations'
    ]
};

class BackupScheduler {
    static currentTask = null;
    static isExecuting = false;

    // ── Load Config ─────────────────────────────────────────────────────────
    static getConfig() {
        try {
            if (fs.existsSync(CONFIG_FILE)) {
                const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
                return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
            }
        } catch (e) {
            console.error('[BackupScheduler] Error reading config file:', e.message);
        }
        return { ...DEFAULT_CONFIG };
    }

    // ── Save Config ─────────────────────────────────────────────────────────
    static saveConfig(newConfig) {
        try {
            const current = this.getConfig();
            const merged = { ...current, ...newConfig };
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf8');
            this.reschedule();
            return merged;
        } catch (e) {
            console.error('[BackupScheduler] Error saving config file:', e.message);
            throw e;
        }
    }

    // ── Build Cron Expression ───────────────────────────────────────────────
    static getCronExpression(config) {
        const [hourStr, minStr] = (config.time || '02:00').split(':');
        const hour = parseInt(hourStr || '2', 10);
        const min = parseInt(minStr || '0', 10);

        switch (config.frequency) {
            case 'every_6h':
                return `${min} */6 * * *`;
            case 'every_12h':
                return `${min} */12 * * *`;
            case 'weekly':
                return `${min} ${hour} * * ${config.day_of_week ?? 0}`;
            case 'monthly':
                return `${min} ${hour} ${config.day_of_month ?? 1} * *`;
            case 'daily':
            default:
                return `${min} ${hour} * * *`;
        }
    }

    // ── Calculate Next Run Timestamp ────────────────────────────────────────
    static getNextRunTime(config) {
        if (!config.enabled) return null;
        try {
            const cronExpr = this.getCronExpression(config);
            // Simple forward estimate
            const now = new Date();
            const [hourStr, minStr] = (config.time || '02:00').split(':');
            const targetHour = parseInt(hourStr || '2', 10);
            const targetMin = parseInt(minStr || '0', 10);

            let next = new Date(now);
            next.setHours(targetHour, targetMin, 0, 0);

            if (config.frequency === 'every_6h' || config.frequency === 'every_12h') {
                const intervalHours = config.frequency === 'every_6h' ? 6 : 12;
                let candidate = new Date(now);
                candidate.setMinutes(targetMin, 0, 0);
                while (candidate <= now) {
                    candidate.setHours(candidate.getHours() + intervalHours);
                }
                return candidate.toISOString();
            }

            if (config.frequency === 'weekly') {
                const targetDay = config.day_of_week ?? 0;
                let dayDiff = (targetDay - now.getDay() + 7) % 7;
                if (dayDiff === 0 && next <= now) {
                    dayDiff = 7;
                }
                next.setDate(now.getDate() + dayDiff);
                return next.toISOString();
            }

            if (config.frequency === 'monthly') {
                const targetDom = config.day_of_month ?? 1;
                next.setDate(targetDom);
                if (next <= now) {
                    next.setMonth(next.getMonth() + 1);
                }
                return next.toISOString();
            }

            // Daily default
            if (next <= now) {
                next.setDate(next.getDate() + 1);
            }
            return next.toISOString();
        } catch (e) {
            return null;
        }
    }

    // ── Initialize Scheduler on Server Startup ──────────────────────────────
    static init() {
        console.log('📦 [BackupScheduler] Initializing automated backup service...');
        this.reschedule();
    }

    // ── Reschedule Cron Job ─────────────────────────────────────────────────
    static reschedule() {
        if (this.currentTask) {
            this.currentTask.stop();
            this.currentTask = null;
        }

        const config = this.getConfig();
        if (!config.enabled) {
            console.log('⏸️ [BackupScheduler] Automated backups are currently DISABLED.');
            return;
        }

        const cronExpr = this.getCronExpression(config);
        console.log(`⏰ [BackupScheduler] Scheduled automated backup (${config.frequency}, format: ${config.format}) at cron: "${cronExpr}"`);

        this.currentTask = cron.schedule(cronExpr, async () => {
            console.log('🚀 [BackupScheduler] Triggering scheduled automated backup...');
            await this.executeBackup('scheduled');
        });
    }

    // ── Get Target Table Names ──────────────────────────────────────────────
    static async getTargetTables(type, customTables) {
        const query = (sql, params = []) => new Promise((resolve, reject) => con.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
        const allDbTables = await query('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"');
        const dbNameRes = await query('SELECT DATABASE() as db');
        const dbKey = `Tables_in_${dbNameRes[0]?.db}`;
        const allTableNames = allDbTables.map(t => t[dbKey] || Object.values(t)[0]);

        if (type === 'full') {
            return allTableNames;
        }
        if (TABLE_PRESETS[type]) {
            return allTableNames.filter(t => TABLE_PRESETS[type].includes(t));
        }
        if (type === 'custom' && Array.isArray(customTables) && customTables.length > 0) {
            return allTableNames.filter(t => customTables.includes(t));
        }
        return allTableNames;
    }

    // ── Execute Backup Generator ────────────────────────────────────────────
    static async executeBackup(triggerType = 'scheduled') {
        if (this.isExecuting) {
            console.warn('[BackupScheduler] Backup execution already in progress, skipping duplicate call.');
            return { success: false, message: 'Backup already in progress' };
        }

        this.isExecuting = true;
        const config = this.getConfig();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const query = (sql, params = []) => new Promise((resolve, reject) => con.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));

        try {
            const targetTables = await this.getTargetTables(config.type, config.custom_tables);
            const formatsToGenerate = config.format === 'all' ? ['sql', 'json', 'xlsx'] : [config.format || 'sql'];
            const generatedFiles = [];
            let totalRecordsCount = 0;

            // Fetch table rows
            const tableData = {};
            for (const tbl of targetTables) {
                try {
                    const rows = await query(`SELECT * FROM \`${tbl}\``);
                    tableData[tbl] = rows || [];
                    totalRecordsCount += (rows || []).length;
                } catch (e) {
                    console.warn(`[BackupScheduler] Could not read table ${tbl}:`, e.message);
                    tableData[tbl] = [];
                }
            }

            // 1. Generate SQL Dump if requested
            if (formatsToGenerate.includes('sql')) {
                const filename = `ITPR_AutoBackup_${config.type}_${timestamp}.sql`;
                const filePath = path.join(BACKUPS_DIR, filename);

                let sqlDump = `-- ============================================================================\n`;
                sqlDump += `-- Ethiopian IT Park Performance & Report Management System (ITPR)\n`;
                sqlDump += `-- Automated Scheduled Database Backup Dump\n`;
                sqlDump += `-- Trigger Type: ${triggerType.toUpperCase()}\n`;
                sqlDump += `-- Timestamp   : ${new Date().toISOString()}\n`;
                sqlDump += `-- Tables (${targetTables.length}) : ${targetTables.join(', ')}\n`;
                sqlDump += `-- Total Rows  : ${totalRecordsCount}\n`;
                sqlDump += `-- ============================================================================\n\n`;
                sqlDump += `SET FOREIGN_KEY_CHECKS=0;\n`;
                sqlDump += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
                sqlDump += `SET time_zone = "+03:00";\n\n`;

                for (const tbl of targetTables) {
                    sqlDump += `-- ----------------------------------------------------------------------------\n`;
                    sqlDump += `-- Table structure & data for table \`${tbl}\`\n`;
                    sqlDump += `-- ----------------------------------------------------------------------------\n`;

                    if (config.include_drop) {
                        sqlDump += `DROP TABLE IF EXISTS \`${tbl}\`;\n`;
                    }
                    if (config.include_ddl) {
                        try {
                            const createRes = await query(`SHOW CREATE TABLE \`${tbl}\``);
                            if (createRes && createRes[0] && createRes[0]['Create Table']) {
                                sqlDump += `${createRes[0]['Create Table']};\n\n`;
                            }
                        } catch (errDDL) {
                            console.warn(`[BackupScheduler] DDL error on ${tbl}:`, errDDL.message);
                        }
                    }

                    const rows = tableData[tbl];
                    if (rows && rows.length > 0) {
                        const columns = Object.keys(rows[0]);
                        const escapedCols = columns.map(c => `\`${c}\``).join(', ');
                        const chunkSize = 100;
                        for (let i = 0; i < rows.length; i += chunkSize) {
                            const chunk = rows.slice(i, i + chunkSize);
                            const valuesSql = chunk.map(row => {
                                const valList = columns.map(col => {
                                    const val = row[col];
                                    if (val === null || val === undefined) return 'NULL';
                                    if (typeof val === 'number') return val;
                                    if (typeof val === 'boolean') return val ? 1 : 0;
                                    if (val instanceof Date) return con.escape(val.toISOString().slice(0, 19).replace('T', ' '));
                                    return con.escape(String(val));
                                }).join(', ');
                                return `(${valList})`;
                            }).join(',\n  ');
                            sqlDump += `INSERT INTO \`${tbl}\` (${escapedCols}) VALUES\n  ${valuesSql};\n`;
                        }
                        sqlDump += `\n`;
                    } else {
                        sqlDump += `-- (Table \`${tbl}\` has 0 rows)\n\n`;
                    }
                }
                sqlDump += `SET FOREIGN_KEY_CHECKS=1;\n`;
                sqlDump += `-- ── End of ITPR Database Dump [Total Records: ${totalRecordsCount}] ──\n`;

                fs.writeFileSync(filePath, sqlDump, 'utf8');
                const stats = fs.statSync(filePath);
                generatedFiles.push({ filename, filePath, size_kb: (stats.size / 1024).toFixed(2), format: 'sql' });
            }

            // 2. Generate JSON Archive if requested
            if (formatsToGenerate.includes('json')) {
                const filename = `ITPR_AutoBackup_${config.type}_${timestamp}.json`;
                const filePath = path.join(BACKUPS_DIR, filename);

                const payload = {
                    metadata: {
                        system: 'Ethiopian IT Park Performance & Report Management System (ITPR)',
                        backup_type: config.type,
                        trigger_type: triggerType,
                        created_at: new Date().toISOString(),
                        total_tables: targetTables.length,
                        total_records: totalRecordsCount,
                        tables: targetTables
                    },
                    data: tableData
                };

                fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
                const stats = fs.statSync(filePath);
                generatedFiles.push({ filename, filePath, size_kb: (stats.size / 1024).toFixed(2), format: 'json' });
            }

            // 3. Generate XLSX if requested
            if (formatsToGenerate.includes('xlsx')) {
                if (XLSX && XLSX.utils) {
                    const filename = `ITPR_AutoBackup_${config.type}_${timestamp}.xlsx`;
                    const filePath = path.join(BACKUPS_DIR, filename);

                    const wb = XLSX.utils.book_new();
                    for (const tbl of targetTables) {
                        const rows = tableData[tbl];
                        const sheetName = tbl.length > 31 ? tbl.slice(0, 28) + '...' : tbl;
                        const ws = (rows && rows.length > 0) ? XLSX.utils.json_to_sheet(rows) : XLSX.utils.aoa_to_sheet([['No data']]);
                        XLSX.utils.book_append_sheet(wb, ws, sheetName);
                    }
                    XLSX.writeFile(wb, filePath);
                    const stats = fs.statSync(filePath);
                    generatedFiles.push({ filename, filePath, size_kb: (stats.size / 1024).toFixed(2), format: 'xlsx' });
                } else {
                    console.warn('[BackupScheduler] "xlsx" library not found on server, generating JSON fallback instead.');
                    if (!formatsToGenerate.includes('json')) {
                        const filename = `ITPR_AutoBackup_${config.type}_${timestamp}.json`;
                        const filePath = path.join(BACKUPS_DIR, filename);
                        fs.writeFileSync(filePath, JSON.stringify({ metadata: { type: config.type, timestamp }, data: tableData }, null, 2), 'utf8');
                        const stats = fs.statSync(filePath);
                        generatedFiles.push({ filename, filePath, size_kb: (stats.size / 1024).toFixed(2), format: 'json' });
                    }
                }
            }

            // 4. Prune old backups to respect retention policy
            this.pruneOldBackups(config.retention_count || 15);

            // 5. Update Status
            const primaryFile = generatedFiles[0] || {};
            const updatedConfig = {
                last_run: new Date().toISOString(),
                last_status: 'success',
                last_message: `Auto-backup completed (${generatedFiles.length} files, ${targetTables.length} tables, ${totalRecordsCount} records)`,
                last_filename: primaryFile.filename || null,
                last_size_kb: primaryFile.size_kb || null
            };
            this.saveConfig(updatedConfig);

            // 6. Log Audit Event
            await logAudit(
                1,
                AUDIT_ACTIONS.DATA_EXPORT || 'DATA_EXPORT',
                `Automated Scheduled Backup (${triggerType.toUpperCase()}): Generated ${generatedFiles.map(f => f.filename).join(', ')}`,
                {
                    trigger_type: triggerType,
                    table_count: targetTables.length,
                    total_records: totalRecordsCount,
                    files: generatedFiles.map(f => f.filename)
                }
            ).catch(() => {});

            console.log(`✅ [BackupScheduler] Backup succeeded: ${generatedFiles.map(f => f.filename).join(', ')}`);

            return {
                success: true,
                message: `Backup completed successfully (${generatedFiles.length} files created)`,
                files: generatedFiles,
                total_records: totalRecordsCount,
                table_count: targetTables.length
            };
        } catch (err) {
            console.error('[BackupScheduler] Backup execution failed:', err);
            this.saveConfig({
                last_run: new Date().toISOString(),
                last_status: 'failed',
                last_message: `Backup failed: ${err.message}`
            });
            return { success: false, message: err.message };
        } finally {
            this.isExecuting = false;
        }
    }

    // ── Prune Old Backups ───────────────────────────────────────────────────
    static pruneOldBackups(retentionCount = 15) {
        try {
            const files = fs.readdirSync(BACKUPS_DIR)
                .filter(f => f.startsWith('ITPR_') && (f.endsWith('.sql') || f.endsWith('.json') || f.endsWith('.xlsx')))
                .map(f => {
                    const fullPath = path.join(BACKUPS_DIR, f);
                    const stats = fs.statSync(fullPath);
                    return { filename: f, fullPath, mtime: stats.mtime.getTime() };
                })
                .sort((a, b) => b.mtime - a.mtime); // newest first

            if (files.length > retentionCount) {
                const toRemove = files.slice(retentionCount);
                toRemove.forEach(item => {
                    try {
                        fs.unlinkSync(item.fullPath);
                        console.log(`🧹 [BackupScheduler] Pruned old backup: ${item.filename}`);
                    } catch (e) {
                        console.warn(`[BackupScheduler] Could not prune file ${item.filename}:`, e.message);
                    }
                });
            }
        } catch (e) {
            console.error('[BackupScheduler] Error pruning old backups:', e.message);
        }
    }

    // ── List All Stored Backups ─────────────────────────────────────────────
    static getStoredBackups() {
        try {
            if (!fs.existsSync(BACKUPS_DIR)) return [];
            return fs.readdirSync(BACKUPS_DIR)
                .filter(f => f.startsWith('ITPR_') && (f.endsWith('.sql') || f.endsWith('.json') || f.endsWith('.xlsx')))
                .map(f => {
                    const fullPath = path.join(BACKUPS_DIR, f);
                    const stats = fs.statSync(fullPath);
                    const ext = path.extname(f).slice(1).toLowerCase();
                    return {
                        filename: f,
                        size_bytes: stats.size,
                        size_kb: (stats.size / 1024).toFixed(2),
                        size_mb: (stats.size / (1024 * 1024)).toFixed(2),
                        created_at: stats.mtime.toISOString(),
                        format: ext,
                        is_auto: f.includes('AutoBackup')
                    };
                })
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } catch (e) {
            console.error('[BackupScheduler] Error listing stored backups:', e.message);
            return [];
        }
    }

    // ── Safe Path Resolver ──────────────────────────────────────────────────
    static getBackupPath(filename) {
        if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            throw new Error('Invalid filename');
        }
        const filePath = path.join(BACKUPS_DIR, filename);
        if (!fs.existsSync(filePath)) {
            throw new Error('Backup file not found');
        }
        return filePath;
    }

    // ── Delete Stored Backup ────────────────────────────────────────────────
    static deleteBackup(filename) {
        const filePath = this.getBackupPath(filename);
        fs.unlinkSync(filePath);
        return true;
    }
}

module.exports = BackupScheduler;
