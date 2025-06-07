import { FavouriteService } from "../../services/StorageService";
import { likeSvg } from "../likeSVG/likeSvg";

export class LikeButton {
    constructor(className) {
        this.className = className;
        this.favouriteService = new FavouriteService();
    }

    create(id, onRemoveFavourite) {
        const button = document.createElement('button');
        button.classList.add(this.className);
        button.dataset.id = id;

        if (this.favouriteService.check(id)) {
            button.classList.add(`${this.className}_active`);
        }

        button.addEventListener('click', () => {
            const cardElem = button.closest('.card');
            if (this.favouriteService.check(id)) {
                this.favouriteService.remove(id);
                button.classList.remove(`${this.className}_active`);

                // Анимация
                if (cardElem) {
                    cardElem.classList.add('card__remove-anim');
                    setTimeout(() => {
                        cardElem.remove();
                        if (onRemoveFavourite) {
                            onRemoveFavourite(id);
                        }

                        // Сообщение
                        const msg = document.createElement('div');
                        msg.textContent = 'Удалено из избранного';
                        msg.className = 'favourite-msg';
                        document.body.append(msg);
                        setTimeout(() => msg.remove(), 1500);
                    }, 300);
                }
            } else {
                this.favouriteService.add(id);
                button.classList.add(`${this.className}_active`);
            }
        });

        likeSvg().then((svg) => {
            button.append(svg);
        });

        return button;
    }

}




