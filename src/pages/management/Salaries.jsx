import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search, DollarSign, X, Loader2, Wallet, Calendar } from "lucide-react";
import { Button, Input, Card } from "../../components/common/UI";

export default function SalariesPage() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ worker_id: "", amount: "", pay_month: "", payment_method: "Transfer", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [w, p] = await Promise.all([
      supabase.from("church_workers").select("*").eq("status", "Active").order("full_name"),
      supabase.from("salary_payments").select("*, church_workers(full_name, position, monthly_salary)").order("created_at", { ascending: false }),
    ]);
    setWorkers(w.data || []);
    setPayments(p.data || []);
    setLoading(false);
  };

  const handlePayWorker = (w) => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    setForm({ worker_id: w.id, amount: w.monthly_salary || "", pay_month: month, payment_method: "Transfer", notes: "" });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await supabase.from("salary_payments").insert([{ ...form, amount: parseFloat(form.amount), paid_by: user?.id }]);
      setModal(false);
      fetchData();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const totalPaid = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="display-md text-primary mb-2">Salary <span className="text-tertiary-fixed-dim italic">Management</span></h1>
          <p className="label-sm text-on-surface-variant tracking-widest">Total paid this period: <span className="text-green-500 font-black">${totalPaid.toLocaleString()}</span></p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={36} className="text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Workers - pay salary */}
          <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
            <h2 className="headline-sm text-primary font-black mb-6">Pay Salary</h2>
            <div className="space-y-3">
              {workers.map((w) => (
                <div key={w.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">{w.full_name?.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-sm text-primary">{w.full_name}</p>
                      <p className="text-xs text-on-surface-variant">{w.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-black text-green-500 text-sm">${parseFloat(w.monthly_salary || 0).toLocaleString()}</p>
                    <button onClick={() => handlePayWorker(w)} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-black uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-all">
                      Pay
                    </button>
                  </div>
                </div>
              ))}
              {workers.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No active workers found.</p>}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
            <h2 className="headline-sm text-primary font-black mb-6">Payment History</h2>
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <DollarSign size={18} className="text-green-500" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-primary">{p.church_workers?.full_name}</p>
                      <p className="text-xs text-on-surface-variant">{p.pay_month} • {p.payment_method}</p>
                    </div>
                  </div>
                  <p className="font-black text-green-500 text-sm">${parseFloat(p.amount).toLocaleString()}</p>
                </div>
              ))}
              {payments.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No salary records yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-50" onClick={() => setModal(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <Card className="w-full max-w-md p-10 bg-surface-container border-none shadow-2xl relative">
                <button onClick={() => setModal(false)} className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary cursor-pointer">
                  <X size={18} />
                </button>
                <h2 className="headline-sm text-primary font-black mb-8">Record Salary Payment</h2>
                <form onSubmit={handleSave} className="space-y-5">
                  <Input label="Amount ($)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                  <Input label="Pay Month (YYYY-MM)" value={form.pay_month} onChange={e => setForm({ ...form, pay_month: e.target.value })} required placeholder="2026-04" />
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Payment Method</label>
                    <select className="editorial-input w-full" value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
                      <option>Transfer</option><option>Cash</option><option>Cheque</option>
                    </select>
                  </div>
                  <Input label="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                  <Button type="submit" loading={saving} className="w-full h-12 bg-primary text-on-primary border-none">
                    Record Payment
                  </Button>
                </form>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
