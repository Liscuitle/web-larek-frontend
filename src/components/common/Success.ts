import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

interface ISuccessData {
	total: number;
}

interface ISuccessActions {
	onClick: () => void;
}

export class Success extends Component<ISuccessData> {
	private totalElement: HTMLElement;
	private closeBtn: HTMLElement;

	constructor(container: HTMLElement, actions: ISuccessActions) {
		super(container);

		this.totalElement = ensureElement<HTMLElement>(
			'.order-success__description',
			this.container
		);
		this.closeBtn = ensureElement<HTMLElement>(
			'.order-success__close',
			this.container
		);

		if (actions.onClick) {
			this.closeBtn.addEventListener('click', actions.onClick);
		}
	}

	set total(amount: string) {
		this.setText(this.totalElement, `Списано ${amount} синапсов`);
	}
}
