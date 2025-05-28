import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex justify-center min-h-screen bg-dark-950">
      <div className="flex w-full max-w-[1920px]">
        <div className="fixed left-0 top-0 bottom-0 z-20 w-[280px] flex items-start justify-center">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-1 pl-[280px]">
          <div className="px-6">
            <TopBar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              <div className="mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;