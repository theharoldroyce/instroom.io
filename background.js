// background.js
const RAPIDAPI_KEY = "6310d501c5mshae96fb37e5ed1aep18d700jsn05cba2508a86"; // Replace with your actual RapidAPI key
const RAPIDAPI_HOST = "instagram-scraper-api2.p.rapidapi.com";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "profile_url") {
    const profileUrl = request.url;
    const username = extractUsernameFromUrl(profileUrl);
    if (username) {
      fetchProfileData(username);
    } else {
      console.error("Invalid profile URL:", profileUrl);
      chrome.runtime.sendMessage({
        message: "profile_data_error",
        error: "Invalid profile URL.",
      });
    }
  } else if (request.message === "get_profile_url") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { message: "get_profile_url" });
      }
    });
  }
});

function extractUsernameFromUrl(profileUrl) {
  const parts = profileUrl.split("/");
  if (parts.length >= 4) {
    return parts[3].trim(); // Trim to remove leading/trailing spaces
  }
  return null;
}

async function fetchProfileData(username) {
  const infoUrl = `https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=${username}`;
  const aboutUrl = `https://instagram-scraper-api2.p.rapidapi.com/v1/info_about?username_or_id_or_url=${username}`;

  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  };

  try {
    const [infoResponse, aboutResponse] = await Promise.all([
      fetch(infoUrl, options),
      fetch(aboutUrl, options),
    ]);

    if (!infoResponse.ok) {
      throw new Error(`API request to /v1/info failed with status ${infoResponse.status}`);
    }
     if (!aboutResponse.ok) {
        throw new Error(`API request to /v1/info_about failed with status ${aboutResponse.status}`);
    }

    const infoResult = await infoResponse.json();
    const aboutResult = await aboutResponse.json();

    console.log("info endpoint", infoResult);
    console.log("info_about enpoint", aboutResult);
    const profileData = extractProfileData(infoResult, aboutResult);
    chrome.runtime.sendMessage({ message: "profile_data", data: profileData });
  } catch (error) {
    console.error("Error fetching profile data:", error);
    chrome.runtime.sendMessage({
      message: "profile_data_error",
      error: "Failed to fetch profile data.",
    });
  }
}

function extractProfileData(infoData, aboutData) {
  if (infoData && infoData.data) {
    const data = infoData.data;
    let location = "N/A";
    let username = data.username || "";

    if (username.includes("#")) {
      username = username.replace("#", "");
    }
    if (aboutData && aboutData.data && aboutData.data.country) {
      location = aboutData.data.country;
    } else if (data.about && data.about.country) {
      // Keep the old way as a fallback
      location = data.about.country;
    }

    return {
      username: username,
      email: data.public_email || "N/A",
      followers_count: data.follower_count || "N/A",
      location: location,
      engagement_rate: "N/A", // This API doesn't provide engagement rate directly
    };
  } else {
    return {};
  }
}

