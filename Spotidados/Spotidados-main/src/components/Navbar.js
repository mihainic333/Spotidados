import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <h2 className="logo">spotidados</h2>
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
        <nav className={`navbar ${isMenuOpen ? "open" : ""}`}>
          <NavLink
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            to="/profile"
            onClick={() => setIsMenuOpen(false)} // Close menu after clicking
          >
            Perfil
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            to="/music"
            onClick={() => setIsMenuOpen(false)} // Close menu after clicking
          >
            Músicas
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            to="/time"
            onClick={() => setIsMenuOpen(false)} // Close menu after clicking
          >
            Tempo
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
