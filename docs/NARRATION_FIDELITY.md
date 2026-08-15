# Narration fidelity review

Covers the 16 Story parts in `backend/src/lib/narrationScripts.ts` and the 30 Tea
bodies in `backend/src/lib/teaCatalog.ts`, rewritten 2026-07-29.

**Source of truth.** 44 KJV chapters were fetched from bible-api.com (KJV, public
domain) and used as the factual base, not recall. 1,377 verses. Every distinctive
quoted or closely paraphrased phrase in the new scripts (76 sampled) was
machine-checked back against that corpus: **76/76 present.**

**Rules applied.** No invented events, dialogue, miracles, relationships or
outcomes. Biblical speech quoted or paraphrased, never fabricated. Added cultural,
linguistic or historical context is marked *inside the narration* ("Scripture does
not tell us", "that is tradition talking, not the text") so inference is never
presented as biblical fact. Theological meaning not altered for drama.

**Speaking rate** is measured, not assumed: 217 wpm for the Tea sassy preset
(from 30 rendered clips) and 137 to 154 wpm for the story presets (derived from
the 155 wpm bold-preset onboarding render, adjusted for each preset's `speed`).

---

## 1. Stories

| ID | Title | Scripture source | Words | Est. duration | Fidelity notes |
|---|---|---|---|---|---|
| `ruth-stays` p1 | Ruth stays | Ruth 1:1-14 | 542 | 3:43 | Events, names, the ~10 years and all three deaths explicit. **Interpretation:** "Bethlehem means house of bread" (Hebrew etymology, not in the text); "not only grief, it was exposure" (widowhood context); "Orpah is not the villain, she obeyed" is the narrator's reading, grounded in Naomi telling them to return twice (vv8, 11-12). Narration flags the silence: "Scripture does not tell us what anyone said." |
| `ruth-stays` p2 | Ruth stays | Ruth 1:15-22 | 527 | 3:37 | Vow quoted verbatim (vv16-17). "Gods, plural" is the text's own wording (v15). **Interpretation:** Naomi/Mara meanings are Hebrew, though the text supplies the sense ("dealt very bitterly"). Gleaning right is Lev 19:9-10 / Deut 24:19, cross-referenced, not stated in Ruth 1. |
| `ruth-stays` p3 | Ruth stays | Ruth 2 (+ Lev 19:9-10; Deut 24:19) | 598 | 4:06 | Boaz's protection order, the water, the meal, the deliberate dropped grain and the ephah are all explicit. **Interpretation:** "the narrator is being coy" about *her hap* (v3) is a literary reading, presented as one. |
| `ruth-stays` p4 | Ruth stays | Ruth 3-4 (+ Deut 25:5-10; Lev 25:25) | 599 | 4:06 | Threshing-floor scene held strictly to the text, including Boaz guarding her reputation (3:14). Shoe custom explained by the text itself (4:7). Women name Obed (4:17). **Interpretation:** the kinsman-redeemer summary draws on the wider law, cross-referenced. "Town gate is where legal business was done" is inferred from 4:1-2. |
| `esther-uninvited` p1 | Esther walks in uninvited | Esther 3:1-15; 4:1-3 | 533 | 3:28 | Haman's speech, the ten thousand talents, the ring, the decree's wording and the drink after signing are verbatim or close. **Interpretation:** "He does not even ask who they are" is an argument from silence (3:10-11 records no inquiry); "the oldest speech in the world" is commentary, not a claim. |
| `esther-uninvited` p2 | Esther walks in uninvited | Esther 4:4-14 | 529 | 3:26 | The law, the sceptre exception, the thirty days and Mordecai's reply are quoted closely. Theology of 4:14 handled precisely: deliverance arises regardless, Esther may miss it. **Interpretation:** "he leaves her free to choose" reads the interrogative form, and the narration shows the question rather than asserting the conclusion. |
| `esther-uninvited` p3 | Esther walks in uninvited | Esther 4:15-17; 5:1-8 | 529 | 3:26 | Three-day fast, "if I perish, I perish", royal apparel, the sceptre, the double offer of half the kingdom, both banquets: all explicit. **Explicit hedge in copy:** "Scripture does not tell us why she waits... I am not going to invent it for her." |
| `esther-uninvited` p4 | Esther walks in uninvited | Esther 5:9-14; 7:1-10 | 596 | 3:52 | Haman's boast, Zeresh's advice, the fifty-cubit gallows at his own house, the third offer, the accusation, the garden, the couch, Harbonah, the hanging: all explicit. No embellishment of the ending. |
| `davids-rooftop` p1 | David's rooftop era | 2 Samuel 11:1-5 | 571 | 4:05 | **Deliberately restrained.** The narration states outright that the text gives Bathsheba no dialogue and no described intent, and that filling that silence is "adding to the Bible". Verbs ("took") are the text's. **Interpretation:** "a warning dressed up as information" reads the servant's reply (v3); "at the front for weeks" infers duration from the siege (v1). |
| `davids-rooftop` p2 | David's rooftop era | 2 Samuel 11:6-27 | 600 | 4:17 | Uriah's speech, the deliberate drunkenness, the letter carried by its victim, Joab's coaching, "the sword devoureth one as well as another", and the closing verdict are explicit. Other soldiers dying is explicit (v17). **Interpretation:** "Uriah does not know he is preaching" infers his knowledge. |
| `davids-rooftop` p3 | David's rooftop era | 2 Samuel 12:1-25 | 589 | 4:12 | Parable, "Thou art the man", the indictment naming Uriah, the consequences, the confession, the immediate pardon, the child's death, the worship, "I shall go to him", Solomon: all explicit. **Interpretation:** "God is not finished with this house" is a theological reading of vv24-25. The story's tagline "Power looked away. Grace did not" is brand copy, not a scriptural claim. |
| `hannah-prayer` p1 | Hannah | 1 Samuel 1:1-18 | 599 | 4:22 | "Adversary", the yearly provocation, Elkanah's "ten sons", the silent prayer, Eli's accusation, her reply and the changed countenance are explicit. Vow quoted closely (v11). **Interpretation:** "the most honest prayer in the building" is narrator judgement. |
| `hannah-prayer` p2 | Hannah | 1 Sam 1:19-28; 2:1-11, 18-21 | 593 | 4:20 | "The Lord remembered her", the naming, the weaning delay, the offering, "the child was young", the lending, the song and the yearly coat are explicit. **Interpretation:** the Magnificat parallel is a thematic comparison, presented as a comparison, not as a claim either text makes. **Explicit hedge:** "Scripture does not say that was the point." |
| `mary-annunciation` p1 | Mary | Luke 1:26-33 | 482 | 3:31 | Greeting, her being troubled *by the salutation*, the promise and the Davidic throne quoted closely. **Explicitly corrected in copy:** the narration states Luke never gives her age and refuses to supply one. **Interpretation:** the social/legal risk of the pregnancy draws on betrothal law (cf. Deut 22:23-24) and is hedged ("potentially far more than that"). Gabriel "stands in the presence of God" is Luke 1:19. |
| `mary-annunciation` p2 | Mary | Luke 1:34-38 (cf. 1:18-20) | 518 | 3:47 | Her question, the answer, the Elisabeth sign, "nothing shall be impossible" and her consent quoted closely. **Model hedge:** the Zacharias contrast is given, then explicitly qualified: "Luke does not spell that distinction out for us, so hold it loosely." "Overshadow" gloss is lexical. |
| `mary-annunciation` p3 | Mary | Luke 1:39-56 | 586 | 4:17 | The journey, the leaping babe, Elisabeth's blessing, "blessed is she that believed", the full Magnificat and the three months are explicit. **Interpretation:** reading the Magnificat as social reversal is a reading, though it stays inside the text's own clauses. |

## 2. Tea

All 30 verified against the cited chapter. Durations are estimates at 217 wpm and
are reconciled against the real MP3 after render.

| ID | Scripture source | Words | Est. | Fidelity notes |
|---|---|---|---|---|
| `vashti-no` | Esther 1:10-22 | 192 | 53s | **Motive hedged in copy:** "Scripture does not tell us why... anyone who tells you exactly what she was thinking is filling in a blank." Seven chamberlains, "fair to look on", the decree that every man bear rule: explicit. |
| `ruth-field` | Ruth 1-4 | 191 | 53s | Gleaning law is Lev/Deut cross-reference. Obed is David's grandfather via Jesse (4:17, 4:22) and the copy says grandson correctly. |
| `deborah-palm` | Judges 4:4-9 | 178 | 49s | Prophetess, judging Israel, the palm, Barak's condition and her prediction are explicit. |
| `abigail-intercept` | 1 Samuel 25 | 199 | 55s | Provision list and the 400 men are verbatim counts (25:18, 25:13). David's blessing quoted (25:33). |
| `mary-yes` | Luke 1:26-38 | 199 | 55s | **Corrected:** hook no longer says "teenager"; body states plainly that the age is "tradition talking, not the text". |
| `martha-mary` | Luke 10:38-42 | 192 | 53s | **Interpretation:** "He says her name twice. That is tenderness" is a reading of the repetition, offered as one. |
| `well-woman` | John 4:5-30 | 198 | 55s | Five husbands explicit (4:18). **Explicit hedge:** the "noon to avoid gossip" motive is called "a reasonable guess, and it is a guess". |
| `esther-uninvited` | Esther 4-5 | 206 | 57s | As per story p2/p3. Mordecai's "another place" theology kept intact. |
| `hannah-prayer` | 1 Samuel 1 | 201 | 56s | Peninnah as "adversary" is the text's word. |
| `magdalene-first` | John 20:1-18 | 196 | 54s | The disciples going home, her staying, the gardener, "Mary", the sending: all explicit. |
| `rahab-rope` | Joshua 2; 6:22-25; Matt 1:5 | 201 | 56s | Her deception is recorded by the text and reported as such without moralising either way. Genealogy is Matt 1:5 (KJV "Rachab"), cross-referenced. |
| `jael-tent` | Judges 4:17-22; 5:24 | 204 | 56s | Milk, mantle, "fast asleep and weary", the peg: explicit. Deborah's song calls her blessed (5:24). |
| `tamar-veil` | Genesis 38 | 195 | 54s | The withheld third son, the pledge items and "more righteous than I" are explicit. |
| `miriam-song` | Exodus 15:1, 20-21; cf. Num 26:59 | 193 | 53s | **Corrected factual error.** Previously claimed Miriam led "the first worship song on record". Exodus 15:1 has Moses and Israel sing first; Miriam **answered them** (15:21). Copy now states the order explicitly. The Exodus 2 basket-sister identification is flagged as the connection "most readers make", via Num 26:59. |
| `shunammite` | 2 Kings 4:8-37 | 201 | 56s | Died on her knees, the ride to Carmel, catching his feet, "her soul is vexed within her": explicit. |
| `widow-oil` | 2 Kings 4:1-7 | 188 | 52s | Creditor taking the sons as bondmen is explicit (4:1). |
| `bleeding-woman` | Mark 5:25-34 | 202 | 56s | "Nothing bettered, but rather grew worse" and "Daughter" are verbatim. |
| `canaanite-mother` | Matthew 15:21-28 | 197 | 54s | **Explicit hedge:** "people argue about the tone of that sentence, and the text does not give us tone, so hold your theory loosely." |
| `anna-temple` | Luke 2:36-38 | 182 | 50s | **Translation ambiguity flagged in copy:** "fourscore and four years" can mean aged 84 or widowed 84 years; the copy names both readings instead of picking the better-preaching one. Hook softened to "decades". |
| `lydia-house` | Acts 16:13-15, 40 | 187 | 52s | "And she constrained us" verbatim. The "first church in Europe" framing was **removed** as a geographic gloss the text does not make. |
| `priscilla-teach` | Acts 18:24-26 | 187 | 52s | "Expounded... more perfectly" verbatim. **Hedge:** the name-order point is given as something "readers have made much of", with "Luke never tells us why, so treat the theories as theories". |
| `sarah-laugh` | Genesis 18:1-15; 21:1-6 | 199 | 55s | Laughing within herself, the denial, the rebuttal, and Isaac as laughter are explicit. |
| `hagar-seen` | Genesis 16:1-13 | 197 | 54s | **Hedge:** the "first person in Scripture to name God" claim is qualified with "as far as the text shows us". |
| `zelophehad` | Numbers 27:1-11 | 195 | 54s | All five names and "the daughters of Zelophehad speak right" are explicit. |
| `huldah-scroll` | 2 Kings 22:8-20 | 190 | 53s | The delegation of five, "the college", and the two-part oracle are explicit. |
| `widow-mite` | Mark 12:41-44 | 173 | 48s | "All her living" verbatim. Mark's own currency gloss noted. |
| `joanna-fund` | Luke 8:1-3 | 171 | 47s | Names and "ministered unto him of their substance" explicit. **Cross-reference:** identifying Herod as the one who killed John draws on Mark 6, not Luke 8. |
| `dorcas-needle` | Acts 9:36-41 | 189 | 52s | **Corrected.** Previously said the mourners "refused to bury her"; the text says they washed her, laid her in an upper chamber and sent for Peter. Copy now follows the text, with the widows holding up the garments. |
| `phoebe-letter` | Romans 16:1-2 | 188 | 52s | **Corrected.** The claim that she carried the letter is now explicitly labelled "a very old and very reasonable inference... not chapter and verse". The `diakonos` translation dispute is named rather than resolved. |
| `mary-perfume` | John 12:1-8 | 191 | 53s | Judas's stated motive is John's own (12:6). **Hedge:** "a year of wages" is shown as derived from a penny being a day's wage elsewhere in the Gospels (cf. Matt 20:2). |

---

## 3. Items resting on interpretation rather than explicit text

Ranked by how much weight they carry. None assert a biblical fact the text
does not support; all are flagged inside the narration itself.

1. **Historical/legal context** (widowhood exposure, betrothal penalties, the town
   gate as a court, the kinsman-redeemer custom). True to the period and to the
   wider Torah, but drawn from outside the immediate passage. Cited in the `ref`
   where it materially shapes the retelling.
2. **Hebrew and Greek glosses** (Bethlehem, Naomi/Mara, Isaac as laughter,
   *overshadow*). Accurate lexically; not statements the narrative text makes.
3. **Literary readings** ("the narrator is being coy"; the Zacharias/Mary
   contrast; the Hannah/Magnificat parallel; Martha's doubled name). Each is
   presented as a reading, and the two most contested are explicitly qualified.
4. **Arguments from silence** (the king never asking who the Jews were; Bathsheba's
   unrecorded consent). Handled by naming the silence rather than filling it.
   `davids-rooftop` p1 makes this a stated principle in the narration.
5. **Character motive**, everywhere it is not in the text (Vashti, the Samaritan
   woman's timing, Esther's delay). In every case the copy says so out loud.

## 4. Corrections made to previously shipped copy

| Item | Was | Now |
|---|---|---|
| `miriam-song` | "led the whole nation in the first worship song on record" | Moses and Israel sing first (Ex 15:1); Miriam **answered** them and led the women (15:20-21) |
| `dorcas-needle` | "they refused to bury her" | They washed her, laid her in an upper chamber, sent for Peter (Acts 9:37-38) |
| `phoebe-letter` | "hand-carried the letter to Romans" as fact | Labelled a reasonable inference, not chapter and verse |
| `mary-yes` / `mary-annunciation` | "A teenager said yes" | Age removed; narration states Luke never gives it |
| `anna-temple` | "waited eighty years in the temple" | Both readings of "fourscore and four years" given |
| `lydia-house` | "bankrolled the first church in Europe" | Geographic gloss removed |
| `esther-uninvited` range | `Esther 4–5` | `Esther 3–7`, matching what the four parts actually cover |

## 5. Open review items for a human

- **Theology/product sign-off on tone.** Tea is deliberately bold. Nothing mocks
  Scripture, but "Palm tree corner office energy" and similar are judgement calls.
- **`davids-rooftop`** handles sexual coercion, a killing and a child's death.
  Faithful to 2 Samuel 11-12, and heavier than the rest of the catalogue.
- **`jael-tent`** and **`tamar-veil`** retain violence and sexual content present
  in Judges 4 and Genesis 38.
- **Durations are estimates until rendered.** `durationSeconds` is currently
  derived from word count at the measured rate and must be reconciled against the
  real MP3s after `generate:audio`.
