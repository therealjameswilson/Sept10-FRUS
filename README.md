# Sept10 FRUS Assist

A GitHub Pages compiler workbench for source leads relevant to a prospective
*Foreign Relations of the United States* volume on counterterrorism from
January 20 to September 10, 2001.

This repository follows the same static-site pattern as the other FRUS assist
sites in the workspace. It is designed for source triage rather than general
reading: records live in `data/records.json`, the browser mirror is
`data/records.js`, and the public page renders a searchable chronology with
source-note stubs, production gaps, local review state, and CSV export.

Version 2.0 adds a computed source-intelligence layer: retrieval priority
scoring, readiness counts, repository mix, production-gate counts, direct links
to source-sweep reports, public PDF/citation-PDF links, a compiler gap
assessment, and a priority sort for the chronology.

No public Office of the Historian volume number is assigned in this site. The
scope is named from the working brief: counterterrorism before the September 11
attacks, beginning with the Bush administration transition on January 20, 2001
and ending on September 10, 2001.

## Provisional Arrangement

1. Policy Inheritance and Review
2. Threat Surge and Domestic Warning
3. Aviation and Border Leads
4. Strategy Decision and September 10

Records inside each lane should be arranged by `sortDate`, using Washington
time where available. Each record should make its status explicit: selected
document candidate, context candidate, source collection, citation lead, or
pending review.

## Data Model

The canonical file is `data/records.json`; `data/records.js` assigns the same
array to `window.SEPT10_RECORDS` so the page can also render when opened from
the filesystem. The schema is `data/records.schema.json`, and
`data/records.sample.json` shows the preferred record shape.

The initial dataset is deliberately conservative. It includes public source
leads and declassified/cited items rather than pretending to be a complete
FRUS selection set. Many records point to the 9/11 Commission, DOJ Inspector
General, George W. Bush Library, FAS, and related public finding aids because
those sources identify underlying records that still require archival
verification.

## Compiler Workflow

The site supports:

- search across titles, summaries, source paths, people, topics, URLs, and notes
- computed retrieval-priority scoring for high-value records still needing
  original source verification
- source-intelligence panels for readiness, repository mix, and production-gate
  pressure
- filters for lane, record type, release status, selection decision, production
  issue, and local review state
- direct links to the Avalon, State FOIA, ISCAP, and FBI Review source-sweep
  reports
- a compiler gap assessment that identifies blocking retrieval and scope risks
- a reference section for GovInfo Public Papers keyword indexes
- direct PDF and citation-PDF fields, with a public PDF audit for records where
  the original cited document is still not publicly located
- copyable FRUS-style source-note stubs for record packets
- local "reviewed" marking in browser storage
- CSV export of the visible record set
- production issue flags for missing selection, source note, chronology,
  declassification, annotation, and index terms

Treat every generated source note as a working stub. Before selection or
publication, verify exact repository path, file unit, document markings, time,
participants, excisions, page spans, drafting, clearance, and distribution
against the underlying record.

## Source Anchors

