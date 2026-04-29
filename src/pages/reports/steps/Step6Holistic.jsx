import React from 'react';
import { Input, Label } from '../../../components/common/UI';

export default function Step6Holistic({ data, update }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Holistic Ministry Report</h2>
        <p className="text-gray-500 mt-1">Please fill in the details for this quarter.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Needy People Supported</label>
          
          <Input 
            type="number" 
            value={data.needy_people_supported || ''} 
            onChange={e => update({ needy_people_supported: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teachings Given on Financial Giving</label>
          
          <Input 
            type="number" 
            value={data.financial_giving_teachings_count || ''} 
            onChange={e => update({ financial_giving_teachings_count: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
      </div>
    </div>
  );
}
