import { Success } from './components/common/Success';
import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL } from './utils/constants';
import { LarekApi } from './components/LarekApi';
import { cloneTemplate, ensureElement } from './utils/utils';
import { AppState } from './components/AppState';
import { Page } from './components/Page';
import { Card, CardBasket, CardPreview } from './components/Card';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import {
	IOrderForm,
	IOrderResult,
	IProductItem,
	IContactsForm,
	IOrder,
} from './types';

// Интерфейсы для ошибок форм
interface ICombinedFormErrors extends Partial<IOrder>, Partial<IContactsForm> {}

interface IFormState {
	valid: boolean;
	errors: string[];
}

const eventEmitter = new EventEmitter();
const apiService = new LarekApi(CDN_URL, API_URL);

// Логирование событий
eventEmitter.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Загрузка шаблонов
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const catalogCardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const previewCardTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// Инициализация состояния
const applicationData = new AppState({}, eventEmitter);

// Основные контейнеры
const mainPage = new Page(document.body, eventEmitter);
const modalWindow = new Modal(
	ensureElement<HTMLElement>('#modal-container'),
	eventEmitter
);

// Компоненты интерфейса
const shoppingBasket = new Basket(
	cloneTemplate<HTMLTemplateElement>(basketTemplate),
	eventEmitter
);
const orderForm = new Order(
	cloneTemplate<HTMLFormElement>(orderTemplate),
	eventEmitter
);
const contactForm = new Contacts(
	cloneTemplate<HTMLFormElement>(contactsTemplate),
	eventEmitter
);

// Обновление каталога
eventEmitter.on('catalog:updated', () => {
	console.log('Updating catalog with:', applicationData.catalog);
	mainPage.catalog = applicationData.catalog.map((product: IProductItem) => {
		const productCard = new Card(cloneTemplate(catalogCardTemplate), {
			onSelect: () => eventEmitter.emit('card:select', product),
		});
		const rendered = productCard.render({
			title: product.title,
			category: product.category,
			image: apiService.cdn + product.image,
			price: product.price || 0,
			text: product.description,
		});
		console.log('Rendered product:', rendered);
		return rendered;
	});
});

// Выбор карточки для предпросмотра
eventEmitter.on('card:select', (selectedProduct: IProductItem) => {
	console.log('Selected product:', selectedProduct);
	applicationData.setPreview(selectedProduct);
});

// Обновление превью выбранного товара
// Изменяем событие с 'preview:changed' на 'preview:updated' и деструктурируем { product }
eventEmitter.on('preview:updated', ({ product }: { product: IProductItem }) => {
	console.log('Preview changed:', product);
	const previewCard = new CardPreview(cloneTemplate(previewCardTemplate), {
		onAdd: () => eventEmitter.emit('card:add', product),
		onSelect: () => eventEmitter.emit('card:select', product),
	});

	modalWindow.render({
		content: previewCard.render({
			title: product.title,
			image: apiService.cdn + product.image,
			text: product.description,
			price: product.price || 0,
			category: product.category,
		}),
	});
});

// Добавление в корзину
eventEmitter.on('card:add', (addedProduct: IProductItem) => {
	console.log('Adding product to basket:', addedProduct);
	applicationData.addToOrder(addedProduct);
	applicationData.addProductToBasket(addedProduct);
	mainPage.counter = applicationData.basket.length;
	modalWindow.close();
});

// Открытие корзины
eventEmitter.on('basket:open', () => {
	console.log('Opening basket');
	shoppingBasket.setDisabled(
		shoppingBasket.checkoutButton,
		applicationData.isBasketEmpty
	);
	shoppingBasket.total = applicationData.getTotal();
	let index = 1;
	shoppingBasket.items = applicationData.basket.map((product: IProductItem) => {
		const basketItem = new CardBasket(cloneTemplate(basketCardTemplate), {
			onRemove: () => eventEmitter.emit('card:remove', product),
		});
		return basketItem.render({
			title: product.title,
			price: product.price || 0,
			index: index++,
		});
	});
	modalWindow.render({ content: shoppingBasket.render() });
});

// Удаление товара из корзины
eventEmitter.on('card:remove', (removedProduct: IProductItem) => {
	console.log('Removing product from basket:', removedProduct);
	applicationData.removeProductFromBasket(removedProduct);
	applicationData.removeFromOrder(removedProduct);
	mainPage.counter = applicationData.basket.length;
	shoppingBasket.setDisabled(
		shoppingBasket.checkoutButton,
		applicationData.isBasketEmpty
	);
	shoppingBasket.total = applicationData.getTotal();
	let index = 1;
	shoppingBasket.items = applicationData.basket.map((product: IProductItem) => {
		const basketItem = new CardBasket(cloneTemplate(basketCardTemplate), {
			onRemove: () => eventEmitter.emit('card:remove', product),
		});
		return basketItem.render({
			title: product.title,
			price: product.price || 0,
			index: index++,
		});
	});
	modalWindow.render({ content: shoppingBasket.render() });
});

// Обработка изменений валидации формы
eventEmitter.on(
	'formErrors:change',
	(errors: ICombinedFormErrors & IFormState) => {
		console.log('Form errors changed:', errors);
		const { email, phone, address, payment } = errors;
		orderForm.valid = !address && !payment;
		contactForm.valid = !email && !phone;
		orderForm.errors = Object.values({ address, payment })
			.filter(Boolean)
			.join('; ');
		contactForm.errors = Object.values({ phone, email })
			.filter(Boolean)
			.join('; ');
	}
);

// Изменения в контактной форме
eventEmitter.on(
	/^contacts\..*:change/,
	(data: { field: keyof IContactsForm; value: string }) => {
		console.log('Contacts field changed:', data);
		applicationData.setContactsField(data.field, data.value);
	}
);

// Изменения в форме заказа
eventEmitter.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		console.log('Order field changed:', data);
		applicationData.setOrderField(data.field, data.value);
	}
);

// Выбор способа оплаты
eventEmitter.on('payment:change', (buttonElement: HTMLButtonElement) => {
	console.log('Payment method changed:', buttonElement.name);
	applicationData.setOrderPayment(buttonElement.name);
});

// Открытие формы заказа
eventEmitter.on('order:open', () => {
	console.log('Opening order form');
	modalWindow.render({
		content: orderForm.render({
			address: '',
			payment: 'card',
			valid: false,
			errors: [],
		}),
	});
});

// Отправка формы заказа
eventEmitter.on('order:submit', () => {
	console.log('Submitting order form');
	applicationData.order.total = applicationData.getTotal();
	modalWindow.render({
		content: contactForm.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

// Отправка контактной формы
eventEmitter.on('contacts:submit', () => {
	console.log('Submitting contacts form');
	apiService
		.submitOrder(applicationData.order)
		.then((response: IOrderResult) => {
			console.log('Order submitted:', applicationData.order);
			const successMessage = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modalWindow.close();
					applicationData.clearBasket();
					mainPage.counter = applicationData.basket.length;
				},
			});

			modalWindow.render({
				content: successMessage.render({
					total: applicationData.getTotal(),
				}),
			});
		})
		.catch((error: unknown) => {
			console.error(error);
		});
});

// Управление прокруткой
eventEmitter.on('modal:open', () => {
	console.log('Modal opened, locking page');
	mainPage.locked = true;
});

eventEmitter.on('modal:close', () => {
	console.log('Modal closed, unlocking page');
	mainPage.locked = false;
});

// Загрузка товаров
apiService
	.fetchProductList()
	.then(applicationData.setCatalog.bind(applicationData))
	.catch((error: unknown) => {
		console.error('Error fetching products:', error);
	});
