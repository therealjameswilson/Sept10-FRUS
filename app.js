const CHAPTER_ORDER = [
  "Policy Inheritance and Review",
  "Threat Surge and Domestic Warning",
  "Aviation and Border Leads",
  "Strategy Decision and September 10"
];

const REVIEW_STORAGE_KEY = "sept10-frus-reviewed-records";

const recordsRoot = document.querySelector("#records-root");
const totalRecords = document.querySelector("#total-records");
const publicRecords = document.querySelector("#public-records");
const sourceGaps = document.querySelector("#source-gaps");
const reviewedCount = document.querySelector("#reviewed-count");
const filteredCount = document.querySelector("#filtered-count");
const searchInput = document.querySelector("#filter-search");
const chapterFilter = document.querySelector("#filter-chapter");
const typeFilter = document.querySelector("#filter-type");
const statusFilter = document.querySelector("#filter-status");
const decisionFilter = document.querySelector("#filter-decision");
const issueFilter = document.querySelector("#filter-issue");
const reviewFilter = document.querySelector("#filter-review");
const sortSelect = document.querySelector("#sort-records");
const resetButton = document.querySelector("#reset-filters");
const exportButton = document.querySelector("#export-csv");

let allRecords = [];
let visibleRecords = [];
let reviewedRecords = new Set(readReviewedRecords());

function chapterId(chapterName) {
  return `chapter-${chapterName.toLowerCase().replaceAll(" ", "-").replaceAll("/", "")}`;
}

