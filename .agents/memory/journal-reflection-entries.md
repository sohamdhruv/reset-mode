---
name: Journal holds reflection entries too
description: Reflections are auto-archived into the same Journal list; any journal-derived analytics must exclude them.
---

# Journal now contains two kinds of entries

Completed Self-Reflections are auto-saved into the same Journal list as manual urge
logs, distinguished by `kind: "reflection"` on `JournalEntry`.

## Rule
Any Journal analytics/insights (common mood, common trigger, danger-hour, the
"show insights after N entries" gate, or any future metric) must be computed from
**manual** entries only — filter `entries.filter(e => e.kind !== "reflection")`.

**Why:** reflection entries reuse `mood`/`trigger`/`date` fields (mood is mirrored
from the reflection trigger), so counting them would distort the urge-pattern
insights, which are meant to reflect logged urges, not reflections.

**How to apply:** when adding a new stat over journal entries, start from the
`manualEntries` filter, not the raw `entries` array. The list rendering itself
still shows both kinds (reflection entries get a "Reflection" badge).
