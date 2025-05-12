"use client"
import { useState, useEffect } from "react"
import "../styles/HistoryContainer.css"
import HistoryItem from "./HistoryItem"

function HistoryContainer() {
  // Starea pentru expandare
  const [isExpanded, setIsExpanded] = useState(false)
  // Starea pentru vizibilitatea overlay-ului
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  // Stare pentru căutare
  const [searchQuery, setSearchQuery] = useState("")
  // Stare pentru filtre
  const [selectedModel, setSelectedModel] = useState("All")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Exemplu de date pentru istoric
  const historyItems = [
    { id: 1, title: "Facebook Post Analysis", date: "12 May 2025", model: "RoBERTa" },
    { id: 2, title: "TikTok Video Comments", date: "10 May 2025", model: "BERT" },
    { id: 3, title: "Facebook Group Discussion", date: "5 May 2025", model: "GPT" },
    { id: 4, title: "Instagram Post Review", date: "1 May 2025", model: "RandomForest" },
    { id: 5, title: "Twitter Thread Analysis", date: "28 Apr 2025", model: "RoBERTa" },
  ]

  // Filtrarea elementelor din istoric
  const filteredItems = historyItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesModel = selectedModel === "All" || item.model === selectedModel

    // Filtrare după dată
    let matchesDate = true
    if (startDate || endDate) {
      const itemDate = new Date(item.date)
      if (startDate && new Date(startDate) > itemDate) matchesDate = false
      if (endDate && new Date(endDate) < itemDate) matchesDate = false
    }

    return matchesSearch && matchesModel && matchesDate
  })

  // Funcție pentru a comuta starea de expandare
  const toggleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true)
      document.body.style.overflow = "hidden"
      // Adăugăm un mic delay pentru a permite tranziția overlay-ului
      setTimeout(() => {
        setIsOverlayVisible(true)
      }, 50)
    } else {
      setIsOverlayVisible(false)
      // Așteptăm să se termine tranziția overlay-ului înainte de a închide containerul
      setTimeout(() => {
        setIsExpanded(false)
        document.body.style.overflow = ""
      }, 300)
    }
  }

  // Curățare la demontare
  useEffect(() => {
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  // Extrage modelele unice pentru filtru
  const uniqueModels = ["All", ...new Set(historyItems.map((item) => item.model))]

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedModel("All")
    setStartDate("")
    setEndDate("")
  }

  return (
    <>
      <div className={`history-container ${isExpanded ? "expanded" : ""}`}>
        <div className="history-header">
          <div className="history-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="history-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                  <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                </linearGradient>
              </defs>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h2 className="history-title">History</h2>

          <button className="expand-button" onClick={toggleExpand} aria-label={isExpanded ? "Collapse" : "Expand"} />

          <div className="history-divider"></div>
        </div>

        <div className="history-content">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search for post..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {isExpanded && (
            <div className="filters-container">
              <div className="filter-group">
                <label>Model:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="filter-select"
                >
                  {uniqueModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
              </div>

              <div className="filter-group">
                <label>To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
              </div>

              <button className="clear-filters-button" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}

          {isExpanded && (
            <div className="table-header">
              <div>Name</div>
              <div>Model</div>
              <div>Date</div>
              <div>Actions</div>
            </div>
          )}

          <div className="history-items">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <HistoryItem
                  key={item.id}
                  title={item.title}
                  date={item.date}
                  model={item.model}
                  isExpanded={isExpanded}
                  onRename={() => console.log('Rename:', item.id)}
                  onExport={() => console.log('Export:', item.id)}
                  onDelete={() => console.log('Delete:', item.id)}
                />
              ))
            ) : (
              <p className="empty-history">No matching history items found.</p>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div
          className={`history-overlay ${isOverlayVisible ? "visible" : ""}`}
          onClick={toggleExpand}
        />
      )}
    </>
  )
}

export default HistoryContainer