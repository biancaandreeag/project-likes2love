export function createSlug(text) {
  if (!text) return "untitled"

  return (
    text
      .toLowerCase()
      .trim()
      // Înlocuiește caracterele speciale cu spații
      .replace(/[^\w\s-]/g, " ")
      // Înlocuiește spațiile multiple cu unul singur
      .replace(/\s+/g, " ")
      // Înlocuiește spațiile cu liniuțe
      .replace(/\s/g, "-")
      // Elimină liniuțele multiple
      .replace(/-+/g, "-")
      // Elimină liniuțele de la început și sfârșit
      .replace(/^-+|-+$/g, "")
      // Limitează lungimea
      .substring(0, 50)
  )
}


export function createDateSlug(isoDate) {
  if (!isoDate) return "no-date"

  try {
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) return "invalid-date"

    // Format: YYYY-MM-DD-HH-MM
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${year}-${month}-${day}-${hours}-${minutes}`
  } catch (error) {
    console.error("Error creating date slug:", error)
    return "invalid-date"
  }
}


export function generateDashboardUrl(postName, postLink, analysisDate) {
  const postSlug = createSlug(postName || postLink)
  const dateSlug = createDateSlug(analysisDate)

  return `/analysis/${postSlug}&&${dateSlug}`
}


export function parseCombinedSlug(combinedSlug) {
  if (!combinedSlug) {
    return { postSlug: null, dateSlug: null }
  }

  // Împarte slug-ul combinat folosind separatorul &&
  const parts = combinedSlug.split("&&")

  if (parts.length !== 2) {
    console.error("Invalid combined slug format:", combinedSlug)
    return { postSlug: null, dateSlug: null }
  }

  return {
    postSlug: parts[0],
    dateSlug: parts[1],
  }
}

export function parseSlugInfo(postSlug, dateSlug) {
  const readablePost = postSlug ? postSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Untitled"

  let parsedDate = null
  if (dateSlug && dateSlug !== "no-date" && dateSlug !== "invalid-date") {
    try {
      const parts = dateSlug.split("-")
      if (parts.length >= 5) {
        const [year, month, day, hours, minutes] = parts
        parsedDate = new Date(
          Number.parseInt(year),
          Number.parseInt(month) - 1,
          Number.parseInt(day),
          Number.parseInt(hours),
          Number.parseInt(minutes),
        )
      }
    } catch (error) {
      console.error("Error parsing date slug:", error)
    }
  }

  return {
    readablePost,
    parsedDate,
  }
}
