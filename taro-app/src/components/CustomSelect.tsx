import { FC, useState, useRef, useEffect } from 'react';

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  placeholder?: string;
  label?: string;
  onChange: (value: string) => void;
}

export const CustomSelect: FC<CustomSelectProps> = ({
  value,
  options,
  placeholder = 'Выбери...',
  label,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '400',
          marginBottom: '8px',
          fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
        }}>
          {label}
        </label>
      )}
      
      <div ref={selectRef} style={{ position: 'relative', width: '100%' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '32px',
            padding: '8px 12px',
            border: '2px solid rgba(227, 199, 122, 1)',
            borderRadius: '3px',
            backgroundColor: 'transparent',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
            transition: 'all 0.2s ease'
          }}
        >
          <span>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <img
            src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/1aee18e7b7b820b2fdc9ff4e7fc2ae0198469924"
            alt="Dropdown arrow"
            style={{
              width: '18px',
              height: '9px',
              objectFit: 'contain',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          />
        </div>

        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'var(--custom-element-color)',
            border: '2px solid rgba(227, 199, 122, 1)',
            borderTop: 'none',
            borderRadius: '0 0 3px 3px',
            maxHeight: '160px',
            overflowY: 'auto'
          }}>
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                style={{
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
                  backgroundColor: value === option.value ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (value !== option.value) {
                    (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== option.value) {
                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
