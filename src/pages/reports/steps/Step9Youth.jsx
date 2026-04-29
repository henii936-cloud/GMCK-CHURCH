import React from 'react';
import { Input, Label } from '../../../components/common/UI';

export default function Step9Youth({ data, update }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Youth Ministry Report</h2>
        <p className="text-gray-500 mt-1">Please fill in the details for this quarter.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rate the Activity</label>
          
          <select 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={data.rating || ''}
            onChange={e => update({ rating: e.target.value })}
          >
            <option value="Excellent">Excellent</option>
            <option value="Very Good">Very Good</option>
            <option value="Good">Good</option>
            <option value="Weak">Weak</option>
            <option value="No Activity">No Activity</option>
          </select>
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">If No Activity, Reason?</label>
          
          <Input 
            type="text" 
            value={data.reason || ''} 
            onChange={e => update({ reason: e.target.value })} 
            placeholder="Reason..."
          />
          
        </div>
        
      </div>
    </div>
  );
}