function formatDate(dateString) {
  if (!dateString) return "Date pending";
  const date = new Date(`${dateString}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function readReviewedRecords() {
  try {
    return JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveReviewedRecords() {
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify([...reviewedRecords]));
}

function listValues(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

function joinValues(value) {
  return listValues(value).join(", ");
}

function sourcePathParts(record) {
  const source = record.source || {};
  const explicitPath = listValues(source.path);

  if (explicitPath.length) {
    return [source.repository, source.collection, ...explicitPath].filter(Boolean);
  }

  return [
    source.repository,
    source.collection,
    source.series,
    source.subseries,
    source.fileUnit,
    source.box ? `Box ${source.box}` : "",
    source.folder ? `Folder ${source.folder}` : "",
    source.itemTitle,
    source.documentId ? `Document ${source.documentId}` : "",
    source.caseNumber ? `Case ${source.caseNumber}` : "",
    record.naid && !/^not-applicable$/i.test(record.naid) ? `NAID ${record.naid}` : ""
  ].filter(Boolean);
}

function sourceMarkings(record) {
  return [
    record.originalClassification || record.classification,
    ...listValues(record.documentMarkings),
    ...listValues(record.handlingMarkings)
  ]
    .filter(Boolean)
    .join("; ");
}

function sourceTransmission(record) {
  const communication = record.communication || {};
  const notes = [];

  if (communication.from || communication.to) {
    notes.push([communication.from ? `From ${communication.from}` : "", communication.to ? `to ${communication.to}` : ""].filter(Boolean).join(" "));
  }

  if (communication.channel) notes.push(`Channel: ${communication.channel}`);
  if (record.meetingLocation) notes.push(`Location: ${record.meetingLocation}`);
  if (record.washingtonTime) notes.push(`Washington time: ${record.washingtonTime}`);

  return notes.join(". ");
}

function createSourceNoteDraft(record) {
  if (record.sourceNote) return [record.sourceNote, record.sourceNoteAddendum].filter(Boolean).join(" ");

  const path = sourcePathParts(record);
  const sentences = [path.length ? `Source: ${path.join(", ")}.` : "Source: Citation pending."];
  const markings = sourceMarkings(record);
  const transmission = sourceTransmission(record);

  if (markings) sentences.push(`${markings}.`);
  if (transmission) sentences.push(`${transmission}.`);
  if (record.sourcePages) sentences.push(`Source pages: ${record.sourcePages}.`);
  if (record.sourceNoteAddendum) sentences.push(record.sourceNoteAddendum);

  return sentences.join(" ").replace(/\s+/g, " ").trim();
}

function hasSourceCitation(record) {
  const draft = createSourceNoteDraft(record);
  return /^Source:\s+\S/i.test(draft) && !/pending|\[verify\]|\[source/i.test(draft);
}

function getProductionIssues(record) {
  if (Array.isArray(record.productionIssues)) return record.productionIssues;

  const issues = [];
  if (!record.selectionDecision || record.selectionDecision === "Pending") issues.push("needs-selection");
  if (!hasSourceCitation(record)) issues.push("needs-source");
  if (!record.date || !record.sortDate || ((record.type === "Meeting Lead" || record.type === "Document Lead") && !record.dateLine)) {
    issues.push("needs-chronology");
  }
  if (!record.declassificationStatus && /restricted|citation|not located|unknown/i.test(record.releaseStatus || "")) {
    issues.push("needs-declass");
  }
  if (!record.annotationStatus && !record.annotation) issues.push("needs-annotation");
  if (!listValues(record.indexTerms).length && !listValues(record.persons).length && !listValues(record.frusTopics).length) {
    issues.push("needs-index");
  }
  return issues;
}

function issueLabel(issue) {
  return {
    "needs-selection": "selection",
    "needs-source": "source note",
    "needs-chronology": "chronology",
    "needs-declass": "declass",
    "needs-annotation": "annotation",
    "needs-index": "index terms"
  }[issue] || issue;
}

function uniqueValues(records, selector) {
  return [...new Set(records.map(selector).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

function setOptions(select, values, allLabel) {
  if (!select) return;
  const current = select.value;
  const options = [new Option(allLabel, "")];
  for (const value of values) options.push(new Option(value, value));
  select.replaceChildren(...options);
  if (values.includes(current)) select.value = current;
}

function setWorkbenchOptions(records) {
  setOptions(chapterFilter, CHAPTER_ORDER, "All lanes");
  setOptions(typeFilter, uniqueValues(records, (record) => record.type), "All types");
  setOptions(statusFilter, uniqueValues(records, (record) => record.releaseStatus), "All statuses");
  setOptions(decisionFilter, uniqueValues(records, (record) => record.selectionDecision), "All decisions");
}

function searchableText(record) {
  return [
    record.id,
    record.title,
    record.documentTitle,
    record.type,
    record.releaseStatus,
    record.selectionDecision,
    record.summary,
    record.editorialUse,
    record.dateLine,
    record.subjectLine,
    record.naid,
    record.catalogUrl,
    record.pdfUrl,
    record.source?.repository,
    record.source?.collection,
    record.source?.series,
    record.source?.caseNumber,
    sourcePathParts(record).join(" "),
    createSourceNoteDraft(record),
    joinValues(record.participants),
    joinValues(record.persons),
    joinValues(record.countries),
    joinValues(record.frusTopics),
    joinValues(record.indexTerms),
    joinValues(record.citedBy)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function setCounts(records) {
  totalRecords.textContent = records.length.toString();
  publicRecords.textContent = records
    .filter((record) => /public|declassified|released|full/i.test(record.releaseStatus || "") || record.pdfUrl)
    .length.toString();
  sourceGaps.textContent = records.filter((record) => getProductionIssues(record).includes("needs-source")).length.toString();
  reviewedCount.textContent = records.filter((record) => reviewedRecords.has(record.id)).length.toString();

  for (const chapterName of CHAPTER_ORDER) {
    const countNode = document.querySelector(`[data-chapter-count="${chapterName}"]`);
    if (countNode) {
      countNode.textContent = records.filter((record) => record.chapter?.name === chapterName).length.toString();
    }
  }
}

function selectedFilters() {
  return {
    query: searchInput?.value.trim().toLowerCase() || "",
    chapter: chapterFilter?.value || "",
    type: typeFilter?.value || "",
    status: statusFilter?.value || "",
    decision: decisionFilter?.value || "",
    issue: issueFilter?.value || "",
    review: reviewFilter?.value || ""
  };
}

function recordMatchesFilters(record, filters) {
  if (filters.query && !searchableText(record).includes(filters.query)) return false;
  if (filters.chapter && record.chapter?.name !== filters.chapter) return false;
  if (filters.type && record.type !== filters.type) return false;
  if (filters.status && record.releaseStatus !== filters.status) return false;
  if (filters.decision && record.selectionDecision !== filters.decision) return false;
  if (filters.issue && !getProductionIssues(record).includes(filters.issue)) return false;
  if (filters.review === "open" && reviewedRecords.has(record.id)) return false;
  if (filters.review === "reviewed" && !reviewedRecords.has(record.id)) return false;
  return true;
}

function byChapterThenDate(a, b) {
  return (
    (a.chapter?.number || 99) - (b.chapter?.number || 99) ||
    (a.sortDate || a.date || "").localeCompare(b.sortDate || b.date || "") ||
    a.title.localeCompare(b.title)
  );
}

function byDate(a, b) {
  return (a.sortDate || a.date || "").localeCompare(b.sortDate || b.date || "") || a.title.localeCompare(b.title);
}

function sortRecords(records) {
  const sorted = [...records];
  const mode = sortSelect?.value || "chapter-date";

  if (mode === "date") return sorted.sort(byDate);
  if (mode === "issue") return sorted.sort((a, b) => getProductionIssues(b).length - getProductionIssues(a).length || byChapterThenDate(a, b));
  if (mode === "type") return sorted.sort((a, b) => a.type.localeCompare(b.type) || byChapterThenDate(a, b));
  return sorted.sort(byChapterThenDate);
}

function applyFilters() {
  const filters = selectedFilters();
  visibleRecords = sortRecords(allRecords.filter((record) => recordMatchesFilters(record, filters)));
  renderRecords(visibleRecords);
  setCounts(allRecords);
  setFilteredCount();
}

function setFilteredCount() {
  const reviewed = visibleRecords.filter((record) => reviewedRecords.has(record.id)).length;
  filteredCount.textContent = `Showing ${visibleRecords.length} of ${allRecords.length} records; ${reviewed} marked reviewed in this browser.`;
}

function createMeta(record) {
  const meta = document.createElement("div");
  meta.className = "record-meta";

  for (const value of [
    record.type,
    record.selectionDecision,
    record.releaseStatus,
    record.source?.repository,
    record.source?.caseNumber,
    record.naid && record.naid !== "not-applicable" ? `NAID ${record.naid}` : "",
    record.pageCount ? `${record.pageCount} pages` : ""
  ]) {
    if (!value) continue;
    const item = document.createElement("span");
    item.textContent = value;
    meta.append(item);
  }

  return meta;
}

function createParagraph(className, text) {
  const paragraph = document.createElement("p");
  paragraph.className = className;
  paragraph.textContent = text;
  return paragraph;
}

function createTagList(record) {
  const terms = [...new Set([...listValues(record.frusTopics), ...listValues(record.indexTerms)])];
  if (!terms.length) return null;

  const list = document.createElement("div");
  list.className = "tag-list";
  for (const term of terms) {
    const item = document.createElement("span");
    item.textContent = term;
    list.append(item);
  }
  return list;
}

function createProductionBlock(record) {
  const block = document.createElement("div");
  block.className = "production-block";
  const issues = getProductionIssues(record);

  const status = document.createElement("p");
  status.className = issues.length ? "gate-status has-gaps" : "gate-status ready";
  status.textContent = issues.length ? `Production gaps: ${issues.map(issueLabel).join(", ")}` : "Production gates ready";
  block.append(status);

  const list = document.createElement("dl");
  list.className = "production-list";
  const rows = [
    ["Source path", sourcePathParts(record).join(" / ") || "Pending"],
    ["Markings", sourceMarkings(record) || "Pending"],
    ["Date line", record.dateLine || formatDate(record.date)],
    ["People", joinValues(record.persons) || joinValues(record.participants) || "Pending"],
    ["Countries", joinValues(record.countries) || "Pending"],
    ["Cited by", joinValues(record.citedBy) || "Pending"],
    ["Declass", record.declassificationStatus || record.releaseStatus || "Pending"]
  ];

  for (const [term, value] of rows) {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = value;
    row.append(dt, dd);
    list.append(row);
  }

  block.append(list);
  return block;
}

function createRecordActions(record) {
  const actions = document.createElement("div");
  actions.className = "record-actions";

  const reviewButton = document.createElement("button");
  reviewButton.type = "button";
  reviewButton.dataset.action = "toggle-review";
  reviewButton.dataset.recordId = record.id;
  reviewButton.textContent = reviewedRecords.has(record.id) ? "Reviewed" : "Mark reviewed";

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.dataset.action = "copy-note";
  copyButton.dataset.recordId = record.id;
  copyButton.textContent = "Copy source stub";

  actions.append(reviewButton, copyButton);
  return actions;
}

function createLinks(record) {
  const links = document.createElement("div");
  links.className = "record-links";

  const linkData = [
    [record.catalogUrl, record.naid && record.naid !== "not-applicable" ? "Catalog" : "Source"],
    [record.pdfUrl, "Open PDF"],
    [record.transcriptionUrl, "Transcript"],
    [record.source?.url, "Finding Aid"]
  ];

  for (const [href, label] of linkData) {
    if (!href) continue;
    const link = document.createElement("a");
    link.href = href;
    link.rel = "noreferrer";
    link.textContent = label;
    links.append(link);
  }

  return links;
}

function createRecordRow(record) {
  const row = document.createElement("article");
  row.className = "record-row";
  if (reviewedRecords.has(record.id)) row.classList.add("is-reviewed");

  const date = document.createElement("time");
  date.className = "record-date";
  date.dateTime = record.date || "";
  date.textContent = formatDate(record.date);

  const body = document.createElement("div");
  const title = document.createElement(record.catalogUrl || record.pdfUrl ? "a" : "span");
  title.className = "record-title";
  if (record.catalogUrl || record.pdfUrl) {
    title.href = record.catalogUrl || record.pdfUrl;
    title.rel = "noreferrer";
  }
  title.textContent = record.documentTitle || record.title;

  body.append(title, createMeta(record));
  if (record.summary) body.append(createParagraph("record-summary", record.summary));
  if (record.editorialUse) body.append(createParagraph("record-editorial", `Editorial use: ${record.editorialUse}`));

  const tags = createTagList(record);
  if (tags) body.append(tags);

  body.append(createParagraph("record-source-note", `Source-note stub: ${createSourceNoteDraft(record)}`));
  body.append(createProductionBlock(record));
  body.append(createRecordActions(record));

  row.append(date, body, createLinks(record));
  return row;
}

function createEmptyState() {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = "No records match the current filters.";
  return empty;
}

function renderRecords(records) {
  recordsRoot.replaceChildren();
  if (!records.length) {
    recordsRoot.append(createEmptyState());
    return;
  }

  for (const chapterName of CHAPTER_ORDER) {
    const chapterRecords = records.filter((record) => record.chapter?.name === chapterName);
    if (!chapterRecords.length) continue;

    const section = document.createElement("section");
    section.className = "record-chapter";
    section.id = chapterId(chapterName);

    const header = document.createElement("div");
    header.className = "record-chapter-header";

    const heading = document.createElement("h3");
    heading.textContent = `Lane ${CHAPTER_ORDER.indexOf(chapterName) + 1}: ${chapterName}`;

    const count = document.createElement("p");
    count.className = "record-count";
    count.textContent = `${chapterRecords.length} records`;

    const list = document.createElement("div");
    list.className = "record-list";
    for (const record of chapterRecords) list.append(createRecordRow(record));

    header.append(heading, count);
    section.append(header, list);
    recordsRoot.append(section);
  }
}

function resetFilters() {
  for (const control of [searchInput, chapterFilter, typeFilter, statusFilter, decisionFilter, issueFilter, reviewFilter]) {
    if (control) control.value = "";
  }
  if (sortSelect) sortSelect.value = "chapter-date";
  applyFilters();
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function exportVisibleRecords() {
  const headers = [
    "lane",
    "date",
    "type",
    "selection_decision",
    "release_status",
    "reviewed",
    "title",
    "source_path",
    "source_note_stub",
    "catalog_url",
    "pdf_url",
    "issues",
    "topics"
  ];

  const rows = visibleRecords.map((record) =>
    [
      record.chapter?.name,
      record.date,
      record.type,
      record.selectionDecision,
      record.releaseStatus,
      reviewedRecords.has(record.id) ? "yes" : "no",
      record.documentTitle || record.title,
      sourcePathParts(record).join(" / "),
      createSourceNoteDraft(record),
      record.catalogUrl,
      record.pdfUrl,
      getProductionIssues(record).join("; "),
      [...listValues(record.frusTopics), ...listValues(record.indexTerms)].join("; ")
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sept10-frus-visible-records.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function compilerStub(record) {
  return [
    `${formatDate(record.date)} - ${record.documentTitle || record.title}`,
    `Lane: ${record.chapter?.name || "Pending"}`,
    `Type: ${record.type}`,
    `Decision: ${record.selectionDecision || "Pending"}`,
    `Release: ${record.releaseStatus || "Pending"}`,
    `Source path: ${sourcePathParts(record).join(" / ") || "Pending"}`,
    `Source-note stub: ${createSourceNoteDraft(record)}`,
    `Source URL: ${record.catalogUrl || record.source?.url || ""}`,
    `PDF: ${record.pdfUrl || ""}`,
    `Topics: ${[...listValues(record.frusTopics), ...listValues(record.indexTerms)].join(", ") || "Pending"}`,
    `Production gaps: ${getProductionIssues(record).map(issueLabel).join(", ") || "none"}`,
    "FRUS verification: confirm exact repository path, markings, date/time, participants, source pages, excisions, distribution, drafting, clearance, and related-document annotation before publication."
  ].join("\n");
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

function flashButton(button, label) {
  const original = button.textContent;
  button.textContent = label;
  window.setTimeout(() => {
    button.textContent = original;
  }, 1400);
}

function handleRecordAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const record = allRecords.find((item) => item.id === button.dataset.recordId);
  if (!record) return;

  if (button.dataset.action === "toggle-review") {
    if (reviewedRecords.has(record.id)) reviewedRecords.delete(record.id);
    else reviewedRecords.add(record.id);
    saveReviewedRecords();
    applyFilters();
    return;
  }

  if (button.dataset.action === "copy-note") {
    copyText(compilerStub(record))
      .then((copied) => flashButton(button, copied ? "Copied" : "Copy failed"))
      .catch(() => flashButton(button, "Copy failed"));
  }
}

function enableChapterCards() {
  for (const card of document.querySelectorAll(".chapter-card")) {
    card.addEventListener("click", (event) => {
      const targetId = card.getAttribute("href");
      if (!targetId?.startsWith("#")) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      history.pushState(null, "", targetId);
      target.scrollIntoView({ block: "start" });
    });
  }
}

function bindWorkbench() {
  for (const control of [searchInput, chapterFilter, typeFilter, statusFilter, decisionFilter, issueFilter, reviewFilter, sortSelect]) {
    control?.addEventListener("input", applyFilters);
    control?.addEventListener("change", applyFilters);
  }

  resetButton?.addEventListener("click", resetFilters);
  exportButton?.addEventListener("click", exportVisibleRecords);
  recordsRoot.addEventListener("click", handleRecordAction);
}

async function loadRecords() {
  const response = await fetch("data/records.json");
  if (!response.ok) throw new Error(`Could not load records: ${response.status}`);
  return response.json();
}

async function init() {
  try {
    allRecords = window.SEPT10_RECORDS || (await loadRecords());
    setWorkbenchOptions(allRecords);
    bindWorkbench();
    applyFilters();
    enableChapterCards();
    if (window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView();
  } catch (error) {
    recordsRoot.innerHTML =
      '<p class="error">The records could not be loaded. Try opening this site through a local server or GitHub Pages.</p>';
  }
}

init();
