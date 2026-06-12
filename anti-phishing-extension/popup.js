document.getElementById('scan-btn').addEventListener('click', async () => {
  const urlInput = document.getElementById('url-input').value.trim();
  const scanBtn = document.getElementById('scan-btn');
  const resultBox = document.getElementById('result-box');

  if (!urlInput) return;

  // Set loading states
  scanBtn.disabled = true;
  scanBtn.innerText = "Analyzing...";
  resultBox.style.display = "block";
  resultBox.className = "status-pending";
  resultBox.innerText = "Checking backend gateway infrastructure...";

  try {
    // 1. Send the initial scan request to your local FastAPI server
    const response = await fetch('https://anti-phishing-link-gateway-1.onrender.com/api/v1/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlInput })
    });

    if (!response.ok) throw new Error('Backend offline');
    const data = await response.json();
    const taskId = data.task_id;

    // If it bypassed analysis via your Day 12 community blacklist rule, show immediately
    if (data.status === 'Completed') {
      displayFinalResult(urlInput, "Malicious", 100);
      return;
    }

    // 2. Start the 2-second polling loop
    const pollInterval = setInterval(async () => {
      try {
        const checkResponse = await fetch(`https://anti-phishing-link-gateway-1.onrender.com/api/v1/task/${taskId}`);
        if (!checkResponse.ok) return;

        const taskData = await checkResponse.json();

        if (taskData.status === 'Completed') {
          clearInterval(pollInterval);
          displayFinalResult(urlInput, taskData.result.status, taskData.result.combined_threat_score);
        } else if (taskData.status === 'Failed') {
          clearInterval(pollInterval);
          showError("Analysis cycle failed.");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

  } catch (error) {
    showError("Could not connect to FastAPI server. Make sure your backend is running!");
  }
});

function displayFinalResult(url, status, score) {
  const scanBtn = document.getElementById('scan-btn');
  const resultBox = document.getElementById('result-box');
  
  scanBtn.disabled = false;
  scanBtn.innerText = "Scan URL Shortcut";
  
  if (status === 'Safe') {
    resultBox.className = "status-safe";
    resultBox.innerHTML = `✅ <strong>Safe Link</strong><br>Score: ${score}/100<br>Verified clear by gateway.`;
  } else {
    resultBox.className = "status-warning";
    resultBox.innerHTML = `⚠️ <strong>${status} Link!</strong><br>Threat Index: ${score}/100<br>Do not submit student credentials.`;
  }
}

function showError(msg) {
  const scanBtn = document.getElementById('scan-btn');
  const resultBox = document.getElementById('result-box');
  scanBtn.disabled = false;
  scanBtn.innerText = "Scan URL Shortcut";
  resultBox.className = "status-warning";
  resultBox.innerText = msg;
}