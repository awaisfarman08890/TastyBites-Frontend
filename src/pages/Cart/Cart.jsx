import React, { useContext, useState, useEffect } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { calculateCartTotals } from '../../cartUtils/cartUtils';

const Cart = () => {
    const navigate = useNavigate();
    const { foodList, increaseQuantity, decreaseQuantity, quantities, removeFromCart } = useContext(StoreContext);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000); // simulate loading
        return () => clearTimeout(timer);
    }, []);

    const cartItems = foodList.filter(food => quantities[food.id] > 0);
    const { subtotal, shipping, tax, total } = calculateCartTotals(cartItems, quantities);

    const renderSkeleton = () => (
        <div className="card mb-4">
            <div className="card-body">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="row cart-item mb-3">
                        <div className="col-md-3">
                            <div className="skeleton skeleton-img"></div>
                        </div>
                        <div className="col-md-5">
                            <div className="skeleton skeleton-title"></div>
                            <div className="skeleton skeleton-text"></div>
                        </div>
                        <div className="col-md-2">
                            <div className="skeleton skeleton-quantity"></div>
                        </div>
                        <div className="col-md-2 text-end">
                            <div className="skeleton skeleton-text"></div>
                            <div className="skeleton skeleton-quantity mt-2"></div>
                        </div>
                        <hr/>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="container py-5">
            <h1 className="mb-5">Your Shopping Cart</h1>
            <div className="row">
                <div className="col-lg-8">
                    {loading ? (
                        renderSkeleton()
                    ) : cartItems.length === 0 ? (
                        <p>Your cart is empty.</p>
                    ) : (
                        <div className="card mb-4">
                            <div className="card-body">
                                {cartItems.map(food => (
                                    <div key={food.id} className="row cart-item mb-3">
                                        <div className="col-md-3">
                                            <img src={food.imageUrl} alt={food.name} className="img-fluid rounded" width={100}/>
                                        </div>
                                        <div className="col-md-5">
                                            <h5 className="card-title">{food.name}</h5>
                                            <p className="text-muted">Category: {food.category}</p>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="input-group">
                                                <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => decreaseQuantity(food.id)}>-</button>
                                                <input style={{maxWidth:"100px"}} type="text" className="form-control form-control-sm text-center quantity-input" value={quantities[food.id]} readOnly />
                                                <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => increaseQuantity(food.id)}>+</button>
                                            </div>
                                        </div>
                                        <div className="col-md-2 text-end">
                                            <p className="fw-bold">${(food.price * quantities[food.id]).toFixed(2)}</p>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(food.id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                        <hr/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="text-start mb-4">
                        <Link to="/" className="btn btn-tomato-outline">
                            <i className="bi bi-arrow-left me-2"></i>Continue Shopping
                        </Link>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card cart-summary">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Order Summary</h5>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Shipping</span>
                                <span>${shipping.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Tax</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <hr/>
                            <div className="d-flex justify-content-between mb-4">
                                <strong>Total</strong>
                                <strong>${total.toFixed(2)}</strong>
                            </div>
                            <button className="btn w-100 btn-tt" disabled={cartItems.length === 0} onClick={() => navigate('/order')}>Proceed to Checkout</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart;
