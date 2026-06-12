from urllib.parse import urlparse

def check_link_reputation(url: str) -> dict:
    """
    Day 12 Enhanced Analysis Engine:
    Incorporates advanced domain string segmentation and brand spoofing heuristics.
    """
    try:
        parsed_url = urlparse(url)
        # Extract domain and convert to lowercase for uniform scanning
        domain = parsed_url.netloc.lower() or parsed_url.path.lower()
    except Exception:
        domain = url.lower()

    # Clean port numbers if present (e.g., localhost:8000)
    if ":" in domain:
        domain = domain.split(":")[0]

    # 1. Base Score Matrix Parameters
    virustotal_feed_score = 0
    domain_age_score = 0
    typosquatting_score = 0
    brand_spoof_score = 0
    
    reputation_flags = []

    # Mock evaluation metrics mimicking live feed integrations
    if "university-placement-portal" in domain:
        virustotal_feed_score = 40
        domain_age_score = 30
        reputation_flags.append("Threat Intel: Matches known malicious campaign pattern (+40)")
        reputation_flags.append("Registrar Log: Domain registration age is under 7 days (+30)")

    if "fees-payment-direct" in domain:
        virustotal_feed_score = 25
        domain_age_score = 20
        reputation_flags.append("Threat Intel: Flagged by community reputational reports (+25)")
        reputation_flags.append("Registrar Log: Domain registration age is under 30 days (+20)")

    # 2. Typosquatting Parameter Check (High-risk TLD variants)
    high_risk_tlds = [".xyz", ".top", ".click", ".win", ".bid", ".info"]
    if any(domain.endswith(tld) for tld in high_risk_tlds):
        typosquatting_score = 22
        reputation_flags.append(f"Heuristic Flag: Hosted on a high-risk malicious TLD platform (+22)")

    # 3. NEW DAY 12 CORE: Brand Spoofing Identity Interception
    # Trusted brands that phishers love to mimic
    trusted_brands = ["github", "google", "microsoft", "paypal", "amazon", "university"]
    
    # If a trusted brand string exists inside the link, but it's NOT the official site...
    for brand in trusted_brands:
        if brand in domain:
            # Check for legitimate official domains
            is_legit = (
                (brand == "github" and domain.endswith("github.com")) or
                (brand == "google" and domain.endswith("google.com")) or
                (brand == "microsoft" and domain.endswith("microsoft.com")) or
                (brand == "paypal" and domain.endswith("paypal.com")) or
                (brand == "amazon" and domain.endswith("amazon.com"))
            )
            
            if not is_legit:
                brand_spoof_score = 35
                reputation_flags.append(f"Critical Heuristic: Brand Spoofing Alert! Domain illegitimately mimics trusted entity '{brand}' (+35)")

    return {
        "root_domain": domain,
        "reputation_flags": reputation_flags,
        "score_breakdown": {
            "virustotal_feed_score": virustotal_feed_score,
            "domain_age_score": domain_age_score,
            "typosquatting_score": typosquatting_score,
            "brand_spoof_score": brand_spoof_score
        }
    }