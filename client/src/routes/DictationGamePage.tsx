import React from 'react';
import { Link } from 'react-router-dom';
import Dictation from '../components/Dictation';
import { useCuratedDictionary } from '../hooks/useCuratedDictionary';
import { usePracticeLogger } from '../hooks/usePracticeLogger';
import './pages.css';

const DictationGamePage: React.FC = () => {
  const { dictionary } = useCuratedDictionary();
  const logPractice = usePracticeLogger('DICTATION');

  return (
    <div>
      <Link to="/games" className="back-link">
        ‹ Ойындар
      </Link>
      <h1 className="page-title">Диктант</h1>
      <p className="page-subtitle">Мәтін жазып, «Тексеру» бас — қате сөздер мен түзету нұсқалары көрсетіледі</p>
      <Dictation dictionary={dictionary} onChecked={logPractice} />
    </div>
  );
};

export default DictationGamePage;
