import { IOrder, IOrderResult, IProductItem } from '../types';
import { Api, ApiListResponse } from './base/api';

export class LarekApi extends Api {
	cdn: string;

	constructor(cdnUrl: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdnUrl;
	}

	fetchProductList(): Promise<IProductItem[]> {
		return this.get('/product').then(
			(response: ApiListResponse<IProductItem>) => {
				return response.items.map((item) => ({ ...item }));
			}
		);
	}

	submitOrder(orderData: IOrder): Promise<IOrderResult> {
		return this.post('/order', orderData).then(
			(result: IOrderResult) => result
		);
	}
}
