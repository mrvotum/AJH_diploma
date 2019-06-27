/* eslint-disable no-useless-escape */
/* eslint-disable no-mixed-operators */
/* eslint-disable class-methods-use-this */
import AddImages from './class_addImages';
import Geoposition from './Geoposition';
import API from './api';
import AddFile from './class_addFile';

// eslint-disable-next-line import/no-extraneous-dependencies
const uuid = require('uuid');

export default class Widget {
  constructor(parent) {
    this.parent = parent;
    this.messageList = document.querySelector('[data-id=messageList]');
    this.clipBtn = document.querySelector('[data-id=clip]');
    this.uploadForm = document.querySelector('[data-id=upload-form]');
    this.formFile = document.querySelector('[data-id=formFile]');
    this.onlyOneBtnsHolder = true;
    this.favoriteMessagesList = false;
    this.pinnedOpen = false;
    this.pinnedMessage = null;
    // this.ws = new WebSocket('ws://eleven-three.herokuapp.com/ws');
    // this.ws.binaryType = 'blob'; // arraybuffer
  }

  create() {
    this.makingBody();
  }

  makingBody() {
    console.log('мутим основное меню');
    this.addListeners();
    const addImages = new AddImages();
    addImages.create();

    this.loadMessages();
  }

  // eslint-disable-next-line class-methods-use-this
  addListeners() {
    const burgerMenu = document.querySelector('[data-id=burgerMenu]');
    let openedBurgerMenu = false;
    let openedClipMenu = false;
    burgerMenu.addEventListener('click', () => {
      if (!openedBurgerMenu && !openedClipMenu) {
        console.log('Вызываем бургер-меню');
        const ulEl = document.createElement('ul');
        ulEl.className = 'burgerMenuUl';
        ulEl.innerHTML = `
        <li data-id="pinGeolocation" class="burgerMenuList">Прикрепить геолокацию</li>
        <li data-id="favorite" class="burgerMenuList">Избранные сообщения</li>
        <li class="burgerMenuList">cheburek</li>`;
        burgerMenu.appendChild(ulEl);
        openedBurgerMenu = true;
        openedClipMenu = false;

        this.addEventListenersBurger();
      } else if (openedBurgerMenu && !openedClipMenu) {
        console.log('закрываем меню');
        burgerMenu.firstChild.remove();
        openedBurgerMenu = false;
      }
    });

    this.clipBtn.addEventListener('click', () => {
      if (!openedClipMenu && !openedBurgerMenu) {
        const ulEl = document.createElement('ul');
        ulEl.className = 'burgerMenuUl';
        ulEl.innerHTML = `
        <li data-id="clipPhoto" class="burgerMenuList">Прикрепить фотографию</li>
        <li data-id="clipFile" class="burgerMenuList">Прикрепить документ</li>`;
        burgerMenu.appendChild(ulEl);
        openedClipMenu = true;
        openedBurgerMenu = false;

        this.addListenersForClipFunctions();
      } else if (openedClipMenu && !openedBurgerMenu) {
        burgerMenu.firstChild.remove();
        openedClipMenu = false;
        this.uploadForm.classList.remove('imgFormShow');
        this.uploadForm.classList.add('imgForm');
      }
    });

    this.messageList.addEventListener('click', (event) => {
      if (event.target.classList.value === 'image') {
        const ev = event;
        ev.target.classList.value = 'imageZoom';
        ev.target.parentElement.classList.value = 'messageZoomImg';
      } else if (event.target.classList.value === 'imageZoom') {
        const ev = event;
        ev.target.classList.value = 'image';
        ev.target.parentElement.classList.value = 'message';
      } else if (event.target.classList.value === 'geopos') {
        console.log('пытаюсь скопировать');
        const copyEl = document.createElement('INPUT');
        copyEl.setAttribute('type', 'text');
        copyEl.setAttribute('data-id', 'copy');
        copyEl.setAttribute('value', event.target.textContent);
        document.body.appendChild(copyEl);
        document.querySelector('[data-id=copy]').select();
        document.execCommand('copy');
        copyEl.remove();
      }
    });

    this.messageList.addEventListener('mouseover', (event) => {
      if (event.target.classList.value === 'message' && this.onlyOneBtnsHolder || event.target.classList.value === 'message favorite' && this.onlyOneBtnsHolder) {
        this.onlyOneBtnsHolder = false;
        const ourTarget = event.target;

        const divEl = document.createElement('div');
        divEl.className = 'btnsHolder btnsHolderShow';
        divEl.innerHTML = `
          <span data-id="btnFavorite" class="btnFavorite">&#10084;</span>
          <span data-id="btnPin" class="btnPin">&#9733;</span>`;
        ourTarget.appendChild(divEl);
        this.addListenersFavorite(ourTarget, false);

        ourTarget.addEventListener('mouseleave', () => {
          divEl.classList.remove('btnsHolderShow');
          divEl.classList.add('btnsHolderHide');
          setTimeout(() => {
            divEl.remove();
            this.onlyOneBtnsHolder = true;
          }, 100);
        });
      }
    });

    this.messageList.addEventListener('scroll', () => {
      if (this.pinnedMessage !== null) {
        this.pinnedMessage.style.top = `${this.messageList.scrollTop}px`;
      }
      // try {
      //   // console.log('lel');
      //   this.pinnedMessage.style.top = `${this.messageList.scrollTop}px`;
      // } catch (error) {
      //   // console.log('Нет прикреплённых');
      // }
    });

    // сообщения в виде сообщений))
    const messageInput = document.querySelector('[data-id=messageInput]');
    messageInput.addEventListener('keypress', (event) => {
      if (event.charCode === 13) {
        console.log('Отправляем');
        const spanEl = document.createElement('span');
        spanEl.className = 'message';
        spanEl.id = uuid.v4();

        spanEl.setAttribute('messageType', 'regular');

        let message = messageInput.value;
        const reg = /((([A-Za-z]{3,9}):\/\/)*?([-;:&=\+\$,\w]+@{1})?(([-A-Za-z0-9]+\.)+[A-Za-z]{2,3})(:\d+)?((\/[-\+~%\/\.\w]+)?\/?([&?][-\+=&;%@\.\w]+)?(#[\w]+)?)?)/igm;
        message = message.replace(reg, '<a class="link" href="$1">$1</a>');

        spanEl.innerHTML = message;

        this.messageList.appendChild(spanEl);

        // прокрутка вниз к новым сообщениям
        this.messageList.scrollTop = this.messageList.scrollHeight;
        messageInput.value = '';

        const api = new API('https://ajh-diploma.herokuapp.com/newMessage');
        this.toServerNewMessage(spanEl.id, spanEl.textContent, api);
      }
    });
  }

  addListenersForClipFunctions() {
    const clipPhoto = document.querySelector('[data-id=clipPhoto]');
    const clipFile = document.querySelector('[data-id=clipFile]');

    clipPhoto.addEventListener('click', () => {
      const addImages = new AddImages();
      addImages.addClipListener();

      this.uploadForm.classList.remove('imgForm');
      this.uploadForm.classList.add('imgFormShow');
    });

    clipFile.addEventListener('click', () => {
      const addFile = new AddFile();
      addFile.create();

      this.formFile.classList.remove('imgForm');
      this.formFile.classList.add('imgFormShow');
    });
  }

  addEventListenersBurger() {
    this.pinGeolocation = document.querySelector('[data-id=pinGeolocation]');
    this.pinGeolocation.addEventListener('click', () => {
      new Geoposition(this.messageList).create();
    });

    this.favoriteMessageBtn = document.querySelector('[data-id=favorite]');
    this.favoriteMessageBtn.addEventListener('click', () => {
      // const favoriteMessages = document.querySelectorAll('messageType', 'favorite');
      if (!this.favoriteMessagesList) {
        console.log('смотрим на лайкнутые');
        this.loadFavoriteMessages();
        this.favoriteMessagesList = true;
      } else {
        const favoriteMessagesList = document.querySelector('[data-id=favoriteMessagesList]');
        favoriteMessagesList.remove();
        this.favoriteMessagesList = false;
      }
    });
  }

  // для кнопки like и favorite
  addListenersFavorite(parent, liked) {
    const localParent = parent;
    const btnPin = document.querySelector('[data-id=btnPin]');

    btnPin.addEventListener('click', () => {
      console.log('это пин');
      console.log(localParent);

      // проверяем, есть ли уже закреплённое, чтобы не множить несколько
      if (this.pinnedMessage !== null) {
        this.pinnedMessage.classList.remove('pinned');
        // this.pinnedMessage.setAttribute('data', '');
        this.pinnedMessage.setAttribute('style', '');
        this.pinnedMessage.classList.remove('pinnedOpen');
        this.pinnedMessage = null;
      }
      localParent.classList.add('pinned');
      // localParent.setAttribute('data', 'pinned');
      this.pinnedMessage = localParent;
      setTimeout(() => {
        this.addListenerPinBtn();
      }, 10);

      this.deletePinEvent();
    });

    if (!liked) {
      console.log('non liked');
      const btnFavorite = document.querySelector('[data-id=btnFavorite]');
      btnFavorite.addEventListener('click', () => {
        console.log('это лайк');
        if (localParent.getAttribute('messageType') === 'regular') {
          localParent.setAttribute('messageType', 'favorite');
          localParent.classList.add('favorite');

          // отправляем на сервер
          const api = new API('https://ajh-diploma.herokuapp.com/addFavorite');
          // console.log(localParent.textContent);
          this.toServerNewFavorite(localParent.id, localParent.textContent, api);
        } else {
          localParent.setAttribute('messageType', 'regular');
          localParent.classList.remove('favorite');
          console.log('Удаляем из избранного');

          // удаление с сервера
          const idEl = localParent.id;
          const api = new API('https://ajh-diploma.herokuapp.com/dellFavorite');
          console.info(`id for delete = ${idEl}`);
          this.removeElById(api, idEl);
          // удаление с сервера
        }
      });
    }
  }

  deletePinEvent() {
    this.pinnedMessage.addEventListener('dblclick', () => {
      this.pinnedMessage.classList.remove('pinned');
      this.pinnedMessage.setAttribute('style', '');
      this.pinnedMessage.classList.remove('pinnedOpen');
      this.pinnedMessage = null;
    });
  }

  addListenerPinBtn() {
    this.pinnedMessage.addEventListener('click', () => {
      if (!this.pinnedOpen) {
        console.log('Удаляем класс');
        this.pinnedMessage.classList.remove('pinnedOpen');
        this.pinnedOpen = true;
      } else {
        console.log('Разворачиваем прикреплённое сообщение');
        this.pinnedMessage.classList.add('pinnedOpen');
        this.pinnedOpen = false;
      }
    });
  }

  toServerNewMessage(id, text, api) {
    const locId = id;
    const locText = text;
    const locApi = api;
    // console.log('mytext: ' + locText);

    async function addNewTaskToServer() {
      // добавляем сообщение в избранное на сервере
      // eslint-disable-next-line no-unused-vars
      const newMessage = await locApi.addNewMessage({
        id: locId,
        text: locText,
      });
    }

    addNewTaskToServer();
  }

  toServerNewFavorite(id, text, api) {
    const locId = id;
    const locText = text;
    const locApi = api;
    // console.log('mytext: ' + locText);

    async function addNewTaskToServer() {
      // добавляем сообщение в избранное на сервере
      // eslint-disable-next-line no-unused-vars
      const favoriteMessage = await locApi.addFavorite({
        id: locId,
        text: locText,
      });
    }

    addNewTaskToServer();
  }


  // работа с сервером
  loadFavoriteMessages() {
    console.log('Загружаю с сервера избранные...');
    const api = new API('https://ajh-diploma.herokuapp.com/showFavorite');
    this.fromServerFavorite(api);
  }

  loadMessages() {
    console.log('Загружаю с сервера данные...');
    const api = new API('https://ajh-diploma.herokuapp.com/showMessages');
    this.fromServerMessages(api);
  }

  fromServerFavorite(api) {
    const colApi = api;

    async function loadFromServer() {
      const favoriteMessages = await colApi.load();
      const data = await favoriteMessages.json();
      console.log('Вызываю избранные сообщения');
      console.log(data);

      const divEl = document.createElement('div');
      divEl.className = 'favoriteMessagesList';
      divEl.setAttribute('data-id', 'favoriteMessagesList');

      const messageList = document.querySelector('[data-id=messageList]');
      messageList.appendChild(divEl);

      // для каждого элемента из БД сервера
      for (let i = 0; i < data.length; i += 1) {
        let messageText = data[i].text;

        const spanEl = document.createElement('span');
        spanEl.id = data[i].id;
        spanEl.classList = 'message favorite';
        spanEl.setAttribute('messageType', 'favorite');
        spanEl.textContent = messageText;

        const reg = /((([A-Za-z]{3,9}):\/\/)*?([-;:&=\+\$,\w]+@{1})?(([-A-Za-z0-9]+\.)+[A-Za-z]{2,3})(:\d+)?((\/[-\+~%\/\.\w]+)?\/?([&?][-\+=&;%@\.\w]+)?(#[\w]+)?)?)/igm;
        messageText = messageText.replace(reg, '<a class="link" href="$1">$1</a>');
        spanEl.innerHTML = messageText;

        divEl.appendChild(spanEl);
      }
    }

    loadFromServer();
  }

  fromServerMessages(api) {
    const colApi = api;

    async function loadFromServer() {
      const messages = await colApi.load();
      const data = await messages.json();
      console.log('Вызываю старые сообщения');

      const messageList = document.querySelector('[data-id=messageList]');

      // для каждого элемента из БД сервера
      for (let i = 0; i < data.length; i += 1) {
        let messageText = data[i].text;

        const spanEl = document.createElement('span');
        spanEl.id = data[i].id;

        if (data[i].messageType === 'favorite') {
          spanEl.classList = 'message favorite';
        } else {
          spanEl.classList = 'message';
        }

        spanEl.setAttribute('messageType', 'regular');

        const reg = /((([A-Za-z]{3,9}):\/\/)*?([-;:&=\+\$,\w]+@{1})?(([-A-Za-z0-9]+\.)+[A-Za-z]{2,3})(:\d+)?((\/[-\+~%\/\.\w]+)?\/?([&?][-\+=&;%@\.\w]+)?(#[\w]+)?)?)/igm;
        messageText = messageText.replace(reg, '<a class="link" href="$1">$1</a>');
        spanEl.innerHTML = messageText;


        messageList.appendChild(spanEl);
      }
    }

    loadFromServer();
  }

  removeElById(api, idEl) {
    async function deleteEl(id) {
      // eslint-disable-next-line no-unused-vars
      const favoriteMessages = await api.remove(id);
    }

    deleteEl(idEl);
  }
  // работа с сервером
}
