document.addEventListener("DOMContentLoaded", () => {
  // load toggle state
  chrome.storage.local.get(["enabled"], (data) => {
    const enabled = data.enabled ?? true;
    document.getElementById("toggleExtension").checked = enabled;

    const color = enabled ? "#00cc44" : "#ff0000";
    const text = enabled ? "✔️" : "❌";
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color });
  });

  // save toggle state & update badge
  document.getElementById("toggleExtension").addEventListener("change", (e) => {
    const enabled = e.target.checked;
    chrome.storage.local.set({ enabled });

    const color = enabled ? "#00cc44" : "#ff0000";
    const text = enabled ? "✔️" : "❌";
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color });
  });

  // archive current article
  document.getElementById("viewArchiveBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      chrome.runtime.sendMessage({ action: "archivePage", url });
    });
  });

  // archive history
  chrome.storage.local.get("archiveHistory", (data) => {
    const list = document.getElementById("archiveList");
    const history = data.archiveHistory || [];

    if (history.length === 0) {
      list.innerHTML = "<li>No history yet</li>";
    } else {
      history.forEach((item) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `https://archive.is/${item.url}`;
        a.textContent = item.url.length > 50 ? item.url.slice(0, 50) + "..." : item.url;
        a.target = "_blank";
        li.appendChild(a);
        list.appendChild(li);
      });
    }
  });

  // Clear history
  document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    chrome.storage.local.remove("archiveHistory", () => {
      const list = document.getElementById("archiveList");
      list.innerHTML = "<li>No history yet</li>";
    });
  });

  // save history limit (3-20)
  document.getElementById("historyLimit").addEventListener("change", (e) => {
    chrome.storage.local.set({ historyLimit: parseInt(e.target.value) });
  });

  // load selected limit on popup open
  chrome.storage.local.get("historyLimit", (data) => {
    const selected = data.historyLimit || 5;
    document.getElementById("historyLimit").value = selected;
  });
});
