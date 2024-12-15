import { Success } from './components/common/Success';
import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL } from './utils/constants';
import { LarekApi } from './components/LarekApi';
import { cloneTemplate, ensureElement } from './utils/utils';
import { AppData, Product } from './components/AppData';
import { Page } from './components/Page';
import { Card, CardBasket, CardPreview } from './components/Card';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Order, Contacts } from './components/Order';
import { IOrderForm, IOrderResult } from './types';

const eventEmitter = new EventEmitter();
const apiService = new LarekApi(CDN_URL, API_URL);

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

// Инициализация состояния приложения
const applicationData = new AppData({}, eventEmitter);

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

// Обновление каталога товаров
eventEmitter.on('items:changed', () => {
	console.log('Updating catalog with:', applicationData.catalog);
	mainPage.catalog = applicationData.catalog.map((product) => {
		const productCard = new Card(cloneTemplate(catalogCardTemplate), {
			onSelect: () => eventEmitter.emit('card:select', product), // Обработчик выбора карточки
		});
		const rendered = productCard.render({
			title: product.title,
			category: product.category,
			image: apiService.cdn + product.image,
			price: product.price,
		});
		console.log('Rendered product:', rendered);
		return rendered;
	});
});

// Выбор карточки товара для просмотра
eventEmitter.on('card:select', (selectedProduct: Product) => {
	console.log('Selected product:', selectedProduct);
	applicationData.setPreview(selectedProduct);
});

// Обновление превью выбранного товара
eventEmitter.on('preview:changed', (selectedProduct: Product) => {
	console.log('Preview changed:', selectedProduct);
	const previewCard = new CardPreview(cloneTemplate(previewCardTemplate), {
		onAdd: () => eventEmitter.emit('card:add', selectedProduct), // Обработчик добавления в корзину
		onSelect: () => eventEmitter.emit('card:select', selectedProduct), // Обработчик выбора карточки из превью
	});

	modalWindow.render({
		content: previewCard.render({
			title: selectedProduct.title,
			image: apiService.cdn + selectedProduct.image,
			text: selectedProduct.description,
			price: selectedProduct.price,
			category: selectedProduct.category,
		}),
	});
});

// Добавление товара в корзину
eventEmitter.on('card:add', (addedProduct: Product) => {
	console.log('Adding product to basket:', addedProduct);
	applicationData.addToOrder(addedProduct);
	applicationData.addProductToBasket(addedProduct);
	mainPage.counter = applicationData.basket.length; // Обновляем счётчик
	modalWindow.close();
});

// Открытие корзины
eventEmitter.on('basket:open', () => {
	console.log('Opening basket');
	shoppingBasket.setDisabled(
		shoppingBasket.checkoutButton,
		applicationData.statusBasket
	);
	shoppingBasket.total = applicationData.getTotal(); // Обновляем сумму
	let index = 1;
	shoppingBasket.items = applicationData.basket.map((product) => {
		const basketItem = new CardBasket(cloneTemplate(basketCardTemplate), {
			onRemove: () => eventEmitter.emit('card:remove', product), // Обработчик удаления товара
		});
		return basketItem.render({
			title: product.title,
			price: product.price,
			index: index++,
		});
	});
	modalWindow.render({
		content: shoppingBasket.render(),
	});
});

// Удаление товара из корзины
eventEmitter.on('card:remove', (removedProduct: Product) => {
	console.log('Removing product from basket:', removedProduct);
	applicationData.removeProductFromBasket(removedProduct);
	applicationData.removeFromOrder(removedProduct);
	mainPage.counter = applicationData.basket.length; // Обновляем счётчик
	shoppingBasket.setDisabled(
		shoppingBasket.checkoutButton,
		applicationData.statusBasket
	);
	shoppingBasket.total = applicationData.getTotal(); // Обновляем сумму
	let index = 1;
	shoppingBasket.items = applicationData.basket.map((product) => {
		const basketItem = new CardBasket(cloneTemplate(basketCardTemplate), {
			onRemove: () => eventEmitter.emit('card:remove', product), // Обработчик удаления товара
		});
		return basketItem.render({
			title: product.title,
			price: product.price,
			index: index++,
		});
	});
	modalWindow.render({
		content: shoppingBasket.render(),
	});
});

// Обработка изменений валидации формы
eventEmitter.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	console.log('Form errors changed:', errors);
	const { email, phone, address, payment } = errors;
	orderForm.valid = !address && !payment; // Обновляем валидность формы заказа
	contactForm.valid = !email && !phone; // Обновляем валидность контактной формы
	orderForm.errors = Object.values({ address, payment })
		.filter(Boolean)
		.join('; ');
	contactForm.errors = Object.values({ phone, email })
		.filter(Boolean)
		.join('; ');
});

// Обработка изменений в контактной форме
eventEmitter.on(
	/^contacts\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		console.log('Contacts field changed:', data);
		applicationData.setContactsField(data.field, data.value); // Обновляем поле контактов
	}
);

// Обработка изменений в форме заказа
eventEmitter.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		console.log('Order field changed:', data);
		applicationData.setOrderField(data.field, data.value); // Обновляем поле заказа
	}
);

// Выбор способа оплаты
eventEmitter.on('payment:change', (buttonElement: HTMLButtonElement) => {
	console.log('Payment method changed:', buttonElement.name);
	applicationData.order.payment = buttonElement.name;
});

// Открытие окна заказа
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
	applicationData.order.total = applicationData.getTotal(); // Обновляем общую сумму заказа
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
		.submitOrder(applicationData.order) // Отправляем заказ на сервер
		.then((response: IOrderResult) => {
			console.log('Order submitted:', applicationData.order);
			const successMessage = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modalWindow.close();
					applicationData.clearBasket();
					mainPage.counter = applicationData.basket.length; // Сбрасываем счётчик
				},
			});

			modalWindow.render({
				content: successMessage.render({
					total: applicationData.getTotal(), // Показываем общую сумму
				}),
			});
		})
		.catch((error: unknown) => {
			console.error(error);
		});
});

// Управление прокруткой при открытии модального окна
eventEmitter.on('modal:open', () => {
	console.log('Modal opened, locking page');
	mainPage.locked = true; // Блокируем страницу
});

eventEmitter.on('modal:close', () => {
	console.log('Modal closed, unlocking page');
	mainPage.locked = false; // Разблокируем страницу
});

// Загрузка товаров с сервера
apiService
	.fetchProductList()
	.then(applicationData.setCatalog.bind(applicationData))
	.catch((error: unknown) => {
		console.error('Error fetching products:', error);
	});
