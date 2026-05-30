import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}
export const Card = ({ children, style }: CardProps) => (
  <View style={[styles.card, style]}>{children}</View>
);

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  style?: ViewStyle;
  textStyle?: TextStyle;
}
export const Button = ({
  onPress,
  children,
  loading,
  disabled,
  variant = "primary",
  style,
  textStyle,
}: ButtonProps) => {
  const bgColor =
    variant === "primary"
      ? "#002c53"
      : variant === "secondary"
      ? "#f3f4f6"
      : variant === "danger"
      ? "#ef4444"
      : "transparent";

  const txtColor =
    variant === "primary"
      ? "#fff"
      : variant === "secondary"
      ? "#002c53"
      : variant === "danger"
      ? "#fff"
      : "#002c53";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: bgColor, opacity: disabled || loading ? 0.6 : 1 },
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={txtColor} size="small" />
      ) : typeof children === "string" ? (
        <Text style={[styles.buttonText, { color: txtColor }, textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  required?: boolean;
  editable?: boolean;
}
export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
  multiline,
  numberOfLines,
  style,
  required,
  editable = true,
}: InputProps) => (
  <View style={[styles.inputWrapper, style]}>
    {label && (
      <Text style={styles.inputLabel}>
        {label}
        {required && <Text style={{ color: "#ef4444" }}> *</Text>}
      </Text>
    )}
    <TextInput
      style={[styles.input, multiline && { height: numberOfLines ? numberOfLines * 24 : 80, textAlignVertical: "top" }]}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
      editable={editable}
    />
  </View>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color?: "green" | "red" | "amber" | "blue" | "gray";
}
export const Badge = ({ label, color = "gray" }: BadgeProps) => {
  const colors: Record<string, { bg: string; text: string }> = {
    green: { bg: "#d1fae5", text: "#059669" },
    red: { bg: "#fee2e2", text: "#dc2626" },
    amber: { bg: "#fef3c7", text: "#d97706" },
    blue: { bg: "#dbeafe", text: "#2563eb" },
    gray: { bg: "#f3f4f6", text: "#6b7280" },
  };
  const c = colors[color];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{label}</Text>
    </View>
  );
};

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export const LoadingScreen = ({ message = "Loading..." }: { message?: string }) => (
  <View style={styles.loadingScreen}>
    <ActivityIndicator size="large" color="#002c53" />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}
export const EmptyState = ({ icon, title, subtitle }: EmptyStateProps) => (
  <View style={styles.emptyState}>
    {icon}
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type?: "success" | "error";
}
export const Toast = ({ message, type = "success" }: ToastProps) => (
  <View
    style={[
      styles.toast,
      { backgroundColor: type === "success" ? "#059669" : "#dc2626" },
    ]}
  >
    <Text style={styles.toastText}>{message}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#6b7280",
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1a1a2e",
    borderWidth: 2,
    borderColor: "transparent",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6b7280",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
  },
  toast: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 14,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
});
