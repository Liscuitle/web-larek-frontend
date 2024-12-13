import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

interface IModalContent {
	content: HTMLElement;
}

export class Modal extends Component<IModalContent> {
	private closeButton: HTMLButtonElement;
	private contentArea: HTMLElement;

	constructor(container: HTMLElement, private eventBus: IEvents) {
		super(container);

		this.closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);
		this.contentArea = ensureElement<HTMLElement>('.modal__content', container);

		this.closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('click', this.close.bind(this));
		this.contentArea.addEventListener('click', (event) =>
			event.stopPropagation()
		);
	}

	set content(element: HTMLElement) {
		this.contentArea.replaceChildren(element);
	}

	open() {
		this.container.classList.add('modal_active');
		this.eventBus.emit('modal:open');
	}

	close() {
		this.container.classList.remove('modal_active');
		this.content = null;
		this.eventBus.emit('modal:close');
	}

	render(data: IModalContent): HTMLElement {
		super.render(data);
		this.open();
		return this.container;
	}
}
