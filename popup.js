import { getActiveTabURL } from "./utils.js";

const highlightButtonClicked = async () => {
  const activeTabUrl = await getActiveTabURL();

  const getResponse = await chrome.storage.sync.get("highlightedPages");
  const newHighlightedPages =
    getResponse &&
    getResponse.highlightedPages &&
    getResponse.highlightedPages.length > 0
      ? [...new Set([...getResponse.highlightedPages, activeTabUrl])]
      : [activeTabUrl];

  await chrome.storage.sync.set({
    highlightedPages: newHighlightedPages,
  });

  const highlightsElement = document.getElementById("highlights-container");

  console.log("newHighlightedPages", newHighlightedPages);

  if (highlightsElement) {
    const highlightsInnerElements = newHighlightedPages
      .map((page) => {
        return `<div>${page}</div>`;
      })
      .join("");

    console.log(highlightsInnerElements);

    highlightsElement.innerHTML = highlightsInnerElements;
  }
};

const setInitialProfile = async () => {
  const profile = (await chrome.storage.sync.get("profile"))?.profile;

  if (profile) {
    const userInfoInput = document.getElementById("user-info-input");
    const goalsInput = document.getElementById("goals-input");
    userInfoInput.value = profile.userInfo;
    goalsInput.value = profile.goals;
  }
};

const setInitialTweet = async () => {
  const tweet = (await chrome.storage.sync.get("tweet"))?.tweet;

  if (tweet) {
    const tweetInput = document.getElementById("context-tweet-input");
    tweetInput.value = tweet;
  }
};

const setTweet = async () => {
  const tweetInput = document.getElementById("context-tweet-input");

  await chrome.storage.sync.set({
    tweet: tweetInput.value,
  });
};

const updateProfile = async () => {
  const userInfoInput = document.getElementById("user-info-input");
  const goalsInput = document.getElementById("goals-input");

  await chrome.storage.sync.set({
    profile: {
      userInfo: userInfoInput.value,
      goals: goalsInput.value,
    },
  });
};

const addEntry = async () => {
  const entry = document.getElementById("entry-input")?.value;

  if (!entry) {
    return;
  }

  const getResponse = await chrome.storage.sync.get("entries");
  const newEntries =
    getResponse && getResponse.entries && getResponse.entries.length > 0
      ? [...new Set([...getResponse.entries, entry])]
      : [entry];

  await chrome.storage.sync.set({
    entries: newEntries,
  });

  const entriesElement = document.getElementById("entries-container");

  if (entriesElement) {
    const entriesInnerElements = newEntries
      .map((page) => {
        return `<div>${page}</div>`;
      })
      .join("");

    console.log(entriesInnerElements);

    entriesElement.innerHTML = entriesInnerElements;
  }
};

const setInitialHighlights = async () => {
  const getResponse = await chrome.storage.sync.get("highlightedPages");
  const highlightsElement = document.getElementById("highlights-container");

  if (
    highlightsElement &&
    getResponse.highlightedPages &&
    getResponse.highlightedPages.length > 0
  ) {
    const highlightsInnerElements = getResponse.highlightedPages
      .map((page) => {
        return `<div>${page}</div>`;
      })
      .join("");

    highlightsElement.innerHTML = highlightsInnerElements;
  }
};

const setInitialEntries = async () => {
  const getResponse = await chrome.storage.sync.get("entries");
  const entriesElement = document.getElementById("entries-container");

  if (entriesElement && getResponse.entries && getResponse.entries.length > 0) {
    const entriesInnerElements = getResponse.entries
      .map((page) => {
        return `<div>${page}</div>`;
      })
      .join("");

    entriesElement.innerHTML = entriesInnerElements;
  }
};

const clearEverything = async () => {
  await chrome.storage.sync.set({
    entries: [],
    highlightedPages: [],
  });
};

const prepareSummary = async () => {
  const entriesResponse =
    (await chrome.storage.sync.get("entries")).entries ?? [];
  const pagesResponse =
    (await chrome.storage.sync.get("highlightedPages"))?.highlightedPages ?? [];

  for (let i = 0; i < pagesResponse.length; i++) {
    try {
      const url = pagesResponse[i];
      const summary = await smmaryRequest(url);
      entriesResponse.push(summary);
    } catch (e) {
      console.error(e);
    }
  }

  const summaryContainer = document.getElementById("summary-container");
  const first = "summary prompt:\n  Key highlights:\n";
  const last =
    "\nSummary:\n  Provide a concise 1-2 paragraph summary of the key highlights and learnings. Distill the most interesting and shareable points.\n Potential discussion questions:\n What were the 1-2 most intriguing or surprising points? Why?\n What aspects remain unclear or require further exploration?\n How could the learnings be applied to inform business strategy or public policy?\n What are the most profound implications or open questions raised?";

  const prompt = first + entriesResponse.join("\n") + last;

  const result = await openAiRequest(prompt);
  summaryContainer.innerHTML = result;
};

