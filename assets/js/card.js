const cardModule = {
  base_url: null,

  setBaseUrl: (url) => {
    cardModule.base_url = url+'/cards';
  },

  showAddModal: (event) => {
    let listElement = event.target.closest('.panel');
    const listId = listElement.getAttribute('list-id');

    let input = modal.querySelector('input[name="list_id"]');
    input.value = listId;
    modal.classList.add('is-active');
  },

  handleAddFormSubmit: async (event) => {
    let data = new FormData(event.target);

    try {
      let response = await fetch(cardModule.base_url,{
        method: "POST",
        body: data
      });
      if (response.status != 200) {
        let error = await response.json();
        throw error;
      } else {
        let card = await response.json();
        let newCardElement = cardModule.makeCardDOMObject(card.content, card.id, card.color);
        cardModule.addCardToDOM(newCardElement, card.list_id);
      }
    } catch (error) {
      alert("Impossible de créer une carte");
      console.error(error);
    }
  },

  showEditForm: (event) => {
    let cardElement = event.target.closest('.box');
    let formElement = cardElement.querySelector('form');
    let contentElement = cardElement.querySelector('.card-name');
    formElement.querySelector('input[name="content"]').value = contentElement.textContent;
    formElement.querySelector('input[name="color"]').value = cardModule.rgb2hex( cardElement.style.backgroundColor );

    contentElement.classList.add('is-hidden');
    formElement.classList.remove('is-hidden');
  },

  handleEditCardForm: async (event) => {
    event.preventDefault();

    let data = new FormData(event.target);
    let cardElement = event.target.closest('.box');
    const cardId = cardElement.getAttribute('card-id');
    try {
      let response = await fetch(cardModule.base_url+'/'+cardId,{
        method: "PATCH",
        body: data
      });
      if (response.status !== 200) {
        let error = await response.json();
        throw error;
      } else {
        let card = await response.json();
        cardElement.querySelector('.card-name').textContent = card.content;
        cardElement.style.backgroundColor = card.color;
      }
    } catch (error) {
      alert("Impossible de modifier la carte");
      console.error(error);
    }
    event.target.classList.add('is-hidden');
    cardElement.querySelector('.card-name').classList.remove('is-hidden');
  },

  makeCardDOMObject: (cardContent, cardId, cardColor) => {
    let template = document.getElementById('template-card');
    let newCard = document.importNode(template.content, true);
    newCard.querySelector('.card-name').textContent = cardContent;
    let box = newCard.querySelector('.box');
    box.setAttribute('card-id', cardId);
    box.setAttribute('style', 'background-color: '+cardColor);
    newCard.querySelector('.button--edit-card').addEventListener('click', cardModule.showEditForm);
    newCard.querySelector('form').addEventListener('submit', cardModule.handleEditCardForm);
    newCard.querySelector('.button--delete-card').addEventListener('click', cardModule.deleteCard);
    newCard.querySelector('.button--add-tag').addEventListener('click', tagModule.showAssociateModal);

    return newCard;
  },

  addCardToDOM: (newCard, listId) => {
    let theGoodList = document.querySelector(`[list-id="${listId}"]`);
    theGoodList.querySelector('.panel-block').appendChild(newCard);
  },

  deleteCard: async (event) => {
    if (!confirm("Supprimer cette carte ?")) {
      return;
    }
    let cardElement = event.target.closest('.box');
    const cardId = cardElement.getAttribute('card-id');
    try {
      let response = await fetch(cardModule.base_url+'/'+cardId,{
        method: "DELETE"
      });
      if (response.ok) {
        cardElement.remove();
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de supprimer la carte");
      console.error(error);
    }
  },


  rgb2hex: (color) => {
    if (color.charAt(0) === '#') {
      return color;
    }
    let rgb = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
  }

};