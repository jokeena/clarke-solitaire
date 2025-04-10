document.addEventListener('DOMContentLoaded', () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
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
  
        column.forEach(card => {
          const cardDiv = document.createElement('div');
          cardDiv.classList.add('card');
  
          if (!card.faceUp) {
            cardDiv.classList.add('face-down');
            cardDiv.textContent = '🂠';
          } else {
            const suitSymbol = getSuitSymbol(card.suit);
            cardDiv.textContent = `${card.rank}${suitSymbol}`;
            if (card.suit === 'hearts' || card.suit === 'diamonds') {
              cardDiv.classList.add('red');
            }
          }
  
          columnDiv.appendChild(cardDiv);
        });
  
        tableauContainer.appendChild(columnDiv);
      });
    }
  
    let deck = shuffleDeck(createDeck());
    let { tableau } = dealCards(deck);
    renderTableau(tableau);
  
    console.log("Tableau:", tableau);
  });
  