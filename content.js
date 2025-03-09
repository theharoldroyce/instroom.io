// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "get_profile_url") {
      const profileUrl = window.location.href;
      chrome.runtime.sendMessage({
        message: "profile_url",
        url: profileUrl,
      });
    }
  });
  

  