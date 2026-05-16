// Noble Dancing Game App
// Requires js/data.js loaded first

let selectedLeader = null;
let selectedFollower = null;
let selectedScenario = null;
let selectedFaction = null;
let currentRound = 1;
let maxRounds = 5;
let initiativeOrder = [];
let rulesContent = {};

function initNavigationButtons() {
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            window.location.href = 'selection.html';
        });
    }

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }

    const generateEventBtn = document.getElementById('generate-event');
    if (generateEventBtn) {
        generateEventBtn.addEventListener('click', generateEvent);
    }

    const nextRoundBtn = document.getElementById('next-round');
    if (nextRoundBtn) {
        nextRoundBtn.addEventListener('click', nextRound);
    }

    const generateInitiativeBtn = document.getElementById('generate-initiative');
    if (generateInitiativeBtn) {
        generateInitiativeBtn.addEventListener('click', generateInitiative);
    }

    const newGameLink = document.querySelector('nav a[href="selection.html"]');
    if (newGameLink) {
        newGameLink.addEventListener('click', clearGameState);
    }

    document.querySelectorAll('.adjust').forEach(btn => {
        btn.addEventListener('click', adjustTracker);
    });
}

function initPopup() {
    const popup = document.getElementById('popup');
    if (!popup) return;
    const close = popup.querySelector('.close');
    if (close) {
        close.addEventListener('click', () => {
            popup.style.display = 'none';
        });
    }
}

function initClickableRules() {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('clickable')) {
            showRulesPopup(e.target.dataset.section, e.target.dataset.key);
        }
    });
}

function initRulesTocToggle() {
    const toggle = document.getElementById('toc-toggle');
    const closeBtn = document.getElementById('toc-close');
    const toc = document.getElementById('toc');
    if (!toggle || !closeBtn || !toc) return;

    function closeToc() {
        toc.classList.remove('open');
        document.body.classList.remove('toc-open');
    }

    function openToc() {
        toc.classList.add('open');
        document.body.classList.add('toc-open');
    }

    toggle.addEventListener('click', () => {
        if (toc.classList.contains('open')) {
            closeToc();
        } else {
            openToc();
        }
    });

    closeBtn.addEventListener('click', () => {
        closeToc();
    });

    toc.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            closeToc();
        });
    });
}

function initFloatingTocButton() {
    const btn = document.getElementById('toc-toggle');
    const anchor = document.getElementById('characters');
    if (!btn || !anchor) return;

    let anchorTop = 0;
    let anchorLeft = 8; // fallback left

    function recalc() {
        const rect = anchor.getBoundingClientRect();
        anchorTop = rect.top + window.scrollY;
        anchorLeft = rect.left + window.scrollX;
        // place button just above the anchor heading
        btn.classList.remove('fixed');
        btn.style.position = 'absolute';
        const topPos = Math.max(8, anchorTop - btn.offsetHeight - 8);
        btn.style.top = topPos + 'px';
        btn.style.left = (anchorLeft) + 'px';
    }

    function onScroll() {
        const scrolled = window.scrollY || window.pageYOffset;
        if (scrolled >= anchorTop - 8) {
            btn.classList.add('fixed');
            btn.style.left = '';
            btn.style.top = '';
        } else {
            btn.classList.remove('fixed');
            // restore absolute placement
            const topPos = Math.max(8, anchorTop - btn.offsetHeight - 8);
            btn.style.position = 'absolute';
            btn.style.top = topPos + 'px';
            btn.style.left = (anchorLeft) + 'px';
        }
    }

    // initial placement after fonts/images load
    setTimeout(recalc, 50);
    window.addEventListener('resize', recalc);
    window.addEventListener('scroll', onScroll, { passive: true });
}

function populateFactionButtons() {
    const list = document.getElementById('faction-list');
    if (!list) return;

    list.querySelectorAll('.faction-button').forEach(button => {
        button.addEventListener('click', () => {
            setFaction(button.dataset.faction);
        });
    });
}

function setFaction(faction) {
    selectedFaction = faction;
    selectedLeader = null;
    selectedFollower = null;
    selectedScenario = null;
    document.querySelectorAll('.faction-button').forEach(button => {
        button.classList.toggle('selected', button.dataset.faction === faction);
    });
    document.querySelectorAll('#scenarios-list .card').forEach(c => c.classList.remove('selected'));
    populateCharacters();
    checkStart();
}

