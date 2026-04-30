import React, { useState } from 'react';
import { ChurchReportGenerator } from '../../services/reportGenerator';
import { reportFetcher } from '../../services/reportFetcher';
import { Button, Card } from '../../components/common/UI';
import { Download, FileText, Printer, CheckCircle, ChevronRight, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportGeneratorView() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generator = new ChurchReportGenerator(reportFetcher, {
        gregorianYear: selectedYear,
      });
      const generatedReport = await generator.generate(selectedQuarter);
      setReport(generatedReport);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 no-print">
        <div className="max-w-2xl">
          <p className="label-sm text-tertiary-fixed-dim mb-2 tracking-[0.3em]">Official Documentation</p>
          <h1 className="display-sm text-primary mb-2">Quarterly Report <span className="text-tertiary-fixed-dim italic">Generator</span></h1>
          <p className="text-on-surface-variant font-medium text-sm">Generate comprehensive ministry reports based on regional office standards.</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedQuarter} 
            onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
            className="editorial-input w-32 bg-surface-container-low"
          >
            <option value={1}>1st Quarter</option>
            <option value={2}>2nd Quarter</option>
            <option value={3}>3rd Quarter</option>
            <option value={4}>4th Quarter</option>
          </select>
          <Button onClick={handleGenerate} loading={loading} icon={FileText}>
            Generate
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {report ? (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Actions for the report */}
            <div className="flex justify-end gap-4 no-print">
              <Button variant="secondary" onClick={handlePrint} icon={Printer}>Print Report</Button>
              <Button icon={Download}>Export PDF</Button>
            </div>

            {/* The Actual Report Document */}
            <Card className="p-12 bg-white text-gray-900 shadow-2xl border-none font-serif print:shadow-none print:p-0">
              {/* Report Header */}
              <div className="text-center border-b-2 border-primary/20 pb-8 mb-10">
                <h2 className="text-2xl font-bold uppercase tracking-widest text-primary mb-2">{report.header.organization}</h2>
                <h3 className="text-xl font-bold mb-4">{report.header.churchName} - {report.header.region}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10">
                    <p className="font-bold text-primary uppercase text-[10px] tracking-widest mb-1">Reporting Period (Gregorian)</p>
                    <p>{report.header.reportingPeriod.gregorian}</p>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10">
                    <p className="font-bold text-primary uppercase text-[10px] tracking-widest mb-1">Reporting Period (Ethiopian)</p>
                    <p>{report.header.reportingPeriod.ethiopian}</p>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-12">
                {report.sections.map((section) => (
                  <div key={section.section} className="page-break-inside-avoid">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-lg">
                        {section.section}
                      </div>
                      <h4 className="text-xl font-black text-primary uppercase tracking-tight">{section.title}</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-14">
                      {Object.entries(section.items).map(([key, item]) => {
                        if (key === 'ministryVisits') return null; // Handle separately
                        
                        return (
                          <div key={key} className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/5">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-black text-primary opacity-40">{key}</span>
                              <CheckCircle size={14} className="text-primary/20" />
                            </div>
                            <p className="text-sm font-bold text-gray-700 mb-2 leading-snug">{item.label || key}</p>
                            
                            <div className="flex gap-6 mt-3">
                              {item.men !== undefined && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Men</p>
                                  <p className="text-xl font-black text-primary">{item.men}</p>
                                </div>
                              )}
                              {item.women !== undefined && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Women</p>
                                  <p className="text-xl font-black text-primary">{item.women}</p>
                                </div>
                              )}
                              {item.total !== undefined && (
                                <div className="border-l border-outline-variant/20 pl-6">
                                  <p className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Total</p>
                                  <p className="text-xl font-black text-tertiary">{item.total}</p>
                                </div>
                              )}
                              {item.count !== undefined && item.men === undefined && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Count</p>
                                  <p className="text-xl font-black text-primary">{item.count}</p>
                                </div>
                              )}
                              {item.rating !== undefined && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Rating</p>
                                  <p className="text-xl font-black text-primary uppercase">{item.rating}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Detailed stats like growth */}
                            <div className="mt-4 flex flex-wrap gap-4">
                              {item.withinQuarter && (
                                <div className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                                  <p className="text-[9px] font-black uppercase text-primary">Growth this Quarter: {item.withinQuarter}</p>
                                </div>
                              )}
                              {item.vsLastQuarter && (
                                <div className="bg-tertiary/5 px-3 py-1 rounded-full border border-tertiary/10">
                                  <p className="text-[9px] font-black uppercase text-tertiary">Vs Last Quarter: {item.vsLastQuarter}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Ministry Visits Table (Section 4) */}
                    {section.items.ministryVisits && (
                      <div className="mt-6 ml-14 overflow-hidden rounded-3xl border border-outline-variant/10">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="bg-surface-container-low">
                              <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-primary">Ministry Department</th>
                              <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-primary text-center">Encouragement Visits</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/5">
                            {section.items.ministryVisits.map((row) => (
                              <tr key={row.ministry} className="hover:bg-surface-container-lowest transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-700">{row.ministry}</td>
                                <td className="px-6 py-4 font-black text-primary text-center">{row.timesEncouraged}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer / Signatures */}
              <div className="mt-20 pt-12 border-t-2 border-primary/10 grid grid-cols-2 gap-20">
                <div className="space-y-12">
                  <div className="border-b border-gray-400 h-10 flex items-end">
                    <p className="text-sm font-bold text-gray-400 italic">Signature: {report.footer.filledBy}</p>
                  </div>
                  <p className="text-xs uppercase font-black tracking-widest text-primary">Prepared By</p>
                </div>
                <div className="space-y-12">
                  <div className="border-b border-gray-400 h-10 flex items-end">
                    <p className="text-sm font-bold text-gray-700">{report.footer.chairman}</p>
                  </div>
                  <p className="text-xs uppercase font-black tracking-widest text-primary">Approved By (Chairman)</p>
                </div>
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.5em]">Generated on {report.footer.date} via {report.footer.filledBy}</p>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 rounded-[40px] bg-surface-container-low grid place-items-center mb-8 shadow-whisper">
              <Layout size={40} className="text-primary/20" />
            </div>
            <h2 className="text-2xl font-black text-primary mb-4 uppercase tracking-tighter">Ready to Generate</h2>
            <p className="text-on-surface-variant max-w-sm font-medium leading-relaxed">Select a reporting period and click generate to compile all church activities into the official regional office format.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
