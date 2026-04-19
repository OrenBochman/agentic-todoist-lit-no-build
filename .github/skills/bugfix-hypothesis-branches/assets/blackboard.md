---
title: Blackboard
description: This is a working memory for the agent to share plans and state, or recall information from counterfactuals.
---

Use this blackboard to

1. share plans and state between agents or with the user
2. develop diagnostic plans with hypothesis on bugs elimination
3. recall information from counterfactual coding moves: such as reverted patches to stir an agent towards a successful patch.

## Bug "B - blurry photo"

## Diagnostic plan 

<!-- use a fishbone diagram for bug B documenting hypotheses -->

```{mermaid}
ishikawa-beta
    Blurry Photo
    Process
        H1 Out of focus
        H2 Shutter speed too slow
        H3 Protective film not removed
        H4 Beautification filter applied
    User
        H5 Shaky hands
    Equipment
        LENS
            H6 Inappropriate lens
            H7 Damaged lens
            H8 Dirty lens
        SENSOR
            H9 Damaged sensor
            H10 Dirty sensor
    Environment
        H11 Subject moved too quickly
        H12 Too dark
```

## Git branch "bugfix-B" with counterfactual memory

```{mermaid}
gitGraph
   gitGraph
   commit id: "main: stable-0"
   commit id: "main: feature baseline"

   branch B1
   checkout B1
   commit id: "B1: reproduce bug / define task"
   commit id: "B1: working memory baseline"

   branch B1H1
   checkout B1H1
   commit id: "H1: counterfactual memory"
   commit id: "H1: experimental patch"

   checkout B1
   commit id: "record H1 failure in memory"
   commit id: "revert H1 patch effects"

   branch B1H2
   checkout B1H2
   commit id: "H2: counterfactual memory"
   commit id: "H2: experimental patch"

   checkout B1
   commit id: "record H2 partial result"
   commit id: "revert H2 patch effects"

   branch B1H3
   checkout B1H3
   commit id: "H3: counterfactual memory"
   commit id: "H3: successful patch"

   checkout B1
   commit id: "record H3 success in memory"
   merge B1H3 id: "merge winning hypothesis H3"
   commit id: "B1: regression fixed"

   checkout main
   merge B1 id: "merge task branch B1"
   commit id: "main: stable-1"
```

- create a git branch "bugfix-B" to fix bug B - blurry photo
- based on hypothesis-1 , tried patch P1 - failure Y, reverted to git revision Z
- based on hypothesis-2, tried patch P2 - multiple regressions failing in tests T1, T2, T3, reverted to git revision Z
- based on hypothesis-3, retried with patch P3 - success all tests pass.
- merged git branch "bugfix-B" to main, 



