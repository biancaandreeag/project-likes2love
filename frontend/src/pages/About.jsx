"use client"

import { useState, useEffect } from "react"
import { useForm, ValidationError } from "@formspree/react"
import "../styles/About.css"
import Navbar from "../components/Navbar"

function About() {
  const [state, handleSubmit] = useForm("xyzjzapv")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  useEffect(() => {
    setTimeout(() => {
      const elements = document.querySelectorAll(".animate-element")
      elements.forEach((el) => {
        el.classList.add("visible")
      })
    }, 100)
  }, [])

  useEffect(() => {
    if (state.succeeded) {
      setFormData({ name: "", email: "", subject: "", message: "" })
    }
  }, [state.succeeded])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="about-container">
      <Navbar isFlipped={false} />

      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src="/videos/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="overlay"></div>
      </div>

      <div className="about-content">
        <div className="about-header animate-element">
          <h1>About Our AI Models</h1>
          <p className="subtitle">Understanding the technology behind cyberbullying detection</p>
        </div>

        <div className="about-section animate-element">
          <h2>Our Approach</h2>
          <p>
            At likes2love, we use advanced natural language processing and machine learning techniques to identify and
            prevent cyberbullying in real-time. Our multi-model approach allows us to analyze content across different
            platforms with high accuracy and contextual understanding.
          </p>
        </div>

        <div className="models-section animate-element">
          <h2>AI Models We Use</h2>

          <div className="model-card">
            <div className="model-header">
              <h3>RoBERTa</h3>
              <div className="model-tag">Primary Model</div>
            </div>
            <p>
              RoBERTa (Robustly Optimized BERT Pretraining Approach) is our primary model for content analysis. It's a
              transformer-based model that builds on BERT's architecture with modified key hyperparameters and training
              methodology. RoBERTa excels at understanding context and nuance in language, making it particularly
              effective at detecting subtle forms of cyberbullying.
            </p>
            <div className="model-features">
              <div className="feature">
                <span className="feature-highlight">90%+</span> accuracy in detecting harmful content
              </div>
              <div className="feature">
                <span className="feature-highlight">Contextual</span> understanding of language
              </div>
              <div className="feature">
                <span className="feature-highlight">Multi-lingual</span> support
              </div>
            </div>
          </div>

          <div className="model-card">
            <div className="model-header">
              <h3>BERT</h3>
              <div className="model-tag">Supporting Model</div>
            </div>
            <p>
              BERT (Bidirectional Encoder Representations from Transformers) provides deep bidirectional representations
              from unlabeled text. We use BERT as a supporting model to enhance our understanding of context and
              relationships between words in analyzed content. BERT's pre-training on a large corpus of text helps it
              understand language patterns that may indicate bullying behavior.
            </p>
            <div className="model-features">
              <div className="feature">
                <span className="feature-highlight">Bidirectional</span> context analysis
              </div>
              <div className="feature">
                <span className="feature-highlight">110M+</span> parameters for deep learning
              </div>
              <div className="feature">
                <span className="feature-highlight">Efficient</span> processing of short texts
              </div>
            </div>
          </div>

          <div className="model-card">
            <div className="model-header">
              <h3>GPT</h3>
              <div className="model-tag">Content Analysis</div>
            </div>
            <p>
              We leverage GPT (Generative Pre-trained Transformer) models for deeper content analysis and understanding
              of complex linguistic patterns. GPT's strength in generating human-like text helps us understand context
              and intent behind messages, allowing for more nuanced detection of cyberbullying that might evade simpler
              pattern-matching approaches.
            </p>
            <div className="model-features">
              <div className="feature">
                <span className="feature-highlight">Advanced</span> context comprehension
              </div>
              <div className="feature">
                <span className="feature-highlight">Nuanced</span> intent detection
              </div>
              <div className="feature">
                <span className="feature-highlight">Adaptive</span> to evolving language patterns
              </div>
            </div>
          </div>

          <div className="model-card">
            <div className="model-header">
              <h3>RandomForest</h3>
              <div className="model-tag">Classification</div>
            </div>
            <p>
              RandomForest is an ensemble learning method that operates by constructing multiple decision trees. We use
              RandomForest for its robustness in classification tasks, particularly for categorizing different types of
              harmful content. Its ability to handle large feature sets and resistance to overfitting makes it valuable
              for reliable content classification.
            </p>
            <div className="model-features">
              <div className="feature">
                <span className="feature-highlight">Ensemble</span> learning approach
              </div>
              <div className="feature">
                <span className="feature-highlight">Robust</span> against overfitting
              </div>
              <div className="feature">
                <span className="feature-highlight">Effective</span> with high-dimensional data
              </div>
            </div>
          </div>
        </div>

        <div className="classification-section animate-element">
          <h2>Multi-Label Classification</h2>
          <p>
            Our platform employs multi-label classification techniques to identify multiple types of harmful content
            simultaneously. Unlike traditional binary classification that simply identifies content as "harmful" or
            "safe," our approach can detect and categorize multiple forms of cyberbullying in a single piece of content.
          </p>

          <div className="classification-diagram">
            <div className="diagram-header">
              <div className="diagram-title">Multi-Label Classification Process</div>
            </div>
            <div className="diagram-content">
              <div className="diagram-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Text Preprocessing</h4>
                  <p>Content is cleaned, tokenized, and prepared for analysis</p>
                </div>
              </div>
              <div className="diagram-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Feature Extraction</h4>
                  <p>Key linguistic features are identified and extracted</p>
                </div>
              </div>
              <div className="diagram-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Multi-Model Analysis</h4>
                  <p>Content is analyzed by multiple AI models in parallel</p>
                </div>
              </div>
              <div className="diagram-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Label Assignment</h4>
                  <p>Multiple relevant labels are assigned to the content</p>
                </div>
              </div>
              <div className="diagram-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h4>Confidence Scoring</h4>
                  <p>Each label receives a confidence score for transparency</p>
                </div>
              </div>
            </div>
          </div>

          <div className="classification-types">
            <h3>Types of Harmful Content We Detect</h3>
            <div className="types-grid">
              <div className="type-item">
                <div className="type-icon">🔤</div>
                <div className="type-name">Verbal Abuse</div>
              </div>
              <div className="type-item">
                <div className="type-icon">👤</div>
                <div className="type-name">Identity-Based Harassment</div>
              </div>
              <div className="type-item">
                <div className="type-icon">🔄</div>
                <div className="type-name">Repeated Targeting</div>
              </div>
              <div className="type-item">
                <div className="type-icon">⚠️</div>
                <div className="type-name">Threats</div>
              </div>
              <div className="type-item">
                <div className="type-icon">🔍</div>
                <div className="type-name">Doxxing</div>
              </div>
              <div className="type-item">
                <div className="type-icon">📢</div>
                <div className="type-name">Public Shaming</div>
              </div>
              <div className="type-item">
                <div className="type-icon">🎭</div>
                <div className="type-name">Impersonation</div>
              </div>
              <div className="type-item">
                <div className="type-icon">🔗</div>
                <div className="type-name">Unwanted Sexual Content</div>
              </div>
            </div>
          </div>
        </div>

        <div className="technology-section animate-element">
          <h2>Our Technology Stack</h2>
          <p>
            Our platform combines cutting-edge AI technologies with robust web development frameworks to deliver a
            seamless, responsive experience for users while providing powerful cyberbullying detection capabilities.
          </p>

          <div className="tech-stack">
            <div className="tech-category">
              <h3>AI & Machine Learning</h3>
              <div className="tech-items">
                <div className="tech-item">PyTorch</div>
                <div className="tech-item">TensorFlow</div>
                <div className="tech-item">Hugging Face Transformers</div>
                <div className="tech-item">scikit-learn</div>
              </div>
            </div>

            <div className="tech-category">
              <h3>Frontend</h3>
              <div className="tech-items">
                <div className="tech-item">React</div>
                <div className="tech-item">CSS3</div>
                <div className="tech-item">JavaScript</div>
              </div>
            </div>

            <div className="tech-category">
              <h3>Backend</h3>
              <div className="tech-items">
                <div className="tech-item">Node.js</div>
                <div className="tech-item">Express</div>
                <div className="tech-item">MongoDB</div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTACT SECTION - FORMSPREE INTEGRATION */}
        <div className="contact-section animate-element">
          <h2>Get In Touch</h2>
          <p>
            Have questions about our AI models or want to collaborate? We'd love to hear from you. Reach out to our team
            and we'll get back to you as soon as possible.
          </p>

          <div className="contact-container">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="contact-details">
                  <h4>Email Us</h4>
                  <p>contact@likes2love.com</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                </div>
                <div className="contact-details">
                  <h4>Response Time</h4>
                  <p>Within 24 hours</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="contact-details">
                  <h4>Location</h4>
                  <p>Bucharest, Romania</p>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit} method="POST">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your full name"
                  />
                  <ValidationError prefix="Name" field="name" errors={state.errors} />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your.email@example.com"
                  />
                  <ValidationError prefix="Email" field="email" errors={state.errors} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required>
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="collaboration">Research Collaboration</option>
                  <option value="technical">Technical Support</option>
                </select>
                <ValidationError prefix="Subject" field="subject" errors={state.errors} />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="Tell us about your inquiry, project, or how we can help you..."
                ></textarea>
                <ValidationError prefix="Message" field="message" errors={state.errors} />
              </div>

              <button
                type="submit"
                className={`submit-button ${state.submitting ? "submitting" : ""}`}
                disabled={state.submitting}
              >
                {state.submitting ? (
                  <>
                    <div className="spinner"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22,2 15,22 11,13 2,9"></polygon>
                    </svg>
                    Send Message
                  </>
                )}
              </button>

              {state.succeeded && (
                <div className="status-message success">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}

              {state.errors && state.errors.length > 0 && (
                <div className="status-message error">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  Sorry, there was an error sending your message. Please try again or contact us directly.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
