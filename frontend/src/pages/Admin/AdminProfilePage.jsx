import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../services/api';
import CenteredNotification from '../../components/Common/CenteredNotification';
import { CameraIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { setUserInfo } from '../../redux/slices/authSlice';

const AdminProfilePage = () => {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState({ name: '', email: '', avatar: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [notification, setNotification] = useState(null);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/admin/profile');
        setProfile(res.data);
        setAvatarPreview(res.data.avatar || '');
      } catch (err) {
        setNotification({ message: 'Failed to load profile', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setAvatarPreview(base64String);
      setProfile(prev => ({ ...prev, avatar: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/admin/profile', {
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
      });
      setProfile(res.data);
      setAvatarPreview(res.data.avatar || '');
     dispatch(setUserInfo({ name: res.data.name, email: res.data.email, avatar: res.data.avatar }));
      setNotification({ message: 'Profile updated successfully', type: 'success' });
    } catch (err) {
      setNotification({ message: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({ confirm: 'Passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordErrors({ new: 'Password must be at least 6 characters' });
      return;
    }
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setNotification({ message: 'Password changed successfully', type: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (err) {
      setNotification({ message: err.response?.data?.message || 'Change failed', type: 'error' });
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) return <AdminLayout><div className="text-center py-12">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      {notification && <CenteredNotification {...notification} onClose={() => setNotification(null)} />}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Profile</h1>

        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-primary" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
                  {getInitials(profile.name)}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-primary rounded-full p-1 cursor-pointer shadow-md">
                <CameraIcon className="h-4 w-4 text-white" />
                <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-2">Click camera to upload (max 2MB)</p>
          </div>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary active:scale-95 transition-all duration-200">
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {passwordErrors.new && <p className="text-red-500 text-sm mt-1">{passwordErrors.new}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {passwordErrors.confirm && <p className="text-red-500 text-sm mt-1">{passwordErrors.confirm}</p>}
            </div>

            <div className="flex justify-end">
              <button onClick={handlePasswordChange} className="btn-primary active:scale-95 transition-all duration-200">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfilePage;