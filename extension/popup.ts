document.addEventListener('DOMContentLoaded', () => {
    const loadingDiv = document.getElementById('loading') as HTMLElement;
    const proofreadSection = document.getElementById('proofread-section') as HTMLElement;
    const proofreadOutput = document.getElementById('proofread-output') as HTMLParagraphElement;
    const rewriteSection = document.getElementById('rewrite-section') as HTMLElement;
    const rewriteOutput = document.getElementById('rewrite-output') as HTMLParagraphElement;
    const noResultsMessage = document.getElementById('no-results') as HTMLParagraphElement;

    // Function to reset display
    function resetDisplay() {
        loadingDiv.style.display = 'none';
        proofreadSection.style.display = 'none';
        rewriteSection.style.display = 'none';
        proofreadOutput.textContent = '';
        rewriteOutput.textContent = '';
        noResultsMessage.style.display = 'block'; // Show "Select text..." by default
        noResultsMessage.style.color = '#777'; // Reset error color if it was set
        noResultsMessage.textContent = 'Select text on a page and right-click to use FortiTwin AI.';
    }

    // Initialize display
    resetDisplay();

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
        resetDisplay(); // Clear previous results

        if (request.type === "SHOW_LOADING") {
            noResultsMessage.style.display = 'none';
            loadingDiv.style.display = 'block';
        } else if (request.type === "PROOFREAD_RESULT") {
            loadingDiv.style.display = 'none';
            proofreadSection.style.display = 'block';
            noResultsMessage.style.display = 'none';
            proofreadOutput.innerHTML = `<strong>Original:</strong> ${escapeHTML(request.originalText)}<br><strong>Corrected:</strong> ${escapeHTML(request.proofreadText)}`;
        } else if (request.type === "REWRITE_RESULT") {
            loadingDiv.style.display = 'none';
            rewriteSection.style.display = 'block';
            noResultsMessage.style.display = 'none';
            rewriteOutput.innerHTML = `<strong>Original:</strong> ${escapeHTML(request.originalText)}<br><strong>Rewritten:</strong> ${escapeHTML(request.rewrittenText)}`;
        } else if (request.type === "ERROR_MESSAGE") {
            loadingDiv.style.display = 'none';
            noResultsMessage.style.display = 'block';
            noResultsMessage.textContent = `Error: ${request.message}`;
            noResultsMessage.style.color = 'red';
        }
    });

    // Small helper to prevent XSS if displaying user-generated text
    function escapeHTML(str: string): string {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
});