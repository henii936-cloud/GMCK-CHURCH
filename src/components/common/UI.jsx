import { Loader2, ChevronDown } from "lucide-react";

export const Button = ({ children, onClick, type = "button", variant = "primary", icon: Icon, className = "", style, loading, disabled, ...props }) => {
  const getBaseClass = () => {
    switch (variant) {
      case "primary": return "btn-primary";
      case "secondary": return "btn-secondary";
      case "danger": return "bg-red-600 text-white hover:bg-red-700";
      case "outline": return "btn-outline";
      default: return "btn-primary";
    }
  };
  
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`${getBaseClass()} ${className} flex items-center justify-center gap-3 transition-all duration-500 ease-out rounded-xl font-bold tracking-wide`} 
      style={{
        ...style,
        cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
        opacity: (loading || disabled) ? 0.5 : 1,
      }}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <>
          {Icon && <Icon size={20} />}
          {children}
        </>
      )}
    </button>
  );
};

export const Card = ({ children, className = "", title, subtitle, icon: Icon, style, ...props }) => {
  return (
    <div className={`editorial-card ${className}`} style={style} {...props}>
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-8">
          <div>
            {title && <h3 className="headline-sm text-primary">{title}</h3>}
            {subtitle && <p className="label-sm opacity-60 mt-1">{subtitle}</p>}
          </div>
          {Icon && <Icon size={28} className="text-tertiary-fixed-dim opacity-80" />}
        </div>
      )}
      {children}
    </div>
  );
};

export const Input = ({ label, type = "text", placeholder, value, onChange, className = "", inputClassName = "", required, icon: Icon }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {label && <label className="label-sm font-black uppercase tracking-widest text-primary/60">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors pointer-events-none">
            <Icon size={20} />
          </div>
        )}
        <input 
          type={type} 
          placeholder={placeholder} 
          value={value} 
          onChange={onChange}
          required={required}
          className={`flex w-full h-14 rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-surface px-6 py-4 text-sm text-primary placeholder:text-primary/30 outline-none transition-all duration-500 ${Icon ? 'pl-14' : 'pl-6'} ${inputClassName}`}
        />
      </div>
    </div>
  );
};

export const Select = ({ label, options, value, onChange, className = "", selectClassName = "", required, icon: Icon }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {label && <label className="label-sm font-black uppercase tracking-widest text-primary/60">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors pointer-events-none">
            <Icon size={20} />
          </div>
        )}
        <select 
          value={value} 
          onChange={onChange}
          required={required}
          className={`flex w-full h-14 rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-surface px-6 py-4 text-sm text-primary outline-none transition-all duration-500 appearance-none ${Icon ? 'pl-14' : 'pl-6'} ${selectClassName}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40">
          <ChevronDown size={20} />
        </div>
      </div>
    </div>
  );
};

export const Label = ({ children, className = "" }) => {
  return (
    <label className={`label-sm font-black uppercase tracking-widest text-primary/60 block mb-2 ${className}`}>
      {children}
    </label>
  );
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-primary/20 backdrop-blur-md grid place-items-center z-[1000] p-6">
      <div className="editorial-card w-full max-w-2xl p-12 relative shadow-2xl animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 bg-surface-container-low w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all duration-500 cursor-pointer text-2xl"
        >
          &times;
        </button>
        {title && <h2 className="display-sm text-primary mb-10">{title}</h2>}
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};
