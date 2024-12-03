# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и их типы, которые используются в приложении:

Тип продукта:
```
interface IProduct {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  price: number | null;
}
```

Элемент корзины
```
interface IBasketItem {
  product: IProduct;
  quantity: number;
}
```

Корзина
```
interface IBasket {
  items: IBasketItem[];
  total: number;
}
```

Данные пользователя
```
interface IUser {
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
}
```
Данные заказа
```
interface IOrderData {
  items: IBasketItem[];
  total: number;
  user: IUser;
}

```
Данные формы контактов
```
interface IContactFormData {
  email: string;
  phone: string;
}
```
Данные формы заказа
```
interface IOrderFormData {
  paymentMethod: string;
  address: string;
}
```

```
interface IOrderResult {
  orderId: string;
  status: string;
  message: string;
}
```


## Архитектура приложения
Код приложения разделен на слои согласно парадигме MVP:
- слой представления, отвечает за отображение данных на странице,
- слой данных, отвечает за хранение и изменение данных
- презентер, отвечает за связь представления и данных.

## Базовый код

## Класс Api
Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов. Методы:

- get - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- post - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется POST запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

## Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.
Основные методы, реализуемые классом описаны интерфейсом IEvents:

- on - подписка на событие
- emit - инициализация события
- trigger - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие

## Слой представления:

## Базовый Класс Component
Базовый класс Component
Назначение: Базовый класс для всех компонентов пользовательского интерфейса.
constructor(protected container: HTMLElement)
Методы:
render(data?: any): void: Метод для рендеринга компонента.
clear(): void: Очищает содержимое контейнера.

## Класс View
Расширяет Component, добавляя поддержку событий.
constructor(container: HTMLElement, protected events: EventEmitter)


## Компоненты представления

## Класс ProductCard
Отображает карточку товара и обрабатывает действия пользователя.

Методы:
render(product: IProduct): void: Отображает данные товара.
updateButtonState(isInBasket: boolean, isPriceless: boolean): void: Обновляет состояние кнопки "В корзину".
События:
Эмитирует 'product:selected' при выборе товара.
Эмитирует 'product:addToBasket' при добавлении товара в корзину.

## Класс BasketView
Отображает содержимое корзины и обрабатывает действия пользователя.

Методы:
render(basket: IBasket): void: Отображает товары в корзине.
toggleCheckoutButton(isEnabled: boolean): void: Включает/отключает кнопку оформления заказа.
События:
Эмитирует 'basket:removeItem' при удалении товара.
Эмитирует 'basket:checkout' при нажатии на кнопку оформления заказа.

## Класс OrderForm
Форма оформления заказа.

Методы:
render(data?: IOrderFormData): void: Отображает форму заказа.
validate(): boolean: Проверяет валидность введенных данных.
getData(): IOrderFormData: Возвращает данные формы.
События:
Эмитирует 'orderForm:submit' при отправке формы.

## Класс ContactForm
Форма ввода контактных данных.

Методы:
render(data?: IContactFormData): void: Отображает форму контактов.
validate(): boolean: Проверяет валидность введенных данных.
getData(): IContactFormData: Возвращает данные формы.
События:
Эмитирует 'contactForm:submit' при отправке формы.

## Класс SuccessView
Отображает сообщение об успешном оформлении заказа.

Методы:
render(message: string): void: Отображает сообщение об успехе.

## Класс MainPage
Управляет отображением главной страницы и каталога товаров.

Методы:
render(products: IProduct[]): void: Отображает список товаров.
updateBasketCounter(count: number): void: Обновляет счетчик товаров в корзине.
События:
Эмитирует 'basket:open' при нажатии на кнопку корзины.

## Класс Modal 
Управляет модальными окнами.

Методы:
open(content: HTMLElement): void: Открывает модальное окно.
close(): void: Закрывает модальное окно.
События:
Эмитирует 'modal:opened' и 'modal:closed'.

