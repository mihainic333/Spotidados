import React, { useState, useEffect } from 'react';
import data from '../data/sample.json';
import '../App.css'; // Ensure the CSS is imported

const MusicSearch = () => {
  const [artistName, setArtistName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [artistsList, setArtistsList] = useState([]);
  const [totalTracks, setTotalTracks] = useState(0);
  const [uniqueTracks, setUniqueTracks] = useState(0);
  const [totalTimePlayed, setTotalTimePlayed] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [artistPercentage, setArtistPercentage] = useState(0);
  const [topSongs, setTopSongs] = useState([]);
  const [artistPosition, setArtistPosition] = useState(null);
  const [seasonData, setSeasonData] = useState({});

  const filterByDate = (tracks) => {
    const maxDate = new Date('2023-12-19');
    return tracks.filter((track) => new Date(track.ts) <= maxDate);
  };

  useEffect(() => {
    const filteredData = filterByDate(data);

    const uniqueArtists = Array.from(
      new Set(
        filteredData
          .filter((track) => track.master_metadata_album_artist_name)
          .map((track) => track.master_metadata_album_artist_name)
      )
    );
    setArtistsList(uniqueArtists.sort());
  }, []);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setArtistName(inputValue);

    if (inputValue.length > 0) {
      const filteredSuggestions = artistsList.filter((artist) =>
        artist.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setArtistName(suggestion);
    setSuggestions([]);
  };

  const handleSearch = () => {
    const filteredData = filterByDate(data);

    const filteredTracks = filteredData.filter((track) => {
      return (
        typeof track.master_metadata_album_artist_name === 'string' &&
        track.master_metadata_album_artist_name.toLowerCase() === artistName.toLowerCase()
      );
    });

    setTotalTracks(filteredTracks.length);

    const uniqueTrackNames = new Set(filteredTracks.map((track) => track.master_metadata_track_name));
    setUniqueTracks(uniqueTrackNames.size);

    const totalTime = filteredTracks.reduce((sum, track) => sum + track.ms_played, 0);
    setTotalTimePlayed(totalTime);
    setTotalMinutes(totalTime / (1000 * 60));

    const totalPlays = filteredData.length;
    const artistPlays = filteredTracks.length;
    const percentage = ((artistPlays / totalPlays) * 100).toFixed(2);
    setArtistPercentage(percentage);

    const songPlays = filteredTracks.reduce((acc, track) => {
      const songName = track.master_metadata_track_name;
      const msPlayed = track.ms_played;

      if (acc[songName]) {
        acc[songName] += msPlayed;
      } else {
        acc[songName] = msPlayed;
      }
      return acc;
    }, {});

    const topSongsList = Object.entries(songPlays)
      .map(([song, totalMs]) => ({ song, totalTimeMs: totalMs }))
      .sort((a, b) => b.totalTimeMs - a.totalTimeMs)
      .slice(0, 20);

    setTopSongs(topSongsList);

    const artistPlaysByArtist = filteredData.reduce((acc, track) => {
      const artist = track.master_metadata_album_artist_name;
      const msPlayed = track.ms_played;

      if (acc[artist]) {
        acc[artist] += msPlayed;
      } else {
        acc[artist] = msPlayed;
      }
      return acc;
    }, {});

    const sortedArtists = Object.entries(artistPlaysByArtist)
      .map(([artist, totalMs]) => ({ artist, totalTimeMs: totalMs }))
      .sort((a, b) => b.totalTimeMs - a.totalTimeMs);

    const artistRank = sortedArtists.findIndex(
      (artist) => artist.artist.toLowerCase() === artistName.toLowerCase()
    ) + 1;

    setArtistPosition(artistRank <= 100 ? artistRank : null);

    const seasonCounts = {
      Primavera: 0,
      Verao: 0,
      Outono: 0,
      Inverno: 0,
    };

    filteredTracks.forEach((track) => {
      const date = new Date(track.ts);
      const month = date.getMonth();

      if (month >= 2 && month <= 4) {
        seasonCounts.Primavera += track.ms_played;
      } else if (month >= 5 && month <= 7) {
        seasonCounts.Verao += track.ms_played;
      } else if (month >= 8 && month <= 10) {
        seasonCounts.Outono += track.ms_played;
      } else {
        seasonCounts.Inverno += track.ms_played;
      }
    });

    const seasons = Object.entries(seasonCounts)
      .map(([season, totalMs]) => ({ season, totalMs }))
      .sort((a, b) => b.totalMs - a.totalMs);
    setSeasonData(seasons[0]);
  };

  return (
    <div className="music-search-container">
      <h2 className="music-search-title">Buscar Músicas por Artista</h2>
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Digite o nome do artista"
          value={artistName}
          onChange={handleInputChange}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Pesquisar
        </button>
      </div>

      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      <div className="results-container">
        <p><strong>Total de Plays:</strong> {totalTracks}</p>
        <p><strong>Músicas Diferentes:</strong> {uniqueTracks}</p>
        <p><strong>Tempo Total:</strong> {totalMinutes.toFixed(2)} minutos</p>
        <p><strong>% do Artista:</strong> {artistPercentage}%</p>

        {topSongs.length > 0 && (
          <>
            <h3>Top 20 Músicas:</h3>
            <ul className="top-songs-list">
              {topSongs.map((song, index) => (
                <li key={index}>
                  {song.song} - {song.totalTimeMs} ms
                </li>
              ))}
            </ul>
          </>
        )}

        {artistPosition && (
          <p><strong>Top Artista:</strong> #{artistPosition}</p>
        )}

        {seasonData.season && (
          <p><strong>Estação:</strong> {seasonData.season} ({(seasonData.totalMs / (1000 * 60)).toFixed(2)} minutos)</p>
        )}
      </div>
    </div>
  );
};

export default MusicSearch;
