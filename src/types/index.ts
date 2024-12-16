export interface IOrderForm {
	payment?: string;
	address?: string;
}

export interface IContactsForm {
	phone?: string;
	email?: string;
}

export interface IOrder extends IOrderForm, IContactsForm {
	items: string[]; 
	total: number; 
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
	id: string;
}

export interface IProductItem {
	id: string;
	title: string;
	category: string;
	image: string;
	price: number;
	description: string;
}
