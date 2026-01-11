import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Headers.css';

// Images from assets/header folder
import img1 from '../../assets/header/1.png';
import img2 from '../../assets/header/2.png';
import img3 from '../../assets/header/3.png';
import img4 from '../../assets/header/4.png';
import img5 from '../../assets/header/5.png';

const slides = [
  {
    image: img1,
    title: "Order your favorite 🍕",
    subtitle: "Enjoy delicious meals delivered straight to your doorstep. Fresh, hot, and ready to satisfy your cravings every time! 🍴"
  },
  {
    image: img2,
    title: "Taste the best 🍔",
    subtitle: "Savor mouth-watering burgers and snacks prepared with love and served fast. Happiness in every bite! 😋"
  },
  {
    image: img3,
    title: "Satisfy your cravings 🍣",
    subtitle: "Healthy, fresh, and flavorful meals that make every mealtime an experience to remember. 🥗"
  },
  {
    image: img4,
    title: "Enjoy every bite 🍰",
    subtitle: "Indulge in sweet desserts and treats that bring joy to your day. Perfect for you or to share! 🎂"
  },
  {
    image: img5,
    title: "Your food, your way 🍜",
    subtitle: "Order anytime, anywhere, and enjoy food exactly how you like it. Convenience meets taste! 🕒"
  }
];

const Header = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      {/* Background image */}
      <div 
        className="header-bg" 
        style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
      ></div>

      {/* Dark overlay on top of image */}
      <div className="header-dark-overlay"></div>

      {/* Text content */}
      <div className="header-content">
        <h1>{slides[currentSlide].title}</h1>
        <p>{slides[currentSlide].subtitle}</p>
        <Link to="/explore" className="btn-primary">Order Now</Link>
      </div>
    </header>
  );
}

export default Header;
