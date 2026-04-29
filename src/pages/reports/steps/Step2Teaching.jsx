import React from 'react';
import { Input, Label } from '../../../components/common/UI';

export default function Step2Teaching({ data, update }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Teaching Ministry Report</h2>
        <p className="text-gray-500 mt-1">Please fill in the details for this quarter.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Small Group Members (Men)</label>
          
          <Input 
            type="number" 
            value={data.new_small_group_members_men || ''} 
            onChange={e => update({ new_small_group_members_men: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Small Group Members (Women)</label>
          
          <Input 
            type="number" 
            value={data.new_small_group_members_female || ''} 
            onChange={e => update({ new_small_group_members_female: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Active Small Groups</label>
          
          <Input 
            type="number" 
            value={data.active_small_groups_count || ''} 
            onChange={e => update({ active_small_groups_count: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Small Groups Added This Quarter</label>
          
          <Input 
            type="number" 
            value={data.new_small_groups_added || ''} 
            onChange={e => update({ new_small_groups_added: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Small Groups Overall</label>
          
          <Input 
            type="number" 
            value={data.total_small_groups || ''} 
            onChange={e => update({ total_small_groups: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
      </div>
    </div>
  );
}
