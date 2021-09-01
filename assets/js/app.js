
var app = {

  base_url: "http://localhost:5050",


  init: function () {
    listModule.setBaseUrl(app.base_url);
    cardModule.setBaseUrl(app.base_url);
    tagModule.setBaseUrl(app.base_url);

    app.addListenerToActions();

    app.getListsFromAPI();
  
  },
  addListenerToActions: () => {
    let addListButton = document.getElementById('addListButton');
    addListButton.addEventListener('click', listModule.showAddModal );

    let closeModalButtons = document.querySelectorAll('.close');
    for (let button of closeModalButtons) {
      button.addEventListener('click', app.hideModals);
    }

    let addListForm = document.querySelector('#addListModal form');
    addListForm.addEventListener('submit', app.handleAddListForm);

    let addCardForm = document.querySelector('#addCardModal form');
    addCardForm.addEventListener('submit', app.handleAddCardForm);

    document.getElementById('editTagsButton').addEventListener('click', tagModule.showEditModal);
    document.getElementById('newTagForm').addEventListener('submit', tagModule.handleNewTag);
  },
  hideModals: () => {
    let modals = document.querySelectorAll('.modal');
    for (let modal of modals) {
      modal.classList.remove('is-active');
    }
  },

  handleAddListForm: async (event) => {
    event.preventDefault();
    await listModule.handleAddFormSubmit(event);
    app.hideModals();
  },

  handleAddCardForm: async (event) => {
    event.preventDefault();
    
    await cardModule.handleAddFormSubmit(event);

    app.hideModals();
  },
  getListsFromAPI: async () => {
    try {
      let response = await fetch(app.base_url+"/lists");
      if (response.status !== 200) {
        let error = await response.json();
        throw error;
      } else {
        let lists = await response.json();
        for (let list of lists) {
          let listElement = listModule.makeListDOMObject(list.name, list.id);
          listModule.addListToDOM(listElement);

          for (let card of list.cards) {
            let cardElement = cardModule.makeCardDOMObject(card.content, card.id, card.color);
            cardModule.addCardToDOM(cardElement, list.id);

            for (let tag of card.tags) {
              let tagElement = tagModule.makeTagDOMObject(tag.name, tag.color, tag.id, card.id);
              tagModule.addTagToDOM(tagElement, card.id);
            }
          }
        }
      }

      let container = document.querySelector('.card-lists');
      new Sortable(container, {
        group: "project",
        draggable: ".panel",
        onEnd: listModule.handleDropList
      });
    } catch (error) {
      alert("Impossible de charger les listes depuis l'API.");
      console.error(error);
    }
  }
  
};

document.addEventListener('DOMContentLoaded', app.init );