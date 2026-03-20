import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { Card, Button, Input, Modal } from "../../components/common/UI";
import { DollarSign, TrendingUp, TrendingDown, Plus, Filter, Search, Trash2, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "Income",
    category: "Tithes",
    amount: "",
    description: "",
    transaction_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          ...formData,
          amount: parseFloat(formData.amount)
        }]);
      if (error) throw error;
      
      setIsModalOpen(false);
      setFormData({ type: "Income", category: "Tithes", amount: "", description: "", transaction_date: new Date().toISOString().split('T')[0] });
      fetchTransactions();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Church Finance</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track tithes, offerings, and church expenses</p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>New Transaction</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <Card style={{ padding: '24px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', marginBottom: '12px' }}>
            <TrendingUp size={20} />
            <span style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Income</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>${totalIncome.toLocaleString()}</h2>
        </Card>
        <Card style={{ padding: '24px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444', marginBottom: '12px' }}>
            <TrendingDown size={20} />
            <span style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Expenses</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>${totalExpense.toLocaleString()}</h2>
        </Card>
        <Card style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)', marginBottom: '12px' }}>
            <DollarSign size={20} />
            <span style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase' }}>Current Balance</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>${balance.toLocaleString()}</h2>
        </Card>
      </div>

      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Recent Transactions</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '44px', width: '250px' }}
              />
            </div>
            <Button variant="outline" icon={Filter}>Filter</Button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Description</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Category</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Type</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '16px 24px', width: '80px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t, index) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>{new Date(t.transaction_date).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 24px', fontWeight: '700' }}>{t.description}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(0,0,0,0.05)', fontSize: '0.75rem', fontWeight: '600' }}>
                      {t.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '6px', 
                      background: t.type === 'Income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: t.type === 'Income' ? '#10b981' : '#ef4444',
                      fontSize: '0.75rem', fontWeight: '800'
                    }}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '900', color: t.type === 'Income' ? '#10b981' : '#ef4444' }}>
                    {t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(t.id)} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No transactions found.
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Transaction">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="input-field" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="input-field" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                {formData.type === 'Income' ? (
                  <>
                    <option value="Tithes">Tithes</option>
                    <option value="Offering">Offering</option>
                    <option value="Donation">Donation</option>
                    <option value="Fundraising">Fundraising</option>
                    <option value="Other">Other</option>
                  </>
                ) : (
                  <>
                    <option value="Utilities">Utilities</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Events">Events</option>
                    <option value="Missions">Missions</option>
                    <option value="Other">Other</option>
                  </>
                )}
              </select>
            </div>
          </div>
          <Input label="Amount ($)" type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
          <Input label="Description" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          <Input label="Date" type="date" required value={formData.transaction_date} onChange={(e) => setFormData({...formData, transaction_date: e.target.value})} />
          <Button type="submit" style={{ marginTop: '12px' }}>Save Transaction</Button>
        </form>
      </Modal>
    </div>
  );
}