- Avalon Project full PDF of the 9/11 Commission Report: <https://avalon.law.yale.edu/sept11/911report.pdf>
- Official 9/11 Commission full report PDF: <https://www.9-11commission.gov/report/911Report.pdf>
- Compiler gap assessment: <reports/compiler-gap-assessment.md>
- Avalon 9/11 Commission Report chronology notes: <reports/avalon-911-report-source-chronology.md>
- Public PDF link audit notes: <reports/public-pdf-link-audit.md>
- 9/11 Commission Report, Chapter 8, "The System Was Blinking Red": <https://govinfo.library.unt.edu/911/report/911Report_Ch8.pdf>
- 9/11 Commission Report Notes: <https://govinfo.library.unt.edu/911/report/911Report_Notes.pdf>
- 9/11 Commission Staff Statement No. 10, "Threats and Responses in 2001": <https://www.9-11commission.gov/staff_statements/staff_statement_10.pdf>
- Richard Clarke testimony to the 9/11 Commission: <https://www.9-11commission.gov/hearings/hearing8/clarke_statement.pdf>
- National Security Archive, January 25, 2001 Clarke memo PDF: <https://nsarchive2.gwu.edu/NSAEBB/NSAEBB147/clarke%20memo.pdf>
- National Security Archive, Clarke Tab A strategy attachment PDF: <https://nsarchive2.gwu.edu/NSAEBB/NSAEBB147/clarke%20attachment.pdf>
- George W. Bush Library, September 11 topic guide: <https://www.georgewbushlibrary.gov/research/topic-guides/september-11-2001-terrorist-attacks>
- George W. Bush Library, Global War on Terror topic guide: <https://www.georgewbushlibrary.gov/research/topic-guides/global-war-terror>
- George W. Bush Library FOIA 2014-0487-F, NSC meeting minutes: <https://www.georgewbushlibrary.gov/research/finding-aids/foia-requests/2014-0487-f-minutes-national-security-council-meetings-january-2001-december-2001>
- George W. Bush Library FOIA 2014-0487-F finding aid PDF: <https://www.georgewbushlibrary.gov/sites/default/files/images//20140487f-findingaid.pdf>
- George W. Bush Library FOIA 2014-0215-F, al Qaeda and Osama bin Laden: <https://www.georgewbushlibrary.gov/sites/default/files/2023-08/20140215f1-findingaid_0.pdf>
- Department of State FOIA Virtual Reading Room search: <https://foia.state.gov/FOIALIBRARY/SearchResults.aspx>
- State FOIA C05252373, April 20 Deputies Committee briefing memorandum: <https://foia.state.gov/DOCUMENTS/9-FY2013/F-2006-02981/DOC_0C05252373/C05252373.pdf>
- State FOIA C17641067, June 22 Worldwide Caution ALDAC: <https://foia.state.gov/DOCUMENTS/5-FY2014/F-2011-03409ER/DOC_0C17641067/C17641067.pdf>
- State FOIA C05192734, September 10 INR Massoud assessment: <https://foia.state.gov/DOCUMENTS/5-FY2014/F-2010-03412/DOC_0C05192734/C05192734.pdf>
- National Security Archive, State 109130 Powell-Sattar lunch PDF: <https://nsarchive2.gwu.edu/NSAEBB/NSAEBB325/doc02.pdf>
- National Security Archive FAA/TSA warning comparisons: <https://nsarchive2.gwu.edu/NSAEBB/NSAEBB137/index.htm>
- DOJ OIG, Phoenix Electronic Communication chapter: <https://oig.justice.gov/sites/default/files/archive/special/0506/chapter3.htm>
- DOJ OIG, Phoenix full-report PDF: <https://oig.justice.gov/sites/default/files/legacy/special/0506/final.pdf>
- DOJ OIG, Moussaoui investigation chapter: <https://oig.justice.gov/sites/default/files/archive/special/s0606/chapter4.htm>
- DOJ OIG, Mihdhar and Hazmi chapter: <https://oig.justice.gov/sites/default/files/archive/special/s0606/chapter5.htm>
- DOJ OIG, Moussaoui/Mihdhar-Hazmi full-report PDF: <https://oig.justice.gov/sites/default/files/legacy/special/s0606/final.pdf>
- Joint Inquiry hearing PDF with Phoenix EC supplemental materials: <https://www.govinfo.gov/content/pkg/CHRG-107jhrg96166/pdf/CHRG-107jhrg96166.pdf>
- FBI 9/11 Review Commission Report, March 2015: <https://www.fbi.gov/file-repository/reports-and-publications/final-9-11-review-commission-report-unclassified.pdf>
- FBI 9/11 Review Commission chronology notes: <reports/fbi-911-review-commission-chronology.md>
- Declassified August 6, 2001 PDB, "Bin Ladin Determined To Strike in US": <https://irp.fas.org/cia/product/pdb080601.pdf>
- NARA ISCAP Releases index: <https://www.archives.gov/declassification/iscap/releases>
- NARA ISCAP 2013-003, Presidential Decision Directive 62: <https://www.archives.gov/files/declassification/iscap/pdf/2013-003-doc1.pdf>
- NARA ISCAP 2012-048, 9/11 FBI Files: <https://www.archives.gov/declassification/iscap/pdf/2012-048.html>
- NARA ISCAP 2013-002, Air Force September 10/Vigilant Guardian records: <https://www.archives.gov/declassification/iscap/pdf/2013-002.html>
- NARA ISCAP 2012-163, Bush/Cheney 9/11 Commission MFR: <https://www.archives.gov/files/declassification/iscap/pdf/2012-163-doc-1-release-material.pdf>
- ISCAP primary-source sweep notes: <reports/iscap-primary-source-sweep.md>
- State FOIA primary-source sweep notes: <reports/state-foia-primary-source-sweep.md>
- Bush 41 counterterrorism Public Papers reference: <reports/bush41-counterterrorism-public-statements.md>
- GovInfo Bush 41 Public Papers collection: <https://www.govinfo.gov/app/collection/ppp/president-41_Bush,%20George%20H.%20W.>
- NSPD-9 public characterization: <https://irp.fas.org/offdocs/nspd/nspd-9.htm>
- FRUS production method reference: <https://history.state.gov/historicaldocuments/frus1989-92v31/abouttheseries>

## Local Preview

Run a static server from the repository root:

```bash
python3 -m http.server 4217 --bind 127.0.0.1
```

Then open <http://127.0.0.1:4217/>.

## Publish

This repository deploys through GitHub Pages with
`.github/workflows/deploy-pages.yml`. Set the repository Pages source to
GitHub Actions, then push to `main`.
