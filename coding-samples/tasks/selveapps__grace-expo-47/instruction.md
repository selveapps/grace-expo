After onboarding, Home must stay usable when today's reading fails.

A successful GET /today shows no failure banner.
A failed GET /today shows a retry and a real passage, and Reading still opens.
An empty /today payload is the same visible failure, and retry can recover.
A request that never returns still shows retry on a short frame.

Keep the error inside the tab. Do not leave the screen on an ellipsis and do not unmount the tab onto the blank background.

No new imports. The tests call the behavior described above.
