from shared_utils.kafka_producer import send_to_preprocessor,send_to_scraper
from database.schemas import list_serial, individual_serial
from database.database import posts_collection
from fastapi import APIRouter, HTTPException 
from  shared_utils.logger_config import log
from database.posts import Post
from fastapi import Cookie
from jose import jwt, JWTError
from dotenv import load_dotenv
from pydantic import BaseModel
import os

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

router = APIRouter()

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["uuid"]
    except JWTError:
        return None

def get_uuid_from_token(auth_token: str = Cookie(None)):
    if not auth_token:
        raise HTTPException(status_code=401, detail="Missing auth token")
    uuid = verify_token(auth_token)
    if not uuid:
        raise HTTPException(status_code=401, detail="Invalid auth token")
    return uuid

@router.get("/get-history")
async def get_history(auth_token: str = Cookie(None)):
    uuid = get_uuid_from_token(auth_token)
    try:
        log.info(f"[ SERVER API ][ Fetching post history for uuid: {uuid} ]")

        query = {
            "uuid": uuid,
            "analyses": {"$exists": True, "$not": {"$size": 0}}
        }
        posts = posts_collection.find(query)
        posts_list = list_serial(posts)

        result = []
        for post in posts_list:
            post_link = post.get("post_link")
            post_name = post.get("post_name", None)
            analysis_date = post.get("analysis_date")
            platform = post.get("platform")

            result.append({
                "post_link": post_link,
                "post_name": post_name,
                "analysis_date": analysis_date,
                "platform": platform
            })

        log.info(f"[ SERVER API ][ Found {len(result)} posts for uuid: {uuid} ]")
        return result

    except Exception as e:
        log.error(f"[ SERVER API ][ Error fetching history for uuid {uuid}: {e} ]")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.delete("/delete-post")
async def delete_post(post_name: str, analysis_date: str, auth_token: str = Cookie(None)):
    uuid = get_uuid_from_token(auth_token)

    try:
        query = {
            "uuid": uuid,
            "post_name": post_name,
            "analysis_date": analysis_date
        }

        post = posts_collection.find_one(query)

        if not post:
            log.warning(f"[ SERVER API ][ Post not found: {uuid}, {post_name}, {analysis_date} ]")
            raise HTTPException(status_code=404, detail="Post not found")

        posts_collection.delete_one({"_id": post["_id"]})
        log.info(f"[ SERVER API ][ Post deleted: {post['_id']} ]")

        return {"status": "success", "message": "Post deleted"}

    except Exception as e:
        log.error(f"[ SERVER API ][ Error deleting post: {str(e)} ]")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/get-analysis")
async def get_analysis(post_link: str, platform: str, auth_token: str = Cookie(None)):
    uuid = get_uuid_from_token(auth_token)
    try:
        log.info(f"[ SERVER API ][ Received analysis request: uuid={uuid}, link={post_link}, platform={platform} ]")

        post = posts_collection.find_one({"uuid": uuid, "post_link": post_link})

        if not post:
            log.info(f"[ SERVER API ][ Post with uuid={uuid} and link={post_link} not found in database ]")

            payload = {
                "type": "metadata",
                "uuid": uuid,
                "post_link": post_link,
                "platform": platform,
            }
            send_to_scraper(payload, uuid)
            return {"status": "success", "message": "Payload sent to Scraping Service."}
        else:
            log.info(f"[ SERVER API ][ Post {post_link} already analyzed. ]")
            return {"status": "exists", "message": "Post already analyzed."}

    except Exception as e:
        log.error(f"Error in get-analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/analysis-status")
async def analysis_status(post_link: str, auth_token: str = Cookie(None)):
    uuid = get_uuid_from_token(auth_token)
    post = posts_collection.find_one({"uuid": uuid, "post_link": post_link})
    if not post:
        return {"status": "not_found"}

    analysis = post.get("analyses", [])
    if analysis:
        return {
            "status": "done",
            "analysis": analysis
        }

    return {"status": "processing"}

class EditNameRequest(BaseModel):
    old_post_name: str
    analysis_date: str
    new_post_name: str

@router.put("/edit-name")
async def edit_post_name(payload: EditNameRequest, auth_token: str = Cookie(None)):
    uuid = get_uuid_from_token(auth_token)

    try:
        # Verifică dacă noul nume e deja folosit
        existing_name = posts_collection.find_one({
            "uuid": uuid,
            "post_name": payload.new_post_name
        })

        if existing_name:
            log.warning(f"[ SERVER API ][ Post name '{payload.new_post_name}' already exists for uuid {uuid} ]")
            raise HTTPException(status_code=409, detail="Post name already exists")

        # Caută postarea care trebuie modificată
        query = {
            "uuid": uuid,
            "post_name": payload.old_post_name,
            "analysis_date": payload.analysis_date
        }

        post = posts_collection.find_one(query)

        if not post:
            log.warning(f"[ SERVER API ][ Post not found for edit: {query} ]")
            raise HTTPException(status_code=404, detail="Post not found")

        # Actualizează post_name
        posts_collection.update_one(
            {"_id": post["_id"]},
            {"$set": {"post_name": payload.new_post_name}}
        )

        log.info(f"[ SERVER API ][ Updated post_name for post {post['_id']} to '{payload.new_post_name}' ]")
        return {"status": "success", "message": "Post name updated"}

    except Exception as e:
        log.error(f"[ SERVER API ][ Error editing post name: {str(e)} ]")
        raise HTTPException(status_code=500, detail="Internal Server Error")
