import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';

const Explore = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [category, setCategory] = useState('All');
  const [searchText, setSearchText] = useState('');

  /* =========================
     READ CATEGORY FROM URL
  ========================= */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlCategory = params.get('category');

    if (urlCategory) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategory(urlCategory);
    } else {
      setCategory('All');
    }
  }, [location.search]);

  /* =========================
     DROPDOWN CHANGE
  ========================= */
  const handleCategoryChange = (value) => {
    setCategory(value);

    if (value === 'All') {
      navigate('/explore');
    } else {
      navigate(`/explore?category=${value}`);
    }
  };

  return (
    <>
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="input-group mb-3">

                {/* CATEGORY SELECT */}
                <select
                  className="form-select mt-2"
                  style={{ maxWidth: '160px' }}
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Biryani">Biryani</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Burger">Burger</option>
                  <option value="Ice Cream">Ice Cream</option>
                  <option value="Rolls">Rolls</option>
                  <option value="Salad">Salad</option>
                  <option value="Cake">Cake</option>
                  <option value="Fish">Fish</option>
                  <option value="Chips">Chips</option>
                  <option value="Samosa">Samosa</option>
                </select>

                {/* SEARCH */}
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Discover your favorite recipe…"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />

                <button className="btn mt-2 btn-tt" type="submit">
                  <i className="bi bi-search"></i>
                </button>

              </div>
            </form>
          </div>
        </div>
      </div>

      {/* FOOD LIST */}
      <FoodDisplay category={category} searchText={searchText} />
    </>
  );
};

export default Explore;
