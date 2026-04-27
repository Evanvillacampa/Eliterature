import React, { useState } from 'react'; // Added useState here
import './Dashboard.css';

const BookCard = ({ title }) => {
  return (
    <div className="book-card">
      <div className="book-card-image-placeholder"></div>
      <div className="book-card-title">
        <p>{title}</p>
      </div>
    </div>
  );
};

const Dashboard = ({ onLogout }) => {
  // NEW: State to track if the profile dropdown is open or closed
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const books = [
    { id: 1, title: 'Echoes of Eternity' },
    { id: 2, title: 'Midnight Mysteries' },
    { id: 3, title: 'The Silent Symphony' },
    { id: 4, title: 'Beyond the Horizon' },
    { id: 5, title: 'Tangled Threads' },
    { id: 6, title: 'Whispers of the Wind' },
    { id: 7, title: 'The Gilded Cage' },
    { id: 8, title: 'Shattered Mirrors' },
    { id: 9, title: 'Quantum Quests' },
    { id: 10, title: 'Ancient Anthems' },
  ];

  return (
    <div className="literature-dashboard">
      <header className="dash-header">
        <div className="dash-header-left">
          <div className="dash-logo-box">
            <span className="dash-logo-letter">E</span>
            <span className="dash-logo-text">Literature</span>
          </div>
        </div>
        
        <div className="dash-header-center">
          <button className="dash-settings-icon-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
          </button>
          <div className="dash-search-container">
            <input type="text" placeholder="Search Books/Author/Genre" className="dash-search-input" />
            <button className="dash-search-icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>
        </div>

        {/* UPDATED: Profile Container with Dropdown Logic */}
        <div className="dash-header-right">
          <button 
            className="dash-profile-btn" 
            onClick={() => setIsProfileOpen(!isProfileOpen)} 
            title="Profile Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </button>

          {/* This block only shows up if isProfileOpen is true */}
          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-user-info">
                <strong>Student Account</strong>
                <span>student@literature.edu</span>
              </div>
              <hr className="dropdown-divider" />
              <button className="dropdown-item">
                <span className="dropdown-icon">⚙️</span> Account Settings
              </button>
              <button className="dropdown-item">
                <span className="dropdown-icon">📚</span> My Library
              </button>
              <hr className="dropdown-divider" />
              <button className="dropdown-item logout-item" onClick={onLogout}>
                <span className="dropdown-icon">🚪</span> Log Out
              </button>
            </div>
          )}
        </div>

      </header>

      <main className="dash-main">
        <div className="dash-book-grid">
          {books.map((book) => (
            <BookCard key={book.id} title={book.title} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;