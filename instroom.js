// instroom.js
document.addEventListener("DOMContentLoaded", () => {
    const loadingDiv = document.getElementById("loading");
    const errorDiv = document.getElementById("error");
    const profileDataDiv = document.getElementById("profile-data");
    const usernameSpan = document.getElementById("username");
    const emailSpan = document.getElementById("email");
    const dmLinkA = document.getElementById("dm-link");
    const followersSpan = document.getElementById("followers");
    const locationSpan = document.getElementById("country");
    const engagementRateSpan = document.getElementById("engagement-rate");
  
    function displayProfileData(data) {
      loadingDiv.style.display = "none";
      profileDataDiv.style.display = "block";
      usernameSpan.textContent = data.username || "N/A";
      emailSpan.textContent = data.email || "N/A";
      dmLinkA.href = `https://ig.me/m/${data.username}`;
      dmLinkA.style.display = data.username ? "inline-block" : "none";
      followersSpan.textContent = data.followers_count || "N/A";
      locationSpan.textContent = data.location || "N/A";
      engagementRateSpan.textContent = data.engagement_rate || "N/A";
    }
  
    function displayError(message) {
      loadingDiv.style.display = "none";
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
    }
  
    // Send a message to the content script to get the URL.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { message: "get_profile_url" });
    });
  
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.message === "profile_data") {
        displayProfileData(request.data);
      } else if (request.message === "profile_data_error") {
        displayError(request.error);
      }
    });
  });
  