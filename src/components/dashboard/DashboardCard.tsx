import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  comparison?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  loading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  comparison,
  loading = false 
}) => {
  return (
    <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700 p-6 hover:bg-dark-800/70 transition-colors">
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-dark-700 rounded w-1/2"></div>
          <div className="h-8 bg-dark-700 rounded w-3/4"></div>
        </div>
      ) : (
        <>
          <h3 className="text-sm font-medium text-gray-400 mb-3">{title}</h3>
          <div className="flex items-end gap-3">
            <p className="text-2xl font-bold text-white">{value}</p>
            {comparison && (
              <div className={`flex items-center text-sm font-medium ${
                comparison.type === 'increase' 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                {comparison.type === 'increase' ? (
                  <ArrowUp size={16} className="mr-1" />
                ) : (
                  <ArrowDown size={16} className="mr-1" />
                )}
                {comparison.value}%
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardCard;