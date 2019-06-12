/* eslint-disable max-len */
export default class Geoposition {
  constructor(parent) {
    this.positionByUser = null;
    this.positionByGeo = null;
    this.parent = parent;
  }

  create() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.positionByGeo = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          this.createMessage(this.positionByGeo);
        }, () => {
          console.log('Запрет на координаты((');
        },
      );
    }
  }

  createMessage(geoposition) {
    this.geoposition = geoposition;
    const spanEl = document.createElement('span');
    spanEl.className = 'message';
    spanEl.innerHTML = `
    Мои координаты: [<span data-id="geopos" class="geopos">${this.geoposition}</span>]`;
    this.parent.appendChild(spanEl);

    this.parent.scrollTop = this.parent.scrollHeight;
  }
}
