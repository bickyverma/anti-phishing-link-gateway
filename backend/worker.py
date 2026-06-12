import os
import time
from celery import Celery
from app.reputation import check_link_reputation

# Day 9 Windows Workaround: Using pure native in-memory transport architecture
celery_app = Celery(
    "tasks",
    broker="memory://",
    backend="cache+memory://"
)

@celery_app.task(name="analyze_link_async")
def analyze_link_async(url: str):
    # Simulating our heavy 3-second network processing delay
    time.sleep(3)
    
    analysis = check_link_reputation(url)
    breakdown = analysis["score_breakdown"]
    
    total_calculated_score = min(
        breakdown["virustotal_feed_score"] + 
        breakdown["domain_age_score"] + 
        breakdown["typosquatting_score"], 
        100
    )
    
    if total_calculated_score >= 70:
        final_verdict = "Malicious"
    elif total_calculated_score >= 30:
        final_verdict = "Suspicious"
    else:
        final_verdict = "Safe"
        
    return {
        "url": url,
        "root_domain": analysis["root_domain"],
        "combined_threat_score": total_calculated_score,
        "status": final_verdict,
        "all_triggered_flags": analysis["reputation_flags"]
    }