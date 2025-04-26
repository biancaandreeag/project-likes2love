from shared_utils.logger_config  import log
import time 

def detect_platform(url: str) -> str:
    url = url.lower()
    if "facebook.com" in url:
        return "Facebook"
    elif "tiktok.com" in url:
        return "TikTok"
    else:
        return "Unknown"

def run(url: str, uuid: str):
    platform = detect_platform(url)
    if(platform == "Tiktok" ):
        log.info(f"[ SCRAPER - {uuid} ][ Beginning scraping on {platform} social-media platform... ]")

    if(platform == "Facebook" ):
        log.info(f"[ SCRAPER - {uuid} ][ Beginning scraping on {platform} social-media platform... ]")
