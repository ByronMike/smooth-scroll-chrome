# Privacy Policy for Smooth Scroll Chrome

**Last updated:** December 2025

## Overview

Smooth Scroll Chrome is committed to protecting your privacy. This privacy policy explains what data the extension collects and how it is used.

## Data Collection

**Smooth Scroll Chrome does NOT collect, transmit, or share any personal data.**

### What We Store Locally

The extension stores the following data locally on your device using Chrome's built-in storage API (`chrome.storage.local`):

- **Scroll speed preferences** (speed preset and multiplier settings)
- **Widget position** (where you placed the floating widget on screen)
- **Widget visibility state** (whether the widget is shown or hidden)

This data:
- Never leaves your device
- Is not transmitted to any server
- Is not shared with any third parties
- Is only used to remember your preferences between sessions

### What We Do NOT Collect

- No personal information
- No browsing history
- No website content
- No analytics or usage tracking
- No cookies
- No advertising identifiers

## Permissions Explained

### `activeTab`
This permission allows the extension to interact with the currently active tab when you click the extension icon. It is required to inject the scrolling functionality into web pages.

### `storage`
This permission allows the extension to save your preferences (scroll speed, widget position) locally on your device so they persist between browser sessions.

### Content Scripts (`<all_urls>`)
The extension runs on all URLs to provide scrolling functionality on any webpage you visit. The content scripts only control scrolling behavior and do not read, collect, or transmit any page content.

## Data Security

All data is stored locally using Chrome's secure storage API and is protected by Chrome's built-in security measures.

## Changes to This Policy

If we make changes to this privacy policy, we will update the "Last updated" date at the top of this document.

## Contact

If you have questions about this privacy policy, please open an issue on our GitHub repository.

## Open Source

This extension is open source. You can review the complete source code to verify these privacy practices.
