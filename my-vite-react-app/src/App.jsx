import { useState } from 'react';
import './App.css';

function App() {
  // Manage which panel is currently active ('login', 'signup', 'about', or null)
  const [activePanel, setActivePanel] = useState(null);
  
  // Track the username input exactly like your original JS script
  const [loginUsername, setLoginUsername] = useState('');

  // Toggles the active panel or closes it if it's already open
  const togglePanel = (panelName) => {
    setActivePanel((prevPanel) => (prevPanel === panelName ? null : panelName));
  };

  const handleUsernameChange = (e) => {
    const currentText = e.target.value;
    setLoginUsername(currentText);
    console.log("Current Username:", currentText);
  };

  return (
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
          
          <form id="loginForm" onSubmit={(e) => e.preventDefault()}>
            <div className="input-container">
              <input 
                type="text" 
                id="loginUsername" 
                placeholder="Username" 
                value={loginUsername}
                onChange={handleUsernameChange}
                required 
              />
            </div>
            <div className="input-container">
              <input type="password" id="loginPassword" placeholder="Password" required />
            </div>
            
            <button type="submit" className="btn-submit">Log In</button>
          </form>
          
          <div className="auth-footer">
            <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
            <p className="switch-prompt">
              Don't have an account? <a href="#" className="switch-link" onClick={(e) => { e.preventDefault(); togglePanel('signup'); }}>Sign Up</a>
            </p>
          </div>
        </div>

        {/* Sign Up Panel */}
        <div className={`auth-panel ${activePanel === 'signup' ? 'active' : ''}`} id="signupPanel">
          <h2 className="auth-title">Create Account</h2>
          
          <form id="signupForm" onSubmit={(e) => e.preventDefault()}>
            <div className="input-container">
              <input type="email" id="signupEmail" placeholder="Email Address" required />
            </div>
            <div className="input-container">
              <input type="text" id="signupUsername" placeholder="Username" required />
            </div>
            <div className="input-container">
              <input type="password" id="signupPassword" placeholder="Password" required />
            </div>
            <div className="input-container">
              <input type="password" id="signupConfirm" placeholder="Confirm Password" required />
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
}

export default App;