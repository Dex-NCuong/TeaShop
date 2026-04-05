import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? (user._id || user.id) : null;
  });

  const [cartItems, setCartItems] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const key = user ? `cart_${user._id || user.id}` : 'cart_guest';
    const savedCart = localStorage.getItem(key);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    // Only save if we have a stable state
    const key = userId ? `cart_${userId}` : 'cart_guest';
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, userId]);

  useEffect(() => {
    const handleAuthChange = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const newUserId = user ? (user._id || user.id) : null;
      
      // Before updating userId, the current cartItems will be saved to the OLD userId's key by the other useEffect
      // So we just need to update userId and cartItems will be loaded from the NEW key
      setUserId(newUserId);
      const key = newUserId ? `cart_${newUserId}` : 'cart_guest';
      const savedCart = localStorage.getItem(key);
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    };
    
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const addToCart = (product, weight, quantity) => {
    setCartItems(prev => {
      const itemKey = `${product._id || product.id}-${weight._id || weight.id}`;
      const existingItem = prev.find(item => item.itemKey === itemKey);

      if (existingItem) {
        return prev.map(item => 
          item.itemKey === itemKey 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, {
        itemKey,
        _id: product._id || product.id,
        id: product._id || product.id,
        name: product.name,
        image: product.imageUrl,
        weightId: weight._id || weight.id,
        weight: weight.weight,
        price: weight.price,
        stock: weight.stock,
        quantity: quantity
      }];
    });
  };

  const updateQuantity = (itemKey, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.itemKey === itemKey) {
        const newQty = Math.max(1, item.quantity + delta);
        // Optional: check stock here
        if (delta > 0 && newQty > item.stock) {
          alert(`Chỉ còn ${item.stock} túi trong kho!`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (itemKey) => {
    setCartItems(prev => prev.filter(item => item.itemKey !== itemKey));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      updateQuantity, 
      removeItem, 
      clearCart,
      cartCount,
      subtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
