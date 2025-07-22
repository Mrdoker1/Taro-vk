import React from 'react';

export const InstructionsPanel: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      minWidth: '240px',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'center',
      width: '100%',
      maxWidth: '469px'
    }}>
      {/* Инструкции */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: '12px 16px',
        borderRadius: '0px 0px 4px 4px',
        borderTop: '1px solid rgba(227,199,122,1)'
      }}>
        <div style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          gap: '16px',
          lineHeight: 1.3
        }}>
          <div style={{
            border: '1px solid rgba(151,128,65,0.25)',
            display: 'flex',
            height: '32px',
            width: '32px',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
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
            fontSize: '16px',
            fontWeight: '300',
            alignSelf: 'stretch',
            flex: '1',
            margin: 'auto 0',
            fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            Перетащите карту из колоды на позицию справа
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          gap: '16px',
          marginTop: '12px'
        }}>
          <div style={{
            border: '1px solid rgba(151,128,65,0.25)',
            display: 'flex',
            height: '32px',
            width: '32px',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
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
            fontSize: '16px',
            fontWeight: '300',
            lineHeight: '21px',
            alignSelf: 'stretch',
            flex: '1',
            margin: 'auto 0',
            fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            Для изменения позиции карты воспользуйтесь кнопкой "Удалить" и выберите новую карту из колоды
          </div>
        </div>
      </div>
    </div>
  );
};
