// This listener runs only when the extension is installed or updated.
// It's the perfect place to set up persistent things like context menus.
chrome.runtime.onInstalled.addListener(() => {
  console.log("FortiTwin Extension Installed/Updated. Setting up context menus.");

  // removeAll ensures a clean slate during development and updates.
  chrome.contextMenus.removeAll(() => {
    // Create the proofread menu item
    chrome.contextMenus.create({
      id: "fortitwin_proofread",
      title: "FortiTwin: Proofread Selected Text",
      contexts: ["selection"]
    });

    // Create the rewrite menu item
    chrome.contextMenus.create({
      id: "fortitwin_rewrite",
      title: "FortiTwin: Rewrite Selected Text",
      contexts: ["selection"]
    });
  });
});

// Listener for when a user clicks on a context menu item
chrome.contextMenus.onClicked.addListener(async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  if (!info.selectionText) {
    return;
  }

  const selectedText = info.selectionText;
  chrome.runtime.sendMessage({ type: "SHOW_LOADING" });

  if (info.menuItemId === "fortitwin_proofread") {
    try {
      // Check for availability right before using the API
      if ((await chrome.ai.text.availability({ text: ["proofreader"] })) !== 'available') {
        throw new Error("Proofreader model is not available. Check chrome://on-device-internals.");
      }
      const proofreader = await chrome.ai.text.create({ text: ["proofreader"] });
      const result = await proofreader.proofread(selectedText);
      chrome.runtime.sendMessage({
        type: "PROOFREAD_RESULT",
        originalText: selectedText,
        proofreadText: result.proofreadText,
        edits: result.edits
      });
    } catch (error: any) {
      console.error("Error during proofreading:", error);
      chrome.runtime.sendMessage({ type: "ERROR_MESSAGE", message: error.message || "Error proofreading text." });
    }
  } else if (info.menuItemId === "fortitwin_rewrite") {
    try {
      // Check for availability right before using the API
      if ((await chrome.ai.text.availability({ text: ["rewriter"] })) !== 'available') {
        throw new Error("Rewriter model is not available. Check chrome://on-device-internals.");
      }
      const rewriter = await chrome.ai.text.create({ text: ["rewriter"] });
      const result = await rewriter.rewrite(selectedText);
      chrome.runtime.sendMessage({
        type: "REWRITE_RESULT",
        originalText: selectedText,
        rewrittenText: result.candidates[0].text
      });
    } catch (error: any) {
      console.error("Error during rewriting:", error);
      chrome.runtime.sendMessage({ type: "ERROR_MESSAGE", message: error.message || "Error rewriting text." });
    }
  }
});