import uuid
import time
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
# FIX 1: 'app.' hata diya kyunki files same folder mein hain
from reputation import check_link_reputation

app = FastAPI(title="Anti-Phishing Gateway API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# FIX 2: Render ke health check ke liye Root Endpoint wapas add kiya
@app.get("/")
def api_chk():
    return {"status": "Active", "message": "Anti-Phishing API is Running Perfectly!"}

# In-memory storage structures
tasks_db = {}
blacklist_db = set([
    "http://confirmed-scam-site.biz/login" # Pre-seeded mock item for testing
])

class ScanRequest(BaseModel):
    url: str

class ReportRequest(BaseModel):
    url: str

def heavy_analysis_worker(task_id: str, url: str):
    """Background processing task calculating regular rules."""
    try:
        time.sleep(3) # Normal 3-second analysis delay
        analysis = check_link_reputation(url)
        breakdown = analysis["score_breakdown"]
        
        total_calculated_score = min(
            breakdown["virustotal_feed_score"] + 
            breakdown["domain_age_score"] + 
            breakdown["typosquatting_score"], 
            100
        )
        
        final_verdict = "Malicious" if total_calculated_score >= 70 else "Suspicious" if total_calculated_score >= 30 else "Safe"
            
        tasks_db[task_id] = {
            "status": "Completed",
            "result": {
                "url": url,
                "root_domain": analysis["root_domain"],
                "combined_threat_score": total_calculated_score,
                "status": final_verdict,
                "all_triggered_flags": analysis["reputation_flags"]
            }
        }
    except Exception as e:
        tasks_db[task_id] = {"status": "Failed", "result": {"error": str(e)}}

@app.post("/api/v1/scan")
def scan_url_async(request: ScanRequest, background_tasks: BackgroundTasks):
    url_clean = request.url.strip()
    if not url_clean:
        raise HTTPException(status_code=400, detail="URL cannot be blank.")
    
    # DAY 12 BYPASS RULE: If link is in blacklist, return immediately!
    if url_clean in blacklist_db:
        task_id = str(uuid.uuid4())
        tasks_db[task_id] = {
            "status": "Completed",
            "result": {
                "url": url_clean,
                "root_domain": url_clean,
                "combined_threat_score": 100,
                "status": "Malicious",
                "all_triggered_flags": ["CRITICAL: Link blacklisted by community crowdsourced report!"]
            }
        }
        return {"task_id": task_id, "url": url_clean, "status": "Completed"}

    # Otherwise, run regular asynchronous background checks
    task_id = str(uuid.uuid4())
    tasks_db[task_id] = {"status": "Pending", "result": None}
    background_tasks.add_task(heavy_analysis_worker, task_id, url_clean)
    
    return {"task_id": task_id, "url": url_clean, "status": "Pending"}

@app.get("/api/v1/task/{task_id}")
def get_task_status(task_id: str):
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task tracking ID not found.")
    return tasks_db[task_id]

# DAY 12 NEW ENDPOINT: Appends crowdsourced reported links straight to blacklist database
@app.post("/api/v1/report")
def report_malicious_url(request: ReportRequest):
    url_clean = request.url.strip()
    if not url_clean:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")
    
    blacklist_db.add(url_clean)
    return {"message": "Success", "reported_url": url_clean, "total_blacklisted": len(blacklist_db)}