import React from 'react';
import { Button, Text, Title, IconButton } from '@vkontakte/vkui';
import { Icon24Download, Icon24Share, Icon24Refresh } from '@vkontakte/icons';
import { ParsedAffirmation } from '../types/affirmation';
import { getAffirmationIcon } from '../constants/affirmation';
import { downloadOrShareActivity, shareActivityToVK } from '../utils/shareUtils';
import { CalendarActivity } from '../store/slices/calendarSlice';

interface AffirmationResultProps {
  parsedAffirmation: ParsedAffirmation;
  promptMode: 'preset' | 'custom';
  customPrompt: string;
  selectedTopic: string;
  isMobile: boolean;
  onRetry?: () => void;
  isGenerating?: boolean;
}

export const AffirmationResult: React.FC<AffirmationResultProps> = ({
  parsedAffirmation,
  promptMode,
  customPrompt,
  selectedTopic,
  isMobile,
  onRetry,
  isGenerating = false
}) => {
  if (!parsedAffirmation) return null;

  // Отображение ошибки
  if (parsedAffirmation.error) {
    return (
      <>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          padding: '20px',
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '12px'
        }}>
          <Text style={{ 
            color: '#ff6b6b',
            textAlign: 'center',
            fontSize: '16px',
            fontFamily: 'Jost'
          }}>
            {parsedAffirmation.message || 'Произошла ошибка при генерации аффирмаций'}
          </Text>
          {onRetry && (
            <IconButton
              onClick={onRetry}
              disabled={isGenerating}
              style={{
                backgroundColor: 'rgba(227, 199, 122, 0.1)',
                border: '1px solid rgba(227, 199, 122, 0.3)',
                borderRadius: '50%',
                color: '#e3c77a',
                transition: 'all 0.2s ease',
                animation: isGenerating ? 'spin 1s linear infinite' : 'none'
              }}
            >
              <Icon24Refresh />
            </IconButton>
          )}
        </div>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </>
    );
  }

  const getCurrentTopic = () => {
    if (promptMode === 'custom') return customPrompt || 'Пользовательская тема';
    return selectedTopic || 'Общие аффирмации';
  };

  const handleDownload = async () => {
    try {
      // Создаем временную активность для использования с новой утилитой
      const affirmationData = {
        sections: parsedAffirmation.sections || [],
        usage: undefined // В результатах аффирмаций обычно нет поля usage
      };

      const tempActivity: CalendarActivity = {
        id: `temp_${Date.now()}`,
        type: 'affirmation',
        title: 'Ежедневная аффирмация',
        summary: parsedAffirmation.title || getCurrentTopic(),
        timestamp: Date.now(),
        fullContent: JSON.stringify(affirmationData)
      };

      await downloadOrShareActivity(tempActivity);
    } catch (error) {
      console.error('Ошибка при скачивании аффирмации:', error);
    }
  };

  const handleShare = async () => {
    try {

      await shareActivityToVK();
    } catch (error) {
      console.error('Ошибка при поделиться аффирмацией:', error);
    }
  };

  return (
    <>
      {/* Заголовок и кнопки */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0',
        marginBottom: '24px'
      }}>
        <Text style={{
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '400',
          textAlign: isMobile ? 'center' : 'left',
          fontFamily: 'Jost',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          width: isMobile ? '100%' : 'auto'
        }}>
          {parsedAffirmation.generatedTopic || 'Сопровождение на день'}
        </Text>
        
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          justifyContent: isMobile ? 'center' : 'flex-end',
          width: isMobile ? '100%' : 'auto'
        }}>
          <Button
            mode="tertiary"
            size="s"
            before={<Icon24Download />}
            onClick={handleDownload}
            style={{ fontSize: '14px' }}
          >
            Скачать
          </Button>
          <Button
            mode="tertiary"
            size="s"
            before={<Icon24Share />}
            onClick={handleShare}
            style={{ fontSize: '14px' }}
          >
            Поделиться
          </Button>
        </div>
      </div>
      
      {/* Секции аффирмаций */}
      {parsedAffirmation.sections.map((section, index) => (
        <div key={index} style={{ 
          marginBottom: index < parsedAffirmation.sections.length - 1 ? '24px' : '0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <img 
              src={getAffirmationIcon(index)} 
              alt="" 
              style={{
                width: '32px',
                height: '32px',
                flexShrink: 0
              }}
            />
            <Title level="3" style={{ 
              margin: 0,
              color: '#E3C77A',
              fontSize: '16px',
              fontWeight: '500',
              fontFamily: 'Jost',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {section.title}
            </Title>
          </div>
          <Text style={{ 
            lineHeight: '1.6', 
            fontSize: '15px',
            color: '#ffffff',
            fontFamily: 'Jost'
          }}>
            {section.text}
          </Text>
        </div>
      ))}
      
      {/* Инструкции по использованию */}
      {parsedAffirmation.usage && (
        <div style={{ 
          marginTop: '32px', 
          padding: '20px',
          background: 'rgba(227, 199, 122, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(227, 199, 122, 0.2)'
        }}>
          <Title level="3" style={{ 
            marginBottom: '12px',
            color: '#E3C77A',
            fontSize: '16px',
            fontWeight: '500',
            fontFamily: 'Jost'
          }}>
            Как использовать
          </Title>
          <Text style={{ 
            lineHeight: '1.6', 
            fontSize: '14px',
            color: '#ffffff',
            whiteSpace: 'pre-line',
            fontFamily: 'Jost'
          }}>
            {parsedAffirmation.usage}
          </Text>
        </div>
      )}
    </>
  );
};
