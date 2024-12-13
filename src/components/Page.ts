import { ensureElement } from '../utils/utils';
import { Component } from './base/Component';
import { IEvents } from './base/events';

interface IPageState {
	catalog: HTMLElement[];
}

export class Page extends Component<IPageState> {
	private basketCounterDisplay: HTMLElement;
	private gallerySection: HTMLElement;
	private pageWrapper: HTMLElement;
	private basketButton: HTMLElement;

	constructor(container: HTMLElement, private eventBus: IEvents) {
		super(container);

		this.basketCounterDisplay = ensureElement<HTMLElement>(
			'.header__basket-counter',
			this.container
		);
		this.gallerySection = ensureElement<HTMLElement>(
			'.gallery',
			this.container
		);
		this.pageWrapper = ensureElement<HTMLElement>(
			'.page__wrapper',
			this.container
		);
		this.basketButton = ensureElement<HTMLElement>(
			'.header__basket',
			this.container
		);

		this.basketButton.addEventListener('click', () => {
			this.eventBus.emit('basket:open');
		});
	}

	set counter(count: number) {
		this.setText(this.basketCounterDisplay, String(count));
	}

	set catalog(items: HTMLElement[]) {
		this.gallerySection.replaceChildren(...items);
	}

	set locked(isLocked: boolean) {
		if (isLocked) {
			this.pageWrapper.classList.add('page__wrapper_locked');
		} else {
			this.pageWrapper.classList.remove('page__wrapper_locked');
		}
	}
}
