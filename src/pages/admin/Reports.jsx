import { Card, Button } from "../../components/common/UI";
import { BarChart3, PieChart, FileText, Download, TrendingUp, Calendar, Filter, Share2 } from "lucide-react";
import { motion } from "motion/react";

export default function Reports() {
  const stats = [
    { label: "Total Giving Growth", value: "+18.2%", icon: TrendingUp, color: "#10b981" },
    { label: "New Members (MTD)", value: "24", icon: Calendar, color: "var(--primary)" },
    { label: "Attendance Rate", value: "92%", icon: BarChart3, color: "#f59e0b" },
    { label: "Budget Utilization", value: "64%", icon: PieChart, color: "#ec4899" }
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card title="Monthly Giving Trends" subtitle="Overview of tithes and offerings (Last 6 Months)">
          <div style={{ height: '300px', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Annual Charting Visualization coming soon</p>
          </div>
        </Card>
        
        <Card title="Member Distribution" subtitle="Community demographics by age & location">
           <div style={{ height: '300px', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Demographic Distribution Plot coming soon</p>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: '32px' }}>
        <Card title="Recent Generation Logs" subtitle="Log of all automated system reports">
          <table className="table-glass">
            <thead>
              <tr><th>Report Name</th><th>Date Generated</th><th>Format</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>February Financial Statement</td>
                <td>Mar 01, 2026</td>
                <td><span style={{ fontWeight: '700', fontSize: '0.75rem', color: '#ef4444' }}>PDF</span></td>
                <td><span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.75rem' }}>READY</span></td>
                <td><button style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem' }}>Download</button></td>
              </tr>
              <tr>
                <td>Quarterly Attendance Review</td>
                <td>Jan 15, 2026</td>
                <td><span style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--primary)' }}>XLSX</span></td>
                <td><span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.75rem' }}>READY</span></td>
                <td><button style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem' }}>Download</button></td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
