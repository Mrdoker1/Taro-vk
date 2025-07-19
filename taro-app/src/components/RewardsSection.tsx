import { FC } from 'react';
import { Card, Div, Text, Button } from '@vkontakte/vkui';

interface RewardsSectionProps {
  onLearnMore?: () => void;
}

export const RewardsSection: FC<RewardsSectionProps> = ({ onLearnMore }) => {
  return (
    <div style={{ 
      border: '1px solid var(--vkui--color_field_border_alpha)', 
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        padding: '20px 16px 0'
      }}>
        <img
          src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/8fe9fd736d65fcb16451a2d349310471db362c0c"
          alt="Rewards icon"
          style={{
            width: '24px',
            height: '24px',
            objectFit: 'contain'
          }}
        />
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          margin: 0,
          color: 'var(--vkui--color_text_primary)'
        }}>
          Получай звезды
        </h2>
      </div>
      <Card mode="shadow">
        <Div
          style={{
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* Левая часть с изображением */}
            <div style={{ flex: '0 0 auto' }}>
              <img
                src="https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/130889f3b0a7b90f273ee095699d0a367263ba0e"
                alt="Stars illustration"
                style={{ width: '185px', height: '185px' }}
              />
            </div>

            {/* Правая часть с контентом */}
            <div style={{ flex: '1', minWidth: '280px' }}>
              <Text
                style={{
                  color: 'var(--vkui--color_text_primary)',
                  marginBottom: '16px',
                  lineHeight: '1.5',
                  fontSize: '15px'
                }}
              >
                Зарабатывай звезды за активность и трать их на уникальные расклады,
                коллекционные пины и магические артефакты.
              </Text>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--vkui--color_accent_gold)', fontSize: '16px' }}>•</span>
                  <Text style={{ color: 'var(--vkui--color_text_primary)', fontSize: '14px' }}>
                    Проводи расклад дня +1 звезда
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--vkui--color_accent_gold)', fontSize: '16px' }}>•</span>
                  <Text style={{ color: 'var(--vkui--color_text_primary)', fontSize: '14px' }}>
                    Напиши в дневник +1 звезда
                  </Text>
                </div>
              </div>

              <Button
                mode="primary"
                size="m"
                onClick={onLearnMore}
              >
                Узнать больше
              </Button>
            </div>
          </div>

          {/* Фоновое изображение */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url(https://api.builder.io/api/v1/image/assets/a61b8aff1f9a4d4b8c540558ab06b276/0cb3b98a5010017aa4aa8631bb889f4c8ddd7442)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.1,
              zIndex: 0
            }}
          />
        </Div>
      </Card>
    </div>
  );
};
