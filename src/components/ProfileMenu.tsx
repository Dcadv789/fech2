import React from 'react';
import { LogOut, User } from 'lucide-react';

interface ProfileMenuProps {
  onClose: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ onClose }) => {
  return (
    <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-dark-800 ring-1 ring-black ring-opacity-5 overflow-hidden">
      <div className="p-3 border-b border-dark-700">
        <p className="text-sm font-medium text-white">Jane Doe</p>
        <p className="text-xs text-gray-400">jane.doe@example.com</p>
        <p className="text-xs text-primary-400">Administrador</p>
      </div>
      <div className="py-1">
        <button 
          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 hover:text-white flex items-center"
          onClick={onClose}
        >
          <User size={16} className="mr-2" />
          Perfil
        </button>
      </div>
      <div className="py-1 border-t border-dark-700">
        <button 
          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-700 hover:text-red-300 flex items-center"
          onClick={onClose}
        >
          <LogOut size={16} className="mr-2" />
          Sair
        </button>
      </div>
    </div>
  );
};

export default ProfileMenu;