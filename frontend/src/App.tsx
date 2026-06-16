import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Link, useNavigate, useLocation, useRouteError } from 'react-router-dom';
import './App.css';

// --- Error Boundary ---
const GlobalError = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = useRouteError() as any;
  console.error("Router Caught Error:", error);
  return (
    <div className="landing-container">
      <h1 style={{ color: 'var(--accent)' }}>A Multiversal Anomaly Occurred</h1>
      <p style={{ color: 'var(--text)', margin: '20px 0' }}>
        {error?.statusText || error?.message || "The application encountered an unexpected routing error."}
      </p>
      <Link to="/" className="btn-primary">Return to Safety</Link>
    </div>
  );
};

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

  const imageUrl = dailyCard?.image_uris?.normal || dailyCard?.card_faces?.[0]?.image_uris?.normal;
  const artistName = dailyCard?.artist || dailyCard?.card_faces?.[0]?.artist;

  return (
    <div className="landing-container">
      <header>
        <h1 style={{ fontSize: '4rem', margin: '0 0 10px 0' }}>Scrillex</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text)', marginBottom: '30px' }}>
          The modern Magic: The Gathering collection tracker.
        </p>
        <Link to="/auth" className="btn-primary">Enter the Multiverse</Link>
      </header>
      
      {imageUrl && (
        <div className="daily-card-showcase">
          <h2 style={{ margin: '0 0 16px 0' }}>Card of the Day</h2>
          <img src={imageUrl} alt={dailyCard?.name} />
          <div>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '10px 0' }}>{dailyCard?.name}</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', margin: 0 }}>
              {dailyCard?.set_name} • Illustrated by <strong style={{ color: 'var(--text-h)' }}>{artistName}</strong>
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
  const [username, setUsername] = useState('');
  
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard', { state: { username: username || 'Planeswalker' } });
  };

  return (
    <div className="auth-container">
      <h2 style={{ marginBottom: '30px' }}>{isLogin ? 'Access Your Collection' : 'Register for Scrillex'}</h2>
      <form onSubmit={handleAuth}>
        {!isLogin && <input type="email" placeholder="Email Address" required />}
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CardSearch = ({ collection, toggleCard }: { collection: any[], toggleCard: (card: any) => void }) => {
  const [query, setQuery] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setErrorMsg('');
    setResults([]);
    try {
      const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.object === 'error') {
        setErrorMsg(data.details || 'No cards found matching that search.');
      } else {
        setResults(data.data || []);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while reaching out to Scryfall. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>Search the Scryfall Database</h3>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder="e.g. 'Black Lotus', 'Lightning Bolt', or simply type a card name..." 
          className="search-box" 
        />
        <button type="submit" className="btn-primary" style={{ margin: 0, padding: '12px 24px' }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {errorMsg && <p style={{ color: 'var(--accent)' }}>{errorMsg}</p>}

      <div className="card-grid">
        {results.map(card => {
          // Provide fallback image if missing
          const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || 'https://via.placeholder.com/220x306?text=No+Image';
          const isOwned = collection.some(c => c.id === card.id);
          
          return (
            <div key={card.id} className={`card-item ${isOwned ? 'owned' : 'missing'}`} onClick={() => toggleCard(card)}>
              <img src={img} alt={card.name} />
              <strong style={{ textAlign: 'center', marginBottom: '8px' }}>{card.name}</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', marginBottom: '12px', textAlign: 'center' }}>
                {card.set_name} • {card.artist || card.card_faces?.[0]?.artist || 'Unknown Artist'}
              </span>
              <button className="btn-primary" style={{ margin: 'auto 0 0 0', width: '100%', background: isOwned ? 'var(--code-bg)' : 'var(--accent)', color: isOwned ? 'var(--text)' : '#fff' }}>
                {isOwned ? 'Remove from Collection' : 'Add to Collection'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SetTracker = ({ collection, toggleCard, explicitSets, addExplicitSet }: { collection: any[], toggleCard: (c:any)=>void, explicitSets: any[], addExplicitSet: (s:any)=>void }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allSets, setAllSets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeSet, setActiveSet] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeSetCards, setActiveSetCards] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetch('https://api.scryfall.com/sets')
      .then(res => res.json())
      .then(data => {
        const realSets = data.data.filter((s: { set_type: string; }) => !['token', 'memorabilia'].includes(s.set_type));
        setAllSets(realSets);
      });
  }, []);

  const openSetDetail = async (set: any) => {
    setActiveSet(set);
    setLoadingDetail(true);
    try {
      const res = await fetch(`https://api.scryfall.com/cards/search?q=e:${set.code}`);
      const data = await res.json();
      setActiveSetCards(data.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoadingDetail(false);
  };

  if (activeSet) {
    return (
      <div className="stats-panel">
        <div className="detail-header">
          <button className="btn-primary" style={{ margin: 0 }} onClick={() => setActiveSet(null)}>← Back</button>
          <h3 style={{ margin: 0, border: 'none' }}>{activeSet.name} Collection</h3>
        </div>
        <p style={{ color: 'var(--text)', marginBottom: '20px' }}>
          Click any card to toggle it in your collection. Opaque cards are owned; grayed-out cards are missing.
        </p>
        
        {loadingDetail ? <p>Loading set cards from the multiverse...</p> : (
          <div className="card-grid">
            {activeSetCards.map(card => {
              const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;
              if (!img) return null;
              const isOwned = collection.some(c => c.id === card.id);
              return (
                <div key={card.id} className={`card-item ${isOwned ? 'owned' : 'missing'}`} onClick={() => toggleCard(card)}>
                  <img src={img} alt={card.name} style={{ marginBottom: 0 }} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const searchResults = searchQuery.length > 1 ? allSets.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10) : [];
  
  const autoTrackedCodes = Array.from(new Set(collection.map(c => c.set)));
  const combinedSets = allSets.filter(s => explicitSets.includes(s.code) || autoTrackedCodes.includes(s.code));

  return (
    <div className="stats-panel">
      <h3>Search & Add Sets to Tracker</h3>
      <input 
        type="text" 
        className="search-box" 
        placeholder="Search any MTG set by name (e.g. Commander, Innistrad)..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '16px' }} 
      />

      {searchResults.length > 0 && (
        <div className="search-results-box">
          {searchResults.map(set => (
            <div key={set.code} className="search-result-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {set.icon_svg_uri && <img src={set.icon_svg_uri} alt="" width="20" style={{ filter: 'invert(1)' }} />}
                <span>{set.name} ({set.code.toUpperCase()})</span>
              </div>
              <button 
                className="btn-primary" 
                style={{ margin: 0, padding: '6px 12px' }} 
                onClick={() => { addExplicitSet(set.code); setSearchQuery(''); }}
              >
                + Track Set
              </button>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: '40px' }}>My Tracked Sets</h3>
      {combinedSets.length === 0 && <p style={{ color: 'var(--text)' }}>You are not tracking any sets yet. Search above or add cards to your collection.</p>}
      
      {combinedSets.map(set => {
        const ownedCount = collection.filter(c => c.set === set.code).length;
        const total = set.card_count > 0 ? set.card_count : 1;
        const pct = Math.min(100, Math.round((ownedCount / total) * 100));

        return (
          <div className="stat-card clickable-stat-card" key={set.code} onClick={() => openSetDetail(set)}>
            <div className="stat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {set.icon_svg_uri && <img src={set.icon_svg_uri} alt="" width="20" style={{ filter: 'invert(1)' }} />}
                <h4 style={{ margin: 0 }}>{set.name}</h4>
              </div>
              <span>{pct}%</span>
            </div>
            <div className="progress-bar"><div className="fill" style={{ width: `${pct}%` }}></div></div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', margin: 0 }}>{ownedCount} / {set.card_count} Cards Collected (Click to view detailed grid)</p>
          </div>
        );
      })}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IllustratorTracker = ({ collection, toggleCard, explicitArtists, addExplicitArtist }: { collection: any[], toggleCard: (c:any)=>void, explicitArtists: string[], addExplicitArtist: (a:string)=>void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArtist, setActiveArtist] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeArtistCards, setActiveArtistCards] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const openArtistDetail = async (artistName: string) => {
    setActiveArtist(artistName);
    setLoadingDetail(true);
    try {
      const res = await fetch(`https://api.scryfall.com/cards/search?q=a:"${encodeURIComponent(artistName)}"`);
      const data = await res.json();
      setActiveArtistCards(data.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoadingDetail(false);
  };

  if (activeArtist) {
    return (
      <div className="stats-panel">
        <div className="detail-header">
          <button className="btn-primary" style={{ margin: 0 }} onClick={() => setActiveArtist(null)}>← Back</button>
          <h3 style={{ margin: 0, border: 'none' }}>Illustrated by {activeArtist}</h3>
        </div>
        <p style={{ color: 'var(--text)', marginBottom: '20px' }}>
          Click to toggle collection state. Gray cards are missing.
        </p>
        
        {loadingDetail ? <p>Loading artwork from the multiverse...</p> : (
          <div className="card-grid">
            {activeArtistCards.map(card => {
              const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;
              if (!img) return null;
              const isOwned = collection.some(c => c.id === card.id);
              return (
                <div key={card.id} className={`card-item ${isOwned ? 'owned' : 'missing'}`} onClick={() => toggleCard(card)}>
                  <img src={img} alt={card.name} style={{ marginBottom: 0 }} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const autoArtists = collection.map(c => c.artist || c.card_faces?.[0]?.artist).filter(Boolean);
  const combinedArtists = Array.from(new Set([...explicitArtists, ...autoArtists]));

  return (
    <div className="stats-panel">
      <h3>Track a New Illustrator</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
        <input 
          type="text" 
          className="search-box" 
          placeholder="Enter exact artist name (e.g. John Avon)..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button 
          className="btn-primary" 
          style={{ margin: 0, whiteSpace: 'nowrap' }} 
          onClick={() => { if(searchQuery) { addExplicitArtist(searchQuery); setSearchQuery(''); } }}
        >
          + Track Artist
        </button>
      </div>

      <h3>My Tracked Illustrators</h3>
      {combinedArtists.length === 0 && <p style={{ color: 'var(--text)' }}>No tracked illustrators yet.</p>}

      {combinedArtists.map(artist => {
        const ownedCount = collection.filter(c => (c.artist || c.card_faces?.[0]?.artist) === artist).length;
        const pct = Math.min(100, (ownedCount / 50) * 100);

        return (
          <div className="stat-card clickable-stat-card" key={artist} onClick={() => openArtistDetail(artist)}>
            <div className="stat-header">
              <h4 style={{ margin: 0 }}>{artist}</h4>
              <span>{ownedCount} Owned</span>
            </div>
            <div className="progress-bar"><div className="fill" style={{ width: `${pct}%` }}></div></div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', margin: 0 }}>(Click to view detailed art grid)</p>
          </div>
        );
      })}
    </div>
  );
};

// --- Main Dashboard Layout ---
const Dashboard = () => {
  const location = useLocation();
  const username = location.state?.username || 'Planeswalker';

  const [activeTab, setActiveTab] = useState<'search' | 'sets' | 'illustrators' | 'bulk'>('search');
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [collection, setCollection] = useState<any[]>([]);
  const [explicitSets, setExplicitSets] = useState<string[]>([]);
  const [explicitArtists, setExplicitArtists] = useState<string[]>([]);
  const [uploadLog, setUploadLog] = useState<string>('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleToggleCard = (card: any) => {
    setCollection(prev => {
      const exists = prev.some(c => c.id === card.id);
      if (exists) {
        return prev.filter(c => c.id !== card.id);
      }
      return [...prev, card];
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLog('Reading file...');
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      let importedCount = 0;
      let failedCount = 0;

      setUploadLog(`Found ${lines.length} lines. Starting import... (Processing up to 50 cards to respect API limits)`);
      
      const toFetch = lines.slice(0, 50); 
      
      for(const line of toFetch) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('card name') || lowerLine.includes('simple name') || lowerLine === 'name') {
           continue;
        }

        let cardName = line;
        if (line.includes(',')) {
          const parts = line.split(',');
          if (!isNaN(Number(parts[0]))) {
             cardName = parts[1];
          } else if (!isNaN(Number(parts[1]))) {
             cardName = parts[0];
          } else {
             cardName = parts[0]; 
          }
        }
        cardName = cardName.replace(/["']/g, '').replace(/^\d+x?\s+/, '').trim();

        if (!cardName) continue;

        try {
          const res = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`);
          const data = await res.json();
          
          if(data.object === 'card') {
            setCollection(prev => {
              if (prev.some(c => c.id === data.id)) return prev;
              return [...prev, data];
            });
            importedCount++;
          } else {
            failedCount++;
          }
        } catch(err) {
          console.error("Import error on:", cardName, err);
          failedCount++;
        }
        await new Promise(r => setTimeout(r, 100));
      }
      setUploadLog(`Import complete! Successfully added ${importedCount} cards. (Failed/Skipped: ${failedCount}). Check your Set and Illustrator trackers!`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="dashboard-container">
      <nav className="dash-nav">
        <h2 style={{ margin: 0, color: 'var(--text-h)' }}>Dashboard, welcome {username}</h2>
        <Link to="/" style={{ color: 'var(--text)', textDecoration: 'none' }}>Logout</Link>
      </nav>
      
      <div className="dashboard-layout">
        <aside className="sidebar">
          <button 
            className={activeTab === 'search' ? 'active' : ''} 
            onClick={() => setActiveTab('search')}
          >
            🔍 Card Search
          </button>
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
          {activeTab === 'search' && <CardSearch collection={collection} toggleCard={handleToggleCard} />}
          {activeTab === 'sets' && <SetTracker collection={collection} toggleCard={handleToggleCard} explicitSets={explicitSets} addExplicitSet={(s) => setExplicitSets(prev => [...prev, s])} />}
          {activeTab === 'illustrators' && <IllustratorTracker collection={collection} toggleCard={handleToggleCard} explicitArtists={explicitArtists} addExplicitArtist={(a) => setExplicitArtists(prev => [...prev, a])} />}
          {activeTab === 'bulk' && (
            <div className="upload-box">
              <h3 style={{ marginBottom: '10px', borderBottom: 'none' }}>Import Bulk CSV</h3>
              <p style={{ marginBottom: '16px', color: 'var(--text)' }}>
                Upload your collection list (a `.txt` or `.csv` with one card name per line). We will read the file and automatically place the cards in all the right Set and Illustrator trackers.
              </p>
              <input type="file" accept=".csv, .txt" onChange={handleFileUpload} style={{ marginBottom: '16px' }} />
              {uploadLog && (
                <div style={{ padding: '12px', background: 'var(--code-bg)', color: 'var(--accent)', borderRadius: '8px', marginTop: '10px', fontSize: '0.9rem' }}>
                  {uploadLog}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// --- Main App Root ---
const router = createBrowserRouter([
  { path: "/", element: <Landing />, errorElement: <GlobalError /> },
  { path: "/auth", element: <Auth />, errorElement: <GlobalError /> },
  { path: "/dashboard", element: <Dashboard />, errorElement: <GlobalError /> },
  { path: "*", element: <Landing /> }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;