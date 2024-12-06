export interface IProductItem {
	id: string;
	title: string;
	description: string;
	category: string;
	image: string;
	price: number | null;
}

export interface IAppState {
	catalog: IProductItem[];
	preview: string;
	basket: string[];
	order: IOrder;
	total: string | number;
	loading: boolean;
}

export interface IProductsList {
	products: IProductItem[];
}

export interface IOrderForm {
	payment?: string;
	address?: string;
	phone?: string;
	email?: string;
	total?: string | number;
}

export interface IOrder extends IOrderForm {
	items: string[];
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
	id: string;
}
