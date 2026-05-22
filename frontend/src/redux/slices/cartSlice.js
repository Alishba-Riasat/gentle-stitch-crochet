// frontend/src/redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ========== LOCALSTORAGE HELPERS ==========
const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem('cart');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load cart from localStorage', e);
  }
  return { items: [], totalQuantity: 0, totalAmount: 0, loading: false, error: null };
};

const saveCartToStorage = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

// ========== HELPER ==========
const calculateTotals = (items) => {
  let totalQuantity = 0;
  let totalAmount = 0;
  items.forEach(item => {
    totalQuantity += item.quantity;
    totalAmount += item.price * item.quantity;
  });
  return { totalQuantity, totalAmount };
};

// ========== ASYNC THUNKS (BACKEND) ==========
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const addToCartBackend = createAsyncThunk('cart/addToCartBackend', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const updateCartItemBackend = createAsyncThunk('cart/updateCartItemBackend', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/cart/${productId}`, { quantity });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const removeCartItemBackend = createAsyncThunk('cart/removeCartItemBackend', async (productId, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const clearCartBackend = createAsyncThunk('cart/clearCartBackend', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart');
    return { items: [], totalQuantity: 0, totalAmount: 0 };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const mergeGuestCartBackend = createAsyncThunk('cart/mergeGuestCartBackend', async (guestCart, { rejectWithValue }) => {
  try {
    const response = await api.post('/cart/merge', { guestCart });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

// ========== SLICE ==========
const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // ----- Guest / local actions (used when not logged in) -----
    addToCartGuest: (state, action) => {
      const { product, quantity } = action.payload;
      const existing = state.items.find(i => i.productId === product._id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) throw new Error(`Only ${product.stock} in stock`);
        existing.quantity = newQty;
      } else {
        if (quantity > product.stock) throw new Error(`Only ${product.stock} in stock`);
        state.items.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.find(img => img.isMain)?.url || product.images?.[0]?.url || '',
          stock: product.stock,
          quantity,
        });
      }
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      saveCartToStorage({ items: state.items, totalQuantity: state.totalQuantity, totalAmount: state.totalAmount });
    },
    updateCartItemGuest: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(i => i.productId === productId);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(i => i.productId !== productId);
        } else {
          if (quantity > item.stock) throw new Error(`Only ${item.stock} in stock`);
          item.quantity = quantity;
        }
        const totals = calculateTotals(state.items);
        state.totalQuantity = totals.totalQuantity;
        state.totalAmount = totals.totalAmount;
        saveCartToStorage({ items: state.items, totalQuantity: state.totalQuantity, totalAmount: state.totalAmount });
      }
    },
    removeCartItemGuest: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(i => i.productId !== productId);
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      saveCartToStorage({ items: state.items, totalQuantity: state.totalQuantity, totalAmount: state.totalAmount });
    },
    clearCartGuest: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      saveCartToStorage({ items: [], totalQuantity: 0, totalAmount: 0 });
    },
    // ----- Manual set (e.g., after login or from backend) -----
    setCart: (state, action) => {
      state.items = action.payload.items;
      state.totalQuantity = action.payload.totalQuantity;
      state.totalAmount = action.payload.totalAmount;
      saveCartToStorage({ items: state.items, totalQuantity: state.totalQuantity, totalAmount: state.totalAmount });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        // SAFE mapping: handle null product references
        state.items = (action.payload.items || []).map(item => {
          const product = item.product || {};
          return {
            productId: product._id || item.productId || '',
            name: item.name || '',
            price: item.price || 0,
            image: item.image || '',
            stock: item.stock || 0,
            quantity: item.quantity || 0,
          };
        });
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
        saveCartToStorage({ items: state.items, totalQuantity: state.totalQuantity, totalAmount: state.totalAmount });
      })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addToCartBackend.fulfilled, (state, action) => {
        state.items = (action.payload.items || []).map(item => {
          const product = item.product || {};
          return {
            productId: product._id || item.productId || '',
            name: item.name || '',
            price: item.price || 0,
            image: item.image || '',
            stock: item.stock || 0,
            quantity: item.quantity || 0,
          };
        });
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
        saveCartToStorage({ items: state.items, totalQuantity: state.totalQuantity, totalAmount: state.totalAmount });
      })
      .addCase(updateCartItemBackend.fulfilled, (state, action) => {
        state.items = (action.payload.items || []).map(item => {
          const product = item.product || {};
          return {
            productId: product._id || item.productId || '',
            name: item.name || '',
            price: item.price || 0,
            image: item.image || '',
            stock: item.stock || 0,
            quantity: item.quantity || 0,
          };
        });
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
        saveCartToStorage({ items: state.items, totalQuantity: state.totalQuantity, totalAmount: state.totalAmount });
      })
      .addCase(removeCartItemBackend.fulfilled, (state, action) => {
        state.items = (action.payload.items || []).map(item => {
          const product = item.product || {};
          return {
            productId: product._id || item.productId || '',
            name: item.name || '',
            price: item.price || 0,
            image: item.image || '',
            stock: item.stock || 0,
            quantity: item.quantity || 0,
          };
        });
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
        saveCartToStorage({ items: state.items, totalQuantity: state.totalQuantity, totalAmount: state.totalAmount });
      })
      .addCase(clearCartBackend.fulfilled, (state) => {
        state.items = [];
        state.totalQuantity = 0;
        state.totalAmount = 0;
        saveCartToStorage({ items: [], totalQuantity: 0, totalAmount: 0 });
      })
      .addCase(mergeGuestCartBackend.fulfilled, (state, action) => {
        state.items = (action.payload.items || []).map(item => {
          const product = item.product || {};
          return {
            productId: product._id || item.productId || '',
            name: item.name || '',
            price: item.price || 0,
            image: item.image || '',
            stock: item.stock || 0,
            quantity: item.quantity || 0,
          };
        });
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
        saveCartToStorage({ items: state.items, totalQuantity: state.totalQuantity, totalAmount: state.totalAmount });
      });
  },
});

export const { addToCartGuest, updateCartItemGuest, removeCartItemGuest, clearCartGuest, setCart } = cartSlice.actions;
export default cartSlice.reducer;