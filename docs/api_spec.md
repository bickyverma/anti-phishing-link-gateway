# My Project API Plan

1. Send Link for Scanning
   - Web Address: POST /api/v1/scan
   - What the Frontend Sends: {"url": "http://fake-placement-login.com"}
   - What the Backend Responds: {"status": "Processing", "task_id": "123"}

2. Get the Final Safety Result
   - Web Address: GET /api/v1/scan/results/123
   - What the Backend Returns when finished:
     {
       "url": "http://fake-placement-login.com",
       "risk_score": 90,
       "verdict": "Malicious",
       "reason": "This domain is less than 5 days old."
     }