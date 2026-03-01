from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import base64, anthropic, json, os
from dotenv import load_dotenv
from hsv_detector import HSVRustDetector

load_dotenv()

print("API Key:", os.getenv("ANTHROPIC_API_KEY"))

app = FastAPI(title="Railway Rust Detection API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
hsv_detector = HSVRustDetector()

SYSTEM_PROMPT = """You are a railway infrastructure inspector specializing in rust and corrosion detection.
Analyze the provided railway image for rust, corrosion, and surface degradation.
Respond ONLY with valid JSON, no markdown. Use this exact structure:
{
  "rust_detected": boolean,
  "severity": "none" | "low" | "medium" | "high" | "critical",
  "rust_percentage": number (0-100),
  "confidence": number (0.0-1.0),
  "affected_areas": ["specific areas like rail head, web, flange, fasteners"],
  "description": "detailed description of findings",
  "recommendation": "specific maintenance recommendation"
}"""


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze/hsv")
async def analyze_hsv(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")
    image_bytes = await file.read()
    try:
        result = hsv_detector.detect(image_bytes=image_bytes)
        return JSONResponse({"filename": file.filename, "method": "hsv", "result": result})
    except Exception as e:
        raise HTTPException(500, f"HSV analysis failed: {e}")


@app.post("/analyze/ai")
async def analyze_ai(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")
    image_bytes = await file.read()
    try:
        image_data = base64.standard_b64encode(image_bytes).decode("utf-8")
        message = client.messages.create(
            model="claude-opus-4-5", max_tokens=1024, system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": [
                {"type": "image", "source": {"type": "base64", "media_type": file.content_type, "data": image_data}},
                {"type": "text", "text": "Analyze this railway image for rust. Return JSON only."}
            ]}]
        )
        text = message.content[0].text
        if "```json" in text: text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text: text = text.split("```")[1].split("```")[0].strip()
        result = json.loads(text)
        result["method"] = "Claude Vision AI"
        return JSONResponse({"filename": file.filename, "method": "ai", "result": result})
    except Exception as e:
        raise HTTPException(500, f"AI analysis failed: {e}")


@app.post("/analyze/both")
async def analyze_both(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")
    image_bytes = await file.read()
    results, errors = {}, {}

    try:
        results["hsv"] = hsv_detector.detect(image_bytes=image_bytes)
    except Exception as e:
        errors["hsv"] = str(e)

    try:
        image_data = base64.standard_b64encode(image_bytes).decode("utf-8")
        message = client.messages.create(
            model="claude-opus-4-5", max_tokens=1024, system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": [
                {"type": "image", "source": {"type": "base64", "media_type": file.content_type, "data": image_data}},
                {"type": "text", "text": "Analyze this railway image for rust. Return JSON only."}
            ]}]
        )
        text = message.content[0].text
        if "```json" in text: text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text: text = text.split("```")[1].split("```")[0].strip()
        ai_result = json.loads(text)
        ai_result["method"] = "Claude Vision AI"
        results["ai"] = ai_result
    except Exception as e:
        errors["ai"] = str(e)

    agreement = (results.get("hsv", {}).get("severity") == results.get("ai", {}).get("severity")
                 if "hsv" in results and "ai" in results else None)
    return JSONResponse({"filename": file.filename, "results": results, "errors": errors, "agreement": agreement})
