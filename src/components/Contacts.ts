import { IContactsForm } from '../types';
import { IEvents } from './base/events';
import { Form } from './common/Form';

interface IFormState {
	valid: boolean;
	errors: string[];
}

export class Contacts extends Form<IContactsForm> {
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

	render(data: Partial<IContactsForm> & IFormState): HTMLElement {
		this.phone = data.phone || '';
		this.email = data.email || '';
		this.valid = data.valid;
		this.errors = data.errors.join('; ');
		return this.formElement;
	}
}
