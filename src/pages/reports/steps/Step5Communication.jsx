import React from 'react';
import { Input, Label } from '../../../components/common/UI';

export default function Step5Communication({ data, update }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Communication Ministry Report</h2>
        <p className="text-gray-500 mt-1">Please fill in the details for this quarter.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Reports to Elders</label>
          
          <Input 
            type="number" 
            value={data.monthly_reports_to_elders || ''} 
            onChange={e => update({ monthly_reports_to_elders: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reports sent to Regional/Main Office</label>
          
          <Input 
            type="number" 
            value={data.reports_to_regional_office || ''} 
            onChange={e => update({ reports_to_regional_office: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">If not sent, reason?</label>
          
          <Input 
            type="text" 
            value={data.reason_not_sent || ''} 
            onChange={e => update({ reason_not_sent: e.target.value })} 
            placeholder="Reason..."
          />
          
        </div>
        
      </div>
    </div>
  );
}
