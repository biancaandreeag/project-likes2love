from Tiktok.initialize_session import InitializeSession
from shared_utils.logger_config import log
from Tiktok.scraper import TiktokScraper
import time 

def runTiktok(post_url,uuid,analysis_date):
    session = InitializeSession(uuid) 
    scraper = TiktokScraper(session.driver,uuid,analysis_date)

    try:
        start_time = time.time()  
        scraper.navigate(post_url)
        end_time = time.time() 
        duration = end_time - start_time
        log.info(f"[ TIKTOK-MAIN - {uuid} ] [ Duration: {duration:.2f} seconds ]")
        
    except Exception as e:
        log.error(f"[ TIKTOK-MAIN ] [ An error occurred: {e} ]")
        print(f"An error occurred: {e}")
    finally:
        log.info(f"[ TIKTOK-MAIN - {uuid} ] [ Closing the application. ]")
        try:
            session.quit()  
        except Exception as e:
            log.error(f"[ TIKTOK-MAIN ] [ Error closing the driver: {e} ]")


