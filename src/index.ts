// src/index.ts
import './scss/styles.scss';
import { ensureElement, cloneTemplate } from './utils/utils';
import { IProductItem } from './types';
import { LarekApi } from './components/LarekApi';
import { API_URL, CDN_URL } from './utils/constants';

// Инициализация API
const api = new LarekApi(CDN_URL, API_URL);

// Логирование переменных окружения для проверки
console.log('API_ORIGIN:', process.env.API_ORIGIN);
console.log('API_URL:', API_URL);
console.log('CDN_URL:', CDN_URL);

// Асинхронная функция для инициализации приложения
async function init() {
	try {
		// Получаем список товаров с сервера
		const products = await api.getProductList();
		// Отрисовываем полученные товары на странице
		renderCatalog(products);
	} catch (error) {
		console.error('Ошибка при загрузке товаров:', error);
		const gallery = ensureElement<HTMLElement>('.gallery');
		const errorMessage = document.createElement('div');
		errorMessage.textContent = 'Не удалось загрузить товары. Попробуйте позже.';
		errorMessage.style.color = 'red';
		gallery.appendChild(errorMessage);
	}
}

// Запускаем асинхронную функцию инициализации
init();

// Функция для отрисовки карточек товаров
function renderCatalog(products: IProductItem[]) {
	// Находим контейнер для карточек
	const gallery = ensureElement<HTMLElement>('.gallery');

	products.forEach((product) => {
		// Клонируем шаблон карточки
		const cardEl = cloneTemplate<HTMLElement>('#card-catalog');

		// Получаем элементы внутри карточки
		const categoryEl = cardEl.querySelector('.card__category') as HTMLElement;
		const titleEl = cardEl.querySelector('.card__title') as HTMLElement;
		const imageEl = cardEl.querySelector('.card__image') as HTMLImageElement;
		const priceEl = cardEl.querySelector('.card__price') as HTMLElement;

		// Заполняем данные товара в карточку
		if (categoryEl) categoryEl.textContent = product.category;
		if (titleEl) titleEl.textContent = product.title;
		if (imageEl && product.image) {
			imageEl.src = `${CDN_URL}${product.image}`; // Формируем полный URL изображения
			imageEl.alt = product.title;
		}
		if (priceEl) {
			priceEl.textContent = product.price
				? `${product.price} синапсов`
				: 'Бесценно';
		}

		// Добавляем готовую карточку в контейнер на странице
		gallery.appendChild(cardEl);
	});
}
