// messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "archivePage" && msg.url) {
    chrome.storage.local.get(["enabled", "archiveHistory", "historyLimit"], (data) => {
      if (data.enabled !== false) {
        const cleanUrl = msg.url.replace(/^https?:\/\//, "");
        const archiveUrl = `https://archive.is/${cleanUrl}`;

        // update archive history
        const history = data.archiveHistory || [];
        const newEntry = {
          url: msg.url,
          timestamp: new Date().toISOString()
        };
        const max = data.historyLimit ?? 5;
        const updatedHistory = [newEntry, ...history].slice(0, max);

        chrome.storage.local.set({ archiveHistory: updatedHistory });

        // archived link
        chrome.tabs.create({ url: archiveUrl });
      }
    });
  }

  if (msg.action === "toggleStateChanged") {
    updateBadgeFromStorage(); //Update badge when toggle changes
  }
});

// badge is set dependent on if extension is enabled
function updateBadgeFromStorage() {
  chrome.storage.local.get(["enabled"], (data) => {
    const enabled = data.enabled ?? true;
    const color = enabled ? "#00cc44" : "#ff0000";
    const text = enabled ? "✔️" : "❌";
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color });
  });
}

// On install or startup
chrome.runtime.onInstalled.addListener(updateBadgeFromStorage);
chrome.runtime.onStartup.addListener(updateBadgeFromStorage);

// re-inject content.js when switching tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && tab.url.includes("medium.com")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
    }
  });
});

// re-inject content.js when the page finishes loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.includes("medium.com")) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
  }
});
