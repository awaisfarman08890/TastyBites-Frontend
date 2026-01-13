import { createContext, useEffect, useState, useRef } from "react";
import { fetchFoodItems } from "../service/foodService";
import { addToCart, removeQtyFromCart, removeItemFromCart, getCartData, clearCart } from "../service/cartService";
import { toast } from "react-toastify";

// Create store context
export const StoreContext = createContext(null);

export const StoreContextProvider = ({ children }) => {
  const [foodList, setFoodList] = useState([]);
  const [quantities, setQuantities] = useState({});
  // Initialize token from localStorage immediately to prevent redirect on refresh
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || "";
  });
  const [loadingFood, setLoadingFood] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  // Lock to prevent double-add requests (Race Condition Fix)
  const addingToCart = useRef({});

  // ➕ Increase quantity
  const increaseQuantity = async (id) => {
    if (!token) {
      toast.error("Please log in.");
      return;
    }

    // 1. Update UI INSTANTLY for snappiness
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    // 2. Queue the backend request to prevent race conditions (duplicate carts)
    // and to ensure every click is eventually processed in order.
    if (!addingToCart.current[id]) {
      addingToCart.current[id] = Promise.resolve();
    }

    addingToCart.current[id] = addingToCart.current[id].then(async () => {
      try {
        await addToCart(id);
      } catch (err) {
        console.error("Cart increment failed:", err);
        // On error, let the UI stay but try to refresh to latest server state
        await loadCartData();
      }
    });
  };

  // ➖ Decrease quantity
  const decreaseQuantity = async (id) => {
    if (!token) return;

    // 1. Update UI instantly
    setQuantities((prev) => {
      const updated = { ...prev };
      if (updated[id] <= 1) delete updated[id];
      else updated[id]--;
      return updated;
    });

    // 2. Queue backend request
    if (!addingToCart.current[id]) {
      addingToCart.current[id] = Promise.resolve();
    }

    addingToCart.current[id] = addingToCart.current[id].then(async () => {
      try {
        await removeQtyFromCart(id);
      } catch (err) {
        await loadCartData();
      }
    });
  };

  // 🗑️ Remove item completely
  const removeFromCart = async (foodId) => {
    if (!token) return;

    // 1. Update UI instantly
    setQuantities((prev) => {
        const updated = { ...prev };
        delete updated[foodId];
        return updated;
    });

    // 2. Queue backend request
    if (!addingToCart.current[foodId]) {
      addingToCart.current[foodId] = Promise.resolve();
    }

    addingToCart.current[foodId] = addingToCart.current[foodId].then(async () => {
      try {
        await removeItemFromCart(foodId);
      } catch (err) {
        toast.error("Could not remove item from server.");
        await loadCartData();
      }
    });
  };

  // 🔄 Load cart from backend
  const loadCartData = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const items = await getCartData();
      setQuantities(items || {});
    } catch (err) {
      console.error("Cart load failed:", err);
      toast.error("Failed to load cart data.");
    }
  };

  // 🧹 Clear cart (New)
  const clearCurrentCart = async () => {
    if (!token) return;
    try {
        await clearCart();
        setQuantities({});
        toast.success("Cart cleared");
    } catch (error) {
        toast.error("Failed to clear cart");
    }
  };

  // 🚀 Initial load
  useEffect(() => {
    (async () => {
      setLoadingFood(true);

      // Fetch food items
      try {
        const foods = await fetchFoodItems();
        console.log("Fetched food items:", foods);
        
        // DEDUPLICATE AND NORMALIZE FOOD LIST
        const uniqueFoods = [];
        const map = new Map();
        if (Array.isArray(foods)) {
          for (const item of foods) {
            const normalizedId = item.id || item._id;
            if (normalizedId && !map.has(normalizedId)) {
              map.set(normalizedId, true);
              // Ensure the item has a consistent 'id' property for the UI
              uniqueFoods.push({ ...item, id: normalizedId });
            }
          }
        }
        
        setFoodList(uniqueFoods);
      } catch (err) {
        console.error("Error fetching food list:", err.response || err);
        toast.error("Failed to fetch the food list.");
        setFoodList([]);
      } finally {
        setLoadingFood(false);
      }

      // Load token and cart
      if (localStorage.getItem("token")) {
        await loadCartData();
      }
    })();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        foodList,
        quantities,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCurrentCart,
        token,
        setToken,
        setQuantities,
        loadCartData,
        loadingFood, // expose loading state
        authLoading, // expose auth loading state
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
