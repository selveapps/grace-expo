// Curated narration text — shared by the real render (generate-audio) and the
// key-free placeholder (generate-placeholder-audio) so both speak the same words.
// Short, characterful per story part; a fuller LLM narrative can replace this later.
export const STORY_SCRIPT: Record<string, string[]> = {
  'ruth-stays': [
    'Naomi had lost everything. Her husband, her sons, her home. She told her sons’ widows to turn back. Orpah kissed her goodbye. Ruth would not let go.',
    'Where you go, I will go. Your people will be my people, and your God, my God. A vow spoken on a dusty road, and she meant every word.',
    'Back in Bethlehem, Ruth went out to glean, gathering the leftover grain in the fields. The field belonged to a man named Boaz, and he noticed her.',
    'Boaz redeemed the family line and took Ruth as his wife. The widow from Moab became the great-grandmother of King David. Loyalty rewrote her whole story.',
  ],
  'esther-uninvited': [
    'A decree went out across the empire. Every Jew, marked for death. And a young queen sat safe behind the palace walls, saying nothing.',
    'Mordecai sent word. Who knows but that you have come to your royal place for such a time as this. The silence was no longer safe.',
    'To approach the king uninvited meant death. Esther fasted three days, fixed her crown, and stepped into the throne room anyway.',
    'The king raised his golden scepter. She lived. And with a banquet and the truth, she turned an empire’s death sentence into her people’s rescue.',
  ],
  'davids-rooftop': [
    'Evening on the palace roof. The king should have been away at war. Instead David saw Bathsheba, and let power do what power does.',
    'One sin covered by another. A faithful husband sent to die at the front line. David thought the story was closed. Heaven did not.',
    'The prophet Nathan told a tale of a stolen lamb, and David burned with anger, until he saw that the thief was himself. Then came grief, and mercy.',
  ],
  'hannah-prayer': [
    'Year after year, Hannah longed for a child, and wept. At the temple she prayed so hard, her lips moving with no sound, that the priest thought her drunk.',
    'God remembered Hannah. She bore a son, Samuel, and gave him back to the Lord. Her ache became a song that still teaches us how to pray.',
  ],
  'mary-annunciation': [
    'A young woman in a small town. An angel arrives with impossible news. She will carry the Son of God.',
    'How can this be, she asks. Not doubt, but wonder. And the answer is only this. Nothing is impossible with God.',
    'I am the Lord’s servant, she says. Let it be to me as you have said. The most quietly radical yes in all of history.',
  ],
};

export function storyPartText(storyId: string, part: number, fallback: string): string {
  const parts = STORY_SCRIPT[storyId];
  if (!parts) return fallback;
  return parts[part - 1] ?? parts[parts.length - 1] ?? fallback;
}
