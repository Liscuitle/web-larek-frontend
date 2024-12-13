import { IOrderForm } from '../types';
import { ensureAllElements } from '../utils/utils';
import { IEvents } from './base/events';
import { Form } from './common/Form';

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
}
export class Contacts extends Form<IOrderForm> {
	constructor(formElement: HTMLFormElement, eventBus: IEvents) {
		super(formElement, eventBus);
	}

	set phone(value: string) {
		const phoneInput = this.formElement.elements.namedItem(
			'phone'
		) as HTMLInputElement;
		if (phoneInput) {
			phoneInput.value = value;
		}
	}

	set email(value: string) {
		const emailInput = this.formElement.elements.namedItem(
			'email'
		) as HTMLInputElement;
		if (emailInput) {
			emailInput.value = value;
		}
	}
}