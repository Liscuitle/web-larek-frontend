// src/components/LarekApi.ts
import { IOrder, IOrderResult, IProductItem } from '../types';
import { Api, ApiListResponse } from './base/api';

export class LarekApi extends Api {
	cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	// Получение списка товаров с сервера
	getProductList(): Promise<IProductItem[]> {
		return this.get('/product').then((data: ApiListResponse<IProductItem>) => {
			return data.items.map((item) => ({ ...item }));
		});
	}

	// Отправка заказа на сервер
	orderProducts(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order).then((data: IOrderResult) => data);
	}
}
