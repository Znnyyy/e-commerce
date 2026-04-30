import api from "./axios";

// Products
export const getProducts = (params) => api.get("/products/", { params });
export const getProductById = (id) => api.get(`/products/${id}/`);
export const createProduct = (data) => api.post("/products/", data);
export const updateProduct = (id, data) => api.put(`/products/${id}/`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}/`);

// Product Variants
export const createVariant = (data) => api.post("/product-variants/", data);
export const updateVariant = (id, data) => api.put(`/product-variants/${id}/`, data);
export const deleteVariant = (id) => api.delete(`/product-variants/${id}/`);

// Product Images
export const uploadProductImage = (productId, imageUrl, isPrimary = false) => {
  return api.post('/product-images/', {
    product: productId,
    image: imageUrl,
    is_primary: isPrimary
  });
};
export const deleteProductImage = (id) => api.delete(`/product-images/${id}/`);
export const setProductImagePrimary = (id) => api.post(`/product-images/${id}/set_primary/`);

// Cart
export const fetchCart = () => api.get('/cart/');
export const addToCart = (variantId, quantity = 1) =>
  api.post('/cart/add/', { variant_id: variantId, quantity });
export const updateCartItem = (itemId, quantity) =>
  api.patch(`/cart/update/${itemId}/`, { quantity });
export const removeCartItem = (itemId) =>
  api.delete(`/cart/remove/${itemId}/`);
export const clearCart = () => api.delete('/cart/clear/');

// Orders
export const getMyOrders = () => api.get('/orders/');