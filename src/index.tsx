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

  const currentTrack = tracks[currentTrackIndex];
  const { url = '', artist = '', song = '' } = currentTrack || {};

  const { size } = playerDetails;

  const playAudio = () => audioRef.current.play();

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
    e.target.classList.toggle('disabled')
      ? (audioRef.current.muted = true)
      : (audioRef.current.muted = false);

  const keepTime = () => {
    const currentTime = parseInt(audioRef.current.currentTime || 0);
    const min = Math.round(currentTime / 60);
    const seconds = (currentTime % 60).toString().padStart(2, '0');
    setCurrentTime(`${min}:${seconds}`);
  };

  useLayoutEffect(() => {
    new MusicCircle({
      ...playerDetails,
      canvasEl: visualRef.current,
      audioEl: audioRef.current
    });
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
        <div className="prev-song" onClick={prevTrack} />
        <div
          className="play"
          style={playing ? { display: 'none' } : { display: 'inline-block' }}
          onClick={() => onPlay()}
        />
        <div
          className="pause"
          style={playing ? { display: 'inline-block' } : { display: 'none' }}
          onClick={() => onPause()}
        />
        <div className="next-song" onClick={nextTrack} />
        <div className="sound-control" onClick={toggleSound} />
      </div>

      <div className="time">{currentTime}</div>
    </div>
  );
};

export default MusicVisualizer
