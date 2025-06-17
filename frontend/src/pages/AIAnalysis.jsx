import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import HistoryContainer from "../components/HistoryContainer"
import AnalysisContainer from "../components/AnalysisContainer"
import DashboardContainer from "../components/DashboardContainer"
import { parseCombinedSlug } from "../utils/slugUtils"
import "../styles/AIAnalysis.css"

function AIAnalysis({ initialPostUrl, combinedSlug }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [currentPostLink, setCurrentPostLink] = useState(null)
  const [postInfo, setPostInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const params = useParams()
  const historyRef = useRef()

  useEffect(() => {
    const postUrl = initialPostUrl || params.postUrl
    if (params.combinedSlug) {
      const { postSlug, dateSlug } = parseCombinedSlug(params.combinedSlug)
      if (postSlug && dateSlug) {
        console.log("URL parameters detected:", { postSlug, dateSlug })
      }
    } else if (postUrl) {
      setShowDashboard(true)
    }
    setTimeout(() => setIsLoaded(true), 100)
  }, [initialPostUrl, params.postUrl, params.combinedSlug])

  const fetchPostInfo = async (postLink, analysisDateString) => {
    try {
      setLoading(true)
      setError(null)

      const isoDate = new Date(analysisDateString).toISOString()
      const params = new URLSearchParams({ post_link: postLink, analysis_date: isoDate })

      const response = await fetch(`http://localhost:8000/post-info?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      if (data.status !== "found") throw new Error("Post not found")

      setCurrentAnalysis(data.analysis)
      setCurrentPostLink(postLink)
      setPostInfo({
        likes: data.post_info?.post_likes ?? "-",
        comments: data.post_info?.post_no_comments ?? "-",
        saves: data.post_info?.post_saved ?? "-",
        shares: data.post_info?.post_distribution ?? "-",
      })
      setShowDashboard(true)
    } catch (error) {
      console.error("Error fetching post info:", error)
      setError(`Failed to load: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleHistoryItemClick = (item) => {
    fetchPostInfo(item.post_link, item.analysis_date)
  }

  const handleShowDashboard = (postLink, analysis, postInfoData = null) => {
    setCurrentAnalysis(analysis)
    setCurrentPostLink(postLink)
    setPostInfo(postInfoData)
    setShowDashboard(true)
    historyRef.current?.refreshHistory?.()
  }

  const handleBackToAnalysis = () => {
    setShowDashboard(false)
    setCurrentAnalysis(null)
    setCurrentPostLink(null)
    setPostInfo(null)
    setError(null)
    setLoading(false)
    navigate("/ai-analysis")
  }

  return (
    <div className="ai-analysis-container">
      <Navbar isFlipped={false} />
      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src="/videos/background.mp4" type="video/mp4" />
        </video>
        <div className="overlay"></div>
      </div>

      <div className={`ai-analysis-content ${isLoaded ? "visible" : ""}`}>
        <div className="analysis-layout">
          {!combinedSlug && (
            <div id="history-column" className="history-column">
              <HistoryContainer ref={historyRef} onItemClick={handleHistoryItemClick} />
            </div>
          )}

          <div id="main-column" className="main-column" style={combinedSlug ? { width: "100%", maxWidth: "1200px", margin: "0 auto" } : {}}>
            {loading ? (
              <div className="loading-container" style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #667eea", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }}></div>
                <h3>Loading Analysis...</h3>
                <p>Fetching existing analysis from database...</p>
              </div>
            ) : error ? (
              <div className="error-container" style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ background: "#ffebee", border: "1px solid #f44336", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
                  <h3 style={{ color: "#c62828", margin: "0 0 10px 0" }}>❌ Error</h3>
                  <p style={{ color: "#d32f2f", margin: "0" }}>{error}</p>
                </div>
                <button onClick={handleBackToAnalysis} style={{ background: "#757575", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer" }}>← Back to Analysis</button>
              </div>
            ) : showDashboard ? (
              <DashboardContainer
                analysis={currentAnalysis}
                postLink={currentPostLink}
                postInfo={postInfo}
                onBackToAnalysis={handleBackToAnalysis}
              />
            ) : (
              <AnalysisContainer onShowDashboard={handleShowDashboard} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAnalysis
