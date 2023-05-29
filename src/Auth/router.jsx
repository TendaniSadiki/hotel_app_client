import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { auth } from '../config/firebase';
import Profile from '../Components/Profile/profile';
import Settings from '../Components/Settings/settings';
import Book from '../Components/Book/book';
import Loader from '../Components/Loader/Loader.jsx';
import HomeOffline from '../Components/Home/offlineHandler';

const Home = lazy(() => import('../Components/Home/home'));

function AuthRouter() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignoutModal, setShowSignoutModal] = useState(false);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = () => {
    setShowSignoutModal(true);
  };

  useEffect(() => {
    setIsLoading(true);
    // Add authentication state change listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, update the user state
        setUser(user);
      } else {
        // User is signed out, set the user state to null
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  const confirmSignOut = () => {
    auth
      .signOut()
      .then(() => {
        // User is signed out, handle any additional cleanup or redirection
        console.log('User signed out');
        setShowSignoutModal(false);
        <Navigate to="/hotel_app_client/Home" />;
      })
      .catch((error) => {
        // An error occurred while signing out
        console.log('Error signing out:', error);
        setShowSignoutModal(false);
      });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prevOpen) => !prevOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const PrivateRoute = ({ element, path }) => {
    if (!user) {
      // User is not logged in, redirect to the login page
      return <Navigate to="/Home" />;
    }

    // User is logged in, render the specified element
    return element;
  };

  return (
    <BrowserRouter>
      <nav>
        <input
          type="checkbox"
          id="menu-toggle"
          checked={isMobileMenuOpen}
          onChange={toggleMobileMenu}
        />
        <label htmlFor="menu-toggle" className="menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </label>
        <div className="logo">
          <Link to="/" onClick={closeMobileMenu}>
            Logo
          </Link>
        </div>
        <ul className={`menu ${isMobileMenuOpen ? 'open' : ''}`}>
          {user && (
            <>
              <li>
                <Link to="/hotel_app_client/" onClick={closeMobileMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/hotel_app_client/profile" onClick={closeMobileMenu}>
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/hotel_app_client/settings" onClick={closeMobileMenu}>
                  Settings
                </Link>
              </li>
              <li>
                <Link to="/hotel_app_client/book" onClick={closeMobileMenu}>
                  Book
                </Link>
              </li>
            </>
          )}
          {!user ? (
            <>
              <li>
                <Link to="/hotel_app_client/login" onClick={closeMobileMenu}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/hotel_app_client/signup" onClick={closeMobileMenu}>
                  Signup
                </Link>
              </li>
            </>
          ) : (
            <li>
              <button onClick={handleSignOut}>Sign Out</button>
            </li>
          )}
        </ul>
      </nav>
      {showSignoutModal && (
        <div className="centered-modal">
          <div className="modal-content">
            <h2 className="modal-title">Are you sure you want to sign out?</h2>
            <div className="modal-buttons">
              <button className="modal-button" onClick={confirmSignOut}>
                Yes
              </button>
              <button
                className="modal-button"
                onClick={() => setShowSignoutModal(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={<Loader />}>
        {isLoading ? (
          <Loader />
        ) : (
          <Routes location={location}>
            {!user ? (
              <>
                <Route path="/hotel_app_client/Home" element={<HomeOffline />} />
                <Route path="*" element={<HomeOffline/>} />
              </>
            ) : (
              <>
                <Route path="/hotel_app_client/" element={<Home />} />
                <Route path="/hotel_app_client/profile" element={<Profile />} />
                <Route path="/hotel_app_client/settings" element={<Settings />} />
                <Route path="/hotel_app_client/book" element={<Book />} />
                <Route path="*" element={'/hotel_app_client/home'} />
              </>
            )}
          </Routes>
        )}
      </Suspense>
    </BrowserRouter>
    
  );
}

export default AuthRouter;
