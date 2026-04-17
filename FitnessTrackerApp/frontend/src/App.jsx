import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Splash from './pages/Splash';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import FoodSearch from './pages/FoodSearch';
import History from './pages/History';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import { useState, useEffect } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/welcome" replace />;
  };

  return (
    <Router>
      <div className="min-h-screen max-w-md mx-auto relative bg-brand-bg dark:bg-brand-darkBg shadow-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
            
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/search" element={<PrivateRoute><FoodSearch /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile toggleDarkMode={toggleDarkMode} darkMode={darkMode} setIsAuthenticated={setIsAuthenticated} />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
        {isAuthenticated && <BottomNav />}
      </div>
    </Router>
  );
}

export default App;


