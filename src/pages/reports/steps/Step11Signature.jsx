import React from 'react';
import { Input, Label } from '../../../components/common/UI';

export default function Step11Signature({ data, update }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Signature Ministry Report</h2>
        <p className="text-gray-500 mt-1">Please fill in the details for this quarter.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Submitter Name</label>
          
          <Input 
            type="text" 
            value={data.submitter_name || ''} 
            onChange={e => update({ submitter_name: e.target.value })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Submission Date</label>
          
          <Input 
            type="text" 
            value={data.submitter_date || ''} 
            onChange={e => update({ submitter_date: e.target.value })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chairman Name</label>
          
          <Input 
            type="text" 
            value={data.chairman_name || ''} 
            onChange={e => update({ chairman_name: e.target.value })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chairman Approval Date</label>
          
          <Input 
            type="text" 
            value={data.chairman_date || ''} 
            onChange={e => update({ chairman_date: e.target.value })} 
            placeholder=""
          />
          
        </div>
        
      </div>
    </div>
  );
}
