// === main.js (updated for card flip animation) ===
document.addEventListener('DOMContentLoaded', () => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  let history = [];
  let tableau;
  let foundations;
  let initialState;

  function createDeck() {
    let deck = [];
    for (let suit of suits) {
      for (let rank of ranks) {
        deck.push({ suit, rank });
      }
    }
    return deck;
  }

  function shuffleDeck(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function dealCards(deck) {
    const tableau = [[], [], [], [], [], [], []];
    let cardIndex = 0;

    for (let i = 0; i < 8; i++) {
      if (i !== 7) {
        for (let j = 0; j <= 6; j++) {
          const card = deck[cardIndex++];
          card.faceUp = (j <= i);
          tableau[j].push(card);
        }
      } else {
        for (let j = 0; j < 3; j++) {
          const card = deck[cardIndex++];
          card.faceUp = true;
          tableau[j].push(card);
        }
      }
    }
    return { tableau };
  }

  function getSuitSymbol(suit) {
    return { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }[suit] || '?';
  }

  function renderTableau(tableau) {
    const tableauContainer = document.getElementById('tableau');
    tableauContainer.innerHTML = '';
    tableau.forEach(column => {
      const columnDiv = document.createElement('div');
      columnDiv.classList.add('column');
      if (column.length === 0) columnDiv.classList.add('empty');
  
      column.forEach(card => {
        const cardDiv = document.createElement('div');
  
        if (!card.faceUp) {
          cardDiv.classList.add('card', 'back');
        } else {
          cardDiv.classList.add('card', card.suit, `rank-${card.rank.toLowerCase()}`);
  
          // Flip animation class
          if (!card._wasFaceUp) {
            requestAnimationFrame(() => {
              cardDiv.classList.add('flip-animate');
              setTimeout(() => {
                cardDiv.classList.remove('flip-animate');
              }, 400); // must match animation duration
            });            
          }
  
          const cardContent = document.createElement('div');
          cardContent.classList.add('card-content');
          cardContent.innerHTML = `<span class="rank">${card.rank}</span><span class="suit-symbol">${getSuitSymbol(card.suit)}</span>`;
          cardDiv.appendChild(cardContent);
  
          // Card click
          cardDiv.addEventListener('click', () => {
            const prevState = cloneState(tableau, foundations);
            let moved = false;

            if (
              tryMoveToFoundation(card, column, tableau, foundations) ||
              tryMoveToEmptyColumn(card, column, tableau) ||
              tryMoveToStack(card, column, tableau)
            ) {
              moved = true;
              renderTableau(tableau);
              renderFoundations(foundations);
              history.push(prevState);
              if (checkForWin(foundations)) {
                document.getElementById('win-popup').classList.remove('hidden');
              }
            }
            
            if (!moved) {
              cardDiv.classList.add('shake');
              setTimeout(() => cardDiv.classList.remove('shake'), 400); // Match animation time
            }
            
          });
        }
  
        // Mark card as having been rendered face-up to prevent repeat animation
        card._wasFaceUp = card.faceUp;
  
        columnDiv.appendChild(cardDiv);
      });
  
      tableauContainer.appendChild(columnDiv);
    });
  }
  
  function renderFoundations(foundations) {
    document.querySelectorAll('.foundation').forEach(div => div.innerHTML = '');
    for (const suit in foundations) {
      const stack = foundations[suit];
      if (stack.length > 0) {
        const card = stack[stack.length - 1];
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card', suit, `rank-${card.rank.toLowerCase()}`);
        const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');
        cardContent.innerHTML = `<span class="rank">${card.rank}</span><span class="suit-symbol">${getSuitSymbol(card.suit)}</span>`;
        cardDiv.appendChild(cardContent);
        document.querySelector(`.foundation[data-suit="${suit}"]`).appendChild(cardDiv);
      }
    }
  }

  function tryMoveToFoundation(card, fromColumn, tableau, foundations) {
    if (fromColumn[fromColumn.length - 1] !== card) return false;
    const suitPile = foundations[card.suit];
    const topCard = suitPile[suitPile.length - 1];
    const expectedNext = getNextRank(topCard ? topCard.rank : null);

    if ((!topCard && card.rank === 'A') || card.rank === expectedNext) {
      const cardIndex = fromColumn.indexOf(card);
      const tableauContainer = document.getElementById('tableau');
      const fromColumnDiv = tableauContainer.querySelectorAll('.column')[tableau.indexOf(fromColumn)];
      const domCard = fromColumnDiv.querySelectorAll('.card')[cardIndex];
      const rectFrom = domCard.getBoundingClientRect();

      fromColumn.pop();
      if (fromColumn.length > 0) fromColumn[fromColumn.length - 1].faceUp = true;
      suitPile.push(card);

      requestAnimationFrame(() => {
        renderTableau(tableau);
        renderFoundations(foundations);

        const foundationDiv = document.querySelector(`.foundation[data-suit="${card.suit}"]`);
        const foundationCard = foundationDiv.querySelector('.card');
        if (!foundationCard) return;

        foundationCard.style.opacity = '0';
        const rectTo = foundationCard.getBoundingClientRect();

        const clone = domCard.cloneNode(true);
        clone.classList.add('animate-move');
        clone.style.position = 'absolute';
        clone.style.left = `${rectFrom.left}px`;
        clone.style.top = `${rectFrom.top}px`;
        clone.style.width = `${rectFrom.width}px`;
        clone.style.height = `${rectFrom.height}px`;
        document.body.appendChild(clone);
        domCard.style.opacity = '0';

        requestAnimationFrame(() => {
          const dx = rectTo.left - rectFrom.left;
          const dy = rectTo.top - rectFrom.top;
          clone.style.transform = `translate(${dx}px, ${dy}px)`;
        });

        setTimeout(() => {
          clone.remove();
          foundationCard.style.opacity = '1';
        }, 600);
      });

      return true;
    }

    return false;
  }

  function getNextRank(rank) {
    const order = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const index = order.indexOf(rank);
    return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
  }

  function tryMoveToEmptyColumn(card, fromColumn, tableau) {
    if (card.rank !== 'K') return false;
    for (let col of tableau) {
      if (col.length === 0) {
        moveCardWithAnimation(card, fromColumn, col);
        return true;
      }
    }
    return false;
  }

  function tryMoveToStack(card, fromColumn, tableau) {
    if (!card.faceUp) return false;
    for (let col of tableau) {
      if (col === fromColumn) continue;
      const target = col[col.length - 1];
      if (!target || !target.faceUp) continue;
      if (target.suit === card.suit && target.rank === getNextRank(card.rank)) {
        moveCardWithAnimation(card, fromColumn, col);
        return true;
      }
    }
    return false;
  }

  function moveCardWithAnimation(card, fromColumn, toColumn) {
    const tableauContainer = document.getElementById('tableau');
    const cardIndex = fromColumn.indexOf(card);
    const movingStack = fromColumn.slice(cardIndex);
    const fromColumnDiv = tableauContainer.querySelectorAll('.column')[tableau.indexOf(fromColumn)];
    const cardsInDOM = fromColumnDiv.querySelectorAll('.card');
    const movingDOMCards = Array.from(cardsInDOM).slice(cardIndex);
    const clones = [];

    movingDOMCards.forEach((originalCard, i) => {
      const rect = originalCard.getBoundingClientRect();
      const clone = originalCard.cloneNode(true);
      clone.classList.add('animate-move');
      clone.style.left = `${rect.left}px`;
      clone.style.top = `${rect.top}px`;
      clone.style.position = 'absolute';
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      document.body.appendChild(clone);
      originalCard.style.opacity = '0';
      clones.push({ clone, originalRect: rect });
    });

    fromColumn.splice(cardIndex);
    toColumn.push(...movingStack);
    if (fromColumn.length > 0) fromColumn[fromColumn.length - 1].faceUp = true;

    requestAnimationFrame(() => {
      renderTableau(tableau);
      const toColumnDiv = tableauContainer.querySelectorAll('.column')[tableau.indexOf(toColumn)];
      const targetCards = toColumnDiv.querySelectorAll('.card');
      const newTargets = Array.from(targetCards).slice(-movingStack.length);
      newTargets.forEach(card => card.style.opacity = '0');

      clones.forEach(({ clone }, i) => {
        const toRect = newTargets[i].getBoundingClientRect();
        const dx = toRect.left - clones[i].originalRect.left;
        const dy = toRect.top - clones[i].originalRect.top;
        clone.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      setTimeout(() => {
        clones.forEach(({ clone }) => clone.remove());
        newTargets.forEach(card => card.style.opacity = '1');
      }, 600);
    });
  }

  function checkForWin(foundations) {
    return Object.values(foundations).every(pile => pile.length === 13);
  }

  function cloneState(tableau, foundations) {
    return {
      tableau: JSON.parse(JSON.stringify(tableau)),
      foundations: JSON.parse(JSON.stringify(foundations))
    };
  }

  document.getElementById('play-again').addEventListener('click', () => location.reload());

  document.getElementById('undo-button').addEventListener('click', () => {
    if (history.length > 0) {
      const previous = history.pop();
      tableau = previous.tableau;
      foundations = previous.foundations;
      renderTableau(tableau);
      renderFoundations(foundations);
    }
  });

  function initializeGame() {
    let deck = shuffleDeck(createDeck());
    let deal = dealCards(deck);
    tableau = deal.tableau;
    foundations = { hearts: [], diamonds: [], clubs: [], spades: [] };
    renderTableau(tableau);
    renderFoundations(foundations);
    initialState = cloneState(tableau, foundations);
  }

  initializeGame();

  document.getElementById('reset-button').addEventListener('click', () => {
    tableau = JSON.parse(JSON.stringify(initialState.tableau));
    foundations = JSON.parse(JSON.stringify(initialState.foundations));
    renderTableau(tableau);
    renderFoundations(foundations);
  });

  document.getElementById('restart-button').addEventListener('click', () => location.reload());
});
