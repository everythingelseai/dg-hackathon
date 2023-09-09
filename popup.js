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
      .join();

    console.log(highlightsInnerElements);

    highlightsElement.innerHTML = highlightsInnerElements;
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
      .join();

    highlightsElement.innerHTML = highlightsInnerElements;
  }
};

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    await setInitialHighlights();

    document
      .getElementById("highlight-button")
      .addEventListener("click", highlightButtonClicked, false);
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
