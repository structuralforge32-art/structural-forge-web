import React, { useEffect, useState, useContext } from 'react';
import Image from 'next/image';
import styles from './Troidey.module.css';
import { TroideyContext } from '@/context/TroideyContext';
import jokes from '@/data/troideyJokes';

const Troidey = () => {
  const { muted, toggleMute } = useContext(TroideyContext);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [jokeIndex, setJokeIndex] = useState(0);
  const [showJoke, setShowJoke] = useState(false);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Rotate jokes every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setJokeIndex((prev) => (prev + 1) % jokes.length);
      setShowJoke(true);
      // hide after 5 seconds
      setTimeout(() => setShowJoke(false), 5000);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.troideyContainer} style={{ left: position.x + 20, top: position.y + 20 }}>
      <Image src="/troidey.png" alt="Troidey mascot" width={80} height={80} className={styles.avatar} />
      <button className={styles.muteButton} onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
        {muted ? '🔈' : '🔊'}
      </button>
      {showJoke && !muted && (
        <div className={styles.jokeBubble}>
          {jokes[jokeIndex]}
        </div>
      )}
    </div>
  );
};

export default Troidey;
