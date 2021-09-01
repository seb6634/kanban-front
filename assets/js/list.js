const listModule = {
  base_url: null,

  setBaseUrl: (url) => {
    listModule.base_url = url + '/lists';
  },

  showAddModal: () => {
    let modal = document.getElementById('addListModal');
    modal.classList.add('is-active');
  },

  handleAddFormSubmit: async (event) => {
    let data = new FormData(event.target);
    let nbListes = document.querySelectorAll('.panel').length;
    data.set('page_order', nbListes);

    try {
      let response = await fetch(listModule.base_url, {
        method: "POST",
        body: data
      });
      if (response.status !== 200) {
        let error = await response.json();
        throw error;
      } else {
        const list = await response.json();
        let newList = listModule.makeListDOMObject(list.name, list.id);
        listModule.addListToDOM(newList);
      }
    } catch (error) {
      alert("Impossible de créer une liste");
      console.error(error);
    }
  },

  showEditForm: (event) => {
    let listElement = event.target.closest('.panel');
    let formElement = listElement.querySelector('form');
    formElement.querySelector('input[name="name"]').value = event.target.textContent;

    event.target.classList.add('is-hidden');
    formElement.classList.remove('is-hidden');
  },

  handleEditListForm: async (event) => {
    event.preventDefault();

    let data = new FormData(event.target);
    let listElement = event.target.closest('.panel');
    const listId = listElement.getAttribute('list-id');

    try {
      let response = await fetch(listModule.base_url + '/' + listId, {
        method: "PATCH",
        body: data
      });
      if (response.status !== 200) {
        let error = await response.json();
        throw error;
      } else {
        let list = await response.json();
        listElement.querySelector('h2').textContent = list.name;
      }
    } catch (error) {
      alert("Impossible de modifier la liste");
      console.error(error);
    }
    event.target.classList.add('is-hidden');
    listElement.querySelector('h2').classList.remove('is-hidden');
  },

  makeListDOMObject: (listName, listId) => {
    let template = document.getElementById('template-list');
    let newList = document.importNode(template.content, true);
    newList.querySelector('h2').textContent = listName;
    newList.querySelector('.panel').setAttribute('list-id', listId);
    newList.querySelector('.button--add-card').addEventListener('click', cardModule.showAddModal);
    newList.querySelector('h2').addEventListener('dblclick', listModule.showEditForm);
    newList.querySelector('form').addEventListener('submit', listModule.handleEditListForm);
    newList.querySelector('.button--delete-list').addEventListener('click', listModule.deleteList);
    let container = newList.querySelector('.panel-block');
    new Sortable(container, {
      group: "list",
      draggable: ".box",
      onEnd: listModule.handleDropCard
    });


    return newList;
  },

  addListToDOM: (newList) => {
    document.querySelector('.card-lists').append(newList);
    document.querySelector('.card-lists').scrollTo(document.querySelector('.card-lists').offsetWidth, 0);
  },

  deleteList: async (event) => {
    let listElement = event.target.closest('.panel');
    const listId = listElement.getAttribute('list-id');

    if (listElement.querySelectorAll('.box').length) {
      alert("Impossible de supprimer une liste non vide");
      return;
    }
    if (!confirm("Supprimer cette liste ?")) {
      return;
    }
    try {
      let response = await fetch(listModule.base_url + '/' + listId, {
        method: "DELETE"
      });
      if (response.ok) {
        listElement.remove();
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de supprimer la liste.");
      console.log(error);
    }
  },

  updateAllLists: () => {
    document.querySelectorAll('.panel').forEach((list, position) => {
      const listId = list.getAttribute('list-id');
      let data = new FormData();
      data.set('position', position);
      fetch(listModule.base_url + '/' + listId, {
        method: "PATCH",
        body: data
      });
    });
  },

  updateAllCards: (cards, listId) => {
    cards.forEach((card, position) => {
      const cardId = card.getAttribute('card-id');
      let data = new FormData();
      data.set('position', position);
      data.set('list_id', listId);
      fetch(cardModule.base_url + '/' + cardId, {
        method: "PATCH",
        body: data
      });
    });
  },

  handleDropCard: (event) => {
    let cardElement = event.item;
    let originList = event.from;
    let targetList = event.to;

    let cards = originList.querySelectorAll('.box');
    let listId = originList.closest('.panel').getAttribute('list-id');
    listModule.updateAllCards(cards, listId);

    if (originList !== targetList) {
      cards = targetList.querySelectorAll('.box')
      listId = targetList.closest('.panel').getAttribute('list-id');
      listModule.updateAllCards(cards, listId);
    }
  },

  handleDropList: (event) => {
    listModule.updateAllLists();
  }

};
