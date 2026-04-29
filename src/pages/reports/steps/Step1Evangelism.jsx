import React from 'react';
import { Input, Label } from '../../../components/common/UI';

export default function Step1Evangelism({ data, update }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Evangelism Ministry Report</h2>
        <p className="text-gray-500 mt-1">Please fill in the details for this quarter.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Witnessed (Men)</label>
          
          <Input 
            type="number" 
            value={data.witnessed_men || ''} 
            onChange={e => update({ witnessed_men: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Witnessed (Women)</label>
          
          <Input 
            type="number" 
            value={data.witnessed_female || ''} 
            onChange={e => update({ witnessed_female: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Saved (Men)</label>
          
          <Input 
            type="number" 
            value={data.saved_men || ''} 
            onChange={e => update({ saved_men: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Saved (Women)</label>
          
          <Input 
            type="number" 
            value={data.saved_female || ''} 
            onChange={e => update({ saved_female: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Baptized (Men)</label>
          
          <Input 
            type="number" 
            value={data.baptized_men || ''} 
            onChange={e => update({ baptized_men: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Baptized (Women)</label>
          
          <Input 
            type="number" 
            value={data.baptized_female || ''} 
            onChange={e => update({ baptized_female: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Returned/Repented (Men)</label>
          
          <Input 
            type="number" 
            value={data.repented_men || ''} 
            onChange={e => update({ repented_men: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Returned/Repented (Women)</label>
          
          <Input 
            type="number" 
            value={data.repented_female || ''} 
            onChange={e => update({ repented_female: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Growth Percentage vs Last Quarter (%)</label>
          
          <Input 
            type="number" 
            value={data.growth_percentage || ''} 
            onChange={e => update({ growth_percentage: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Outreach Stations Count</label>
          
          <Input 
            type="number" 
            value={data.outreach_stations_count || ''} 
            onChange={e => update({ outreach_stations_count: parseInt(e.target.value) || 0 })} 
            placeholder=""
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Outreach Stations Names</label>
          
          <Input 
            type="text" 
            value={data.outreach_stations_names || ''} 
            onChange={e => update({ outreach_stations_names: e.target.value })} 
            placeholder="Names..."
          />
          
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Outreach Stations Plan (if none)</label>
          
          <Input 
            type="text" 
            value={data.outreach_stations_plan || ''} 
            onChange={e => update({ outreach_stations_plan: e.target.value })} 
            placeholder="Plan..."
          />
          
        </div>
        
      </div>
    </div>
  );
}
