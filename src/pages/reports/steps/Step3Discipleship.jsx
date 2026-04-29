import React from 'react';
import { Input, Label } from '../../../components/common/UI';

export default function Step3Discipleship({ data, update }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Discipleship Ministry Report</h2>
        <p className="text-gray-500 mt-1">Please fill in the details for this quarter.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registered for Raising Leaders</label>
          
          <Input 
            type="number" 
            value={data.registered_raising_leaders || ''} 
            onChange={e => update({ registered_raising_leaders: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Times Learning (Raising Leaders)</label>
          
          <Input 
            type="number" 
            value={data.times_learning || ''} 
            onChange={e => update({ times_learning: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Times Training Given to Servants</label>
          
          <Input 
            type="number" 
            value={data.servants_training_times || ''} 
            onChange={e => update({ servants_training_times: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Servants Trained</label>
          
          <Input 
            type="number" 
            value={data.servants_trained_count || ''} 
            onChange={e => update({ servants_trained_count: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
      </div>
    </div>
  );
}
