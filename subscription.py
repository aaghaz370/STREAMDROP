import datetime
from config import Config
from database import db

# Plan Definitions
PLANS = {
    "free": {
        "daily_limit": 5,
        "link_expiry_days": 1, # 24 Hours
        "name": "Free Tier"
    },
    "weekly": {
        "daily_limit": 999999, # Unlimited
        "link_expiry_days": 180, # 6 Months
        "name": "Weekly Plan (7 Days)"
    },
    "monthly": {
        "daily_limit": 999999, # Unlimited
        "link_expiry_days": 240, # 8 Months
        "name": "Monthly Plan (30 Days)"
    },
    "bimonthly": {
        "daily_limit": 999999, # Unlimited
        "link_expiry_days": 365, # 1 Year (User said 499/2 months expiry 1yr)
        "name": "2 Month Plan (60 Days)"
    }
}

async def get_plan_status(user_id: int):
    # Admin Override
    if user_id == Config.OWNER_ID:
        return {
            "name": "👑 OWNER (GOD MODE)",
            "can_upload": True,
            "expiry_date": None, # Never Expires
            "daily_left": "∞",
            "plan_type": "admin",
            "current_count": "Unlimited"
        }

    user_data = await db.get_user_data(user_id)
    plan_name = user_data.get("plan", "free")
    plan_expiry = user_data.get("plan_expiry")
    
    # Check if plan expired
    if plan_expiry and plan_expiry < datetime.datetime.now():
        # Revert to free
        await db.set_user_plan(user_id, "free", None)
        plan_name = "free"
        user_data["plan"] = "free"

    # Daily Limit Check (Only for Free)
    today_str = datetime.date.today().isoformat()
    last_usage = user_data.get("last_usage_date")
    current_count = user_data.get("daily_count", 0)

    # Reset daily count if new day
    if last_usage != today_str:
        current_count = 0
        await db.update_user_usage(user_id, daily_count=0, date_str=today_str)
    
    limit = PLANS[plan_name]["daily_limit"]
    
    return {
        "name": PLANS[plan_name]["name"],
        "can_upload": current_count < limit,
        "expiry_date": _get_link_expiry(plan_name),
        "daily_left": limit - current_count if limit < 999999 else "∞",
        "plan_type": plan_name,
        "current_count": current_count
    }

def _get_link_expiry(plan_name):
    if plan_name not in PLANS: return None
    days = PLANS[plan_name]["link_expiry_days"]
    return datetime.datetime.now() + datetime.timedelta(days=days)

async def increment_user_usage(user_id):
    user_data = await db.get_user_data(user_id)
    current_count = user_data.get("daily_count", 0)
    # Ensure date is today before incrementing (safety check, though get_plan_status usually handles reset)
    today_str = datetime.date.today().isoformat()
    last_usage = user_data.get("last_usage_date")
    
    if last_usage != today_str:
        current_count = 0
    
    await db.update_user_usage(user_id, daily_count=current_count + 1, date_str=today_str)
