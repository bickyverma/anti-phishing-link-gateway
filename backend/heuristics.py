import re
from urllib.parse import urlparse

def analyze_url_heuristics(url: str) -> dict:
    """
    Analyzes a URL string statically for structural phishing red flags.
    Returns a dictionary containing the calculated score and specific flags triggered.
    """
    score = 0
    flags = []
    
    # 1. Clean up input and parse URL structural components
    url = url.strip()
    if not url.startswith(('http://', 'https://')):
        # Automatically prepend http if a raw string is submitted for basic parsing
        url = 'http://' + url
        
    try:
        parsed_url = urlparse(url)
        domain = parsed_url.netloc
        path = parsed_url.path
    except Exception:
        return {"score": 100, "status": "Malicious", "flags": ["Invalid URL Format"]}

    # 2. Check URL Length Red Flags
    url_length = len(url)
    if url_length > 75:
        score += 25
        flags.append(f"Abnormally long URL ({url_length} characters)")
    elif url_length > 54:
        score += 15
        flags.append("Moderately long URL string")

    # 3. Check for IP Address used as a Domain
    # Matches patterns like http://192.168.1.1/
    ip_pattern = r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"
    if re.match(ip_pattern, domain):
        score += 40
        flags.append("Uses raw IP address instead of domain name")

    # 4. Symbol Count Analysis (Typosquatting Indicators)
    # Phishing URLs often use hyphens or subdomains extensively to mimic real sites
    dot_count = domain.count('.')
    hyphen_count = domain.count('-')
    
    if dot_count > 3:
        score += 20
        flags.append(f"Excessive subdomains/dots in authority path ({dot_count})")
    if hyphen_count > 2:
        score += 15
        flags.append(f"Excessive hyphen usage in domain ({hyphen_count})")
    if "@" in url:
        score += 30
        flags.append("URL contains ambiguous '@' user-info redirect symbol")

    # 5. Sensitive Keyword Analysis
    # Checking if attackers are attempting to spoof high-value targets or terms
    suspicious_keywords = ["login", "verify", "placement", "secure", "update", "banking", "signin", "admin", "portal"]
    found_keywords = []
    
    # Check both the domain structure and subdirectories
    full_search_area = (domain + path).lower()
    for keyword in suspicious_keywords:
        if keyword in full_search_area:
            found_keywords.append(keyword)
            
    if found_keywords:
        score += len(found_keywords) * 15
        flags.append(f"Suspicious targeted keywords found: {', '.join(found_keywords)}")

    # 6. Normalize and Cap the Security Score at 100 max
    score = min(score, 100)
    
    # Categorize threat status based on numerical weight
    if score >= 65:
        status = "Malicious"
    elif score >= 25:
        status = "Suspicious"
    else:
        status = "Safe"

    return {
        "url": url,
        "score": score,
        "status": status,
        "flags": flags
    }
