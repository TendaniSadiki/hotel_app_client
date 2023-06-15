import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { auth } from './config/firebase';
import Login from './Components/Login/login';
import Signup from './Components/Signup/signup';
import Profile from './Components/Profile/profile';
import Settings from './Components/Settings/settings';
import Book from './Components/Book/book';
import Loader from './Components/Loader/Loader.jsx';
import { CgMenuRound, CgClose } from 'react-icons/cg';
import HomeOffline from './Components/Home/offlineHandler';
import About from './Components/About/about';

const Home = lazy(() => import('./Components/Home/home'));

function App() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const openSignOutModal = () => {
    setShowSignOutModal(true);
    setMobileMenuOpen(false);
  };

  const closeSignOutModal = () => {
    setShowSignOutModal(false);
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    
    auth
      .signOut()
      .then(() => {
        console.log('User signed out');
        closeSignOutModal();
      })
      .catch((error) => {
        console.log('Error signing out:', error);
      });
  };
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.emailVerified) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

 

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prevOpen) => !prevOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const PrivateRoute = ({ element, path }) => {
    if (!user) {
      return <Navigate to="/hotel_app_client/login" />;
    }
  
    // Check if the user's email is verified
    const isEmailVerified = user.emailVerified;
  
    if (!isEmailVerified) {
      return <Navigate to="/hotel_app_client/verify-email" />;
    }
  
    return element;
  };

  function VerifyEmail() {
    return (
      <div>
        <h2>Email Verification</h2>
        <p>Please verify your email address. Check your inbox for a verification link.</p>
      </div>
    );
  }
  
  return (
    <BrowserRouter>
      <nav>
        <label htmlFor="menu-toggle" className="menu-icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <CgClose className="icon" /> : <CgMenuRound className="icon" />}
        </label>
        <div className="logo">
          <Link to="/hotel_app_client" onClick={closeMobileMenu}>
            Logo
          </Link>
        </div>
        <ul className={`menu ${isMobileMenuOpen ? 'open' : ''}`}>
          {user && (
            <>
              <li>
                <NavLink to="/hotel_app_client" onClick={closeMobileMenu} activeClassName="active">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/hotel_app_client/profile" onClick={closeMobileMenu} activeClassName="active">
                  Profile
                </NavLink>
              </li>
              <li>
                <NavLink to="/hotel_app_client/settings" onClick={closeMobileMenu} activeClassName="active">
                  Settings
                </NavLink>
              </li>
              <li>
                <NavLink to="/hotel_app_client/book" onClick={closeMobileMenu} activeClassName="active">
                  Book
                </NavLink>
              </li>
            </>
          )}
          {!user ? (
            <>
              <li>
                <NavLink to="/hotel_app_client/login" onClick={closeMobileMenu} activeClassName="active">
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/hotel_app_client/signup" onClick={closeMobileMenu} activeClassName="active">
                  Signup
                </NavLink>
              </li>
            </>
          ) : (
            <li>
              <button onClick={openSignOutModal}>Sign Out</button>
            </li>
          )}
        </ul>
      </nav>

      <Suspense fallback={<Loader />}>
      {showSignOutModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Sign Out Confirmation</h2>
            <p>Are you sure you want to sign out?</p>
            <div className="modal-buttons">
              <button onClick={handleSignOut} className='yesBtn'>Yes</button>
              <button onClick={closeSignOutModal}>No</button>
            </div>
          </div>
        </div>
      )}
        <Routes>
          {!user ? (
            <>
              <Route path="/hotel_app_client" element={<HomeOffline />} />
              <Route path="/hotel_app_client/login" element={<Login />} />
              <Route path="/hotel_app_client/signup" element={<Signup />} />
              <Route path="/hotel_app_client/about" element={<About />} />
              <Route path="/hotel_app_client/verify-email" element={<VerifyEmail />} />
              <Route path="/hotel_app_client/*" element={<Navigate to="/hotel_app_client" />} />
            </>
          ) : (
            <>
              <Route path="/hotel_app_client" element={<Home />} />
              <Route path="/hotel_app_client/profile" element={<Profile />} />
              <Route path="/hotel_app_client/settings" element={<Settings />} />
              <Route path="/hotel_app_client/book" element={<Book />} />
              <Route path="/hotel_app_client/*" element={<Navigate to="/hotel_app_client" />} />
            </>
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
