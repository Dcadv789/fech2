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
    <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700 p-6">
      <h3 className="text-lg font-medium text-white mb-4">{title}</h3>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-dark-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-dark-700/50 transition-colors"
            >
              <div>
                <p className="text-white">{item.title}</p>
                {item.subtitle && (
                  <p className="text-sm text-gray-400">{item.subtitle}</p>
                )}
              </div>
              <p className="text-primary-400 font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardList;