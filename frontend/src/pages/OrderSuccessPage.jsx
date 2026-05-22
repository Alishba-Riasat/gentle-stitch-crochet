
import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { CheckCircleIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';;

const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-600">Order not found.</p>
        <Link to="/shop" className="text-primary mt-4 inline-block hover:underline">← Back to Shop</Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header with brand gradient */}
        <div className="bg-gradient-to-r from-primary to-secondary px-6 py-8 text-white text-center">
          <CheckCircleIcon className="h-16 w-16 mx-auto mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold">Order Placed!</h1>
          <p className="text-white/90 mt-2">Your order has been received and is pending confirmation.</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Order ID, Date & Status */}
          <div className="flex flex-wrap justify-between items-center gap-3 border-b border-gray-200 pb-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-mono font-semibold text-gray-800">{order._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="text-gray-800">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ShoppingBagIcon className="h-5 w-5 text-primary" /> Order Items
            </h2>
            <div className="border rounded-lg overflow-hidden">
              <div className="hidden md:grid md:grid-cols-12 gap-4 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 border-b">
                <div className="md:col-span-6">Product</div>
                <div className="md:col-span-2 text-center">Price</div>
                <div className="md:col-span-2 text-center">Quantity</div>
                <div className="md:col-span-2 text-right">Total</div>
              </div>
              <div className="divide-y">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col md:grid md:grid-cols-12 gap-3 p-4 items-center">
                    <div className="flex items-center gap-3 md:col-span-6 w-full">
                      <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <Link to={`/product/${item.product}`} className="font-medium text-gray-800 hover:text-primary transition">
                        {item.name}
                      </Link>
                    </div>
                    <div className="text-center md:col-span-2">
                      <span className="text-gray-600">Rs. {item.price.toFixed(2)}</span>
                    </div>
                    <div className="text-center md:col-span-2">
                      <span className="text-gray-600">× {item.quantity}</span>
                    </div>
                    <div className="text-right md:col-span-2 font-semibold text-gray-800">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Shipping Address</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800">{order.shippingAddress.fullName}</p>
                <p className="text-gray-600">{order.shippingAddress.street}</p>
                <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p className="text-gray-600">{order.shippingAddress.country}</p>
                <p className="text-gray-600 mt-2">{order.shippingAddress.phone}</p>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Order Summary</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>Rs. {order.itemsPrice.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `Rs. ${order.shippingPrice.toFixed(2)}`}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax</span><span>Rs. {order.taxPrice.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t"><span>Total</span><span>Rs. {order.totalPrice.toFixed(2)}</span></div>
                <p className="text-sm text-gray-500 mt-2">Payment: Cash on Delivery</p>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-700 font-medium">Order Notes</p>
              <p className="text-gray-700 italic">"{order.notes}"</p>
            </div>
          )}

          {/* Action Buttons – Guest friendly */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 border-t">
           {/* Only logged‑in users see the order history link */}
          {userInfo && (
            
              <Link to="/profile?tab=orders" className="border border-primary text-primary px-6 py-2 rounded-lg hover:bg-primary hover:text-white transition text-center active:bg-primary/80 active:scale-95 transition-all duration-200">
                View My Orders
              </Link>
            
          )}
            <Link
              to="/shop"
              className="border border-primary text-primary px-6 py-2 rounded-lg hover:bg-primary hover:text-white transition text-center active:bg-primary/80 active:scale-95 transition-all duration-200"
            >
              Continue Shopping
            </Link>
            
          </div>

          

          <p className="text-xs text-gray-400 text-center mt-4">
            Your order will be confirmed within 24 hours. You will receive an email once it's processed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;