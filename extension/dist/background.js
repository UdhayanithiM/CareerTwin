"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// This listener runs only when the extension is installed or updated.
// It's the perfect place to set up persistent things like context menus.
chrome.runtime.onInstalled.addListener(function () {
    console.log("FortiTwin Extension Installed/Updated. Setting up context menus.");
    // removeAll ensures a clean slate during development and updates.
    chrome.contextMenus.removeAll(function () {
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
chrome.contextMenus.onClicked.addListener(function (info, tab) { return __awaiter(void 0, void 0, void 0, function () {
    var selectedText, proofreader, result, error_1, rewriter, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!info.selectionText) {
                    return [2 /*return*/];
                }
                selectedText = info.selectionText;
                chrome.runtime.sendMessage({ type: "SHOW_LOADING" });
                if (!(info.menuItemId === "fortitwin_proofread")) return [3 /*break*/, 7];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, chrome.ai.text.availability({ text: ["proofreader"] })];
            case 2:
                // Check for availability right before using the API
                if ((_a.sent()) !== 'available') {
                    throw new Error("Proofreader model is not available. Check chrome://on-device-internals.");
                }
                return [4 /*yield*/, chrome.ai.text.create({ text: ["proofreader"] })];
            case 3:
                proofreader = _a.sent();
                return [4 /*yield*/, proofreader.proofread(selectedText)];
            case 4:
                result = _a.sent();
                chrome.runtime.sendMessage({
                    type: "PROOFREAD_RESULT",
                    originalText: selectedText,
                    proofreadText: result.proofreadText,
                    edits: result.edits
                });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.error("Error during proofreading:", error_1);
                chrome.runtime.sendMessage({ type: "ERROR_MESSAGE", message: error_1.message || "Error proofreading text." });
                return [3 /*break*/, 6];
            case 6: return [3 /*break*/, 13];
            case 7:
                if (!(info.menuItemId === "fortitwin_rewrite")) return [3 /*break*/, 13];
                _a.label = 8;
            case 8:
                _a.trys.push([8, 12, , 13]);
                return [4 /*yield*/, chrome.ai.text.availability({ text: ["rewriter"] })];
            case 9:
                // Check for availability right before using the API
                if ((_a.sent()) !== 'available') {
                    throw new Error("Rewriter model is not available. Check chrome://on-device-internals.");
                }
                return [4 /*yield*/, chrome.ai.text.create({ text: ["rewriter"] })];
            case 10:
                rewriter = _a.sent();
                return [4 /*yield*/, rewriter.rewrite(selectedText)];
            case 11:
                result = _a.sent();
                chrome.runtime.sendMessage({
                    type: "REWRITE_RESULT",
                    originalText: selectedText,
                    rewrittenText: result.candidates[0].text
                });
                return [3 /*break*/, 13];
            case 12:
                error_2 = _a.sent();
                console.error("Error during rewriting:", error_2);
                chrome.runtime.sendMessage({ type: "ERROR_MESSAGE", message: error_2.message || "Error rewriting text." });
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); });
