import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {TruckIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'cancelled': return <XCircleIcon className="h-6 w-6 text-red-600" />;
      case 'processing': return <ClockIcon className="h-6 w-6 text-blue-600" />;
      default: return <TruckIcon className="h-6 w-6 text-amber-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  const goBack = () => {
    navigate('/profile?tab=orders');
  };

  // Timeline steps
  const steps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const currentStatus = order?.orderStatus;
  const currentIndex = steps.findIndex(step => step.key === currentStatus);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error || 'Order not found'}</p>
        <button onClick={goBack} className="mt-4 text-primary hover:underline">← Back to Profile</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4 text-white">
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-sm opacity-90">Order #{order._id}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status & Date */}
          <div className="flex flex-wrap justify-between items-center border-b pb-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(order.orderStatus)}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Tracking Timeline */}
          <div className="mt-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Progress</h2>
            <div className="relative">
              {/* Horizontal line */}
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 z-0"></div>
              <div
                className="absolute left-0 top-5 h-0.5 bg-primary transition-all duration-500 z-0"
                style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
              ></div>
              <div className="relative flex justify-between z-10">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentIndex;
                  const isCurrent = idx === currentIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                          ${isCompleted ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}
                          ${isCurrent ? 'ring-4 ring-primary/30' : ''}
                        `}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <p className="text-xs mt-2 text-gray-600">{step.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
{order.trackingNumber && (
  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
    <p className="text-sm text-blue-800">
      <strong>Tracking Number:</strong> {order.trackingNumber}
    </p>
  </div>
)}
          {/* Order Items */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Items</h2>
            <div className="space-y-3">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 border-b pb-3">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <Link 
                      to={`/product/${item.product?._id || item.product}`} 
                      className="font-medium text-gray-800 hover:text-primary transition"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-500">Price: Rs. {item.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Shipping Address</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{order.shippingAddress.street}, {order.shippingAddress.city}</p>
              <p>{order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment & Totals */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Payment Summary</h2>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span>Rs. {order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Rs. {order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>Rs. {order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total</span>
                <span>Rs. {order.totalPrice.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500">Payment Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</p>
            </div>
          </div>

          {/* Notes (if any) */}
          {order.notes && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Order Notes</h2>
              <p className="text-gray-600 italic">"{order.notes}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;