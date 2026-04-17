import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiCall } from '../utils/api';
import { Flame, Droplet, Wheat, Dumbbell, Droplets, Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waterAdding, setWaterAdding] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchData = async () => {
    try {
      const [sumData, recData] = await Promise.all([
        apiCall(`/food/summary/${today}`),
        apiCall(`/recommendations?date=${today}`)
      ]);
      setSummary(sumData);
      setRecommendations(recData);
      
      // Keep localstorage goal updated just in case edited elsewhere
      if (sumData.calorie_goal !== user.calorie_goal) {
        const up = { ...user, calorie_goal: sumData.calorie_goal };
        setUser(up);
        localStorage.setItem('user', JSON.stringify(up));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [today]);

  const addWater = async () => {
    setWaterAdding(true);
    try {
      await apiCall('/water/log', { method: 'POST', body: JSON.stringify({ date: today }) });
      await fetchData(); // Refresh summary visually
    } catch (e) {
      console.error(e);
    } finally {
      setWaterAdding(false);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center dark:text-white">Loading Dashboard...</div>;
  }

  const consumed = summary?.total_calories || 0;
  const goal = summary?.calorie_goal || 2000;
  const remaining = Math.max(goal - consumed, 0);
  const progressPercent = Math.min((consumed / goal) * 100, 100);
  const waterGlasses = summary?.water_glasses || 0;

  // SVG parameters
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="p-6 pt-10 min-h-full pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Hi, {user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">Target: {user.target_weight}kg</p>
        </div>
        <div className="w-12 h-12 bg-gradient-brand rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {user.name?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Progress Ring */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-3xl p-6 mb-6 flex flex-col items-center justify-center relative overflow-hidden"
      >
        <h2 className="text-lg font-semibold dark:text-white mb-4">Daily Calories</h2>
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96" cy="96" r={radius}
              stroke="currentColor" strokeWidth="12" fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="96" cy="96" r={radius}
              stroke="currentColor" strokeWidth="12" fill="transparent"
              strokeDasharray={circumference}
              strokeLinecap="round"
              className={`${progressPercent > 100 ? 'text-red-500' : 'text-brand-orange'}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round(consumed)}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">/ {goal} kcal</span>
          </div>
        </div>
        <div className="flex justify-between w-full mt-6 px-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Consumed</p>
            <p className="font-semibold dark:text-white">{Math.round(consumed)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="font-semibold dark:text-white">{Math.round(remaining)}</p>
          </div>
        </div>
      </motion.div>

      {/* Macros + Water */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Prot', value: summary?.total_protein, unit: 'g', icon: Flame, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
          { label: 'Carbs', value: summary?.total_carbs, unit: 'g', icon: Wheat, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
          { label: 'Fat', value: summary?.total_fat, unit: 'g', icon: Droplet, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
        ].map((macro, i) => (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + (i * 0.1) }}
            key={i} 
            className="glass rounded-2xl p-3 flex flex-col items-center shadow-sm"
          >
            <div className={`${macro.bg} ${macro.color} p-1.5 rounded-full mb-1`}>
              <macro.icon size={16} />
            </div>
            <p className="text-xs font-bold dark:text-white">{Math.round(macro.value || 0)}{macro.unit}</p>
            <p className="text-[10px] text-gray-500">{macro.label}</p>
          </motion.div>
        ))}

        {/* Water Track Button */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          onClick={addWater}
          className="glass rounded-2xl p-3 flex flex-col items-center shadow-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-transparent hover:border-blue-400 transition-all relative overflow-hidden group"
        >
          <div className="absolute bottom-0 w-full bg-blue-100 dark:bg-blue-900/40 transition-all duration-500 ease-out z-0" style={{ height: `${Math.min((waterGlasses / 8) * 100, 100)}%` }} />
          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-500 p-1.5 rounded-full mb-1 z-10 group-hover:scale-110 transition-transform">
            {waterAdding ? <Plus size={16} className="animate-spin" /> : <Droplets size={16} />}
          </div>
          <p className="text-xs font-bold dark:text-white z-10">{waterGlasses}/8</p>
          <p className="text-[10px] text-gray-500 z-10">Water</p>
        </motion.div>
      </div>

      {/* Recommendations */}
      {recommendations && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
          <h3 className="font-bold text-lg mb-3 dark:text-white flex items-center">
            {recommendations.over_limit ? <Flame className="text-red-500 mr-2 w-5 h-5" /> : <Wheat className="text-brand-green mr-2 w-5 h-5" />}
            Smart {recommendations.over_limit ? 'Adjustments' : 'Suggestions'}
          </h3>
          <div className={`glass rounded-2xl p-5 border-l-4 ${recommendations.over_limit ? 'border-l-red-500' : 'border-l-brand-green'}`}>
            
            {recommendations.over_limit && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-red-500 mb-2">Burn {Math.round(recommendations.excess_calories)} extra calories:</p>
                <div className="space-y-2">
                  {recommendations.exercises.map((ex, i) => (
                    <div key={i} className="flex justify-between items-center bg-red-50 dark:bg-red-900/10 p-2 rounded-lg text-sm dark:text-gray-300">
                      <span>{ex.type}</span>
                      <span className="font-semibold text-red-500">{ex.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">Optimal Foods To Eat:</p>
              <ul className="space-y-3">
                {recommendations.food_suggestions.map((food, i) => (
                  <li key={i} className="flex justify-between items-center text-sm dark:text-gray-300">
                    <span className="flex items-center"><ChevronRight size={14} className="text-brand-orange mr-1" /> {food.name}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{food.calories} kcal</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;

