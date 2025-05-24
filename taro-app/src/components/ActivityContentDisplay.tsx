import React from 'react';
import { Text, Title } from '@vkontakte/vkui';
import type { CalendarActivity } from '../store/slices/calendarSlice';

interface CardData {
  position: number;
  cardName: string;
  positionLabel: string;
  isReversed: boolean;
}

interface PositionData {
  index: number;
  interpretation: string;
}

interface ActivityContentDisplayProps {
  activity: CalendarActivity;
}

export const ActivityContentDisplay: React.FC<ActivityContentDisplayProps> = ({ activity }) => {
  const renderAffirmationContent = (fullContent: string) => {
    try {
      const fullData = JSON.parse(fullContent);
      return (
        <div style={{ marginBottom: '16px' }}>
          {fullData.sections?.map((section: { title: string; text: string }, index: number) => (
            <div key={index} style={{ 
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: 'var(--vkui--color_background_secondary)',
              borderRadius: '8px'
            }}>
              <Title level="3" style={{ marginBottom: '8px' }}>
                {section.title}
              </Title>
              <Text style={{ 
                fontSize: '14px', 
                lineHeight: '1.5'
              }}>
                {section.text}
              </Text>
            </div>
          ))}
          {fullData.usage && (
            <div style={{ 
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'var(--vkui--color_background_content)',
              borderRadius: '8px',
              border: '1px solid var(--vkui--color_separator_primary)'
            }}>
              <Title level="3" style={{ marginBottom: '8px' }}>
                Как использовать:
              </Title>
              <Text style={{ 
                fontSize: '13px', 
                lineHeight: '1.4',
                whiteSpace: 'pre-line'
              }}>
                {fullData.usage}
              </Text>
            </div>
          )}
        </div>
      );
    } catch {
      return (
        <Text style={{ 
          fontSize: '14px', 
          lineHeight: '1.5', 
          marginBottom: '16px',
          whiteSpace: 'pre-line'
        }}>
          {fullContent}
        </Text>
      );
    }
  };

  const renderTarotContent = (fullContent: string) => {
    try {
      const fullData = JSON.parse(fullContent);
      return (
        <div style={{ marginBottom: '16px' }}>
          {/* Вопрос */}
          {fullData.question && (
            <div style={{ 
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: 'var(--vkui--color_background_secondary)',
              borderRadius: '8px'
            }}>
              <Title level="3" style={{ marginBottom: '8px' }}>
                Вопрос:
              </Title>
              <Text style={{ fontSize: '14px', lineHeight: '1.5' }}>
                {fullData.question}
              </Text>
            </div>
          )}
          
          {/* Карты */}
          {fullData.cards && (
            <div style={{ 
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: 'var(--vkui--color_background_secondary)',
              borderRadius: '8px'
            }}>
              <Title level="3" style={{ marginBottom: '8px' }}>
                Карты в раскладе:
              </Title>
              {fullData.cards.map((card: CardData, index: number) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <Text style={{ fontSize: '13px', fontWeight: 'bold' }}>
                    {card.positionLabel}: 
                  </Text>
                  <Text style={{ fontSize: '13px', marginLeft: '8px' }}>
                    {card.cardName} {card.isReversed ? '(перевернутая)' : '(прямая)'}
                  </Text>
                </div>
              ))}
            </div>
          )}
          
          {/* Общее толкование */}
          {fullData.interpretation && (
            <div style={{ 
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: 'var(--vkui--color_background_content)',
              borderRadius: '8px',
              border: '1px solid var(--vkui--color_separator_primary)'
            }}>
              <Title level="3" style={{ marginBottom: '8px' }}>
                Толкование:
              </Title>
              <Text style={{ 
                fontSize: '14px', 
                lineHeight: '1.5',
                whiteSpace: 'pre-line'
              }}>
                {fullData.interpretation}
              </Text>
            </div>
          )}
          
          {/* Детальное толкование позиций */}
          {fullData.detailedPositions && fullData.detailedPositions.length > 0 && (
            <div style={{ 
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'var(--vkui--color_background_secondary)',
              borderRadius: '8px'
            }}>
              <Title level="3" style={{ marginBottom: '12px' }}>
                Детальное толкование:
              </Title>
              {fullData.detailedPositions.map((pos: PositionData, index: number) => {
                const card = fullData.cards?.find((c: CardData) => c.position === pos.index);
                return (
                  <div key={index} style={{ marginBottom: '12px' }}>
                    <Text style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {card?.positionLabel || `Позиция ${pos.index}`}:
                    </Text>
                    <Text style={{ fontSize: '13px', lineHeight: '1.4' }}>
                      {pos.interpretation}
                    </Text>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    } catch {
      return (
        <Text style={{ 
          fontSize: '14px', 
          lineHeight: '1.5', 
          marginBottom: '16px',
          whiteSpace: 'pre-line'
        }}>
          {fullContent}
        </Text>
      );
    }
  };

  if (!activity.fullContent) {
    return (
      <Text style={{ 
        fontSize: '14px', 
        lineHeight: '1.5', 
        marginBottom: '16px',
        color: 'var(--vkui--color_text_secondary)'
      }}>
        {activity.summary}
      </Text>
    );
  }

  if (activity.type === 'affirmation') {
    return renderAffirmationContent(activity.fullContent);
  }

  if (activity.type === 'tarot_reading') {
    return renderTarotContent(activity.fullContent);
  }

  // Другие типы активностей
  return (
    <Text style={{ 
      fontSize: '14px', 
      lineHeight: '1.5', 
      marginBottom: '16px',
      whiteSpace: 'pre-line'
    }}>
      {activity.fullContent}
    </Text>
  );
}; 