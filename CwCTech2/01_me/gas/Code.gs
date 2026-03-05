/**
 * Google Apps Script Web App entrypoint.
 * Data source: Google Sheets (Profile / Skills / About).
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.api === "1") {
    return ContentService
      .createTextOutput(JSON.stringify(getResumeData_()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var t = HtmlService.createTemplateFromFile("Index");
  t.data = getResumeData_();
  return t
    .evaluate()
    .setTitle(t.data.pageTitle || "個人履歷")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function getResumeData_() {
  var profile = getProfileMap_();
  var avatarUrl = normalizeImageUrl_(profile.avatarUrl);
  var heroImageUrl = normalizeImageUrl_(profile.heroImageUrl);
  return {
    pageTitle: profile.pageTitle || "陳小奇｜個人履歷",
    displayName: profile.displayName || "陳小奇",
    tagline: profile.tagline || "AI × 系統開發 × 網頁設計",
    birthDate: profile.birthDate || "2000/06/01",
    email: profile.email || "cwccahnnel@icloud.com",
    education: profile.education || "CwC碩士",
    experience: profile.experience || "網頁程式設計師、系統開發工程師",
    avatarUrl: avatarUrl || "https://lh3.googleusercontent.com/d/1_QIxRlUTlTQ-K2AFLxqZIN1RaI4D8pZQ=s1200",
    heroImageUrl: heroImageUrl || "https://picsum.photos/1200/800",
    skills: getSkills_(),
    aboutParagraphs: getAboutParagraphs_()
  };
}

function normalizeImageUrl_(url) {
  var raw = (url || "").toString().trim();
  if (!raw) return "";

  // Convert Google Drive share links to direct image links.
  // Prefer lh3.googleusercontent.com for <img> compatibility.
  var fileIdMatch = raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return "https://lh3.googleusercontent.com/d/" + fileIdMatch[1] + "=s1200";
  }

  var openIdMatch = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch && openIdMatch[1] && raw.indexOf("drive.google.com") !== -1) {
    return "https://lh3.googleusercontent.com/d/" + openIdMatch[1] + "=s1200";
  }

  // If user already uses lh3 format, keep it.
  if (raw.indexOf("lh3.googleusercontent.com") !== -1) {
    return raw;
  }

  return raw;
}

function getProfileMap_() {
  var sheet = getSheet_("Profile");
  var values = sheet.getDataRange().getValues();
  var map = {};

  for (var i = 1; i < values.length; i++) {
    var key = (values[i][0] || "").toString().trim();
    if (!key) continue;
    map[key] = (values[i][1] || "").toString().trim();
  }
  return map;
}

function getSkills_() {
  var sheet = getSheet_("Skills");
  var values = sheet.getDataRange().getValues();
  var list = [];

  for (var i = 1; i < values.length; i++) {
    var text = (values[i][1] || "").toString().trim();
    if (!text) continue;
    list.push({
      sort: Number(values[i][0]) || 9999,
      text: text
    });
  }

  list.sort(function(a, b) {
    return a.sort - b.sort;
  });

  return list.map(function(item) {
    return item.text;
  });
}

function getAboutParagraphs_() {
  var sheet = getSheet_("About");
  var values = sheet.getDataRange().getValues();
  var list = [];

  for (var i = 1; i < values.length; i++) {
    var text = (values[i][1] || "").toString().trim();
    if (!text) continue;
    list.push({
      sort: Number(values[i][0]) || 9999,
      text: text
    });
  }

  list.sort(function(a, b) {
    return a.sort - b.sort;
  });

  return list.map(function(item) {
    return item.text;
  });
}

function getSheet_(name) {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  var ss = spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    throw new Error("找不到工作表: " + name + "，請先執行 setupAllSheets()");
  }
  return sheet;
}

/**
 * Spreadsheet menu.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("履歷網站設定")
    .addItem("Setup 全部工作表", "setupAllSheets")
    .addItem("建立預設資料", "createDefaultSheets")
    .addToUi();
}

/**
 * One-click setup:
 * 1) use SPREADSHEET_ID (if set) or active spreadsheet
 * 2) create Profile / Skills / About sheets
 * 3) write sample data
 */
