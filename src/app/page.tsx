// pages/index.js
"use client"
import React, { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import CrownSvg from '../components/CrownSvg';
import AwardSvg from '../components/AwardSvg';
import Modal from '../components/Modal';


const generateSequence = (length: number) => {
  const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let sequence = '';
  for (let i = 0; i < length; i++) {
    sequence += keys.charAt(Math.floor(Math.random() * keys.length));
  }
  return sequence;
};

interface Score {
  name: string;
  score: number;
}

const Home: React.FC = () => {
  const [sequence, setSequence] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [message, setMessage] = useState('');
  const [messageButton, setMessageButton] = useState('Iniciar');
  const [timeLeft, setTimeLeft] = useState(30); // Tempo limite de 30 segundos
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [ranking, setRanking] = useState<Score[]>([]);

  useEffect(() => {
    setSequence(generateSequence(6));
    const savedRanking = localStorage.getItem('ranking');

    if (savedRanking) {
      setRanking(JSON.parse(savedRanking));

    }
  }, []);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      setMessage('Tempo esgotado!');
      saveScore()
    }
  }, [timeLeft, isPlaying]);

  const startGame = () => {
    const newSequence = generateSequence(6);
    setSequence(newSequence);
    setCurrentInput('');
    setMessage('');
    setTimeLeft(30);
    setIsPlaying(true);
    setScore(score);
    resetProgressBarAnimation();
  };

  const handleKeyPress = (e: { key: string; }) => {
    if (!isPlaying) return;

    const key = e.key.toUpperCase();
    if (sequence[currentInput.length] === key) {
      setCurrentInput(currentInput + key);
      if (currentInput.length + 1 === sequence.length) {
        setMessage('Sucesso');
        setIsPlaying(false);
        setMessageButton('Jogar novamente')
        setScore(score + 1); // Incrementa a pontuação
        //add sound win
      }
    } else {
      setMessage('Você falhou!');
      setIsPlaying(false);
      setMessageButton('Tentar Novamente')
      setScore(0);
      saveScore()
      //add sound lost
    }
  };

  const saveScore = () => {
    const playerName = prompt('Digite seu nome:') || 'Anônimo';
    const newRanking = [...ranking, { name: playerName, score }];
    newRanking.sort((a, b) => b.score - a.score);
    if (newRanking.length > 10) newRanking.pop(); // Mantém apenas os top 10
    setRanking(newRanking);
    localStorage.setItem('ranking', JSON.stringify(newRanking));
  };

  const resetGame = () => {
    startGame();
    setScore(0);
    setSequence(generateSequence(6));
    setTimeLeft(30);
    setMessage('');
    resetProgressBarAnimation();
  };

  const resetProgressBarAnimation = () => {
    const progressBar = document.querySelector(`.${styles.progressbar}`) as HTMLElement;

    if (progressBar) {
      progressBar.classList.remove(styles.progressbar);
      // Force reflow
      void progressBar.offsetWidth;
      progressBar.classList.add(styles.progressbar);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentInput, isPlaying]);

  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <div className={styles.svgcontainer}>
          <CrownSvg />
        </div>
        <h1 className={styles.title}>MINI-GAME</h1>
        {!isPlaying && <div><button className={styles.button} onClick={startGame}>{messageButton}</button></div>}
        {isPlaying ? <p>Pressione as teclas na ordem correta</p> : null}
        <div className={styles.sequence}>
          {isPlaying ? sequence.split('').map((char, index) => (
            <div
              key={index}
              className={`${styles.letterbox} ${currentInput[index] === char ? styles.correct : ''}`}
            >
              {char}
            </div>
          )) : null}



        </div>
        <div>
          {isPlaying && <button className={styles.buttonreset} onClick={resetGame}>Reiniciar</button>}
          {isPlaying && <div className={styles.progress}>
            <div className={styles.progressbar}></div> </div>}
        </div>

      </div>

      <div className={styles.modal}>
        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.svgcontainerRanking}>
          <AwardSvg />
          <>
            <p className={styles.description}>Pontuação: {score}</p>
            <div className={styles.ranking}>
              <h2>Ranking</h2>
              <ol>
                {ranking.map((entry, index) => (
                  <li key={index}>{entry.name}: {entry.score}</li>
                ))}
              </ol>
            </div>
          </>
        </div>
      </div>
    </div>

  );
}

export default Home;
