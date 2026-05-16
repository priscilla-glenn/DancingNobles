// Noble Dancing Game Data

const characters = [
    { id: 1, name: "Lord Elias Ashford", gender: "male", faction: "Banking", flavor: "A suave gentleman with a hidden agenda.", grace: 8, charm: 9, ability: "Elegant Deception", image: "images/lord-elias-ashford.jpg" },
    { id: 2, name: "Lady Isabella Ashford", gender: "female", faction: "Banking", flavor: "Graceful and cunning, she dances with purpose.", grace: 9, charm: 7, ability: "Whispered Secrets", image: "images/lady-isabella-ashford.jpg" },
    { id: 3, name: "Sir Reginald Blackwood", gender: "male", faction: "Knights", flavor: "Bold and charismatic, he commands attention.", grace: 7, charm: 10, ability: "Commanding Presence", image: "images/sir-reginald-blackwood.jpg" },
    { id: 4, name: "Lady Victoria Blackwood", gender: "female", faction: "Knights", flavor: "Elegant and mysterious, her moves are calculated.", grace: 10, charm: 8, ability: "Mystic Allure", image: "images/lady-victoria-blackwood.jpg" },
    { id: 5, name: "Baron Henri Devereaux", gender: "male", faction: "Banking", flavor: "Charming rogue with a flair for drama.", grace: 6, charm: 9, ability: "Dramatic Flourish", image: "images/baron-henri-devereaux.jpg" },
    { id: 6, name: "Baroness Celeste Devereaux", gender: "female", faction: "Banking", flavor: "Poised and intelligent, she outsmarts her foes.", grace: 8, charm: 8, ability: "Strategic Mind", image: "images/baroness-celeste-devereaux.jpg" },
    { id: 7, name: "Duke Alexander Fairchild", gender: "male", faction: "Knights", flavor: "Noble and honorable, yet fiercely competitive.", grace: 9, charm: 7, ability: "Honorable Charge", image: "images/duke-alexander-fairchild.jpg" },
    { id: 8, name: "Duchess Eleanor Fairchild", gender: "female", faction: "Knights", flavor: "Refined and diplomatic, she builds alliances.", grace: 7, charm: 9, ability: "Diplomatic Grace", image: "images/duchess-eleanor-fairchild.jpg" }
];

const scenarios = [
    {
        name: "The Grand Ball",
        flavor: "A lavish ball where alliances are forged and broken.",
        primaryObj: "Secure 10 alliance points.",
        secondaryObj: "Avoid scandal.",
        event: "A mysterious guest arrives.",
        endConditions: "After 5 rounds or when objectives met.",
        specialRules: "No fighting allowed.",
        npcs: ["The Host", "The Gossip"]
    },
    {
        name: "The Masquerade",
        flavor: "Hidden identities lead to intrigue and deception.",
        primaryObj: "Unmask 3 opponents.",
        secondaryObj: "Maintain your disguise.",
        event: "Masks are swapped randomly.",
        endConditions: "After 4 rounds or when objectives met.",
        specialRules: "Abilities cost extra.",
        npcs: ["The Mask Maker"]
    },
    {
        name: "The Duel of Dances",
        flavor: "Competitive dances where skill is paramount.",
        primaryObj: "Win 3 dance duels.",
        secondaryObj: "Impress the judges.",
        event: "A judge is bribed.",
        endConditions: "After 6 rounds or when objectives met.",
        specialRules: "Grace stat doubled.",
        npcs: ["The Judge"]
    }
];

const events = [
    "A rival couple challenges you to a dance-off.",
    "A secret admirer sends a note.",
    "The music changes unexpectedly.",
    "An NPC offers assistance.",
    "A scandal breaks out.",
    "Scenario Event"
];

const actions = ["Move", "Talk", "Influence", "Dance", "Observe", "Rest"];

const abilityDescriptions = {
    "Elegant Deception": "Allows misleading opponents with grace and poise.",
    "Whispered Secrets": "Share confidential information discreetly with allies.",
    "Commanding Presence": "Intimidate or inspire others with your aura.",
    "Mystic Allure": "Enchant others with mysterious charm.",
    "Dramatic Flourish": "Perform exaggerated actions to draw attention.",
    "Strategic Mind": "Plan ahead and anticipate opponent moves.",
    "Honorable Charge": "Lead a noble assault with integrity.",
    "Diplomatic Grace": "Negotiate and form alliances skillfully."
};

const actionDescriptions = {
    "Move": "Change position on the dance floor to gain advantage.",
    "Talk": "Engage another character to gather information or sway opinion.",
    "Influence": "Use charm or authority to alter a scene.",
    "Dance": "Perform a dance to score style or impress judges.",
    "Observe": "Watch others closely to learn their intentions.",
    "Rest": "Recover and prepare for the next round."
};

const npcDetails = {
    "The Host": {
        description: "A gracious sponsor of the ball who knows every guest and every secret.",
        role: "Event facilitator",
        interaction: "Offers guidance, bonus social opportunities, and can introduce you to key NPCs."
    },
    "The Gossip": {
        description: "A sharp-tongued observer who spreads rumors faster than music.",
        role: "Information broker",
        interaction: "Can reveal hidden motives and help you identify opportunities or dangers."
    },
    "The Mask Maker": {
        description: "A creative artisan who supplies masks and hidden identities.",
        role: "Costume specialist",
        interaction: "Provides disguise options and can alter how characters perceive you."
    },
    "The Judge": {
        description: "A discerning critic whose approval shifts the balance of the contest.",
        role: "Evaluator",
        interaction: "Awards performance points and may be swayed by charm or influence."
    }
};
