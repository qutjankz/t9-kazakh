import React from 'react';
import { Link } from 'react-router-dom';
import './pages.css';

const GAMES = [
  {
    to: '/games/true-false',
    icon: '🎯',
    title: 'Ойын',
    desc: 'Сөз дұрыс жазылған ба, әлде қате ме? 10 сұрақ, жылдам шеш.',
    tag: '+1 XP / дұрыс жауап',
    color: 'green',
  },
  {
    to: '/games/dictation',
    icon: '✍️',
    title: 'Диктант',
    desc: 'Кез келген мәтін жаз — 54 мың сөздік қателерді тауып, түзетуді ұсынады.',
    tag: '+1 XP / дұрыс сөз',
    color: 'blue',
  },
  {
    to: '/games/keyboard',
    icon: '⌨️',
    title: 'T9 пернетақта',
    desc: 'Қазақ пернетақтасы автотүзетумен. Еркін жазуға арналған құрал.',
    tag: 'Құрал',
    color: 'purple',
  },
];

const GamesHubPage: React.FC = () => (
  <div>
    <h1 className="page-title">Ойындар</h1>
    <p className="page-subtitle">Деңгейлерден тыс жаттығу — серияңды сақта, XP жина</p>

    <div className="games-grid">
      {GAMES.map((g, i) => (
        <Link key={g.to} to={g.to} className={`game-card game-${g.color} anim-fade-up`} style={{ animationDelay: `${i * 0.07}s` }}>
          <span className="game-card-icon">{g.icon}</span>
          <div className="game-card-body">
            <div className="game-card-title">{g.title}</div>
            <div className="game-card-desc">{g.desc}</div>
            <span className="game-card-tag">{g.tag}</span>
          </div>
          <span className="game-card-arrow">›</span>
        </Link>
      ))}
    </div>
  </div>
);

export default GamesHubPage;
