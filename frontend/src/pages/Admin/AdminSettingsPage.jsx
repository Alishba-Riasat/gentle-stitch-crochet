import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../services/api';
import CenteredNotification from '../../components/Common/CenteredNotification';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    storeName: '',
    storeLogo: '',
    storeEmail: '',
    storePhone: '',
    shippingFee: 199,
    freeShippingThreshold: 5000,
    codEnabled: true,
    bankTransferEnabled: true,
    socialLinks: { facebook: '', instagram: '', twitter: '' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        setSettings(res.data);
      } catch (err) {
        setNotification({ message: 'Failed to load settings', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [name]: value } }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSettings(prev => ({ ...prev, storeLogo: res.data.url }));
      setNotification({ message: 'Logo uploaded successfully', type: 'success' });
    } catch (err) {
      setNotification({ message: 'Logo upload failed', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      setNotification({ message: 'Settings saved successfully', type: 'success' });
    } catch (err) {
      setNotification({ message: 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><div className="text-center py-12">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      {notification && <CenteredNotification {...notification} onClose={() => setNotification(null)} />}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Store Settings</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>General</h2>
            <div>
              <label className="block text-gray-700 mb-1">Store Name</label>
              <input type="text" name="storeName" value={settings.storeName} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Store Logo</label>
              <div className="flex items-center gap-4">
                {settings.storeLogo && <img src={settings.storeLogo} alt="Logo" className="h-12 w-auto" />}
                <label className="btn-primary cursor-pointer inline-flex items-center gap-2 active:scale-95 transition-all duration-200">
                  <CloudArrowUpIcon className="h-5 w-5" />
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label>Store Email</label><input type="email" name="storeEmail" value={settings.storeEmail} onChange={handleChange} className="input-field" /></div>
              <div><label>Store Phone</label><input type="text" name="storePhone" value={settings.storePhone} onChange={handleChange} className="input-field" /></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Shipping & Payment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label>Shipping Fee (Rs.)</label><input type="number" name="shippingFee" value={settings.shippingFee} onChange={handleChange} className="input-field" /></div>
              <div><label>Free Shipping Threshold (Rs.)</label><input type="number" name="freeShippingThreshold" value={settings.freeShippingThreshold} onChange={handleChange} className="input-field" /></div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2"><input type="checkbox" name="codEnabled" checked={settings.codEnabled} onChange={handleChange} /> Enable COD</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="bankTransferEnabled" checked={settings.bankTransferEnabled} onChange={handleChange} /> Enable Bank Transfer</label>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label>Facebook</label><input type="text" name="facebook" value={settings.socialLinks.facebook} onChange={handleSocialChange} className="input-field" /></div>
              <div><label>Instagram</label><input type="text" name="instagram" value={settings.socialLinks.instagram} onChange={handleSocialChange} className="input-field" /></div>
              <div><label>Twitter</label><input type="text" name="twitter" value={settings.socialLinks.twitter} onChange={handleSocialChange} className="input-field" /></div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary px-8 py-2 active:scale-95 transition-all duration-200 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;