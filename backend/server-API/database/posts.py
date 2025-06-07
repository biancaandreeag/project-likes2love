from typing import List, Dict, Optional
from pydantic import BaseModel
import datetime

class Analysis(BaseModel):
    type: str
    result: Dict

class Comment(BaseModel):
    comment: str
    likes: int
    posted: str

class Post(BaseModel):
    uuid: str
    post_link: str
    platform: Optional[str] = None
    post_name: Optional[str] = None
    post_no_comments: Optional[int] = None
    post_likes: Optional[int] = None
    post_saved: Optional[int] = None
    post_distribution: Optional[int] = None
    post_comments: Optional[List[Comment]] = None
    post_date: Optional[datetime.datetime] = None
    analysis_date: Optional[datetime.datetime] = None
    comments: Optional[List[Comment]] = []
    analyses: Optional[List[Analysis]] = []
