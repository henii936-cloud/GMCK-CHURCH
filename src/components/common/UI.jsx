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

export const Input = ({ label, type = "text", placeholder, value, onChange, className = "", required, icon: Icon }) => {
  return (
    <div className={`form-group mb-4 ${className}`}>
      {label && <label className="block mb-1.5 text-sm font-medium text-muted-foreground">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input 
          type={type} 
          placeholder={placeholder} 
          value={value} 
          onChange={onChange}
          required={required}
          className={`input-field ${Icon ? 'pl-10' : 'pl-4'}`}
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
