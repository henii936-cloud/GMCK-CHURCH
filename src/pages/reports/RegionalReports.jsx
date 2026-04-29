import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Card, Button } from '../../components/common/UI';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';

const RegionalReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('quarterly_reports')
        .select(`
          *,
          profiles:created_by (full_name, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('quarterly_reports')
        .update({ status: 'Approved' })
        .eq('id', id);

      if (error) throw error;
      fetchReports();
    } catch (error) {
      console.error('Error approving report:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12">Loading reports...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="display-sm text-primary">Regional Ministry Reports</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reports.length === 0 ? (
          <Card className="text-center p-12">
            <p className="text-on-surface-variant">No reports found.</p>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">
                      {report.year} - {report.quarter}
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      Submitted by: {report.profiles?.full_name} ({report.profiles?.role})
                    </p>
                    <p className="text-xs text-on-surface-variant/60 mt-1">
                      Date: {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${
                    report.status === 'Approved' 
                      ? 'bg-green-100 text-green-700' 
                      : report.status === 'Submitted'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {report.status === 'Approved' ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {report.status}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      icon={Download}
                      onClick={() => window.print()}
                    >
                      Export
                    </Button>
                    
                    {report.status === 'Submitted' && (
                      <Button 
                        variant="primary"
                        onClick={() => handleApprove(report.id)}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-outline-variant/10 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-xs opacity-60 uppercase font-bold tracking-wider">New Converts</p>
                  <p className="text-xl font-bold text-primary">{report.data?.evangelism?.newConverts || 0}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-xs opacity-60 uppercase font-bold tracking-wider">Baptized</p>
                  <p className="text-xl font-bold text-primary">{report.data?.evangelism?.baptized || 0}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-xs opacity-60 uppercase font-bold tracking-wider">Total Groups</p>
                  <p className="text-xl font-bold text-primary">{report.data?.discipleship?.totalGroups || 0}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-xs opacity-60 uppercase font-bold tracking-wider">Attendance</p>
                  <p className="text-xl font-bold text-primary">{report.data?.discipleship?.avgAttendance || 0}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RegionalReports;
