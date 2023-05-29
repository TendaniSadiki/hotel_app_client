import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css'; // Import CSS file for styling
import { auth } from './config/firebase';
import Login from './Components/Login/login';
import Signup from './Components/Signup/signup';
import Profile from './Components/Profile/profile';
import Settings from './Components/Settings/settings';
import Book from './Components/Book/book';
import Loader from './Components/Loader/Loader.jsx';
import { CgMenuRound, CgClose } from 'react-icons/cg';
import HomeOffline from './Components/Home/offlineHandler';

const Home = lazy(() => import('./Components/Home/home'));

function App() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Add authentication state change listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, update the user state
        setUser(user);
      } else {
        // User is signed out, set the user state to null
        setUser(null);
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        // User is signed out, handle any additional cleanup or redirection
        console.log('User signed out');
      })
      .catch((error) => {
        // An error occurred while signing out
        console.log('Error signing out:', error);
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
      return <Navigate to="/home" />;
    }

    // User is logged in, render the specified element
    return element;
  };

  return (
    <BrowserRouter>
      <nav>
        <label htmlFor="menu-toggle" className="menu-icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? (
            <CgClose className="icon" />
          ) : (
            <CgMenuRound className="icon" />
          )}
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
                <Link to="/" onClick={closeMobileMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/profile" onClick={closeMobileMenu}>
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/settings" onClick={closeMobileMenu}>
                  Settings
                </Link>
              </li>
              <li>
                <Link to="/book" onClick={closeMobileMenu}>
                  Book
                </Link>
              </li>
            </>
          )}
          {!user ? (
            <>
              <li>
                <Link to="/login" onClick={closeMobileMenu}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" onClick={closeMobileMenu}>
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

      <Suspense fallback={<Loader />}>
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<HomeOffline />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/book" element={<Book />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
