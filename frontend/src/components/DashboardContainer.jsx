"use client"

import { useState, useEffect } from "react"
import "../styles/DashboardContainer.css"
import "../styles/pdfExport.css"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from "recharts"
import { exportDashboardToPDF, exportAnalysisDataToPDF } from "../utils/pdfExport"

const DashboardContainer = ({ analysis, postLink, onBackToAnalysis }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [generalAnalysis, setGeneralAnalysis] = useState(null)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Adaugă debugging pentru a vedea ce primește componenta
  console.log("🔍 DashboardContainer props:", { analysis, postLink })
  console.log("📊 Analysis data structure:", analysis)

  // Extrage analiza de tip general_analysis din array
  useEffect(() => {
    if (analysis) {
      // Dacă analysis este array, caută general_analysis
      if (Array.isArray(analysis)) {
        const foundAnalysis = analysis.find((item) => item.type === "general_analysis")
        console.log("🔍 Found general_analysis in array:", foundAnalysis)
        setGeneralAnalysis(foundAnalysis)
      }
      // Dacă analysis este direct obiectul cu type general_analysis
      else if (analysis.type === "general_analysis") {
        console.log("🔍 Analysis is already general_analysis object")
        setGeneralAnalysis(analysis)
      }
      // Altfel, nu avem analiza potrivită
      else {
        console.log("❌ No general_analysis found in data")
        setGeneralAnalysis(null)
      }
    }
  }, [analysis])

  const handleNewAnalysis = () => {
    if (onBackToAnalysis) {
      onBackToAnalysis()
    }
  }

  const handleExportPDF = async (type = "full") => {
    setShowExportMenu(false)

    // Extrage informații pentru export
    const postTitle = extractTikTokInfo(postLink).username
      ? `@${extractTikTokInfo(postLink).username}'s TikTok Post`
      : "Social Media Analysis"

    const platform = postLink.includes("tiktok.com")
      ? "TikTok"
      : postLink.includes("facebook.com")
        ? "Facebook"
        : "Unknown"

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    const filename = `analysis-${platform.toLowerCase()}-${timestamp}.pdf`

    try {
      if (type === "full") {
        // Export complet cu screenshot
        await exportDashboardToPDF({
          filename,
          postTitle,
          postLink,
          platform,
          analysisData: generalAnalysis,
        })
      } else if (type === "data") {
        // Export doar cu datele
        await exportAnalysisDataToPDF(generalAnalysis, {
          title: postTitle,
          platform,
          link: postLink,
        })
      }
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  // Placeholder data pentru engagement metrics - momentan toate sunt "-"
  const engagementMetrics = {
    likes: "-",
    comments: "-",
    shares: "-",
    saves: "-",
  }

  // Extrage username și video ID din URL-ul TikTok
  const extractTikTokInfo = (url) => {
    try {
      if (url && url.includes("tiktok.com")) {
        const regex = /@([^/]+)\/video\/(\d+)/
        const match = url.match(regex)
        if (match && match.length >= 3) {
          return {
            username: match[1],
            videoId: match[2],
          }
        }
      }
      return { username: null, videoId: null }
    } catch (error) {
      console.error("Error extracting TikTok info:", error)
      return { username: null, videoId: null }
    }
  }

  const { username, videoId } = extractTikTokInfo(postLink)

  const hasAnalysisData =
    generalAnalysis &&
    generalAnalysis.result &&
    generalAnalysis.result.percent_counts &&
    generalAnalysis.result.average_scores

  console.log("✅ hasAnalysisData:", hasAnalysisData)

  if (hasAnalysisData) {
    console.log("📈 Percent counts:", generalAnalysis.result.percent_counts)
    console.log("📊 Average scores:", generalAnalysis.result.average_scores)
  }

  // Pregătim datele pentru barchart - REORDONAT: Positive, Neutral, Negative
  const prepareChartData = () => {
    if (!hasAnalysisData) {
      console.log("❌ No analysis data available for chart")
      return []
    }

    const { percent_counts, average_scores } = generalAnalysis.result

    const chartData = [
      {
        name: "Positive",
        value: percent_counts.positive || 0,
        averageScore: average_scores.positive || 0,
        color: "#59CD90",
        emoji: "😊",
        icon: (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <circle cx="12" cy="12" r="10" fill="#59CD90" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="9" cy="9" r="1" fill="white" />
            <circle cx="15" cy="9" r="1" fill="white" />
          </svg>
        ),
      },
      {
        name: "Neutral",
        value: percent_counts.neutral || 0,
        averageScore: average_scores.neutral || 0,
        color: "#FFD93D",
        emoji: "😐",
        icon: (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <circle cx="12" cy="12" r="10" fill="#FFD93D" />
            <line x1="8" y1="14" x2="16" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="9" r="1" fill="white" />
            <circle cx="15" cy="9" r="1" fill="white" />
          </svg>
        ),
      },
      {
        name: "Negative",
        value: percent_counts.negative || 0,
        averageScore: average_scores.negative || 0,
        color: "#FF6B6B",
        emoji: "😢",
        icon: (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <circle cx="12" cy="12" r="10" fill="#FF6B6B" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="9" cy="9" r="1" fill="white" />
            <circle cx="15" cy="9" r="1" fill="white" />
          </svg>
        ),
      },
    ]

    console.log("📊 Chart data prepared:", chartData)
    return chartData
  }

  const chartData = prepareChartData()

  return (
    <div className="dashboard-container">
      {/* Butonul New Analysis în dreapta sus */}
      <div className="new-analysis-button-container">
        {/* Buton Export PDF */}
        <div style={{ position: "relative", marginRight: "10px" }}>
          <button className="new-analysis-button" onClick={() => setShowExportMenu(!showExportMenu)} title="Export PDF">
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>

          {/* Export Menu */}
          {showExportMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                padding: "8px 0",
                minWidth: "180px",
                zIndex: 1000,
                marginTop: "5px",
              }}
            >
              <button
                onClick={() => handleExportPDF("full")}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "10px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21,15 16,10 5,21"></polyline>
                </svg>
                Full Dashboard
              </button>
              <button
                onClick={() => handleExportPDF("data")}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "10px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                Data Only
              </button>
            </div>
          )}
        </div>

        <button
          className="new-analysis-button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={handleNewAnalysis}
        >
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          {showTooltip && <span className="tooltip">New analysis</span>}
        </button>
      </div>

      {/* Dashboard header */}
      <div className="dashboard-header">
        <div className="dashboard-title-wrapper">
          <div className="dashboard-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#dashboard-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="dashboard-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                  <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
        </div>
      </div>

      {/* Info simplificată despre post cu engagement metrics */}
      {postLink && (
        <div className="current-analysis">
          <div className="tiktok-post-container">
            <div className="tiktok-post-info">
              {username && (
                <div className="tiktok-username">
                  <svg viewBox="0 0 24 24" width="20" height="20" className="tiktok-logo-icon">
                    <defs>
                      <linearGradient id="tiktok-username-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                        <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"
                      fill="url(#tiktok-username-gradient)"
                    />
                  </svg>
                  <span className="username-text">@{username}'s post</span>
                </div>
              )}
              <div className="url-display">{postLink}</div>
            </div>

            {/* TikTok-style engagement metrics cu gradient - redesigned */}
            <div className="engagement-metrics-container">
              <div className="engagement-metrics">
                <div className="metric-item">
                  <svg className="metric-icon gradient-icon" viewBox="0 0 24 24" width="20" height="20">
                    <defs>
                      <linearGradient id="like-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                        <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      fill="url(#like-gradient)"
                    />
                  </svg>
                  <span className="metric-count">{engagementMetrics.likes}</span>
                </div>

                <div className="metric-item">
                  <svg className="metric-icon gradient-icon" viewBox="0 0 24 24" width="20" height="20">
                    <defs>
                      <linearGradient id="comment-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                        <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                      fill="none"
                      stroke="url(#comment-gradient)"
                      strokeWidth="2"
                    />
                  </svg>
                  <span className="metric-count">{engagementMetrics.comments}</span>
                </div>

                <div className="metric-item">
                  <svg className="metric-icon gradient-icon" viewBox="0 0 24 24" width="20" height="20">
                    <defs>
                      <linearGradient id="share-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                        <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
                      fill="none"
                      stroke="url(#share-gradient)"
                      strokeWidth="2"
                    />
                    <polyline points="16,6 12,2 8,6" fill="none" stroke="url(#share-gradient)" strokeWidth="2" />
                    <line x1="12" y1="2" x2="12" y2="15" stroke="url(#share-gradient)" strokeWidth="2" />
                  </svg>
                  <span className="metric-count">{engagementMetrics.shares}</span>
                </div>

                <div className="metric-item">
                  <svg className="metric-icon gradient-icon" viewBox="0 0 24 24" width="20" height="20">
                    <defs>
                      <linearGradient id="save-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                        <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                      fill="none"
                      stroke="url(#save-gradient)"
                      strokeWidth="2"
                    />
                  </svg>
                  <span className="metric-count">{engagementMetrics.saves}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conținutul dashboard-ului cu barchart și average scores */}
      <div className="dashboard-content">
        {hasAnalysisData ? (
          <div className="current-analysis">
            <div className="sentiment-analysis-container">
              <div className="chart-container">
                <div className="section-title-container">
                  <div className="section-title-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="url(#title-icon-gradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <defs>
                        <linearGradient id="title-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                          <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                        </linearGradient>
                      </defs>
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </div>
                  <h4 className="section-title">COMMENTS DISTRIBUTION</h4>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList dataKey="value" position="right" formatter={(value) => `${value}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="average-scores-container">
                <div className="section-title-container-simple">
                  <h4 className="section-title-simple">SENTIMENT STRENGTH</h4>
                </div>
                {chartData.map((item, index) => (
                  <div key={index} className="score-item">
                    <div className="score-icon-container">{item.icon}</div>
                    <div className="score-value" style={{ color: item.color }}>
                      {item.averageScore.toFixed(1)} %
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="current-analysis">
            <div
              style={{
                background: "linear-gradient(to right, rgba(63, 94, 251, 0.05), rgba(252, 70, 107, 0.05))",
                border: "1px solid rgba(63, 94, 251, 0.1)",
                borderRadius: "10px",
                padding: "15px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                textAlign: "center",
                color: "rgba(0, 0, 0, 0.6)",
              }}
            >
              <p>No sentiment analysis data available</p>
              <p style={{ fontSize: "0.8rem", marginTop: "10px" }}>
                Debug: hasAnalysisData = {hasAnalysisData ? "true" : "false"}
              </p>
              <p style={{ fontSize: "0.7rem", marginTop: "5px" }}>
                Analysis is array: {Array.isArray(analysis) ? "true" : "false"}
              </p>
              <p style={{ fontSize: "0.7rem", marginTop: "5px" }}>
                Found general_analysis: {generalAnalysis ? "true" : "false"}
              </p>
              <p style={{ fontSize: "0.7rem", marginTop: "5px" }}>
                Analysis types: {Array.isArray(analysis) ? analysis.map((a) => a.type).join(", ") : "N/A"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardContainer
