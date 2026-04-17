import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "Track Your Nutrition",
    subtitle: "Easily log your meals and discover nutritional values of your favorite Indian foods.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Reach Your Goals",
    subtitle: "Monitor your daily calories and get smart exercise recommendations.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Stay Consistent",
    subtitle: "Build healthy habits with detailed progress tracking and charts.",
    image: "https://images.unsplash.com/photo-1526506118321-419b6eb5ed49?q=80&w=800&auto=format&fit=crop"
  }
];

const Welcome = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (current === slides.length - 1) {
      navigate('/login');
    } else {
      setCurrent((prev) => prev + 1);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-brand-bg dark:bg-brand-darkBg relative overflow-hidden">
      <div className="h-3/5 w-full relative rounded-b-[40px] overflow-hidden shadow-xl">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={slides[current].image}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-between px-6 pt-10 pb-12 text-center z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {slides[current].title}
            </h2>
            <p className="text-gray-500 dark:text-gray-300">
              {slides[current].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex w-full items-center justify-between">
          <div className="flex space-x-2">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current ? 'w-8 bg-brand-orange' : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextSlide}
            className="flex items-center justify-center w-16 h-16 bg-gradient-brand rounded-full shadow-lg text-white hover:scale-105 transition-transform"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;


