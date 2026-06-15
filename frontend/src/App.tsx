import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';

// --- Landing Page ---
const Landing = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dailyCard, setDailyCard] = useState<any>(null);

  useEffect(() => {
    // Fetch a rotating random card from Scryfall API on mount
    fetch('https://api.scryfall.com/cards/random')
      .then(res => res.json())
      .then(data => setDailyCard(data))
      .catch(err => console.error('Failed to fetch daily card:', err));
  }, []);

  return (
    <div className="landing-container">
      <header className="hero" style={{ marginTop: '40px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '10px' }}>Scrillex</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text)' }}>
          The modern Magic: The Gathering collection tracker.
        </p>
        <Link to="/login" className="btn-primary">Enter the Multiverse</Link>
      </header>
      
      {dailyCard && dailyCard.image_uris && (
        <div className="daily-card-showcase">
          <h2>Card of the Day</h2>
          <img src={dailyCard.image_uris.normal} alt={dailyCard.name} />
          <p style={{ marginTop: '12px', fontWeight: 'bold' }}>
            {dailyCard.name}
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
            {dailyCard.set_name}
          </p>
        </div>
      )}
    </div>
  );
};

// --- Login Page ---
const Login = () => {
  const navigate = useNavigate();
  
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for actual backend /api/auth integration
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <h2 style={{ marginBottom: '30px' }}>Login or Register</h2>
      <form onSubmit={handleAuth}>
        <input type="text" placeholder="Username" required />
        <input type="password" placeholder="Password" required />
        <button type="submit" className="btn-primary">Access Collection</button>
      </form>
    </div>
  );
};

// --- Dashboard Component ---
const Dashboard = () => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Parsed ${file.name} successfully! Simulating CSV bulk add...`);
      // Future: parse with PapaParse and post to /api/collection endpoint
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dash-nav">
        <h2 style={{ margin: 0 }}>My Scrillex Dashboard</h2>
        <Link to="/" style={{ color: 'var(--text)', textDecoration: 'none' }}>Logout</Link>
      </nav>
      
      <div className="dash-content">
        <div className="actions-panel">
          <input 
            type="text" 
            placeholder="Search for any MTG card..." 
            className="search-box" 
            style={{ flex: 1, minWidth: '250px' }} 
          />
          <div className="upload-box">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Import Bulk CSV
            </label>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          </div>
        </div>

        <div className="stats-panel">
          <h3>Collection Progress</h3>
          
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4>Innistrad: Midnight Hunt (MID)</h4>
              <span>45%</span>
            </div>
            <div className="progress-bar">
              <div className="fill" style={{ width: '45%' }}></div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>124 / 277 Cards Collected</p>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4>All Origins & Sets Overall</h4>
              <span>12%</span>
            </div>
            <div className="progress-bar">
              <div className="fill" style={{ width: '12%' }}></div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>3,400 / 28,000+ Cards Collected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Root ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;