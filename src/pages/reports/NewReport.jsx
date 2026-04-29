import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { getCurrentAndPreviousQuarters } from '../../utils/ethiopianCalendar';
import { 
  ChevronRight, ChevronLeft, Save, Send, FileText, 
  Users, BookOpen, Heart, Activity, CheckCircle
} from 'lucide-react';
import { Button, Input, Select, Card } from '../../components/common/UI';

// Individual Step Components
import Step1Evangelism from './steps/Step1Evangelism';
import Step2Teaching from './steps/Step2Teaching';
import Step3Discipleship from './steps/Step3Discipleship';
import Step4MinistrySupport from './steps/Step4MinistrySupport';
import Step5Communication from './steps/Step5Communication';
import Step6Holistic from './steps/Step6Holistic';
import Step7Prayer from './steps/Step7Prayer';
import Step8Women from './steps/Step8Women';
import Step9Youth from './steps/Step9Youth';
import Step10Children from './steps/Step10Children';
import Step11Signature from './steps/Step11Signature';

const STEPS = [
  { id: 0, title: 'Setup', icon: FileText },
  { id: 1, title: 'Evangelism', icon: Users },
  { id: 2, title: 'Teaching', icon: BookOpen },
  { id: 3, title: 'Discipleship', icon: Users },
  { id: 4, title: 'Ministry Support', icon: Heart },
  { id: 5, title: 'Communication', icon: Activity },
  { id: 6, title: 'Holistic Ministry', icon: Heart },
  { id: 7, title: 'Prayer & Fasting', icon: Activity },
  { id: 8, title: 'Women Ministry', icon: Users },
  { id: 9, title: 'Youth Ministry', icon: Users },
  { id: 10, title: 'Children Ministry', icon: Users },
  { id: 11, title: 'Signature & Submit', icon: CheckCircle },
];

export default function NewReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quarters, setQuarters] = useState([]);
  
  const [formData, setFormData] = useState({
    region: '',
    periodId: '',
    
    // Step 1
    evangelism: {
      witnessed_men: 0, witnessed_female: 0,
      saved_men: 0, saved_female: 0,
      baptized_men: 0, baptized_female: 0,
      repented_men: 0, repented_female: 0,
      growth_percentage: 0,
      outreach_stations_count: 0,
      outreach_stations_names: '',
      outreach_stations_plan: ''
    },
    // Step 2
    teaching: {
      new_small_group_members_men: 0, new_small_group_members_female: 0,
      active_small_groups_count: 0,
      new_small_groups_added: 0,
      total_small_groups: 0
    },
    // Step 3
    discipleship: {
      registered_raising_leaders: 0, times_learning: 0,
      servants_training_times: 0, servants_trained_count: 0
    },
    // Step 4
    support: {
      evangelism_visits: 0, discipleship_visits: 0, teaching_visits: 0,
      development_visits: 0, deacon_visits: 0, stage_visits: 0,
      youth_visits: 0, marriage_counseling_visits: 0
    },
    // Step 5
    communication: {
      monthly_reports_to_elders: 0,
      reports_to_regional_office: 0,
      reason_not_sent: ''
    },
    // Step 6
    holistic: {
      needy_people_supported: 0,
      financial_giving_teachings_count: 0
    },
    // Step 7
    prayer: {
      prayer_fasting_programs_count: 0
    },
    // Step 8
    women: { rating: 'Good', reason: '' },
    // Step 9
    youth: { rating: 'Good', reason: '' },
    // Step 10
    children: { rating: 'Good', reason: '' },
    // Step 11
    signature: {
      submitter_name: '',
      submitter_date: new Date().toISOString().split('T')[0],
      chairman_name: '',
      chairman_date: new Date().toISOString().split('T')[0]
    }
  });

  useEffect(() => {
    setQuarters(getCurrentAndPreviousQuarters());
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const updateSection = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const handleSaveDraft = async () => {
    await submitReport('Draft');
  };

  const handleSubmit = async () => {
    await submitReport('Submitted');
  };

  const submitReport = async (status) => {
    setIsSubmitting(true);
    try {
      const selectedPeriod = quarters.find(q => q.id === formData.periodId);
      
      const payload = {
        created_by: user.id,
        region: formData.region,
        year: selectedPeriod?.year || '',
        quarter: selectedPeriod?.quarter || '',
        gregorian_start_date: selectedPeriod?.gregorian_start_iso,
        gregorian_end_date: selectedPeriod?.gregorian_end_iso,
        ethiopian_start_date: selectedPeriod?.ethiopian_start,
        ethiopian_end_date: selectedPeriod?.ethiopian_end,
        chairman_name: formData.signature.chairman_name,
        status: status,
        data: formData
      };

      const { error } = await supabase.from('quarterly_reports').insert([payload]);
      
      if (error) throw error;
      
      alert(`Report successfully saved as ${status}!`);
      // Redirect based on role
      navigate(-1);
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Failed to save report: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = () => {
    switch(currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Report Setup</h2>
            <p className="text-gray-500">Please select the region and reporting period.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region / Local Church</label>
                <Input 
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  placeholder="Enter Region Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Period</label>
                <Select
                  value={formData.periodId}
                  onChange={(e) => setFormData({...formData, periodId: e.target.value})}
                  options={[
                    { value: '', label: 'Select Period' },
                    ...quarters.map(q => ({
                      value: q.id,
                      label: `${q.year} - ${q.label} | ${q.gregorian_start} to ${q.gregorian_end} / ${q.ethiopian_start} to ${q.ethiopian_end}`
                    }))
                  ]}
                />
              </div>
            </div>
          </div>
        );
      case 1: return <Step1Evangelism data={formData.evangelism} update={(d) => updateSection('evangelism', d)} />;
      case 2: return <Step2Teaching data={formData.teaching} update={(d) => updateSection('teaching', d)} />;
      case 3: return <Step3Discipleship data={formData.discipleship} update={(d) => updateSection('discipleship', d)} />;
      case 4: return <Step4MinistrySupport data={formData.support} update={(d) => updateSection('support', d)} />;
      case 5: return <Step5Communication data={formData.communication} update={(d) => updateSection('communication', d)} />;
      case 6: return <Step6Holistic data={formData.holistic} update={(d) => updateSection('holistic', d)} />;
      case 7: return <Step7Prayer data={formData.prayer} update={(d) => updateSection('prayer', d)} />;
      case 8: return <Step8Women data={formData.women} update={(d) => updateSection('women', d)} />;
      case 9: return <Step9Youth data={formData.youth} update={(d) => updateSection('youth', d)} />;
      case 10: return <Step10Children data={formData.children} update={(d) => updateSection('children', d)} />;
      case 11: return <Step11Signature data={formData.signature} update={(d) => updateSection('signature', d)} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Quarterly Report</h1>
          <p className="mt-2 text-sm text-gray-600">Meserete Kristos Church Regional Reporting System</p>
        </div>
        <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Steps Progress */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;
              const isPast = currentStep > index;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : isPast 
                        ? 'text-gray-900 hover:bg-gray-50' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-700' : isPast ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <span className="truncate">{step.title}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form Content area */}
        <div className="flex-1">
          <Card className="shadow-sm border-gray-200 p-6 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                >
                  {CurrentStepComponent()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleBack} 
                  disabled={currentStep === 0 || isSubmitting}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting || !formData.periodId} className="bg-green-600 hover:bg-green-700">
                    {isSubmitting ? 'Submitting...' : 'Submit Final Report'}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
