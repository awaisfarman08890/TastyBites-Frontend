import { createContext, useEffect, useState, useRef } from "react";
import { fetchFoodItems } from "../service/foodService";
import { addToCart, removeQtyFromCart, removeItemFromCart, getCartData } from "../service/cartService";
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
      toast.error("Please log in to add items to cart.");
      return;
    }

    // Optimistically update UI instantly on first click
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    try {
      await addToCart(id, token);
    } catch (err) {
      // Revert if server fails
      setQuantities((prev) => {
        const updated = { ...prev };
        if (updated[id] > 1) updated[id]--;
        else delete updated[id];
        return updated;
      });
      console.error("Error adding food:", err.response || err);
    }
  };

  // ➖ Decrease quantity
  const decreaseQuantity = async (id) => {
    if (!token) return;

    setQuantities((prev) => {
      const updated = { ...prev };
      if (updated[id] <= 1) delete updated[id];
      else updated[id]--;
      return updated;
    });

    try {
      await removeQtyFromCart(id, token);
    } catch (err) {
      console.error("Decrease qty failed:", err.response || err);
      await loadCartData(token);
    }
  };

  // 🗑️ Remove item completely from cart
  const removeFromCart = async (foodId) => {
    if (!token) return;

    // Optimistic remove
    setQuantities((prev) => {
        const updated = { ...prev };
        delete updated[foodId];
        return updated;
    });

    try {
      await removeItemFromCart(foodId, token);
    } catch (err) {
      console.error("Remove from cart failed:", err.response || err);
      const errMsg = err.response?.data?.message || err.message || "Unknown error";
      toast.error(`Remove failed: ${err.response?.status || ''} - ${errMsg}`);
      await loadCartData(token);
    }
  };

  // 🔄 Load cart from backend
  const loadCartData = async (tk) => {
    try {
      console.log("Loading cart data with token prefix:", tk ? tk.substring(0, 10) + "..." : "none");
      const items = await getCartData(tk);
      console.log("Cart items received from backend:", items);
      setQuantities(items || {});
    } catch (err) {
      console.error("Cart load failed:", err.response || err);
      // Don't reset to empty immediately - keep optimistic state if possible, or verify behavior
      // For now, on load error we do clear, assuming token issue
      setQuantities({});
      toast.error("Failed to load cart data.");
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

      // Load token and cart (token already initialized, but sync with localStorage)
      const tk = localStorage.getItem("token");
      if (tk && tk !== token) {
        setToken(tk);
        await loadCartData(tk);
      } else if (tk) {
        // Token already set, just load cart
        await loadCartData(tk);
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
