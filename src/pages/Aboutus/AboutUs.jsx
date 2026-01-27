import React from 'react';
import './AboutUs.css';
import aboutImage from './../../assets/about.png';

const AboutUs = () => {
  return (
    <div className="about-wrapper">
      <div className="about-card">
        <div className="about-content">
          {/* Left Text */}
          <div className="about-text">
            <h1 className="title">About Me</h1>

            <p>
              Hi! I'm <strong>Awais Farman</strong>, a Full-Stack Java Developer specializing in modern web technologies, microservices, and AI solutions.
            </p>

            <h2 className="subtitle">Skills</h2>
            <div className="skills-list">
              <span className="skill">Java</span>
              <span className="skill">Spring Boot</span>
              <span className="skill">Microservices</span>
              <span className="skill">Monolithic</span>
              <span className="skill">Docker & Kubernetes</span>
              <span className="skill">React & Redux</span>
              <span className="skill">Vite</span>
              <span className="skill">Vue</span>
              <span className="skill">Next Js</span>
              <span className="skill">PostgreSQL & MongoDB & MySQL</span>
              <span className="skill">REST APIs</span>
              <span className="skill">Kafka & Rabbit MQ</span>
              <span className="skill">CI/CD</span>
              <span className="skill">AWS & Digtal Occean & Azure & Google Cloud Basic </span>
              <span className="skill">Canva</span>
              <span className="skill">AI</span>
              <span className="skill">Figma</span>
              <span className="skill">And More than etc</span>
            </div>

            <h2 className="subtitle">Connect</h2>
            <div className="social-buttons">
              <a
                href="https://www.linkedin.com/in/awais-farman/"
                target="_blank"
                rel="noopener noreferrer"
                className="linkedin-button"
              >
                LinkedIn
              </a>
            </div>

            <h2 className="subtitle">Contact</h2>
            <p>
              Reach me at <a href="mailto:awaisfarman2222@gmail.com">awaisfarman2222@gmail.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
