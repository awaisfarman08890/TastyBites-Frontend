import { createContext, useEffect, useState } from "react";
import { fetchFoodItems } from "../service/foodService";
import {
  addToCart,
  removeQtyFromCart,
  getCartData,
} from "../service/cartService";
import { toast } from "react-toastify";

// eslint-disable-next-line react-refresh/only-export-components
export const StoreContext = createContext(null);

export const StoreContextProvider = ({ children }) => {
  const [foodList, setFoodList] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [token, setToken] = useState("");

  // ➕ increase qty
  const increaseQuantity = async (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    if (token) {
      try {
        await addToCart(id, token);
      } catch (err) {
        console.error("Add to cart failed", err);
      }
    }
  };

  // ➖ decrease qty (1 step)
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
        console.error("Decrease qty failed", err);
      }
    }
  };

  // 🗑️ REMOVE item completely
  const removeFromCart = async (foodId) => {
    if (!token) return;

    try {
      await removeQtyFromCart(foodId, token);

      setQuantities((prev) => {
        const updated = { ...prev };
        delete updated[foodId];
        return updated;
      });
    } catch (error) {
      console.error("Remove from cart failed", error);
    }
  };

  // 🔄 Load cart from backend
  const loadCartData = async (tk) => {
    try {
      const items = await getCartData(tk);
      setQuantities(items);
    } catch (err) {
      console.error("Cart load failed:", err);
      setQuantities({});
    }
  };

  // 🚀 Initial load
  useEffect(() => {
    (async () => {
      try {
        const foodData = await fetchFoodItems();
        setFoodList(foodData);
      } catch (error) {
        console.error("Error fetching food list:", error);
        toast.error("An error occurred while retrieving the food list.");
        setFoodList([]);
      }

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
        removeFromCart, // ✅ IMPORTANT
        token,
        setToken,
        setQuantities,
        loadCartData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
