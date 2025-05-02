import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchSpreads } from '../store/slices/taroSpreadsSlice';
import { Spinner } from '@vkontakte/vkui';

interface TaroSpreadsProps {
  onSelectSpread?: (spreadId: string) => void;
}

export const TaroSpreads: React.FC<TaroSpreadsProps> = ({ onSelectSpread }) => {
  const dispatch = useAppDispatch();
  const { spreads, spreadsLoading, spreadsError } = useAppSelector((state) => state.taroSpreads);

  useEffect(() => {
    dispatch(fetchSpreads({ lang: 'russian' }));
  }, [dispatch]);

  if (spreadsLoading) {
    return <Spinner size="m" />;
  }

  if (spreadsError) {
    return <div>Ошибка: {spreadsError}</div>;
  }

  return (
    <div>
      <h2>Доступные расклады</h2>
      <div className="spreads-grid">
        {spreads.map((spread) => (
          <div 
            key={spread.id} 
            className="spread-card"
            onClick={() => onSelectSpread?.(spread.id)}
          >
            <h3>{spread.name}</h3>
            <p>{spread.description}</p>
            {spread.paid && <span className="paid-badge">Платный</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaroSpreads; 