function formatCharacterCard(character, index) {
    return `
        <div class="agent-card-inner">
            <div class="card-details">
                <h4>${character.name}</h4>
                <p><strong>Faction:</strong> ${character.faction}</p>
                <p class="flavor-text">${character.flavor}</p>
                <p>Grace: ${character.grace}, Charm: ${character.charm}</p>
                <p>Ability: <span class="clickable" data-section="abilities" data-key="${character.ability}">${character.ability}</span></p>
                <div class="role-picker">
                    <label for="role-select-${index}">Role:</label>
                    <select id="role-select-${index}" data-index="${index}" class="role-select">
                        <option value="none">None</option>
                        <option value="leader">Leader</option>
                        <option value="follower">Follower</option>
                    </select>
                </div>
            </div>
            <img src="${character.image || 'images/placeholder.png'}" alt="${character.name}" class="agent-card-image">
        </div>
    `;
}

function populateCharacters() {
    const characterList = document.getElementById('character-list');
    if (!characterList) return;

    characterList.innerHTML = '';
    if (!selectedFaction) {
        const prompt = document.createElement('p');
        prompt.className = 'faction-prompt';
        prompt.textContent = 'Select a faction to display its characters.';
        characterList.appendChild(prompt);
        return;
    }

    const factionCharacters = characters.filter(char => char.faction === selectedFaction);
    factionCharacters.forEach((character) => {
        const globalIndex = characters.indexOf(character);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = formatCharacterCard(character, globalIndex);
        characterList.appendChild(card);
    });

    if (!characterList.dataset.listenerAdded) {
        characterList.addEventListener('change', function (e) {
            const select = e.target.closest('.role-select');
            if (!select) return;
            const index = parseInt(select.dataset.index, 10);
            selectCharacter(index, select.value, select);
        });
        characterList.dataset.listenerAdded = 'true';
    }

    refreshCharacterSelection();
}

function selectCharacter(index, role, selectElement) {
    if (role === 'none') {
        if (selectedLeader === index) selectedLeader = null;
        if (selectedFollower === index) selectedFollower = null;
        refreshCharacterSelection();
        checkStart();
        return;
    }

    const selectedCharacter = characters[index];
    if (role === 'leader') {
        if (selectedLeader !== null && selectedLeader !== index) {
            alert('You already have a Leader. Deselect the current Leader before choosing a new one.');
            if (selectElement) selectElement.value = 'none';
            return;
        }
        if (selectedFollower === index) {
            // Allow role conversion when the same character was previously selected as follower
            selectedFollower = null;
            selectedLeader = index;
            refreshCharacterSelection();
            checkStart();
            return;
        }
        if (selectedFollower !== null && characters[selectedFollower].faction !== selectedCharacter.faction) {
            alert('Follower must be from the same faction as the Leader.');
            if (selectElement) selectElement.value = 'none';
            return;
        }
        selectedLeader = index;
    } else {
        if (selectedFollower !== null && selectedFollower !== index) {
            alert('You already have a Follower. Deselect the current Follower before choosing a new one.');
            if (selectElement) selectElement.value = 'none';
            return;
        }
        if (selectedLeader === index) {
            // Allow role conversion when the same character was previously selected as leader
            selectedLeader = null;
            selectedFollower = index;
            refreshCharacterSelection();
            checkStart();
            return;
        }
        if (selectedLeader !== null && characters[selectedLeader].faction !== selectedCharacter.faction) {
            alert('Follower must be from the same faction as the Leader.');
            if (selectElement) selectElement.value = 'none';
            return;
        }
        selectedFollower = index;
    }

    refreshCharacterSelection();
    checkStart();
}

function populateScenarios() {
    const list = document.getElementById('scenarios-list');
    if (!list) return;

    list.innerHTML = '';
    if (!scenarios.length) {
        list.textContent = 'No scenarios available.';
        return;
    }

    scenarios.forEach((scenario, index) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'card scenario-card';
        card.innerHTML = `
            <div>
                <h3><span class="clickable" data-section="scenarios" data-key="${scenario.name}">${scenario.name}</span></h3>
                <p class="flavor-text">${scenario.flavor}</p>
            </div>
        `;
        card.addEventListener('click', () => selectScenario(index, card));
        list.appendChild(card);
    });
}

