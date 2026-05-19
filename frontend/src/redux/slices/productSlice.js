import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProducts, fetchProductById, addProductReview } from '../../services/productService';

export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (params) => {
    const data = await fetchProducts(params);
    return data;
  }
);

export const getProductById = createAsyncThunk(
  'products/getProductById',
  async (id) => {
    const data = await fetchProductById(id);
    return data;
  }
);

export const submitReview = createAsyncThunk(
  'products/submitReview',
  async ({ id, rating, comment }) => {
    const data = await addProductReview(id, { rating, comment });
    return data;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    product: null,
    page: 1,
    pages: 1,
    total: 0,
    loading: false,
    error: null,
    reviewLoading: false,
  },
  reducers: {
    clearProduct: (state) => {
      state.product = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getProducts
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // getProductById
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // submitReview
      .addCase(submitReview.pending, (state) => {
        state.reviewLoading = true;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.reviewLoading = false;
        if (state.product) {
          state.product.rating = action.payload.rating;
          state.product.numReviews = action.payload.numReviews;
          state.product.reviews = action.payload.reviews;
        }
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;