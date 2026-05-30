import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  FlatList,
} from "react-native";
import { EtDatetime } from "abushakir";
import { ET_MONTHS, etToGregorian, gregorianToEt } from "../utils/ethiopianDate";

interface EtDatePickerProps {
  label?: string;
  value: string; // ISO date string (Gregorian)
  onChange: (isoDate: string) => void;
  required?: boolean;
}

type View = "date" | "month" | "year";

export default function EtDatePicker({ label, value, onChange, required }: EtDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>("date");
  const [etYear, setEtYear] = useState(0);
  const [etMonth, setEtMonth] = useState(0);
  const [etDay, setEtDay] = useState(0);
  const [viewYear, setViewYear] = useState(0);
  const [viewMonth, setViewMonth] = useState(1);
  const [yearPage, setYearPage] = useState(0);

  const currentEtYear = new EtDatetime(Date.now()).year;

  useEffect(() => {
    if (value) {
      const parsed = gregorianToEt(value);
      if (parsed) {
        setEtYear(parsed.year);
        setEtMonth(parsed.month);
        setEtDay(parsed.day);
        setViewYear(parsed.year);
        setViewMonth(parsed.month);
      }
    } else {
      const now = new EtDatetime(Date.now());
      setViewYear(now.year);
      setViewMonth(now.month);
    }
  }, [value]);

  const handleDaySelect = (d: number) => {
    setEtYear(viewYear);
    setEtMonth(viewMonth);
    setEtDay(d);
    const iso = etToGregorian(viewYear, viewMonth, d);
    onChange(iso);
    setIsOpen(false);
  };

  const daysInMonth = viewMonth === 13 ? (viewYear % 4 === 3 ? 6 : 5) : 30;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const startYear = currentEtYear - 80 + yearPage * 16;
  const pageYears = Array.from({ length: 16 }, (_, i) => startYear + i);

  const displayText =
    etYear && etMonth && etDay
      ? `${ET_MONTHS[etMonth - 1]} ${etDay}, ${etYear}`
      : "Select Date";

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={{ color: "#ef4444" }}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => { setIsOpen(true); setView("date"); }}
        activeOpacity={0.8}
      >
        <Text style={[styles.triggerText, !etYear && { color: "#9ca3af" }]}>
          {displayText}
        </Text>
        <Text style={styles.calIcon}>📅</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modal}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setView("month")}>
                <Text style={styles.headerBtn}>{ET_MONTHS[viewMonth - 1]}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setView("year")}>
                <Text style={styles.headerBtn}>{viewYear}</Text>
              </TouchableOpacity>
            </View>

            {/* Date View */}
            {view === "date" && (
              <View style={styles.grid}>
                {days.map((d) => {
                  const selected = d === etDay && viewMonth === etMonth && viewYear === etYear;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[styles.dayBtn, selected && styles.dayBtnSelected]}
                      onPress={() => handleDaySelect(d)}
                    >
                      <Text style={[styles.dayText, selected && styles.dayTextSelected]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Month View */}
            {view === "month" && (
              <View style={styles.grid3}>
                {ET_MONTHS.map((m, i) => {
                  const mn = i + 1;
                  const selected = mn === etMonth && viewYear === etYear;
                  return (
                    <TouchableOpacity
                      key={mn}
                      style={[styles.monthBtn, selected && styles.dayBtnSelected]}
                      onPress={() => { setViewMonth(mn); setView("date"); }}
                    >
                      <Text style={[styles.monthText, selected && styles.dayTextSelected]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Year View */}
            {view === "year" && (
              <View>
                <View style={styles.yearNav}>
                  <TouchableOpacity onPress={() => setYearPage((p) => p - 1)}>
                    <Text style={styles.navArrow}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.yearRange}>
                    {startYear} – {startYear + 15}
                  </Text>
                  <TouchableOpacity onPress={() => setYearPage((p) => p + 1)}>
                    <Text style={styles.navArrow}>›</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.grid4}>
                  {pageYears.map((y) => {
                    const selected = y === etYear;
                    return (
                      <TouchableOpacity
                        key={y}
                        style={[styles.yearBtn, selected && styles.dayBtnSelected]}
                        onPress={() => { setViewYear(y); setView("month"); }}
                      >
                        <Text style={[styles.yearText, selected && styles.dayTextSelected]}>
                          {y}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, color: "#6b7280" },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  triggerText: { fontSize: 15, color: "#1a1a2e" },
  calIcon: { fontSize: 16 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modal: { backgroundColor: "#fff", borderRadius: 20, padding: 16, width: 280, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  headerBtn: { fontSize: 16, fontWeight: "700", color: "#002c53" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  dayBtn: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  dayBtnSelected: { backgroundColor: "#002c53" },
  dayText: { fontSize: 14, color: "#1a1a2e" },
  dayTextSelected: { color: "#fff", fontWeight: "700" },
  grid3: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  monthBtn: { width: 72, paddingVertical: 8, borderRadius: 8, alignItems: "center", backgroundColor: "#f3f4f6" },
  monthText: { fontSize: 12, color: "#1a1a2e" },
  yearNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  navArrow: { fontSize: 24, color: "#002c53", paddingHorizontal: 8 },
  yearRange: { fontSize: 13, fontWeight: "700", color: "#002c53" },
  grid4: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  yearBtn: { width: 56, paddingVertical: 8, borderRadius: 8, alignItems: "center", backgroundColor: "#f3f4f6" },
  yearText: { fontSize: 13, color: "#1a1a2e" },
});
