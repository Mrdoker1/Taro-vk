import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setType, fetchHoroscope } from '../store/slices/horoscopeSlice';
import { Skeleton, Tabs, TabsItem } from '@vkontakte/vkui';
import { CustomTooltip } from './CustomTooltip';
import complexImage from '../assets/complex-image.svg';
import sunImage from '../assets/sun.png';
import moonImage from '../assets/moon.png';
import bigStarImage from '../assets/big-star.png';
import starImage from '../assets/star.png';
import star2Image from '../assets/star-2.png';

// Функция для преобразования hex цвета в текстовое описание
const getColorDescription = (hexColor: string): string => {
  const colorMappings: Record<string, string> = {
    '#FF0000': 'Красный',
    '#FF4500': 'Оранжево-красный',
    '#FFA500': 'Оранжевый',
    '#FFD700': 'Золотой',
    '#FFFF00': 'Желтый',
    '#ADFF2F': 'Желто-зеленый',
    '#00FF00': 'Зеленый',
    '#00FFFF': 'Голубой',
    '#0000FF': 'Синий',
    '#4169E1': 'Королевский синий',
    '#8000FF': 'Фиолетовый',
    '#FF00FF': 'Пурпурный',
    '#FF1493': 'Темно-розовый',
    '#FFC0CB': 'Розовый',
    '#FFFFFF': 'Белый',
    '#C0C0C0': 'Серебряный',
    '#808080': 'Серый',
    '#000000': 'Черный',
    '#8B4513': 'Коричневый',
    '#D2B48C': 'Бежевый'
  };

  // Проверяем точное совпадение
  if (colorMappings[hexColor.toUpperCase()]) {
    return colorMappings[hexColor.toUpperCase()];
  }

  // Если точного совпадения нет, пытаемся найти ближайший цвет
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Простая логика определения цвета по доминирующему каналу
  if (r > g && r > b) {
    if (r > 200) return 'Красный';
    if (r > 100) return 'Темно-красный';
    return 'Бордовый';
  }
  if (g > r && g > b) {
    if (g > 200) return 'Зеленый';
    if (g > 100) return 'Темно-зеленый';
    return 'Оливковый';
  }
  if (b > r && b > g) {
    if (b > 200) return 'Синий';
    if (b > 100) return 'Темно-синий';
    return 'Темно-синий';
  }
  
  // Если все каналы примерно равны
  const avg = (r + g + b) / 3;
  if (avg > 200) return 'Светлый';
  if (avg > 100) return 'Серый';
  return 'Темный';
};





