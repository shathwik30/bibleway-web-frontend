export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

export interface QuizLevel {
  id: number;
  title: string;
  theme: string;
  story: string;
  questions: QuizQuestion[];
}

export const QUIZ_LEVELS: QuizLevel[] = [
  {
    id: 1,
    title: "Level 1",
    theme: "The Beginning of Creation",
    story:
      "Before mountains rose or oceans flowed, the universe was empty and silent. Darkness covered everything. Then God spoke, and light burst into existence, pushing back the darkness. Over the next few days, God carefully shaped the world step by step. He formed the sky, gathered waters into seas, and caused dry land to appear. Trees and plants began to grow, filling the earth with life. The sun lit the day, the moon lit the night, and stars filled the heavens. Animals soon filled the land, sea, and sky. Finally, God created humans \u2014 Adam and Eve \u2014 in His own image. He placed them in a beautiful garden called Eden and asked them to care for it.",
    questions: [
      {
        question: "Why did God create plants and trees before creating humans?",
        options: [
          "Humans needed food and a living environment when they arrived",
          "Plants were more important than humans",
          "Animals created plants first",
          "Humans did not eat plants",
        ],
        correctIndex: 0,
        hint: "Imagine arriving in a world without food.",
      },
      {
        question: "What does the order of creation suggest about God's plan?",
        options: [
          "The world appeared randomly",
          "Creation followed a thoughtful and organized plan",
          "Humans created the animals",
          "The earth built itself",
        ],
        correctIndex: 1,
        hint: "Each part prepared the world for the next.",
      },
      {
        question: "Why were Adam and Eve placed in the Garden of Eden?",
        options: [
          "To rule the sky",
          "To care for and enjoy the garden God created",
          "To hide from animals",
          "To build cities",
        ],
        correctIndex: 1,
        hint: "They were given responsibility.",
      },
      {
        question: "What does God resting on the seventh day show?",
        options: [
          "Creation was unfinished",
          "The work of creation was complete and good",
          "Humans had disappeared",
          "Animals stopped moving",
        ],
        correctIndex: 1,
        hint: "Rest usually follows finished work.",
      },
      {
        question:
          "What makes humans different from the other creatures in the story?",
        options: [
          "They were faster than animals",
          "They were made in God's image and given responsibility",
          "They lived in water",
          "They could fly",
        ],
        correctIndex: 1,
        hint: "Humans were given a special role.",
      },
    ],
  },
  {
    id: 2,
    title: "Level 2",
    theme: "The Forbidden Tree",
    story:
      "Life in the Garden of Eden was peaceful and joyful. Adam and Eve could eat fruit from almost every tree and walk freely among the animals. In the center of the garden stood a special tree \u2014 the Tree of the Knowledge of Good and Evil. God warned them not to eat from it. One day, a serpent approached Eve and began to question God's command. The serpent suggested that eating the fruit would make them wise like God. Eve looked at the fruit and wondered if it was truly forbidden. She took a bite and then gave some to Adam. Suddenly they realized they had disobeyed God and felt ashamed.",
    questions: [
      {
        question: "Why did the serpent challenge God's rule?",
        options: [
          "To trick humans into disobeying God",
          "To help the garden grow",
          "To give Eve food",
          "To protect the tree",
        ],
        correctIndex: 0,
        hint: "The serpent wanted them to break the rule.",
      },
      {
        question: "Why did Adam and Eve feel ashamed after eating the fruit?",
        options: [
          "They were afraid of the animals",
          "They realized they had disobeyed God's command",
          "The fruit was bitter",
          "The garden became dark",
        ],
        correctIndex: 1,
        hint: "Their understanding suddenly changed.",
      },
      {
        question: "Why was the forbidden tree important in the story?",
        options: [
          "It tested Adam and Eve's obedience to God",
          "It created animals",
          "It made the garden grow",
          "It controlled the weather",
        ],
        correctIndex: 0,
        hint: "The rule was about trust.",
      },
      {
        question: "What could Adam have done when Eve offered him the fruit?",
        options: [
          "Eat it quickly",
          "Refuse and obey God's command",
          "Hide the fruit",
          "Throw it away",
        ],
        correctIndex: 1,
        hint: "Adam still had a choice.",
      },
      {
        question: "What larger change happened after this event?",
        options: [
          "Humans gained wealth",
          "Sin entered the world and affected humanity",
          "The earth stopped growing",
          "The animals disappeared",
        ],
        correctIndex: 1,
        hint: "This moment changed human history.",
      },
    ],
  },
  {
    id: 3,
    title: "Level 3",
    theme: "The Brothers",
    story:
      "As Adam and Eve's family grew, their sons Cain and Abel began working in different ways. Abel cared for sheep in the fields, while Cain worked hard growing crops from the soil. One day, both brothers decided to offer gifts to God. Abel chose the best animals from his flock, offering them with sincerity and gratitude. Cain also brought crops from his farm, but his heart was not as devoted. When God looked with favor upon Abel's offering, Cain became angry and jealous. Instead of learning from the moment, he allowed his anger to grow. In a moment of rage, Cain attacked his brother Abel in the field.",
    questions: [
      {
        question: "Why did God favor Abel's offering?",
        options: [
          "Abel offered his best with sincerity",
          "Sheep were worth more than crops",
          "Cain forgot to bring food",
          "Abel was older",
        ],
        correctIndex: 0,
        hint: "The heart behind the gift mattered.",
      },
      {
        question: "What emotion caused Cain to make a terrible decision?",
        options: ["Fear", "Jealousy and anger", "Happiness", "Curiosity"],
        correctIndex: 1,
        hint: "Cain compared himself to his brother.",
      },
      {
        question: "What could Cain have done instead of harming Abel?",
        options: [
          "Improve his offering and attitude toward God",
          "Leave the farm forever",
          "Destroy the crops",
          "Ignore God completely",
        ],
        correctIndex: 0,
        hint: "The problem was not farming.",
      },
      {
        question: "What lesson does this story teach about jealousy?",
        options: [
          "It helps people succeed",
          "It can lead to harmful actions if not controlled",
          "It always makes people stronger",
          "It improves relationships",
        ],
        correctIndex: 1,
        hint: "Cain allowed jealousy to grow.",
      },
      {
        question: "Why is this story important in the Bible?",
        options: [
          "It shows the first violent conflict between humans",
          "It explains farming",
          "It creates cities",
          "It begins the flood",
        ],
        correctIndex: 0,
        hint: "This was the first murder.",
      },
    ],
  },
  {
    id: 4,
    title: "Level 4",
    theme: "The World Before the Flood",
    story:
      "Many years passed, and the earth filled with people. Unfortunately, many began to forget God and chose to live in selfish and violent ways. God saw that the world had become full of corruption and wickedness. Among all the people, however, there was one man who still walked faithfully with God \u2014 Noah. God decided that the world needed a new beginning. He told Noah to build a great ark and prepare for a flood that would cover the earth. Noah trusted God and began building the enormous boat, even though people around him did not understand why.",
    questions: [
      {
        question: "Why did God decide to send a flood?",
        options: [
          "The earth had become full of wickedness and violence",
          "The oceans were too small",
          "People needed more water",
          "Animals were disappearing",
        ],
        correctIndex: 0,
        hint: "The problem was human behavior.",
      },
      {
        question: "Why was Noah chosen to build the ark?",
        options: [
          "He was the strongest man",
          "He remained faithful and obedient to God",
          "He owned many animals",
          "He was a king",
        ],
        correctIndex: 1,
        hint: "Noah lived differently from others.",
      },
      {
        question:
          "What might people have thought when they saw Noah building the ark?",
        options: [
          "They probably questioned or laughed at him",
          "They immediately joined him",
          "They helped him build cities",
          "They built ships too",
        ],
        correctIndex: 0,
        hint: "They didn't know about the coming flood.",
      },
      {
        question: "What quality did Noah show by continuing to build the ark?",
        options: ["Pride", "Faith and obedience", "Fear", "Anger"],
        correctIndex: 1,
        hint: "He trusted God's warning.",
      },
      {
        question:
          "What does this story suggest about God's relationship with humanity?",
        options: [
          "God ignores people",
          "God cares about righteousness and justice",
          "God forgets the world",
          "God only loves animals",
        ],
        correctIndex: 1,
        hint: "Noah's faith mattered.",
      },
    ],
  },
  {
    id: 5,
    title: "Level 5",
    theme: "The Ark and the Rainbow",
    story:
      "Noah followed God's instructions and built a massive ark. When the time came, animals began arriving in pairs \u2014 lions, birds, sheep, elephants, and many more. Noah, his family, and the animals entered the ark. Soon dark clouds gathered, and rain began to fall. The rain continued for forty days and nights, covering the earth with water. The ark floated safely above the floodwaters. Eventually, the rain stopped and the waters slowly receded. When Noah stepped onto dry land again, God placed a rainbow in the sky as a promise that the earth would never again be destroyed by a flood.",
    questions: [
      {
        question: "Why were animals brought into the ark in pairs?",
        options: [
          "To preserve life after the flood",
          "To make the ark heavy",
          "To entertain Noah",
          "To control the weather",
        ],
        correctIndex: 0,
        hint: "Think about what happens after the flood ends.",
      },
      {
        question:
          "What does Noah entering the ark show about his trust in God?",
        options: [
          "He believed God's warning and followed instructions",
          "He wanted to hide from animals",
          "He was afraid of rain",
          "He planned to travel",
        ],
        correctIndex: 0,
        hint: "Noah trusted God's message.",
      },
      {
        question: "Why did the ark float instead of sinking?",
        options: [
          "God protected Noah and his family during the flood",
          "The animals pushed the ark",
          "The wind lifted it",
          "Noah rowed it",
        ],
        correctIndex: 0,
        hint: "The ark was part of God's plan.",
      },
      {
        question: "What did the rainbow symbolize after the flood?",
        options: [
          "God's promise never to destroy the earth with a flood again",
          "The end of animals",
          "The beginning of farming",
          "A signal for storms",
        ],
        correctIndex: 0,
        hint: "It represents a promise.",
      },
      {
        question: "What lesson does the story of Noah teach about faith?",
        options: [
          "Faith means trusting God even when others doubt",
          "Faith means avoiding hard work",
          "Faith means building houses",
          "Faith means ignoring warnings",
        ],
        correctIndex: 0,
        hint: "Noah kept building even when others didn't understand.",
      },
    ],
  },
  {
    id: 6,
    title: "Level 6",
    theme: "The Tower of Babel",
    story:
      "After the flood, Noah's family began to grow, and soon many people lived across the land again. At that time, everyone spoke the same language, so they could easily work together. The people decided to build a huge city with a tower that reached high into the sky. They believed that building such a tower would make them famous and powerful. As the tower grew taller, their pride grew as well. God saw that the people were becoming arrogant and trying to glorify themselves rather than Him. To stop this, God confused their language so they could no longer understand one another. Workers who once cooperated suddenly could not communicate. The construction stopped, and people scattered across the earth. The city became known as Babel, a place remembered for confusion.",
    questions: [
      {
        question: "Why did the people want to build the tower?",
        options: [
          "To protect themselves from animals",
          "To make themselves famous and powerful",
          "To store food",
          "To escape a storm",
        ],
        correctIndex: 1,
        hint: "The story mentions their growing pride.",
      },
      {
        question: "Why was the tower project stopped suddenly?",
        options: [
          "The tower collapsed",
          "People began speaking different languages and could not understand each other",
          "A flood destroyed the city",
          "The people became tired",
        ],
        correctIndex: 1,
        hint: "Communication became impossible.",
      },
      {
        question: "What lesson can be learned from the people's actions?",
        options: [
          "Working together is always wrong",
          "Pride and arrogance can lead to downfall",
          "Towers are dangerous",
          "Cities should not be built",
        ],
        correctIndex: 1,
        hint: "Their goal was to glorify themselves.",
      },
      {
        question: "Why did people scatter across the earth afterward?",
        options: [
          "They wanted to travel",
          "They could no longer cooperate due to language differences",
          "They were searching for food",
          "They were afraid of animals",
        ],
        correctIndex: 1,
        hint: "Imagine working with someone you cannot understand.",
      },
      {
        question: 'What does the name "Babel" represent in this story?',
        options: ["Strength", "Confusion of languages", "Victory", "Peace"],
        correctIndex: 1,
        hint: "Think about what happened to communication.",
      },
    ],
  },
  {
    id: 7,
    title: "Level 7",
    theme: "God Calls Abraham",
    story:
      "Many generations later, a man named Abram lived with his family in a land called Ur. One day, God spoke to Abram and gave him a surprising command: leave your home and travel to a land I will show you. God also made a powerful promise. He told Abram that his descendants would become a great nation and that through his family the whole world would be blessed. Abram did not know exactly where he was going, but he trusted God and began the journey with his wife Sarai and his nephew Lot. They traveled through deserts and valleys, believing that God would guide them. Abram's faith became an important example for future generations.",
    questions: [
      {
        question: "Why was Abram's decision to leave his homeland significant?",
        options: [
          "He was forced to leave",
          "He trusted God even without knowing the destination",
          "He wanted to travel for fun",
          "He was escaping enemies",
        ],
        correctIndex: 1,
        hint: "Abram obeyed before seeing the full plan.",
      },
      {
        question: "What promise did God make to Abram?",
        options: [
          "He would become a king",
          "His descendants would become a great nation",
          "He would build a city",
          "He would find gold",
        ],
        correctIndex: 1,
        hint: "Think about the future of Abram's family.",
      },
      {
        question: "What quality made Abram an important figure in the Bible?",
        options: [
          "His strength",
          "His wealth",
          "His faith and obedience to God",
          "His army",
        ],
        correctIndex: 2,
        hint: "Abram trusted God's guidance.",
      },
      {
        question: "Why might Abram's journey have required courage?",
        options: [
          "He was traveling to a completely unknown land",
          "He was climbing mountains",
          "He was fighting enemies",
          "He was sailing the ocean",
        ],
        correctIndex: 0,
        hint: "He didn't know where he was going.",
      },
      {
        question: "What lesson can players learn from Abram's story?",
        options: [
          "Faith means trusting God even when the path is unclear",
          "Travel is always dangerous",
          "Wealth is most important",
          "Cities are better than villages",
        ],
        correctIndex: 0,
        hint: "Abram trusted before seeing results.",
      },
    ],
  },
  {
    id: 8,
    title: "Level 8",
    theme: "A Test of Faith",
    story:
      "Years passed, and God finally fulfilled His promise to Abraham and Sarah by giving them a son named Isaac. Isaac brought great joy to the family. However, one day God tested Abraham's faith in a difficult way. God asked Abraham to take Isaac to a mountain and offer him as a sacrifice. Abraham was confused and heartbroken, yet he trusted that God had a purpose. He traveled with Isaac to the mountain and prepared the altar. Just as Abraham was about to sacrifice his son, an angel called out and stopped him. God provided a ram to sacrifice instead. Through this moment, Abraham showed that his faith in God was greater than anything else.",
    questions: [
      {
        question: "Why was God's request difficult for Abraham?",
        options: [
          "Isaac was his promised and beloved son",
          "Abraham disliked mountains",
          "The journey was too long",
          "Isaac was sick",
        ],
        correctIndex: 0,
        hint: "Isaac was the son God had promised.",
      },
      {
        question: "What does Abraham's willingness show about his faith?",
        options: [
          "He trusted God completely even in difficult situations",
          "He was afraid",
          "He was confused",
          "He was forced",
        ],
        correctIndex: 0,
        hint: "Faith sometimes requires sacrifice.",
      },
      {
        question: "Why did the angel stop Abraham?",
        options: [
          "God only wanted to test Abraham's faith",
          "Isaac ran away",
          "The altar broke",
          "The mountain collapsed",
        ],
        correctIndex: 0,
        hint: "The test had already been proven.",
      },
      {
        question: "What did God provide instead of Isaac?",
        options: ["A lamb", "A ram caught in a bush", "A bird", "A goat"],
        correctIndex: 1,
        hint: "Abraham saw it nearby.",
      },
      {
        question: "What lesson does this story teach?",
        options: [
          "Faith means trusting God even when we do not fully understand His plan",
          "Mountains are sacred",
          "Sacrifices are always required",
          "Tests should be avoided",
        ],
        correctIndex: 0,
        hint: "Abraham believed God would provide.",
      },
    ],
  },
  {
    id: 9,
    title: "Level 9",
    theme: "Jacob and Esau",
    story:
      "Isaac had two sons named Jacob and Esau. Esau was the older brother and loved hunting in the wilderness. Jacob preferred staying near home and helping with family matters. One day, Esau returned from hunting extremely hungry. Jacob was cooking a pot of stew and offered some to Esau \u2014 but only if Esau traded his birthright. In those times, the birthright meant special blessings and leadership of the family. Esau cared more about satisfying his hunger than protecting his future inheritance, so he agreed to the trade. Later, this decision would shape the future of their family.",
    questions: [
      {
        question: "Why was Esau's decision important?",
        options: [
          "He traded something valuable for a temporary need",
          "He wanted to help Jacob",
          "The stew was special",
          "The birthright was meaningless",
        ],
        correctIndex: 0,
        hint: "The birthright represented future blessings.",
      },
      {
        question:
          "What does Esau's choice show about his priorities at that moment?",
        options: [
          "He valued immediate hunger more than future inheritance",
          "He wanted to help Jacob",
          "He wanted to travel",
          "He wanted to hunt again",
        ],
        correctIndex: 0,
        hint: "He focused on the present instead of the future.",
      },
      {
        question: "What lesson can players learn from this story?",
        options: [
          "Important decisions should not be made carelessly",
          "Stew is valuable",
          "Hunting is dangerous",
          "Brothers should not trade",
        ],
        correctIndex: 0,
        hint: "Some choices affect the future.",
      },
      {
        question: "Why did Jacob offer the trade?",
        options: [
          "He wanted Esau's birthright and blessings",
          "He disliked Esau",
          "He wanted stew",
          "He wanted to travel",
        ],
        correctIndex: 0,
        hint: "Jacob saw an opportunity.",
      },
      {
        question: "What does this story teach about long-term thinking?",
        options: [
          "Short-term desires can lead to losing greater future rewards",
          "Hunger is dangerous",
          "Trades are unfair",
          "Families argue often",
        ],
        correctIndex: 0,
        hint: "Esau chose the present over the future.",
      },
    ],
  },
  {
    id: 10,
    title: "Level 10",
    theme: "Joseph's Dreams",
    story:
      "Jacob had many sons, but he loved Joseph more than the others. He even gave Joseph a special colorful coat. Joseph also began having unusual dreams in which his brothers appeared to bow down to him. When Joseph shared these dreams, his brothers became jealous and angry. They felt that Joseph was bragging and that their father favored him too much. One day, when Joseph came to check on them in the fields, their jealousy turned into a terrible plan. Instead of harming him directly, they sold Joseph to traveling traders, who took him far away to Egypt. Joseph's journey was only beginning.",
    questions: [
      {
        question: "Why were Joseph's brothers jealous of him?",
        options: [
          "He worked harder",
          "Their father showed him special favor and he shared unusual dreams",
          "He owned more animals",
          "He traveled more",
        ],
        correctIndex: 1,
        hint: "Think about the coat and the dreams.",
      },
      {
        question: "Why did Joseph's dreams upset his brothers?",
        options: [
          "The dreams suggested that Joseph would one day rule over them",
          "The dreams were confusing",
          "The dreams involved animals",
          "The dreams were funny",
        ],
        correctIndex: 0,
        hint: "The brothers appeared to bow in the dream.",
      },
      {
        question: "What decision did the brothers make in the field?",
        options: [
          "They sent Joseph home",
          "They sold Joseph to traders going to Egypt",
          "They helped Joseph work",
          "They built a house",
        ],
        correctIndex: 1,
        hint: "Joseph was taken far away.",
      },
      {
        question: "What role did jealousy play in this story?",
        options: [
          "It led the brothers to make a cruel decision",
          "It helped Joseph travel",
          "It created peace",
          "It helped the family",
        ],
        correctIndex: 0,
        hint: "Their emotions influenced their actions.",
      },
      {
        question: "What does Joseph's story begin to show about God's plans?",
        options: [
          "Even difficult events can be part of a greater purpose",
          "Dreams are meaningless",
          "Families should separate",
          "Egypt was powerful",
        ],
        correctIndex: 0,
        hint: "Joseph's journey was only beginning.",
      },
    ],
  },
  {
    id: 11,
    title: "Level 11",
    theme: "Joseph in Egypt",
    story:
      "After Joseph's brothers sold him to traders, he was taken far away to Egypt. At first, Joseph became a servant in the house of a powerful Egyptian official named Potiphar. Joseph worked faithfully, and everything he managed succeeded. However, trouble came when Potiphar's wife falsely accused Joseph of doing something wrong. Because of this lie, Joseph was thrown into prison. Even there, Joseph remained faithful and helpful to others. God gave Joseph the ability to understand dreams, and he helped fellow prisoners by explaining their dreams. Though his situation looked hopeless, Joseph continued trusting that God had a plan for his life.",
    questions: [
      {
        question: "Why did Joseph remain hopeful even while in prison?",
        options: [
          "He believed God still had a purpose for his life",
          "He liked prison life",
          "He expected his brothers to return",
          "He wanted to stay there",
        ],
        correctIndex: 0,
        hint: "Joseph trusted something greater than his circumstances.",
      },
      {
        question:
          "What special ability helped Joseph gain attention in prison?",
        options: [
          "He could build houses",
          "He could interpret dreams",
          "He could fight soldiers",
          "He could travel quickly",
        ],
        correctIndex: 1,
        hint: "Prisoners shared their dreams with him.",
      },
      {
        question:
          "What does Joseph's behavior in difficult situations teach us?",
        options: [
          "Faithfulness and integrity matter even in hard times",
          "Prison changes people",
          "Egypt was powerful",
          "Dreams control the future",
        ],
        correctIndex: 0,
        hint: "Joseph stayed honest despite injustice.",
      },
      {
        question: "Why was Joseph's imprisonment unfair?",
        options: [
          "He was falsely accused by Potiphar's wife",
          "He broke a law",
          "He stole money",
          "He ran away",
        ],
        correctIndex: 0,
        hint: "Someone lied about him.",
      },
      {
        question: "What theme begins to appear in Joseph's story?",
        options: [
          "Difficult situations can lead to unexpected opportunities later",
          "Egypt is dangerous",
          "Servants are powerful",
          "Dreams always come true immediately",
        ],
        correctIndex: 0,
        hint: "Joseph's story is only beginning.",
      },
    ],
  },
  {
    id: 12,
    title: "Level 12",
    theme: "A Baby Named Moses",
    story:
      "Many years after Joseph lived in Egypt, the Israelites grew into a large nation. A new Pharaoh became afraid that they might become too powerful. To control them, he forced them into slavery and ordered that all Hebrew baby boys be killed. During this dangerous time, a woman named Jochebed gave birth to a son. Wanting to save him, she placed the baby in a basket and set it among the reeds of the Nile River. Pharaoh's daughter discovered the baby and felt compassion for him. She adopted the child and named him Moses, raising him in the palace even though he was born among the Hebrew slaves.",
    questions: [
      {
        question: "Why did Moses' mother hide him in a basket?",
        options: [
          "To protect him from Pharaoh's order to kill Hebrew babies",
          "To send him away",
          "To teach him to swim",
          "To travel",
        ],
        correctIndex: 0,
        hint: "The king had given a dangerous command.",
      },
      {
        question: "Why did Pharaoh fear the Israelites?",
        options: [
          "They were becoming numerous and strong",
          "They had powerful weapons",
          "They owned Egypt",
          "They lived in the palace",
        ],
        correctIndex: 0,
        hint: "Pharaoh worried about their growing population.",
      },
      {
        question: "What surprising turn of events saved Moses' life?",
        options: [
          "Pharaoh's daughter found and adopted him",
          "The basket floated to another country",
          "Soldiers protected him",
          "His family escaped Egypt",
        ],
        correctIndex: 0,
        hint: "Someone from Pharaoh's own family helped him.",
      },
      {
        question: "Why is Moses' rescue important for the future story?",
        options: [
          "He would later lead the Israelites to freedom",
          "He became Pharaoh",
          "He became a soldier",
          "He built cities",
        ],
        correctIndex: 0,
        hint: "Moses would play a major role later.",
      },
      {
        question: "What lesson can be learned from Moses' mother's actions?",
        options: [
          "Courage and creativity can protect others in dangerous times",
          "Rivers are safe places",
          "Kings are kind",
          "Children should travel",
        ],
        correctIndex: 0,
        hint: "She found a clever way to save her child.",
      },
    ],
  },
  {
    id: 13,
    title: "Level 13",
    theme: "The Burning Bush",
    story:
      "Years later, Moses had left Egypt and was living as a shepherd in the desert. One day while tending his sheep, he noticed something unusual. A bush was on fire, yet it was not being burned up. Curious, Moses walked closer to investigate. From the bush, God spoke to Moses and told him that He had seen the suffering of the Israelites in Egypt. God had chosen Moses to return to Egypt and lead His people out of slavery. Moses felt afraid and unsure of himself, wondering how he could face Pharaoh. But God promised to be with him and guide him.",
    questions: [
      {
        question: "Why did the burning bush capture Moses' attention?",
        options: [
          "The bush was on fire but did not burn away",
          "The bush was glowing",
          "The bush moved",
          "The bush grew taller",
        ],
        correctIndex: 0,
        hint: "Fire usually destroys things.",
      },
      {
        question: "Why did God speak to Moses through the bush?",
        options: [
          "To call Moses to lead the Israelites out of Egypt",
          "To teach Moses about fire",
          "To test Moses' strength",
          "To create light",
        ],
        correctIndex: 0,
        hint: "Moses received an important mission.",
      },
      {
        question: "Why did Moses doubt himself?",
        options: [
          "He felt unqualified to confront Pharaoh",
          "He disliked Egypt",
          "He forgot the language",
          "He wanted to stay a shepherd",
        ],
        correctIndex: 0,
        hint: "Moses wondered if he was capable.",
      },
      {
        question: "What reassurance did God give Moses?",
        options: [
          "God promised to be with him and guide him",
          "God would send soldiers",
          "God would build a palace",
          "God would create storms",
        ],
        correctIndex: 0,
        hint: "Moses would not face Pharaoh alone.",
      },
      {
        question: "What lesson can players learn from this story?",
        options: [
          "Even ordinary people can be called for great purposes",
          "Fire is dangerous",
          "Deserts are quiet",
          "Shepherds are powerful",
        ],
        correctIndex: 0,
        hint: "Moses was just a shepherd.",
      },
    ],
  },
  {
    id: 14,
    title: "Level 14",
    theme: "The Exodus Begins",
    story:
      "Moses returned to Egypt with his brother Aaron to speak with Pharaoh. They delivered God's message: \"Let my people go.\" Pharaoh refused to release the Israelites and even made their work harder. Because Pharaoh's heart remained stubborn, God sent a series of powerful plagues upon Egypt \u2014 rivers turned to blood, swarms of frogs covered the land, darkness filled the sky, and many other signs followed. Each plague showed that God had power greater than Pharaoh's authority. Yet Pharaoh continued to resist until the final and most serious plague approached.",
    questions: [
      {
        question: "Why did Moses and Aaron confront Pharaoh?",
        options: [
          "To demand the freedom of the Israelites",
          "To ask for food",
          "To build cities",
          "To trade goods",
        ],
        correctIndex: 0,
        hint: "They carried God's message.",
      },
      {
        question: "Why did God send plagues upon Egypt?",
        options: [
          "To show Pharaoh His power and persuade him to free the Israelites",
          "To punish animals",
          "To create storms",
          "To change the weather",
        ],
        correctIndex: 0,
        hint: "Pharaoh refused to listen.",
      },
      {
        question: "What does Pharaoh's reaction show about his character?",
        options: [
          "He was stubborn and refused to change his decision",
          "He was afraid",
          "He was confused",
          "He was generous",
        ],
        correctIndex: 0,
        hint: "He ignored many warnings.",
      },
      {
        question: "Why were the plagues important for the Israelites?",
        options: [
          "They showed that God was fighting for their freedom",
          "They made Egypt richer",
          "They helped farming",
          "They created cities",
        ],
        correctIndex: 0,
        hint: "God was protecting His people.",
      },
      {
        question: "What lesson appears in this part of the story?",
        options: [
          "Ignoring truth and warnings can lead to greater consequences",
          "Kings are always powerful",
          "Weather controls people",
          "Rivers control history",
        ],
        correctIndex: 0,
        hint: "Pharaoh kept refusing.",
      },
    ],
  },
  {
    id: 15,
    title: "Level 15",
    theme: "The Red Sea Miracle",
    story:
      "After the final plague, Pharaoh finally allowed the Israelites to leave Egypt. Moses led thousands of people into the desert toward freedom. However, Pharaoh soon changed his mind and sent his army to chase them. The Israelites found themselves trapped between Pharaoh's soldiers and the Red Sea. Fear spread through the crowd. But Moses trusted God. God instructed Moses to stretch out his staff over the sea. Suddenly, the waters parted, creating a dry path through the middle of the sea. The Israelites crossed safely. When Pharaoh's army followed, the waters returned and stopped them.",
    questions: [
      {
        question: "Why were the Israelites afraid near the Red Sea?",
        options: [
          "Pharaoh's army was chasing them and they seemed trapped",
          "The sea was too deep",
          "They lost their supplies",
          "They were tired",
        ],
        correctIndex: 0,
        hint: "They had enemies behind them.",
      },
      {
        question: "What action did Moses take before the sea parted?",
        options: [
          "He stretched out his staff as God commanded",
          "He ran away",
          "He built a boat",
          "He prayed silently",
        ],
        correctIndex: 0,
        hint: "God gave him a specific instruction.",
      },
      {
        question: "What miracle happened at the Red Sea?",
        options: [
          "The water parted to create a path for the Israelites",
          "The sea disappeared",
          "The soldiers surrendered",
          "The desert flooded",
        ],
        correctIndex: 0,
        hint: "The people walked through the sea.",
      },
      {
        question: "Why did the miracle strengthen the Israelites' faith?",
        options: [
          "It showed that God could protect them from impossible situations",
          "It helped them fish",
          "It created a river",
          "It built a city",
        ],
        correctIndex: 0,
        hint: "They were saved when escape seemed impossible.",
      },
      {
        question: "What lesson can players learn from this event?",
        options: [
          "Trusting God can bring hope even when situations seem impossible",
          "Seas are dangerous",
          "Soldiers are strong",
          "Deserts are empty",
        ],
        correctIndex: 0,
        hint: "The path appeared when they trusted.",
      },
    ],
  },
  {
    id: 16,
    title: "Level 16",
    theme: "The Ten Commandments",
    story:
      "After crossing the Red Sea, Moses led the Israelites through the desert toward Mount Sinai. There, God called Moses up the mountain. Thick clouds, thunder, and lightning surrounded the mountain as Moses climbed higher. God wanted to teach His people how to live in a way that honored Him and protected their community. So He gave Moses ten important laws known as the Ten Commandments. These commandments taught the Israelites to worship only God, respect others, tell the truth, and live honestly. When Moses returned with the stone tablets, he was bringing not just rules, but guidance for building a strong and just society.",
    questions: [
      {
        question: "Why did God give the Ten Commandments to the Israelites?",
        options: [
          "To guide them in living a just and faithful life",
          "To test their strength",
          "To create new cities",
          "To control the weather",
        ],
        correctIndex: 0,
        hint: "The commandments taught them how to live together.",
      },
      {
        question: "Why did Moses go up the mountain alone?",
        options: [
          "God called him personally to receive the laws",
          "The mountain was too steep",
          "The people refused to go",
          "He wanted to explore",
        ],
        correctIndex: 0,
        hint: "Moses acted as the leader and messenger.",
      },
      {
        question:
          "What does the setting of thunder and clouds suggest about the moment?",
        options: [
          "It shows the seriousness and power of God's presence",
          "It means a storm started",
          "It scared the animals",
          "It created darkness",
        ],
        correctIndex: 0,
        hint: "The moment was meant to feel powerful and important.",
      },
      {
        question: "Why were the commandments written on stone tablets?",
        options: [
          "To make them permanent and memorable for the people",
          "Because paper didn't exist",
          "To decorate the mountain",
          "To build houses",
        ],
        correctIndex: 0,
        hint: "Stone lasts longer than other materials.",
      },
      {
        question:
          "What lesson can people today still learn from the Ten Commandments?",
        options: [
          "Respecting God and others builds a strong community",
          "Mountains are powerful",
          "Laws are unnecessary",
          "Deserts are important",
        ],
        correctIndex: 0,
        hint: "The commandments focus on relationships.",
      },
    ],
  },
  {
    id: 17,
    title: "Level 17",
    theme: "The Walls of Jericho",
    story:
      "Years later, the Israelites were finally approaching the Promised Land. Their first major challenge was the city of Jericho, which had massive walls protecting it. Instead of attacking the city with weapons, God gave Joshua a surprising strategy. The Israelites were told to march around the city once each day for six days. On the seventh day, they marched around the city seven times. Priests blew trumpets while the people remained silent. Finally, Joshua told the people to shout loudly. As their voices echoed, something incredible happened \u2014 the walls of Jericho collapsed.",
    questions: [
      {
        question: "Why was the plan for capturing Jericho unusual?",
        options: [
          "It relied on obedience and faith rather than traditional warfare",
          "The city had no soldiers",
          "The walls were weak",
          "The people had strong weapons",
        ],
        correctIndex: 0,
        hint: "The strategy involved marching and shouting.",
      },
      {
        question: "Why did the people stay silent while marching?",
        options: [
          "They were following God's instructions exactly",
          "They were afraid",
          "They were tired",
          "They forgot to speak",
        ],
        correctIndex: 0,
        hint: "Silence was part of the plan.",
      },
      {
        question: "Why did the walls collapse after the shout?",
        options: [
          "It was a miracle showing God's power and the people's faith",
          "The walls were old",
          "Soldiers pushed them",
          "The wind blew them down",
        ],
        correctIndex: 0,
        hint: "The people trusted God's plan.",
      },
      {
        question: "What lesson does the story of Jericho teach?",
        options: [
          "Obedience and faith can lead to unexpected victories",
          "Cities should be avoided",
          "Trumpets destroy walls",
          "Marching is powerful",
        ],
        correctIndex: 0,
        hint: "The victory came through trust.",
      },
      {
        question:
          "Why might the story emphasize patience during the first six days?",
        options: [
          "Some plans require persistence and trust before results appear",
          "The people were tired",
          "The walls were too tall",
          "The soldiers were weak",
        ],
        correctIndex: 0,
        hint: "The victory did not happen immediately.",
      },
    ],
  },
  {
    id: 18,
    title: "Level 18",
    theme: "Samson's Strength",
    story:
      "During the time of the judges, a man named Samson was born with incredible strength. From birth, he was chosen by God to help protect Israel from its enemies, the Philistines. Samson's strength was connected to a special promise that he would never cut his hair. Over time, Samson defeated many enemies with his strength. However, Samson also made careless choices. Eventually, a woman named Delilah discovered the secret of his strength and told the Philistines. When Samson's hair was cut, he lost his power and was captured. Later, Samson prayed to God for strength one final time.",
    questions: [
      {
        question: "Why was Samson's strength special?",
        options: [
          "It was connected to a promise he made to God about his hair",
          "He trained every day",
          "He ate strong food",
          "He was a soldier",
        ],
        correctIndex: 0,
        hint: "His hair symbolized the promise.",
      },
      {
        question: "Why did Samson lose his strength?",
        options: [
          "His hair was cut, breaking the promise tied to his strength",
          "He became tired",
          "He fought too many battles",
          "He left the city",
        ],
        correctIndex: 0,
        hint: "Delilah learned his secret.",
      },
      {
        question: "What mistake did Samson make with Delilah?",
        options: [
          "He trusted someone who did not protect his secret",
          "He fought too much",
          "He traveled too far",
          "He forgot his mission",
        ],
        correctIndex: 0,
        hint: "Trusting the wrong person caused trouble.",
      },
      {
        question: "What lesson can be learned from Samson's story?",
        options: [
          "Strength alone is not enough without wisdom and discipline",
          "Hair is powerful",
          "Enemies are strong",
          "Cities are dangerous",
        ],
        correctIndex: 0,
        hint: "Samson's choices mattered.",
      },
      {
        question: "Why is Samson remembered in the Bible?",
        options: [
          "He was a judge chosen to help defend Israel against enemies",
          "He became king",
          "He built temples",
          "He wrote laws",
        ],
        correctIndex: 0,
        hint: "He lived during the time of judges.",
      },
    ],
  },
  {
    id: 19,
    title: "Level 19",
    theme: "Samuel Hears God",
    story:
      'A young boy named Samuel lived in the temple under the care of a priest named Eli. One night while Samuel was sleeping, he heard someone call his name. Thinking it was Eli, Samuel ran to him, but Eli had not called him. This happened several times until Eli realized that God was speaking to Samuel. Eli instructed Samuel to listen carefully and respond. When Samuel heard the voice again, he answered, "Speak, Lord, for your servant is listening." From that moment, Samuel became a prophet who would guide the people of Israel.',
    questions: [
      {
        question: "Why did Samuel run to Eli when he first heard his name?",
        options: [
          "He thought Eli had called him",
          "He was afraid",
          "He wanted help",
          "He was curious",
        ],
        correctIndex: 0,
        hint: "Samuel did not realize God was speaking yet.",
      },
      {
        question: "How did Eli help Samuel understand the situation?",
        options: [
          "He explained that God might be calling Samuel",
          "He ignored the voice",
          "He told Samuel to sleep",
          "He called soldiers",
        ],
        correctIndex: 0,
        hint: "Eli recognized what was happening.",
      },
      {
        question: "Why was Samuel's response important?",
        options: [
          "He showed willingness to listen to God's guidance",
          "He obeyed Eli",
          "He wanted to stay awake",
          "He wanted to speak loudly",
        ],
        correctIndex: 0,
        hint: "Samuel said he was ready to listen.",
      },
      {
        question: "What role did Samuel eventually take?",
        options: ["Prophet who guided Israel", "Soldier", "King", "Farmer"],
        correctIndex: 0,
        hint: "He spoke God's messages.",
      },
      {
        question: "What lesson does this story teach about listening?",
        options: [
          "Being attentive can help us recognize important guidance",
          "Sleep is important",
          "Voices are confusing",
          "Temples are quiet",
        ],
        correctIndex: 0,
        hint: "Samuel learned to listen carefully.",
      },
    ],
  },
  {
    id: 20,
    title: "Level 20",
    theme: "David and Goliath",
    story:
      "When the Israelites faced the Philistine army, a giant warrior named Goliath challenged them every day. He was enormous and heavily armed, and no soldier dared fight him. A young shepherd named David arrived to bring food to his brothers in the army camp. When David heard Goliath mocking Israel, he believed God would help him defeat the giant. Instead of heavy armor, David chose a sling and five smooth stones. As Goliath approached, David swung the sling and released a stone. The stone struck the giant, and Goliath fell to the ground.",
    questions: [
      {
        question:
          "Why was David confident even though Goliath was much stronger?",
        options: [
          "David trusted that God would help him succeed",
          "David was taller",
          "David had armor",
          "David had many soldiers",
        ],
        correctIndex: 0,
        hint: "David's confidence came from faith.",
      },
      {
        question: "Why did David refuse the king's armor?",
        options: [
          "He was not used to fighting with heavy armor",
          "It was broken",
          "It was too expensive",
          "It belonged to someone else",
        ],
        correctIndex: 0,
        hint: "David fought differently.",
      },
      {
        question: "What weapon did David use against Goliath?",
        options: ["Sword", "Spear", "Sling and stone", "Bow"],
        correctIndex: 2,
        hint: "A simple shepherd's tool.",
      },
      {
        question: "What lesson does David's victory teach?",
        options: [
          "Courage and faith can overcome even great obstacles",
          "Giants are weak",
          "Armor is useless",
          "Stones are powerful",
        ],
        correctIndex: 0,
        hint: "David believed God would help.",
      },
      {
        question: "Why is David's story remembered?",
        options: [
          "A young shepherd defeated a giant warrior through faith and courage",
          "He built cities",
          "He became a soldier",
          "He traveled far",
        ],
        correctIndex: 0,
        hint: "It shows courage against impossible odds.",
      },
    ],
  },
  {
    id: 21,
    title: "Level 21",
    theme: "A Night in Bethlehem",
    story:
      "The Roman Empire ordered everyone to return to their hometowns for a census. Because Joseph's family line came from King David, he and Mary traveled to Bethlehem. The journey was long and difficult, especially since Mary was about to give birth. When they arrived, the town was crowded with travelers, and every guest room was full. With nowhere else to go, they found shelter in a place where animals were kept. That night, Mary gave birth to a baby boy named Jesus. She wrapped Him in cloth and laid Him in a manger used to feed animals. Outside the town, shepherds were watching their flocks when suddenly the sky filled with angels announcing the birth of a Savior. The shepherds hurried to Bethlehem and found the child exactly as the angels described.",
    questions: [
      {
        question:
          "Why might the story emphasize that Jesus was born in a place meant for animals rather than a palace?",
        options: [
          "To show that His mission focused on humility rather than earthly power",
          "Because animals were sacred",
          "Because Joseph preferred barns",
          "Because the census required it",
        ],
        correctIndex: 0,
        hint: "Think about what kind of king people expected.",
      },
      {
        question:
          "Why were shepherds chosen to hear the news first instead of kings or rulers?",
        options: [
          "The message of Jesus was meant for ordinary people as well as leaders",
          "Shepherds lived closest to Bethlehem",
          "Angels only appear to shepherds",
          "Kings were busy",
        ],
        correctIndex: 0,
        hint: "Consider who the story highlights.",
      },
      {
        question:
          "What challenge did Mary and Joseph face that shaped the circumstances of Jesus' birth?",
        options: [
          "The census created overcrowding in Bethlehem",
          "They were lost in the desert",
          "Soldiers were chasing them",
          "They had no food",
        ],
        correctIndex: 0,
        hint: "Many travelers arrived at the same time.",
      },
      {
        question: "Why did the shepherds go immediately to see the child?",
        options: [
          "They trusted the angel's message and wanted to witness the event themselves",
          "They wanted gifts",
          "They were curious travelers",
          "They were ordered to go",
        ],
        correctIndex: 0,
        hint: "Their actions showed belief.",
      },
      {
        question:
          "What larger theme does this story introduce about Jesus' life?",
        options: [
          "Great purpose can begin in unexpected and humble circumstances",
          "Cities are important",
          "Animals protect people",
          "Travel creates miracles",
        ],
        correctIndex: 0,
        hint: "The setting contrasts with expectations of royalty.",
      },
    ],
  },
  {
    id: 22,
    title: "Level 22",
    theme: "The Star That Guided Travelers",
    story:
      "In distant lands to the east, scholars known as wise men studied the movements of the stars. One night they noticed a brilliant star unlike anything they had seen before. Their knowledge of ancient prophecies led them to believe that a new king had been born. Determined to find this king, they began a long journey across deserts and cities. When they reached Jerusalem, they asked King Herod where the newborn king could be found. Herod secretly feared losing his power, so he asked the wise men to return with information. Guided again by the mysterious star, the travelers arrived in Bethlehem where they found the child Jesus. They bowed in respect and offered gifts of gold, frankincense, and myrrh before returning home by another route.",
    questions: [
      {
        question:
          "Why did the wise men trust the star enough to begin a long journey?",
        options: [
          "They believed it confirmed ancient prophecies about a new king",
          "They were exploring the desert",
          "They wanted to trade goods",
          "They were lost",
        ],
        correctIndex: 0,
        hint: "Their decision was based on knowledge and belief.",
      },
      {
        question:
          "Why might King Herod have been troubled by the news of a newborn king?",
        options: [
          "He feared losing his political power and authority",
          "He disliked travelers",
          "He did not believe in stars",
          "He feared the wise men",
        ],
        correctIndex: 0,
        hint: "Herod was already the ruler.",
      },
      {
        question: "Why were the wise men's gifts significant?",
        options: [
          "They symbolized honor, worship, and recognition of Jesus' importance",
          "They were expensive",
          "They were common gifts",
          "They were required",
        ],
        correctIndex: 0,
        hint: "Each gift had symbolic meaning.",
      },
      {
        question: "Why did the wise men choose a different route home?",
        options: [
          "They were warned that Herod's intentions were dangerous",
          "They got lost",
          "They wanted adventure",
          "The star disappeared",
        ],
        correctIndex: 0,
        hint: "Someone's plan could have harmed the child.",
      },
      {
        question: "What lesson does their journey highlight?",
        options: [
          "Seeking truth often requires effort, courage, and persistence",
          "Travel creates wisdom",
          "Stars control history",
          "Kings rule the world",
        ],
        correctIndex: 0,
        hint: "They traveled very far for their search.",
      },
    ],
  },
  {
    id: 23,
    title: "Level 23",
    theme: "The Voice at the River",
    story:
      "Years passed, and Jesus grew into adulthood. At the Jordan River, a prophet named John the Baptist preached passionately to the people. He called them to change their lives and prepare for God's kingdom. Many people came to the river to be baptized as a sign of repentance. One day Jesus came to John and asked to be baptized as well. John hesitated because he believed Jesus was greater than him. Yet Jesus insisted, saying it was the right step to fulfill God's plan. As Jesus came out of the water, the sky seemed to open and the Spirit of God descended like a dove. A voice from heaven declared, \"This is my beloved Son, in whom I am well pleased.\"",
    questions: [
      {
        question: "Why was John hesitant to baptize Jesus?",
        options: [
          "John believed Jesus was greater and did not need repentance",
          "The river was too crowded",
          "John feared the crowd",
          "Jesus refused",
        ],
        correctIndex: 0,
        hint: "John recognized something unique about Him.",
      },
      {
        question: "Why did Jesus still choose to be baptized?",
        options: [
          "To begin His mission and identify with humanity's journey toward God",
          "To impress the crowd",
          "To teach John",
          "To travel",
        ],
        correctIndex: 0,
        hint: "It marked the beginning of something.",
      },
      {
        question: "What role did the dove play in the story?",
        options: [
          "It symbolized the presence of God's Spirit affirming Jesus' mission",
          "It guided travelers",
          "It warned the crowd",
          "It brought food",
        ],
        correctIndex: 0,
        hint: "The symbol came from heaven.",
      },
      {
        question:
          "Why might the voice from heaven be important for those witnessing the event?",
        options: [
          "It confirmed Jesus' identity and divine purpose",
          "It scared the crowd",
          "It stopped the river",
          "It called John",
        ],
        correctIndex: 0,
        hint: "The voice described Jesus as beloved.",
      },
      {
        question: "What theme emerges from this moment?",
        options: [
          "True leadership begins with humility and obedience to God's purpose",
          "Rivers create miracles",
          "Baptism is required",
          "Crowds create leaders",
        ],
        correctIndex: 0,
        hint: "Jesus began His mission quietly.",
      },
    ],
  },
  {
    id: 24,
    title: "Level 24",
    theme: "Leaving the Nets Behind",
    story:
      'One morning along the Sea of Galilee, fishermen were busy casting and repairing their nets. Fishing was their livelihood and had supported their families for years. As Jesus walked along the shore, He called out to some of the fishermen, inviting them to follow Him. He promised they would become "fishers of people," helping others discover God\'s kingdom. This invitation was unexpected and required a difficult decision. Following Jesus meant leaving behind familiar routines, boats, and secure work. Yet several fishermen immediately stepped away from their nets and followed Him. Their choice marked the beginning of a journey that would change their lives and influence the world.',
    questions: [
      {
        question:
          "Why was leaving their nets such a significant decision for the fishermen?",
        options: [
          "It meant leaving their stable livelihood and trusting a new purpose",
          "They disliked fishing",
          "They wanted to travel",
          "They had new boats",
        ],
        correctIndex: 0,
        hint: "Fishing was their main work.",
      },
      {
        question: 'What did Jesus mean by calling them "fishers of people"?',
        options: [
          "They would guide others toward understanding God's message",
          "They would catch more fish",
          "They would travel oceans",
          "They would teach fishing",
        ],
        correctIndex: 0,
        hint: "The phrase is symbolic.",
      },
      {
        question: "Why might the disciples' response show strong faith?",
        options: [
          "They trusted Jesus before fully understanding where the journey would lead",
          "They were bored",
          "They disliked fishing",
          "They had no families",
        ],
        correctIndex: 0,
        hint: "They followed immediately.",
      },
      {
        question: "What quality did Jesus see in these fishermen?",
        options: [
          "Willingness to learn and courage to change their lives",
          "Physical strength",
          "Wealth",
          "Education",
        ],
        correctIndex: 0,
        hint: "Their openness mattered.",
      },
      {
        question: "What lesson might players take from this story?",
        options: [
          "Life-changing opportunities sometimes require leaving comfort behind",
          "Fishing is difficult",
          "Boats are powerful",
          "Work should stop",
        ],
        correctIndex: 0,
        hint: "Following a calling requires courage.",
      },
    ],
  },
  {
    id: 25,
    title: "Level 25",
    theme: "Signs of Compassion",
    story:
      "As Jesus traveled from town to town, crowds gathered to hear His teachings. Many people brought friends and family members who were sick, injured, or unable to see. Jesus healed the blind, helped the paralyzed walk again, and comforted those who were suffering. These miracles amazed the crowds, but they were more than displays of power. They showed deep compassion for those in need. Jesus often reminded people that faith, kindness, and mercy were more important than status or wealth. Through these acts, many began to believe that God's love was being revealed through Him.",
    questions: [
      {
        question:
          "Why were Jesus' miracles meaningful to the people who witnessed them?",
        options: [
          "They revealed both God's power and His compassion for human suffering",
          "They entertained the crowd",
          "They created celebrations",
          "They showed magic",
        ],
        correctIndex: 0,
        hint: "The miracles helped people understand God's care.",
      },
      {
        question: "Why did people travel long distances to see Jesus?",
        options: [
          "They hoped to hear His teachings or receive healing for themselves or loved ones",
          "They wanted food",
          "They wanted to travel",
          "They were curious",
        ],
        correctIndex: 0,
        hint: "Many came seeking help.",
      },
      {
        question: "What deeper message accompanied many of Jesus' miracles?",
        options: [
          "Faith and compassion are central to God's kingdom",
          "Strength is important",
          "Cities are powerful",
          "Wealth is valuable",
        ],
        correctIndex: 0,
        hint: "His message focused on the heart.",
      },
      {
        question:
          "Why might Jesus' compassion have influenced people more than the miracles themselves?",
        options: [
          "It showed genuine care for individuals, not just displays of power",
          "Miracles were common",
          "Crowds expected healing",
          "People were curious",
        ],
        correctIndex: 0,
        hint: "Compassion builds trust.",
      },
      {
        question: "What lesson does this story highlight?",
        options: [
          "Helping others with compassion can transform lives and communities",
          "Miracles are rare",
          "Crowds follow leaders",
          "Healing is temporary",
        ],
        correctIndex: 0,
        hint: "Kindness is central.",
      },
    ],
  },
  {
    id: 26,
    title: "Level 26",
    theme: "When Five Loaves Became a Feast",
    story:
      "One day a massive crowd followed Jesus to a quiet hillside near the Sea of Galilee. People had come from many towns because they wanted to hear Him teach and see the miracles they had heard about. Jesus spent the day teaching about God's kingdom and caring for those who were sick. As evening approached, the disciples noticed that thousands of people were still there with no food to eat. They worried that the crowd might become hungry and weak on their journey home. A young boy in the crowd had brought a small meal \u2014 five loaves of bread and two fish. It seemed like almost nothing compared to the size of the crowd. Yet Jesus took the food, gave thanks to God, and began distributing it through the disciples. Miraculously, the food continued multiplying until everyone had eaten. When the meal was finished, baskets full of leftovers remained.",
    questions: [
      {
        question: "Why were the disciples worried about the crowd?",
        options: [
          "The people had stayed all day without food and might struggle on the journey home",
          "The crowd was too loud",
          "The crowd was leaving",
          "The weather was changing",
        ],
        correctIndex: 0,
        hint: "Think about the time of day.",
      },
      {
        question: "Why might the boy's small meal be important to the story?",
        options: [
          "It shows that even small contributions can become powerful when offered with faith",
          "The boy was wealthy",
          "Bread was rare",
          "Fish were valuable",
        ],
        correctIndex: 0,
        hint: "The miracle began with something small.",
      },
      {
        question: "Why did Jesus give thanks before distributing the food?",
        options: [
          "To show gratitude and trust in God's provision before the miracle happened",
          "To signal the crowd",
          "To teach the disciples cooking",
          "To organize the people",
        ],
        correctIndex: 0,
        hint: "The prayer came before the multiplication.",
      },
      {
        question: "Why were baskets of food left over after everyone ate?",
        options: [
          "The miracle provided more than enough for the entire crowd",
          "People stopped eating early",
          "The disciples cooked more food",
          "The crowd shared food",
        ],
        correctIndex: 0,
        hint: "The miracle exceeded the need.",
      },
      {
        question:
          "What lesson about generosity might players learn from this event?",
        options: [
          "Offering what we have, even if small, can lead to greater blessings for many people",
          "Crowds create miracles",
          "Food multiplies naturally",
          "Sharing food is rare",
        ],
        correctIndex: 0,
        hint: "The boy did not keep his food to himself.",
      },
    ],
  },
  {
    id: 27,
    title: "Level 27",
    theme: "The Final Meal Together",
    story:
      "As the time approached for Jesus' arrest, He gathered His closest disciples in Jerusalem for a special meal. The city was busy with travelers celebrating the Passover festival. During the meal, Jesus did something unexpected. He took a towel and began washing the disciples' feet \u2014 a task usually done by servants. The disciples were surprised, but Jesus explained that true leadership is shown through humility and service. Later, Jesus broke bread and shared a cup with them, explaining that these would help them remember His sacrifice. He also warned them that difficult events were about to happen. Though the disciples did not fully understand, the meal became a moment of reflection, friendship, and preparation for what was ahead.",
    questions: [
      {
        question: "Why did Jesus wash the disciples' feet during the meal?",
        options: [
          "To demonstrate that leadership should be expressed through humility and service",
          "Their feet were dirty",
          "It was required for the meal",
          "They asked Him to",
        ],
        correctIndex: 0,
        hint: "The act was symbolic.",
      },
      {
        question: "Why did the disciples find Jesus' action surprising?",
        options: [
          "Foot washing was normally the role of servants, not teachers or leaders",
          "They disliked water",
          "It was nighttime",
          "It was unusual in Jerusalem",
        ],
        correctIndex: 0,
        hint: "Jesus reversed expectations.",
      },
      {
        question: "Why did Jesus share bread and wine with the disciples?",
        options: [
          "To symbolize His coming sacrifice and create a way to remember it",
          "To celebrate Passover",
          "To feed the disciples",
          "To teach cooking",
        ],
        correctIndex: 0,
        hint: "The items represented something deeper.",
      },
      {
        question:
          "Why might this meal have been important for the disciples emotionally?",
        options: [
          "It prepared them for events they did not yet fully understand",
          "It ended their journey",
          "It started a celebration",
          "It created a new law",
        ],
        correctIndex: 0,
        hint: "Something difficult was coming.",
      },
      {
        question: "What central message did Jesus emphasize during the meal?",
        options: [
          "Loving and serving others as He had served them",
          "Traveling together",
          "Protecting Jerusalem",
          "Following rules",
        ],
        correctIndex: 0,
        hint: "The message focused on relationships.",
      },
    ],
  },
  {
    id: 28,
    title: "Level 28",
    theme: "A Sacrifice on the Hill",
    story:
      "Soon after the meal, Jesus was arrested and brought before Roman authorities. Though He had taught peace and compassion, many leaders saw His influence as a threat. After a tense trial, He was sentenced to die on a cross outside the city. As Jesus carried the cross to a hill called Golgotha, many people watched in silence. While suffering on the cross, Jesus spoke words of forgiveness for those who had hurt Him. His followers were heartbroken, believing their hopes had ended. Darkness seemed to cover the moment as Jesus took His final breath. Yet unknown to many, this moment of sacrifice was part of a greater plan that would soon be revealed.",
    questions: [
      {
        question:
          "Why did many leaders oppose Jesus despite His message of compassion?",
        options: [
          "His influence challenged their authority and traditions",
          "He broke laws",
          "He attacked soldiers",
          "He left the city",
        ],
        correctIndex: 0,
        hint: "His teachings changed how people viewed leadership.",
      },
      {
        question:
          "Why did Jesus' followers feel devastated during the crucifixion?",
        options: [
          "They believed the one they trusted had been defeated and their hopes were lost",
          "They feared soldiers",
          "They were tired",
          "They left Jerusalem",
        ],
        correctIndex: 0,
        hint: "They did not yet know what would happen next.",
      },
      {
        question: "Why is Jesus forgiving those who hurt Him significant?",
        options: [
          "It shows radical compassion even during suffering",
          "It saved the soldiers",
          "It ended the trial",
          "It changed the law",
        ],
        correctIndex: 0,
        hint: "Forgiveness is central to His message.",
      },
      {
        question: "Why might the story emphasize the sadness of the moment?",
        options: [
          "It helps the reader understand the emotional weight before the coming hope",
          "It shows defeat",
          "It ends the story",
          "It explains the trial",
        ],
        correctIndex: 0,
        hint: "The story has not ended yet.",
      },
      {
        question:
          "What deeper theme does this event represent in the Christian story?",
        options: [
          "Sacrifice made for the redemption of humanity",
          "Justice of rulers",
          "Power of soldiers",
          "End of miracles",
        ],
        correctIndex: 0,
        hint: "The meaning goes beyond the event itself.",
      },
    ],
  },
  {
    id: 29,
    title: "Level 29",
    theme: "The Empty Tomb",
    story:
      "Three days after Jesus was buried, several women went to the tomb early in the morning to pay their respects. As they approached, they noticed that the large stone covering the entrance had been rolled away. Inside the tomb, they did not find Jesus' body. Instead, angels told them that Jesus had risen from the dead just as He had promised. Shocked and amazed, the women hurried to tell the disciples. Soon afterward, Jesus appeared to His followers, speaking with them and showing that He was truly alive. What had seemed like the end of their story had become the beginning of a new hope.",
    questions: [
      {
        question: "Why was the empty tomb so surprising to the women?",
        options: [
          "The stone was moved and Jesus' body was no longer there",
          "Soldiers had left",
          "The tomb was open",
          "The city was quiet",
        ],
        correctIndex: 0,
        hint: "They expected to find the body.",
      },
      {
        question:
          "Why did the angels remind the women of Jesus' earlier words?",
        options: [
          "To help them realize that the resurrection had been foretold by Jesus Himself",
          "To comfort them",
          "To guide them",
          "To warn them",
        ],
        correctIndex: 0,
        hint: "Jesus had predicted this event.",
      },
      {
        question:
          "Why was the resurrection important for the disciples' faith?",
        options: [
          "It confirmed that Jesus' mission and teachings were true",
          "It changed the city",
          "It ended the journey",
          "It started a celebration",
        ],
        correctIndex: 0,
        hint: "Their hope returned.",
      },
      {
        question: "Why did the women immediately run to tell the disciples?",
        options: [
          "The message was too important to keep to themselves",
          "They were afraid",
          "They were traveling",
          "They were confused",
        ],
        correctIndex: 0,
        hint: "The news changed everything.",
      },
      {
        question: "What theme does the resurrection introduce into the story?",
        options: [
          "Hope and victory even after moments of despair",
          "Power of angels",
          "Importance of tombs",
          "End of miracles",
        ],
        correctIndex: 0,
        hint: "The story moves from sorrow to hope.",
      },
    ],
  },
  {
    id: 30,
    title: "Level 30",
    theme: "The Mission Begins",
    story:
      "After appearing to His followers many times, Jesus gathered them for one final moment together. The disciples had once been ordinary fishermen, tax collectors, and travelers. Now they had witnessed miracles, sacrifice, and resurrection. Jesus told them that their journey was not ending but beginning. He asked them to go into the world and share His message of love, forgiveness, and hope with others. The disciples were no longer just students \u2014 they were now messengers. Though the task seemed enormous, they believed they would not be alone. Their mission would eventually spread the story of Jesus across nations and generations.",
    questions: [
      {
        question: "Why did Jesus give the disciples a mission before leaving?",
        options: [
          "To continue spreading His teachings to the world",
          "To travel",
          "To build cities",
          "To protect Jerusalem",
        ],
        correctIndex: 0,
        hint: "The message was meant to spread.",
      },
      {
        question: "Why might the disciples have felt both excited and nervous?",
        options: [
          "The mission required courage and responsibility across many lands",
          "They disliked traveling",
          "They were tired",
          "They feared crowds",
        ],
        correctIndex: 0,
        hint: "The task was very large.",
      },
      {
        question:
          "Why does the story remind us that the disciples were ordinary people?",
        options: [
          "It shows that anyone can play a role in spreading hope and truth",
          "They were weak",
          "They had no experience",
          "They were travelers",
        ],
        correctIndex: 0,
        hint: "Their backgrounds were simple.",
      },
      {
        question: "What change happened to the disciples after these events?",
        options: [
          "They transformed from followers into leaders and teachers",
          "They became kings",
          "They returned home",
          "They stopped traveling",
        ],
        correctIndex: 0,
        hint: "Their role expanded.",
      },
      {
        question:
          "Why is this moment important for the larger story of Christianity?",
        options: [
          "It marks the beginning of the global spread of Jesus' teachings",
          "It ends the Bible",
          "It begins a kingdom",
          "It changes the city",
        ],
        correctIndex: 0,
        hint: "The message reached the world through them.",
      },
    ],
  },
];
