import { AddContainer } from "../AddContainer";
import { API_URL } from "../../const";
import { ApiService } from "../../services/ApiService";
import { debounce } from "../../helpers";
import { router } from "../../main";
import { Header } from "../Header/Header";


export class Cart {
    static instance = null;

    constructor() {
        if (!Cart.instance) {
            Cart.instance = this;
            this.element = document.createElement('section');
            this.element.classList.add('cart');
            this.containerElement = AddContainer(this.element, 'cart__container');
            this.isMounted = false;
            this.debUpdataCart = debounce(this.updateCart.bind(this), 200);
        }


        return Cart.instance;

    }


    async mount(parent, data, emptyText) {
        if (this.isMounted) {
            return;
        }

        this.containerElement.textContent = '';

        const title = document.createElement('h2');
        title.classList.add('cart__title');
        title.textContent = 'Cart';

        this.containerElement.append(title);


        this.cartData = data;

        if (data.products && data.products.length) {
            this.renderProducts();
            this.renderPlace();
            this.renderForm();

        } else {
            this.containerElement.insertAdjacentHTML('beforeend',
                `<p class="cart__empty">${emptyText || 'Plese try again later...'}</p>`)
        }



        parent.prepend(this.element);
        this.isMounted = true;
    }

    unmount() {
        this.element.remove();
        this.isMounted = false;
    }

    async updateCart(id, quantity) {
        const api = new ApiService();

        if (quantity === 0) {
            await api.deleteProductFromCart(id);
            this.cartData.products = this.cartData.products.filter(item => item.id !== id);
        } else {
            await api.updateQuantityProductToCart(id, quantity);
            this.cartData.products.forEach(item => {
                if (item.id === id) {
                    item.quantity = quantity;
                }
            });
        }

        // Перезапрос корзины с сервера (гарантированно актуальные данные)
        const updatedCart = await api.getCart();
        this.cartData = updatedCart;

        // Обновление "Оформление"
        this.cartPlaceCount.textContent = `${updatedCart.products.length} товара на сумму:`;
        this.cartPlacePrice.innerHTML = `${updatedCart.totalPrice.toLocaleString()}&nbsp;tenge`;

        // Обновляем Header счётчик
        new Header().changeCount(updatedCart.totalCount);

        // Обработка пустой корзины
        if (updatedCart.products.length === 0) {
            this.containerElement.innerHTML = '';
            const title = document.createElement('h2');
            title.classList.add('cart__title');
            title.textContent = 'Cart';

            this.containerElement.append(title);
            this.containerElement.insertAdjacentHTML(
                'beforeend',
                `<p class="cart__empty">Корзина пуста, добавьте товар</p>`
            );
        }
    }




    renderProducts() {
        const listProducts = this.cartData.products;
        const listElem = document.createElement('ul');
        listElem.classList.add('cart__products');

        const listItems = listProducts.map((item) => {
            const listItemElem = document.createElement('li');
            listItemElem.classList.add('cart__product');

            const img = document.createElement('img');
            img.classList.add('cart__img');
            img.src = `${API_URL}${item.images[0]}`;
            img.alt = 'Кресло с подлокотниками';


            const title = document.createElement('h3');
            title.classList.add('cart__title-product');
            title.textContent = item.name;

            const price = document.createElement('p');
            price.classList.add('cart__price');
            price.innerHTML = `${(item.price * item.quantity).toLocaleString()}&nbsp;ten`;

            const article = document.createElement('p');
            article.classList.add('cart__article');
            article.innerHTML = `арт. ${item.article}`;

            const productControl = document.createElement('div');
            productControl.classList.add('cart__product-control');


            const cartProductBtnMinus = document.createElement('button');
            cartProductBtnMinus.classList.add('cart__product-btn');
            cartProductBtnMinus.textContent = '-';

            const cartProductCount = document.createElement('p');
            cartProductCount.classList.add('cart__product-count');
            cartProductCount.textContent = item.quantity;


            const cartProductBtnPlus = document.createElement('button');
            cartProductBtnPlus.classList.add('cart__product-btn');
            cartProductBtnPlus.textContent = '+';


            productControl.append(cartProductBtnMinus, cartProductCount, cartProductBtnPlus);

            cartProductBtnMinus.addEventListener('click', async () => {
                if (item.quantity) {
                    item.quantity--;
                    cartProductCount.textContent = item.quantity;
                }

                if (item.quantity === 0) {

                    listItemElem.remove();
                    this.debUpdataCart(item.id, item.quantity);

                    return;
                }

                price.innerHTML = `${(item.price * item.quantity).toLocaleString()}&nbsp;ten`;

                this.debUpdataCart(item.id, item.quantity);

            });


            cartProductBtnPlus.addEventListener('click', () => {
                item.quantity++;
                cartProductCount.textContent = item.quantity;
                price.innerHTML = `${(item.price * item.quantity).toLocaleString()}&nbsp;ten`;

                this.debUpdataCart(item.id, item.quantity);
            });

            listItemElem.append(img, title, price, article, productControl);
            return listItemElem




        })

        listElem.append(...listItems);
        this.containerElement.append(listElem);

    }