export const HoroscopeSection = () => {
  const dispatch = useAppDispatch();
  const { type, horoscope, loading, error, sign, lang } = useAppSelector((state) => state.horoscope);
  const [sunClicked, setSunClicked] = React.useState(false);
  const [moonClicked, setMoonClicked] = React.useState(false);
  const [textVisible, setTextVisible] = React.useState(false);
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const tabs = [
    { value: 'daily', label: 'на сегодня' },
    { value: 'weekly', label: 'На неделю' },
    { value: 'monthly', label: 'На месяц' }
  ];

  // Отслеживание размера окна
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Загрузка данных при изменении типа, знака или языка
  useEffect(() => {
    dispatch(fetchHoroscope({ sign, type, lang }));
  }, [dispatch, type, sign, lang]);

  // Анимация появления текста при смене данных
  useEffect(() => {
    if (!loading && horoscope) {
      setTextVisible(false); // Сначала скрываем
      setTimeout(() => {
        setTextVisible(true); // Затем показываем с анимацией
      }, 100);
    } else {
      setTextVisible(false);
    }
  }, [horoscope?.number, horoscope?.color, horoscope?.mood, loading]);

  const handleTabChange = (tabValue: string) => {
    dispatch(setType(tabValue as 'daily' | 'weekly' | 'monthly'));
  };

  // Адаптивность для мобильных устройств
  const isMobile = windowWidth < 768;
  const isVerySmallMobile = windowWidth < 480;

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: isMobile ? '12px' : '16px',
    position: 'relative',
    minHeight: isMobile ? (isVerySmallMobile ? '350px' : '400px') : '300px',
    width: '100%',
    overflow: 'hidden',
    padding: isVerySmallMobile ? '12px' : isMobile ? '16px' : '24px',
    maxWidth: '100%',
    margin: '0 auto',
    boxSizing: 'border-box'
  };

  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: "url('https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/c669e25c80c1a50102dfd4a5f6008acc24c4d2ca?placeholderIfAbsent=true')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  const headerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: '12px',
    fontSize: '18px',
    color: 'white',
    fontWeight: 500,
    lineHeight: 1.2,
    flexWrap: 'wrap'
  };

  const iconStyle: React.CSSProperties = {
    width: '44px',
    height: '44px',
    objectFit: 'contain',
    flexShrink: 0
  };

  const titleStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Jost',
    fontWeight: 400,
    fontSize: 'clamp(16px, 4vw, 24px)', // Адаптивный размер шрифта
    lineHeight: 1.2,
    margin: 0
  };

  const contentWrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    marginTop: '12px'
  };

  const mainContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
    gap: '16px',
    borderRadius: '8px'
  };

  const imageContainerStyle: React.CSSProperties = {
    flexShrink: 0,
    width: '450px',
    maxWidth: '450px',
    margin: '0',
    position: 'relative'
  };

  const complexImageStyle: React.CSSProperties = {
    width: '100%',
    height: '340px',
    objectFit: 'cover',
    maxWidth: '450px',
    borderRadius: '12px'
  };

  const imageOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: 'white',
    zIndex: 10
  };

  const luckyNumberStyle: React.CSSProperties = {
    fontFamily: 'Cormorant, serif',
    fontWeight: 300,
    fontSize: '64px',
    letterSpacing: '0.1em',
    marginBottom: '8px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
  };

  const colorNameStyle: React.CSSProperties = {
    fontFamily: 'Jost, sans-serif',
    fontWeight: 300,
    fontSize: '16px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '8px',
    textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
  };

  const moodSymbolStyle: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '24px',
    textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
  };

  // Стили для анимированных элементов
  const animatedElementsContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    pointerEvents: 'auto'
  };

  const createOrbitStyle = (radius: number, duration: number, startPosition: number = 0, zIndex: number = 1): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: radius * 2 + 'px',
    height: radius * 2 + 'px',
    transform: 'translate(-50%, -50%)',
    animation: `orbit-${duration} ${duration}s linear infinite`,
    animationDelay: `${-startPosition * duration / 360}s`,
    zIndex: zIndex
  });

  const createCounterRotateStyle = (duration: number, startPosition: number = 0): React.CSSProperties => ({
    position: 'absolute',
    top: '0',
    left: '50%',
    animation: `counter-rotate-${duration} ${duration}s linear infinite`,
    animationDelay: `${-startPosition * duration / 360}s`
  });

  // Функции для обратного движения (против часовой стрелки)
  const createReverseOrbitStyle = (radius: number, duration: number, startPosition: number = 0, zIndex: number = 1): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: radius * 2 + 'px',
    height: radius * 2 + 'px',
    transform: 'translate(-50%, -50%)',
    animation: `orbit-reverse-${duration} ${duration}s linear infinite`,
    animationDelay: `${-startPosition * duration / 360}s`,
    zIndex: zIndex
  });

  const createReverseCounterRotateStyle = (duration: number, startPosition: number = 0): React.CSSProperties => ({
    position: 'absolute',
    top: '0',
    left: '50%',
    animation: `counter-rotate-reverse-${duration} ${duration}s linear infinite`,
    animationDelay: `${-startPosition * duration / 360}s`
  });

  const createSunImageStyle = (): React.CSSProperties => ({
    maxWidth: 'none',
    maxHeight: 'none',
    objectFit: 'contain',
    display: 'block',
    animation: `sun-glow 3s ease-in-out infinite`,
    transition: 'all 0.3s ease'
  });

  const createMoonImageStyle = (): React.CSSProperties => ({
    maxWidth: 'none',
    maxHeight: 'none',
    objectFit: 'contain',
    display: 'block',
    animation: `moon-glow 4s ease-in-out infinite`,
    transition: 'all 0.3s ease'
  });

  const handleSunClick = () => {
    setSunClicked(true);
    setTimeout(() => setSunClicked(false), 800); // Длительность анимации sun-bounce
  };

  const handleMoonClick = () => {
    setMoonClicked(true);
    setTimeout(() => setMoonClicked(false), 1200); // Длительность анимации moon-wiggle
  };

  const createStarStyle = (duration: number, startPosition: number = 0, twinkleDelay: number = 0): React.CSSProperties => ({
    position: 'absolute',
    top: '0',
    left: '50%',
    maxWidth: 'none',
    maxHeight: 'none',
    objectFit: 'contain',
    pointerEvents: 'none',
    animation: `star-twinkle 2s ease-in-out infinite, depth-orbit-${duration} ${duration}s linear infinite`,
    animationDelay: `${twinkleDelay}s, ${-startPosition * duration / 360}s`
  });

  const textContentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    fontSize: '16px',
    color: 'white',
    justifyContent: 'center',
    padding: '16px 24px',
    minWidth: 0
  };



  const loadingContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const errorContainerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '12px'
  };

  const errorTextStyle: React.CSSProperties = {
    color: '#fecaca',
    fontSize: '12px'
  };

  const predictionTextStyle: React.CSSProperties = {
    fontWeight: 300,
    lineHeight: '21px',
    fontSize: '16px',
    marginBottom: '16px',
    textAlign: 'justify'
  };

  const infoContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '16px'
  };

  const infoRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap'
  };



  const labelStyle: React.CSSProperties = {
    fontWeight: 'normal'
  };

  const valueContainerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    padding: '3px 6px',
    borderRadius: '4px'
  };

  const moodValueStyle: React.CSSProperties = {
    fontSize: '20px'
  };

  const numberIconStyle: React.CSSProperties = {
    width: '24px',
    height: '24px',
    objectFit: 'contain',
    flexShrink: 0
  };



  const decorativeDividerStyle: React.CSSProperties = {
    width: '100%',
    marginTop: '8px',
    opacity: 0.3,
    height: 'auto'
  };

  const decorativeElementContainerStyle: React.CSSProperties = {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    marginTop: '8px'
  };

  const decorativeElementStyle: React.CSSProperties = {
    width: '90px',
    height: '30px',
    opacity: 1
  };

  // Адаптивные стили теперь управляются через CSS классы и медиа-запросы
  // Оставляем только критически важные JavaScript адаптации

  return (
    <>
      {/* CSS Animations */}
      <style>
        {`
          @keyframes orbit-20 {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }
          
          @keyframes orbit-25 {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }
          
          @keyframes orbit-30 {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }
          
          @keyframes orbit-35 {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }
          
          @keyframes orbit-40 {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }

          /* Обратные орбиты - против часовой стрелки */
          @keyframes orbit-reverse-20 {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(-360deg); }
          }
          
          @keyframes orbit-reverse-25 {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(-360deg); }
          }
          
          @keyframes orbit-reverse-35 {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(-360deg); }
          }
          
          @keyframes counter-rotate-20 {
            from { transform: translateX(-50%) rotate(0deg); }
            to { transform: translateX(-50%) rotate(-360deg); }
          }
          
          @keyframes counter-rotate-25 {
            from { transform: translateX(-50%) rotate(0deg); }
            to { transform: translateX(-50%) rotate(-360deg); }
          }
          
          @keyframes counter-rotate-30 {
            from { transform: translateX(-50%) rotate(0deg); }
            to { transform: translateX(-50%) rotate(-360deg); }
          }
          
          @keyframes counter-rotate-35 {
            from { transform: translateX(-50%) rotate(0deg); }
            to { transform: translateX(-50%) rotate(-360deg); }
          }
          
          @keyframes counter-rotate-40 {
            from { transform: translateX(-50%) rotate(0deg); }
            to { transform: translateX(-50%) rotate(-360deg); }
          }

          /* Обратные counter-rotate - для обратных орбит */
          @keyframes counter-rotate-reverse-20 {
            from { transform: translateX(-50%) rotate(0deg); }
            to { transform: translateX(-50%) rotate(360deg); }
          }
          
          @keyframes counter-rotate-reverse-25 {
            from { transform: translateX(-50%) rotate(0deg); }
            to { transform: translateX(-50%) rotate(360deg); }
          }
          
          @keyframes counter-rotate-reverse-35 {
            from { transform: translateX(-50%) rotate(0deg); }
            to { transform: translateX(-50%) rotate(360deg); }
          }
          
          @keyframes sun-glow {
            0%, 100% { 
              filter: drop-shadow(0 0 10px #ffeb3b) drop-shadow(0 0 20px #ff9800) brightness(1);
            }
            50% { 
              filter: drop-shadow(0 0 20px #ffeb3b) drop-shadow(0 0 30px #ff9800) brightness(1.2);
            }
          }
          
          @keyframes moon-glow {
            0%, 100% { 
              filter: drop-shadow(0 0 8px #e3f2fd) drop-shadow(0 0 15px #2196f3) brightness(1);
            }
            50% { 
              filter: drop-shadow(0 0 15px #e3f2fd) drop-shadow(0 0 25px #2196f3) brightness(1.1);
            }
          }
          
          @keyframes star-twinkle {
            0%, 100% { 
              filter: brightness(1) drop-shadow(0 0 5px #fff);
              transform: translateX(-50%) scale(1);
            }
            25% { 
              filter: brightness(1.3) drop-shadow(0 0 10px #fff);
              transform: translateX(-50%) scale(1.1);
            }
            75% { 
              filter: brightness(0.8) drop-shadow(0 0 3px #fff);
              transform: translateX(-50%) scale(0.9);
            }
          }
          
          @keyframes depth-orbit-20 {
            0% { transform: translateX(-50%) rotate(0deg) scale(0.8); opacity: 0.7; }
            25% { transform: translateX(-50%) rotate(-90deg) scale(1.1); opacity: 1; }
            50% { transform: translateX(-50%) rotate(-180deg) scale(0.8); opacity: 0.7; }
            75% { transform: translateX(-50%) rotate(-270deg) scale(1.1); opacity: 1; }
            100% { transform: translateX(-50%) rotate(-360deg) scale(0.8); opacity: 0.7; }
          }
          
          @keyframes depth-orbit-25 {
            0% { transform: translateX(-50%) rotate(0deg) scale(0.9); opacity: 0.8; }
            25% { transform: translateX(-50%) rotate(-90deg) scale(1.2); opacity: 1; }
            50% { transform: translateX(-50%) rotate(-180deg) scale(0.9); opacity: 0.8; }
            75% { transform: translateX(-50%) rotate(-270deg) scale(1.2); opacity: 1; }
            100% { transform: translateX(-50%) rotate(-360deg) scale(0.9); opacity: 0.8; }
          }
          
          @keyframes depth-orbit-30 {
            0% { transform: translateX(-50%) rotate(0deg) scale(0.85); opacity: 0.75; }
            25% { transform: translateX(-50%) rotate(-90deg) scale(1.15); opacity: 1; }
            50% { transform: translateX(-50%) rotate(-180deg) scale(0.85); opacity: 0.75; }
            75% { transform: translateX(-50%) rotate(-270deg) scale(1.15); opacity: 1; }
            100% { transform: translateX(-50%) rotate(-360deg) scale(0.85); opacity: 0.75; }
          }
          
          @keyframes stardust {
            0%, 100% { opacity: 0.3; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-10px) translateX(5px); }
            50% { transform: translateY(-5px) translateX(-8px); }
            75% { transform: translateY(-15px) translateX(3px); }
          }
          

          
          @keyframes sun-bounce {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes moon-wiggle {
            0%, 100% { 
              transform: scale(1) rotate(0deg);
              filter: drop-shadow(0 0 8px #e3f2fd) drop-shadow(0 0 15px #2196f3) brightness(1);
            }
            25% { 
              transform: scale(1.3) rotate(-15deg);
              filter: drop-shadow(0 0 20px #e3f2fd) drop-shadow(0 0 30px #2196f3) brightness(1.4);
            }
            50% { 
              transform: scale(0.8) rotate(10deg);
              filter: drop-shadow(0 0 5px #e3f2fd) drop-shadow(0 0 10px #2196f3) brightness(0.7);
            }
            75% { 
              transform: scale(1.2) rotate(-5deg);
              filter: drop-shadow(0 0 15px #e3f2fd) drop-shadow(0 0 25px #2196f3) brightness(1.2);
            }
          }
          
          .sun-clicked {
            animation: sun-bounce 0.8s ease-in-out;
            transform-origin: center;
          }
          
          .moon-clicked {
            animation: moon-wiggle 1.2s ease-out;
            transform-origin: center;
          }
          
          @keyframes text-appear {
            0% { 
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.8);
              filter: blur(3px);
            }
            50% { 
              opacity: 0.8;
              transform: translate(-50%, -50%) scale(1.05);
              filter: blur(1px);
            }
            100% { 
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
              filter: blur(0px);
            }
          }
          
          .text-visible {
            animation: text-appear 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          
          .text-hidden {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
        `}
      </style>
      
      <section 
        className={`HoroscopeSection ${isMobile ? 'HoroscopeSection--mobile' : ''} ${isVerySmallMobile ? 'HoroscopeSection--small' : ''}`} 
        style={sectionStyle}
      >
        {/* Background Image */}
        <div style={backgroundStyle} />
      
      {/* Header */}
      <div style={headerStyle}>
        <img
          src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/a454a9aefa63c89b1f3f6882a43da00885c70554?placeholderIfAbsent=true"
          alt="Horoscope icon"
          style={iconStyle}
        />
        <h1 style={titleStyle}>
          Привет, это твой гороскоп на сегодня
        </h1>
      </div>
      
      {/* Main Content */}
      <div style={contentWrapperStyle}>
        <div style={mainContentStyle}>
          
          {/* Left side - Complex Image */}
          <div style={imageContainerStyle}>
            <img
              src={complexImage}
              alt="Zodiac background"
              style={complexImageStyle}
            />
            
            {/* Animated Elements */}
            <div className="animated-elements-container" style={animatedElementsContainerStyle}>
              {/* Sun - Outer orbit, left side */}
              <div style={{...createOrbitStyle(isVerySmallMobile ? 150 : isMobile ? 180 : 240, 40, 0, 15), pointerEvents: 'none'}}>
                <div style={{...createCounterRotateStyle(40, 0), pointerEvents: 'none'}}>
                  <div 
                    className={sunClicked ? 'sun-clicked' : ''}
                    onClick={handleSunClick}
                    style={{
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      display: 'inline-block',
                      padding: '10px',
                      borderRadius: '50%'
                    }}
                  >
                    <img 
                      src={sunImage} 
                      alt="Sun" 
                      style={createSunImageStyle()} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Moon - Outer orbit, right side - ОБРАТНОЕ НАПРАВЛЕНИЕ */}
              <div style={{...createReverseOrbitStyle(isVerySmallMobile ? 110 : isMobile ? 130 : 190, 35, 180, 12), pointerEvents: 'none'}}>
                <div style={{...createReverseCounterRotateStyle(35, 180), pointerEvents: 'none'}}>
                  <div 
                    className={moonClicked ? 'moon-clicked' : ''}
                    onClick={handleMoonClick}
                    style={{
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      display: 'inline-block',
                      padding: '10px',
                      borderRadius: '50%'
                    }}
                  >
                    <img 
                      src={moonImage} 
                      alt="Moon" 
                      style={createMoonImageStyle()} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Big Star - Inner orbit */}
              <div style={{...createOrbitStyle(isVerySmallMobile ? 70 : isMobile ? 90 : 140, 30, 90, 8), pointerEvents: 'none'}}>
                <img src={bigStarImage} alt="Big Star" style={createStarStyle(30, 90, 0)} />
              </div>
              
              {/* Star - Inner orbit - ОБРАТНОЕ НАПРАВЛЕНИЕ */}
              <div style={{...createReverseOrbitStyle(isVerySmallMobile ? 60 : isMobile ? 75 : 120, 25, 270, 3), pointerEvents: 'none'}}>
                <img src={starImage} alt="Star" style={createStarStyle(25, 270, 0)} />
              </div>
              
              {/* Star 2 - Inner orbit - ОБРАТНОЕ НАПРАВЛЕНИЕ */}
              <div style={{...createReverseOrbitStyle(isVerySmallMobile ? 65 : isMobile ? 85 : 130, 20, 45, 3), pointerEvents: 'none'}}>
                <img src={star2Image} alt="Star 2" style={createStarStyle(20, 45, 0)} />
              </div>
              
              {/* Stardust particles */}
              <div style={{
                position: 'absolute',
                top: '20%',
                left: '15%',
                width: '4px',
                height: '4px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                boxShadow: '0 0 6px #fff',
                pointerEvents: 'none',
                animation: 'stardust 3s ease-in-out infinite, float 4s ease-in-out infinite',
                animationDelay: '0s, 0.5s'
              }} />
              
              <div style={{
                position: 'absolute',
                top: '70%',
                left: '80%',
                width: '3px',
                height: '3px',
                backgroundColor: '#ffeb3b',
                borderRadius: '50%',
                boxShadow: '0 0 4px #ffeb3b',
                pointerEvents: 'none',
                animation: 'stardust 2.5s ease-in-out infinite, float 5s ease-in-out infinite',
                animationDelay: '1s, 1.5s'
              }} />
              
              <div style={{
                position: 'absolute',
                top: '30%',
                left: '85%',
                width: '2px',
                height: '2px',
                backgroundColor: '#2196f3',
                borderRadius: '50%',
                boxShadow: '0 0 3px #2196f3',
                pointerEvents: 'none',
                animation: 'stardust 4s ease-in-out infinite, float 3s ease-in-out infinite',
                animationDelay: '2s, 0s'
              }} />
              
              <div style={{
                position: 'absolute',
                top: '60%',
                left: '10%',
                width: '3px',
                height: '3px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                boxShadow: '0 0 5px #fff',
                pointerEvents: 'none',
                animation: 'stardust 3.5s ease-in-out infinite, float 6s ease-in-out infinite',
                animationDelay: '0.5s, 2s'
              }} />
              
              <div style={{
                position: 'absolute',
                top: '15%',
                left: '70%',
                width: '2px',
                height: '2px',
                backgroundColor: '#ff9800',
                borderRadius: '50%',
                boxShadow: '0 0 4px #ff9800',
                pointerEvents: 'none',
                animation: 'stardust 2s ease-in-out infinite, float 4.5s ease-in-out infinite',
                animationDelay: '1.5s, 1s'
              }} />
            </div>

            {/* Text Overlay */}
            {!loading && horoscope && (
              <div 
                className={textVisible ? 'text-visible' : 'text-hidden'}
                style={imageOverlayStyle}
              >
                {/* Lucky Number */}
                <div style={luckyNumberStyle}>
                  {horoscope.number}
                </div>
                
                {/* Color Name */}
                <div style={colorNameStyle}>
                  {getColorDescription(horoscope.color)}
                </div>
                
                {/* Mood */}
                <div style={moodSymbolStyle}>
                  {horoscope.mood}
                </div>
              </div>
            )}
          </div>
          
          {/* Right side - Content */}
          <div style={textContentStyle}>
            
            {/* Tabs */}
            <div style={{ marginBottom: '16px' }}>
              <Tabs>
                {tabs.map((tab) => (
                  <TabsItem
                    key={tab.value}
                    selected={type === tab.value}
                    onClick={() => handleTabChange(tab.value)}
                  >
                    {tab.label}
                  </TabsItem>
                ))}
              </Tabs>
            </div>
            
            {/* Content */}
            {loading && (
              <div style={loadingContainerStyle}>
                <Skeleton width="100%" height={16} />
                <Skeleton width="90%" height={16} />
                <Skeleton width="95%" height={16} />
                                 <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                   <Skeleton width={80} height={20} />
                   <Skeleton width={80} height={20} />
                 </div>
              </div>
            )}
            
            {error && (
              <div style={errorContainerStyle}>
                <div style={errorTextStyle}>{error}</div>
              </div>
            )}
            
            {horoscope && !loading && !error && (
              <>
                {/* Prediction Text */}
                <div style={predictionTextStyle}>
                  {horoscope.prediction}
                </div>
                
                {/* Additional Info */}
                <div style={infoContainerStyle}>
                  {/* Mood */}
                  <div style={infoRowStyle}>
                    <div style={{...labelStyle, display: 'flex', alignItems: 'center', gap: '4px'}}>
                      <CustomTooltip
                        content="Эмоциональное состояние, которое будет преобладать в этот день"
                        ariaLabel="Показать справку о настроении"
                      />
                      Настроение:
                    </div>
                    <div style={valueContainerStyle}>
                      <div style={moodValueStyle}>{horoscope.mood}</div>
                    </div>
                  </div>
                  
                  {/* Lucky Number */}
                  <div style={infoRowStyle}>
                    <div style={{...labelStyle, display: 'flex', alignItems: 'center', gap: '4px'}}>
                      <CustomTooltip
                        content="Число, которое принесет удачу и поможет в принятии важных решений"
                        ariaLabel="Показать справку о счастливом числе"
                      />
                      Счастливое число:
                    </div>
                    <div style={valueContainerStyle}>
                      <img
                        src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/08af85525fc08c3148fba7ba644c51b697429f1d?placeholderIfAbsent=true"
                        alt="Number icon"
                        style={numberIconStyle}
                      />
                      <div>{horoscope.number}</div>
                    </div>
                  </div>
                  
                  {/* Color */}
                  <div style={infoRowStyle}>
                    <div style={{...labelStyle, display: 'flex', alignItems: 'center', gap: '4px'}}>
                      <CustomTooltip
                        content="Цвет, который поможет привлечь позитивную энергию и удачу в этот день"
                        ariaLabel="Показать справку о цвете дня"
                      />
                      Цвет дня:
                    </div>
                    <div style={valueContainerStyle}>
                      {/* SVG Футболка в цвете дня */}
                      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                        <path d="M20.4083 7.04495C20.4511 6.9167 20.5896 6.84725 20.7179 6.88997C20.8462 6.93278 20.9156 7.07164 20.8729 7.19992C20.4804 8.37602 20.0341 9.51715 19.8735 10.7041C19.7586 11.5506 19.802 12.4109 19.8965 14.192L20.2248 20.4529L20.2973 21.8351C20.2975 21.8394 20.2976 21.8439 20.2976 21.8482C20.2976 22.27 20.2632 22.6355 20.1092 22.9525C19.9509 23.2782 19.6825 23.5215 19.2807 23.7366C17.6951 24.5862 15.3348 25 12.9999 25C10.665 25 8.3045 24.5862 6.7188 23.7366C6.31726 23.521 6.04864 23.2774 5.89037 22.9518C5.73637 22.635 5.70193 22.2699 5.70192 21.8482C5.70192 21.8439 5.70201 21.8394 5.70224 21.8351L5.77479 20.4516L6.10306 14.192C6.19637 12.4106 6.24106 11.5508 6.12729 10.7053C6.006 9.81425 5.72475 8.94957 5.42609 8.07684L5.12667 7.19992L5.11998 7.17569C5.09286 7.05462 5.16141 6.93009 5.28164 6.88997C5.40194 6.84987 5.5314 6.90846 5.58234 7.02167L5.59159 7.04495L5.88782 7.91293C6.18884 8.7921 6.48528 9.70382 6.61261 10.6393C6.73288 11.5329 6.68544 12.4384 6.59456 14.1728C6.59378 14.1877 6.593 14.2027 6.59221 14.2178L6.1917 21.8533C6.19201 22.2573 6.22842 22.5268 6.33105 22.7379C6.42988 22.9411 6.60516 23.1198 6.94966 23.3048C8.43551 24.101 10.7052 24.5102 12.9999 24.5102C15.2946 24.5102 17.5637 24.1009 19.0496 23.3048C19.3942 23.1203 19.5696 22.9417 19.6685 22.7382C19.7711 22.5269 19.8072 22.2573 19.8075 21.8533L19.4073 14.2178C19.3138 12.4537 19.2657 11.541 19.3882 10.6384L19.423 10.4053C19.615 9.24171 20.051 8.11557 20.4083 7.04495Z" fill={horoscope.color}/>
                        <path d="M16.0304 1.00001C16.2752 1.00001 16.4341 0.998701 16.5881 1.03189C16.7424 1.06515 16.8865 1.13181 17.1095 1.23343L20.6218 2.82431C21.6892 3.31137 22.3518 3.64601 22.8316 4.14892L22.9394 4.26787C23.4958 4.92123 23.7219 5.77568 24.1438 7.33101L24.7761 9.662C24.9075 10.1461 24.9839 10.4247 24.9977 10.7092C25.008 10.9225 24.983 11.1359 24.9346 11.4378L24.8788 11.7723L23.6093 19.3214C23.5001 19.9697 23.3763 20.4814 23.1122 20.8415C22.8312 21.2248 22.421 21.4023 21.8421 21.464C21.4568 21.5047 21.1265 21.4236 20.8243 21.2998C20.5373 21.1821 20.2405 21.0082 19.9742 20.8753C19.8532 20.815 19.8039 20.6679 19.8642 20.5469C19.9246 20.4259 20.0719 20.3765 20.1929 20.4369C20.2037 20.4422 20.2143 20.4476 20.2248 20.4529C20.5224 20.603 20.7516 20.7406 21.0102 20.8466C21.2628 20.9502 21.5092 21.0064 21.7902 20.9767L21.8814 20.9659C22.3232 20.9056 22.558 20.769 22.7171 20.552C22.9039 20.2973 23.0157 19.8966 23.1262 19.2401L24.3957 11.691L24.396 11.6907C24.4829 11.1766 24.5189 10.9521 24.5082 10.7328C24.4976 10.5136 24.4401 10.2937 24.3035 9.79051L23.6709 7.4592C23.237 5.85959 23.0352 5.13612 22.5666 4.58579C22.0967 4.03535 21.4126 3.71902 19.898 3.03381L16.9073 1.67954L16.907 1.67922C16.6661 1.56943 16.5761 1.53048 16.4851 1.51085C16.3938 1.49117 16.2957 1.4898 16.0304 1.4898H9.9696C9.70478 1.4898 9.60632 1.49146 9.51489 1.51117C9.42339 1.53091 9.33323 1.5699 9.09207 1.67858L6.10233 3.03381C4.58756 3.7191 3.90327 4.03556 3.43338 4.58611L3.43306 4.58579C2.96452 5.1361 2.76295 5.85973 2.32912 7.4592L1.69648 9.79019C1.55986 10.2941 1.50238 10.5143 1.49177 10.7334C1.48117 10.9525 1.51714 11.1767 1.60401 11.6907L2.87376 19.2401L2.91521 19.4742C3.01321 19.9938 3.1192 20.3282 3.28223 20.551C3.4515 20.7823 3.70627 20.9223 4.20632 20.9758L4.30485 20.9822C4.534 20.9885 4.75737 20.9323 4.98851 20.839C5.25282 20.7323 5.49509 20.5927 5.77479 20.4516C5.78433 20.4468 5.79392 20.442 5.80355 20.4372L5.91292 20.6563L6.02261 20.875C5.7668 21.0029 5.46863 21.1733 5.17186 21.2931C4.86591 21.4166 4.52733 21.5026 4.15434 21.4627C3.57653 21.401 3.16719 21.2234 2.88683 20.8403C2.65644 20.5254 2.53285 20.0947 2.43244 19.5581L2.39067 19.3214L1.12124 11.7723C1.03771 11.2781 0.988527 10.9937 1.0023 10.7095C1.01608 10.4253 1.09253 10.1466 1.22391 9.662L1.85624 7.33101C2.27809 5.77568 2.50424 4.92155 3.06061 4.26819C3.61808 3.61507 4.42697 3.25419 5.90017 2.5877L8.89054 1.23215C9.1136 1.13163 9.25805 1.06538 9.4119 1.03221C9.56582 0.999052 9.72433 1.00001 9.9696 1.00001H16.0304Z" fill={horoscope.color}/>
                        <path d="M20.4083 7.04495C20.4511 6.9167 20.5896 6.84725 20.7179 6.88997C20.8462 6.93278 20.9156 7.07164 20.8729 7.19992C20.4804 8.37602 20.0341 9.51715 19.8735 10.7041C19.7586 11.5506 19.802 12.4109 19.8965 14.192L20.2248 20.4529C20.5224 20.603 20.7516 20.7406 21.0102 20.8466C21.2628 20.9502 21.5092 21.0064 21.7902 20.9767L21.8814 20.9659C22.3232 20.9056 22.558 20.769 22.7171 20.552C22.9039 20.2973 23.0157 19.8966 23.1262 19.2401L24.3957 11.691L24.396 11.6907C24.4829 11.1766 24.5189 10.9521 24.5082 10.7328C24.4976 10.5136 24.4401 10.2937 24.3035 9.79051L23.6709 7.4592C23.237 5.85959 23.0352 5.13612 22.5666 4.58579C22.0967 4.03535 21.4126 3.71902 19.898 3.03381L16.9073 1.67954L16.907 1.67922C16.6661 1.56943 16.5761 1.53048 16.4851 1.51085C16.3938 1.49117 16.2957 1.4898 16.0304 1.4898H9.9696C9.70478 1.4898 9.60632 1.49146 9.51489 1.51117C9.42339 1.53091 9.33323 1.5699 9.09207 1.67858L6.10233 3.03381C4.58756 3.7191 3.90327 4.03556 3.43338 4.58611L3.43306 4.58579C2.96452 5.1361 2.76295 5.85973 2.32912 7.4592L1.69648 9.79019C1.55986 10.2941 1.50238 10.5143 1.49177 10.7334C1.48117 10.9525 1.51714 11.1767 1.60401 11.6907L2.87376 19.2401L2.91521 19.4742C3.01321 19.9938 3.1192 20.3282 3.28223 20.551C3.4515 20.7823 3.70627 20.9223 4.20632 20.9758L4.30485 20.9822C4.534 20.9885 4.75737 20.9323 4.98851 20.839C5.25282 20.7323 5.49509 20.5927 5.77479 20.4516L6.10306 14.192C6.19637 12.4106 6.24106 11.5508 6.12729 10.7053C6.006 9.81425 5.72475 8.94957 5.42609 8.07684L5.12667 7.19992L5.11998 7.17569C5.09286 7.05462 5.16141 6.93009 5.28164 6.88997C5.40194 6.84987 5.5314 6.90846 5.58234 7.02167L5.59159 7.04495L5.88782 7.91293C6.18884 8.7921 6.48528 9.70382 6.61261 10.6393C6.73288 11.5329 6.68544 12.4384 6.59456 14.1728L6.59221 14.2178L6.1917 21.8533C6.19201 22.2573 6.22842 22.5268 6.33105 22.7379C6.42988 22.9411 6.60516 23.1198 6.94966 23.3048C8.43551 24.101 10.7052 24.5102 12.9999 24.5102C15.2946 24.5102 17.5637 24.1009 19.0496 23.3048C19.3942 23.1203 19.5696 22.9417 19.6685 22.7382C19.7711 22.5269 19.8072 22.2573 19.8075 21.8533L19.4073 14.2178C19.3138 12.4537 19.2657 11.541 19.3882 10.6384L19.423 10.4053C19.615 9.24171 20.051 8.11557 20.4083 7.04495Z" fill={horoscope.color}/>
                        <path d="M5.35938 7.12246C5.74611 8.28151 6.20455 9.45467 6.37029 10.6725C6.48784 11.5459 6.44082 12.4322 6.34796 14.2049L5.94712 21.8481C5.94712 22.6768 6.08818 23.12 6.83461 23.5208C9.90616 25.1666 16.0939 25.1666 19.1655 23.5208C19.9119 23.1212 20.053 22.6768 20.053 21.8481L19.6521 14.2049C19.5581 12.4322 19.5123 11.5459 19.631 10.6713C19.7955 9.45467 20.254 8.28151 20.6407 7.12246" stroke="rgba(0,0,0,0.3)" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.9141 20.6561C5.36632 20.93 4.81854 21.2873 4.18143 21.2192C3.10351 21.104 2.85313 20.5844 2.63331 19.2807L1.36378 11.7316C1.19334 10.723 1.19334 10.7148 1.46135 9.72618L2.09376 7.39515C2.52164 5.81761 2.73558 5.02884 3.24809 4.42698C3.76178 3.82512 4.50822 3.48657 6.00226 2.81065L8.9927 1.45529C9.45702 1.24605 9.46055 1.24487 9.97071 1.24487H16.0315C16.5417 1.24487 16.5452 1.24487 17.0095 1.45647L20 2.81065C21.494 3.48657 22.2405 3.82512 22.7541 4.42698C23.2667 5.02884 23.4806 5.81761 23.9085 7.39515L24.5409 9.72618C24.8089 10.7136 24.8089 10.723 24.6384 11.7316L23.3689 19.2807C23.1491 20.5856 22.8976 21.1051 21.8173 21.2203C21.1508 21.2909 20.6641 20.9453 20.0846 20.6561" stroke="rgba(0,0,0,0.3)" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.47266 1.8327C9.47266 1.8327 10.54 4.0838 11.424 4.55283C11.8789 4.79263 12.4466 4.77147 12.9991 4.77147C13.5516 4.77147 14.1194 4.79263 14.5743 4.55283C15.4571 4.08262 16.5256 1.8327 16.5256 1.8327" stroke="rgba(0,0,0,0.3)" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div>{getColorDescription(horoscope.color)}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Decorative Elements */}
        <img
          src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/bf65c29bb76ac59b655e89bb29946e4f00f49a6d?placeholderIfAbsent=true"
          alt="Decorative divider"
          style={decorativeDividerStyle}
        />
        
        <div style={decorativeElementContainerStyle}>
          <img
            src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/154f96a15bcd974fd38495f6f7aeec22f8b9613a?placeholderIfAbsent=true"
            alt="Decorative element"
            style={decorativeElementStyle}
          />
        </div>
      </div>
    </section>
    </>
  );
}; 