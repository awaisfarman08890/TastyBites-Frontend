import React, { useRef, useState } from "react";
import { categories } from "../../assets/assets";
import "./ExploreMenu.css";

const ExploreMenu = ({ category, setCategory }) => {
  const menuRef = useRef(null);

  const scrollLeft = () => {
    if (menuRef.current) {
      menuRef.current.scrollBy({ left: -250, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (menuRef.current) {
      menuRef.current.scrollBy({ left: 250, behavior: "smooth" });
    }
  };

  // Local state to track loaded images
  const [loadedImages, setLoadedImages] = useState({});

  const handleImageLoad = (index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="explore-menu position-relative ">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h1 className="explore-title">Taste Our Menu </h1>
        <div className="d-flex gap-2">
          <i className="bi bi-arrow-left-circle scroll-icon" onClick={scrollLeft}></i>
          <i className="bi bi-arrow-right-circle scroll-icon" onClick={scrollRight}></i>
        </div>
      </div>
      <p className="explore-subtitle">🔥 Taste the magic of our menu – yum in every bite! 🍔🍩</p>

      <div className="d-flex gap-4 explore-menu-list" ref={menuRef}>
        {categories.map((item, index) => (
          <div
            key={index}
            className="text-center explore-menu-list-item"
            onClick={() =>
              setCategory(prev => (prev === item.category ? "All" : item.category))
            }
          >
            {!loadedImages[index] && (
              <div className="skeleton"></div> // Skeleton placeholder
            )}
            <img
              src={item.icon}
              alt={item.category}
              className={`rounded-circle ${item.category === category ? "active" : ""} ${loadedImages[index] ? "visible" : "hidden"}`}
              height={128}
              width={128}
              onLoad={() => handleImageLoad(index)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/placeholder.png";
              }}
            />
            <p>{item.category}</p>
          </div>
        ))}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;
