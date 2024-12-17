import {
	FormErrors,
	IOrder,
	IOrderForm,
	IContactsForm,
	IProductItem,
} from '../types';
import { Model } from './base/Model';
import { EventEmitter } from './base/events';

export class AppState extends Model<{}> {
	protected _catalog: IProductItem[] = [];
	protected _preview: string = '';
	protected _basket: IProductItem[] = [];
	protected _order: IOrder = {
		address: '',
		payment: 'card',
		email: '',
		total: 0,
		phone: '',
		items: [],
	};
	protected formErrors: FormErrors = {};

	constructor(data: Partial<{}>, events: EventEmitter) {
		super(data, events);
	}

	public get catalog(): IProductItem[] {
		return this._catalog;
	}

	public get basket(): IProductItem[] {
		return this._basket;
	}

	public get order(): IOrder {
		return this._order;
	}

	public get isBasketEmpty(): boolean {
		return this._basket.length === 0;
	}

	public get currentBasket(): IProductItem[] {
		return this._basket;
	}

	public set total(value: number) {
		this._order.total = value;
		this.emitChanges('order:totalUpdated', { total: value });
	}

	public getTotal(): number {
		return this._order.items.reduce((total, id) => {
			const product = this._catalog.find((prod) => prod.id === id);
			return total + (product?.price || 0);
		}, 0);
	}

	public clearBasket(): void {
		this._basket = [];
		this._order.items = [];
		this.emitChanges('basket:cleared', {});
		this.emitChanges('basket:updated', { basket: this._basket });
	}

	public addToOrder(product: IProductItem): void {
		this._order.items.push(product.id);
		this.emitChanges('order:itemAdded', { id: product.id });
	}

	public removeFromOrder(product: IProductItem): void {
		const index = this._order.items.indexOf(product.id);
		if (index !== -1) {
			this._order.items.splice(index, 1);
			this.emitChanges('order:itemRemoved', { id: product.id });
		}
	}

	public setCatalog(items: IProductItem[]): void {
		this._catalog = items;
		this.emitChanges('catalog:updated', { catalog: this._catalog });
	}

	public setPreview(product: IProductItem): void {
		this._preview = product.id;
		this.emitChanges('preview:updated', { product });
	}

	public addProductToBasket(product: IProductItem): void {
		if (!this._basket.find((item) => item.id === product.id)) {
			this._basket.push(product);
			this.emitChanges('basket:updated', { basket: this._basket });
		}
	}

	public removeProductFromBasket(product: IProductItem): void {
		const index = this._basket.findIndex((item) => item.id === product.id);
		if (index !== -1) {
			this._basket.splice(index, 1);
			this.emitChanges('basket:updated', { basket: this._basket });
		}
	}

	public setOrderPayment(paymentMethod: string): void {
		this._order.payment = paymentMethod;
		this.emitChanges('order:paymentUpdated', { payment: paymentMethod });
	}

	public setOrderField(field: keyof IOrderForm, value: string): void {
		this._order[field] = value as never;

		if (this.validateOrder()) {
			this.events.emit('order:ready', this._order);
		}
	}

	public setContactsField(field: keyof IContactsForm, value: string): void {
		if (field === 'phone') {
			this._order.phone = value;
		} else if (field === 'email') {
			this._order.email = value;
		}

		if (this.validateContacts()) {
			this.events.emit('order:ready', this._order);
		}
	}

	public validateOrder(): boolean {
		const errors: FormErrors = {};

		if (!this._order.address) {
			errors.address = 'Необходимо указать адрес';
		}

		if (!this._order.payment) {
			errors.payment = 'Необходимо выбрать способ оплаты';
		}

		this.formErrors = errors;
		this.emitChanges('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	public validateContacts(): boolean {
		const errors: FormErrors = {};

		if (!this._order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this._order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}

		this.formErrors = errors;
		this.emitChanges('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
