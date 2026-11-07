import React from 'react';
import { Link } from 'react-router-dom';
import Game from '../components/Game';
import { useCuratedDictionary } from '../hooks/useCuratedDictionary';
import { usePracticeLogger } from '../hooks/usePracticeLogger';
import './pages.css';

const TrueFalseGamePage: React.FC = () => {
  const { dictionary, loading } = useCuratedDictionary();
  const logPractice = usePracticeLogger('TRUE_FALSE');

  return (
    <div>
      <Link to="/games" className="back-link">
        ‹ Ойындар
      </Link>
      {loading ? <p className="page-subtitle">Жүктелуде…</p> : <Game dictionary={dictionary} onFinish={logPractice} />}
    </div>
  );
};

export default TrueFalseGamePage;
