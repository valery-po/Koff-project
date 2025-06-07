import { AddContainer } from "../AddContainer";
import { Card } from "../../features/Card/Card";

export class ProductList {
  static instance = null;

  constructor() {
    if (!ProductList.instance) {
      ProductList.instance = this;
      this.element = document.createElement('section');
      this.element.classList.add('goods');
      this.ContainerElement = AddContainer(this.element, 'goods__container');
      this.isMounted = false;
    }

    return ProductList.instance;
  }

  mount(parent, data, title, emptyText) {
    this.ContainerElement.textContent = '';

    const titleElem = document.createElement('h2');
    titleElem.textContent = title || 'Список товаров';
    titleElem.className = title ? 'goods__title' : 'goods__title visually-hidden';
    this.ContainerElement.append(titleElem);

    if (data && data.length) {
      this.updateListElem(data);
    } else {
      this.ContainerElement.insertAdjacentHTML(
        'beforeend',
        `<p class="goods__empty">${emptyText || 'Plese try again later...'}</p>`
      );
    }

    if (this.isMounted) return;
    parent.append(this.element);
    this.isMounted = true;
  }

  unmount() {
    this.element.remove();
    this.isMounted = false;
  }

  updateListElem(data = []) {
    const listElem = document.createElement('ul');
    listElem.classList.add('goods__list');

    const listItems = data.map(({ id, images: [image], name: title, price }) => {
      const listItemElem = document.createElement('li');

      const card = new Card(
        { id, image, title, price },
        (article) => {
          listItemElem.remove();
          if (!listElem.children.length) {
            this.ContainerElement.innerHTML = `<p class="goods__empty">Избранное пусто</p>`;
          }
        }
      );

      listItemElem.append(card.create());
      return listItemElem;
    });

    listElem.append(...listItems);
    this.ContainerElement.append(listElem);
  }
}


