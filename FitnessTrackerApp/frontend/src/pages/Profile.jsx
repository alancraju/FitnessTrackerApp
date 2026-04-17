import { useState, useEffect } from 'react';
import { User, LogOut, Moon, Sun, Settings, Edit3, Target, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = ({ toggleDarkMode, darkMode, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [editing, setEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    height: user.height || 170,
    weight: user.weight || 70,
    target_weight: user.target_weight || 65,
    age: user.age || 25,
    gender: user.gender || 'M',
    activity_level: user.activity_level || 'Sedentary'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/welcome');
  };

  const updateProfile = async () => {
    try {
      const payload = {
        ...formData,
        height: Number(formData.height),
        weight: Number(formData.weight),
        target_weight: Number(formData.target_weight),
        age: Number(formData.age)
      };

      const { calorie_goal } = await apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      
      const updatedUser = { ...user, ...payload, calorie_goal };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  // BMI Calculation
  const heightM = (user.height || 170) / 100;
  const bmi = ((user.weight || 70) / (heightM * heightM)).toFixed(1);
  let bmiCategory = 'Normal';
  let bmiColor = 'text-brand-green';
  if (bmi < 18.5) { bmiCategory = 'Underweight'; bmiColor = 'text-blue-400'; }
  else if (bmi >= 25 && bmi < 29.9) { bmiCategory = 'Overweight'; bmiColor = 'text-yellow-500'; }
  else if (bmi >= 30) { bmiCategory = 'Obese'; bmiColor = 'text-red-500'; }

  return (
    <div className="p-6 pt-10 min-h-full pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold dark:text-white flex items-center">
          <Settings className="mr-3 text-brand-orange" />
          Settings
        </h1>
        <button onClick={() => setEditing(!editing)} className="bg-brand-orange/10 p-2 rounded-full text-brand-orange">
          <Edit3 size={20} />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center mb-8 relative">
        <div className="w-24 h-24 bg-gradient-brand rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-xl border-4 border-white dark:border-brand-darkBg mb-4">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold dark:text-white">{user.name}</h2>
        <p className="text-gray-500">{user.email}</p>
        <div className="mt-3 px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-semibold dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700">
          Target Goal: <span className="text-brand-orange">{user.calorie_goal} kcal</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!editing ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            
            {/* Health Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-4 flex flex-col items-center shadow-sm">
                <span className="text-gray-500 text-xs mb-1">Weight</span>
                <span className="text-2xl font-bold dark:text-white border-b-2 border-brand-orange">{user.weight}<span className="text-sm font-normal text-gray-500 ml-1">kg</span></span>
              </div>
              <div className="glass rounded-2xl p-4 flex flex-col items-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-gradient-brand opacity-50" />
                <span className="text-gray-500 text-xs mb-1">Target</span>
                <span className="text-2xl font-bold dark:text-white">{user.target_weight}<span className="text-sm font-normal text-gray-500 ml-1">kg</span></span>
              </div>
            </div>

            {/* BMI Card */}
            <div className="glass rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="text-gray-500 font-semibold mb-1">Body Mass Index</h4>
                <div className="flex items-end">
                  <span className="text-3xl font-bold dark:text-white mr-2">{bmi}</span>
                  <span className={`font-medium mb-1 ${bmiColor}`}>{bmiCategory}</span>
                </div>
              </div>
              <Activity className={`w-10 h-10 ${bmiColor} opacity-50`} />
            </div>

            {/* General Info */}
            <div className="glass rounded-2xl p-4 shadow-sm flex justify-between items-center text-sm">
              <div className="text-center flex-1 border-r border-gray-200 dark:border-gray-700">
                <p className="text-gray-500">Height</p>
                <p className="font-bold dark:text-white text-lg">{user.height} cm</p>
              </div>
               <div className="text-center flex-1 border-r border-gray-200 dark:border-gray-700">
                <p className="text-gray-500">Age</p>
                <p className="font-bold dark:text-white text-lg">{user.age}</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-gray-500">Activity</p>
                <p className="font-bold text-brand-green text-[13px] uppercase mt-1">{user.activity_level}</p>
              </div>
            </div>
            
            {/* Dark Mode Toggle */}
            <div onClick={toggleDarkMode} className="glass rounded-2xl p-4 mt-6 shadow-sm flex justify-between items-center cursor-pointer">
              <div className="flex items-center text-gray-700 dark:text-gray-200 font-semibold">
                {darkMode ? <Moon className="mr-3 text-brand-orange w-5 h-5" /> : <Sun className="mr-3 text-brand-orange w-5 h-5" />}
                Dark Mode
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${darkMode ? 'bg-brand-orange' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}/>
              </div>
            </div>

            {/* Logout */}
            <div onClick={handleLogout} className="glass rounded-2xl p-4 shadow-sm flex items-center cursor-pointer text-red-500 font-semibold mt-4">
              <LogOut className="mr-3 w-5 h-5" />
              Logout
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass rounded-3xl p-6 shadow-lg border border-brand-orange/30">
            <h3 className="font-bold dark:text-white mb-4 text-brand-orange text-lg">Edit Profile</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300 text-sm">Height (cm)</span>
                <input name="height" type="number" value={formData.height} onChange={handleChange} className="w-20 text-right bg-transparent text-gray-900 dark:text-white font-bold outline-none" />
              </div>
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300 text-sm">Current Weight (kg)</span>
                <input name="weight" type="number" value={formData.weight} onChange={handleChange} className="w-20 text-right bg-transparent text-gray-900 dark:text-white font-bold outline-none" />
              </div>
               <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300 text-sm">Target Weight (kg)</span>
                <input name="target_weight" type="number" value={formData.target_weight} onChange={handleChange} className="w-20 text-right bg-transparent text-brand-orange font-bold outline-none" />
              </div>
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300 text-sm">Age</span>
                <input name="age" type="number" value={formData.age} onChange={handleChange} className="w-20 text-right bg-transparent text-gray-900 dark:text-white font-bold outline-none" />
              </div>
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300 text-sm">Activity Level</span>
                <select name="activity_level" value={formData.activity_level} onChange={handleChange} className="bg-transparent text-brand-green font-bold outline-none text-right">
                  <option value="Sedentary">Sedentary</option>
                  <option value="Active">Active</option>
                  <option value="Very Active">Very Active</option>
                </select>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button onClick={() => setEditing(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white py-3 rounded-xl font-bold">Cancel</button>
                <button onClick={updateProfile} className="flex-1 bg-gradient-brand text-white py-3 rounded-xl shadow-lg font-bold">Save Settings</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;

