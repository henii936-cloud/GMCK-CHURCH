import { Loader2 } from "lucide-react";

export const Button = ({ children, onClick, type = "button", variant = "primary", icon: Icon, className = "", style, loading, disabled }) => {
  const getBaseClass = () => {
    switch (variant) {
      case "primary": return "btn-primary";
      case "secondary": return "btn-secondary";
      case "danger": return "btn-danger";
      default: return "btn-primary";
    }
  };
  
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`${getBaseClass()} ${className} hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 transition-all duration-300 ease-out`} 
      style={{
        ...style,
        cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
        opacity: (loading || disabled) ? 0.7 : 1,
        transform: (loading || disabled) ? 'none' : undefined,
      }}
      disabled={loading || disabled}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </button>
  );
};

export const Card = ({ children, className = "", title, subtitle, icon: Icon, style }) => {
  return (
    <div className={`glass-card ${className}`} style={style}>
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-5">
          <div>
            {title && <h3 className="text-xl font-semibold">{title}</h3>}
            {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
          </div>
          {Icon && <Icon size={24} className="text-primary opacity-80" />}
        </div>
      )}
      {children}
    </div>
  );
};

export const Input = ({ label, type = "text", placeholder, value, onChange, className = "", inputClassName = "", required, icon: Icon }) => {
  return (
    <div className={`form-group ${className}`}>
      {label && <label className="block mb-2 text-sm font-semibold text-foreground">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input 
          type={type} 
          placeholder={placeholder} 
          value={value} 
          onChange={onChange}
          required={required}
          className={`flex w-full h-11 rounded-xl border border-input bg-background px-4 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all ${Icon ? 'pl-11' : 'pl-4'} ${inputClassName}`}
        />
      </div>
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm grid place-items-center z-[1000] p-5">
      <div className="glass-card w-full max-w-[500px] p-10 relative">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 bg-transparent border-none text-muted-foreground hover:text-foreground cursor-pointer text-2xl leading-none"
        >
          &times;
        </button>
        {title && <h2 className="text-2xl font-extrabold mb-6">{title}</h2>}
        {children}
      </div>
    </div>
  );
};
