import { createContext, useEffect, useState } from "react";
import { fetchFoodItems } from "../service/foodService";
import { addToCart, removeQtyFromCart, getCartData } from "../service/cartService";
import { toast } from "react-toastify";

// Create context
export const StoreContext = createContext(null);

export const StoreContextProvider = ({ children }) => {
  const [foodList, setFoodList] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [token, setToken] = useState("");
  const [loadingFood, setLoadingFood] = useState(true); // Loading state

  // Increase quantity
  const increaseQuantity = async (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    if (token) {
      try {
        await addToCart(id, token);
      } catch (err) {
        console.error("Error adding food:", err.response || err);
        toast.error("An error occurred while adding food to cart.");
      }
    }
  };

  //  Decrease quantity
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

  //  Remove item completely
  const removeFromCart = async (foodId) => {
    if (!token) return;

    try {
      await removeQtyFromCart(foodId, token);
      setQuantities((prev) => {
        const updated = { ...prev };
        delete updated[foodId];
        return updated;
      });
    } catch (err) {
      console.error("Remove from cart failed:", err.response || err);
      toast.error("Failed to remove item from cart.");
    }
  };

  //  Load cart from backend
  const loadCartData = async (tk) => {
    try {
      const items = await getCartData(tk);
      setQuantities(items || {});
    } catch (err) {
      console.error("Cart load failed:", err.response || err);
      setQuantities({});
      toast.error("Failed to load cart data.");
    }
  };

  //  Initial load
  useEffect(() => {
    (async () => {
      setLoadingFood(true);
      try {
        // Fetch food list
        const foodData = await fetchFoodItems();
        console.log("Fetched food data:", foodData);
        setFoodList(Array.isArray(foodData) ? foodData : []);
      } catch (error) {
        console.error("Error fetching food list:", error.response || error);
        toast.error("Failed to fetch the food list.");
        setFoodList([]);
      } finally {
        setLoadingFood(false);
      }

      // Load token and cart
      const tk = localStorage.getItem("token");
      if (tk) {
        setToken(tk);
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
        loadingFood, 
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