function selectScenario(index, card) {
    selectedScenario = index;
    document.querySelectorAll('#scenarios-list .card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    checkStart();
}

function checkStart() {
    const startBtn = document.getElementById('start-btn');
    if (!startBtn) return;
    startBtn.disabled = selectedLeader === null || selectedFollower === null || selectedScenario === null;
}

function startGame() {
    if (selectedLeader === null || selectedFollower === null || selectedScenario === null) {
        alert('Select a leader, follower, and scenario before starting.');
        return;
    }
    clearGameState();
    localStorage.setItem('selectedLeader', selectedLeader);
    localStorage.setItem('selectedFollower', selectedFollower);
    localStorage.setItem('selectedScenario', selectedScenario);
    window.location.href = 'gameplay.html';
}

function getSavedGameState() {
    const rawState = localStorage.getItem('currentGameState');
    if (!rawState) return null;
    try {
        return JSON.parse(rawState);
    } catch (error) {
        return null;
    }
}

function saveGameState() {
    const state = {
        scenarioIndex: selectedScenario,
        currentRound,
        handSize: parseInt(document.getElementById('hand-size').textContent, 10),
        drawLimit: parseInt(document.getElementById('draw-limit').textContent, 10),
        victoryPoints: parseInt(document.getElementById('victory-points').textContent, 10),
        eventText: document.getElementById('event-display').textContent,
        initiativeOrder,
    };
    localStorage.setItem('currentGameState', JSON.stringify(state));
}

function clearGameState() {
    localStorage.removeItem('currentGameState');
}

function loadGame() {
    selectedLeader = parseInt(localStorage.getItem('selectedLeader'), 10);
    selectedFollower = parseInt(localStorage.getItem('selectedFollower'), 10);
    selectedScenario = parseInt(localStorage.getItem('selectedScenario'), 10);

    if (isNaN(selectedLeader) || isNaN(selectedFollower) || isNaN(selectedScenario)) {
        window.location.href = 'selection.html';
        return;
    }

    const scenario = scenarios[selectedScenario];
    const savedState = getSavedGameState();

    if (savedState && savedState.scenarioIndex === selectedScenario) {
        currentRound = savedState.currentRound || 1;
        initiativeOrder = Array.isArray(savedState.initiativeOrder) ? savedState.initiativeOrder : [];
    } else {
        currentRound = 1;
        initiativeOrder = [];
    }

    if (scenario.endConditions.includes('5 rounds')) maxRounds = 5;
    else if (scenario.endConditions.includes('4 rounds')) maxRounds = 4;
    else if (scenario.endConditions.includes('6 rounds')) maxRounds = 6;

    document.getElementById('current-round').textContent = `Round ${currentRound}`;
    updateRoundStatus();
    document.getElementById('scenario-info').innerHTML = `
        <h3><span class="clickable" data-section="scenarios" data-key="${scenario.name}">${scenario.name}</span></h3>
        <p class="flavor-text">${scenario.flavor}</p>
        <p><strong>Primary Objective:</strong> ${scenario.primaryObj}</p>
        <p><strong>Secondary Objective:</strong> ${scenario.secondaryObj}</p>
        <p><strong>End Conditions:</strong> ${scenario.endConditions}</p>
        <p><strong>Special Rules:</strong> ${scenario.specialRules}</p>
        <p><strong>NPCs:</strong> ${scenario.npcs.map(n => `<span class="clickable" data-section="npcs" data-key="${n}">${n}</span>`).join(', ')}</p>
    `;

    const savedEventText = savedState && savedState.eventText ? savedState.eventText : null;
    document.getElementById('event-display').textContent = savedEventText || 'A new event will appear here.';

    if (savedState) {
        document.getElementById('hand-size').textContent = savedState.handSize || 5;
        document.getElementById('draw-limit').textContent = savedState.drawLimit || 3;
        document.getElementById('victory-points').textContent = savedState.victoryPoints || 0;
    }

    const cardsDiv = document.getElementById('agents-cards');
    cardsDiv.innerHTML = '';
    [selectedLeader, selectedFollower].forEach(index => {
        const member = characters[index];
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="agent-card-inner">
                <img src="${member.image || 'images/placeholder.png'}" alt="${member.name}" class="agent-card-image">
                <div>
                    <h4>${member.name}</h4>
                    <p class="flavor-text">${member.flavor}</p>
                    <p>Grace: ${member.grace}, Charm: ${member.charm}</p>
                    <p>Ability: <span class="clickable" data-section="abilities" data-key="${member.ability}">${member.ability}</span></p>
                </div>
            </div>
        `;
        card.addEventListener('click', () => showRulesPopup('characters', member.name));
        cardsDiv.appendChild(card);
    });

    const actionsList = document.getElementById('actions-list');
    actionsList.innerHTML = '';
    actions.forEach(action => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="clickable" data-section="gameplay" data-key="${action}">${action}</span>`;
        actionsList.appendChild(li);
    });

    if (!initiativeOrder.length) {
        generateInitiative();
    } else {
        renderInitiative(initiativeOrder);
    }

    initAgentCarousel();

    if (!savedEventText) {
        generateEvent();
    }
}

function generateInitiative() {
    const scenario = scenarios[selectedScenario];
    const staticOrder = ['Agents', 'Retinue', 'Opposing Agents', 'Opposing Retinue'];
    initiativeOrder = [...staticOrder, ...scenario.npcs].sort(() => Math.random() - 0.5);
    renderInitiative(initiativeOrder);
    saveGameState();
}

function renderInitiative(order) {
    const scenario = scenarios[selectedScenario];
    const list = document.getElementById('initiative-list');
    list.innerHTML = '';
    order.forEach(entry => {
        const div = document.createElement('div');
        if (scenario.npcs.includes(entry)) {
            div.innerHTML = `<span class="clickable" data-section="npcs" data-key="${entry}">${entry}</span>`;
        } else {
            div.textContent = entry;
        }
        list.appendChild(div);
    });
}

function initAgentCarousel() {
    const cardsDiv = document.getElementById('agents-cards');
    const prevBtn = document.getElementById('agent-prev');
    const nextBtn = document.getElementById('agent-next');
    if (!cardsDiv || !prevBtn || !nextBtn) return;

    const scrollAmount = () => cardsDiv.clientWidth * 0.9;

    prevBtn.addEventListener('click', () => {
        cardsDiv.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        cardsDiv.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });
}

function generateEvent() {
    const scenario = scenarios[selectedScenario];
    const eventList = [...events];
    eventList[5] = scenario.event;
    const randomEvent = eventList[Math.floor(Math.random() * eventList.length)];
    document.getElementById('event-display').textContent = randomEvent;
    saveGameState();
}

function nextRound() {
    if (currentRound >= maxRounds) return;
    currentRound += 1;
    document.getElementById('current-round').textContent = `Round ${currentRound}`;
    generateInitiative();
    generateEvent();
    updateRoundStatus();
    saveGameState();
}

function updateRoundStatus() {
    const status = document.getElementById('game-status');
    const nextButton = document.getElementById('next-round');
    if (!status || !nextButton) return;

    if (currentRound === maxRounds) {
        status.textContent = 'Last round';
        nextButton.disabled = true;
    } else {
        status.textContent = '';
        nextButton.disabled = false;
    }
}

function adjustTracker(event) {
    const target = event.target.dataset.target;
    const delta = parseInt(event.target.dataset.delta, 10);
    const span = document.getElementById(target);
    if (!span) return;
    let value = parseInt(span.textContent, 10);
    value = Math.max(0, value + delta);
    span.textContent = value;
    saveGameState();
}

function showRulesPopup(section, key) {
    const popup = document.getElementById('popup');
    const body = document.getElementById('popup-body');
    if (!popup || !body) return;
    let content = '';

    if (section === 'abilities' && key) {
        content = `<h3>${key}</h3><p>${abilityDescriptions[key] || 'No description available.'}</p>`;
    } else if (section === 'gameplay' && key) {
        content = `<h3>${key}</h3><p>${actionDescriptions[key] || 'No description available.'}</p>`;
    } else if (section === 'scenarios' && key) {
        const scenario = scenarios.find(s => s.name === key);
        if (scenario) {
            content = `
                <h3>${scenario.name}</h3>
                <p class="flavor-text">${scenario.flavor}</p>
                <p><strong>Primary Objective:</strong> ${scenario.primaryObj}</p>
                <p><strong>Secondary Objective:</strong> ${scenario.secondaryObj}</p>
                <p><strong>Scenario Event:</strong> ${scenario.event}</p>
                <p><strong>End Conditions:</strong> ${scenario.endConditions}</p>
                <p><strong>Special Rules:</strong> ${scenario.specialRules}</p>
                <p><strong>NPCs:</strong> ${scenario.npcs.map(n => `<span class="clickable" data-section="npcs" data-key="${n}">${n}</span>`).join(', ')}</p>
            `;
        }
    } else if (section === 'characters' && key) {
        const character = characters.find(c => c.name === key);
        if (character) {
            content = `
                <h3>${character.name}</h3>
                <p class="flavor-text">${character.flavor}</p>
                <p>Grace: ${character.grace}, Charm: ${character.charm}</p>
                <p>Ability: <span class="clickable" data-section="abilities" data-key="${character.ability}">${character.ability}</span></p>
            `;
        }
    } else if (section === 'npcs' && key) {
        const npc = npcDetails[key];
        if (npc) {
            content = `
                <h3>${key}</h3>
                <p>${npc.description}</p>
                <p><strong>Role:</strong> ${npc.role}</p>
                <p><strong>Interaction:</strong> ${npc.interaction}</p>
            `;
        }
    }

    if (!content) {
        content = '<p>No information available.</p>';
    }

    body.innerHTML = content;
    popup.style.display = 'block';
}

function buildRulesContent() {
    let html = '';
    const factionGroups = {};

    characters.forEach(character => {
        if (!factionGroups[character.faction]) {
            factionGroups[character.faction] = [];
        }
        factionGroups[character.faction].push(character);
    });

    Object.keys(factionGroups).sort().forEach(faction => {
        html += `<h3 class="faction-subheader">${faction}</h3>`;
        factionGroups[faction].forEach(character => {
            html += `
                <div class="rule-card">
                    <div class="agent-card-inner">
                        <img src="${character.image || 'images/placeholder.png'}" alt="${character.name}" class="agent-card-image">
                        <div>
                            <h4>${character.name}</h4>
                            <p><strong>Faction:</strong> ${character.faction}</p>
                            <p class="flavor-text">${character.flavor}</p>
                            <p>Grace: ${character.grace}, Charm: ${character.charm}</p>
                            <p>Ability: <span class="clickable" data-section="abilities" data-key="${character.ability}">${character.ability}</span></p>
                        </div>
                    </div>
                </div>
            `;
        });
    });
    rulesContent.characters = html;

    html = '';
    Object.entries(abilityDescriptions).forEach(([ability, description]) => {
        html += `<p><strong>${ability}:</strong> ${description}</p>`;
    });
    rulesContent.abilities = html;

    html = '';
    scenarios.forEach(scenario => {
        html += `
            <div class="rule-card">
                <h4>${scenario.name}</h4>
                <p class="flavor-text">${scenario.flavor}</p>
                <p><strong>Primary Objective:</strong> ${scenario.primaryObj}</p>
                <p><strong>Secondary Objective:</strong> ${scenario.secondaryObj}</p>
                <p><strong>Scenario Event:</strong> ${scenario.event}</p>
                <p><strong>End Conditions:</strong> ${scenario.endConditions}</p>
                <p><strong>Special Rules:</strong> ${scenario.specialRules}</p>
                <p><strong>NPCs:</strong> ${scenario.npcs.map(n => `<span class="clickable" data-section="npcs" data-key="${n}">${n}</span>`).join(', ')}</p>
            </div>
        `;
    });
    rulesContent.scenarios = html;

    html = '';
    Object.entries(npcDetails).forEach(([name, npc]) => {
        html += `
            <div class="rule-card">
                <h4>${name}</h4>
                <p>${npc.description}</p>
                <p><strong>Role:</strong> ${npc.role}</p>
                <p><strong>Interaction:</strong> ${npc.interaction}</p>
            </div>
        `;
    });
    rulesContent.npcs = html;

    html = '<ul>';
    events.forEach(event => {
        html += `<li>${event}</li>`;
    });
    html += '</ul>';
    rulesContent.events = html;

    html = '<h3>Actions</h3><ul>';
    actions.forEach(action => {
        html += `<li><strong>${action}</strong>: ${actionDescriptions[action]}</li>`;
    });
    html += '</ul>';
    rulesContent.gameplay = html;
}

function populateRules() {
    document.getElementById('characters-content').innerHTML = rulesContent.characters;
    document.getElementById('abilities-content').innerHTML = rulesContent.abilities;
    document.getElementById('scenarios-content').innerHTML = rulesContent.scenarios;
    document.getElementById('npcs-content').innerHTML = rulesContent.npcs;
    document.getElementById('events-content').innerHTML = rulesContent.events;
    document.getElementById('gameplay-content').innerHTML = rulesContent.gameplay;
}

window.addEventListener('DOMContentLoaded', () => {
    initNavigationButtons();
    initPopup();
    initClickableRules();
    buildRulesContent();

    if (document.getElementById('faction-list')) {
        populateFactionButtons();
    }

    if (document.getElementById('character-list')) {
        populateCharacters();
    }

    if (document.getElementById('scenarios-list')) {
        populateScenarios();
    }

    if (window.location.pathname.includes('gameplay.html')) {
        loadGame();
    }

    if (window.location.pathname.includes('rules.html')) {
        populateRules();
        initRulesTocToggle();
        initFloatingTocButton();
    }
});
