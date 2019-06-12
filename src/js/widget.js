/* eslint-disable class-methods-use-this */
import AddImages from './class_addImages';
import Geoposition from './Geoposition';
import API from './api';

// eslint-disable-next-line import/no-extraneous-dependencies
const uuid = require('uuid');

export default class Widget {
  constructor(parent) {
    this.parent = parent;
    this.messageList = document.querySelector('[data-id=messageList]');
    this.clipBtn = document.querySelector('[data-id=clip]');
    this.uploadForm = document.querySelector('[data-id=upload-form]');
    this.onlyOneBtnsHolder = true;
    this.pinnedOpen = false;
    this.pinnedMessage = null;
    // this.ws = new WebSocket('ws://eleven-three.herokuapp.com/ws');
    // this.ws.binaryType = 'blob'; // arraybuffer
  }

  create() {
    this.makingBody();
  }

  makingBody() {
    const kek = document.querySelector('[data-id=kek]');
    const imgEl = document.createElement('img');
    imgEl.setAttribute('data-id', 'img_1'); // тут будет имя картинки/фотографии потом
    imgEl.classList.add('image');
    // imgEl.classList.add('imageZoom');
    imgEl.src = './img/img_2.png';
    kek.appendChild(imgEl);

    // const divEl = document.createElement('div');
    // divEl.className = 'widgetBody';
    // divEl.innerHTML = `<div class="dateHolder">
    //   <span class="date">${timeNow}</span>
    // </div>
    // <div class="status">
    //   <span class="title">Server:</span>
    //   <span class="serverId">${serverId}</span>
    // </div>
    // <div class="actions">
    //   <span class="title">Info:</span>
    //   <span class="serverInfo">${logText}</span>
    // </div>`;

    // const worklog = this.parent.querySelector('[data-id=worklog]');
    // worklog.appendChild(divEl);

    console.log('мутим основное меню');
    this.addListeners();
    const addImages = new AddImages();
    addImages.create();
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
        <li data-id="clipPhoto" class="burgerMenuList">Прикрепить фотографию</li>`;
        // <li data-id="clipFile" class="burgerMenuList">Прикрепить документ</li>`;
        burgerMenu.appendChild(ulEl);
        openedClipMenu = true;
        openedBurgerMenu = false;

        const addImages = new AddImages();
        addImages.addClipListener();
        this.uploadForm.classList.remove('imgForm');
        this.uploadForm.classList.add('imgFormShow');
      } else if (openedClipMenu && !openedBurgerMenu) {
        burgerMenu.firstChild.remove();
        openedClipMenu = false;
        this.uploadForm.classList.remove('imgFormShow');
        this.uploadForm.classList.add('imgForm');
      }
    });

    this.messageList.addEventListener('click', (event) => {
      if (event.target.classList.value === 'image') {
        event.target.classList.value = 'imageZoom';
        event.target.parentElement.classList.value = 'messageZoomImg';
      } else if (event.target.classList.value === 'imageZoom') {
        event.target.classList.value = 'image';
        event.target.parentElement.classList.value = 'message';
      } else if (event.target.classList.value === 'geopos') {
        console.log('пытаюсь скопировать');
        const copyEl = document.createElement('INPUT');
        copyEl.setAttribute('type', 'text');
        copyEl.setAttribute('value', event.target.textContent);
        document.body.appendChild(copyEl);
        document.querySelector('INPUT').select();
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

    this.messageList.addEventListener('scroll', (event) => {
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
        // const pregMatch = message.match(reg);
        message = message.replace(reg, '<a class="link" href="$1">$1</a>');

        spanEl.innerHTML = message;
        // spanEl.innerHTML = `<span>${message}</span>`;

        this.messageList.appendChild(spanEl);

        // прокрутка вниз к новым сообщениям
        this.messageList.scrollTop = this.messageList.scrollHeight;
        messageInput.value = '';
      }
    });
  }

  addEventListenersBurger() {
    this.pinGeolocation = document.querySelector('[data-id=pinGeolocation]');
    this.pinGeolocation.addEventListener('click', () => {
      new Geoposition(this.messageList).create();
    });

    this.favoriteMessageBtn = document.querySelector('[data-id=favorite]');
    this.favoriteMessageBtn.addEventListener('click', () => {
      const favoriteMessages = document.querySelectorAll('messageType', 'favorite');
      console.log(favoriteMessages);
      console.log('смотрим на лайкнутые');
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
          const api = new API('http://localhost:7075/addFavorite');
          // console.log(localParent.textContent);
          this.toServerNewFavorite(localParent.id, localParent.firstChild.textContent, api);
        } else {
          localParent.setAttribute('messageType', 'regular');
          localParent.classList.remove('favorite');
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

  toServerNewFavorite(id, text, api) {
    const locId = id;
    const locText = text;
    const locApi = api;
    // console.log('mytext: ' + locText);

    async function addNewTaskToServer() {
      // добавляем тикет
      const TicketFull = await locApi.addFavorite({
        id: locId,
        text: locText,
      });
    }

    addNewTaskToServer();
  }
}
