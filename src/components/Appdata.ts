import {
	FormErrors,
	IAppState,
	IOrder,
	IOrderForm,
	IProductItem,
} from '../types';
import { Model } from './base/Model';
import { EventEmitter, IEvents } from './base/events';

export class AppData extends Model<IAppState> {
	catalog: Product[] = [];
	preview: string = '';
	basket: Product[] = [];
	order: IOrder = {
		address: '',
		payment: 'card',
		email: '',
		total: 0,
		phone: '',
		items: [],
	};
	formErrors: FormErrors = {};

	constructor(data: Partial<IAppState>, events: EventEmitter) {
		super(data, events);
	}

	clearBasket() {
		this.basket = [];
		this.order.items = [];
	}

	addToOrder(product: Product) {
		this.order.items.push(product.id);
	}

	removeFromOrder(product: Product) {
		const index = this.order.items.indexOf(product.id);
		if (index !== -1) {
			this.order.items.splice(index, 1);
		}
	}

	setCatalog(items: IProductItem[]) {
		this.catalog = items.map((item) => new Product(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	setPreview(product: Product) {
		this.preview = product.id;
		this.emitChanges('preview:changed', product);
	}

	addProductToBasket(product: Product) {
		this.basket.push(product);
	}

	removeProductFromBasket(product: Product) {
		const index = this.basket.indexOf(product);
		if (index !== -1) {
			this.basket.splice(index, 1);
		}
	}

	get statusBasket(): boolean {
		return this.basket.length === 0;
	}

	get bskt(): Product[] {
		return this.basket;
	}

	set total(value: number) {
		this.order.total = value;
	}

	getTotal(): number {
		return this.order.items.reduce((total, id) => {
			const product = this.catalog.find((prod) => prod.id === id);
			return total + (product?.price || 0);
		}, 0);
	}

	setOrderField(field: keyof IOrderForm, value: string) {
		this.order[field] = value as never;

		if (this.validateOrder()) {
			this.events.emit('order:ready', this.order);
		}
	}

	setContactsField(field: keyof IOrderForm, value: string) {
		this.order[field] = value as never;

		if (this.validateContacts()) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateOrder(): boolean {
		const errors: FormErrors = {};

		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateContacts(): boolean {
		const errors: FormErrors = {};

		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}

export class Product extends Model<IProductItem> {
	id: string;
	title: string;
	description: string;
	category: string;
	image: string;
	price: number | null;

	constructor(data: IProductItem, eventEmitter: IEvents) {
		super(data, eventEmitter);
		this.id = data.id;
		this.title = data.title;
		this.description = data.description;
		this.category = data.category;
		this.image = data.image;
		this.price = data.price;
	}
}
