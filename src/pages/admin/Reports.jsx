import { useState, useEffect } from "react";
import { Card, Button } from "../../components/common/UI";
import { BarChart3, PieChart, FileText, Download, TrendingUp, Calendar, Filter, Share2, Users, BookOpen, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { attendanceService, studyService, financeService, memberService } from "../../services/api";
import AttendanceHistory from "../../components/common/AttendanceHistory";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [studyProgress, setStudyProgress] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attData, studyData, transData, memData] = await Promise.all([
        attendanceService.getAllAttendance(),
        studyService.getAllStudyProgress(),
        financeService.getTransactions(),
        memberService.getMembers()
      ]);
      setAttendance(attData || []);
      setStudyProgress(studyData || []);
      setTransactions(transData || []);
      setMembers(memData || []);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'tithe' || t.category === 'Tithes' || t.type === 'offering' || t.category === 'Offering' || t.type === 'donation' || t.category === 'Donation' || t.type === 'first_fruit' || t.category === 'First Fruit' || t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const totalAttendanceRecords = attendance.length;
  const attendanceRate = totalAttendanceRecords > 0 ? Math.round((presentCount / totalAttendanceRecords) * 100) : 0;

  const stats = [
    { label: "Total Income", value: `$${totalIncome.toLocaleString()}`, icon: TrendingUp, color: "#10b981" },
    { label: "Total Members", value: members.length.toString(), icon: Users, color: "var(--primary)" },
    { label: "Attendance Rate", value: `${attendanceRate}%`, icon: BarChart3, color: "#f59e0b" },
    { label: "Study Sessions", value: studyProgress.length.toString(), icon: BookOpen, color: "#ec4899" }
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Analytics & <span style={{ color: 'var(--primary)' }}>Reports</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>Deep insights into church growth, finances, and member engagement</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" icon={Share2}>Share Dashboard</Button>
          <Button icon={Download}>Export Annual Report (PDF)</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {stats.map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="stat-card" style={{ borderLeft: `4px solid ${stat.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="stat-label">{stat.label}</span>
                <stat.icon size={20} style={{ color: stat.color, opacity: 0.8 }} />
              </div>
              <span className="stat-value">{stat.value}</span>
            </Card>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <Card title="Recent Attendance" subtitle="Latest group attendance records">
          <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
            <AttendanceHistory history={attendance} />
          </div>
        </Card>
        
        <Card title="Study Progress" subtitle="Recent bible study completions">
           <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Group</th>
                  <th>Topic/Book</th>
                  <th>Chapter</th>
                </tr>
              </thead>
              <tbody>
                {studyProgress.slice(0, 10).map(s => (
                  <tr key={s.id}>
                    <td>{new Date(s.completion_date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: '600' }}>{s.bible_study_groups?.group_name || 'Unknown'}</td>
                    <td>{s.topic_or_book}</td>
                    <td>{s.chapter}</td>
                  </tr>
                ))}
                {studyProgress.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No study progress records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: '32px' }}>
        <Card title="Finance Summary" subtitle="Recent financial transactions">
          <table className="table-glass">
            <thead>
              <tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map(t => (
                <tr key={t.id}>
                  <td>{new Date(t.transaction_date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: '600' }}>{t.description}</td>
                  <td>{t.category}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700',
                      background: t.type === 'Income' || t.type === 'tithe' || t.type === 'offering' || t.type === 'donation' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: t.type === 'Income' || t.type === 'tithe' || t.type === 'offering' || t.type === 'donation' ? '#10b981' : '#ef4444'
                    }}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: t.type === 'Income' || t.type === 'tithe' || t.type === 'offering' || t.type === 'donation' ? '#10b981' : '#ef4444' }}>
                    {t.type === 'Income' || t.type === 'tithe' || t.type === 'offering' || t.type === 'donation' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No transactions found.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
