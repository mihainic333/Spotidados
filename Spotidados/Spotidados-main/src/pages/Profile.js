import React, { useState, useEffect } from 'react';
import data from '../data/sample.json'; // Importa o JSON
import '../App.css';

const Profile = () => {
  const [stats, setStats] = useState({
    totalPlays: 0,
    uniqueTracks: 0,
    uniqueArtists: 0,
    totalMinutes: 0,
    mostPlayedSong: { name: '', plays: 0 },
    dailyAverage: 0,
  });

  useEffect(() => {
    const calculateStats = () => {
      const totalPlays = data.length;
      const uniqueTracks = new Set(data.map(item => item.master_metadata_track_name)).size;
      const uniqueArtists = new Set(data.map(item => item.master_metadata_album_artist_name)).size;
      const totalMinutes = data.reduce((sum, item) => sum + item.ms_played, 0) / 60000;

      const songPlays = new Map();
      data.forEach(item => {
        const trackName = item.master_metadata_track_name;
        if (trackName) {
          if (songPlays.has(trackName)) {
            songPlays.set(trackName, songPlays.get(trackName) + 1);
          } else {
            songPlays.set(trackName, 1);
          }
        }
      });

      let mostPlayedSong = { name: '', plays: 0 };
      songPlays.forEach((plays, name) => {
        if (plays > mostPlayedSong.plays) {
          mostPlayedSong = { name, plays };
        }
      });

      const totalDays = new Set(data.map(item => item.ts.split('T')[0])).size;
      const dailyAverage = totalMinutes / totalDays;

      setStats({ totalPlays, uniqueTracks, uniqueArtists, totalMinutes, mostPlayedSong, dailyAverage });
    };

    calculateStats();
  }, []);

  return (
    <div className="profile-container">
      <h1 className="profile-title">Seu Perfil Musical</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Plays Totais</p>
          <p className="stat-value">{stats.totalPlays}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Músicas Únicas</p>
          <p className="stat-value">{stats.uniqueTracks}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Artistas Únicos</p>
          <p className="stat-value">{stats.uniqueArtists}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Minutos Ouvidos</p>
          <p className="stat-value">{stats.totalMinutes.toFixed(2)} min</p>
        </div>
        <div className="stat-card highlight">
          <p className="stat-label">Música Mais Ouvida</p>
          <p className="stat-value">{stats.mostPlayedSong.name}</p>
          <p className="stat-subvalue">({stats.mostPlayedSong.plays} plays)</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Média Diária</p>
          <p className="stat-value">{stats.dailyAverage.toFixed(2)} min/dia</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
