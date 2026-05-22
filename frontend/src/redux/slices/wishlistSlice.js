import { createSlice } from '@reduxjs/toolkit';

const normalizeWishlistItems = (items) => {
  if (!Array.isArray(items)) return [];
  return Array.from(new Set(items
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        return item._id || item.id || item.productId || null;
      }
      return null;
    })
    .filter(Boolean)));
};

const loadWishlist = () => {
  const stored = localStorage.getItem('wishlist');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return normalizeWishlistItems(parsed);
    } catch (e) {
      return [];
    }
  }
  return [];
};

const saveWishlist = (items) => {
  localStorage.setItem('wishlist', JSON.stringify(normalizeWishlistItems(items)));
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: loadWishlist(),
  },
  reducers: {
    addToWishlist: (state, action) => {
      const productId = typeof action.payload === 'string'
        ? action.payload
        : action.payload?._id || action.payload?.id || action.payload?.productId;
      if (!productId) return;
      if (!state.items.includes(productId)) {
        state.items.push(productId);
        saveWishlist(state.items);
      }
    },
    removeFromWishlist: (state, action) => {
      const productId = typeof action.payload === 'string'
        ? action.payload
        : action.payload?._id || action.payload?.id || action.payload?.productId;
      if (!productId) return;
      state.items = state.items.filter(id => id !== productId);
      saveWishlist(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      saveWishlist(state.items);
    },
    setWishlist: (state, action) => {
      state.items = normalizeWishlistItems(action.payload);
      saveWishlist(state.items);
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, setWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;