## Класс Form
Базовый класс для форм.

Методы:
render(data?: any): void: Метод для рендеринга формы.
validate(): boolean: Проверяет валидность формы.
getData(): any: Возвращает данные формы.

## Слой данных
## Класс ProductModel
Управляет данными товаров.

Методы:
async loadProducts(): Promise<void>: Загружает список товаров с сервера.
getProducts(): IProduct[]: Возвращает список товаров.
getProductById(id: string): IProduct | undefined: Возвращает товар по ID.
События:
Эмитирует 'products:loaded' после загрузки товаров.

## Класс BasketModel
Управляет данными корзины.

Поля:

private basket: IBasket — Текущая корзина.
Методы:

addToBasket(product: IProduct): void — Добавляет товар в корзину.
removeFromBasket(productId: string): void — Удаляет товар из корзины.
clearBasket(): void — Очищает корзину.
getBasket(): IBasket — Возвращает текущую корзину.
События:

Эмитирует 'basket:updated' при изменении корзины.

## Класс OrderModel
Поля:

private orderData: IOrderData — Данные текущего заказа.
Методы:

setOrderData(data: IOrderData): void — Устанавливает данные заказа.
validateOrder(): boolean — Проверяет валидность заказа.
async submitOrder(): Promise<void> — Отправляет заказ на сервер.
События:

Эмитирует 'order:validated' или 'order:invalid' после валидации.
Эмитирует 'order:submitted' после отправки заказа.

## Класс WebLarekApi 
Расширяет класс Api, предоставляя методы для работы с API проекта.
Конструктор:
constructor(baseUrl: string, cdnUrl: string, options?: RequestInit) — Принимает URL сервера, URL CDN для изображений и опции запросов.
Методы:

async getProductList(): Promise<IProduct[]>: Получает список товаров.
async getProduct(id: string): Promise<IProduct>: Получает товар по ID.
async createOrder(order: IOrderData): Promise<any>: Создает новый заказ.
getImageUrl(imagePath: string): string: Возвращает полный URL изображения.

## Презентер 
## Класс AppPresenter 
Отвечает за взаимодействие между моделями и представлениями, описывает логику приложения.

Поля:
productModel: ProductModel
basketModel: BasketModel
orderModel: OrderModel
mainPage: MainPage
modal: Modal

Методы обработки событий:

handleAddToBasket(product: IProduct): void — Обрабатывает добавление товара в корзину.
handleBasketUpdated(basket: IBasket): void — Обрабатывает обновление корзины.
handleOrderFormSubmitted(data: IOrderFormData): void — Обрабатывает отправку формы заказа.
handleContactFormSubmitted(data: IContactFormData): void — Обрабатывает отправку формы контактов.
handleOrderSubmitted(result: IOrderResult): void — Обрабатывает результат отправки заказа.
handleProductSelected(product: IProduct): void — Обрабатывает выбор товара для просмотра деталей.

## Взаимодействие компонентов и процессы в приложении
Основные события
События от моделей
'products:loaded' — После загрузки списка товаров (ProductModel).
'basket:updated' — При изменении корзины (BasketModel).
'order:validated' — При успешной валидации заказа (OrderModel).
'order:invalid' — При ошибке валидации заказа (OrderModel).
'order:submitted' — После успешной отправки заказа (OrderModel).
События от представлений
'product:selected' — При выборе товара (ProductCard).
'product:addToBasket' — При добавлении товара в корзину (ProductCard).
'basket:removeItem' — При удалении товара из корзины (BasketView).
'basket:checkout' — При переходе к оформлению заказа (BasketView).
'orderForm:submit' — При отправке формы заказа (OrderForm).
'contactForm:submit' — При отправке формы контактов (ContactForm).
'basket:open' — При открытии корзины (MainPage).
'modal:opened' и 'modal:closed' — При открытии/закрытии модального окна (Modal).