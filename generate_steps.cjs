const fs = require('fs');
const path = require('path');

const stepsDir = path.join(__dirname, 'src/pages/reports/steps');

const createStep = (filename, name, fields) => {
  const content = `import React from 'react';
import { Input, Label } from '../../../components/common/UI';

export default function ${name}({ data, update }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">${name.replace(/Step\d+/, '')} Ministry Report</h2>
        <p className="text-gray-500 mt-1">Please fill in the details for this quarter.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${fields.map(f => `
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">${f.label}</label>
          ${f.type === 'select' ? `
          <select 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={data.${f.key} || ''}
            onChange={e => update({ ${f.key}: e.target.value })}
          >
            <option value="Excellent">Excellent</option>
            <option value="Very Good">Very Good</option>
            <option value="Good">Good</option>
            <option value="Weak">Weak</option>
            <option value="No Activity">No Activity</option>
          </select>
          ` : `
          <Input 
            type="${f.type}" 
            value={data.${f.key} || ''} 
            onChange={e => update({ ${f.key}: ${f.type === 'number' ? 'parseInt(e.target.value) || 0' : 'e.target.value'} })} 
            placeholder="${f.placeholder || ''}"
          />
          `}
        </div>
        `).join('')}
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(stepsDir, filename), content);
};

createStep('Step1Evangelism.jsx', 'Step1Evangelism', [
  { label: 'Witnessed (Men)', key: 'witnessed_men', type: 'number' },
  { label: 'Witnessed (Women)', key: 'witnessed_female', type: 'number' },
  { label: 'Saved (Men)', key: 'saved_men', type: 'number' },
  { label: 'Saved (Women)', key: 'saved_female', type: 'number' },
  { label: 'Baptized (Men)', key: 'baptized_men', type: 'number' },
  { label: 'Baptized (Women)', key: 'baptized_female', type: 'number' },
  { label: 'Returned/Repented (Men)', key: 'repented_men', type: 'number' },
  { label: 'Returned/Repented (Women)', key: 'repented_female', type: 'number' },
  { label: 'Growth Percentage vs Last Quarter (%)', key: 'growth_percentage', type: 'number' },
  { label: 'Outreach Stations Count', key: 'outreach_stations_count', type: 'number' },
  { label: 'Outreach Stations Names', key: 'outreach_stations_names', type: 'text', placeholder: 'Names...' },
  { label: 'Outreach Stations Plan (if none)', key: 'outreach_stations_plan', type: 'text', placeholder: 'Plan...' },
]);

createStep('Step2Teaching.jsx', 'Step2Teaching', [
  { label: 'New Small Group Members (Men)', key: 'new_small_group_members_men', type: 'number' },
  { label: 'New Small Group Members (Women)', key: 'new_small_group_members_female', type: 'number' },
  { label: 'Total Active Small Groups', key: 'active_small_groups_count', type: 'number' },
  { label: 'New Small Groups Added This Quarter', key: 'new_small_groups_added', type: 'number' },
  { label: 'Total Small Groups Overall', key: 'total_small_groups', type: 'number' },
]);

createStep('Step3Discipleship.jsx', 'Step3Discipleship', [
  { label: 'Registered for Raising Leaders', key: 'registered_raising_leaders', type: 'number' },
  { label: 'Times Learning (Raising Leaders)', key: 'times_learning', type: 'number' },
  { label: 'Times Training Given to Servants', key: 'servants_training_times', type: 'number' },
  { label: 'Total Servants Trained', key: 'servants_trained_count', type: 'number' },
]);

createStep('Step4MinistrySupport.jsx', 'Step4MinistrySupport', [
  { label: 'Evangelism Visits', key: 'evangelism_visits', type: 'number' },
  { label: 'Discipleship Visits', key: 'discipleship_visits', type: 'number' },
  { label: 'Teaching Visits', key: 'teaching_visits', type: 'number' },
  { label: 'Development Ministry Visits', key: 'development_visits', type: 'number' },
  { label: 'Deacon Ministry Visits', key: 'deacon_visits', type: 'number' },
  { label: 'Stage Ministry Visits', key: 'stage_visits', type: 'number' },
  { label: 'Youth Ministry Visits', key: 'youth_visits', type: 'number' },
  { label: 'Marriage & Counseling Visits', key: 'marriage_counseling_visits', type: 'number' },
]);

createStep('Step5Communication.jsx', 'Step5Communication', [
  { label: 'Monthly Reports to Elders', key: 'monthly_reports_to_elders', type: 'number' },
  { label: 'Reports sent to Regional/Main Office', key: 'reports_to_regional_office', type: 'number' },
  { label: 'If not sent, reason?', key: 'reason_not_sent', type: 'text', placeholder: 'Reason...' },
]);

createStep('Step6Holistic.jsx', 'Step6Holistic', [
  { label: 'Needy People Supported', key: 'needy_people_supported', type: 'number' },
  { label: 'Teachings Given on Financial Giving', key: 'financial_giving_teachings_count', type: 'number' },
]);

createStep('Step7Prayer.jsx', 'Step7Prayer', [
  { label: 'Prayer & Fasting Programs Conducted', key: 'prayer_fasting_programs_count', type: 'number' },
]);

createStep('Step8Women.jsx', 'Step8Women', [
  { label: 'Rate the Activity', key: 'rating', type: 'select' },
  { label: 'If No Activity, Reason?', key: 'reason', type: 'text', placeholder: 'Reason...' },
]);

createStep('Step9Youth.jsx', 'Step9Youth', [
  { label: 'Rate the Activity', key: 'rating', type: 'select' },
  { label: 'If No Activity, Reason?', key: 'reason', type: 'text', placeholder: 'Reason...' },
]);

createStep('Step10Children.jsx', 'Step10Children', [
  { label: 'Rate the Activity', key: 'rating', type: 'select' },
  { label: 'If No Activity, Reason?', key: 'reason', type: 'text', placeholder: 'Reason...' },
]);

createStep('Step11Signature.jsx', 'Step11Signature', [
  { label: 'Submitter Name', key: 'submitter_name', type: 'text' },
  { label: 'Submission Date', key: 'submitter_date', type: 'text' },
  { label: 'Chairman Name', key: 'chairman_name', type: 'text' },
  { label: 'Chairman Approval Date', key: 'chairman_date', type: 'text' },
]);

console.log("Steps generated successfully.");
