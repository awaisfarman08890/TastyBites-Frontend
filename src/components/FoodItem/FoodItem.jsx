import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './FoodItem.css'; // custom CSS file

const FoodItem = ({ name, description, imageUrl, price, id }) => {
  const { increaseQuantity, decreaseQuantity, quantities } = useContext(StoreContext);

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex justify-content-center">
      <div className="card food-card shadow-sm">
        <Link to={`/food/${id}`} className="food-img-link">
          <img src={imageUrl} alt={name} className="food-img" loading="lazy" />
        </Link>
        <div className="card-body">
          <h5 className="card-title">{name}</h5>
          <p className="card-text">{description}</p>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="h5 mb-0 text-tomato">${price}.00</span>
            <div>
              <i className="bi bi-star-fill text-warning"></i>
              <i className="bi bi-star-fill text-warning"></i>
              <i className="bi bi-star-fill text-warning"></i>
              <i className="bi bi-star-fill text-warning"></i>
              <i className="bi bi-star-half text-warning"></i>
              <small className="text-muted">(4.7)</small>
            </div>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-between align-items-center bg-light">
        <Link className="btn btn-tt btn-sm" to={`/food/${id}`} style={{textDecoration: "none"}}>
            See Food
        </Link>

        {quantities[id] > 0 ? (
            <div className="d-flex align-items-center gap-2">
            <button className="btn btn-tt btn-sm" onClick={() => decreaseQuantity(id)}>
                <i className="bi bi-dash-circle"></i>
            </button>
            <span className="fw-bold px-2">{quantities[id]}</span>
            <button className="btn btn-tt btn-sm" onClick={() => increaseQuantity(id)}>
                <i className="bi bi-plus-circle"></i> Add
            </button>
            </div>
        ) : (
            <button className="btn btn-outline-tomato btn-sm" onClick={() => increaseQuantity(id)}>
            <i className="bi bi-plus-circle"></i> Add to Cart
            </button>
        )}
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