const prepareTweet = async () => {
  const entriesResponse =
    (await chrome.storage.sync.get("entries")).entries ?? [];
  const pagesResponse =
    (await chrome.storage.sync.get("highlightedPages"))?.highlightedPages ?? [];

  for (let i = 0; i < pagesResponse.length; i++) {
    try {
      const url = pagesResponse[i];
      const summary = await smmaryRequest(url);
      entriesResponse.push(summary);
    } catch (e) {
      console.error(e);
    }
  }

  const summaryContainer = document.getElementById("summary-container");
  const first = "tweet prompt: \nKey highlights: \n";
  const last =
    "\n  Summary: \n  Provide a concise 1-2 paragraph summary of the key highlights and learnings. Distill the most interesting and shareable points. \n  Potential discussion questions: \n  What were the 1-2 most intriguing or surprising points? Why? \nWhat aspects remain unclear or require further exploration? \nHow could the learnings be applied to inform business strategy or public policy? \nWhat are the most profound implications or open questions raised? \nTwitter thread: \nDraft 3-5 tweets that compellingly communicate the key takeaways to spark discussion on Twitter. Make them engaging and thought-provoking for the Twitter audience.";
  const prompt = first + entriesResponse.join("\n") + last;

  const result = await openAiRequest(prompt);
  summaryContainer.innerHTML = result;
};

const prepareTweetReplies = async () => {
  const entriesResponse =
    (await chrome.storage.sync.get("entries")).entries ?? [];
  const pagesResponse =
    (await chrome.storage.sync.get("highlightedPages"))?.highlightedPages ?? [];
  const profileResponse =
    (await chrome.storage.sync.get("profile"))?.profile ?? {};
  const tweetResponse =
    (await chrome.storage.sync.get("tweet"))?.tweet ?? undefined;

  for (let i = 0; i < pagesResponse.length; i++) {
    try {
      const url = pagesResponse[i];
      const summary = await smmaryRequest(encodeURIComponent(url));
      entriesResponse.push(summary);
    } catch (e) {
      console.error(e);
    }
  }

  const summaryContainer = document.getElementById("summary-container");
  const userInfot = profileResponse?.userInfo
    ? `I am ${profileResponse.userInfo}\n`
    : "";
  const goalst = !!profileResponse?.goals
    ? `My goal on Twitter is to ${profileResponse.goals}\n`
    : "";
  const userInfoText =
    userInfot +
    goalst +
    "I aim to achieve this by providing value and engaging thoughtfully with others.\n";

  const entriest = entriesResponse.join("\n");
  const highlightsText =
    "Highlights/Readings: I recently read the following highlights that have informed my perspective:" +
    entriest;

  const tweetTexts = tweetResponse
    ? `Reply-tweet info:\nI saw the following tweet: \n` + tweetResponse + "\n"
    : "";
  const finalText =
    "Based on the above information about myself, my goals, and the highlights I’ve read, provide 3 potential thoughtful, value-adding replies to the tweet that will help me achieve my Twitter objectives. Ensure the replies reference relevant context from the highlights. Write the replies in a friendly and authentic voice appropriate for Twitter.";

  const prompt = highlightsText + userInfoText + tweetTexts + finalText;

  const result = await openAiRequest(prompt);
  summaryContainer.innerHTML = result;
};

const openAiRequest = async (prompt) => {
  return new Promise((resolve, reject) => {
    // Initialize a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    // Configure the request
    xhr.open("POST", "https://api.openai.com/v1/chat/completions", true);

    const apiToken = "xxxx";
    // Set request headers
    xhr.setRequestHeader("Authorization", apiToken);
    xhr.setRequestHeader("Content-Type", "application/json");

    // Define the payload (input text, model parameters, etc.)
    var payload = JSON.stringify({
      model: "gpt-3.5-turbo-0301",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 120,
    });

    // Handle the response
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          console.log(response);
          var output = response.choices[0].message.content.trim();

          resolve(output); // Resolve the Promise with the summary
        } else {
          reject("Error: " + xhr.status); // Reject the Promise with the error status
        }
      }
    };

    // Send the request
    xhr.send(payload);
  });
};

