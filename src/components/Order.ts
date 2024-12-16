import { IOrderForm } from '../types';
import { IEvents } from './base/events';
import { Form } from './common/Form';
import { ensureAllElements } from '../utils/utils';

interface IFormState {
	valid: boolean;
	errors: string[];
}

export class Order extends Form<IOrderForm> {
	private paymentOptions: HTMLButtonElement[];

	constructor(formElement: HTMLFormElement, eventBus: IEvents) {
		super(formElement, eventBus);

		this.paymentOptions = ensureAllElements<HTMLButtonElement>(
			'.button_alt',
			this.container
		);

		this.paymentOptions.forEach((button) => {
			button.addEventListener('click', () => {
				this.updatePaymentSelection(button.name);
				eventBus.emit('payment:change', button);
			});
		});
	}

	set payment(name: string) {
		this.paymentOptions.forEach((button) => {
			if (button.name === name) {
				button.classList.add('button_alt-active');
			} else {
				button.classList.remove('button_alt-active');
			}
		});
	}

	set address(value: string) {
		const addressInput = this.formElement.elements.namedItem(
			'address'
		) as HTMLInputElement;
		if (addressInput) {
			addressInput.value = value;
		}
	}

	private updatePaymentSelection(selectedName: string) {
		this.payment = selectedName;
	}

	render(data: Partial<IOrderForm> & IFormState): HTMLElement {
		this.address = data.address || '';
		if (data.payment) {
			this.payment = data.payment;
		}
		this.valid = data.valid;
		this.errors = data.errors.join('; ');
		return this.formElement;
	}
}
