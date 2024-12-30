import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import MusicSearch from './pages/MusicSearch';
import Time from './pages/Time';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} /> {/* Landing Page */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/music" element={<MusicSearch />} />
        <Route path="/time" element={<Time />} />
      </Routes>
      <Footer/>
    </Router>
  );
};

export default App;
