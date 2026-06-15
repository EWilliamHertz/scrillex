import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Link, useNavigate } from 'react-router-dom';
import './App.css';




// --- Landing Page ---
const Landing = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dailyCard, setDailyCard] = useState<any>(null);




  useEffect(() => {
    fetch('https://api.scryfall.com/cards/random')
      .then(res => res.json())
      .then(data => setDailyCard(data))
      .catch(err => console.error('Failed to fetch daily card:', err));
  }, []);




  // Safely fallback to card_faces if the fetched card is double-faced
  const imageUrl = dailyCard?.image_uris?.normal || dailyCard?.card_faces?.[0]?.image_uris?.normal;
  const artistName = dailyCard?.artist || dailyCard?.card_faces?.[0]?.artist;




  return (
    <div className="landing-container">
      <header className="hero" style={{ marginTop: '40px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '10px' }}>Scrillex</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text)' }}>
          The modern Magic: The Gathering collection tracker.
        </p>
        <Link to="/auth" className="btn-primary">Enter the Multiverse</Link>
      </header>
      
      {imageUrl && (
        <div className="daily-card-showcase">
          <h2>Card of the Day</h2>
          <img src={imageUrl} alt={dailyCard?.name} />
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{dailyCard?.name}</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
              {dailyCard?.set_name} • Illustrated by <strong>{artistName}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};




// --- Auth Page (Login / Register Toggle) ---
const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };




  return (
    <div className="auth-container">
      <h2 style={{ marginBottom: '30px' }}>{isLogin ? 'Access Your Collection' : 'Register for Scrillex'}</h2>
      <form onSubmit={handleAuth}>
        {!isLogin && <input type="email" placeholder="Email Address" required />}
        <input type="text" placeholder="Username" required />
        <input type="password" placeholder="Password" required />
        <button type="submit" className="btn-primary">
          {isLogin ? 'Login' : 'Create Account'}
        </button>
      </form>
      <button className="btn-link" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Register here." : "Already have an account? Login here."}
      </button>
    </div>
  );
};




// --- Dashboard Sub-Components ---
const SetTracker = () => (
  <div className="stats-panel">
    <h3 style={{ marginBottom: '20px' }}>Set Collection Progress</h3>
    <div className="stat-card">
      <div className="stat-header">
        <h4>Duskmourn: House of Horror (DSK)</h4>
        <span>72%</span>
      </div>
      <div className="progress-bar"><div className="fill" style={{ width: '72%' }}></div></div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>198 / 276 Cards Collected</p>
    </div>
    <div className="stat-card">
      <div className="stat-header">
        <h4>Bloomburrow (BLB)</h4>
        <span>45%</span>
      </div>
      <div className="progress-bar"><div className="fill" style={{ width: '45%' }}></div></div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>120 / 266 Cards Collected</p>
    </div>
  </div>
);




const IllustratorTracker = () => {
  const [artist, setArtist] = useState('');
  
  return (
    <div className="stats-panel">
      <h3 style={{ marginBottom: '20px' }}>Illustrator Collection Tracker</h3>
      <input 
        type="text" 
        className="search-box" 
        placeholder="Search for an artist (e.g., Rebecca Guay, John Avon)..." 
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        style={{ width: '100%', marginBottom: '24px' }} 
      />
      <div className="stat-card">
        <div className="stat-header">
          <h4>John Avon</h4>
          <span>88%</span>
        </div>
        <div className="progress-bar"><div className="fill" style={{ width: '88%' }}></div></div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>257 / 293 Cards Collected</p>
      </div>
      <div className="stat-card">
        <div className="stat-header">
          <h4>Terese Nielsen</h4>
          <span>31%</span>
        </div>
        <div className="progress-bar"><div className="fill" style={{ width: '31%' }}></div></div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>45 / 145 Cards Collected</p>
      </div>
    </div>
  );
};




// --- Main Dashboard Layout ---
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'sets' | 'illustrators' | 'bulk'>('sets');




  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) alert(`Parsed ${file.name} successfully! Simulating CSV bulk add...`);
  };




  return (
    <div className="dashboard-container">
      <nav className="dash-nav">
        <h2 style={{ margin: 0 }}>My Scrillex Dashboard</h2>
        <Link to="/" style={{ color: 'var(--text)', textDecoration: 'none' }}>Logout</Link>
      </nav>
      
      <div className="dashboard-layout">
        <aside className="sidebar">
          <button 
            className={activeTab === 'sets' ? 'active' : ''} 
            onClick={() => setActiveTab('sets')}
          >
            📦 Set Tracker
          </button>
          <button 
            className={activeTab === 'illustrators' ? 'active' : ''} 
            onClick={() => setActiveTab('illustrators')}
          >
            🎨 Illustrator Tracker
          </button>
          <button 
            className={activeTab === 'bulk' ? 'active' : ''} 
            onClick={() => setActiveTab('bulk')}
          >
            ➕ Bulk Import (CSV)
          </button>
        </aside>




        <main className="dash-content">
          {activeTab === 'sets' && <SetTracker />}
          {activeTab === 'illustrators' && <IllustratorTracker />}
          {activeTab === 'bulk' && (
            <div className="upload-box">
              <h3 style={{ marginBottom: '10px' }}>Import Bulk CSV</h3>
              <p style={{ marginBottom: '16px', color: 'var(--text)' }}>
                Upload your collection lists from DragonShield, TCGPlayer, or Deckbox to automatically update your Set and Illustrator progress.
              </p>
              <input type="file" accept=".csv" onChange={handleFileUpload} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};




// --- Main App Root ---
const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/auth", element: <Auth /> },
  { path: "/dashboard", element: <Dashboard /> }
]);




function App() {
  return <RouterProvider router={router} />;
}




export default App;