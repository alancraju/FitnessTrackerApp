import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Activity, ChevronRight, ChevronLeft } from 'lucide-react';
import { apiCall } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const Signup = ({ setIsAuthenticated }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    height: 170, weight: 70, target_weight: 65,
    age: 25, gender: 'M', activity_level: 'Sedentary'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.password)) {
      return setError('Please fill all basic details');
    }
    if (step === 1 && formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    setError('');
    setStep((p) => p + 1);
  };

  const prevStep = () => setStep((p) => p - 1);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        height: Number(formData.height),
        weight: Number(formData.weight),
        target_weight: Number(formData.target_weight),
        age: Number(formData.age)
      };

      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
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
    <div className="h-screen w-full flex flex-col justify-center px-6 bg-brand-bg dark:bg-brand-darkBg relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-brand-green/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl" />

      <div className="z-10 bg-white dark:bg-brand-darkCard p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 relative">
        {/* Step Indicator */}
        <div className="flex justify-center space-x-2 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${step >= i ? 'w-8 bg-brand-green' : 'w-2 bg-gray-300 dark:bg-gray-700'}`} />
          ))}
        </div>

        <div className="flex justify-center mb-4">
          <div className="p-3 bg-brand-green/10 rounded-full">
            <Activity className="text-brand-green w-8 h-8" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          {step === 1 ? 'Create Account' : step === 2 ? 'Your Body Metrics' : 'Lifestyle & Goals'}
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
          {step === 1 ? 'Start your fitness journey today.' : step === 2 ? "We'll calculate your precise calories." : "Let's tune the algorithm for you."}
        </p>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4 absolute w-full">
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                  <input name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/50 border border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                  <input name="email" type="email" placeholder="Email address" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/50 border border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                  <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/50 border border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                  <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/50 border border-gray-200 dark:border-gray-700" />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4 absolute w-full">
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Height (cm)</span>
                  <input name="height" type="number" value={formData.height} onChange={handleChange} className="w-20 text-right bg-transparent text-gray-900 dark:text-white font-bold outline-none" />
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Current Weight (kg)</span>
                  <input name="weight" type="number" value={formData.weight} onChange={handleChange} className="w-20 text-right bg-transparent text-gray-900 dark:text-white font-bold outline-none" />
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-brand-orange border-2 dark:border-brand-orange/50">
                  <span className="text-gray-900 dark:text-white font-semibold">Goal Weight (kg)</span>
                  <input name="target_weight" type="number" value={formData.target_weight} onChange={handleChange} className="w-20 text-right text-brand-orange bg-transparent font-bold outline-none" />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4 absolute w-full">
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Age</span>
                  <input name="age" type="number" value={formData.age} onChange={handleChange} className="w-20 text-right bg-transparent text-gray-900 dark:text-white font-bold outline-none" />
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Gender</span>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="bg-transparent text-gray-900 dark:text-white font-bold outline-none text-right">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Activity Level</span>
                  <select name="activity_level" value={formData.activity_level} onChange={handleChange} className="bg-transparent text-brand-green font-bold outline-none text-right max-w-[120px]">
                    <option value="Sedentary">Sedentary</option>
                    <option value="Active">Active</option>
                    <option value="Very Active">Very Active</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-8 space-x-4">
          {step > 1 && (
            <button onClick={prevStep} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl shadow-sm hover:shadow transition-all flex justify-center items-center">
              <ChevronLeft className="w-5 h-5 mr-1" /> Back
            </button>
          )}
          
          {step < 3 ? (
            <button onClick={nextStep} className="flex-1 bg-brand-green text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex justify-center items-center">
              Next <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button onClick={onSubmit} disabled={loading} className="flex-1 bg-gradient-brand text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex justify-center items-center">
              {loading ? 'Creating...' : 'Finish Setup'}
            </button>
          )}
        </div>

        {step === 1 && (
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400 text-sm">
            Already have an account? <Link to="/login" className="text-brand-green font-semibold hover:underline">Login</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Signup;

