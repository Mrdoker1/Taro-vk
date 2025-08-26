import React, { useState, useEffect } from 'react';
import logoSvg from '../assets/logo.svg';
import backgroundImage from '../assets/background.png';

interface InitialLoaderProps {
  onLoadComplete: () => void;
}

export const InitialLoader: React.FC<InitialLoaderProps> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState('Инициализация...');

  useEffect(() => {
    const loadingTexts = [
      'Инициализация...',
      'Загрузка карт Таро...',
      'Подготовка расклада...',
      'Настройка энергетики...',
      'Почти готово...'
    ];

    const duration = 3000; // 3 секунды
    const interval = 50; // обновление каждые 50мс
    const steps = duration / interval;
    const progressStep = 100 / steps;

    let currentProgress = 0;
    let textIndex = 0;

    const timer = setInterval(() => {
      currentProgress += progressStep;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        setCurrentText('Готово!');
        
        setTimeout(() => {
          onLoadComplete();
        }, 500);
        
        clearInterval(timer);
      } else {
        setProgress(currentProgress);
        
        // Меняем текст в зависимости от прогресса
        const newTextIndex = Math.floor((currentProgress / 100) * (loadingTexts.length - 1));
        if (newTextIndex !== textIndex && newTextIndex < loadingTexts.length) {
          textIndex = newTextIndex;
          setCurrentText(loadingTexts[textIndex]);
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onLoadComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `url(${backgroundImage}), var(--app-background-color)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      {/* Логотип */}
      <div style={{
        marginBottom: '40px'
      }}>
        <img 
          src={logoSvg} 
          alt="Taro VK Logo" 
          style={{
            width: '260px',
          }}
        />
      </div>

      {/* Динамический текст загрузки */}
      <p style={{
        color: 'rgba(227, 199, 122, 1)',
        fontSize: '18px',
        fontWeight: '400',
        fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
        marginBottom: '50px',
        textAlign: 'center',
        minHeight: '24px',
        transition: 'opacity 0.3s ease'
      }}>
        {currentText}
      </p>

      {/* Прогресс бар */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '280px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, rgba(227, 199, 122, 1) 0%, rgba(255, 189, 66, 1) 100%)',
            transition: 'width 0.1s ease-out',
            borderRadius: '2px',
            boxShadow: '0 0 10px rgba(227, 199, 122, 0.5)'
          }} />
        </div>
      </div>
    </div>
  );
};
