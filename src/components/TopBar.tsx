import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, ChevronDown, Settings } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import SettingsMenu from './SettingsMenu';

const TopBar: React.FC = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsMenuOpen(false);
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    setIsSettingsMenuOpen(false);
  };

  const toggleSettingsMenu = () => {
    setIsSettingsMenuOpen(!isSettingsMenuOpen);
    setIsProfileMenuOpen(false);
  };

  const handleMenuItemClick = () => {
    setIsSettingsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-10 bg-dark-900 my-4 rounded-2xl shadow-lg border border-dark-900">
      <div className="px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <button className="p-2 rounded-lg text-dark-400 md:hidden hover:bg-dark-800 hover:text-white">
              <Menu size={24} />
            </button>
          </div>
          <div className="flex items-center space-x-6">
            <button className="p-2 rounded-lg text-dark-400 hover:bg-dark-800 hover:text-white relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
            </button>
            <div className="relative" ref={settingsRef}>
              <button
                className="flex items-center space-x-3 px-4 py-2.5 min-w-[200px] rounded-lg text-dark-400 hover:bg-dark-800 hover:text-white"
                onClick={toggleSettingsMenu}
              >
                <Settings size={20} />
                <span className="text-sm">Configurações</span>
                <ChevronDown
                  size={16}
                  className={`ml-auto transition-transform duration-200 ${
                    isSettingsMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isSettingsMenuOpen && <SettingsMenu onItemClick={handleMenuItemClick} />}
            </div>
            <div className="relative">
              <button
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-800 transition-colors duration-200"
                onClick={toggleProfileMenu}
              >
                <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center text-white font-semibold">
                  JD
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">Jane Doe</p>
                  <p className="text-xs text-dark-400">Administrador</p>
                </div>
                <ChevronDown size={16} className="text-dark-400" />
              </button>
              {isProfileMenuOpen && <ProfileMenu onClose={handleMenuItemClick} />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar