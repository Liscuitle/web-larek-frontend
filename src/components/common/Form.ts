import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

interface IFormState {
	valid: boolean;
	errors: string[];
}

export class Form<T> extends Component<IFormState> {
	protected formElement: HTMLFormElement;
	private submitBtn: HTMLButtonElement;
	private errorDisplay: HTMLElement;
	private eventBus: IEvents; 

	constructor(formElement: HTMLFormElement, eventBus: IEvents) {
		super(formElement);
		this.formElement = formElement;
		this.eventBus = eventBus; 

		this.submitBtn = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
		this.errorDisplay = ensureElement<HTMLElement>(
			'.form__errors',
			this.container
		);

		// Событие ввода
		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.handleInputChange(field, value);
		});

		// Событие отправки формы
		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.eventBus.emit(`${this.formElement.name}:submit`); 
		});
	}

	private handleInputChange(field: keyof T, value: string) {
		this.eventBus.emit(`${this.formElement.name}.${String(field)}:change`, {
			field,
			value,
		});
	}

	set valid(isValid: boolean) {
		this.submitBtn.disabled = !isValid;
	}

	set errors(message: string) {
		this.setText(this.errorDisplay, message);
	}

	render(state: Partial<T> & IFormState): HTMLElement {
		const { valid, errors, ...rest } = state;
		super.render({ valid, errors });
		Object.assign(this, rest);
		return this.container;
	}
}
