import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  ShoppingCartIcon,
  UsersIcon,
  StarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({ storeName: 'Gentle Stitch', storeLogo: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        setSettings(res.data);
      } catch (err) {
        console.error('Failed to load store settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: HomeIcon },
    { to: '/admin/products', label: 'Products', icon: ShoppingBagIcon },
    { to: '/admin/categories', label: 'Categories', icon: TagIcon },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCartIcon },
    { to: '/admin/customers', label: 'Customers', icon: UsersIcon },
    { to: '/admin/reviews', label: 'Reviews', icon: StarIcon },
    { to: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon },
    { to: '/admin/inventory', label: 'Inventory', icon: ShoppingBagIcon },
    { to: '/admin/settings', label: 'Settings', icon: Cog6ToothIcon },
    { to: '/admin/profile', label: 'Profile', icon: UserCircleIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-4 flex flex-col gap-1 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-100 ${
                  isActive ? 'bg-primary/10 text-primary' : ''
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-red-600 hover:bg-gray-100"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-white px-4 shadow-sm lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            {/* Visit Store Button */}
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-primary transition rounded-lg hover:bg-gray-100"
            >
              <GlobeAltIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Visit Store</span>
            </Link>

            {/* Admin Profile */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">{userInfo?.name}</span>
              <img
                src={
                  userInfo?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo?.name)}&background=8B5A2B&color=fff&rounded=true&bold=true`
                }
                alt="avatar"
                className="h-8 w-8 rounded-full"
              />
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;