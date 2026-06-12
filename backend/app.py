from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Aapke baaki imports (jaise heuristics, reputation wale) yahan aayenge

app = FastAPI()

# IMPORTANT: Ye Vercel ko block hone se bachayega (Ishe hatana mat)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def api_chk():
    return {"status": "Active", "message": "Anti-Phishing API is Live!"}

# ---> YAHAN NICHE APNA ASLI ROUTE CODE PASTE KARIYE <---
# Example:
# @app.post("/api/v1/scan")
# def scan_url(data: dict):
#     # Aapka scan logic yahan aayega...

# @app.post("/api/v1/report")
# def report_url(data: dict):
#     # Aapka report logic yahan aayega...