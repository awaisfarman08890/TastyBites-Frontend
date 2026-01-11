import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { toast } from "react-toastify";
import './FoodDisplay.css'; // add skeleton styles here

const ITEMS_PER_PAGE = 20;

const FoodDisplay = ({ category, searchText }) => {
  const { foodList } = useContext(StoreContext);

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Loader + reset page when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500); // fake loader
    return () => clearTimeout(timer);
  }, [foodList, category, searchText]);

  let filteredFoodList = [];
  try {
    if (Array.isArray(foodList)) {
      filteredFoodList = foodList.filter(
        (food) =>
          food &&
          (category === "All" || food.category === category) &&
          food.name &&
          food.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
  } catch (error) {
    console.error("Error while reading food list:", error);
    toast.error("An error occurred while reading the food list.");
    filteredFoodList = [];
  }

  const totalPages = Math.ceil(filteredFoodList.length / ITEMS_PER_PAGE);

  // Ensure currentPage is never out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFood = filteredFoodList.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, category, searchText]);

  return (
    <div className="container py-4">
      <div className="row g-4">
        {loading
          ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <div className="col-md-3 col-sm-6" key={index}>
                <div className="card p-3">
                  <div className="skeleton skeleton-img rounded-3"></div>
                  <div className="skeleton skeleton-text mt-2 rounded"></div>
                  <div className="skeleton skeleton-text short rounded"></div>
                  <div className="skeleton skeleton-btn mt-3 rounded"></div>
                </div>
              </div>
            ))
          : paginatedFood.length > 0
          ? paginatedFood.map((food) => (
              <FoodItem
                key={food.id}
                id={food.id}
                name={food.name}
                description={food.description}
                imageUrl={food.imageUrl}
                price={food.price}
              />
            ))
          : (
            <div className="text-center mt-5 col-12">
              <h3>No food items available</h3>
            </div>
          )
        }
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4 gap-3 align-items-center">
          <button
            className="btn btn-tomato-pagination d-flex align-items-center justify-content-center"
            style={{ width: "50px", height: "40px" }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <i className="bi bi-arrow-left fs-5 text-white"></i>
          </button>

          <span className="fw-semibold">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="btn btn-tomato-pagination d-flex align-items-center justify-content-center"
            style={{ width: "50px", height: "40px" }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            <i className="bi text-white bi-arrow-right fs-5"></i>
          </button>
        </div>
      )}

    </div>
  );
};

export default FoodDisplay;
