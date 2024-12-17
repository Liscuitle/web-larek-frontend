import { ensureElement } from '../utils/utils';
import { Component } from './base/Component';

interface ICardActions {
	onSelect?: (event: MouseEvent) => void; // Обработчик выбора карточки
	onAdd?: (event: MouseEvent) => void; // Обработчик добавления в корзину
	onRemove?: (event: MouseEvent) => void; // Обработчик удаления из корзины
}

interface ICardProps {
	title: string;
	category: string;
	image: string;
	price: number;
	text?: string;
	index?: number;
}

export class Card extends Component<ICardProps> {
	private titleElement: HTMLElement;
	private categoryElement: HTMLElement;
	private imageElement: HTMLImageElement;
	private priceElement: HTMLElement;
	private categoryMapping: Record<string, string> = {
		'софт-скил': 'soft',
		другое: 'other',
		дополнительное: 'additional',
		кнопка: 'button',
		'хард-скил': 'hard',
	};

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);
		this.titleElement = ensureElement<HTMLElement>('.card__title', container);
		this.categoryElement = ensureElement<HTMLElement>(
			'.card__category',
			container
		);
		this.imageElement = ensureElement<HTMLImageElement>(
			'.card__image',
			container
		);
		this.priceElement = ensureElement<HTMLElement>('.card__price', container);

		if (actions?.onSelect) {
			container.addEventListener('click', actions.onSelect);
		}
	}

	set title(value: string) {
		this.setText(this.titleElement, value);
	}

	set category(value: string) {
		this.setText(this.categoryElement, value);
		this.categoryElement.className = `card__category card__category_${this.categoryMapping[value]}`;
	}

	set image(src: string) {
		this.imageElement.src = src;
		this.imageElement.alt = this.titleElement.textContent || 'Product Image';
	}

	set price(amount: number | null) {
		this.setText(
			this.priceElement,
			amount !== null ? `${amount} синапсов` : 'Бесценно'
		);
	}
}

export class CardPreview extends Card {
	private textElement: HTMLElement;
	private buttonElement: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container, {
			onSelect: actions?.onSelect,
		});
		this.textElement = ensureElement<HTMLElement>('.card__text', container);
		this.buttonElement = ensureElement<HTMLElement>('.card__button', container);

		if (actions?.onAdd) {
			this.buttonElement.addEventListener('click', (event: MouseEvent) => {
				event.stopPropagation();
				actions.onAdd(event);
			});
		}
	}

	set text(content: string) {
		this.setText(this.textElement, content);
	}
}

interface ICardBasketProps {
	title: string;
	price: number;
	index: number;
}

export class CardBasket extends Card {
	private indexElement: HTMLElement;
	private deleteButton: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container, {
			onSelect: actions?.onSelect,
			onRemove: actions?.onRemove,
		});
		this.indexElement = ensureElement<HTMLElement>(
			'.basket__item-index',
			container
		);
		this.deleteButton = ensureElement<HTMLElement>(
			'.basket__item-delete',
			container
		);

		if (actions?.onRemove) {
			this.deleteButton.addEventListener('click', actions.onRemove);
		}
	}

	set index(num: number) {
		this.setText(this.indexElement, num.toString());
	}
}
