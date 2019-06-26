export default class API {
  constructor(url) {
    this.url = url;
    this.contentTypeHeader = { 'Content-Type': 'application/json' };
  }

  load() {
    console.log('команда загрузки из апи');
    return fetch(this.url);
  }

  add(images) {
    // this.url = http://localhost:7075/images
    return fetch(this.url, {
      body: JSON.stringify(images),
      method: 'POST',
      headers: this.contentTypeHeader,
    });
  }

  // addFile(files) {
  //   // this.url = http://localhost:7075/files
  //   return fetch(this.url, {
  //     body: JSON.stringify(files),
  //     method: 'POST',
  //     headers: this.contentTypeHeader,
  //   });
  // }

  addFavorite(message) {
    console.log('__________');
    console.log(message);
    return fetch(this.url, {
      body: JSON.stringify(message),
      method: 'POST',
      headers: this.contentTypeHeader,
    });
  }

  addNewMessage(message) {
    return fetch(this.url, {
      body: JSON.stringify(message),
      method: 'POST',
      headers: this.contentTypeHeader,
    });
  }

  remove(id) {
    return fetch(`${this.url}/${id}`, {
      method: 'DELETE',
    });
  }
}
