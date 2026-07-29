// Curated narration text, shared by the real render (generate-audio) and the
// key-free placeholder (generate-placeholder-audio) so both speak the same words.
//
// FIDELITY CONTRACT
// Every part is written against the KJV text of the passages listed in its
// `ref`, which are the factual source of truth. Rules held throughout:
//   - No invented events, dialogue, miracles, relationships or outcomes.
//   - Biblical speech is quoted or paraphrased, never fabricated.
//   - Where the retelling adds cultural or linguistic context, it is marked in
//     the narration itself ("Scripture does not say", "the text does not tell
//     us") so inference is never presented as biblical fact.
//   - Theological meaning is not altered for drama.
// See docs/NARRATION_FIDELITY.md for the per-part review.
//
// LENGTH: each part targets 450 to 600 spoken words, which lands at roughly
// 3 to 4 minutes at the measured narration rate. House style: no em-dashes.

export type StoryPartScript = {
  /** The exact words sent to TTS. */
  text: string;
  /** Passages this part is built from, shown in-app as the retelling's source. */
  ref: string;
};

export const STORY_SCRIPT_V2: Record<string, StoryPartScript[]> = {
  'ruth-stays': [
    {
      ref: 'Ruth 1:1-14',
      text: `It opens with a famine. If you have ever watched a season stop giving, you know what that one word costs a family.

A man from Bethlehem packed up his wife and his two sons and went to Moab. His name was Elimelech. Her name was Naomi. The boys were Mahlon and Chilion. Bethlehem means house of bread, which is a hard name for a town with nothing to eat. So they left. Scripture does not tell us what anyone said about that. It says they went, and that they stayed.

Then Elimelech died.

Naomi was left with two sons in a country that was not hers. The boys grew, and they married Moabite women, Orpah and Ruth. And for about ten years, that was her life. Not the life she planned. But a life. A table with people at it.

Then Mahlon died. And then Chilion died.

The text does not linger. It says the woman was left of her two sons and her husband. Left. That is the whole sentence. Three funerals, and a household of women, in an era when that was not only grief, it was exposure.

And then word reaches Moab. The Lord has visited his people and given them bread. The famine that drove her out has finally broken.

So Naomi gets up. She turns toward Judah, and her two daughters in law start walking with her.

They get out onto the road. And Naomi stops.

Go back, she says. Return each of you to your mother's house. And then she blesses them, and this is the part I want you to hear. The Lord deal kindly with you, as ye have dealt with the dead, and with me. She is not shaking them off. She is releasing them. She wants them to find rest, each in a home of her own, and she knows with total clarity that she cannot give them that.

Then she kisses them. And all three women stand in the road and weep.

They tell her no. We will return with thee unto thy people.

So Naomi does the cruelest kind thing there is. She does the math out loud. Are there any more sons in my womb, that they may be your husbands? I am too old to have a husband. And even if I married tonight, even if I bore sons tonight, would you wait for them to grow up?

She is not being dramatic. She is being accurate. There is nothing here for you.

And then she says the sentence underneath all of it. It grieveth me much for your sakes that the hand of the Lord is gone out against me.

That is how Naomi reads her own life in this moment. Not bad luck. Not a hard season. God's hand, turned against her.

They weep again. And Orpah kisses her mother in law, and turns around, and goes home.

Hear me on Orpah. She is not the villain of this story. She did exactly what Naomi told her, twice, to do. She obeyed the woman who loved her.

But Ruth clave unto her.

Two women on a road out of Moab. One of them just did the sensible thing.

The other one would not let go.`,
    },
    {
      ref: 'Ruth 1:15-22',
      text: `Naomi tries one more time. She points down the road Orpah just took and she says, Behold, thy sister in law is gone back unto her people, and unto her gods. Return thou after thy sister in law.

She went. You go too.

And Ruth answers her with the most famous promise of loyalty in the Bible. I want you to notice where she is standing when she says it. Not at a wedding. On a dirt road, to a bitter widow, with absolutely nothing to gain.

Intreat me not to leave thee, or to return from following after thee. For whither thou goest, I will go. And where thou lodgest, I will lodge. Thy people shall be my people, and thy God my God. Where thou diest, will I die, and there will I be buried.

And then she seals it the way people sealed things then. The Lord do so to me, and more also, if ought but death part thee and me.

That is a vow with a curse attached. She is saying, may God deal with me if I break this.

Understand what Ruth is handing over. Her people. Her gods, plural, in the text's own words. Her chance of remarrying inside her own culture. She is choosing a foreign country, a foreign God, and an old woman who has just finished explaining that she has nothing left to offer her.

Naomi stops arguing. The text says when she saw that she was stedfastly minded to go with her, then she left speaking unto her. Sometimes love goes quiet because it has run out of reasons.

So they two went until they came to Bethlehem.

And the whole town reacts. All the city was moved about them. Is this Naomi? Is that her? The woman who left here with a husband and two sons?

And Naomi says no.

Call me not Naomi, call me Mara. Naomi means pleasant. Mara means bitter. She is standing in her own hometown telling the neighbours to change her name, because the name they remember does not fit the woman who came back.

I went out full, she says, and the Lord hath brought me home again empty.

Sit with that for a second. Because Ruth is standing right there. Ruth, who left everything, who swore a vow with a curse in it, is at Naomi's elbow while Naomi says the word empty.

Grief does that. It counts what is gone and misses what is standing next to it. Scripture does not scold her for it. It simply records it, and lets you feel it.

And then, one line later, the story turns without announcing itself.

So Naomi returned, and Ruth the Moabitess her daughter in law with her, which returned out of the country of Moab. And they came to Bethlehem in the beginning of barley harvest.

The beginning of barley harvest.

Two widows walk into town with nothing, at the exact moment the fields are full, and the law of Israel says the poor are allowed to walk behind the reapers and gather what falls.

Naomi calls herself empty.

And God has already timed the harvest.`,
    },
    {
      ref: 'Ruth 2 (gleaning law: Leviticus 19:9-10; Deuteronomy 24:19)',
      text: `Naomi has a relative on her husband's side, of the family of Elimelech. His name is Boaz. The text tells us this before anyone inside the story knows it matters.

So she says, let me go to the field and glean after him in whose sight I shall find grace. That is the law of Israel working as intended. Harvesters could not strip a field clean. What fell stayed, and the poor were allowed to follow the workers and gather it.

But allowed is not the same as safe. Ruth is a foreign widow with no man beside her, walking into a field full of strangers to pick food up off the ground. She says find grace for a reason.

And Naomi says, go, my daughter.

Then comes a line the King James is almost funny about. Her hap was to light on a part of the field belonging unto Boaz.

Her happenstance. She wandered into the right field by accident. That is how the narrator puts it. The book quietly disagrees.

Boaz comes out from Bethlehem and greets his workers. The Lord be with you. And they answer him, the Lord bless thee. That is the whole introduction to his character. Watch how a man speaks to the people who work for him.

Then he notices someone new. Whose damsel is this?

The foreman tells him. It is the Moabitish damsel that came back with Naomi. She asked to glean. She has been at it since morning.

And Boaz does not merely permit her. He protects her. Stay in this field, he says. Do not go anywhere else. Stay close to my young women. And then, quietly, this. Have I not charged the young men that they shall not touch thee?

He had already given that order. The danger was real enough that he addressed it before she ever asked.

And when thou art athirst, he says, go and drink of that which the young men have drawn. The foreign widow drinks the workers' water. She is not a beggar at the edge of the field. She is inside it.

Ruth falls on her face. Why have I found grace in thine eyes, seeing I am a stranger?

And Boaz says, I have heard. All of it. What you did for your mother in law after your husband died. How you left your father and your mother and the land you were born in, and came to a people you did not know before. The Lord recompense thy work, and a full reward be given thee of the Lord God of Israel, under whose wings thou art come to trust.

He is not flirting. He is blessing her. He saw a woman who had already made her choice, and named it out loud.

Then he feeds her at his own table, hands her roasted grain until she has had enough, and she has food left over. She saves it. For Naomi.

And when she goes back to work, he tells his men to let her glean among the sheaves, and to pull grain out of the bundles on purpose and leave it where she will find it.

She goes home that night with about an ephah of barley. Far more than a day of gleaning should ever produce.

Naomi takes one look and asks where she worked. And when Ruth says the name Boaz, Naomi's whole theology comes back online.

Blessed be he of the Lord, who hath not left off his kindness to the living and to the dead.

The man is near of kin unto us.`,
    },
    {
      ref: 'Ruth 3-4',
      text: `Harvest ends. And Naomi, who called herself empty, starts making a plan.

My daughter, she says, shall I not seek rest for thee, that it may be well with thee? Boaz is winnowing barley at the threshing floor tonight. Wash yourself, anoint yourself, put on your clothes and go down. Do not let him know you are there until he has finished eating and drinking. Then mark the place where he lies down, uncover his feet, and lie down. And he will tell thee what thou shalt do.

Ruth says, all that thou sayest unto me I will do.
This scene has been gossiped about for centuries, so let us stay with what the text says. She uncovered his feet and lay down. At midnight the man was afraid, and turned himself, and there was a woman at his feet. He asked who she was.

And Ruth answers with a legal request, not a romantic one. I am Ruth thine handmaid. Spread therefore thy skirt over thine handmaid, for thou art a near kinsman.

A near kinsman could buy back a dead relative's land and marry his widow, so the dead man's name would not disappear. Ruth is not asking for a night. She is asking him to take public, legal responsibility for two widows.

And Boaz blesses her. Blessed be thou of the Lord, my daughter, he says. Thou hast shewed more kindness in the latter end than at the beginning, inasmuch as thou followedst not young men, whether poor or rich.

He tells her the whole city knows she is a virtuous woman. He tells her yes. Then the complication. There is a kinsman nearer than I.

He sends her home before dawn, before one could know another, saying let it not be known that a woman came into the floor, because he is guarding her name. And he will not send her back empty. Six measures of barley into her shawl.

Naomi hears it and says, sit still, my daughter. The man will not be in rest, until he have finished the thing this day.

Boaz goes up to the town gate, where legal business was done. The nearer kinsman walks past. Boaz calls him over, gathers ten elders as witnesses, and lays out the land.

The man says, I will redeem it.

Then Boaz adds the second half. The day you buy the field from Naomi, you also take Ruth the Moabitess, the wife of the dead, to raise up the name of the dead upon his inheritance.

And the man backs out. I cannot redeem it for myself, lest I mar mine own inheritance. He wanted the field, not the family attached to it.

So he pulls off his shoe, which was how a deal was closed, and Boaz buys everything in front of the whole town. Ye are witnesses this day.

Boaz took Ruth, and she was his wife. And the Lord gave her conception, and she bare a son.

And listen to what the women of Bethlehem say. Not to Ruth. To Naomi. Blessed be the Lord, which hath not left thee this day without a kinsman. Thy daughter in law, which loveth thee, which is better to thee than seven sons, hath born him.

Naomi takes the baby and lays him in her bosom. The neighbour women name him Obed. Obed had a son called Jesse, and Jesse had a son called David.

The woman who came home empty is holding the great grandfather of a king.

She was never empty. She could not yet see what was standing beside her.`,
    },
  ],

  'esther-uninvited': [
    {
      ref: 'Esther 3:1-15; 4:1-3',
      text: `Before there is a heroine in this story, there is a promotion.

King Ahasuerus advances a man named Haman, the son of Hammedatha the Agagite, and sets his seat above all the princes. And the king commands that everyone at the palace gate bow to him.

Everyone does. Except one man.

Mordecai bowed not, nor did him reverence.

The other servants ask him about it daily. He will not budge. Eventually they tell Haman, and the text gives the reason they thought it mattered. Mordecai had told them he was a Jew.

And Haman is full of wrath.

Here is where a personal grudge becomes something monstrous. The text says Haman thought scorn to lay hands on Mordecai alone. Killing one man who would not bow was too small. So Haman sought to destroy all the Jews that were throughout the whole kingdom.

He goes to the king. And notice he never uses the word Jew. There is a certain people, he says, scattered abroad and dispersed among the people in all the provinces of thy kingdom. Their laws are diverse from all people. Neither keep they the king's laws. Therefore it is not for the king's profit to suffer them.

A certain people. Different. Disloyal. Bad for business. That is the oldest speech in the world, and it worked.

If it please the king, Haman says, let it be written that they may be destroyed. And I will pay ten thousand talents of silver into the king's treasuries.

And the king takes the ring off his own hand and gives it to him. The silver is given to thee, the people also, to do with them as it seemeth good to thee.

He does not even ask who they are.

So the scribes are called. Letters go out to every province, in every language, sealed with the king's ring. And the order is this. To destroy, to kill, and to cause to perish, all Jews, both young and old, little children and women, in one day. And to take the spoil of them for a prey.

One day, set by casting lots. They cast Pur, and the lot fell on the twelfth month, the month Adar.

Then comes the detail that tells you everything about the men at the top of this empire. The posts went out, being hastened by the king's commandment, and the decree was given in Shushan the palace. And the king and Haman sat down to drink.

They signed a death warrant for an entire people, and then had a drink.

But the city Shushan was perplexed.

And when Mordecai perceives all that was done, he tears his clothes, puts on sackcloth with ashes, and goes out into the midst of the city, and cries with a loud and a bitter cry. He comes right up to the king's gate, because no one clothed in sackcloth was allowed through it.

In every province where the decree lands, the same thing. Great mourning among the Jews. Fasting, and weeping, and wailing. Many lying in sackcloth and ashes.

The empire is grieving out loud.

And inside the palace, behind the walls, there is a queen who has not been told.`,
    },
    {
      ref: 'Esther 4:4-14',
      text: `Esther's maids come and tell her that Mordecai is outside the gate in sackcloth. Notice what she is told and what she is not. She hears that he is grieving. She does not yet know why.

And her first instinct is to fix his appearance. She sends him clothes.

He refuses them.

That refusal is the hinge of the whole book. Mordecai will not be dressed up and moved out of sight. So Esther sends Hatach, one of the king's chamberlains, to find out what this is, and why.

And Mordecai does not soften it. He tells Hatach everything that had happened to him, and the exact sum of money Haman promised to pay into the king's treasuries for the destruction of the Jews. He hands over a copy of the written decree, the one published in Shushan, so that Esther can read it with her own eyes.

And he sends a charge with it. That she should go in unto the king, to make supplication unto him, and to make request before him for her people.

Esther sends an answer back, and it is not cowardice. It is the law, and everyone in the empire knows it.

All the king's servants, and the people of the king's provinces, do know, that whosoever, whether man or woman, shall come unto the king into the inner court, who is not called, there is one law of his to put him to death.

One law. Man or woman. Queen included.

There is a single exception. Except such to whom the king shall hold out the golden sceptre, that he may live.

And then she adds the part that must have kept her awake. But I have not been called to come in unto the king these thirty days.

Thirty days. She is the queen, and she has not been summoned in a month. She has no idea where she stands with him, and the penalty for guessing wrong is death.

Mordecai's reply is one of the most bracing things anyone says in Scripture.

Think not with thyself that thou shalt escape in the king's house, more than all the Jews.

You are not safe. The palace is not a shelter. If they come for your people, they will come for you.

And then this. For if thou altogether holdest thy peace at this time, then shall there enlargement and deliverance arise to the Jews from another place. But thou and thy father's house shall be destroyed.

Hear the theology in that, because it is precise. Mordecai does not say the Jews will be wiped out if Esther stays silent. He says rescue will come from somewhere else, and she will have missed it. He is that certain deliverance is coming. The only question on the table is whether she will be part of it.

And then he asks the question that outlived the empire.

And who knoweth whether thou art come to the kingdom for such a time as this?

Not, you were made for this. Not, God told me so. A question. Who knows?

Mordecai leaves her the one thing that makes courage possible. He leaves her free to choose.`,
    },
    {
      ref: 'Esther 4:15-17; 5:1-8',
      text: `Esther sends her answer back, and she stops being the one who is managed and becomes the one giving the orders.

Go, she says. Gather together all the Jews that are present in Shushan, and fast ye for me. Neither eat nor drink three days, night or day. I also and my maidens will fast likewise.

Then the sentence.

And so will I go in unto the king, which is not according to the law. And if I perish, I perish.

If I perish, I perish. That is not optimism. She is not telling herself it will be fine. She has counted the cost, looked straight at it, and decided to go anyway. That is what courage actually sounds like from the inside.

And Mordecai went his way, and did according to all that Esther had commanded him. The man who raised her now takes his instructions from her.

Three days pass.

Now it came to pass on the third day, that Esther put on her royal apparel, and stood in the inner court of the king's house.

Read that slowly. She does not sneak. She does not disguise herself. She puts on the robes that say queen, and she walks into the one room where being uninvited is a capital offence, and she stands there in full view.

And the king is on his throne, facing the gate.

He looks up. And there she is.

And it was so, when the king saw Esther the queen standing in the court, that she obtained favour in his sight. And the king held out to Esther the golden sceptre that was in his hand.

She lives.

Esther draws near, and touches the top of the sceptre. And the king says, What wilt thou, queen Esther? And what is thy request? It shall be even given thee to the half of the kingdom.

Half the kingdom. Whatever she asks for right now, she gets.

And Esther asks for dinner.

If it seem good unto the king, let the king and Haman come this day unto the banquet that I have prepared for him.

That is the ask. She has walked through a death sentence to get into this room, and she invites two men to a meal.

The king says, cause Haman to make haste, that he may do as Esther hath said. And they come.

And at the banquet, over wine, the king asks her again. What is thy petition? It shall be granted thee. And what is thy request? Even to the half of the kingdom it shall be performed.

Twice now. Twice he has offered her half an empire.

And Esther answers, and she asks for a second dinner.

If I have found favour in the sight of the king, let the king and Haman come to the banquet that I shall prepare for them, and I will do to morrow as the king hath said.

Scripture does not tell us why she waits. It does not give us her reasoning, and I am not going to invent it for her.

What the text does show is what that one extra day does to Haman.`,
    },
    {
      ref: 'Esther 5:9-14; 7:1-10',
      text: `Haman leaves the first banquet floating. The text says he went forth that day joyful and with a glad heart.

And then he sees Mordecai at the king's gate. Still sitting there. Still not standing up. Still not moving for him.

And Haman is full of indignation.

He holds it together until he gets home. Then he calls in his friends and his wife Zeresh, and delivers a monologue about himself. His riches. The multitude of his children. How the king had advanced him above the princes and servants.

And then the boast he is proudest of. Esther the queen did let no man come in with the king unto the banquet that she had prepared but myself. And to morrow am I invited unto her also with the king.

And then the whole speech collapses into one honest line.

Yet all this availeth me nothing, so long as I see Mordecai the Jew sitting at the king's gate.

So Zeresh and his friends advise him. Let a gallows be made of fifty cubits high. In the morning, ask the king to have Mordecai hanged on it. Then go in merrily to the banquet.

And the thing pleased Haman. And he caused the gallows to be made.

He builds it that night, at his own house.

Then the second banquet comes. The king and Haman come to banquet with Esther the queen. And on the second day, over wine, the king asks a third time. What is thy petition, queen Esther? It shall be granted thee. Even to the half of the kingdom.

And this time she answers.

If I have found favour in thy sight, O king, and if it please the king, let my life be given me at my petition, and my people at my request.

Do you see what she does there? She does not open with policy. She puts her own life on the table first. My life. And then, my people. She makes the king understand that the decree he signed includes her.

For we are sold, she says, I and my people, to be destroyed, to be slain, and to perish.

And the king, who signed this, who handed over his ring without asking a single question, says, Who is he, and where is he, that durst presume in his heart to do so?

He does not even remember what he authorised.

And Esther says it, in the room, to his face.

The adversary and enemy is this wicked Haman.

Then Haman was afraid before the king and the queen.

The king gets up in his wrath and walks out into the garden. And Haman, who an hour ago was listing his own promotions, is left begging a Jewish woman for his life, because he saw that the king had determined evil against him.

And when the king comes back in, Haman has fallen on the couch where Esther is, and the king reads it as an assault on her. That is the end of him.

Then Harbonah, one of the chamberlains, mentions the gallows. Fifty cubits high, standing at Haman's own house, built for Mordecai, who had once spoken good for the king.

And the king says, Hang him thereon.

So they hanged Haman on the gallows that he had prepared for Mordecai.

He built it himself. That is not a flourish a storyteller added. It is in the text.

And all of it turned on a woman who was terrified, who fasted three days, and who said if I perish, I perish, and then walked in anyway.`,
    },
  ],

  'davids-rooftop': [
    {
      ref: '2 Samuel 11:1-5',
      text: `The chapter opens with a detail that is easy to read past, and the whole story is hiding inside it.

And it came to pass, after the year was expired, at the time when kings go forth to battle, that David sent Joab, and his servants with him, and all Israel. And they destroyed the children of Ammon, and besieged Rabbah.

But David tarried still at Jerusalem.

At the time when kings go forth to battle, the king stayed home.

The text does not tell us why. It does not say he was tired, or bored, or that he had earned a rest. Scripture puts the two facts side by side and lets them sit there. The army is at war. The king is on his roof.

And it came to pass in an eveningtide, that David arose from off his bed, and walked upon the roof of the king's house. And from the roof he saw a woman washing herself. And the woman was very beautiful to look upon.

That is the first moment. And I want to be careful here, because this scene gets told badly all the time.

The text does not say she was trying to be seen. It does not describe her intentions at all. It gives her no dialogue in this entire passage. Everything we might guess about what she was thinking is silence. Anyone who fills that silence in is adding to the Bible, not reading it.

What the text does is put every active verb on David.

David arose. David walked. David saw. And then, David sent and enquired after the woman.

And someone tells him exactly who she is. Is not this Bathsheba, the daughter of Eliam, the wife of Uriah the Hittite?

Read that answer again. It is a warning dressed up as information. The servant gives him her father's name and her husband's name in the same breath. She is not unattached. She belongs to a household. And Uriah the Hittite is not a stranger. He is one of David's own soldiers, and he is at that moment in a field fighting a war that David sent him to.

David has been told, plainly, before he does anything, that this woman is married to a man in his own army.

And David sent messengers, and took her.

Took her. That is the verb the text chose. Not met. Not courted. Took.

He is the king. He has messengers. She is a soldier's wife in a city where his word is law. The power in that room is not shared, and Scripture does not pretend that it is.

And she came in unto him, and he lay with her. And she returned unto her house.

That is the entire account. No romance. No scene. She goes home.

And then the sentence that ends the quiet.

And the woman conceived, and sent and told David, and said, I am with child.

Five words from her. It is the first thing Bathsheba says in the whole story, and the only thing she says in this chapter. I am with child.

Her husband has been at the front for weeks. Everyone will be able to count.

She has told the most powerful man in Israel that his secret is now a person, growing, on a timeline that cannot be argued with.

And what David does next is worse than what he has already done.`,
    },
    {
      ref: '2 Samuel 11:6-27',
      text: `David's first move is not confession. It is logistics. And David sent to Joab, saying, Send me Uriah the Hittite. He pulls a man off the battlefield to cover a pregnancy.

Uriah arrives, and David plays the interested commander. He asks how Joab is doing, how the war prospers. He listens to a report he does not care about.

And then, casually. Go down to thy house, and wash thy feet.

Go home. And in a few months nobody will be counting.

David even sends a gift of food after him, to make the evening feel like a reward.

But Uriah slept at the door of the king's house with all the servants of his lord, and went not down to his house.

When David hears, he pushes. Camest thou not from thy journey? Why then didst thou not go down unto thine house?

And Uriah answers him, and it is the most quietly devastating speech in the chapter.

The ark, and Israel, and Judah, abide in tents. And my lord Joab, and the servants of my lord, are encamped in the open fields. Shall I then go into mine house, to eat and to drink, and to lie with my wife? As thou livest, and as thy soul liveth, I will not do this thing.

The foreign soldier will not take a comfort his brothers cannot have, and he swears it by the life of the king who is at that moment trying to trick him.

Every principle Uriah names is one David has already broken. Uriah does not know he is preaching. That is what makes it unbearable.

So David tries again. Tarry here to day also. He calls Uriah in, and he eats and drinks before him, and the text says it plainly. He made him drunk.

It still does not work. At evening Uriah goes out to lie on his bed with the servants of his lord, and went not down to his house.

And so we come to the morning, and to a sentence that is hard to read.

And it came to pass in the morning, that David wrote a letter to Joab, and sent it by the hand of Uriah.

By the hand of Uriah. The man carries his own death warrant, sealed, and never opens it, because he is loyal.

And the letter says, Set ye Uriah in the forefront of the hottest battle, and retire ye from him, that he may be smitten, and die.

Joab does it. He assigns Uriah where he knew valiant men were. The men of the city come out and fight, and there fell some of the servants of David. And Uriah the Hittite died also.

Joab sends a messenger and coaches him on how to deliver it, expecting the king to be angry about the losses. Just add, at the end, thy servant Uriah the Hittite is dead also.

The messenger delivers it. And David is not angry.

Let not this thing displease thee, he says, for the sword devoureth one as well as another. Make thy battle more strong against the city, and overthrow it. And encourage thou him.

And when the wife of Uriah heard that Uriah her husband was dead, she mourned for her husband.

Scripture gives her that. It calls him her husband twice in one sentence.

And when the mourning was past, David sent and fetched her to his house, and she became his wife, and bare him a son. Everyone is quiet.

And then eight words open it again.

But the thing that David had done displeased the Lord.`,
    },
    {
      ref: '2 Samuel 12:1-25',
      text: `And the Lord sent Nathan unto David. He does not accuse. He tells a story, and lets the king judge it.

There were two men in one city, he says. One rich, one poor. The rich man had exceeding many flocks and herds. The poor man had nothing, save one little ewe lamb, which he had bought and nourished up.

It grew up together with him, and with his children. It did eat of his own meat, and drank of his own cup, and lay in his bosom, and was unto him as a daughter.

And there came a traveller unto the rich man. And the rich man spared his own flock, and took the poor man's lamb, and dressed it for the traveller.

And David's anger was greatly kindled against the man. He passes sentence. As the Lord liveth, the man that hath done this thing shall surely die. And he shall restore the lamb fourfold, because he did this thing, and because he had no pity.

And Nathan said to David, Thou art the man.

Four words. There is nowhere left to stand.

Then comes the Lord's own indictment. I anointed thee king over Israel. I delivered thee out of the hand of Saul. I gave thee thy master's house. And if that had been too little, I would moreover have given unto thee such and such things.

Wherefore hast thou despised the commandment of the Lord, to do evil in his sight? Thou hast killed Uriah the Hittite with the sword, and hast taken his wife to be thy wife.

And there are consequences, spoken plainly. The sword shall never depart from thine house. What he did secretly will be done before all Israel, and before the sun.

And David does not argue. He does not explain. He does not manage it.

I have sinned against the Lord.

Five words, against a chapter and a half of scheming.

And Nathan said unto David, The Lord also hath put away thy sin. Thou shalt not die.

That is mercy, and it is immediate. But mercy is not the same as no consequences. Nathan tells him the child born of this will die.

And the child falls sick. And David, who would not repent for a year, now cannot stop praying. He fasted, and lay all night upon the earth. His elders come to raise him up, and he will not get up, and he will not eat.

On the seventh day the child dies. His servants are afraid to tell him. But David sees them whispering, and understands. Is the child dead? And they say, He is dead.

Then David arose from the earth, and washed, and anointed himself, and changed his apparel, and came into the house of the Lord, and worshipped.

His servants ask him outright. And David says, while the child was yet alive, I fasted and wept, for I said, who can tell whether God will be gracious to me, that the child may live? But now he is dead, wherefore should I fast? Can I bring him back again?

I shall go to him, but he shall not return to me.

And David comforted Bathsheba his wife.

Comforted her. The text finally lets him be a person to her, not a king over her.

And she bare a son, and he called his name Solomon. And the Lord loved him.

The Lord loved him. After all of that. God is not finished with this house.

Power looked away. And Grace did not.`,
    },
  ],

  'hannah-prayer': [
    {
      ref: '1 Samuel 1:1-18',
      text: `There was a man named Elkanah, and he had two wives. Peninnah, and Hannah.

And the text tells you the situation in one brutal clause. Peninnah had children, but Hannah had no children.

Every year the family went up to worship and to sacrifice at Shiloh. And every year, at the meal, Elkanah handed out portions. To Peninnah, and to all her sons and her daughters. And to Hannah he gave a worthy portion, because he loved her.

He loved her. The text says so plainly. But love did not fix it, and everybody at that table could count.

And her adversary also provoked her sore, for to make her fret.

That is the word Scripture uses for Peninnah. Her adversary. And this was not a one time cruelty. It says, as he did so year by year, when she went up to the house of the Lord, so she provoked her. Every year. At the one place she went to meet God.

Therefore she wept, and did not eat.

And Elkanah, who genuinely loves her, says the wrong thing the way well meaning people do. Hannah, why weepest thou? And why eatest thou not? And why is thy heart grieved? Am not I better to thee than ten sons?

So Hannah gets up from the table. She rises after they have eaten and drunk, and goes to the house of the Lord. Eli the priest is sitting on a seat by a post of the temple.

And she was in bitterness of soul, and prayed unto the Lord, and wept sore.

Then she makes a vow, and I want you to hear how specific it is. O Lord of hosts, if thou wilt indeed look on the affliction of thine handmaid, and remember me, and not forget thine handmaid, but wilt give unto thine handmaid a man child, then I will give him unto the Lord all the days of his life, and there shall no razor come upon his head.

She is asking for a son. And in the same sentence, she is giving him away. Not for a season. All the days of his life. She is asking God for the very thing she will hand back.

And as she keeps praying, Eli watches her mouth.

Now Hannah, she spake in her heart. Only her lips moved, but her voice was not heard.

She is praying silently. And the priest, whose whole job is to recognise what devotion looks like, gets it completely wrong.

Therefore Eli thought she had been drunken. How long wilt thou be drunken? Put away thy wine from thee.

The most honest prayer in the building, and the priest calls her drunk.

And here is where Hannah becomes one of my favourite women in Scripture. She does not shrink, and she does not lash out.

No, my lord. I am a woman of a sorrowful spirit. I have drunken neither wine nor strong drink, but have poured out my soul before the Lord. Count not thine handmaid for a daughter of Belial, for out of the abundance of my complaint and grief have I spoken hitherto.

And Eli, to his credit, hears her. Go in peace, he says, and the God of Israel grant thee thy petition that thou hast asked of him.

And she said, Let thine handmaid find grace in thy sight.

So the woman went her way, and did eat, and her countenance was no more sad.

Nothing in her circumstances has changed yet. Nothing. She is still childless walking out of that room.

And her face is different.`,
    },
    {
      ref: '1 Samuel 1:19-28; 2:1-11, 18-21',
      text: `They rise early in the morning and worship, and return to their house at Ramah.

And the Lord remembered her.

She conceives, and bears a son, and calls his name Samuel, saying, Because I have asked him of the Lord.

Then the next year comes around, and the whole household goes up to Shiloh for the yearly sacrifice.

And Hannah does not go.

She tells her husband, I will not go up until the child be weaned, and then I will bring him, that he may appear before the Lord, and there abide for ever.

She is not backing out of the vow. She is asking for the only thing she will ever get, the years before he is weaned. And Elkanah says, do what seemeth thee good. Tarry until thou have weaned him.

So she stays home and nurses her son, knowing the whole time exactly how this ends.

And when she had weaned him, she took him up with her.

She brings three bullocks, one ephah of flour, and a bottle of wine. Her whole offering. And the text adds four words that cost more than all of it.

And the child was young.

They slay a bullock. And she brings the child to Eli. The same priest who once accused her of being drunk.

Oh my lord, she says, as thy soul liveth, my lord, I am the woman that stood by thee here, praying unto the Lord. For this child I prayed. And the Lord hath given me my petition which I asked of him.

Therefore also I have lent him to the Lord. As long as he liveth he shall be lent to the Lord.

And then she prays again. And this prayer is nothing like the first.

My heart rejoiceth in the Lord, she says. Mine horn is exalted in the Lord. My mouth is enlarged over mine enemies, because I rejoice in thy salvation.

There is none holy as the Lord. For there is none beside thee. Neither is there any rock like our God.

And then she sings about how God turns the world upside down. The bows of the mighty men are broken, and they that stumbled are girded with strength. They that were full have hired out themselves for bread. So that the barren hath born seven.

The Lord killeth, and maketh alive. The Lord maketh poor, and maketh rich. He bringeth low, and lifteth up. He raiseth up the poor out of the dust, and lifteth up the beggar from the dunghill, to set them among princes.

A woman mocked at a dinner table every year, standing in the house of God, singing that heaven pulls down the proud and lifts up the overlooked. Centuries later, a young woman in Nazareth will sing something remarkably like it.

And what happens to Hannah after she gives him back?

Samuel ministered before the Lord, being a child, girded with a linen ephod. And his mother made him a little coat, and brought it to him from year to year, when she came up with her husband to offer the yearly sacrifice.

And Eli blessed Elkanah and his wife, saying, The Lord give thee seed of this woman for the loan which is lent to the Lord.

And the Lord visited Hannah, so that she conceived, and bare three sons and two daughters.

Scripture does not say that was the point, and it does not say the ache before them did not count.

It says heaven heard a woman whose voice was not even audible.`,
    },
  ],

  'mary-annunciation': [
    {
      ref: 'Luke 1:26-33',
      text: `In the sixth month, the angel Gabriel was sent from God unto a city of Galilee, named Nazareth.

Start with the address, because Luke did.

Not Jerusalem. Not the temple. Nazareth, a small town in the north. Gabriel, who elsewhere in Scripture stands in the presence of God, is sent to a village.

To a virgin espoused to a man whose name was Joseph, of the house of David. And the virgin's name was Mary.

Espoused means legally bound, but not yet living together. The commitment was real and binding, and breaking it required a divorce.

Luke tells us she was a virgin. He tells us the town, the man she was promised to, and his royal line. He does not tell us her age. Popular retellings often assign her one. The text does not, and I am not going to hand you a number Scripture never gave.

And the angel came in unto her, and said, Hail, thou that art highly favoured, the Lord is with thee. Blessed art thou among women.

And when she saw him, she was troubled at his saying.

Notice what troubled her. Not the angel. The greeting. She cast in her mind what manner of salutation this should be. She is turning the words over, trying to work out what on earth someone means by talking to her like that.

She is not frightened of the messenger. She is thrown by being called favoured.

And the angel said unto her, Fear not, Mary. For thou hast found favour with God.

He uses her name.

Then he tells her what favour is going to cost.

And, behold, thou shalt conceive in thy womb, and bring forth a son, and shalt call his name Jesus.

Sit in the gap between those two sentences. The angel has just told an engaged, unmarried woman that she is going to be pregnant. In her village, in her century, that news does not read as a blessing. It puts her marriage and her reputation at risk, and under the law of the time, potentially far more than that.

Gabriel says favoured. And favoured looks like this.

Then he keeps going, and the promise gets enormous.

He shall be great, and shall be called the Son of the Highest. And the Lord God shall give unto him the throne of his father David. And he shall reign over the house of Jacob for ever. And of his kingdom there shall be no end.

The throne of his father David. That is the promise Israel had been holding onto for a thousand years, handed to a young woman standing in a house in Nazareth with no witnesses.

There is no crowd. No temple. No priest. No one to confirm this later.

Just Mary, and an angel, and a sentence that ends with the words no end.

And she has not said a word yet.`,
    },
    {
      ref: 'Luke 1:34-38 (compare Zacharias, Luke 1:18-20)',
      text: `Then said Mary unto the angel, How shall this be, seeing I know not a man?

That is her first recorded sentence, and I love it, because it is not pious and it is not panicked. It is practical.

She is not questioning whether God can. She is asking how, given the one fact she is certain of about her own life.

And it is worth comparing her to the other person in this same chapter who asked a question. Zacharias, a priest, standing in the temple, was told he would have a son, and he said, Whereby shall I know this? For I am an old man, and my wife well stricken in years. And he was struck silent until the child was born.

Mary asks a question too, and she is not silenced. She is answered.

Many readers locate the difference in the questions themselves. Zacharias asks for proof. Mary asks for the mechanism. Luke does not spell that distinction out for us, so hold it loosely. What Luke does record is that one was silenced and the other was told how.

And the angel answered and said unto her, The Holy Ghost shall come upon thee, and the power of the Highest shall overshadow thee. Therefore also that holy thing which shall be born of thee shall be called the Son of God.

That is the answer. Not a biology lesson. The Holy Spirit, and the power of the Highest, and a word that means to cover, to overshadow.

And then Gabriel does something tender that he did not have to do.

And, behold, thy cousin Elisabeth, she hath also conceived a son in her old age. And this is the sixth month with her, who was called barren.

He gives her a name and an address.

He does not hand her an impossible announcement and leave. He tells her about a relative, an older woman, six months along, who had been known her whole life as barren. He is telling Mary, you are not the only impossible thing happening right now. There is someone you can go to.

For with God nothing shall be impossible.

And then comes the sentence the whole thing has been waiting for. And it is quiet. There is no swelling music in the text.

And Mary said, Behold the handmaid of the Lord. Be it unto me according to thy word.

Behold the handmaid of the Lord. She takes the lowest title in the room, and she claims it on purpose.

Be it unto me according to thy word. Let it happen. Not, I understand. Not, I am ready. Not, explain the consequences first.

She says yes to a plan she cannot verify, that will cost her a reputation she cannot get back, in a village that will do the arithmetic.

And the angel departed from her.

That is the line that gets me every time.

He leaves. The light goes. The room is a room again.

And Mary is standing in Nazareth with the most extraordinary news in human history, and not one witness to any of it.`,
    },
    {
      ref: 'Luke 1:39-56',
      text: `And Mary arose in those days, and went into the hill country with haste, into a city of Juda.

In those days. With haste. She does not wait around.

Gabriel had told her about Elisabeth, and Mary takes that as an address and goes. Luke does not tell us who travelled with her, or what she said to her family before she left. He tells us she went, and that she hurried.

She entered into the house of Zacharias, and saluted Elisabeth.

And here the story gives Mary what she needs most. Not an explanation. A witness.

And it came to pass, that, when Elisabeth heard the salutation of Mary, the babe leaped in her womb. And Elisabeth was filled with the Holy Ghost.

Mary says hello. That is all. And before she has explained anything, the child inside Elisabeth moves, and Elisabeth is filled with the Spirit, and speaks out with a loud voice.

Blessed art thou among women, and blessed is the fruit of thy womb.

Elisabeth knows. Nobody told her. An older woman who had spent her life being called barren looks at a young relative who has just walked through the door, and blesses what is happening inside her.

And whence is this to me, that the mother of my Lord should come to me?

Elisabeth, who is older, who is further along, who is married to a priest, calls the younger woman the mother of my Lord, and treats her arrival as an honour.

For, lo, as soon as the voice of thy salutation sounded in mine ears, the babe leaped in my womb for joy.

And then the line I suspect Mary needed most.

And blessed is she that believed. For there shall be a performance of those things which were told her from the Lord.

Not, blessed is she who was chosen. Blessed is the one who said yes, and is carrying it without proof.

And Mary opens her mouth and sings.

My soul doth magnify the Lord, and my spirit hath rejoiced in God my Saviour. For he hath regarded the low estate of his handmaiden. For, behold, from henceforth all generations shall call me blessed.

And then the song turns, and it stops being about her, and it gets political in a way we tend to sand down.

He hath shewed strength with his arm. He hath scattered the proud in the imagination of their hearts. He hath put down the mighty from their seats, and exalted them of low degree. He hath filled the hungry with good things, and the rich he hath sent empty away.

That is not a lullaby. That is a young woman with no power announcing that God overturns the order of the world. Thrones come down. The overlooked go up.

And she sings it in the past tense, as though it were already done.

He hath holpen his servant Israel, in remembrance of his mercy. As he spake to our fathers, to Abraham, and to his seed for ever.

She puts herself inside a promise older than her nation.

And Mary abode with her about three months, and returned to her own house.

Three months. Two women, both carrying impossible things, keeping each other company while the world outside knew nothing about either of them.

And then Mary goes home to Nazareth. To the questions. To Joseph. To a village that could count.

She had said, be it unto me according to thy word.

Now she had to live inside it.`,
    },
  ],
};

/** Back-compat: the plain text array the render + placeholder scripts consume. */
export const STORY_SCRIPT: Record<string, string[]> = Object.fromEntries(
  Object.entries(STORY_SCRIPT_V2).map(([id, parts]) => [id, parts.map((p) => p.text)]),
);

/** Per-part scripture sources, surfaced in the app so the basis is visible. */
export const STORY_REFS: Record<string, string[]> = Object.fromEntries(
  Object.entries(STORY_SCRIPT_V2).map(([id, parts]) => [id, parts.map((p) => p.ref)]),
);

export function storyPartText(storyId: string, part: number, fallback: string): string {
  const parts = STORY_SCRIPT[storyId];
  if (!parts) return fallback;
  return parts[part - 1] ?? parts[parts.length - 1] ?? fallback;
}

export function storyPartRef(storyId: string, part: number): string | null {
  const refs = STORY_REFS[storyId];
  if (!refs) return null;
  return refs[part - 1] ?? refs[refs.length - 1] ?? null;
}
