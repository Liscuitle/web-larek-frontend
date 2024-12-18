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
	ICombinedFormErrors,
	IFormState,
} from './types';

const eventEmitter = new EventEmitter();
const apiService = new LarekApi(CDN_URL, API_URL);

// Логирование всех событий
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

const successMessage = new Success(cloneTemplate(successTemplate), {
	onClick: () => {
		modalWindow.close();
	},
});

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
eventEmitter.on('preview:updated', ({ product }: { product: IProductItem }) => {
	console.log('Preview changed:', product);
	const inBasket = !!applicationData.basket.find(
		(item) => item.id === product.id
	);

	const previewCard = new CardPreview(cloneTemplate(previewCardTemplate), {
		onAdd: () => {
			if (!product.price || product.price <= 0) {
				alert('Этот товар нельзя добавить в корзину, у него нет цены.');
				return;
			}

			if (inBasket) {
				applicationData.removeProductFromBasket(product);
				// applicationData.removeFromOrder(product); // Удалить эту строку
			} else {
				// applicationData.addToOrder(product); // Удалить эту строку
				applicationData.addProductToBasket(product);
			}
			modalWindow.close();
		},
		onSelect: () => eventEmitter.emit('card:select', product),
	});

	const buttonText = inBasket ? 'Удалить из корзины' : 'В корзину';

	const renderedContent = modalWindow.render({
		content: previewCard.render({
			title: product.title,
			image: apiService.cdn + product.image,
			text: product.description,
			price: product.price || 0,
			category: product.category,
		}),
	});

	const button = renderedContent.querySelector(
		'.card__button'
	) as HTMLButtonElement | null;
	if (button) {
		button.textContent = buttonText;
		// Если товар бесценный - выключаем кнопку
		if (!product.price || product.price <= 0) {
			button.disabled = true;
			console.log(
				`Button for product "${product.title}" disabled due to no price.`
			);
		} else {
			button.disabled = false;
		}
	}
});

// Добавление в корзину
eventEmitter.on('card:add', (addedProduct: IProductItem) => {
	console.log('Adding product to basket:', addedProduct);
	if (!addedProduct.price || addedProduct.price <= 0) {
		alert('Этот товар нельзя добавить в корзину, у него нет цены.');
		return;
	}
	// applicationData.addToOrder(addedProduct); // Удалить эту строку
	applicationData.addProductToBasket(addedProduct);
	modalWindow.close();
});

// Обновление интерфейса при изменении корзины
eventEmitter.on('basket:updated', ({ basket }: { basket: IProductItem[] }) => {
	// Обновляем счётчик
	mainPage.counter = basket.length;
	console.log(`Basket updated. Number of items: ${basket.length}`);

	// Обновляем состояние корзины и кнопку оформления
	const isBasketEmpty = basket.length === 0;
	console.log(`Is basket empty: ${isBasketEmpty}`);
	shoppingBasket.setDisabled(shoppingBasket.checkoutButton, isBasketEmpty);
	shoppingBasket.total = applicationData.getTotal();
	console.log(`Total amount: ${shoppingBasket.total}`);

	let index = 1;
	shoppingBasket.items = basket.map((product: IProductItem) => {
		const basketItem = new CardBasket(cloneTemplate(basketCardTemplate), {
			onRemove: () => eventEmitter.emit('card:remove', product),
		});
		return basketItem.render({
			title: product.title,
			price: product.price || 0,
			index: index++,
		});
	});
});

// Открытие корзины
eventEmitter.on('basket:open', () => {
	console.log('Opening basket');
	modalWindow.render({ content: shoppingBasket.render() });
});

// Удаление товара из корзины
eventEmitter.on('card:remove', (removedProduct: IProductItem) => {
	console.log('Removing product from basket:', removedProduct);
	applicationData.removeProductFromBasket(removedProduct);
	// applicationData.removeFromOrder(removedProduct); // Удалить эту строку
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
	// applicationData.order.total = applicationData.getTotal(); // Удалить эту строку
	const order = applicationData.createOrder();
	if (!order) {
		alert(
			'Невозможно создать заказ. Проверьте заполнение формы и наличие товаров в корзине.'
		);
		return;
	}
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
	const order = applicationData.createOrder();

	if (!order) {
		alert(
			'Невозможно создать заказ. Проверьте заполнение формы и наличие товаров в корзине.'
		);
		return;
	}

	apiService
		.submitOrder(order)
		.then((response: IOrderResult) => {
			console.log('Order submitted:', order);
			const total = applicationData.getTotal();
			applicationData.clearBasket();
			modalWindow.render({
				content: successMessage.render({
					total: total,
				}),
			});
		})
		.catch((error: unknown) => {
			console.error(error);
			modalWindow.render({
				content: contactForm.render({
					email: applicationData.order.email || '',
					phone: applicationData.order.phone || '',
					valid: false,
					errors: [
						'Произошла ошибка при отправке, проверьте данные и попробуйте снова',
					],
				}),
			});
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
