document.addEventListener('DOMContentLoaded', () => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  let history = [];
  let tableau

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

  // Your custom deal pattern: 8 cards in cols 0–2, 7 cards in cols 3–6
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
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '?';
    }
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
  
          const cardContent = document.createElement('div');
          cardContent.classList.add('card-content');
          
          const rankSpan = document.createElement('span');
          rankSpan.classList.add('rank');
          rankSpan.textContent = card.rank;
          
          const suitSpan = document.createElement('span');
          suitSpan.classList.add('suit-symbol');
          suitSpan.textContent = getSuitSymbol(card.suit);
          
          cardContent.appendChild(rankSpan);
          cardContent.appendChild(suitSpan);
          cardDiv.appendChild(cardContent);

          cardDiv.addEventListener('click', () => {
            const prevState = cloneState(tableau, foundations);
            if (tryMoveToFoundation(card, column, tableau, foundations)) {
              renderTableau(tableau);
              renderFoundations(foundations);
              history.push(prevState);
              if (checkForWin(foundations)) {
                document.getElementById('win-popup').classList.remove('hidden');
              }
              return;
            }
          
            if (tryMoveToEmptyColumn(card, column, tableau)) {
              renderTableau(tableau);
              renderFoundations(foundations);
              history.push(prevState);
              if (checkForWin(foundations)) {
                document.getElementById('win-popup').classList.remove('hidden');
              }
              return;
            }
          
            if (tryMoveToStack(card, column, tableau)) {
              renderTableau(tableau);
              renderFoundations(foundations);
              history.push(prevState);
              if (checkForWin(foundations)) {
                document.getElementById('win-popup').classList.remove('hidden');
              }
              return;
            }
          });
          
        }
  
        columnDiv.appendChild(cardDiv);
      });
  
      tableauContainer.appendChild(columnDiv);
    });
  }

  function renderFoundations(foundations) {
    const foundationDivs = document.querySelectorAll('.foundation');
    foundationDivs.forEach(div => div.innerHTML = ''); // clear all
  
    for (const suit in foundations) {
      const stack = foundations[suit];
      if (stack.length > 0) {
        const card = stack[stack.length - 1]; // top card
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card', suit, `rank-${card.rank.toLowerCase()}`);
  
        const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');
        
        const rankSpan = document.createElement('span');
        rankSpan.classList.add('rank');
        rankSpan.textContent = card.rank;
        
        const suitSpan = document.createElement('span');
        suitSpan.classList.add('suit-symbol');
        suitSpan.textContent = getSuitSymbol(card.suit);
        
        cardContent.appendChild(rankSpan);
        cardContent.appendChild(suitSpan);
        cardDiv.appendChild(cardContent);
        
  
        document.querySelector(`.foundation[data-suit="${suit}"]`).appendChild(cardDiv);
      }
    }
  }

  function tryMoveToFoundation(card, column, tableau, foundations) {
    if (column[column.length - 1] !== card) return false;
  
    const suitPile = foundations[card.suit];
    const currentRank = card.rank;
    const topCard = suitPile[suitPile.length - 1];
    const expectedNext = getNextRank(topCard ? topCard.rank : null);
  
    if ((topCard === undefined && currentRank === 'A') || currentRank === expectedNext) {
      column.splice(column.indexOf(card), 1);
      if (column.length > 0) {
        column[column.length - 1].faceUp = true;
      }
      suitPile.push(card);
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
  
    const cardIndex = fromColumn.indexOf(card);
    const movingStack = fromColumn.slice(cardIndex);
  
    for (let col of tableau) {
      if (col.length === 0) {
        fromColumn.splice(cardIndex); 
        if (fromColumn.length > 0) {
          fromColumn[fromColumn.length - 1].faceUp = true;
        }
        col.push(...movingStack);  
        return true;
      }
    }
  
    return false;
  }
  
  function tryMoveToStack(card, fromColumn, tableau) {
    const cardIndex = fromColumn.indexOf(card);
    if (!card.faceUp) return false;
  
    const movingStack = fromColumn.slice(cardIndex);
  
    for (let col of tableau) {
      if (col === fromColumn) continue;
  
      const target = col[col.length - 1];
      if (!target || !target.faceUp) continue;
  
      if (target.suit === card.suit && target.rank === getNextRank(card.rank)) {
        fromColumn.splice(cardIndex);
        col.push(...movingStack);
  
        if (fromColumn.length > 0) {
          fromColumn[fromColumn.length - 1].faceUp = true;
        }
  
        return true;
      }
    }
  
    return false;
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

  document.getElementById('play-again').addEventListener('click', () => {
    location.reload();
  });

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
    foundations = {
      hearts: [],
      diamonds: [],
      clubs: [],
      spades: []
    };
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
  
    document.getElementById('restart-button').addEventListener('click', () => {
      location.reload();
    });

  console.log("Tableau:", tableau);
});
