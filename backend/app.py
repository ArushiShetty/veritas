from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image
import re

app = Flask(__name__)
CORS(app)

def extract_text_data(image):
    text = pytesseract.image_to_string(image)
    lines = text.split("\n")
    return [line.strip() for line in lines if line.strip()]

def extract_info_from_text(text_lines):
    data = {
        "followers": None,
        "following": None,
        "posts": None,
        "username": "",
        "bio": "",
    }

    joined_text = " ".join(text_lines).lower()
    for line in text_lines:
        if "followers" in line.lower():
            match = re.search(r"(\d[\d,.]*)\s*followers", line, re.IGNORECASE)
            if match:
                data["followers"] = int(match.group(1).replace(",", "").replace(".", ""))
        if "following" in line.lower():
            match = re.search(r"(\d[\d,.]*)\s*following", line, re.IGNORECASE)
            if match:
                data["following"] = int(match.group(1).replace(",", "").replace(".", ""))
        if "posts" in line.lower():
            match = re.search(r"(\d[\d,.]*)\s*posts?", line, re.IGNORECASE)
            if match:
                data["posts"] = int(match.group(1).replace(",", "").replace(".", ""))
        if "@" in line:
            data["username"] = line.strip()
        if not data["bio"] and len(line.split()) > 2:
            data["bio"] = line.strip()

    return data

def is_likely_fake(data, posted_same_day):
    explanation = []
    fake_score = 0

    if data["followers"] == 0:
        fake_score += 3
        explanation.append("Followers count is 0 – highly suspicious.")

    if data["followers"] and data["followers"] < 50 and data["following"] and data["following"] > 1000:
        fake_score += 2
        explanation.append("High following but very few followers – follow-for-follow behavior.")

    if posted_same_day:
        fake_score += 2
        explanation.append("All posts posted on the same day – bot-like behavior.")

    suspicious_keywords = ["lottery", "click here", "dm for", "money back", "investment", "crypto", "free followers"]
    for word in suspicious_keywords:
        if word in data["bio"].lower() or word in data["username"].lower():
            fake_score += 2
            explanation.append(f"Suspicious keyword found: '{word}' in bio/username.")

    result = "Likely Fake" if fake_score >= 4 else "Real"
    if fake_score >= 6:
        result = "Fake"

    return result, explanation

@app.route("/analyze", methods=["POST"])
def analyze():
    image = request.files.get("image")
    posted_same_day = request.form.get("posted_same_day") == "true"
    input_data = {
        "followers": request.form.get("followers"),
        "following": request.form.get("following"),
        "posts": request.form.get("posts"),
        "username": request.form.get("username"),
        "bio": request.form.get("bio"),
    }

    try:
        if image:
            img = Image.open(image)
            lines = extract_text_data(img)
            ocr_data = extract_info_from_text(lines)
        else:
            ocr_data = {}

        # Use user input if available
        final_data = {
            "followers": int(input_data["followers"]) if input_data["followers"] else ocr_data.get("followers", 0),
            "following": int(input_data["following"]) if input_data["following"] else ocr_data.get("following", 0),
            "posts": int(input_data["posts"]) if input_data["posts"] else ocr_data.get("posts", 0),
            "username": input_data["username"] or ocr_data.get("username", ""),
            "bio": input_data["bio"] or ocr_data.get("bio", ""),
        }

        result, explanation = is_likely_fake(final_data, posted_same_day)
        return jsonify({"result": result, "explanation": explanation})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)


