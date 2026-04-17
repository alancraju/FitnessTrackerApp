import { useState, useEffect } from 'react';
import { Search, Plus, Check, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiCall } from '../utils/api';
import { format } from 'date-fns';

const FoodSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        searchFood(query);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchFood = async (q) => {
    try {
      const data = await apiCall(`/food/search?q=${q}`);
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const logFood = async () => {
    if (!selectedFood) return;
    setLoading(true);
    
    // Scale macros by quantity
    const ratio = quantity / 100; // dataset is per 100g
    const payload = {
      name: selectedFood.name,
      calories: selectedFood.calories * ratio,
      protein: selectedFood.protein * ratio,
      fat: selectedFood.fat * ratio,
      carbs: selectedFood.carbs * ratio,
      quantity,
      date: format(new Date(), 'yyyy-MM-dd')
    };

    try {
      await apiCall('/food/log', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setSuccessMsg('Food logged intelligently!');
      setSelectedFood(null);
      setQuery('');
      setResults([]);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 pt-10 min-h-full">
      <h1 className="text-2xl font-bold dark:text-white mb-6 flex items-center">
        <Utensils className="mr-3 text-brand-orange" />
        Log Food
      </h1>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search Indian foods (e.g. Biryani)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white dark:bg-brand-darkCard text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-brand-orange border border-gray-100 dark:border-gray-800 transition-all text-sm"
        />
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-xl flex items-center text-sm"
          >
            <Check size={18} className="mr-2" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3 pb-24">
        {results.map((food, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={food.id}
            className="glass rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
            onClick={() => setSelectedFood(food)}
          >
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{food.name}</p>
              <p className="text-xs text-gray-500 mt-1">{food.calories} kcal • {food.protein}g Protein per 100g</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center">
              <Plus size={18} className="text-gray-600 dark:text-gray-300" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Food Modal View */}
      <AnimatePresence>
        {selectedFood && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center"
            onClick={() => setSelectedFood(null)}
          >
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 500 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-brand-darkBg w-full sm:w-[400px] sm:rounded-3xl rounded-t-[40px] p-6 pb-12 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6" />
              <h2 className="text-2xl font-bold dark:text-white mb-1">{selectedFood.name}</h2>
              <p className="text-gray-500 text-sm mb-6">Enter quantity in grams</p>

              <div className="flex items-center justify-center mb-8">
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="text-center text-4xl w-32 font-bold bg-transparent outline-none border-b-2 border-brand-orange text-gray-900 dark:text-white pb-2"
                />
                <span className="text-xl font-bold text-gray-400 ml-2">g</span>
              </div>

              {/* Recalculated Macros preview */}
              <div className="grid grid-cols-4 gap-2 mb-8 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500">Cals</p>
                  <p className="font-semibold dark:text-gray-200">{(selectedFood.calories * (quantity/100)).toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500">Prot(g)</p>
                  <p className="font-semibold text-red-500">{(selectedFood.protein * (quantity/100)).toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500">Fat(g)</p>
                  <p className="font-semibold text-blue-500">{(selectedFood.fat * (quantity/100)).toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500">Carb(g)</p>
                  <p className="font-semibold text-yellow-500">{(selectedFood.carbs * (quantity/100)).toFixed(1)}</p>
                </div>
              </div>

              <button 
                onClick={logFood}
                disabled={loading}
                className="w-full bg-gradient-brand text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? 'Adding...' : 'Log Food'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoodSearch;


