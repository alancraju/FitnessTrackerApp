import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Activity } from 'lucide-react';
import { apiCall } from '../utils/api';

const Login = ({ setIsAuthenticated }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Using standard state to avoid library specific boilerplate, but react-hook-form was installed.
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center px-6 bg-brand-bg dark:bg-brand-darkBg relative">
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-brand-green/20 rounded-full blur-3xl" />
      
      <div className="z-10 bg-white dark:bg-brand-darkCard p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-brand-orange/10 rounded-full">
            <Activity className="text-brand-orange w-10 h-10" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Login to continue tracking.</p>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input 
              name="email"
              type="email"
              placeholder="Email address"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all border border-gray-200 dark:border-gray-700"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input 
              name="password"
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all border border-gray-200 dark:border-gray-700"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-gradient-brand text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 mt-4"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
          Don't have an account? <Link to="/signup" className="text-brand-orange font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;


