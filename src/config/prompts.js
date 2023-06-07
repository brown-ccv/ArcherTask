/*
Using a js file instead of a json file. Reasons:

1. Template Literals handle multiline strings well.
2. We might need some functions for dynamic prompts.
*/

const instructions = (maxArrows, maxMinions, maxWaves) => {
  const instructions1 = [
    `<p>Welcome!</p>
      <p>Thank you for voluteering for this experiment.</p>`,
    `<p>You are going to play a computer game.</p>
       <p>Then next screens will show you instructions for what you have to do.</p>`,
    `<p>An evil overlord has taken over the kingdom!</p>
       <p>It has taken residence in the royal castle. This unprovoked attack cannot go unanswered!</p>`,
    `<p>But beware! As you advance through the forest, the overlord will be sending its minions to stop you.</p>
  <p>You must face ${maxWaves} waves of minions first, before you reach the overlord.</p>`,
    `<p>You have your trusty bow and arrows to defend yourself from the minions.</p>
  <p>All you have to do is aim your bow where you think the next minion will appear, and then SPACE to shoot the arrow.</p>`,
    `<p>You can adjust the position of the archer by dragging it up and down the screen with the mouse. Just <span class="underline">hold down</span> the LEFT MOUSE BUTTON, and <span class="underline">drag it to the desired position</span>.</p>
  <p>Once you have set the position, press the "SPACE" key to summon the next minion in a wave, and shoot at it.</p>
  <p>Click "NEXT" to practice this!</p>`,
  ];

  const instructions2 = [
    `<p>Great job! Looks like you got the hang of it!</p>
  <p>Now, a few more instructions.</p>`,
    `<p>The minions always come in <span class="underline">waves of ${maxMinions}</span>, one after another.</p>
  <p>Each minion will appear by itself, from the right side of the screen.</p>
  <p>Each minion in a wave might appear at a slightly different position, but remember: <span class="underline">all minions in a wave have positions close to each other</span>.</p>`,
    `<p>The better you learn the general location of each wave, the more likely you are to hit the minions in that wave!</p>
  <p>A hit counter on the top right will tell you how many minions in that wave you have hit or missed. You get 1 point for each hit, 0 points for a miss</p>
  <p>The more minions you hit, the more points you get!</p>`,
    `<p>You can adjust your archer's position after seeing each minion, to improve your chances of hitting the next one:</p>
  <p>To adjust, simply <span class="underline">click and hold</span> the left mouse button and drag the archer up or down. You can also use the up or down key to adjust the archer's position.</p>
  <p>When you are done, you can press SPACE to summon the next minion and shoot your arrow.</p>`,
  ];

  const instructions3 = [
    `<p>Great job! Looks like you got the hang of it!</p>
      <p>Now, a few more instructions.</p>`,
    `<p>Remember, there are ${maxMinions} minions in each wave, but the overlord is sending <span class="underline">${maxWaves} different waves</span> at you!</p>
  <p>Since all waves are created by the overlord, the position of each wave is related to the final position of the overlord.</p>`,
    `<p>Take advantage of this! You can <span class="underline">learn about the overlord's location</span> from each wave of minions it sends against you.</p>
  <p>You only have one chance to shoot an arrow at the overlord, at the end of the game: the better you have learned its location, the better the chance you will defeat it!</p>`,
    `<p>But remember: your archer only carries <span class="underline">${maxArrows} arrows</span>, so you cannot shoot at every single minion in each wave.</p>
  <p>If you run out of arrows, you will automatically skip all remaining waves and go straight to confronting the evil overlord. In that case, you will not have seen all the waves, and you will be missing out on information about the location of the overlord.</p>
  <p class="underline">Use your arrows wisely!</p>`,
    `<p>To conserve arrows for the next waves, you can choose to <span class="underline">run away</span> from the rest of the minions in a wave, at any time while you confront that wave.</p>
    <p>To end the current wave of minions by running away, click the "RUN" button at the top left of the screen. This will immediately skip the rest of the minions, and advance you to a new wave.</p>
    <p>Remember: <span class="underline">you can run at any time</span> during any wave.</p>`,
  ];

  const instructions4 = [
    `<p>Great! You are almost ready to start playing!</p>
  <p>Only a few final reminders...</p>`,
    `<p>You will reach the overlord after you have made it past the last wave of minions. You have one chance to defeat the overlord!</p>
  <p>Just like its minions, the overlord will come from the right side of the screen. When you set the position of the archer, remember that the minion waves were all centered around the position of the overlord.</p>`,
    `<p>When you have gone through the last minion wave, you will finally reach the overlord! You have one chance to shoot at and defeat it!</p>
  <p>Take your best shot!</p>
  <p>Defeating the overlord will win you an extra 50 points.</p>`,
  ];

  return [instructions1, instructions2, instructions3, instructions4];
};

const prompts = (maxArrows, maxMinions, maxWaves) => {
  return {
    instructions: instructions(maxArrows, maxMinions, maxWaves),
    practice1:
      "You will now practice adjusting the archer's position and shooting an arrow at a minion.",
    practice2:
      'You will now practice shooting at several minions in a wave, and adjusting your aim.',
    practice3:
      'You will now practice running away. To do so, shoot at one or two minions, then click the RUN button.',
    practice4: `You wil now practice facing two short waves of minions.<br />Remember to adjust the aim of the archer after each shot, to improve your chances of a hit!<br />You may press "RUN" at any time if you wish.`,
    minions: `You are now ready to start!<br />You will face ${maxWaves} waves of minions, followed by the overlord.<br />Good luck!<br />Press any key to begin the game.`,
    overlord: 'The overlord is coming!',
    outro: 'Thank you for participating in the experiment! Your data is now saved.',
  };
};

export default prompts;
