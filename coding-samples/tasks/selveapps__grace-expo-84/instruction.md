Chapter pages use one type size. Add the four sizes from the iOS preferences screen.

S is 0.9, M is 1, L is 1.15, XL is 1.3.
A missing or unknown choice is M.
The choice is stored in the browser and applied to the verse text.
It is not sent to grace-api. Do not add a profile field.
Night theme, audio speed, and a second scripture store are out of scope.

The hidden tests import:
- `describe, expect, it` from `vitest`
- `normalizeTypeSize, typeSizeBootScript, verseFontSize` from `./typeSize`
