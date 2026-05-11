import EtDatePicker from "../../components/common/EtDatePicker";
import { formatToEthiopian } from "../../utils/ethiopianDate";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";

import { supabase } from "../../services/supabaseClient";

import { Card, Button, Input } from "../../components/common/UI";

import {
  Heart,
  UserPlus,
  BookOpen,
  Plus,
  Search,
  Trash2,
  Edit2,
  XCircle,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  TrendingUp,
  Target,
  Handshake,
  Calendar,
  MapPin,
  User,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../../context/AuthContext";

// ============================================
// Types
// ============================================

type EvangelismStatus =
  | "Heard Gospel"
  | "Convert"
  | "Discipleship"
  | "Baptized";

type Gender = "Male" | "Female";

interface EvangelismRecord {
  id: string;
  full_name: string;
  phone?: string;
  address?: string;
  gender: Gender;
  status: EvangelismStatus;
  date_reached: string;
  reached_by?: string;
  follow_up_date?: string | null;
  notes?: string;
  created_at?: string;
}

interface FormDataType {
  full_name: string;
  phone: string;
  address: string;
  gender: Gender;
  status: EvangelismStatus;
  date_reached: string;
  reached_by: string;
  follow_up_date: string;
  notes: string;
}

interface AuthUser {
  id: string;
  full_name: string;
  role: string;
}

interface EvangelismProps {
  viewOnly?: boolean;
}

interface StatusConfigItem {
  color: string;
  bg: string;
  icon: React.ElementType;
}

type StatusConfigType = Record<EvangelismStatus, StatusConfigItem>;

// ============================================
// Status Config
// ============================================

const STATUS_CONFIG: StatusConfigType = {
  "Heard Gospel": {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    icon: Heart,
  },

  Convert: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    icon: UserPlus,
  },

  Discipleship: {
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    icon: BookOpen,
  },

  Baptized: {
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
    icon: Handshake,
  },
};

// ============================================
// Component
// ============================================

export default function Evangelism({
  viewOnly = false,
}: EvangelismProps): JSX.Element {
  const { user } = useAuth() as {
    user: AuthUser | null;
  };

  const [records, setRecords] = useState<EvangelismRecord[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [showModal, setShowModal] = useState<boolean>(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const [filterStatus, setFilterStatus] = useState<string>("All");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [viewRecord, setViewRecord] = useState<EvangelismRecord | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormDataType>({
    full_name: "",
    phone: "",
    address: "",
    gender: "Male",
    status: "Heard Gospel",
    date_reached: new Date().toISOString().split("T")[0],
    reached_by: "",
    follow_up_date: "",
    notes: "",
  });

  // ============================================
  // Effects
  // ============================================

  useEffect(() => {
    if (user?.id) {
      fetchRecords();
    }
  }, [user?.id]);

  // ============================================
  // Fetch Records
  // ============================================

  const fetchRecords = async (): Promise<void> => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("evangelism")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setRecords((data as EvangelismRecord[]) || []);
    } catch (err) {
      console.error("Error fetching evangelism records:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Open Modal
  // ============================================

  const openModal = (record: EvangelismRecord | null = null): void => {
    if (record) {
      setEditingId(record.id);

      setFormData({
        full_name: record.full_name || "",
        phone: record.phone || "",
        address: record.address || "",
        gender: record.gender || "Male",
        status: record.status || "Heard Gospel",

        date_reached: record.date_reached
          ? record.date_reached.split("T")[0]
          : new Date().toISOString().split("T")[0],

        reached_by: record.reached_by || "",

        follow_up_date: record.follow_up_date
          ? record.follow_up_date.split("T")[0]
          : "",

        notes: record.notes || "",
      });
    } else {
      setEditingId(null);

      setFormData({
        full_name: "",
        phone: "",
        address: "",
        gender: "Male",
        status: "Heard Gospel",
        date_reached: new Date().toISOString().split("T")[0],
        reached_by: "",
        follow_up_date: "",
        notes: "",
      });
    }

    setShowModal(true);
    setError(null);
  };

  // ============================================
  // Submit
  // ============================================

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
      };

      if (!payload.follow_up_date) {
        payload.follow_up_date = "";
      }

      if (editingId) {
        const { error: err } = await supabase
          .from("evangelism")
          .update(payload)
          .eq("id", editingId);

        if (err) throw err;

        setSuccess("Record updated successfully");
      } else {
        const { error: err } = await supabase
          .from("evangelism")
          .insert([payload]);

        if (err) throw err;

        setSuccess("Person added successfully");
      }

      setShowModal(false);
      setEditingId(null);

      await fetchRecords();

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error("Error saving:", err);

      setError(err.message || "Failed to save record");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // Delete
  // ============================================

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const { error: err } = await supabase
        .from("evangelism")
        .delete()
        .eq("id", id);

      if (err) throw err;

      setDeleteId(null);

      setSuccess("Record deleted");

      await fetchRecords();

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  // ============================================
  // Status Update
  // ============================================

  const handleStatusUpdate = async (
    record: EvangelismRecord,
    newStatus: EvangelismStatus,
  ): Promise<void> => {
    try {
      const { error: err } = await supabase
        .from("evangelism")
        .update({
          status: newStatus,
        })
        .eq("id", record.id);

      if (err) throw err;

      setSuccess(`Status updated to ${newStatus}`);

      await fetchRecords();

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // ============================================
  // Filtered Records
  // ============================================

  const filteredRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase();

    const searchMatch =
      r.full_name?.toLowerCase().includes(term) ||
      r.phone?.toLowerCase().includes(term) ||
      r.reached_by?.toLowerCase().includes(term);

    const statusMatch = filterStatus === "All" || r.status === filterStatus;

    return searchMatch && statusMatch;
  });

  // ============================================
  // Stats
  // ============================================

  const stats = {
    total: records.length,

    heard: records.filter((r) => r.status === "Heard Gospel").length,

    converts: records.filter((r) => r.status === "Convert").length,

    discipleship: records.filter((r) => r.status === "Discipleship").length,

    baptized: records.filter((r) => r.status === "Baptized").length,
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        paddingBottom: "60px",
      }}
    >
      {/* Your JSX remains exactly the same */}
    </div>
  );
}
