import React from 'react';

interface InstructionsPanelProps {
  windowWidth?: number;
}

export const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ windowWidth = 1024 }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
    }}>
      {/* Инструкции */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: windowWidth <= 480 ? '8px 12px' : '12px 16px',
        borderRadius: '0px 0px 4px 4px',
        borderTop: '1px solid rgba(227,199,122,1)'
      }}>

        <div style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          gap: windowWidth <= 480 ? '12px' : '16px',
          lineHeight: 1.3
        }}>
          <div style={{
            border: '1px solid rgba(151,128,65,0.25)',
            display: 'flex',
            height: windowWidth <= 480 ? '28px' : '32px',
            width: windowWidth <= 480 ? '28px' : '32px',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: windowWidth <= 480 ? '12px' : '14px',
            color: 'rgba(210,175,80,1)',
            fontWeight: '500',
            textAlign: 'center',
            borderRadius: '50%',
            flexShrink: 0
          }}>
            1
          </div>
          <div style={{
            color: 'white',
            fontSize: windowWidth <= 480 ? '14px' : '16px',
            fontWeight: '300',
            alignSelf: 'stretch',
            flex: '1',
            margin: 'auto 0',
            fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
           Перетасуйте колоду перед началом чтения
          </div>
        </div>

        <div style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          gap: windowWidth <= 480 ? '12px' : '16px',
          lineHeight: 1.3
        }}>
          <div style={{
            border: '1px solid rgba(151,128,65,0.25)',
            display: 'flex',
            height: windowWidth <= 480 ? '28px' : '32px',
            width: windowWidth <= 480 ? '28px' : '32px',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: windowWidth <= 480 ? '12px' : '14px',
            color: 'rgba(210,175,80,1)',
            fontWeight: '500',
            textAlign: 'center',
            borderRadius: '50%',
            flexShrink: 0
          }}>
            2
          </div>
          <div style={{
            color: 'white',
            fontSize: windowWidth <= 480 ? '14px' : '16px',
            fontWeight: '300',
            alignSelf: 'stretch',
            flex: '1',
            margin: 'auto 0',
            fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            {windowWidth <= 768 ? 'Перетащите карту на позицию' : 'Перетащите карту из колоды на позицию справа'}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          gap: windowWidth <= 480 ? '12px' : '16px',
          marginTop: windowWidth <= 480 ? '8px' : '12px'
        }}>
          <div style={{
            border: '1px solid rgba(151,128,65,0.25)',
            display: 'flex',
            height: windowWidth <= 480 ? '28px' : '32px',
            width: windowWidth <= 480 ? '28px' : '32px',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: windowWidth <= 480 ? '12px' : '14px',
            color: 'rgba(210,175,80,1)',
            fontWeight: '500',
            textAlign: 'center',
            borderRadius: '50%',
            flexShrink: 0
          }}>
            3
          </div>
          <div style={{
            color: 'white',
            fontSize: windowWidth <= 480 ? '14px' : '16px',
            fontWeight: '300',
            lineHeight: windowWidth <= 480 ? '18px' : '21px',
            alignSelf: 'stretch',
            flex: '1',
            margin: 'auto 0',
            fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            {windowWidth <= 768 
              ? 'Для изменения позиции карты воспользуйтесь кнопкой "Удалить"' 
              : 'Для изменения позиции карты воспользуйтесь кнопкой "Удалить" и выберите новую карту из колоды'
            }
          </div>
        </div>
      </div>
    </div>
  );
};
