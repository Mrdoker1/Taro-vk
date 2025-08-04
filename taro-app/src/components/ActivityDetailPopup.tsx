import React from 'react';
import { Button, Text, IconButton, Title } from '@vkontakte/vkui';
import { Icon24Download, Icon24Share, Icon24Dismiss } from '@vkontakte/icons';
import { CalendarActivity } from '../store/slices/calendarSlice';
import { getAffirmationIcon } from '../constants/affirmation';
import calendarSpreadIcon from '../assets/calendar-spread.svg';
import calendarAffirmIcon from '../assets/calendar-affirm.svg';

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

interface ActivityDetailPopupProps {
  activity: CalendarActivity;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityDetailPopup: React.FC<ActivityDetailPopupProps> = ({
  activity,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'tarot_reading':
        return (
          <img 
            src={calendarSpreadIcon} 
            alt="Расклад Таро" 
            style={{ width: '48px', height: '48px' }}
          />
        );
      case 'affirmation':
        return (
          <img 
            src={calendarAffirmIcon} 
            alt="Аффирмация" 
            style={{ width: '48px', height: '48px' }}
          />
        );
      default:
        return (
          <div style={{ 
            fontSize: '28px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '48px', 
            height: '48px' 
          }}>
            📝
          </div>
        );
    }
  };

  const getActivityTypeLabel = () => {
    switch (activity.type) {
      case 'tarot_reading':
        return 'РАСКЛАД ТАРО';
      case 'affirmation':
        return 'АФФИРМАЦИЯ';
      default:
        return 'АКТИВНОСТЬ';
    }
  };

  const handleDownload = () => {
    // TODO: Implement download functionality based on activity type
    console.log('Download activity:', activity);
  };

  const handleShare = () => {
    // TODO: Implement share functionality based on activity type
    console.log('Share activity:', activity);
  };

