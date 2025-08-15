import requests
from django.conf import settings

def geocode_address(address: str):
    api_key = getattr(settings, "GOOGLE_MAPS_API_KEY", None)
    if not api_key:
        raise RuntimeError("settings.GOOGLE_MAPS_API_KEY 未設定")

    endpoint = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": api_key,
        "region": "tw",        # 台灣優先
        "language": "zh-TW",   # 回傳繁中
        "components": "country:TW",  # 若地址簡短，打開這行可提高命中
    }

    try:
        r = requests.get(endpoint, params=params, timeout=6)
        r.raise_for_status()
        data = r.json()

        status = data.get("status")
        if status != "OK":
            # 把 Google 給的錯誤訊息輸出出來，好定位
            err = data.get("error_message", "")
            print("[Geocode] status=", status, " error_message=", err, " url=", r.url)
            return None

        result = data["results"][0]
        loc = result["geometry"]["location"]
        return {
            "formatted_address": result.get("formatted_address"),
            "place_id": result.get("place_id"),
            "lat": loc["lat"],
            "lng": loc["lng"],
        }

    except requests.RequestException as e:
        print(f"[Geocode] HTTP error: {e}")
        return None
