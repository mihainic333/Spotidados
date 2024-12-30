import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import data from '../data/sample.json';
import '../App.css';

const Time = () => {
  const [stats, setStats] = useState({
    top100Artists: [],
    top100Songs: [],
    topSongsBySeason: { Spring: [], Summer: [], Autumn: [], Winter: [] },
    topArtistsBySeason: { Spring: [], Summer: [], Autumn: [], Winter: [] },
  });

  const [artistPeriod, setArtistPeriod] = useState('all');
  const [songPeriod, setSongPeriod] = useState('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const currentDate = moment('2023-12-19');

  const getSeason = (date) => {
    const month = date.month();
    if ([2, 3, 4].includes(month)) return 'Spring';
    if ([5, 6, 7].includes(month)) return 'Summer';
    if ([8, 9, 10].includes(month)) return 'Autumn';
    return 'Winter';
  };

  const calculateSeasonalData = useCallback(() => {
    const seasonalSongs = { Spring: {}, Summer: {}, Autumn: {}, Winter: {} };
    const seasonalArtists = { Spring: {}, Summer: {}, Autumn: {}, Winter: {} };

    data.forEach((item) => {
      const itemDate = moment(item.ts, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
      if (!itemDate.isValid()) return;

      const season = getSeason(itemDate);

      // Aggregate song plays
      if (item.master_metadata_track_name) {
        seasonalSongs[season][item.master_metadata_track_name] =
          (seasonalSongs[season][item.master_metadata_track_name] || 0) +
          item.ms_played;
      }

      // Aggregate artist plays
      if (item.master_metadata_album_artist_name) {
        seasonalArtists[season][item.master_metadata_album_artist_name] =
          (seasonalArtists[season][item.master_metadata_album_artist_name] || 0) + 1;
      }
    });

    const formatSeasonalData = (data, limit) =>
      Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, plays]) => ({ name, plays }));

    const topSongsBySeason = {
      Spring: formatSeasonalData(seasonalSongs.Spring, 5),
      Summer: formatSeasonalData(seasonalSongs.Summer, 5),
      Autumn: formatSeasonalData(seasonalSongs.Autumn, 5),
      Winter: formatSeasonalData(seasonalSongs.Winter, 5),
    };

    const topArtistsBySeason = {
      Spring: formatSeasonalData(seasonalArtists.Spring, 3),
      Summer: formatSeasonalData(seasonalArtists.Summer, 3),
      Autumn: formatSeasonalData(seasonalArtists.Autumn, 3),
      Winter: formatSeasonalData(seasonalArtists.Winter, 3),
    };

    setStats((prevStats) => ({
      ...prevStats,
      topSongsBySeason,
      topArtistsBySeason,
    }));
  }, []);

  useEffect(() => {
    calculateSeasonalData();
  }, [calculateSeasonalData]);


  const filterByPeriod = useCallback(
    (data, period) => {
      if (period === 'all') return data;

      return data.filter((item) => {
        const itemDate = moment(item.ts, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
        if (!itemDate.isValid()) {
          console.log(`Data inválida: ${item.ts}`);
          return false;
        }
        if (period === '1m') {
          return itemDate.isAfter(currentDate.clone().subtract(1, 'months'));
        } else if (period === '6m') {
          return itemDate.isAfter(currentDate.clone().subtract(6, 'months'));
        } else {
          return itemDate.isAfter(currentDate.clone().subtract(1, 'years'));
        }
      });
    },
    [currentDate]
  );

  const calculateTopArtistsByPeriod = useCallback(
    (period) => {
      const filteredData = filterByPeriod(data, period);

      const artistPlays = {};
      filteredData.forEach((item) => {
        const artistName = item.master_metadata_album_artist_name;
        if (artistName) {
          artistPlays[artistName] = (artistPlays[artistName] || 0) + 1;
        }
      });

      const top100Artists = Object.entries(artistPlays)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100)
        .map(([name, plays]) => ({ name, plays }));

      return top100Artists;
    },
    [filterByPeriod]
  );

  const calculateTopSongsByPeriod = useCallback(
    (period) => {
      const filteredData = filterByPeriod(data, period);

      const songPlayTimes = {};
      filteredData.forEach((item) => {
        const trackName = item.master_metadata_track_name;
        if (trackName) {
          songPlayTimes[trackName] =
            (songPlayTimes[trackName] || 0) + item.ms_played;
        }
      });

      const top100Songs = Object.entries(songPlayTimes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100)
        .map(([name, ms_played]) => ({ name, ms_played }));

      return top100Songs;
    },
    [filterByPeriod]
  );

  useEffect(() => {
    if (isInitialLoad) {
      const top100Artists = calculateTopArtistsByPeriod(artistPeriod);
      const top100Songs = calculateTopSongsByPeriod(songPeriod);

      setStats((prevStats) => ({
        ...prevStats,
        top100Artists,
        top100Songs,
      }));

      setIsInitialLoad(false);
    }
  }, [
    isInitialLoad,
    artistPeriod,
    songPeriod,
    calculateTopArtistsByPeriod,
    calculateTopSongsByPeriod,
  ]);

  const handleArtistPeriodChange = (newPeriod) => {
    if (artistPeriod !== newPeriod) {
      const top100Artists = calculateTopArtistsByPeriod(newPeriod);
      setStats((prevStats) => ({ ...prevStats, top100Artists }));
      setArtistPeriod(newPeriod);
    }
  };

  const handleSongPeriodChange = (newPeriod) => {
    if (songPeriod !== newPeriod) {
      const top100Songs = calculateTopSongsByPeriod(newPeriod);
      setStats((prevStats) => ({ ...prevStats, top100Songs }));
      setSongPeriod(newPeriod);
    }
  };

  return (
    <div className="app-container">
      <h1 id="title">Estatísticas de Tempo</h1>

      <div className="top-section">
        <div className="section card">
          <h2>Top 100 Artistas</h2>
          <div className="button-group">
            <button onClick={() => handleArtistPeriodChange('1m')}>
              Último Mês
            </button>
            <button onClick={() => handleArtistPeriodChange('6m')}>
              Últimos 6 Meses
            </button>
            <button onClick={() => handleArtistPeriodChange('1y')}>
              Último Ano
            </button>
            <button onClick={() => handleArtistPeriodChange('all')}>
              Todos os Tempos
            </button>
          </div>
          <ul>
            {stats.top100Artists.length ? (
              stats.top100Artists.map((artist, index) => (
                <li key={index}>
                  {artist.name} ({artist.plays} plays)
                </li>
              ))
            ) : (
              <li>Nenhum dado disponível para este período.</li>
            )}
          </ul>
        </div>
        <div className="section card">
          <h2>Top 100 Músicas</h2>
          <div className="button-group">
            <button onClick={() => handleSongPeriodChange('1m')}>
              Último Mês
            </button>
            <button onClick={() => handleSongPeriodChange('6m')}>
              Últimos 6 Meses
            </button>
            <button onClick={() => handleSongPeriodChange('1y')}>
              Último Ano
            </button>
            <button onClick={() => handleSongPeriodChange('all')}>
              Todos os Tempos
            </button>
          </div>
          <ul>
            {stats.top100Songs.length ? (
              stats.top100Songs.map((song, index) => (
                <li key={index}>
                  {song.name} ({song.ms_played} ms)
                </li>
              ))
            ) : (
              <li>Nenhum dado disponível para este período.</li>
            )}
          </ul>
        </div>
      </div>

      
      <div className="seasons-section">
        {Object.keys(stats.topSongsBySeason).map((season) => (
          <div className="season card" key={season}>
            <h3>{season}</h3>
            <h4>Top 5 Músicas</h4>
            <ul>
              {stats.topSongsBySeason[season].map((song, index) => (
                <li key={index}>
                  {song.name} ({song.plays} ms)
                </li>
              ))}
            </ul>
            <h4>Top 3 Artistas</h4>
            <ul>
              {stats.topArtistsBySeason[season].map((artist, index) => (
                <li key={index}>
                  {artist.name} ({artist.plays} plays)
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Time;
