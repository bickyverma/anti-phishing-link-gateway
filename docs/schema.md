# My Project Database Plan

1. Users Table (Tracks Admins)
   - ID (Number)
   - Email (Text)
   - Password (Text)

2. ScannedLinks Table (Tracks Every Checked Link)
   - ID (Number)
   - URL (The full link text)
   - Domain (The core website name, e.g., fraud-college.com)
   - Risk Score (A safety score from 0 to 100)
   - Verdict (Safe, Suspicious, or Malicious)
   - Scanned At (Time and date)

3. Whitelist Table (Tracks Official Real College Links)
   - ID (Number)
   - Official Domain (e.g., mycollege.edu)