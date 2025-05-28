import React from 'react';

interface DashboardListProps {
  title: string;
  items: Array<{
    id: string;
    title: string;
    value: string | number;
    subtitle?: string;
  }>;
  loading?: boolean;
}

const DashboardList: React.FC<DashboardListProps> = ({ 
  title, 
  items,
  loading = false 
}) => {
  return (
    <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700 p-6 h-full hover:bg-dark-800/70 transition-colors">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-dark-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100% - 40px)' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
            >
              <div>
                <p className="text-white font-medium">{item.title}</p>
                {item.subtitle && (
                  <p className="text-sm text-gray-400 mt-1">{item.subtitle}</p>
                )}
              </div>
              <p className="text-primary-400 font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardList;