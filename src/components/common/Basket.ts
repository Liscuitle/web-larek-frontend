import { createElement, ensureElement, formatNumber } from '../../utils/utils';
import { Component } from '../base/Component';
import { EventEmitter } from '../base/events';

interface IBasketState {
	items: HTMLElement[];
	total: number;
}

export class Basket extends Component<IBasketState> {
	private itemList: HTMLElement;
	private totalAmount: HTMLElement;
	public checkoutButton: HTMLButtonElement;

	constructor(container: HTMLElement, private eventBus: EventEmitter) {
		super(container);

		this.itemList = ensureElement<HTMLElement>('.basket__list', this.container);
		this.totalAmount = ensureElement<HTMLElement>(
			'.basket__price',
			this.container
		);
		this.checkoutButton = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.container
		);

		if (this.checkoutButton) {
			this.checkoutButton.addEventListener('click', () => {
				eventBus.emit('order:open');
			});
		}

		this.items = [];
	}

	set items(elements: HTMLElement[]) {
		if (elements.length > 0) {
			this.itemList.replaceChildren(...elements);
		} else {
			const emptyMsg = createElement<HTMLParagraphElement>('p', {
				textContent: 'Корзина пуста',
			});
			this.itemList.replaceChildren(emptyMsg);
		}
	}

	set total(amount: number) {
		this.setText(this.totalAmount, `${formatNumber(amount)} синапсов`);
	}

	public setDisabled(button: HTMLButtonElement, isDisabled: boolean) {
		button.disabled = isDisabled;
	}
}
