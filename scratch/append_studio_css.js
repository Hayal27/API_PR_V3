const fs = require('fs');

const cssPath = 'frontend/src/components/meetings/MeetingModalAdvanced.css';
let css = fs.readFileSync(cssPath, 'utf8');

const newStyles = `
/* =====================================================
   STUDIO EXTENSIONS - RECURRENCE, CONFLICTS & TEMPLATES
   ===================================================== */
.timezone-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 800;
  color: #0c7c92;
  background: #ecfeff;
  border: 1px solid #a5f3fc;
  padding: 3px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.studio-recurrence-card {
  background: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s ease;
}

.studio-recurrence-card:hover {
  border-color: #0c7c92;
  background: #f0fdfa;
}

.studio-recurrence-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.studio-recurrence-toggle input[type="checkbox"] {
  width: 17px;
  height: 17px;
  accent-color: #0c7c92;
  cursor: pointer;
}

.rec-options-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}

.rec-select-lbl {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.studio-select-inline {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
  outline: none;
}

.studio-select-inline:focus {
  border-color: #0c7c92;
}

.studio-conflict-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fffbeb;
  border: 1.5px solid #fde68a;
  border-radius: 12px;
  padding: 12px 16px;
  color: #92400e;
  animation: notificationSlideIn 0.25s ease;
}

.studio-conflict-alert .alert-icon {
  font-size: 18px;
  color: #d97706;
  flex-shrink: 0;
  margin-top: 1px;
}

.studio-conflict-alert .alert-content {
  font-size: 12.5px;
  line-height: 1.4;
}

.agenda-template-pills {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.template-btn {
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  cursor: pointer;
  transition: all 0.18s ease;
}

.template-btn:hover {
  background: #0f1f4b;
  color: #ffffff;
  border-color: #0f1f4b;
}

.studio-notifications-checks {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
`;

fs.writeFileSync(cssPath, css + '\n' + newStyles, 'utf8');
console.log('Appended studio CSS styles successfully!');