const smmaryRequest = (url) => {
  return new Promise((resolve, reject) => {
    // Initialize a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    const apiToken = "xxxx";
    // Configure the request
    xhr.open(
      "GET",
      `https://api.smmry.com/&SM_API_KEY=${apiToken}&SM_URL=${url}`,
      true
    );

    // Handle the response
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          var summary = response.sm_api_content;
          resolve(summary); // Resolve the Promise with the summary
        } else {
          reject("Error: " + xhr.status); // Reject the Promise with the error status
        }
      }
    };

    // Send the request
    xhr.send();
  });
};

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    await setInitialHighlights();
    await setInitialEntries();
    await setInitialProfile();
    await setInitialTweet();

    document
      .getElementById("highlight-button")
      .addEventListener("click", highlightButtonClicked, false);

    document
      .getElementById("add-entry")
      .addEventListener("click", addEntry, false);

    document
      .getElementById("summary-button")
      .addEventListener("click", prepareSummary, false);

    document
      .getElementById("tweet-button")
      .addEventListener("click", prepareTweet, false);

    document
      .getElementById("tweet-replies-button")
      .addEventListener("click", prepareTweetReplies, false);

    document
      .getElementById("clear-button")
      .addEventListener("click", clearEverything, false);

    document
      .getElementById("update-profile-btn")
      .addEventListener("click", updateProfile, false);

    document
      .getElementById("add-context-tweet")
      .addEventListener("click", setTweet, false);
  },
  false
);

// document.addEventListener("DOMContentLoaded", async () => {
//   const activeTab = await getActiveTabURL();
//   const queryParameters = activeTab.url.split("?")[1];
//   const urlParameters = new URLSearchParams(queryParameters);

//   const currentVideo = urlParameters.get("v");

//   if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
//     chrome.storage.sync.get([currentVideo], (data) => {
//       const currentVideoBookmarks = data[currentVideo]
//         ? JSON.parse(data[currentVideo])
//         : [];

//       viewBookmarks(currentVideoBookmarks);
//     });
//   } else {
//     const container = document.getElementsByClassName("container")[0];

//     container.innerHTML =
//       '<div class="title">This is not a youtube video page.</div>';
//   }
// });

// const addNewBookmark = (bookmarks, bookmark) => {
//   const bookmarkTitleElement = document.createElement("div");
//   const controlsElement = document.createElement("div");
//   const newBookmarkElement = document.createElement("div");

//   bookmarkTitleElement.textContent = bookmark.desc;
//   bookmarkTitleElement.className = "bookmark-title";
//   controlsElement.className = "bookmark-controls";

//   setBookmarkAttributes("play", onPlay, controlsElement);
//   setBookmarkAttributes("delete", onDelete, controlsElement);

//   newBookmarkElement.id = "bookmark-" + bookmark.time;
//   newBookmarkElement.className = "bookmark";
//   newBookmarkElement.setAttribute("timestamp", bookmark.time);

//   newBookmarkElement.appendChild(bookmarkTitleElement);
//   newBookmarkElement.appendChild(controlsElement);
//   bookmarks.appendChild(newBookmarkElement);
// };

// const viewBookmarks = (currentBookmarks = []) => {
//   const bookmarksElement = document.getElementById("bookmarks");
//   bookmarksElement.innerHTML = "";

//   if (currentBookmarks.length > 0) {
//     for (let i = 0; i < currentBookmarks.length; i++) {
//       const bookmark = currentBookmarks[i];
//       addNewBookmark(bookmarksElement, bookmark);
//     }
//   } else {
//     bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
//   }

//   return;
// };

// const onPlay = async (e) => {
//   const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
//   const activeTab = await getActiveTabURL();

//   chrome.tabs.sendMessage(activeTab.id, {
//     type: "PLAY",
//     value: bookmarkTime,
//   });
// };

// const onDelete = async (e) => {
//   const activeTab = await getActiveTabURL();
//   const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
//   const bookmarkElementToDelete = document.getElementById(
//     "bookmark-" + bookmarkTime
//   );

//   bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

//   chrome.tabs.sendMessage(
//     activeTab.id,
//     {
//       type: "DELETE",
//       value: bookmarkTime,
//     },
//     viewBookmarks
//   );
// };

// const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
//   const controlElement = document.createElement("img");

//   controlElement.src = "assets/" + src + ".png";
//   controlElement.title = src;
//   controlElement.addEventListener("click", eventListener);
//   controlParentElement.appendChild(controlElement);
// };

// document.addEventListener("DOMContentLoaded", async () => {
//   const activeTab = await getActiveTabURL();
//   const queryParameters = activeTab.url.split("?")[1];
//   const urlParameters = new URLSearchParams(queryParameters);

//   const currentVideo = urlParameters.get("v");

//   if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
//     chrome.storage.sync.get([currentVideo], (data) => {
//       const currentVideoBookmarks = data[currentVideo]
//         ? JSON.parse(data[currentVideo])
//         : [];

//       viewBookmarks(currentVideoBookmarks);
//     });
//   } else {
//     const container = document.getElementsByClassName("container")[0];

//     container.innerHTML =
//       '<div class="title">This is not a youtube video page.</div>';
//   }
// });
