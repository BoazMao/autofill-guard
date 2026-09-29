const toggle = document.querySelector("#site-toggle");
const hostnameLabel = document.querySelector("#hostname");
const statusLabel = document.querySelector("#status");

let hostname = null;
let originPatterns = [];

const SCRIPT_ID = "autofill-guard-sites";

function setStatus(message, className = "") {
  statusLabel.textContent = message;
  statusLabel.className = `status ${className}`.trim();
}

function isSupportedPage(url) {
  return url.protocol === "http:" || url.protocol === "https:";
}

async function getBlockedPatterns() {
  const scripts = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
  return scripts[0]?.matches ?? [];
}

async function saveBlockedPatterns(patterns) {
  const matches = [...new Set(patterns)].sort();
  const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });

  if (matches.length === 0) {
    if (existing.length) await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
    return;
  }

  const registration = {
    id: SCRIPT_ID,
    matches,
    js: ["content.js"],
    css: ["content.css"],
    runAt: "document_start",
    allFrames: true,
    matchOriginAsFallback: true,
    persistAcrossSessions: true
  };

  if (existing.length) await chrome.scripting.updateContentScripts([registration]);
  else await chrome.scripting.registerContentScripts([registration]);
}

async function initialize() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) throw new Error("This page is not available.");

    const url = new URL(tab.url);
    if (!isSupportedPage(url)) {
      hostnameLabel.textContent = url.protocol.replace(":", "") || "Browser page";
      setStatus("Unavailable on browser pages", "error");
      return;
    }

    hostname = url.hostname;
    originPatterns = [
      `http://${hostname}/*`,
      `https://${hostname}/*`
    ];
    hostnameLabel.textContent = hostname;

    const blockedPatterns = await getBlockedPatterns();
    toggle.checked = originPatterns.some((pattern) => blockedPatterns.includes(pattern));
    toggle.disabled = false;
    setStatus(toggle.checked ? "Blocked on this site" : "Allowed on this site", toggle.checked ? "on" : "");
  } catch (error) {
    setStatus(error.message || "Could not read this page", "error");
  }
}

toggle.addEventListener("change", async () => {
  if (!hostname || originPatterns.length === 0) return;

  toggle.disabled = true;
  try {
    const blockedPatterns = await getBlockedPatterns();
    const nextPatterns = new Set(blockedPatterns);
    for (const pattern of originPatterns) {
      if (toggle.checked) nextPatterns.add(pattern);
      else nextPatterns.delete(pattern);
    }

    await saveBlockedPatterns([...nextPatterns]);
    setStatus(toggle.checked ? "Blocked on this site" : "Allowed on this site", toggle.checked ? "on" : "");
  } catch (error) {
    toggle.checked = !toggle.checked;
    setStatus(error.message || "Could not save the setting", "error");
  } finally {
    toggle.disabled = false;
  }
});

initialize();

