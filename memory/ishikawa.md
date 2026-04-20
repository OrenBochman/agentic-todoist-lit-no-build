---
title: "Ishikawa Beta Fish Chart for Filtered Delete Bug"
description: "Ishikawa (fishbone) diagram for diagnosing the filtered delete bug in the task app, with hypotheses on logic, data, UI, storage, and test issues."
---

## Problem

- Deleting a task in filtered view leaves the wrong task in the list.
- Failing test: should update filtered and full list correctly when deleting in filtered view (unit: edge case)
- Assertion: Pending task should remain.: expected 'done task' to equal 'pending task'
- Observed: After deleting the completed task in filtered view, the remaining task is 'done task' (should be 'pending task')


## Ishikawa (Fishbone) Diagram (beta)


<script src="https://cdn.jsdelivr.net/npm/mermaid@11.13.0/dist/mermaid.min.js"></script>
<script>
(function() { const initMermaid = () => {
        mermaid.initialize({startOnLoad: true,securityLevel: 'loose', ishikawa: { useMaxWidth: true, width: 1400, diagramPadding: 200   }        });
    };
    if (document.readyState === 'complete') {
        initMermaid();
    } else {
        window.addEventListener('load', initMermaid);
    }
    })();
</script>

<pre class="mermaid">
---
config:
  useMaxWidth: true
  diagramPadding: 200
  theme: base
  themeVariables:
    primaryColor: '#4abd59'
    lineColor: '#9ca3af'
    textColor: '#4b74c6'
    fontSize: '16px'
---
ishikawa
    Filtered Delete Bug
    Logic
        Filter 
            ❌ H1 not reapplied after delete 
               H7 property not triggering rerender
        State mutation order
            H2  tasks/filters out of sync
        Filtered list
            H3 Stale reference in UI
        Task identity
            H4 wrong task deleted
        race condition
            H5 Asynch update in Lit reactivity
    Data
        tasks array
            H6  not updated in place
    UI
        H8 Board not rerendering after delete
    Storage
        H9 localStorage out of sync with UI
    Test
        H10 Test fixture not resetting state between runs
</pre>

## Next Steps

- Formulate H2 hypothesis: State mutation order incorrect (tasks/filters out of sync)
- Create hypothesis branch for H2
- Patch and test


