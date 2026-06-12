import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Link2, History, AlertTriangle, Loader2, Trash2, Activity, Megaphone, CheckCircle } from 'lucide-react';

function App() {
  const [urlInput, setUrlInput] = useState('');
  const [reportInput, setReportInput] = useState(''); // Day 12 state
  const [loading, setLoading] = useState(false);
  const [reporting, setReporting] = useState(false); // Day 12 state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // Day 12 state
  const [selectedScan, setSelectedScan] = useState(null);
  
  const [historyData, setHistoryData] = useState([
    { id: 1, url: 'http://university-placement-portal.xyz/login', status: 'Malicious', score: 92, flags: ["Suspicious keywords found", "High-risk TLD", "Domain mimics official structure"] },
    { id: 2, url: 'https://github.com/login', status: 'Safe', score: 0, flags: ["No critical threat signatures identified during automated sweep."] },
    { id: 3, url: 'http://fees-payment-direct.top/pay', status: 'Suspicious', score: 65, flags: ["Abnormally long URL structure", "Unverified financial keywords"] }
  ]);

  const totalScanned = historyData.length;
  const threatsIntercepted = historyData.filter(item => item.status === 'Malicious' || item.status === 'Suspicious').length;

  const handleScan = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedScan(null);

    const targetUrl = urlInput;
    setUrlInput(''); 

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) throw new Error('Server connection issue encountered.');

      const initialData = await response.json();
      const targetTaskId = initialData.task_id;

      // Check if it bypassed directly due to blacklist presence
      if (initialData.status === 'Completed') {
        const checkResponse = await fetch(`http://127.0.0.1:8000/api/v1/task/${targetTaskId}`);
        const finalBlacklistData = await checkResponse.json();
        const blacklistResult = {
          id: Date.now(),
          url: finalBlacklistData.result.url,
          status: finalBlacklistData.result.status,
          score: finalBlacklistData.result.combined_threat_score,
          flags: finalBlacklistData.result.all_triggered_flags
        };
        setHistoryData(prev => [blacklistResult, ...prev]);
        setSelectedScan(blacklistResult);
        setLoading(false);
        return;
      }

      const localTrackingId = Date.now();
      const pendingPlaceholder = {
        id: localTrackingId,
        url: targetUrl,
        status: 'Pending',
        score: 0,
        flags: ['Asynchronous processing cycle initialized... Checking heuristic tables...']
      };

      setHistoryData(prevHistory => [pendingPlaceholder, ...prevHistory]);
      setSelectedScan(pendingPlaceholder);

      const pollInterval = setInterval(async () => {
        try {
          const checkResponse = await fetch(`http://127.0.0.1:8000/api/v1/task/${targetTaskId}`);
          if (!checkResponse.ok) return;
          
          const taskData = await checkResponse.json();

          if (taskData.status === 'Completed') {
            clearInterval(pollInterval);
            setLoading(false);

            const completeResult = {
              id: localTrackingId,
              url: taskData.result.url,
              status: taskData.result.status,
              score: taskData.result.combined_threat_score,
              flags: taskData.result.all_triggered_flags
            };

            setHistoryData(prevHistory => 
              prevHistory.map(item => item.id === localTrackingId ? completeResult : item)
            );
            setSelectedScan(completeResult);
          } else if (taskData.status === 'Failed') {
            clearInterval(pollInterval);
            setLoading(false);
            setErrorMsg('Background scanning pipeline failed to complete analytics matrix.');
          }
        } catch (pollErr) {
          console.error("Polled background loop error:", pollErr);
        }
      }, 2000);

    } catch (err) {
      setErrorMsg('Failed to reach verification backend engine gateway.');
      console.error(err);
      setLoading(false);
    }
  };

  // DAY 12 NEW LOGIC: Connects "Report" action directly to database array
  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportInput.trim()) return;

    setReporting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: reportInput.trim() }),
      });

      if (!response.ok) throw new Error('Failed to submit user report.');

      setSuccessMsg(`URL successfully added to system blacklist database! Future checks will be blocked instantly.`);
      setReportInput('');
    } catch (err) {
      setErrorMsg('Error sending community report to database repository.');
      console.error(err);
    } finally {
      setReporting(false);
    }
  };

  const clearLogs = () => {
    setHistoryData([]);
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedScan(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans">
      
      {/* SIDEBAR NAVIGATION LAYOUT MODULE */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <ShieldAlert className="text-red-500 w-8 h-8" />
            <span className="font-bold text-lg tracking-wider text-white">GATEWAY API</span>
          </div>
          
          <nav className="space-y-4">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-red-600 rounded-lg text-white font-medium shadow-md transition">
              <Link2 className="w-5 h-5" /> Link Scanner
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-900 rounded-lg transition hover:text-white">
              <History className="w-5 h-5" /> Analytics Logs
            </a>
          </nav>
        </div>
        <div className="text-xs text-slate-600 border-t border-slate-800 pt-4">
          Placement Protection System v1.0
        </div>
      </div>

      {/* CORE DISPLAY MAIN DASHBOARD PORTAL CONTAINER */}
      <div className="flex-1 p-10 max-w-6xl mx-auto overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">Automated Link Verification Gateway</h1>
          <p className="text-slate-400">Scan admission, registration, or placement offer links instantly to detect credential harvesting and typosquatting scams.</p>
        </header>

        {/* METRICS DASHBOARD CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Evaluated</p>
              <h3 className="text-2xl font-mono font-bold text-white mt-1">{totalScanned} Links</h3>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg text-blue-400 border border-slate-800">
              <Link2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Threats Intercepted</p>
              <h3 className="text-2xl font-mono font-bold text-red-400 mt-1">{threatsIntercepted} Flags</h3>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg text-red-400 border border-slate-800">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Gateway Engine Status</p>
              <h3 className="text-2xl font-mono font-bold text-emerald-400 mt-1">Operational</h3>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg text-emerald-400 border border-slate-800">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
          </div>
        </div>

        {/* DOUBLE SUBMISSION DECK: SCAN ENGINE AND REPORT ENGINE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* LEFT: SCAN INPUT PANEL */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-red-500" /> Analyze Suspicious URL
            </label>
            <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Paste the link to analyze..." 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition disabled:opacity-50 text-sm"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center gap-2 justify-center disabled:opacity-50 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Scan URL'}
              </button>
            </form>
          </div>

          {/* DAY 12 RIGHT: CROWDSOURCED REPORTING BLACKLIST PANEL */}
          <div className="bg-slate-950 border border-slate-800 border-l-4 border-l-amber-500 rounded-2xl p-6 shadow-xl">
            <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" /> Community Threat Report
            </label>
            <form onSubmit={handleReport} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Report known phishing link to blacklist..." 
                value={reportInput}
                onChange={(e) => setReportInput(e.target.value)}
                disabled={reporting}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition disabled:opacity-50 text-sm"
              />
              <button 
                type="submit"
                disabled={reporting}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center gap-2 justify-center disabled:opacity-50 text-sm"
              >
                {reporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Report Link'}
              </button>
            </form>
          </div>
        </div>

        {/* FEEDBACK STATUS STRIPS */}
        {errorMsg && (
          <p className="bg-red-950/40 border border-red-800/60 p-4 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2 mb-6">
            <AlertTriangle className="w-4 h-4" /> {errorMsg}
          </p>
        )}
        {successMsg && (
          <p className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl text-emerald-400 text-sm font-medium flex items-center gap-2 mb-6">
            <CheckCircle className="w-4 h-4" /> {successMsg}
          </p>
        )}

        {/* VERDICT CARD PROJECTION DISPLAY PANEL */}
        {selectedScan && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
            {selectedScan.status === 'Safe' ? (
              <div className="bg-emerald-950/30 border-2 border-emerald-500/60 rounded-2xl p-8 shadow-xl flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500 rounded-full shrink-0">
                  <ShieldCheck className="w-16 h-16" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded">Verdict: Verified Clear</span>
                    <span className="text-sm font-mono font-bold text-slate-400">Score: {selectedScan.score}/100</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white mb-2 truncate max-w-xl font-mono">{selectedScan.url}</h2>
                  <p className="text-emerald-300 text-sm font-medium mb-3">This link passed all system security checks safely.</p>
                  <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 text-left">
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">Security Verification Notes:</span>
                    <p className="text-xs text-slate-400 font-mono">✓ {selectedScan.flags[0] || 'Clean metadata profiles verified.'}</p>
                  </div>
                </div>
              </div>
            ) : selectedScan.status === 'Pending' ? (
              <div className="bg-slate-950 border border-slate-700 border-dashed rounded-2xl p-8 text-center text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-red-500" />
                <p className="font-mono font-bold text-sm text-white">Analyzing: {selectedScan.url}</p>
                <p className="text-xs text-slate-500 mt-1">Executing background security heuristic models (2s interval loop)...</p>
              </div>
            ) : (
              <div className={`border-2 rounded-2xl p-8 shadow-2xl relative overflow-hidden ${
                selectedScan.status === 'Malicious' ? 'bg-red-950/40 border-red-500' : 'bg-amber-950/30 border-amber-500'
              }`}>
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className={`p-4 rounded-2xl border shrink-0 ${
                    selectedScan.status === 'Malicious' ? 'bg-red-500/10 text-red-400 border-red-500/40' : 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                  }`}>
                    <ShieldAlert className="w-16 h-16" />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded border ${
                        selectedScan.status === 'Malicious' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        CRITICAL ALERT: {selectedScan.status.toUpperCase()} LINK DETECTED
                      </span>
                      <span className="text-sm font-mono font-bold text-slate-200 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded">
                        Threat Index Score: {selectedScan.score}/100
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white font-mono break-all mb-3 tracking-tight">{selectedScan.url}</h2>
                    <p className="text-sm text-slate-300 font-medium mb-5 leading-relaxed">
                      ⚠️ **Security Warning Protocol:** This address is blocked by the gateway firewall. Do not submit login credentials.
                    </p>
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
                      <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" /> Diagnostic Threat Analysis Breakdown:
                      </h4>
                      <ul className="space-y-2">
                        {selectedScan.flags.map((flag, idx) => (
                          <li key={idx} className="text-sm text-red-200 flex items-start gap-2.5 font-mono">
                            <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOG ARCHIVE DISPLAY LAYOUT */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Verification Scans</h2>
              <p className="text-xs text-slate-500 mt-0.5">Click any record row below to audit its complete structural diagnostic card properties.</p>
            </div>
            <div className="flex items-center gap-3">
              {historyData.length > 0 && (
                <button 
                  onClick={clearLogs}
                  className="text-xs font-semibold text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition border border-slate-800 px-3 py-1 rounded-md bg-slate-900"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Logs
                </button>
              )}
              <span className="text-xs font-semibold bg-slate-800 px-3 py-1 rounded-full text-slate-400">Live Gateway Telemetry</span>
            </div>
          </div>
          <div className="divide-y divide-slate-800">
            {historyData.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm font-medium">
                No active scan history profiles tracked inside this environment session context.
              </div>
            ) : (
              historyData.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedScan(item)}
                  className={`p-6 flex flex-col gap-3 cursor-pointer transition select-none ${
                    selectedScan?.id === item.id ? 'bg-slate-900/80 border-l-4 border-red-500' : 'hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {item.status === 'Malicious' ? (
                        <div className="p-3 bg-red-950 border border-red-800 rounded-xl text-red-400 shrink-0"><ShieldAlert className="w-5 h-5"/></div>
                      ) : item.status === 'Suspicious' ? (
                        <div className="p-3 bg-amber-950 border border-amber-800 rounded-xl text-amber-400 shrink-0"><AlertTriangle className="w-5 h-5"/></div>
                      ) : item.status === 'Pending' ? (
                        <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 shrink-0"><Loader2 className="w-5 h-5 animate-spin"/></div>
                      ) : (
                        <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-400 shrink-0"><ShieldCheck className="w-5 h-5"/></div>
                      )}
                      <div className="truncate pr-4">
                        <p className="text-sm font-semibold text-slate-200 truncate font-mono">{item.url}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Processed by Combined Threat Core • Click to audit</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${
                        item.status === 'Malicious' ? 'bg-red-950/40 text-red-400 border-red-900/50' : 
                        item.status === 'Suspicious' ? 'bg-amber-950/40 text-amber-400 border-amber-900/50' : 
                        item.status === 'Pending' ? 'bg-slate-900 text-slate-400 border-slate-700 animate-pulse' :
                        'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-sm font-mono font-bold text-slate-300 w-16 text-right">
                        {item.status === 'Pending' ? '---' : `Score: ${item.score}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;