import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/Home.css"
import Navbar from "../components/Navbar"

function Home() {
  const navigate = useNavigate()
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      const elements = document.querySelectorAll(".animate-element")
      elements.forEach((el) => {
        el.classList.add("visible")
      })
    }, 100)
  }, [])

  const handleFlip = () => {
    const elements = document.querySelectorAll(".animate-element")
    elements.forEach((el) => {
      el.classList.remove("visible")
    })

    setIsFlipped(!isFlipped)

    setTimeout(() => {
      elements.forEach((el) => {
        el.classList.add("visible")
      })
    }, 100)
  }

  const handleFindMore = () => {
    navigate("/find-more")
  }

  return (
    <div className="home-container">
      <Navbar isFlipped={isFlipped} />

      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src="/videos/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="overlay"></div>
      </div>

      <div className={`split-layout ${isFlipped ? "flipped" : ""}`}>

        <div className={`panel left-panel ${isFlipped ? "right-position" : "left-position"}`}>
          <div className={`content ${isFlipped ? "content-right" : ""}`}>
            <div className="title-logo animate-element">
              <img
                src="/logo_full.png"
                alt="likes2love"
                className="logo-image"
              />
            </div>

            <p className="subtitle animate-element">AI-powered protection against cyberbullying</p>

            <p className="home-description animate-element">
              Our platform uses advanced natural language processing and machine learning to identify and prevent
              cyberbullying in real time.
            </p>

            <button className="cta-button animate-element" onClick={handleFindMore}>
              FIND MORE
              <span className="arrow">→</span>
            </button>
          </div>
        </div>

        <div className={`panel right-panel ${isFlipped ? "left-position" : "right-position"}`}>
          {isFlipped && (
            <div className="content content-right">
              <div className="title-logo animate-element">
                <img
                  src="/logo_full.png"
                  alt="likes2love"
                  className="logo-image"
                />
              </div>

              <p className="subtitle animate-element">AI-powered protection against cyberbullying</p>

              <p className="home-description animate-element">
                Our platform uses advanced natural language processing and machine learning to identify and prevent
                cyberbullying in real time.
              </p>

              <button className="cta-button animate-element" onClick={handleFindMore}>
                FIND MORE
                <span className="arrow">→</span>
              </button>
            </div>
          )}
        </div>

        <button
          className={`toggle-arrow ${isFlipped ? "flipped" : ""}`}
          onClick={handleFlip}
          aria-label="Toggle panels"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13 6L19 12L13 18"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 6L11 12L5 18"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Home
