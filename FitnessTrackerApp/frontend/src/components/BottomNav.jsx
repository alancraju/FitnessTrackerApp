import { NavLink } from 'react-router-dom';
import { Home, Search, BarChart2, User } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'History', path: '/history', icon: BarChart2 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="absolute bottom-0 w-full glass rounded-t-3xl border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex justify-around items-center h-20 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${
                isActive ? 'text-brand-orange scale-110' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={isActive ? 28 : 24} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute -top-2 w-1.5 h-1.5 bg-brand-orange rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;


