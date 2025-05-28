import React from 'react';
import { Trash2 } from 'lucide-react';
import { Partner } from '../../types/partner';

interface PartnerListProps {
  partners: Partner[];
  onDelete: (id: string) => void;
}

const PartnerList: React.FC<PartnerListProps> = ({ partners, onDelete }) => {
  if (partners.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        Nenhum sócio cadastrado
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {partners.map((partner) => (
        <div
          key={partner.id}
          className="flex items-center justify-between p-2 bg-dark-800 rounded-lg hover:bg-dark-750 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{partner.nome}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>CPF: {partner.cpf}</span>
              <span>{partner.percentual}%</span>
            </div>
          </div>
          <button
            onClick={() => onDelete(partner.id)}
            className="p-1 text-red-400 hover:text-red-300 hover:bg-dark-700 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default PartnerList;