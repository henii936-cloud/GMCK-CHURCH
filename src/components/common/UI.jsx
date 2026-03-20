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
      className={`${getBaseClass()} ${className} hover:scale-[1.02] active:scale-[0.98]`} 
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            {title && <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{title}</h3>}
            {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{subtitle}</p>}
          </div>
          {Icon && <Icon size={24} style={{ color: 'var(--primary)', opacity: 0.8 }} />}
        </div>
      )}
      {children}
    </div>
  );
};

export const Input = ({ label, type = "text", placeholder, value, onChange, className = "", required, icon: Icon }) => {
  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '16px' }}>
      {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
            <Icon size={18} />
          </div>
        )}
        <input 
          type={type} 
          placeholder={placeholder} 
          value={value} 
          onChange={onChange}
          required={required}
          className="input-field"
          style={{
            paddingLeft: Icon ? '40px' : '16px',
            width: '100%',
            height: '48px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            color: 'white',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
        />
      </div>
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div 
        className="glass-card" 
        style={{ 
          width: '100%', 
          maxWidth: '500px', 
          padding: '40px',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1.5rem',
            lineHeight: 1
          }}
        >
          &times;
        </button>
        {title && <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '24px' }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
};
