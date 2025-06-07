def individual_serial(post) -> dict:
    return {
        "id": str(post.get("_id")),
        "uuid": post.get("uuid"),
        "post_link": post.get("post_link"),
        "post_name": post.get("post_name"),
        "platform": post.get("platform"),
        "post_no_comments": post.get("post_no_comments"),
        "post_likes": post.get("post_likes"),
        "post_saved": post.get("post_saved"),
        "post_distribution": post.get("post_distribution"),
        "post_date": post.get("post_date") if post.get("post_date") else None,
        "analysis_date": post.get("analysis_date") if post.get("analysis_date") else None,
        "comments": post.get("comments", []),
        "analyses": post.get("analyses", [])
    }


def list_serial(posts) -> list:
    return [ individual_serial(post) for post in posts ]
