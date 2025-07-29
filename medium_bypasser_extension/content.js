// auto-click first archived snapshot on archive.is
function clickArticleThumbnail() {
  //for selecting the thumbnail to access the archived article
  const articleThumbnailLink = document.querySelector('#row0 > div.THUMBS-BLOCK > div > a');

  if (articleThumbnailLink) {
    articleThumbnailLink.click();
    sessionStorage.setItem('archive_link_clicked', 'true');
  } else {
    console.log('Article thumbnail link not found');
  }
}

if (!sessionStorage.getItem('archive_link_clicked') && window.location.hostname.includes("archive.")) {
  setTimeout(clickArticleThumbnail, 400);
}

// detect medium paywall and update badge (not currently in use)
function detectPaywallAndSendBadge() {
  try {
    const targetText = "become a member to read this story";
    const allElements = document.querySelectorAll("*");

    let isPaywalled = false;

    for (const el of allElements) {
      const text = el.textContent?.toLowerCase().replace(/\s+/g, " ").trim();
      if (text.includes(targetText)) {
        isPaywalled = true;
        break;
      }
    }

    chrome.runtime.sendMessage({ action: "updateBadge", paywalled: isPaywalled });
  } catch (err) {
    console.error("Paywall detection error:", err);
  }
}

// detection
document.addEventListener("DOMContentLoaded", () => {
  detectPaywallAndSendBadge();

  // Also try again in case of lazy load
  setTimeout(detectPaywallAndSendBadge, 1000);
});
