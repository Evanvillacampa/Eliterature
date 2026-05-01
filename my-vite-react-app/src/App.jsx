import { useState, useEffect } from 'react'; // <-- ADDED useEffect here!
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [activePanel, setActivePanel] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // <-- ADDED loading state!
  const navigate = useNavigate();

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up States
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // --- ADDED: The Supabase "Memory" Check ---
  useEffect(() => {
    // 1. Check if they are already logged in when they refresh
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session); // If there is a session, this becomes true!
      setIsLoading(false);      // Tell React we are done checking
    });

    // 2. Listen for any logins or logouts in the background
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });

    // Cleanup the listener
    return () => subscription.unsubscribe();
  }, []);
  // ------------------------------------------

  const togglePanel = (panelName) => {
    setActivePanel((prevPanel) => (prevPanel === panelName ? null : panelName));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
    });

    if (error) {
      alert("Error creating account: " + error.message);
    } else {
      alert("Account created successfully! You can now log in.");
      togglePanel('login');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      alert("Login failed: " + error.message);
    } else {
      setIsLoggedIn(true);
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setActivePanel(null);
    navigate('/');
  };

  const LandingPage = (
    <>
      <header className="navbar">
        <div className="navbar-logo-container">
          <div className="logo-box">
            <span className="logo-letter">E</span>
          </div>
          <span className="logo-text">Literature</span>
        </div>

        <nav className="navbar-right">
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); togglePanel('about'); }}>About</a> 
          <a href="#" className="btn-login" onClick={(e) => { e.preventDefault(); togglePanel('login'); }}>Log In</a>
          <a href="#" className="btn-signup" onClick={(e) => { e.preventDefault(); togglePanel('signup'); }}>Sign Up</a>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-logo-container">
          <div className="large-logo-box">
            <span className="large-logo-letter">E</span>
          </div>
          <h1 className="large-logo-text">Literature</h1>
        </div>

        {/* Login Panel */}
        <div className={`auth-panel ${activePanel === 'login' ? 'active' : ''}`} id="loginPanel">
          <h2 className="auth-title">Welcome Back</h2>
          
          <form id="loginForm" onSubmit={handleLoginSubmit}>
            <div className="input-container">
              <input 
                type="email" 
                placeholder="Email Address" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required 
              />
            </div>
            <div className="input-container">
              <input 
                type="password" 
                placeholder="Password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn-submit">Log In</button>
          </form>
          
          <div className="auth-footer">
            <p className="switch-prompt">
              Don't have an account? <a href="#" className="switch-link" onClick={(e) => { e.preventDefault(); togglePanel('signup'); }}>Sign Up</a>
            </p>
          </div>
        </div>

        {/* Sign Up Panel */}
        <div className={`auth-panel ${activePanel === 'signup' ? 'active' : ''}`} id="signupPanel">
          <h2 className="auth-title">Create Account</h2>
          
          <form id="signupForm" onSubmit={handleSignUp}>
            <div className="input-container">
              <input 
                type="email" 
                placeholder="Email Address" 
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required 
              />
            </div>
            <div className="input-container">
              <input 
                type="password" 
                placeholder="Password (min 6 characters)" 
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn-submit">Create Account</button>
          </form>
          
          <div className="auth-footer">
            <p className="switch-prompt">
              Already have an account? <a href="#" className="switch-link" onClick={(e) => { e.preventDefault(); togglePanel('login'); }}>Log In</a>
            </p>
          </div>
        </div>

        {/* About Panel */}
        <div className={`auth-panel ${activePanel === 'about' ? 'active' : ''}`} id="aboutPanel">
          <h2 className="auth-title">About This Project</h2>
          <p style={{ textAlign: 'center', color: '#4A4A4A', lineHeight: 1.6, fontSize: '16px', marginBottom: '25px' }}>
            This website is created for the sole purpose of midterm completion.
          </p>
          <button className="btn-submit" onClick={() => setActivePanel(null)}>Close</button>
        </div>
      </section>
    </>
  );

  // --- ADDED: The "Hold Your Horses" Loading Screen ---
  // This prevents React from kicking you out before Supabase finishes checking
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        <h2>Loading your library...</h2>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={LandingPage} />
      <Route 
        path="/dashboard" 
        element={
          isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" />
        } 
      />
    </Routes>
  );
}

export default App;