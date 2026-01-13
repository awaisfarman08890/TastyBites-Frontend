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
  // Lock to prevent double-add requests (Race Condition Fix)
  const addingToCart = useRef({});

  // ➕ Increase quantity
  const increaseQuantity = async (id) => {
    // Don't proceed if token is not available or still loading
    if (!token) {
      toast.error("Please log in to add items to cart.");
      return;
    }

    // Prevent double requests for same item
    if (addingToCart.current[id]) return;
    addingToCart.current[id] = true;

    // Optimistically update UI
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    try {
      await addToCart(id, token);
    } catch (err) {
      // Revert optimistic update on error
      setQuantities((prev) => {
        const updated = { ...prev };
        if (updated[id] > 1) {
          updated[id]--;
        } else {
          delete updated[id];
        }
        return updated;
      });
      
      // Only show error if it's not a network/auth error (to avoid duplicate toasts)
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error("Error adding food:", err.response || err);
        toast.error("Failed to add food to cart.");
      }
    } finally {
        addingToCart.current[id] = false;
    }
  };

  // ➖ Decrease quantity
  const decreaseQuantity = async (id) => {
    setQuantities((prev) => {
      const updated = { ...prev };
      if (updated[id] <= 1) delete updated[id];
      else updated[id]--;
      return updated;
    });

    if (token) {
      try {
        await removeQtyFromCart(id, token);
      } catch (err) {
        console.error("Decrease qty failed:", err.response || err);
        toast.error("Failed to decrease quantity in cart.");
      }
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
      // Call dedicated remove endpoint to ensure it's deleted from DB
      await removeItemFromCart(foodId, token);
    } catch (err) {
      console.error("Remove from cart failed:", err.response || err);
      // If endpoint fails (e.g. 404), maybe try removeQty loop?
      // For now, we assume failure means we should warn user, but state is already cleared.
      // If we refresh, it might come back if backend didn't process.
      toast.error("Failed to remove item from cart database.");
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
        
        // DEDUPLICATE FOOD LIST (Fix for "Appears Twice" issue)
        // If backend returns duplicate items with same ID, we keep only last one (or first one).
        const uniqueFoods = [];
        const map = new Map();
        if (Array.isArray(foods)) {
            for (const item of foods) {
                if(!map.has(item.id || item._id)) {
                    map.set(item.id || item._id, true);
                    uniqueFoods.push(item);
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
