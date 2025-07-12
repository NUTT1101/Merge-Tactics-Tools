import {Card} from "./card.js";
import {Trait} from "./trait.js";

export class Game {
  constructor(boardElement, cardPoolElement, traitsDisplayElement) {
    this.boardElement = boardElement;
    this.cardPoolElement = cardPoolElement;
    this.traitsDisplayElement = traitsDisplayElement;

    this.traitCount = {};
    this.rows = 8;
    this.cols = 5;
    this.hexWidth = 60;
    this.hexHeight = 52;
    this.selectedCard = null;
    this.cards = [];

    this.initGame();
  }

  initCard() {
    const Traits = {
        Ace: new Trait("Ace", "王牌"),
        Assassin: new Trait("Assassin", "刺客"),
        Avenger: new Trait("Avenger", "復仇者"),
        Brawler: new Trait("Brawler", "英雄"),
        Clan: new Trait("Clan", "部落"),
        Goblin: new Trait("Goblin", "哥布林"),
        Juggernaut: new Trait("Juggernaut", "坦克"),
        Noble: new Trait("Noble", "貴族"),
        Ranger: new Trait("Ranger", "遊俠"),
        Thrower: new Trait("Thrower", "投手"),
        Undead: new Trait("Undead", "不死"),
    };

    this.cards = [
        new Card("knight", [Traits.Noble, Traits.Juggernaut], "騎士"),
        new Card("archer", [Traits.Clan, Traits.Ranger], "弓箭手"),
        new Card("goblin", [Traits.Goblin, Traits.Assassin], "哥布林"),
        new Card("spear_goblin", [Traits.Goblin, Traits.Thrower], "哥布林投矛手"),
        new Card("bomber", [Traits.Undead, Traits.Thrower], "炸彈兵"),
        new Card("barbarian", [Traits.Clan, Traits.Brawler], "多個野蠻人"),
        new Card("valkyrie", [Traits.Clan, Traits.Avenger], "瓦基麗武神"),
        new Card("pekka", [Traits.Ace, Traits.Juggernaut], "皮卡超人"),
        new Card("prince", [Traits.Noble, Traits.Brawler], "王子"),
        new Card("giant_skeleton", [Traits.Undead, Traits.Brawler], "骷髏巨人"),
        new Card("dart_goblin", [Traits.Goblin, Traits.Ranger], "吹箭哥布林"),
        new Card("executioner", [Traits.Ace, Traits.Thrower], "飛斧屠夫"),
        new Card("princess", [Traits.Noble, Traits.Ranger], "公主"),
        new Card("bandit", [Traits.Ace, Traits.Brawler], "幻影刺客"),
        new Card("goblin_machine", [Traits.Goblin, Traits.Juggernaut], "哥布林機甲"),
        new Card("skeleton_king", [Traits.Undead, Traits.Juggernaut], "骷髏之王"),
        new Card("golden_knight", [Traits.Noble, Traits.Assassin], "金甲騎士"),
    ];
  }

  updateTraitsDisplay() {
    const traitsDisplay = this.traitsDisplayElement;
    traitsDisplay.innerHTML = "";
    const entries = Object.entries(this.traitCount).filter(([, c]) => c > 0);
    if (entries.length === 0) return;
    traitsDisplay.innerHTML = `
        <strong>羈絆：</strong><br>
        ${ entries.map(([t, c]) => `${t} x ${c}`).join("<br>")}
    `;
  }

  clearBoard() {
    this.boardElement.querySelectorAll(".hex").forEach(hex => (hex.innerHTML = ""));
    Object.keys(this.traitCount).forEach(key => (this.traitCount[key] = 0));
    this.updateTraitsDisplay();
  }

  addTraits(name) {
    const card = this.cards.find(c => c.displayName === name);
    card.traits.forEach(trait => {
        this.traitCount[trait.displayName] = (this.traitCount[trait.displayName] || 0) + 1;
    });

    this.updateTraitsDisplay();
  }

  removeTraits(name) {
    const card = this.cards.find(c => c.displayName === name);
    card.traits.forEach(trait => {
      this.traitCount[trait.displayName] = Math.max(0, (this.traitCount[trait.displayName] || 0) - 1);
    });
    this.updateTraitsDisplay();
  }

  initGame() {
    this.initBoard();
    this.initCard();
    this.initCardPool();
  }

  // Initializes the game board with hexagonal cells
  initBoard() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const hex = document.createElement("div");
        hex.className = "hex";
        hex.style.left = `${x * this.hexWidth + (y % 2 === 0 ? this.hexWidth / 2 : 0)}px`;
        hex.style.top = `${y * (this.hexHeight * 0.82)}px`;
        
        // enemy shapes are pink
        if (y < 4) {
          hex.style.background = "#ffcccc";
        }

        // draggable on the board
        hex.ondragstart = e => {
          const img = hex.querySelector("img");
          if (!img) {
            e.preventDefault();
            return;
          }

          const name = img.dataset.name;
          const imgURL = img.src;

          e.dataTransfer.setData("text/plain", imgURL);
          e.dataTransfer.setData("card-name", name);

          this.removeTraits(name);
          hex.innerHTML = "";
          hex.draggable = false;
        };

        hex.onclick = () => {
          const existingImg = hex.querySelector("img");
          if (existingImg) {
            this.removeTraits(existingImg.dataset.name);
            hex.innerHTML = "";
            hex.draggable = false;
            return;
          }

          if (this.selectedCard) {
            hex.innerHTML = `<img src="images/${this.selectedCard}.png" data-name="${this.selectedCard}" />`;
            this.addTraits(this.selectedCard);
            hex.draggable = true;
            this.cardPoolElement.querySelectorAll(".card").forEach(c =>
              c.classList.remove("selected")
            );
            this.selectedCard = null;
          }
        };

        hex.ondragover = e => e.preventDefault();

        hex.ondrop = e => {
          e.preventDefault();
          const name = e.dataTransfer.getData("card-name");
          const imgURL = e.dataTransfer.getData("text/plain");

          if (!hex.querySelector("img")) {
            hex.innerHTML = `<img src="${imgURL}" data-name="${name}" />`;
            this.addTraits(name);
            hex.draggable = true;
          }
        };

        this.boardElement.appendChild(hex);
      }
    }
  }

  // Initializes the card pool with draggable cards
  initCardPool() {
    this.cards.forEach(card => {
      const cardElement = document.createElement("div");
      cardElement.classList.add("card");
      cardElement.draggable = true;

      cardElement.ondragstart = e => {
        e.dataTransfer.setData("text/plain", `images/${card.name}.png`);
        e.dataTransfer.setData("card-name", card.displayName);
      };

      cardElement.onclick = () => {
        if (this.selectedCard === card.displayName) {
          this.selectedCard = null;
          cardElement.classList.remove("selected");
        } else {
          this.selectedCard = cardElement.displayName;
          this.cardPoolElement.querySelectorAll(".card").forEach(c =>
            c.classList.remove("selected")
          );
          cardElement.classList.add("selected");
        }
      };
      
      // Display the card image and traits
      cardElement.innerHTML = `
        <img src="images/${card.name}.png" />
        ${card.traits.map(trait => `<p class="trait">${trait.displayName}</p>`).join("")}
        `;
      this.cardPoolElement.appendChild(cardElement);
    });
  }
}