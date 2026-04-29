import React from 'react';
import { Input, Label } from '../../../components/common/UI';

export default function Step7Prayer({ data, update }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Prayer Ministry Report</h2>
        <p className="text-gray-500 mt-1">Please fill in the details for this quarter.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prayer & Fasting Programs Conducted</label>
          
          <Input 
            type="number" 
            value={data.prayer_fasting_programs_count || ''} 
            onChange={e => update({ prayer_fasting_programs_count: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
      </div>
    </div>
  );
}
