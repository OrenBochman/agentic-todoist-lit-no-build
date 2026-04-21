// todoist-parser-element.js
// Web component wrapper for the MVP parser (no UI)

export class TodoistParserElement extends HTMLElement {
  constructor() {
    super();
    // No shadow DOM or UI
  }

  /**
   * Parse a task string and dispatch a 'parsed' event with the result.
   * Usage: parserEl.parse(input)
   */
  parse(input) {
    const result = TodoistParserElement.parseTask(input);
    this.dispatchEvent(new CustomEvent('parsed', { detail: result }));
    return result;
  }

  // Static parser logic (from grammar.md)
  static parseTask(input) {
    console.info('[TodoistParser] Parsing input:', input);
    const meta = {
      project: input.match(/(?:^|\s)#(\w+)/)?.[1] ?? null,
      section: input.match(/(?:^|\s)\/(\w+)/)?.[1] ?? null,
      labels: [...input.matchAll(/(?:^|\s)@(\w+)/g)].map(m => m[1]),
      priority: Number(input.match(/\bp([1-4])\b/)?.[1] ?? 0) || null,
    };

    let s = input
      .replace(/(?:^|\s)[#/@]\w+/g, "")
      .replace(/\bp[1-4]\b/g, "")
      .trim();

    // --- ISO date ---
    let due = null;
    let iso = s.match(/\b(\d{4}-\d{2}-\d{2}|\d{8})\b/);

    if (iso) {
      const d = iso[1];
      due = d.length === 8
        ? new Date(`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`)
        : new Date(d);
      s = s.replace(iso[0], "").trim();
    }

    // --- keyword date ---
    if (!due) {
      if (/\btoday\b/i.test(s)) {
        due = new Date();
        s = s.replace(/\btoday\b/i, "").trim();
      }
      if (/\btomorrow\b/i.test(s)) {
        due = new Date(Date.now() + 86400000);
        s = s.replace(/\btomorrow\b/i, "").trim();
      }
    }

    // --- time ---
    let time = s.match(/\b(\d{1,2}:\d{2})\b/);
    if (time && due) {
      const [h, m] = time[1].split(":").map(Number);
      due.setHours(h, m, 0, 0);
      s = s.replace(time[0], "").trim();
    }

    // --- recurrence ---
    let recurrence = null;
    if (/every day/i.test(s)) recurrence = "DAILY";
    else if (/every week/i.test(s)) recurrence = "WEEKLY";
    else {
      const wd = s.match(/every (mon|tue|wed|thu|fri|sat|sun)/i);
      if (wd) recurrence = `WEEKLY:${wd[1].toUpperCase()}`;
    }

    const result = {
      title: s,
      due,
      recurrence,
      ...meta
    };
    console.info('[TodoistParser] Parsed result:', JSON.stringify(result));
    return {
      title: s,
      due,
      recurrence,
      ...meta
    };
  }
}

customElements.define('todoist-parser', TodoistParserElement);
