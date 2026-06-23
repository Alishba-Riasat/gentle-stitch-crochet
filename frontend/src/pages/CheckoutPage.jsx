// frontend/src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { clearCartGuest, clearCartBackend, removeCartItemBackend, removeCartItemGuest } from '../redux/slices/cartSlice';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSettings } from '../hooks/useSettings';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState([]);

  // Shipping address form data
  const [shippingData, setShippingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
    notes: '',
  });

  // Billing address (optional)
  const [billingData, setBillingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
  });

  // Shipping logic – use settings values with fallbacks
  const FREE_SHIPPING_THRESHOLD = settings?.freeShippingThreshold || 5000;
  const STANDARD_SHIPPING_FEE = settings?.shippingFee || 199;
  const shippingCost = totalAmount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const finalTotal = totalAmount + shippingCost;

  // Payment methods based on settings
  const paymentMethods = [
    settings?.codEnabled !== false && { value: 'cod', label: 'Cash on Delivery (COD)', description: 'Pay when you receive your order. No extra charges.' },
    settings?.bankTransferEnabled !== false && { value: 'bank', label: 'Bank Deposit / Transfer', description: 'Please contact us on WhatsApp or email for bank details.' },
  ].filter(Boolean);

  // Prefill for logged user (shipping)
  useEffect(() => {
    if (userInfo) {
      setShippingData(prev => ({
        ...prev,
        fullName: userInfo.name || '',
        email: userInfo.email || '',
        phone: userInfo.phone || '',
        address: userInfo.address?.street || '',
        city: userInfo.address?.city || '',
        state: userInfo.address?.state || '',
        postalCode: userInfo.address?.zipCode || '',
        country: userInfo.address?.country || 'Pakistan',
      }));
    }
  }, [userInfo]);

  // Sync billing with shipping when checkbox is off
  useEffect(() => {
    if (!useDifferentBilling) {
      setBillingData({
        fullName: shippingData.fullName,
        email: shippingData.email,
        phone: shippingData.phone,
        address: shippingData.address,
        city: shippingData.city,
        state: shippingData.state,
        postalCode: shippingData.postalCode,
        country: shippingData.country,
      });
    }
  }, [useDifferentBilling, shippingData]);

  // Ensure default payment method is available
  useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethods.find(p => p.value === paymentMethod)) {
      setPaymentMethod(paymentMethods[0].value);
    }
  }, [paymentMethods, paymentMethod]);

  const handleShippingChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleBillingChange = (e) => {
    setBillingData({ ...billingData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!shippingData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!shippingData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingData.email)) newErrors.email = 'Valid email required';
    if (!shippingData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^(03\d{9}|\+923\d{9})$/.test(shippingData.phone.trim())) {
      newErrors.phone = 'Valid Pakistani number: 03XXXXXXXXX or +923XXXXXXXXX';
    }
    if (!shippingData.address.trim()) newErrors.address = 'Address is required';
    else if (shippingData.address.trim().length < 5) newErrors.address = 'Address must be at least 5 characters';
    if (!shippingData.city.trim()) newErrors.city = 'City is required';
    if (!shippingData.country.trim()) newErrors.country = 'Country is required';

    if (useDifferentBilling) {
      if (!billingData.fullName.trim()) newErrors.billingFullName = 'Billing full name is required';
      if (!billingData.email.trim()) newErrors.billingEmail = 'Billing email is required';
      else if (!/\S+@\S+\.\S+/.test(billingData.email)) newErrors.billingEmail = 'Valid email required';
      if (!billingData.phone.trim()) newErrors.billingPhone = 'Billing phone is required';
      else if (!/^(03\d{9}|\+923\d{9})$/.test(billingData.phone.trim())) {
        newErrors.billingPhone = 'Valid Pakistani number: 03XXXXXXXXX or +923XXXXXXXXX';
      }
      if (!billingData.address.trim()) newErrors.billingAddress = 'Billing address is required';
      else if (billingData.address.trim().length < 5) newErrors.billingAddress = 'Address must be at least 5 characters';
      if (!billingData.city.trim()) newErrors.billingCity = 'Billing city is required';
      if (!billingData.country.trim()) newErrors.billingCountry = 'Billing country is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkStock = async () => {
    const outOfStock = [];
    for (const item of items) {
      try {
        const res = await api.get(`/products/${item.productId}`);
        const product = res.data;
        if (product.stock < item.quantity) {
          outOfStock.push({
            id: item.productId,
            name: item.name,
            image: item.image,
            requested: item.quantity,
            available: product.stock,
          });
        }
      } catch (err) {
        console.error(`Failed to fetch stock for ${item.name}`, err);
      }
    }
    return outOfStock;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const stockIssues = await checkStock();
    if (stockIssues.length > 0) {
      setOutOfStockItems(stockIssues);
      setShowStockModal(true);
      setLoading(false);
      return;
    }
    const orderItems = items.map(item => ({
      product: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    const itemsPrice = totalAmount;
    const shippingPrice = shippingCost;
    const taxPrice = 0;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const orderData = {
      orderItems,
      shippingAddress: {
        fullName: shippingData.fullName,
        street: shippingData.address,
        city: shippingData.city,
        state: shippingData.state,
        zipCode: shippingData.postalCode,
        country: shippingData.country,
        phone: shippingData.phone,
      },
      billingAddress: useDifferentBilling ? {
        fullName: billingData.fullName,
        street: billingData.address,
        city: billingData.city,
        state: billingData.state,
        zipCode: billingData.postalCode,
        country: billingData.country,
        phone: billingData.phone,
      } : null,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      notes: shippingData.notes,
      email: !userInfo ? shippingData.email : undefined,
    };

    try {
      const response = await api.post('/orders', orderData);
      if (!userInfo) dispatch(clearCartGuest());
      else await dispatch(clearCartBackend()).unwrap();
      setOrderId(response.data._id);
      setOrderData(response.data);
      setShowSuccessModal(true);
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Order failed' });
    } finally {
      setLoading(false);
    }
  };

  const removeOutOfStockItems = async () => {
    try {
      for (const it of outOfStockItems) {
        if (userInfo) {
          await dispatch(removeCartItemBackend(it.id)).unwrap();
        } else {
          dispatch(removeCartItemGuest(it.id));
        }
      }
    } catch (err) {
      console.error('Failed to remove out-of-stock items', err);
    } finally {
      setShowStockModal(false);
      setOutOfStockItems([]);
      if (userInfo) dispatch(clearCartBackend());
    }
  };

  const handleContinueShopping = () => {
    setShowSuccessModal(false);
    navigate('/shop');
  };

  if (items.length === 0 && !showSuccessModal) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-10 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn-primary inline-block active:bg-primary/80 active:scale-95 transition-all duration-200">Continue Shopping</Link>
      </div>
    );
  }

  // Reusable input styling
  const inputClass = (fieldError) => `w-full px-4 py-2 rounded-lg border ${fieldError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:outline-none focus:ring-2 transition`;

  // Payment method info (dynamic description)
  const getPaymentDescription = (method) => {
    if (method === 'cod') return 'Pay when you receive your order. No extra charges.';
    if (method === 'bank') return `Please contact us on WhatsApp or email for bank details.`;
    return '';
  };

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-12 py-12 max-w-7xl">
      <h1 className="text-3xl font-bold text-center mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Checkout</h1>
      <div className="border-t border-gray-200 mb-8"></div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Forms */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Shipping Address</h2>
            {errors.form && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{errors.form}</div>}
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" name="fullName" value={shippingData.fullName} onChange={handleShippingChange} className={inputClass(errors.fullName)} />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={shippingData.email} onChange={handleShippingChange} className={inputClass(errors.email)} />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input type="tel" name="phone" value={shippingData.phone} onChange={handleShippingChange} className={inputClass(errors.phone)} />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Street Address <span className="text-red-500">*</span></label>
                <textarea name="address" rows="2" value={shippingData.address} onChange={handleShippingChange} className={inputClass(errors.address)} />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                <input type="text" name="city" value={shippingData.city} onChange={handleShippingChange} className={inputClass(errors.city)} />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">State / Province</label>
                  <input type="text" name="state" value={shippingData.state} onChange={handleShippingChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:outline-none focus:ring-2 transition" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Postal Code</label>
                  <input type="text" name="postalCode" value={shippingData.postalCode} onChange={handleShippingChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:outline-none focus:ring-2 transition" />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Country <span className="text-red-500">*</span></label>
                <input type="text" name="country" value={shippingData.country} onChange={handleShippingChange} className={inputClass(errors.country)} />
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Order Notes (optional)</label>
                <textarea name="notes" rows="2" value={shippingData.notes} onChange={handleShippingChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:outline-none focus:ring-2 transition" />
              </div>
            </form>
          </div>

          {/* Billing Address Toggle */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={useDifferentBilling} onChange={(e) => setUseDifferentBilling(e.target.checked)} className="w-4 h-4 text-primary" />
              <span className="text-gray-700">Use a different billing address</span>
            </label>
          </div>

          {useDifferentBilling && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Billing Address</h2>
              <div className="space-y-4">
                {/* Billing fields – same as shipping */}
                <div>
                  <label className="block text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="fullName" value={billingData.fullName} onChange={handleBillingChange} className={inputClass(errors.billingFullName)} />
                  {errors.billingFullName && <p className="text-red-500 text-sm mt-1">{errors.billingFullName}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={billingData.email} onChange={handleBillingChange} className={inputClass(errors.billingEmail)} />
                  {errors.billingEmail && <p className="text-red-500 text-sm mt-1">{errors.billingEmail}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="phone" value={billingData.phone} onChange={handleBillingChange} className={inputClass(errors.billingPhone)} />
                  {errors.billingPhone && <p className="text-red-500 text-sm mt-1">{errors.billingPhone}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Street Address <span className="text-red-500">*</span></label>
                  <textarea name="address" rows="2" value={billingData.address} onChange={handleBillingChange} className={inputClass(errors.billingAddress)} />
                  {errors.billingAddress && <p className="text-red-500 text-sm mt-1">{errors.billingAddress}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                  <input type="text" name="city" value={billingData.city} onChange={handleBillingChange} className={inputClass(errors.billingCity)} />
                  {errors.billingCity && <p className="text-red-500 text-sm mt-1">{errors.billingCity}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">State / Province</label>
                    <input type="text" name="state" value={billingData.state} onChange={handleBillingChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:outline-none focus:ring-2 transition" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Postal Code</label>
                    <input type="text" name="postalCode" value={billingData.postalCode} onChange={handleBillingChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:outline-none focus:ring-2 transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Country <span className="text-red-500">*</span></label>
                  <input type="text" name="country" value={billingData.country} onChange={handleBillingChange} className={inputClass(errors.billingCountry)} />
                  {errors.billingCountry && <p className="text-red-500 text-sm mt-1">{errors.billingCountry}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Payment Method</h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.value}
                  className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">{method.label}</p>
                    <p className="text-sm text-gray-500">{method.description}</p>
                    {method.value === 'bank' && (
                      <div className="mt-2 text-xs text-primary">
                        📞 <a href={`tel:${settings?.storePhone || '+923367072502'}`} className="hover:underline">
                          {settings?.storePhone || '+92 336 7072502'}
                        </a> &nbsp;|&nbsp;
                        ✉️ <a href={`mailto:${settings?.storeEmail || 'care@gentlestitch.com'}`} className="hover:underline">
                          {settings?.storeEmail || 'care@gentlestitch.com'}
                        </a>
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Order Summary</h2>
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 py-3">
                  <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 line-clamp-2">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium text-primary">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `Rs. ${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                  <span>Total</span>
                  <span>Rs. {finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full mt-6 py-3 text-lg active:bg-primary/80 active:scale-95 transition-all duration-200">
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>

      {/* Stock out modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-red-600">Out of Stock</h3>
              <button onClick={() => setShowStockModal(false)}><XMarkIcon className="h-6 w-6 text-gray-500" /></button>
            </div>
            <p className="text-gray-700 mb-4">The following items are no longer available in the requested quantity:</p>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-6">
              {outOfStockItems.map(item => (
                <div key={item.id} className="flex gap-3 p-2 border rounded-lg">
                  <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Requested: {item.requested} | Available: {item.available}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={removeOutOfStockItems} className="btn-primary flex-1 py-2">Remove Out‑of‑Stock Items</button>
              <button onClick={() => setShowStockModal(false)} className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h3>
              <p className="text-gray-600 mb-4">Thank you for your order. Your order ID is:</p>
              <p className="text-primary font-mono font-semibold text-lg mb-6">{orderId}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleContinueShopping}
                  className="btn-primary px-6 py-2 text-lg active:bg-primary/80 active:scale-95 transition-all duration-200"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate(`/order-success/${orderId}`, { state: { order: orderData } });
                  }}
                  className="border border-primary text-primary px-6 py-2 rounded-lg hover:bg-primary hover:text-white transition active:bg-primary/80 active:scale-95 transition-all duration-200"
                >
                  View Order
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;