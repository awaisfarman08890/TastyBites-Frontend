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

    // Lock to prevent double-add requests (Fix for Duplicate Cart Entries)
    if (addingToCart.current[id]) return;
    addingToCart.current[id] = true;

    // Optimistically update UI
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    try {
      await addToCart(id, token);
      console.log(`Successfully added ${id} to cart`);
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
      
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error("Error adding food:", err.response || err);
        toast.error("Failed to add to cart. Please try again.");
      }
    } finally {
      addingToCart.current[id] = false;
    }
  };

  // ➖ Decrease quantity
  const decreaseQuantity = async (id) => {
    if (!token) return;

    // Lock to prevent overlapping decrease requests
    if (addingToCart.current[id]) return;
    addingToCart.current[id] = true;

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
      toast.error("Failed to update cart.");
      // On error, reload full cart to ensure sync
      await loadCartData(token);
    } finally {
      addingToCart.current[id] = false;
    }
  };

  // 🗑️ Remove item completely from cart
  const removeFromCart = async (foodId) => {
    if (!token) return;

    if (addingToCart.current[foodId]) return;
    addingToCart.current[foodId] = true;

    // Optimistic remove
    setQuantities((prev) => {
        const updated = { ...prev };
        delete updated[foodId];
        return updated;
    });

    try {
      // Call dedicated remove endpoint to ensure it's deleted from DB
      await removeItemFromCart(foodId, token);
      console.log(`Successfully removed ${foodId} from cart`);
    } catch (err) {
      console.error("Remove from cart failed:", err.response || err);
      // Show actual error from backend to debug
      const errMsg = err.response?.data?.message || err.message || "Unknown error";
      toast.error(`Remove failed: ${err.response?.status || ''} - ${errMsg}`);
      
      // Revert optimistic update by reloading real data
      await loadCartData(token);
    } finally {
      addingToCart.current[foodId] = false;
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
