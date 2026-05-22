// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  PencilIcon, 
  CameraIcon, 
  XMarkIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success' ? 'bg-green-50 border border-green-400 text-green-800' : 'bg-red-50 border border-red-400 text-red-800'
    }`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2"><XMarkIcon className="h-4 w-4" /></button>
    </div>
  );
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const ProfilePage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'orders', 'password'
const location = useLocation();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState({
    name: '', email: '', street: '', country: ''
  });

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [avatarImage, setAvatarImage] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const showNotification = (message, type = 'success') => setNotification({ message, type });
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab');
  if (tab === 'orders') setActiveTab('orders');
  else if (tab === 'password') setActiveTab('password');
  else setActiveTab('profile');
}, [location.search]);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        setProfile(res.data);
        setOriginalProfile(res.data);
      } catch {
        showNotification('Failed to load profile', 'error');
      }
    };
    if (userInfo) fetchProfile();
  }, [userInfo]);

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const res = await api.get('/orders/myorders');
        setOrders(res.data);
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    if (userInfo && activeTab === 'orders') {
      fetchOrders();
    } else if (userInfo) {
      fetchOrders();
    }
  }, [userInfo, activeTab])

  // ----- Profile validation (street & country required) -----
const validateProfile = () => {
  let valid = true;
  const errors = { name: '', email: '', phone: '', street: '', country: '' };
 
  if (!profile.name.trim()) {
    errors.name = 'Full name is required';
    valid = false;
  }
  if (!profile.email.trim()) {
    errors.email = 'Email is required';
    valid = false;
  } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
    errors.email = 'Please enter a valid email address';
    valid = false;
  }
  if (!profile.phone?.trim()) {
    errors.phone = 'Phone number is required';
    valid = false;
  } else if (!/^03\d{9}$/.test(profile.phone.trim())) {
    errors.phone = 'Enter a valid Pakistani mobile number (e.g., 03123456789)';
    valid = false;
  }
  if (!profile.address?.street?.trim()) {
    errors.street = 'Street address is required';
    valid = false;
  }
  if (!profile.address?.country?.trim()) {
    errors.country = 'Country is required';
    valid = false;
  }
  setProfileErrors(errors);
  return valid;
};

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', profile);
      setProfile(data);
      setOriginalProfile(data);
      const updatedUser = { ...userInfo, name: data.name, email: data.email, phone: data.phone, address: data.address };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      showNotification('Profile updated successfully', 'success');
      setIsEditing(false);
      setProfileErrors({ name: '', email: '', street: '', country: '' });
    } catch (err) {
      showNotification(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfile(originalProfile);
    setIsEditing(false);
    setProfileErrors({ name: '', email: '', street: '', country: '' });
  };

  const handleInputChange = (e, field, subfield = null) => {
    if (subfield) {
      setProfile(prev => ({
        ...prev,
        address: { ...prev.address, [subfield]: e.target.value },
      }));
      if (profileErrors[subfield]) setProfileErrors(prev => ({ ...prev, [subfield]: '' }));
    } else {
      setProfile(prev => ({ ...prev, [field]: e.target.value }));
      if (profileErrors[field]) setProfileErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // ----- Password validation -----
  const validatePassword = () => {
    let valid = true;
    const errors = { currentPassword: '', newPassword: '', confirmPassword: '' };
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
      valid = false;
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
      valid = false;
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
      valid = false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      valid = false;
    }
    setPasswordErrors(errors);
    return valid;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    setPasswordLoading(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showNotification('Password changed successfully', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setActiveTab('profile');
    } catch (err) {
      const msg = err.response?.data?.message || 'Password change failed';
      if (msg.toLowerCase().includes('current password is incorrect')) {
        setPasswordErrors(prev => ({ ...prev, currentPassword: msg }));
      } else {
        setPasswordErrors(prev => ({ ...prev, currentPassword: msg }));
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarImage(reader.result);
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => setAvatarImage(null);
  const initials = getInitials(profile.name || userInfo?.name);

  // Common input className
  const inputClassName = (hasError) => `w-full px-4 py-2 rounded-lg border ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:outline-none focus:ring-2 transition`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}

      <div className="flex flex-col lg:flex-row gap-8">
       
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
            <div className="bg-gradient-to-r from-primary to-secondary h-24"></div>
            <div className="relative px-6 pb-6">
              <div className="relative -mt-12 flex justify-center">
                <div className="relative">
                  {avatarImage ? (
                    <img src={avatarImage} alt="Profile" className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover bg-white" />
                  ) : (
                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-md bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-600">
                      {initials}
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 flex gap-1">
                    <label htmlFor="avatar-upload" className="bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-100">
                      <CameraIcon className="h-5 w-5 text-gray-600" />
                    </label>
                    {avatarImage && <button onClick={removeAvatar} className="bg-white rounded-full p-1 shadow-md hover:bg-gray-100"><XMarkIcon className="h-5 w-5 text-red-500" /></button>}
                  </div>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
              </div>
              <div className="text-center mt-4">
                <h2 className="text-xl font-bold text-gray-800">{profile.name || userInfo?.name}</h2>
                <p className="text-gray-500">{profile.email || userInfo?.email}</p>
                {profile.phone && <p className="text-gray-500 text-sm mt-1">{profile.phone}</p>}
                <p className="text-xs text-gray-400 mt-2">Member since {profile.createdAt ? new Date(profile.createdAt).getFullYear() : '2024'}</p>
              </div>
              <div className="mt-6 space-y-2">
                <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'profile' ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'}`}>Profile Information</button>
                <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'orders' ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'}`}>Order History</button>
                <button onClick={() => setActiveTab('password')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'password' ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'}`}>Change Password</button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-2/3">
          
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Profile Information</h3>
                {!isEditing && <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-primary hover:underline"><PencilIcon className="h-4 w-4" /> Edit</button>}
              </div>
              <div className="border-t border-gray-200 mb-6"></div>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={profile.name} onChange={(e) => handleInputChange(e, 'name')} className={inputClassName(!!profileErrors.name)} />
                    {profileErrors.name && <p className="text-red-500 text-sm mt-1">{profileErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
                    <input type="email" value={profile.email} onChange={(e) => handleInputChange(e, 'email')} className={inputClassName(!!profileErrors.email)} />
                    {profileErrors.email && <p className="text-red-500 text-sm mt-1">{profileErrors.email}</p>}
                  </div>
                  <div>
  <label className="block text-gray-700 text-sm font-medium mb-1">Phone <span className="text-red-500">*</span></label>
  <input
    type="tel"
    value={profile.phone || ''}
    onChange={(e) => handleInputChange(e, 'phone')}
    className={inputClassName(!!profileErrors.phone)}
  />
  {profileErrors.phone && <p className="text-red-500 text-sm mt-1">{profileErrors.phone}</p>}
</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">Street <span className="text-red-500">*</span></label>
                      <input type="text" value={profile.address?.street || ''} onChange={(e) => handleInputChange(e, 'address', 'street')} className={inputClassName(!!profileErrors.street)} />
                      {profileErrors.street && <p className="text-red-500 text-sm mt-1">{profileErrors.street}</p>}
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">City</label>
                      <input type="text" value={profile.address?.city || ''} onChange={(e) => handleInputChange(e, 'address', 'city')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:outline-none focus:ring-2 transition" />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">State</label>
                      <input type="text" value={profile.address?.state || ''} onChange={(e) => handleInputChange(e, 'address', 'state')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:outline-none focus:ring-2 transition" />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">ZIP Code</label>
                      <input type="text" value={profile.address?.zipCode || ''} onChange={(e) => handleInputChange(e, 'address', 'zipCode')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:outline-none focus:ring-2 transition" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 text-sm font-medium mb-1">Country <span className="text-red-500">*</span></label>
                      <input type="text" value={profile.address?.country || ''} onChange={(e) => handleInputChange(e, 'address', 'country')} className={inputClassName(!!profileErrors.country)} />
                      {profileErrors.country && <p className="text-red-500 text-sm mt-1">{profileErrors.country}</p>}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={handleCancelEdit} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                    <button onClick={handleSaveProfile} disabled={loading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-gray-700">
                  <div className="flex flex-wrap"><span className="w-32 font-medium">Name:</span><span>{profile.name}</span></div>
                  <div className="flex flex-wrap"><span className="w-32 font-medium">Email:</span><span>{profile.email}</span></div>
                  <div className="flex flex-wrap"><span className="w-32 font-medium">Phone:</span><span>{profile.phone || 'Not provided'}</span></div>
                  <div className="flex flex-wrap"><span className="w-32 font-medium">Address:</span><span>{profile.address?.street ? `${profile.address.street}, ${profile.address.city}, ${profile.address.state} ${profile.address.zipCode}, ${profile.address.country}` : 'Not provided'}</span></div>
                </div>
              )}
            </div>
          )}

         
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Order History</h3>
              <div className="border-t border-gray-200 mb-6"></div>
              {ordersLoading ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBagIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>You haven't placed any orders yet.</p>
                  <Link to="/shop" className="text-primary mt-2 inline-block">Start Shopping →</Link>
                </div>
              ) : (
                <div className="space-y-4">{orders.map(order => (
                  <div key={order._id} className="border rounded-xl p-4 hover:shadow-md transition">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div><p className="font-semibold text-gray-800">Order #{order._id.slice(-8)}</p><p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p></div>
                      <div className="text-right"><p className="font-medium text-primary">Rs. {order.totalPrice.toFixed(2)}</p><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">{order.orderItems.length} item(s)</div>
                    <Link to={`/order/${order._id}`} className="text-primary text-sm hover:underline mt-2 inline-block">View Details</Link>
                  </div>
                ))}</div>
              )}
            </div>
          )}

          {/* PASSWORD TAB (unchanged, with red border on error) */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h3>
              <div className="border-t border-gray-200 mb-6"></div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Current Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type={showCurrentPassword ? 'text' : 'password'} value={passwordData.currentPassword} onChange={(e) => { setPasswordData({ ...passwordData, currentPassword: e.target.value }); if (passwordErrors.currentPassword) setPasswordErrors(prev => ({ ...prev, currentPassword: '' })); }} className={inputClassName(!!passwordErrors.currentPassword)} />
                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>{showCurrentPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button>
                  </div>
                  {passwordErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">New Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type={showNewPassword ? 'text' : 'password'} value={passwordData.newPassword} onChange={(e) => { setPasswordData({ ...passwordData, newPassword: e.target.value }); if (passwordErrors.newPassword) setPasswordErrors(prev => ({ ...prev, newPassword: '' })); }} className={inputClassName(!!passwordErrors.newPassword)} />
                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button>
                  </div>
                  {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Confirm New Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={(e) => { setPasswordData({ ...passwordData, confirmPassword: e.target.value }); if (passwordErrors.confirmPassword) setPasswordErrors(prev => ({ ...prev, confirmPassword: '' })); }} className={inputClassName(!!passwordErrors.confirmPassword)} />
                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button>
                  </div>
                  {passwordErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>}
                </div>
                <div className="flex justify-end">
                  <button onClick={handleChangePassword} disabled={passwordLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition disabled:opacity-50">{passwordLoading ? 'Updating...' : 'Update Password'}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;