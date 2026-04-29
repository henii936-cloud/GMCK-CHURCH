import React from 'react';
import { Input, Label } from '../../../components/common/UI';

export default function Step4MinistrySupport({ data, update }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">MinistrySupport Ministry Report</h2>
        <p className="text-gray-500 mt-1">Please fill in the details for this quarter.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Evangelism Visits</label>
          
          <Input 
            type="number" 
            value={data.evangelism_visits || ''} 
            onChange={e => update({ evangelism_visits: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discipleship Visits</label>
          
          <Input 
            type="number" 
            value={data.discipleship_visits || ''} 
            onChange={e => update({ discipleship_visits: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Visits</label>
          
          <Input 
            type="number" 
            value={data.teaching_visits || ''} 
            onChange={e => update({ teaching_visits: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Development Ministry Visits</label>
          
          <Input 
            type="number" 
            value={data.development_visits || ''} 
            onChange={e => update({ development_visits: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deacon Ministry Visits</label>
          
          <Input 
            type="number" 
            value={data.deacon_visits || ''} 
            onChange={e => update({ deacon_visits: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stage Ministry Visits</label>
          
          <Input 
            type="number" 
            value={data.stage_visits || ''} 
            onChange={e => update({ stage_visits: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Youth Ministry Visits</label>
          
          <Input 
            type="number" 
            value={data.youth_visits || ''} 
            onChange={e => update({ youth_visits: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marriage & Counseling Visits</label>
          
          <Input 
            type="number" 
            value={data.marriage_counseling_visits || ''} 
            onChange={e => update({ marriage_counseling_visits: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
      </div>
    </div>
  );
}
