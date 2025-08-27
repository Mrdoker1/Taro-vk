import React from 'react';
import { Text, Spinner } from '@vkontakte/vkui';
import { useResponsive } from '../hooks/useResponsive';
import { useAffirmation } from '../hooks/useAffirmation';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPromptTemplate } from '../store/slices/promptSlice';
import { AffirmationForm } from './AffirmationForm';
import { AffirmationResult } from './AffirmationResult';
import { MagicLoader } from './MagicLoader';
import { CustomButton } from './CustomButton';
import { useSafeNavigation } from '../utils/routerNavigation';

const EmptyStateContent = () => (
  <>
    <div style={{
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      gap: '16px',
      lineHeight: 1.3,
      marginBottom: '16px'
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
        Выбери готовую тему из списка или введи свою персональную тему
      </div>
    </div>
    
    <div style={{
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      gap: '16px'
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
        Нажми кнопку "Получить аффирмации" для создания персонализированных утверждений
      </div>
    </div>
  </>
);

export const DailyAffirmation: React.FC = () => {
  const isMobile = useResponsive();
  const { safeBack } = useSafeNavigation();
  const dispatch = useAppDispatch();
  const { lang } = useAppSelector((state) => state.horoscope);
  
  const {
    customPrompt,
    selectedTopic,
    parsedAffirmation,
    promptMode,
    templateLoading,
    templateError,
    isGenerating,
    generationError,
    setCustomPrompt,
    setSelectedTopic,
    setPromptMode,
    handleGenerate
  } = useAffirmation();

  // Функция перезагрузки шаблона
  const handleReloadTemplate = () => {
    dispatch(fetchPromptTemplate({ promptId: 'daily-affirmation', lang }));
  };

  // Проверка возможности генерации
  const canGenerate = () => {
    if (promptMode === 'preset') return selectedTopic && selectedTopic !== '';
    return customPrompt && customPrompt.trim() !== '';
  };

  const handleBackClick = () => {
    safeBack();
  };

  // Показываем состояние загрузки шаблона
  if (templateLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '40px 0',
        color: '#ffffff'
      }}>
        <Spinner size="m" />
        <Text style={{ 
          marginLeft: '12px',
          color: '#ffffff',
          fontFamily: 'Jost'
        }}>
          Загрузка...
        </Text>
      </div>
    );
  }

  // Показываем ошибку загрузки шаблона
  if (templateError) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '20px',
        color: '#ffffff',
        fontFamily: 'Jost'
      }}>
        <div style={{
          fontSize: '16px',
          marginBottom: '16px',
          opacity: 0.9
        }}>
          Не удалось загрузить аффирмации
        </div>
        <button
          onClick={handleReloadTemplate}
          disabled={templateLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: 'rgba(227, 199, 122, 0.2)',
            border: '1px solid rgba(227, 199, 122, 0.4)',
            borderRadius: '8px',
            color: '#e3c77a',
            fontFamily: 'Jost, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            cursor: templateLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: templateLoading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            margin: '0 auto'
          }}
          onMouseEnter={(e) => {
            if (!templateLoading) {
              e.currentTarget.style.backgroundColor = 'rgba(227, 199, 122, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(227, 199, 122, 0.2)';
          }}
        >
          {templateLoading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid #e3c77a',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Загрузка...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4V9H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 20V15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L4 9M3.51 15A9 9 0 0 0 18.36 18.36L20 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Обновить
            </>
          )}
        </button>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Основной рендер
  return (
    <div style={{
      display: 'flex',
      gap: isMobile ? '16px' : '24px',
      alignItems: 'flex-start',
      flexDirection: isMobile ? 'column' : 'row'
    }}>
      {/* Левая колонка - форма выбора темы */}
      <div style={{
        flex: isMobile ? '1' : '0 0 320px',
        width: isMobile ? '100%' : 'auto',
        marginBottom: isMobile ? '16px' : '24px'
      }}>
        <AffirmationForm
          promptMode={promptMode}
          selectedTopic={selectedTopic}
          customPrompt={customPrompt}
          generationError={generationError}
          isGenerating={isGenerating}
          onTopicChange={setSelectedTopic}
          onCustomPromptChange={setCustomPrompt}
          onModeChange={setPromptMode}
          onRetry={handleGenerate}
        />
      </div>
      
      {/* Правая колонка - результат генерации */}
      <div style={{
        flex: '1',
        minWidth: '0',
        width: isMobile ? '100%' : 'auto'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
        }}>
          {/* Заголовок над контейнером */}
          <Text style={{
            color: '#ffffff',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '400',
            textAlign: 'center',
            fontFamily: 'Jost',
            marginBottom: '16px',
            lineHeight: isMobile ? '1.4' : '1.2'
          }}>
            {parsedAffirmation ? (
              '🌞 Аффирмация на день'
            ) : (
              'Ждём твой запрос, чтобы подобрать аффирмации'
            )}
          </Text>
          
          {/* Базовый контейнер */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              width: '100%',
              flexDirection: 'column',
              alignItems: parsedAffirmation ? 'stretch' : (isGenerating ? 'center' : 'stretch'),
              justifyContent: parsedAffirmation ? 'flex-start' : (isGenerating ? 'center' : 'center'),
              padding: parsedAffirmation ? (isMobile ? '20px 8px' : '24px') : (isMobile ? '16px 8px' : '32px 24px'),
              borderRadius: '0px 0px 4px 4px',
              borderTop: '1px solid rgba(227,199,122,1)',
              minHeight: isGenerating ? '200px' : 'auto'
            }}>
              {/* Содержимое в зависимости от состояния */}
              {isGenerating ? (
                <MagicLoader />
              ) : parsedAffirmation ? (
                <AffirmationResult
                  parsedAffirmation={parsedAffirmation}
                  promptMode={promptMode}
                  customPrompt={customPrompt}
                  selectedTopic={selectedTopic}
                  isMobile={isMobile}
                  onRetry={handleGenerate}
                  isGenerating={isGenerating}
                />
              ) : (
                <EmptyStateContent />
              )}
            </div>
          </div>
        </div>

        {/* Разделительная линия */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'rgba(232, 210, 140, 0.15)',
          marginTop: '32px',
          marginBottom: '16px'
        }} />

        {/* Нижний декоративный элемент */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <img
            src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/154f96a15bcd974fd38495f6f7aeec22f8b9613a"
            alt="Decorative element"
            style={{
              width: '90px',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Кнопки */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <CustomButton
            variant="secondary"
            disabled={false}
            onClick={handleBackClick}
          >
            Назад
          </CustomButton>
          <CustomButton
            variant="primary"
            disabled={!canGenerate() || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? 'Создаём магию...' : 'Получить аффирмации'}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default DailyAffirmation;
