import * as React from 'react';
import MusicCircle from './utils';
import './styles.scss'
const { useState, useEffect, useRef, useLayoutEffect } = React

interface Track {
  url: string;
  artist: string;
  song: string;
}

interface MusicVisualizerProps {
  currentTrackIndex: number;
  tracks: Track[];
  playing: boolean;
  onPlay: Function;
  onPause: Function;
}

const playerDetails = {
  size: 560,
  musicWaveLength: 78,
  color: '#FFFFFF'
};

const MusicVisualizer: React.FC<MusicVisualizerProps> = ({ currentTrackIndex = 0, tracks = [], playing, onPlay, onPause }) => {
  const audioRef = useRef(null);
  const visualRef = useRef(null);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [musicCircleInstance, setMusicCircleInstance] = useState(null);

  const currentTrack = tracks[currentTrackIndex];
  const { url = '', artist = '', song = '' } = currentTrack || {};

  const { size } = playerDetails;

  const playAudio = () => {
    audioRef.current.play();
    const audioContext = musicCircleInstance.getAudioContext();
    const { state } = audioContext;
    if (state === 'suspended') audioContext.resume();
  }

  const pauseAudio = () => audioRef.current.pause();

  const nextTrack = () => {
    const sliceIndex = currentTrackIndex + 1;
    const nextTrackIndex =
      sliceIndex + tracks.slice(sliceIndex).findIndex(({ url }) => !!url);
    onPlay(nextTrackIndex);
  };

  const prevTrack = () => {
    const lastTrackIndex =
      currentTrackIndex -
      1 -
      tracks
        .slice(0, currentTrackIndex)
        .reverse()
        .findIndex(({ url }) => !!url);
    onPlay(lastTrackIndex);
  };

  const toggleSound = e =>
    e.target.closest('svg').classList.toggle('disabled')
      ? (audioRef.current.muted = true)
      : (audioRef.current.muted = false);

  const keepTime = () => {
    const currentTime = parseInt(audioRef.current.currentTime || 0);
    const min = Math.round(currentTime / 60);
    const seconds = (currentTime % 60).toString().padStart(2, '0');
    setCurrentTime(`${min}:${seconds}`);
  };

  useLayoutEffect(() => {
    setMusicCircleInstance(new MusicCircle({
      ...playerDetails,
      canvasEl: visualRef.current,
      audioEl: audioRef.current
    }));
    const timerIntervalInstance = setInterval(keepTime, 300);
    return () => {
      clearInterval(timerIntervalInstance);
    };
  }, []);

  useEffect(() => {
    if (playing) playAudio();
    else pauseAudio();
  }, [playing, currentTrackIndex]);

  return (
    <div className="player">
      <div className="canvas-wrapper">
        <div className="inner-canvas-wrapper">
          <canvas className="visual" width={size} height={size} ref={visualRef} />
        </div>
      </div>

      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        // src="//katiebaca.com/tutorial/odd-look.mp3"
        src={url}
        onEnded={() => onPause()}
      />

      <div className="song">
        <div className="artist">{artist}</div>
        <div className="name">{song}</div>
      </div>

      <div className="play-area">
        <svg
          className="prev-song"
          onClick={prevTrack}
          stroke="white"
          fill="white"
          strokeWidth="0" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"></path>
        </svg>
        <svg
          className="play"
          style={playing ? { display: 'none' } : { display: 'inline-block' }}
          onClick={() => onPlay()}
          stroke="white"
          fill="white"
          strokeWidth="0"
          viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
        </svg>
        <svg
          className="pause"
          style={playing ? { display: 'inline-block' } : { display: 'none' }}
          onClick={() => onPause()}
          stroke="white"
          fill="white"
          strokeWidth="0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9 16h2V8H9v8zm3-14C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-4h2V8h-2v8z"></path>
        </svg>
        <svg
          className="next-song"
          onClick={nextTrack}
          stroke="white"
          fill="white"
          strokeWidth="0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"></path>
        </svg>
        <svg
          className="sound-control"
          onClick={toggleSound}
          stroke="white"
          fill="white" 
          strokeWidth="0"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M11.536 14.01A8.473 8.473 0 0014.026 8a8.473 8.473 0 00-2.49-6.01l-.708.707A7.476 7.476 0 0113.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"></path>
          <path d="M10.121 12.596A6.48 6.48 0 0012.025 8a6.48 6.48 0 00-1.904-4.596l-.707.707A5.483 5.483 0 0111.025 8a5.483 5.483 0 01-1.61 3.89l.706.706z"></path>
          <path d="M8.707 11.182A4.486 4.486 0 0010.025 8a4.486 4.486 0 00-1.318-3.182L8 5.525A3.489 3.489 0 019.025 8 3.49 3.49 0 018 10.475l.707.707z"></path>
          <path fillRule="evenodd" d="M6.717 3.55A.5.5 0 017 4v8a.5.5 0 01-.812.39L3.825 10.5H1.5A.5.5 0 011 10V6a.5.5 0 01.5-.5h2.325l2.363-1.89a.5.5 0 01.529-.06z" clipRule="evenodd"></path>
        </svg>
      </div>

      <div className="time">{currentTime}</div>
    </div>
  );
};

export default MusicVisualizer