  const renderActivityContent = () => {
    if (!activity.fullContent) {
      return (
        <Text style={{ 
          fontSize: '14px', 
          lineHeight: '1.5',
          color: '#ffffff',
          fontWeight: '300'
        }}>
          {activity.summary}
        </Text>
      );
    }

    if (activity.type === 'affirmation') {
      try {
        const fullData = JSON.parse(activity.fullContent);
        return (
          <div>
            {fullData.sections?.map((section: { title: string; text: string }, index: number) => (
              <div key={index}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <img
                    src={getAffirmationIcon(index)}
                    alt={section.title}
                    style={{
                      width: '24px',
                      height: '24px',
                      objectFit: 'contain'
                    }}
                  />
                  <Title level="3" style={{ 
                    color: '#ffffff',
                    fontFamily: 'Jost',
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {section.title}
                  </Title>
                </div>
                <Text style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.4',
                  color: '#ffffff',
                  fontWeight: '300',
                  marginBottom: index < fullData.sections.length - 1 ? '16px' : '0'
                }}>
                  {section.text}
                </Text>
                {index < fullData.sections.length - 1 && (
                  <div style={{
                    width: '100%',
                    height: '0.5px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    margin: '12px 0'
                  }} />
                )}
              </div>
            ))}
            {fullData.usage && (
              <>
                <div style={{
                  width: '100%',
                  height: '0.5px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  margin: '16px 0 12px 0'
                }} />
                <Title level="3" style={{ 
                  color: '#ffffff',
                  fontFamily: 'Jost',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Как использовать
                </Title>
                <Text style={{ 
                  fontSize: '13px', 
                  lineHeight: '1.3',
                  color: '#ffffff',
                  fontWeight: '300',
                  whiteSpace: 'pre-line'
                }}>
                  {fullData.usage}
                </Text>
              </>
            )}
          </div>
        );
      } catch {
        return (
          <Text style={{ 
            fontSize: '14px', 
            lineHeight: '1.5',
            color: '#ffffff',
            fontWeight: '300',
            whiteSpace: 'pre-line'
          }}>
            {activity.fullContent}
          </Text>
        );
      }
    }

    if (activity.type === 'tarot_reading') {
      try {
        const fullData = JSON.parse(activity.fullContent);
        const sections = [];

        // Вопрос
        if (fullData.question) {
          sections.push(
            <div key="question">
              <Title level="3" style={{ 
                color: '#ffffff',
                fontFamily: 'Jost',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Вопрос
              </Title>
              <Text style={{ 
                fontSize: '14px', 
                lineHeight: '1.4',
                color: '#ffffff',
                fontWeight: '300'
              }}>
                {fullData.question}
              </Text>
            </div>
          );
        }

        // Карты
        if (fullData.cards) {
          sections.push(
            <div key="cards">
              <Title level="3" style={{ 
                color: '#ffffff',
                fontFamily: 'Jost',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Карты в раскладе
              </Title>
              {fullData.cards.map((card: CardData, index: number) => (
                <Text key={index} style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.4',
                  color: '#ffffff',
                  fontWeight: '300',
                  display: 'block',
                  marginBottom: '3px'
                }}>
                  <strong>{card.positionLabel}:</strong> {card.cardName} {card.isReversed ? '(перевернутая)' : '(прямая)'}
                </Text>
              ))}
            </div>
          );
        }

        // Общее толкование
        if (fullData.interpretation) {
          sections.push(
            <div key="interpretation">
              <Title level="3" style={{ 
                color: '#ffffff',
                fontFamily: 'Jost',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Толкование
              </Title>
              <Text style={{ 
                fontSize: '14px', 
                lineHeight: '1.4',
                color: '#ffffff',
                fontWeight: '300',
                whiteSpace: 'pre-line'
              }}>
                {fullData.interpretation}
              </Text>
            </div>
          );
        }

        // Детальное толкование позиций
        if (fullData.detailedPositions && fullData.detailedPositions.length > 0) {
          sections.push(
            <div key="detailed-positions">
              <Title level="3" style={{ 
                color: '#ffffff',
                fontFamily: 'Jost',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Детальное толкование
              </Title>
              {fullData.detailedPositions.map((pos: PositionData, index: number) => {
                const card = fullData.cards?.find((c: CardData) => c.position === pos.index);
                return (
                  <div key={index} style={{ marginBottom: '8px' }}>
                    <Text style={{ 
                      fontSize: '14px', 
                      lineHeight: '1.4',
                      color: '#ffffff',
                      fontWeight: '400',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      <strong>{card?.positionLabel || `Позиция ${pos.index}`}:</strong>
                    </Text>
                    <Text style={{ 
                      fontSize: '14px', 
                      lineHeight: '1.4',
                      color: '#ffffff',
                      fontWeight: '300',
                      display: 'block'
                    }}>
                      {pos.interpretation}
                    </Text>
                  </div>
                );
              })}
            </div>
          );
        }

        return (
          <div>
            {sections.map((section, index) => (
              <div key={index}>
                {section}
                {index < sections.length - 1 && (
                  <div style={{
                    width: '100%',
                    height: '0.5px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    margin: '12px 0'
                  }} />
                )}
              </div>
            ))}
          </div>
        );
      } catch {
        return (
          <Text style={{ 
            fontSize: '14px', 
            lineHeight: '1.5',
            color: '#ffffff',
            fontWeight: '300',
            whiteSpace: 'pre-line'
          }}>
            {activity.fullContent}
          </Text>
        );
      }
    }

    // Другие типы активностей
    return (
      <Text style={{ 
        fontSize: '14px', 
        lineHeight: '1.5',
        color: '#ffffff',
        fontWeight: '300',
        whiteSpace: 'pre-line'
      }}>
        {activity.fullContent}
      </Text>
    );
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          background: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/3b830249f16752184ecb361cce592c7795bcf9ad) center/cover',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flex: 1
            }}>
              {getActivityIcon()}
              <Text style={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '400',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: 'Jost'
              }}>
                {getActivityTypeLabel()}
              </Text>
            </div>
            
            {/* Close button */}
            <IconButton onClick={onClose}>
              <Icon24Dismiss />
            </IconButton>
          </div>

          {/* Download and Share buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-start'
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

        {/* Content */}
        <div style={{
          padding: '20px',
          overflow: 'auto',
          flex: 1
        }}>
          {/* Activity Content */}
          <div style={{
            marginBottom: '16px'
          }}>
            {renderActivityContent()}
          </div>

          {/* Timestamp */}
          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '0.5px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Text style={{
              fontSize: '12px',
              color: 'rgba(232, 210, 140, 0.7)',
              fontFamily: 'Jost'
            }}>
              Время создания: {new Date(activity.timestamp).toLocaleString('ru-RU')}
            </Text>
          </div>
        </div>

        {/* Decorative bottom element */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '16px 24px 24px'
        }}>
          <img
            src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/154f96a15bcd974fd38495f6f7aeec22f8b9613a"
            alt="Decorative element"
            style={{
              width: '60px',
              height: 'auto',
              objectFit: 'contain',
              opacity: 0.7
            }}
          />
        </div>
      </div>
    </div>
  );
};
