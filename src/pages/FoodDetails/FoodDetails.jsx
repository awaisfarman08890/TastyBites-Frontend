import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchFoodDetails } from '../../service/foodService';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';

const FoodDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const { increaseQuantity } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFoodDetails = async () => {
      try {
        setLoading(true);
        const foodData = await fetchFoodDetails(id);
        setData(foodData);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        toast.error('Failed to load food details');
      } finally {
        setLoading(false);
      }
    };
    loadFoodDetails();
  }, [id]);

  const addToCart = () => {
    increaseQuantity(data.id);
    navigate('/cart');
  };

  return (
    <section className="py-5">
      <div className="container px-4 px-lg-5 my-5">
        <div className="row gx-4 gx-lg-5 align-items-center">

          {/* IMAGE */}
          <div className="col-md-6">
            {loading ? (
              <div className="placeholder-glow">
                <div
                  className="placeholder col-12 rounded"
                  style={{ height: '350px' }}
                ></div>
              </div>
            ) : (
              <img
                className="card-img-top mb-5 mb-md-0"
                src={data.imageUrl}
                alt={data.name}
              />
            )}
          </div>

          {/* CONTENT */}
          <div className="col-md-6">
            {loading ? (
              <>
                <div className="placeholder-glow mb-2">
                  <span className="placeholder col-4"></span>
                </div>

                <h1 className="placeholder-glow">
                  <span className="placeholder col-8"></span>
                </h1>

                <div className="fs-5 mb-3 placeholder-glow">
                  <span className="placeholder col-3"></span>
                </div>

                <p className="placeholder-glow">
                  <span className="placeholder col-12"></span>
                  <span className="placeholder col-10"></span>
                  <span className="placeholder col-8"></span>
                </p>

                <button className="btn btn-outline-dark disabled placeholder col-5"></button>
              </>
            ) : (
              <>
                <div className="fs-5 mb-1">
                  Category:{' '}
                  <span className="badge text-bg-warning">
                    {data.category}
                  </span>
                </div>

                <h1 className="display-5 fw-bolder">{data.name}</h1>

                <div className="fs-5 mb-2">
                  <span>${data.price}.00</span>
                </div>

                <p className="lead">{data.description}</p>

                <div className="d-flex">
                  <button
                    className="btn btn-tt flex-shrink-0" style={{textDecoration: "none"}}
                    type="button"
                    onClick={addToCart}
                  >
                    <i className="bi-cart-fill me-1"></i>
                    Add to cart
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default FoodDetails;
