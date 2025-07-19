import { FC } from 'react';
import { CustomButton } from './CustomButton';
import bagImage from '../assets/bag.png';

interface BannerStarsProps {
  onLearnMore?: () => void;
}

export const BannerStars: FC<BannerStarsProps> = ({ onLearnMore }) => {
  return (
    <section 
      style={{
        borderRadius: '8px',
        border: '1px solid rgba(227,199,122,1)',
        display: 'flex',
        position: 'relative',
        width: '100%',
        minHeight: '218px',
        alignItems: 'center',
        gap: 'clamp(16px, 3vw, 24px)',
        padding: 'clamp(16px, 4vw, 32px)',
        overflow: 'hidden',
        flexWrap: 'wrap',
        boxSizing: 'border-box',
      }}
    >
      {/* Фоновое изображение */}
      <img
        src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/0cb3b98a5010017aa4aa8631bb889f4c8ddd7442"
        alt="Rewards background"
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          objectFit: 'cover',
          inset: '0',
          opacity: 0.3, // уменьшаем непрозрачность фона
          zIndex: 0,
        }}
      />
      
      {/* Изображение сумки слева */}
      <img
        src={bagImage}
        alt="Bag illustration"
        style={{
          width: 'clamp(100px, 15vw, 180px)', // увеличенный размер
          height: 'clamp(100px, 15vw, 180px)', // увеличенный размер
          objectFit: 'contain',
          flexShrink: 0,
          zIndex: 10,
        }}
      />
      
      {/* Контент */}
      <div 
        style={{
          position: 'relative',
          flex: 1,
          minWidth: 'min(240px, 100%)', // адаптивная минимальная ширина
          zIndex: 10,
        }}
      >
        <h1 
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: 'Jost',
            fontWeight: 400,
            fontSize: 'clamp(18px, 5vw, 24px)', // адаптивный размер шрифта
            lineHeight: 1.2,
            margin: '0 0 12px 0',
            color: 'white',
          }}
        >
          Получай звезды
        </h1>
        <p 
          style={{
            fontSize: 'clamp(14px, 3.5vw, 16px)', // адаптивный размер
            color: 'rgba(255,255,255,0.75)', // 75% прозрачность
            fontWeight: 'normal',
            lineHeight: '1.5',
            margin: '0 0 12px 0',
          }}
        >
          Зарабатывай звезды за активность и трать их на уникальные
          расклады, коллекционные пины и магические артефакты.
        </p>
        <div 
          style={{
            fontSize: 'clamp(13px, 3vw, 15px)', // адаптивный размер
            color: 'rgba(255,255,255,0.75)', // 75% прозрачность
            lineHeight: '1.5',
            margin: '0',
          }}
        >
          Проводи расклад дня +1 звезда
          <br />
          Напиши в дневник +1 звезда
        </div>
      </div>
      
      {/* Кнопка справа без дополнительного контейнера */}
      <CustomButton
        variant="primary"
        size="m"
        onClick={onLearnMore}
        style={{
          minWidth: 'clamp(140px, 25vw, 180px)', // адаптивная ширина
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        Узнать больше
      </CustomButton>
    </section>
  );
};
