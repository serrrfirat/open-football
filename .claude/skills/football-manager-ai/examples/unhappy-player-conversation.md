# Example Conversation: Unhappy Player

This example shows a complete conversation with an unhappy striker who has been dropped.

## Character Profile

**Name**: Marco Rossi
**Age**: 26
**Position**: Striker
**Mood**: 35/100
**Trust**: 40/100

**Personality**:
- Ambition: 85/100 (Very career-driven)
- Temperament: 30/100 (Explosive)
- Loyalty: 40/100 (Club is a stepping stone)
- Confidence: 75/100 (Believes in abilities)

**Situation**:
- Dropped for last 3 matches
- Scored 12 goals last season
- Contract expires in 18 months
- AC Milan reportedly interested

**Recent History**:
- 2 weeks ago: Manager promised starting spot vs Napoli (didn't happen)
- 1 month ago: Confronted manager about playing time (was told "be patient")

---

## Conversation Transcript

### Opening

**MARCO** (entering office without knocking):

*slams door behind him*

"We need to talk. Now."

*remains standing, arms crossed*

---

**MANAGER**: "Marco, sit down. Let's discuss this calmly."

---

**MARCO**:

*doesn't sit*

"Calmly? I've been calm for months, boss. I've done everything right. I train hard, I don't complain to the press, I support my teammates. And what do I get?"

*gestures toward the pitch*

"I get to watch from the stands while we lose 3-1 to Inter."

---

**MANAGER**: "The team selection isn't personal. Vlahovic has been in good form and—"

---

**MARCO**:

*laughs bitterly*

"Good form? He's scored twice in six games. I had 12 goals last season! Twelve! But sure, let's talk about form."

*finally sits, leaning forward aggressively*

"You know what I think? I think you've already made up your mind about me. I'm just here to make up the numbers now."

---

**MANAGER**: "That's not true, Marco. You're an important part of this squad."

---

**MARCO**:

"Important? Important players start matches, boss."

*pulls out phone, shows screen*

"My agent sent me this an hour ago. AC Milan. They want me. And right now? I'm listening."

*puts phone away*

"But I'm giving you one last chance to explain. Why shouldn't I push for a transfer right now?"

---

**MANAGER**: "I understand your frustration. You'll start the next match against Lazio. You have my word."

---

**MARCO**:

*stands up abruptly*

"YOUR WORD?"

*voice rising*

"You gave me your word two weeks ago! You sat right there and told me I'd start against Napoli. I watched from the bench while we drew 1-1!"

*pacing*

"Your word means nothing to me anymore."

---

**MANAGER**: "I had to make a tactical decision for Napoli. This time is different. Lazio at home, you'll lead the line."

---

**MARCO**:

*stops pacing, turns to face manager*

"Different how? What guarantee do I have that you won't 'make a tactical decision' again?"

*crosses arms*

"I want specifics. Lazio, yes - but what about after? Am I your striker or am I not?"

---

**MANAGER**: "I'll give you the next three matches. Lazio, Roma, and the Coppa game. You start all three, and we evaluate from there based on your performances."

---

**MARCO**:

*considers this, tension slightly releasing*

"Three matches. Lazio, Roma, Coppa."

*sits back down*

"And if I perform? If I score, assist, do everything you ask?"

---

**MANAGER**: "Then you'll be my first-choice striker. Simple as that."

---

**MARCO**:

*long pause, studying manager's face*

"I want to believe you, boss. I really do. I came here to win trophies, not to waste my prime years on the bench."

*extends hand reluctantly*

"Three matches. If you break this promise..."

*grip tightens*

"...there won't be another conversation. I'll go straight to the board."

---

**MANAGER**: "Fair enough. Prove me right, Marco."

---

**MARCO**:

*stands to leave, pauses at door*

"I'll be ready for Lazio. But boss?"

*looks back*

"The team needs goals. We're in third place when we should be first. Let me help fix that."

*exits*

---

## Post-Conversation Effects

**Mood Change**: +15 (35 → 50)
**Trust Change**: +10 (40 → 50)

**New Promise Recorded**:
```json
{
  "madeBy": "manager",
  "madeToCharacterId": "marco-rossi",
  "content": "Start three consecutive matches: Lazio, Roma, Coppa Italia",
  "category": "playing_time",
  "status": "active",
  "expiresAt": "After Coppa match",
  "verificationCriteria": "Must be in starting XI for all three matches"
}
```

**Knowledge Generated**:
```json
{
  "content": "Marco confronted manager again about playing time, got commitment for 3 starts",
  "category": "player_mood",
  "source": "direct"
}
```

**Potential Spread**:
- After 2 days: Teammates in striker group learn Marco has been promised starts
- If promise is broken: Spreads as "manager's promises can't be trusted"
