import { formatToEthiopian } from "../../utils/ethiopianDate";
import { useState, useEffect, FormEvent } from "react";
import { financeService } from "../../services/api";
import { Card, Button, Input } from "../../components/common/UI";
import {
  DollarSign,
  AlertCircle,
  Plus,
  Users,
  ArrowLeft,
  Wallet,
  Loader2,
  ShieldCheck,
  PenTool,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

// =========================
// Types
// =========================

type ViewType = "teams" | "team-details";

interface User {
  id: string;
  full_name: string;
  role: string;
}

interface Approval {
  id: string;
  approver_name: string;
  role: "justifier" | "signer";
  approved_at: string;
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  status: "Pending" | "Partially Approved" | "Approved" | "Rejected";
  is_used?: boolean;
  approvals?: Approval[];
}

interface NewBudget {
  name: string;
  amount_total: number;
}

export default function Budgets(): JSX.Element {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // View states
  const [currentView, setCurrentView] = useState<ViewType>("teams");

  const [activeTeam, setActiveTeam] = useState<string | null>(null);

  // Modals
  const [showTeamModal, setShowTeamModal] = useState<boolean>(false);

  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  // Forms
  const [newTeamName, setNewTeamName] = useState<string>("");

  const [sessionTeams, setSessionTeams] = useState<string[]>([
    "Worship Department",
    "Youth Ministry",
    "Media Team",
  ]);

  const [newBudget, setNewBudget] = useState<NewBudget>({
    name: "",
    amount_total: 0,
  });

  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const { user } = useAuth() as { user: User | null };

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);

      const data = await financeService.getBudgets();

      setBudgets(data || []);
    } catch (err) {
      console.error("Error loading budgets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (
    id: string,
    role: "justifier" | "signer",
    status: "approved" | "rejected" = "approved",
  ): Promise<void> => {
    if (!user) return;

    try {
      setSubmittingId(id);

      await financeService.approveBudget(
        id,
        {
          id: user.id,
          full_name: user.full_name,
        },
        status,
        role,
        "Approved via Dashboard",
      );

      await loadData();
    } catch (err) {
      console.error("Approval error:", err);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCreateBudget = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    try {
      const formattedName = `${activeTeam}::${newBudget.name}`;

      const budgetData = {
        name: formattedName,
        amount: newBudget.amount_total,
      };

      await financeService.createBudget(budgetData);

      setShowConfigModal(false);

      await loadData();

      setNewBudget({
        name: "",
        amount_total: 0,
      });
    } catch (err) {
      console.error("Error creating budget:", err);
    }
  };

  const handleAddTeam = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (newTeamName && !sessionTeams.includes(newTeamName)) {
      setSessionTeams([...sessionTeams, newTeamName]);
    }

    setNewTeamName("");
    setShowTeamModal(false);
  };

  const openTeamDetails = (teamName: string): void => {
    setActiveTeam(teamName);
    setCurrentView("team-details");
  };

  const goBackToTeams = (): void => {
    setActiveTeam(null);
    setCurrentView("teams");
  };

  // =========================
  // Derived Data
  // =========================

  const dbTeams = [
    ...new Set(
      budgets.map((b) =>
        b.name && b.name.includes("::") ? b.name.split("::")[0] : "General",
      ),
    ),
  ];

  const allTeams = [...new Set(["General", ...sessionTeams, ...dbTeams])];

  return (
    <div
      className="animate-fade-in"
      style={{
        height: "100%",
        minHeight: "80vh",
      }}
    >
      {/* Your JSX stays exactly the same */}
    </div>
  );
}
