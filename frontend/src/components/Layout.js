import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'admission_officer', 'management'] },
  { to: '/applicants', label: 'Applicants', icon: '👤', roles: ['admin', 'admission_officer'] },
  { to: '/seat-allocation', label: 'Seat Allocation', icon: '🪑', roles: ['admin', 'admission_officer'] },
  { to: '/admission-confirm', label: 'Confirm Admission', icon: '✅', roles: ['admin', 'admission_officer'] },
  { to: '/master-setup', label: 'Master Setup', icon: '⚙️', roles: ['admin'] },
  { to: '/seat-matrix', label: 'Seat Matrix', icon: '🪑', roles: ['admin'] },
  { to: '/users', label: 'Users', icon: '👥', roles: ['admin'] },
  { to: '/reports', label: 'Reports', icon: '📋', roles: ['admin', 'management'] },
];

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const visibleNav = navItems.filter((n) => !user || n.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-blue-900 text-white flex flex-col transition-all duration-300`}>
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          {sidebarOpen && <span className="font-bold text-lg">AdmissionMS</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-blue-300 hover:text-white">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="flex-1 py-4">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          {sidebarOpen && (
            <div className="mb-2 text-xs text-blue-300">
              <div className="font-medium text-white">{user?.name}</div>
              <div className="capitalize">{user?.role?.replace('_', ' ')}</div>
            </div>
          )}
          <button onClick={handleLogout} className="flex items-center gap-2 text-blue-300 hover:text-white text-sm">
            <span>🚪</span>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