function setupAllSheets() {
  var ss = getSetupSpreadsheet_();
  createProfileSheet_(ss);
  createSkillsSheet_(ss);
  createAboutSheet_(ss);
  return "Setup completed: " + ss.getUrl();
}

/**
 * Backward-compatible function name.
 */
function createDefaultSheets() {
  return setupAllSheets();
}

/**
 * Set target spreadsheet for standalone GAS projects.
 */
function setSpreadsheetId(spreadsheetId) {
  if (!spreadsheetId) {
    throw new Error("請提供 spreadsheetId");
  }
  PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", spreadsheetId);
  return "SPREADSHEET_ID saved: " + spreadsheetId;
}

function getSetupSpreadsheet_() {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error("找不到 Active Spreadsheet，請先執行 setSpreadsheetId(spreadsheetId)");
  }
  return active;
}

function createProfileSheet_(ss) {
  var sheet = ss.getSheetByName("Profile") || ss.insertSheet("Profile");
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 2).setValues([["key", "value"]]);
  sheet.getRange(2, 1, 9, 2).setValues([
    ["pageTitle", "陳小奇｜個人履歷"],
    ["displayName", "陳小奇"],
    ["tagline", "AI × 系統開發 × 網頁設計"],
    ["birthDate", "2000/06/01"],
    ["email", "cwccahnnel@icloud.com"],
    ["education", "CwC碩士"],
    ["experience", "網頁程式設計師、系統開發工程師"],
    ["avatarUrl", "https://drive.google.com/file/d/1_QIxRlUTlTQ-K2AFLxqZIN1RaI4D8pZQ/view?usp=sharing"],
    ["heroImageUrl", "https://raw.githubusercontent.com/<your-user>/<your-repo>/main/01_me/images/studio.jpg"]
  ]);
  sheet.autoResizeColumns(1, 2);
}

function createSkillsSheet_(ss) {
  var sheet = ss.getSheetByName("Skills") || ss.insertSheet("Skills");
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 2).setValues([["sort", "skill"]]);
  sheet.getRange(2, 1, 3, 2).setValues([
    [1, "AI 技術整合與應用"],
    [2, "系統架構設計與開發"],
    [3, "現代化網頁設計與前端開發"]
  ]);
  sheet.autoResizeColumns(1, 2);
}

function createAboutSheet_(ss) {
  var sheet = ss.getSheetByName("About") || ss.insertSheet("About");
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 2).setValues([["sort", "paragraph"]]);
  sheet.getRange(2, 1, 3, 2).setValues([
    [1, "我叫陳小奇，2000 年出生，畢業於 CwC 碩士學程，專業橫跨 AI、系統開發與網頁設計。過去我曾擔任網頁程式設計師與系統開發工程師，累積多年從前端介面到後端架構的實戰經驗，專注於打造穩定、高效且可擴充的數位產品。我深信，科技的價值不在於炫技，而在於真正解決問題、提升效率並創造新的可能性。"],
    [2, "創業對我而言，不只是建立一家公司，而是建構一套能持續進化的系統思維。我將 AI 技術與產品設計結合，優化開發流程，提升用戶體驗，同時降低企業的營運成本。我善於從 0 到 1 架構完整系統，也能從 1 到 100 持續優化與規模化成長。"],
    [3, "我的願景是打造一個以創新為核心、以實用為導向的科技平台，讓技術不再只是工具，而是驅動創作者與企業突破界線的引擎。我期待與志同道合的夥伴合作，一起用技術創造真正有影響力的產品與價值。"]
  ]);
  sheet.autoResizeColumns(1, 2);
}
