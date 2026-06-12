# Automated Link Verification Gateway & Phishing Interceptor

An end-to-end, full-stack cybersecurity mitigation platform designed to protect students from credential harvesting, fraudulent recruitment setups, and lookalike domain scams. This ecosystem features a reactive MERN-style web dashboard, an asynchronous background threat processing engine, a crowdsourced community intelligence blacklist system, and a portable Chrome Extension utility widget.

## 🚀 System Architecture & Core Features

* **Asynchronous Processing Pipeline:** Implements a decoupled architecture utilizing a background task runner to process heuristic matrices without blocking active client gateway traffic.
* **Dynamic Polling Infrastructure:** Features a resilient frontend polling mechanism that automatically monitors active task telemetry states at precise 2-second intervals.
* **Double-Submission Security Deck:** Combines automated algorithmic scanning with an instant-bypass community reporting blacklist portal.
* **Modular Web UI Dashboard:** Built with sleek, responsive dark-mode layouts, featuring intuitive user state indicators, interactive logs, and conditional safety/threat cards.
* **Chrome Extension Proxy Widget:** Provides a lightweight browser companion that queries the central API layer directly from the browser toolbar.

---

## 💻 Tech Stack Matrix

* **Frontend:** React, Vite, Tailwind CSS, Lucide React (Icons)
* **Backend Engine:** Python, FastAPI, Uvicorn, Pydantic
* **Browser Extension:** Manifest V3, HTML5, Vanilla JavaScript

---

## 🛠️ Environment Installation & Deployment Guide

Follow these steps to run the complete environment locally on your workstation.

### 1. Start the FastAPI Backend Engine
Navigate to your backend subdirectory, spin up your python virtual environment, and initialize the application gateway:
```bash
cd backend
# Activate your virtual environment (Windows example)
.\venv\Scripts\activate

# Run the Uvicorn deployment server
uvicorn app.main:app --reload