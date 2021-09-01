const tagModule = {
  base_url: null,

  setBaseUrl: (url) => {
    tagModule.base_url = url;
  },

  makeTagDOMObject: (tagName, tagColor, tagId, cardId) => {
    let newTag = document.createElement('div');
    newTag.classList.add('tag');
    newTag.style.backgroundColor = tagColor;
    newTag.textContent = tagName;
    newTag.setAttribute('tag-id', tagId);
    newTag.setAttribute('card-id', cardId);

    newTag.addEventListener('dblclick', tagModule.disassociateTag);

    return newTag;
  },

  addTagToDOM: (tagElement, cardId) => {
    let cardTagsElement = document.querySelector(`[card-id="${cardId}"] .tags`);
    cardTagsElement.appendChild(tagElement);
  },

  showAssociateModal: async (event) => {
    const cardId = event.target.closest('.box').getAttribute('card-id');
    const modal = document.getElementById('associateTagModal');
    try {
      let response = await fetch(tagModule.base_url + '/tags');
      if (response.ok) {
        let tags = await response.json();
        let container = document.createElement('section');
        container.classList.add('modal-card-body');
        for (let tag of tags) {
          let tagElement = tagModule.makeTagDOMObject(tag.name, tag.color, tag.id, cardId);
          tagElement.addEventListener('click', tagModule.handleAssociateTag);

          container.appendChild(tagElement);
        }
        modal.querySelector('.modal-card-body').replaceWith(container);
        modal.classList.add("is-active");

      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de récupérer les tags");
      console.error(error);
    }

  },

  handleAssociateTag: async (event) => {
    const tagId = event.target.getAttribute('tag-id');
    const cardId = event.target.getAttribute('card-id');
    try {
      let data = new FormData();
      data.set('tag_id', tagId);
      let response = await fetch(tagModule.base_url + `/cards/${cardId}/tags`, {
        method: "POST",
        body: data
      });
      if (response.ok) {
        let card = await response.json();
        let oldTags = document.querySelectorAll(`[card-id="${card.id}"] .tag`);
        for (let tag of oldTags) {
          tag.remove();
        }
        let container = document.querySelector(`[card-id="${card.id}"] .tags`);
        for (let tag of card.tags) {
          let tagElement = tagModule.makeTagDOMObject(tag.name, tag.color, tag.id, card.id);
          container.appendChild(tagElement);
        }

      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible d'associer le tag");
      console.error(error);
    }
    const modal = document.getElementById('associateTagModal');
    modal.classList.remove('is-active');
  },

  disassociateTag: async (event) => {
    const tagId = event.target.getAttribute('tag-id');
    const cardId = event.target.getAttribute('card-id');
    try {
      let response = await fetch(tagModule.base_url + `/cards/${cardId}/tags/${tagId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        event.target.remove();
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert('Impossible de désassocier le tag'),
        console.error(error);
    }
  },

  makeEditTagForm: (tag) => {
    let orignalForm = document.getElementById('newTagForm');
    let newForm = document.importNode(orignalForm, true);
    newForm.setAttribute('id', null);
    newForm.classList.add('editTagForm');
    newForm.querySelector('[name="name"]').value = tag.name;
    newForm.querySelector('[name="color"]').value = tag.color;
    console.log(tag.color, newForm.querySelector('[name="color"]').value);
    newForm.setAttribute('tag-id', tag.id);
    newForm.addEventListener('submit', tagModule.handleEditTag);
    let deleteButton = document.createElement('div');
    deleteButton.classList.add("button", "is-small", "is-danger");
    deleteButton.textContent = "Supprimer";
    deleteButton.addEventListener('click', tagModule.handleDeleteTag);

    newForm.querySelector(".field").appendChild(deleteButton);

    return newForm;
  },

  showEditModal: async () => {
    try {

      let response = await fetch(tagModule.base_url + '/tags');

      const modal = document.getElementById('addAndEditTagModal');

      let tags = await response.json();
      let container = document.createElement('div');
      container.classList.add('editTagForms');
      for (let tag of tags) {
        let editFormElement = tagModule.makeEditTagForm(tag);
        container.appendChild(editFormElement);
      }
      modal.querySelector('.editTagForms').replaceWith(container);

      modal.classList.add('is-active');

    } catch (error) {
      alert("Impossible de récupérer les tags");
      console.error(error);
    }
  },

  handleNewTag: async (event) => {
    event.preventDefault();
    let data = new FormData(event.target);
    try {
      let response = await fetch(tagModule.base_url + '/tags', {
        method: "POST",
        body: data
      });
      if (response.ok) {
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de créer le tag");
      console.error(error);
    }
    document.getElementById('addAndEditTagModal').classList.remove('is-active');
  },

  handleEditTag: async (event) => {
    event.preventDefault();
    let data = new FormData(event.target);

    let tagId = event.target.getAttribute('tag-id');
    try {
      let response = await fetch(tagModule.base_url + '/tags/' + tagId, {
        method: "PATCH",
        body: data
      });
      if (response.ok) {
        let tag = await response.json();
        let existingOccurences = document.querySelectorAll(`[tag-id="${tag.id}"]`);
        for (let occurence of existingOccurences) {
          occurence.textContent = tag.name;
          occurence.style.backgroundColor = tag.color;
        }

      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert('Impossible de mettre le tag à jour');
      console.error(error);
    }
    document.getElementById('addAndEditTagModal').classList.remove('is-active');
  },

  handleDeleteTag: async (event) => {
    const tagId = event.target.closest('form').getAttribute('tag-id');
    try {
      let response = await fetch(tagModule.base_url + '/tags/' + tagId, {
        method: "DELETE"
      });
      if (response.ok) {
        let existingOccurences = document.querySelectorAll(`[tag-id="${tagId}"]`);
        for (let occurence of existingOccurences) {
          occurence.remove();
        }
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de supprimer le tag");
      console.error(error);
    }
    document.getElementById('addAndEditTagModal').classList.remove('is-active');
  }
};