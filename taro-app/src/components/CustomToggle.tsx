import { FC } from 'react';
import { CustomTooltip } from './CustomTooltip';

interface CustomToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  tooltip?: string;
}

export const CustomToggle: FC<CustomToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  tooltip
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
      padding: '8px 0'
    }}>
      {/* Toggle Switch */}
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: '52px',
          height: '28px',
          borderRadius: '28px',
          backgroundColor: checked 
            ? 'rgba(227, 199, 122, 0.8)' 
            : 'rgba(255, 255, 255, 0.12)',
          border: '2px solid rgba(225, 225, 225, 0.4)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.3s ease',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            position: 'absolute',
            left: checked ? '26px' : '4px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}
        />
      </div>

      {/* Label and Description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: '18px',
          fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
          marginBottom: description ? '4px' : '0'
        }}>
          {label}
        </div>
        {description && (
          <div style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px',
            fontWeight: '400',
            lineHeight: '18px',
            fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            {description}
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{ flexShrink: 0 }}>
          <CustomTooltip
            content={tooltip}
            ariaLabel={`Показать справку о настройке: ${label}`}
          />
        </div>
      )}
    </div>
  );
};