    renderPlace() {
        const count = this.cartData.products.length;
        const totalPrice = this.cartData.totalPrice;

        const cartPlace = document.createElement('div');
        cartPlace.classList.add('cart__place');


        const cartPlaceTitle = document.createElement('h3');
        cartPlaceTitle.classList.add('cart__subtitle');
        cartPlaceTitle.textContent = 'Оформление';

        const cartPlaceInfo = document.createElement('div');
        cartPlaceInfo.classList.add('cart__place-info');

        this.cartPlaceCount = document.createElement('p');
        this.cartPlaceCount.classList.add('cart__place-count');
        this.cartPlaceCount.textContent = `${count} товара на сумму:`;

        this.cartPlacePrice = document.createElement('p');
        this.cartPlacePrice.classList.add('cart__place-price');
        this.cartPlacePrice.innerHTML = `${totalPrice.toLocaleString()}&nbsp;tenge`;

        const cartPlaceDelivery = document.createElement('div');
        cartPlaceDelivery.classList.add('cart__place-delivery');
        cartPlaceDelivery.textContent = 'Доставка 0 tenge';

        const cartPlaceBtn = document.createElement('button');
        cartPlaceBtn.classList.add('cart__place-btn');
        cartPlaceBtn.textContent = 'Оформить заказ';
        cartPlaceBtn.type = 'submit';
        cartPlaceBtn.setAttribute('form', 'order');

        cartPlaceInfo.append(this.cartPlaceCount, this.cartPlacePrice);
        cartPlace.append(cartPlaceTitle, cartPlaceInfo, cartPlaceDelivery, cartPlaceBtn);

        this.containerElement.append(cartPlace);

    };



    renderForm() {
        const form = document.createElement('form');
        form.classList.add('cart__form', 'form-order');
        form.id = 'order';
        form.method = 'POST';
        const title = document.createElement('h3');
        title.classList.add('cart__subtitle', 'cart__subtitle_form-order');
        title.textContent = 'Информация для доставки';


        const inputFieldset = document.createElement('fieldset');
        inputFieldset.classList.add('form-order__fieldset', 'form-order__fieldset_input');

        const name = document.createElement('input');
        name.classList.add('form-order__input');
        name.type = 'text';
        name.name = 'name';
        name.required = true;
        name.placeholder = 'Фамилия Имя Отчество';


        const phone = document.createElement('input');
        phone.classList.add('phone-order__input');
        phone.type = 'tel';
        phone.name = 'phone';
        phone.required = true;
        phone.placeholder = 'Телефон';


        const email = document.createElement('input');
        email.classList.add('form-order__input');
        email.type = 'email';
        email.name = 'email';
        email.required = true;
        email.placeholder = 'E-mail';



        const address = document.createElement('input');
        address.classList.add('form-order__input');
        address.type = 'text';
        address.name = 'address';
        address.required = true;
        address.placeholder = 'Адресс доставки';

        inputFieldset.append(name, phone, email, address);


        const radioDeliveryFieldset = document.createElement('fieldset');
        radioDeliveryFieldset.classList.add('form-order__fieldset', 'form-order__fieldset_radio');


        const deliveryLegend = document.createElement('legend');
        deliveryLegend.classList.add('form-order__legend');
        deliveryLegend.textContent = 'Доставка';


        const deliveryLabel = document.createElement('label');
        deliveryLabel.classList.add('form-order__label', 'radio');
        const deliveryLabelText = document.createTextNode('Доставка');


        const deliveryInput = document.createElement('input');
        deliveryInput.classList.add('radio__input');
        deliveryInput.type = 'radio';
        deliveryInput.name = 'deliveryType';
        deliveryInput.required = true;
        deliveryInput.value = 'delivery';
        deliveryInput.checked = true;
        deliveryLabel.append(deliveryInput, deliveryLabelText);

        const pickupLabel = document.createElement('label');
        pickupLabel.classList.add('form-order__label', 'radio');
        const pickupLabelText = document.createTextNode('Самовывоз');


        const pickupInput = document.createElement('input');
        pickupInput.classList.add('radio__input');
        pickupInput.type = 'radio';
        pickupInput.name = 'deliveryType';
        pickupInput.required = true;
        pickupInput.value = 'pickup';
        pickupLabel.append(pickupInput, pickupLabelText);


        radioDeliveryFieldset.append(deliveryLegend, deliveryLabel, pickupLabel);

        radioDeliveryFieldset.addEventListener('change', (e) => {
            if (e.target === deliveryInput) {
                address.disabled = false
            } else {
                address.disabled = true;
                address.value = '';
            }
        })


        const radioPaymentFieldset = document.createElement('fieldset');
        radioPaymentFieldset.classList.add('form-order__fieldset', 'form-order__fieldset_radio');


        const paymentLegend = document.createElement('legend');
        paymentLegend.classList.add('form-order__legend');
        paymentLegend.textContent = 'Оплата';


        const cardLabel = document.createElement('label');
        cardLabel.classList.add('form-order__label', 'radio');
        const cardlabelText = document.createTextNode('Картой при получении');

        const cardInput = document.createElement('input');
        cardInput.classList.add('radio__input');
        cardInput.type = 'radio';
        cardInput.name = 'paymentType';
        cardInput.required = true;
        cardInput.value = 'card';
        cardLabel.append(cardInput, cardlabelText);



        const cashLabel = document.createElement('label');
        cashLabel.classList.add('form-order__label', 'radio');
        const cashLabelText = document.createTextNode('Наличными при получении');

        const cashInput = document.createElement('input');
        cashInput.classList.add('radio__input');
        cashInput.type = 'radio';
        cashInput.name = 'paymentType';
        cashInput.required = true;
        cashInput.value = 'pickup';
        cashInput.checked = true;
        cashLabel.append(cashInput, cashLabelText);
        radioPaymentFieldset.append(paymentLegend, cardLabel, cashLabel)

        form.append(title, inputFieldset, radioDeliveryFieldset, radioPaymentFieldset);




        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form));

            const { orderId } = await new ApiService().postOrder(data);

            // Сброс корзины в Header
            new Header().changeCount(0);

            // Показ уведомления (опционально)
            alert('✅ Заказ успешно оформлен!');

            // Перенаправление на главную
            router.navigate('/');
        });

        this.containerElement.append(form);
    }
}