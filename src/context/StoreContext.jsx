import { createContext, useEffect, useState } from "react";
import { fetchFoodItems } from "../service/foodService";
import { addToCart, removeQtyFromCart, getCartData } from "../service/cartService";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

export const StoreContextProvider = ({ children }) => {
  const [foodList, setFoodList] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [token, setToken] = useState("");
  const [loadingFood, setLoadingFood] = useState(true);

  const increaseQuantity = async (id) => {
    setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    if (token) {
      try {
        await addToCart(id, token);
      } catch (err) {
        toast.error("Failed to add food to cart.");
        console.error(err);
      }
    }
  };

  const decreaseQuantity = async (id) => {
    setQuantities(prev => {
      const updated = { ...prev };
      if (updated[id] <= 1) delete updated[id];
      else updated[id]--;
      return updated;
    });
    if (token) {
      try {
        await removeQtyFromCart(id, token);
      } catch (err) {
        toast.error("Failed to decrease quantity in cart.");
        console.error(err);
      }
    }
  };

  const removeFromCart = async (foodId) => {
    if (!token) return;
    try {
      await removeQtyFromCart(foodId, token);
      setQuantities(prev => { const u = { ...prev }; delete u[foodId]; return u; });
    } catch (err) {
      toast.error("Failed to remove item from cart.");
      console.error(err);
    }
  };

  const loadCartData = async (tk) => {
    try {
      const items = await getCartData(tk);
      setQuantities(items || {});
    } catch (err) {
      setQuantities({});
      console.error(err);
      toast.error("Failed to load cart data.");
    }
  };

  useEffect(() => {
    (async () => {
      setLoadingFood(true);
      try {
        const foods = await fetchFoodItems();
        setFoodList(Array.isArray(foods) ? foods : []);
      } catch (err) {
        toast.error("Failed to fetch the food list.");
        console.error(err);
        setFoodList([]);
      } finally {
        setLoadingFood(false);
      }

      const tk = localStorage.getItem("token");
      if (tk) {
        setToken(tk);
        await loadCartData(tk);
      }
    })();
  }, []);

  return (
    <StoreContext.Provider value={{
      foodList, quantities, increaseQuantity, decreaseQuantity, removeFromCart,
      token, setToken, setQuantities, loadCartData, loadingFood
    }}>
      {children}
    </StoreContext.Provider>
  );
};
