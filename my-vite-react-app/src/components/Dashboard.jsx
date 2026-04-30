import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

const BookCard = ({ book, onClick, isSaved }) => {
  return (
    <div className="book-card" onClick={() => onClick(book)}>
      {isSaved && <div className="saved-badge">⭐</div>}
      {book.cover_url ? (
        <img src={book.cover_url} alt={book.title} className="book-cover-img" />
      ) : (
        <div className="book-card-image-placeholder">No Cover</div>
      )}
      <div className="book-card-title">
        <p>{book.title}</p>
        <span className="book-card-subtitle">{book.author} • {book.genre}</span>
      </div>
    </div>
  );
};

const Dashboard = ({ onLogout }) => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');
  const [savedBookIds, setSavedBookIds] = useState(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // --- NEW: User & Profile States ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({ username: '', password: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null); 
  const [editingId, setEditingId] = useState(null);

  const [newBook, setNewBook] = useState({ title: '', author: '', genre: 'Fiction', summary: '' });
  const [coverFile, setCoverFile] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLibraryData = async () => {
    // 1. Fetch User Info
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      setProfileData({ ...profileData, username: user.user_metadata?.username || '' });
    }

    // 2. Fetch Books & Saves
    const { data: booksData } = await supabase.from('books').select('*');
    if (booksData) setBooks(booksData);

    const { data: savedData } = await supabase.from('saved_books').select('book_id');
    if (savedData) setSavedBookIds(new Set(savedData.map(item => item.book_id)));
  };

  useEffect(() => { fetchLibraryData(); }, []);

  const uploadFile = async (file, bucketName) => {
    if (!file) return null;
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from(bucketName).upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    return data.publicUrl;
  };

  // --- NEW: Update Profile Function ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      let newAvatarUrl = currentUser?.user_metadata?.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        newAvatarUrl = await uploadFile(avatarFile, 'avatars');
      }

      // Prepare the updates
      const updates = {
        data: { username: profileData.username, avatar_url: newAvatarUrl }
      };

      // Only add password to updates if they actually typed a new one
      if (profileData.password) {
        updates.password = profileData.password;
      }

      // Send to Supabase Auth
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      alert("Profile updated successfully!");
      setProfileData({ ...profileData, password: '' }); // Clear password field
      setAvatarFile(null);
      setIsProfileOpen(false);
      fetchLibraryData(); // Refresh to show new avatar

    } catch (error) {
      alert("Error updating profile: " + error.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleToggleSave = async (bookId) => {
    const isCurrentlySaved = savedBookIds.has(bookId);
    if (isCurrentlySaved) {
      await supabase.from('saved_books').delete().eq('book_id', bookId);
      setSavedBookIds(prev => { const newSet = new Set(prev); newSet.delete(bookId); return newSet; });
    } else {
      await supabase.from('saved_books').insert([{ book_id: bookId }]);
      setSavedBookIds(prev => { const newSet = new Set(prev); newSet.add(bookId); return newSet; });
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let finalCoverUrl = editingId ? books.find(b => b.id === editingId).cover_url : null;
      let finalFileUrl = editingId ? books.find(b => b.id === editingId).file_url : null;

      if (coverFile) finalCoverUrl = await uploadFile(coverFile, 'book_covers');
      if (bookFile) finalFileUrl = await uploadFile(bookFile, 'book_files');

      const bookData = { 
          title: newBook.title, author: newBook.author, genre: newBook.genre,
          summary: newBook.summary, cover_url: finalCoverUrl, file_url: finalFileUrl
      };

      if (editingId) await supabase.from('books').update(bookData).eq('id', editingId);
      else await supabase.from('books').insert([bookData]);

      closeFormModal();
      fetchLibraryData();
    } catch (error) { alert("Error saving book: " + error.message); } 
    finally { setIsUploading(false); }
  };

  const handleDeleteBook = async (bookToDelete) => {
    if (!window.confirm(`Delete "${bookToDelete.title}"?`)) return;
    setIsDeleting(true);
    try {
      if (bookToDelete.cover_url) await supabase.storage.from('book_covers').remove([bookToDelete.cover_url.split('/').pop()]);
      if (bookToDelete.file_url) await supabase.storage.from('book_files').remove([bookToDelete.file_url.split('/').pop()]);
      await supabase.from('books').delete().eq('id', bookToDelete.id);
      setSelectedBook(null); fetchLibraryData(); 
    } catch (error) { alert("Error deleting book: " + error.message); } 
    finally { setIsDeleting(false); }
  };

  const handleEditClick = (book) => {
    setEditingId(book.id);
    setNewBook({ title: book.title, author: book.author, genre: book.genre, summary: book.summary });
    setSelectedBook(null); setIsModalOpen(true);  
  };

  const closeFormModal = () => {
    setIsModalOpen(false); setEditingId(null);
    setNewBook({ title: '', author: '', genre: 'Fiction', summary: '' });
    setCoverFile(null); setBookFile(null);
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title?.toLowerCase().includes(searchQuery.toLowerCase()) || book.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSaved = showSavedOnly ? savedBookIds.has(book.id) : true;
    const matchesGenre = filterGenre === 'All' ? true : book.genre === filterGenre;
    return matchesSearch && matchesSaved && matchesGenre;
  });

  return (
    <div className="literature-dashboard">
      <header className="dash-header">
        <div className="dash-logo-box"><span className="dash-logo-letter">E</span><span className="dash-logo-text">Literature</span></div>
        <div className="dash-header-center" style={{ gap: '10px' }}>
          <button className="add-book-btn" onClick={() => setIsModalOpen(true)}>+ Add New Book</button>
          <div className="dash-search-container" style={{ display: 'flex', gap: '10px', background: 'none', padding: 0 }}>
            <input type="text" placeholder="Search Books..." className="dash-search-input" style={{ background: '#f5f5f5', padding: '10px 15px', borderRadius: '20px', border: '1px solid #ddd' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <select className="genre-filter-select" value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}>
              <option value="All">All Genres</option>
              <option value="Fiction">Fiction</option><option value="Non-Fiction">Non-Fiction</option>
              <option value="Sci-Fi">Sci-Fi</option><option value="Fantasy">Fantasy</option>
              <option value="Mystery">Mystery</option><option value="Thriller">Thriller</option>
              <option value="Romance">Romance</option><option value="Horror">Horror</option>
              <option value="Biography">Biography</option><option value="History">History</option>
              <option value="Poetry">Poetry</option><option value="Self-Help">Self-Help</option>
            </select>
          </div>
        </div>

        <div className="dash-header-right">
          <button className={`filter-saved-btn ${showSavedOnly ? 'active' : ''}`} onClick={() => setShowSavedOnly(!showSavedOnly)}>
            {showSavedOnly ? '⭐ My Saved Books' : '📚 All Books'}
          </button>
          
          {/* --- NEW: Profile Button --- */}
          <button className="dash-profile-btn" onClick={() => setIsProfileOpen(true)} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            {currentUser?.user_metadata?.avatar_url ? (
              <img src={currentUser.user_metadata.avatar_url} alt="Avatar" style={{width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover'}} />
            ) : (
              '👤'
            )}
            Profile
          </button>
          
          <button className="dash-profile-btn" onClick={onLogout} style={{background: '#ff4d4f', color: 'white'}}>Log Out</button>
        </div>
      </header>

      {/* --- NEW: Profile Settings Modal --- */}
      {isProfileOpen && (
        <div className="modal-overlay" onClick={() => setIsProfileOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '400px'}}>
            <div className="reading-room-header">
              <h2>My Profile</h2>
              <button className="close-btn" onClick={() => setIsProfileOpen(false)}>X</button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="profile-avatar-preview">
                <img 
                  src={avatarFile ? URL.createObjectURL(avatarFile) : (currentUser?.user_metadata?.avatar_url || 'https://via.placeholder.com/100')} 
                  alt="Profile" 
                />
              </div>
              
              <label>Profile Picture:
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} />
              </label>

              <label>Email Address (Read-Only):
                <input type="email" value={currentUser?.email || ''} disabled style={{backgroundColor: '#eee'}} />
              </label>

              <label>Username:
                <input type="text" placeholder="Choose a username" value={profileData.username} onChange={(e) => setProfileData({...profileData, username: e.target.value})} />
              </label>

              <label>Change Password (Leave blank to keep current):
                <input type="password" placeholder="New Password" value={profileData.password} onChange={(e) => setProfileData({...profileData, password: e.target.value})} />
              </label>

              <div className="modal-actions" style={{marginTop: '20px'}}>
                <button type="submit" className="btn-save" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? 'Updating...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingId ? 'Edit Book' : 'Add New Book'}</h3>
            <form onSubmit={handleSaveBook}>
              <input type="text" placeholder="Book Title" required value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} />
              <input type="text" placeholder="Author Name" required value={newBook.author} onChange={(e) => setNewBook({...newBook, author: e.target.value})} />
              <select value={newBook.genre} onChange={(e) => setNewBook({...newBook, genre: e.target.value})}>
                <option value="Fiction">Fiction</option><option value="Non-Fiction">Non-Fiction</option>
                <option value="Sci-Fi">Sci-Fi</option><option value="Fantasy">Fantasy</option>
                <option value="Mystery">Mystery</option><option value="Thriller">Thriller</option>
                <option value="Romance">Romance</option><option value="Horror">Horror</option>
                <option value="Biography">Biography</option><option value="History">History</option>
                <option value="Poetry">Poetry</option><option value="Self-Help">Self-Help</option>
              </select>
              <textarea placeholder="Write a short summary..." rows="3" value={newBook.summary} onChange={(e) => setNewBook({...newBook, summary: e.target.value})} />
              <div className="file-inputs">
                <p style={{fontSize: '12px', color: '#666', margin: '0 0 5px 0'}}>{editingId ? 'Leave files empty to keep existing covers/PDFs.' : 'Upload cover and PDF:'}</p>
                <label>Cover (JPG/PNG): <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} /></label>
                <label>File (PDF): <input type="file" accept="application/pdf" onChange={(e) => setBookFile(e.target.files[0])} /></label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeFormModal}>Cancel</button>
                <button type="submit" className="btn-save" disabled={isUploading}>{isUploading ? 'Saving...' : (editingId ? 'Update Book' : 'Save Book')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reading Room Modal */}
      {selectedBook && (
        <div className="modal-overlay" onClick={() => setSelectedBook(null)}>
          <div className="modal-content reading-room" onClick={(e) => e.stopPropagation()}>
            <div className="reading-room-header">
              <h2>{selectedBook.title}</h2>
              <button className="close-btn" onClick={() => setSelectedBook(null)}>X</button>
            </div>
            <div className="reading-room-body">
              {selectedBook.cover_url && <img src={selectedBook.cover_url} alt="Cover" className="reading-cover" />}
              <div className="reading-info">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h3>Author: {selectedBook.author}</h3>
                  <button className={`save-toggle-btn ${savedBookIds.has(selectedBook.id) ? 'saved' : ''}`} onClick={() => handleToggleSave(selectedBook.id)}>
                    {savedBookIds.has(selectedBook.id) ? '⭐ Saved' : '☆ Save Book'}
                  </button>
                </div>
                <p className="reading-genre">Genre: {selectedBook.genre}</p>
                <div className="reading-summary"><strong>Summary:</strong><p>{selectedBook.summary || "No summary provided for this book."}</p></div>
                <div className="reading-room-actions">
                  {selectedBook.file_url && <a href={selectedBook.file_url} target="_blank" rel="noopener noreferrer" className="read-book-btn">📖 Read</a>}
                  <button className="edit-book-btn" onClick={() => handleEditClick(selectedBook)}>✏️ Edit</button>
                  <button className="delete-book-btn" onClick={() => handleDeleteBook(selectedBook)} disabled={isDeleting}>{isDeleting ? '...' : '🗑️ Delete'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="dash-main">
        {filteredBooks.length === 0 ? (
          <div style={{textAlign: 'center', margin: '50px auto', color: '#666', background: 'white', padding: '30px', borderRadius: '12px', maxWidth: '400px'}}><h2>No books found.</h2><p>Try adjusting your search or genre filters!</p></div>
        ) : (
          <div className="dash-book-grid">{filteredBooks.map((book) => <BookCard key={book.id} book={book} onClick={setSelectedBook} isSaved={savedBookIds.has(book.id)} />)}</div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;