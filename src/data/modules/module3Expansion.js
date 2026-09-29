// Дополнительные уроки модуля ООП. Каждый пример выполняется чистым Python.
const lesson = ({ id, title, summary, goal, intro, analogy, steps, code, explanation, practice, tasks, mistakes, checklist, bridge }) => ({
  id, title, summary,
  theory: [
    { type: 'p', text: `После урока ты сможешь ${goal}. ${intro}` },
    { type: 'analogy', text: analogy },
    { type: 'steps', title: 'Собираем пример по шагам', items: steps.map(([code, note]) => ({ code, note })) },
    { type: 'p', text: explanation },
    { type: 'callout', variant: 'info', title: 'Связь с курсом', text: bridge },
  ],
  example: { title: 'Рабочий пример', lang: 'python', code, explanation: practice },
  sandbox: { description: practice, initialCode: code },
  tasks: tasks.map(([title, description, hint, solution], index) => ({
    title, description, difficulty: ['easy', 'medium', 'hard'][index],
    hints: [hint, 'Запусти небольшой пример и сравни ожидаемое значение с фактическим.'],
    ...(solution ? { solution } : {}),
  })),
  mistakes: mistakes.map(([wrong, right]) => ({ wrong, right })),
  checklist,
});

export const oopIntro = lesson({
  id: 'why-oop', title: 'Зачем нужно ООП', summary: 'От словаря и функции к объекту, который хранит данные и действия',
  goal: 'выбрать между словарём с функцией и классом для простой задачи',
  intro: 'В модуле 2 ты уже складывал данные в словарь и передавал его в функцию. Это хороший способ для маленькой задачи. Когда одни и те же данные и действия повторяются для многих пользователей, удобно собрать их вместе. Такой способ организации программы называют объектно-ориентированным программированием (ООП).',
  analogy: 'Карточка клиента в мастерской хранит имя и число визитов. Сотрудник каждый раз берёт карточку, чтобы добавить визит. Объект похож на карточку, к которой прикрепили кнопку «добавить визит»: данные и действие рядом.',
  steps: [
    ['user = {"name": "Аня", "visits": 0}', 'Знакомый словарь хранит данные одного пользователя.'],
    ['def visit(user): user["visits"] += 1', 'Функция получает словарь отдельно и меняет его.'],
    ['class User:', 'Класс описывает общий шаблон для многих пользователей.'],
    ['    def visit(self): self.visits += 1', 'Метод работает с данными конкретного пользователя; self разберём в следующем уроке.'],
  ],
  code: `user = {"name": "Аня", "visits": 0}
def visit(data):
    data["visits"] += 1
visit(user)
print(user["visits"])

class User:
    def __init__(self, name):
        self.name = name
        self.visits = 0
    def visit(self):
        self.visits += 1

anya = User("Аня")
anya.visit()
print(anya.visits)`,
  explanation: 'Оба варианта выводят 1. Класс не делает программу автоматически лучше: он полезен, когда для многих сущностей повторяются связанные данные и действия.',
  practice: 'Добавь второго пользователя и проверь, что его visits остаётся 0. В backend такие объекты могут представлять пользователя или заказ.',
  tasks: [
    ['Узнай данные', 'Назови два поля словаря user и действие функции visit.', 'Посмотри на ключи словаря и строку внутри visit.'],
    ['Два пользователя', 'Создай объект Boris, вызови visit только для Ани. Выведи оба счётчика.', 'Каждый вызов User("имя") создаёт отдельный объект.'],
    ['Выбери подход', 'Напиши с нуля класс Ticket с номером и методом close(), который ставит closed=True. Создай два билета и закрой один.', 'В __init__ сохрани number и начальное closed=False.', `class Ticket:
    def __init__(self, number):
        self.number = number
        self.closed = False
    def close(self):
        self.closed = True

first = Ticket(1)
second = Ticket(2)
first.close()
print(first.closed, second.closed)`],
  ],
  mistakes: [
    ['«ООП нужно для любой программы»', 'Для одного небольшого словаря и функции класс может лишь усложнить код. Выбирай его по задаче.'],
    ['visit(user) и user.visit() — одно и то же написание', 'Первое вызывает отдельную функцию, второе — метод объекта. Результат может быть одинаковым.'],
  ],
  checklist: ['Могу назвать данные и действие в примере', 'Понимаю, зачем рядом хранить данные и методы', 'Создал два независимых объекта', 'Могу объяснить, когда словаря достаточно'],
  bridge: 'Словари и функции уже знакомы из модуля 2. Дальше разберём, как создаются класс и объект.',
});

export const oopInit = lesson({
  id: 'init-self-instance', title: '__init__, self и данные каждого объекта', summary: 'Разбираем создание объекта без скрытых шагов',
  goal: 'создать два объекта с независимыми атрибутами и объяснить роль self',
  intro: 'Класс из прошлого урока был шаблоном. Теперь проследим создание каждого экземпляра: так называют отдельный объект класса. Python вызывает __init__ при создании и передаёт туда сам новый объект как self.',
  analogy: 'В типографии один бланк заказа заполняют для разных клиентов. __init__ — момент заполнения, self — именно тот лист, который сейчас в руках; имя на одном листе не меняет другой.',
  steps: [
    ['class Order:', 'Объявляем шаблон заказа.'],
    ['    def __init__(self, number, status="new"):', 'При создании нужны номер и необязательный статус. self Python передаст сам.'],
    ['        self.number = number', 'Записываем номер внутрь текущего объекта.'],
    ['first = Order(101)', 'Параметр number получает 101, status — значение по умолчанию.'],
  ],
  code: `class Order:
    def __init__(self, number, status="new"):
        self.number = number
        self.status = status

first = Order(101)
second = Order(102, "paid")
first.status = "sent"
print(first.number, first.status)
print(second.number, second.status)`,
  explanation: 'first и second независимы: изменение first.status не меняет second.status. Атрибут экземпляра появляется при присваивании через self.',
  practice: 'Поменяй статус второго заказа и сравни вывод. Заказ здесь — простая модель данных будущего backend-приложения.',
  tasks: [
    ['Новый атрибут', 'Добавь в Order атрибут customer, передаваемый при создании.', 'Добавь параметр и строку self.customer = customer.'],
    ['Прочти код', 'Не запуская код, объясни вывод: a=Order(1); b=Order(2); a.status="paid"; print(b.status). Затем проверь.', 'Подумай, какой объект меняется в присваивании.'],
    ['С нуля: Profile', 'Создай Profile(name, city="София"), два объекта с разными городами и выведи их. Объясни, почему значения независимы.', 'Внутри __init__ присвой оба параметра через self.', `class Profile:
    def __init__(self, name, city="София"):
        self.name = name
        self.city = city

one = Profile("Аня")
two = Profile("Борис", "Пловдив")
print(one.name, one.city)
print(two.name, two.city)`],
  ],
  mistakes: [
    ['Order.__init__(101)', 'Обычно создавай объект как Order(101): Python сам создаёт объект и вызывает __init__.'],
    ['number = number внутри __init__', 'Так меняется лишь локальное имя. self.number = number сохраняет значение в объекте.'],
  ],
  checklist: ['Создаю экземпляр через имя класса', 'Объясняю вызов __init__', 'Различаю self.number и параметр number', 'Проверяю независимость двух объектов'],
  bridge: 'В прошлом уроке увидели пользу класса. Дальше добавим методы, меняющие состояние заказа.',
});

export const oopClassAttributes = lesson({
  id: 'class-attributes', title: 'Атрибуты класса и экземпляра', summary: 'Общие настройки класса и личные данные объекта',
  goal: 'разместить общую настройку на классе, а изменяемые данные — на экземпляре',
  intro: 'Атрибут экземпляра создаётся через self и принадлежит одному объекту. Атрибут класса объявляют в теле класса: его читают все объекты. Это подходит для общего неизменяемого правила.',
  analogy: 'У всех читательских билетов один срок действия по правилам библиотеки, но у каждого билета своё имя владельца. Срок — общий атрибут класса, имя — атрибут экземпляра.',
  steps: [
    ['class Product:', 'Шаблон товара.'],
    ['    currency = "₽"', 'Общее значение задано прямо в классе.'],
    ['    def __init__(self, name, price):', 'Цена и название будут отдельными у каждого товара.'],
    ['        self.price = price', 'Записываем личную цену экземпляра.'],
  ],
  code: `class Product:
    currency = "₽"
    def __init__(self, name, price):
        self.name = name
        self.price = price

book = Product("Книга", 500)
pen = Product("Ручка", 50)
print(book.name, book.price, book.currency)
print(pen.name, pen.price, Product.currency)`,
  explanation: 'Product.currency и book.currency читают общее значение. book.price и pen.price различаются. Если присвоить book.currency, появится личный атрибут, скрывающий общее значение только у book.',
  practice: 'Добавь общий атрибут shop_name и выведи его через класс и два товара.',
  tasks: [
    ['Общее правило', 'Добавь Product.tax_rate = 0.2 и выведи через Product.', 'Строка с tax_rate стоит на одном уровне с def __init__.'],
    ['Предскажи вывод', 'Выполни book.currency="€" и объясни значения book.currency, pen.currency, Product.currency.', 'Присваивание через book создаёт значение лишь на book.'],
    ['Найди ошибку', 'В классе Cart список items=[] объявлен в теле класса. Два объекта делят товары. Исправь, чтобы каждый имел свой список.', 'Создавай self.items = [] внутри __init__.', `class Cart:
    def __init__(self):
        self.items = []

first = Cart()
second = Cart()
first.items.append("Книга")
print(first.items, second.items)`],
  ],
  mistakes: [
    ['items = [] в теле класса для личной корзины', 'Список станет общим и изменения будут видны всем. Создай self.items = [] в __init__.'],
    ['book.currency = "€" как способ сменить общее правило', 'Так создаётся атрибут конкретного объекта. Общее значение меняют через Product.currency.'],
  ],
  checklist: ['Различаю атрибут класса и экземпляра', 'Читаю общее значение через имя класса', 'Не храню общий изменяемый список для личных данных', 'Могу предсказать скрытие атрибута класса'],
  bridge: 'После методов и личного состояния узнаём общие настройки. Дальше обсудим, как защищать состояние от случайных изменений.',
});

export const oopEncapsulation = lesson({
  id: 'encapsulation', title: 'Инкапсуляция без мистики', summary: 'Публичные данные, соглашение _name и имя __name',
  goal: 'выбрать понятный публичный интерфейс класса и объяснить смысл подчёркиваний',
  intro: 'Инкапсуляция означает: объект сам отвечает за свои данные и предлагает понятные действия для работы с ними. В Python одинарное подчёркивание _balance — соглашение «внутренняя деталь». Двойное __balance меняет внутреннее имя, чтобы случайно не столкнулись имена в наследниках; абсолютной защитой оно не служит.',
  analogy: 'У банкомата есть экран и кнопки для клиента, а механизм внутри корпуса. Кнопка «пополнить» — публичный интерфейс. Пометка _balance напоминает табличку «служебное»: технически посмотреть можно, но пользоваться извне не следует.',
  steps: [
    ['class Wallet:', 'Кошелёк управляет балансом.'],
    ['    def __init__(self): self._balance = 0', 'Внутреннее значение помечено одним подчёркиванием.'],
    ['    def deposit(self, amount):', 'Публичный метод принимает запрос на изменение.'],
    ['        if amount > 0: self._balance += amount', 'Правило не позволяет добавить отрицательную сумму.'],
  ],
  code: `class Wallet:
    def __init__(self):
        self._balance = 0
    def deposit(self, amount):
        if amount <= 0:
            return False
        self._balance += amount
        return True
    def get_balance(self):
        return self._balance

wallet = Wallet()
print(wallet.deposit(100))
print(wallet.deposit(-20))
print(wallet.get_balance())`,
  explanation: 'Метод deposit контролирует изменение. get_balance — простой геттер, возвращающий значение. Сеттер был бы методом для изменения значения с проверкой. В следующем уроке property даст такой доступ с привычным синтаксисом точки.',
  practice: 'Попробуй вызвать deposit(0). Объясни, почему результат False, а баланс прежний. Это правило пригодится для кошелька пользователя в backend.',
  tasks: [
    ['Добавь чтение', 'Добавь метод get_balance() в собственный класс Wallet и выведи баланс.', 'Метод возвращает self._balance.'],
    ['Сеттер с правилом', 'Создай set_balance(value), который меняет баланс только при value >= 0 и возвращает True или False.', 'Проверяй условие до присваивания.'],
    ['Разбери чужой код', 'Объясни, что произойдёт после w.__balance=50, если в __init__ задан self.__balance=0. Проверь вывод внутреннего геттера.', 'Двойное подчёркивание меняет внутреннее имя; внешнее присваивание создаёт другое поле.', `class Wallet:
    def __init__(self):
        self.__balance = 0
    def get_balance(self):
        return self.__balance
w = Wallet()
w.__balance = 50
print(w.get_balance())
print(w.__balance)`],
  ],
  mistakes: [
    ['_balance абсолютно приватен', 'Одно подчёркивание — договорённость разработчиков, а не запрет языка.'],
    ['__balance — безопасное хранилище секрета', 'Двойное подчёркивание лишь меняет имя атрибута. Пароли и секреты так не защищают.'],
  ],
  checklist: ['Объясняю публичный метод и внутреннее поле', 'Понимаю смысл одного подчёркивания', 'Не считаю двойное подчёркивание защитой секрета', 'Пишу метод изменения с проверкой'],
  bridge: 'Мы научились управлять изменением состояния. Дальше сохраним проверку, но сделаем чтение и присваивание удобнее через property.',
});

export const oopProperty = lesson({
  id: 'oop-property', title: '@property: проверка при присваивании', summary: 'Удобный доступ к значению с правилом внутри класса',
  goal: 'создать свойство с проверкой значения и проверить ошибочный ввод',
  intro: 'Геттер get_price() работает, но для чтения хочется писать product.price. Декоратор @property делает метод доступным как атрибут. Декоратор — запись над функцией, меняющая способ её вызова. @price.setter запускается при присваивании product.price = число.',
  analogy: 'Турникет выглядит как обычный вход, но каждый проход проверяет билет. Свойство выглядит как обычный атрибут, но при записи проверяет цену.',
  steps: [
    ['@property', 'Следующий метод будет читаться без скобок.'],
    ['def price(self): return self._price', 'Читаем внутреннее значение.'],
    ['@price.setter', 'Этот метод вызывается при присваивании price.'],
    ['if value < 0: raise ValueError("Цена отрицательна")', 'Неправильное значение отклоняем понятной ошибкой.'],
  ],
  code: `class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    @property
    def price(self):
        return self._price
    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("Цена не может быть отрицательной")
        self._price = value

book = Product("Книга", 500)
book.price = 450
print(book.name, book.price)
try:
    book.price = -1
except ValueError as error:
    print(error)
print(book.price)`,
  explanation: 'В __init__ используется self.price, поэтому начальная цена тоже проходит проверку. Внутри сеттера пишем self._price: присваивание self.price вызвало бы тот же сеттер снова и снова. try/except позволяет показать ошибку и продолжить пример.',
  practice: 'Измени начальную цену на -5 и посмотри на ValueError. Затем восстанови цену и проверь присваивание.',
  tasks: [
    ['Свойство чтения', 'Сделай User с внутренним _name и @property name без сеттера.', 'Метод name возвращает self._name.'],
    ['Проверка возраста', 'Добавь к User свойство age, отклоняющее отрицательное значение через ValueError.', 'В __init__ присваивай self.age = age.'],
    ['Исправь рекурсию', 'В сеттере price написано self.price = value. Исправь и объясни причину ошибки.', 'Присвой значение внутреннему атрибуту с другим именем.', `class Product:
    def __init__(self, price):
        self.price = price
    @property
    def price(self):
        return self._price
    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("Цена отрицательна")
        self._price = value
print(Product(10).price)`],
  ],
  mistakes: [
    ['self.price = value внутри сеттера price', 'Это снова вызовет сеттер и приведёт к бесконечным вызовам. Сохраняй в self._price.'],
    ['self._price = price в __init__ при обязательной проверке', 'Так проверка сеттера пропускается. Присваивай self.price = price.'],
  ],
  checklist: ['Читаю @property без скобок', 'Пишу сеттер с проверкой', 'Использую отдельный внутренний атрибут', 'Проверил плохое значение и неизменность старого'],
  bridge: 'После инкапсуляции свойство даёт удобный интерфейс. Следом вернёмся к наследованию и повторному использованию поведения.',
});

export const oopPolymorphism = lesson({
  id: 'polymorphism-duck-typing', title: 'Полиморфизм и duck typing', summary: 'Один вызов для объектов с разным поведением',
  goal: 'обработать разные объекты одним циклом через общий метод',
  intro: 'Полиморфизм означает, что один вызов метода может давать разное поведение у разных объектов. Наследование из прошлого урока — один способ. В Python часто достаточно, чтобы объект имел нужный метод; это называют duck typing: нас интересует, что объект умеет делать, а не его происхождение.',
  analogy: 'Касса принимает карту разных банков: кассиру важен ответ на запрос «оплатить», а не цвет карты и не история банка.',
  steps: [
    ['class CardPayment:', 'Первый способ оплаты.'],
    ['    def pay(self, amount): return f"Карта: {amount}"', 'У него есть метод pay.'],
    ['class CashPayment:', 'Другой класс, без общего родителя.'],
    ['for method in methods: print(method.pay(100))', 'Один цикл вызывает общий по имени метод.'],
  ],
  code: `class CardPayment:
    def pay(self, amount):
        return f"Карта: {amount}"

class CashPayment:
    def pay(self, amount):
        return f"Наличные: {amount}"

methods = [CardPayment(), CashPayment()]
for method in methods:
    print(method.pay(100))`,
  explanation: 'Классы не связаны наследованием, но оба реализуют pay(amount). Код заказа может вызвать pay, не проверяя тип каждого платежа. Это снижает число веток if.',
  practice: 'Добавь BonusPayment с тем же методом и убедись, что цикл менять не нужно.',
  tasks: [
    ['Третий способ', 'Добавь BonusPayment.pay(amount) с выводом «Бонусы: сумма».', 'Достаточно метода с тем же именем и параметром.'],
    ['Объясни вывод', 'Почему в цикле появляются две разные строки, хотя выражение method.pay(100) одно?', 'Смотри на класс конкретного объекта в очередной итерации.'],
    ['Новая доставка', 'С нуля напиши EmailDelivery и SmsDelivery с методом send(message), затем вызови send для списка из двух объектов.', 'Создай два независимых класса с одинаковым именем метода.', `class EmailDelivery:
    def send(self, message):
        return f"Email: {message}"
class SmsDelivery:
    def send(self, message):
        return f"SMS: {message}"
for delivery in [EmailDelivery(), SmsDelivery()]:
    print(delivery.send("Заказ готов"))`],
  ],
  mistakes: [
    ['if type(method) == CardPayment для каждого вызова', 'Если каждый объект имеет pay, вызови method.pay(amount) и дай объекту самому выбрать поведение.'],
    ['У одного класса метод payment(), у другого pay()', 'Общий цикл ожидает одинаковое имя и совместимые параметры метода.'],
  ],
  checklist: ['Объясняю один вызов с разными результатами', 'Добавил третий класс без правки цикла', 'Понимаю правило duck typing', 'Проверяю имя и параметры общего метода'],
  bridge: 'Наследование показало общий родительский класс. Здесь общий метод работает даже без родителя. Далее объединим объекты в один составной объект.',
});

export const oopComposition = lesson({
  id: 'composition-vs-inheritance', title: 'Композиция: объект содержит другой объект', summary: '«Имеет» против «является»',
  goal: 'собрать заказ из товаров и выбрать композицию вместо неверного наследования',
  intro: 'Наследование подходит, когда один объект является разновидностью другого: ExpressOrder — разновидность Order. Композиция подходит, когда объект содержит другие объекты: заказ имеет товары. Она позволяет собирать программу из маленьких частей.',
  analogy: 'Автомобиль имеет двигатель, но не является двигателем. Поэтому «автомобиль содержит двигатель» понятнее, чем «автомобиль наследуется от двигателя».',
  steps: [
    ['class Product:', 'Товар хранит название и цену.'],
    ['class Order:', 'Заказ — другая сущность, не разновидность товара.'],
    ['    def __init__(self): self.items = []', 'Каждый заказ получает свой список товаров.'],
    ['    def add(self, product): self.items.append(product)', 'Метод принимает объект Product и сохраняет его.'],
  ],
  code: `class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

class Order:
    def __init__(self):
        self.items = []
    def add(self, product):
        self.items.append(product)
    def total(self):
        return sum(product.price for product in self.items)

order = Order()
order.add(Product("Книга", 500))
order.add(Product("Ручка", 50))
print(len(order.items), order.total())`,
  explanation: 'Order не наследуется от Product: заказ не является товаром. Генератор внутри sum проходит по товарам и берёт их price; это короткая форма знакомого цикла накопления суммы.',
  practice: 'Добавь третий товар. Затем создай второй заказ и убедись, что товары первого туда не попали.',
  tasks: [
    ['Выбери связь', 'Объясни, почему User и Address обычно связывают через поле user.address, а не наследование.', 'Спроси: пользователь является адресом или имеет адрес?'],
    ['Второй заказ', 'Создай два Order, добавь товар только в первый. Выведи обе суммы.', 'Список создаётся внутри __init__ каждого заказа.'],
    ['С нуля: библиотека', 'Напиши Book(title) и Shelf, которая хранит список книг и умеет add(book), count().', 'Shelf содержит Book; создай self.books = [] в __init__.', `class Book:
    def __init__(self, title):
        self.title = title
class Shelf:
    def __init__(self):
        self.books = []
    def add(self, book):
        self.books.append(book)
    def count(self):
        return len(self.books)
shelf = Shelf()
shelf.add(Book("Python"))
print(shelf.count())`],
  ],
  mistakes: [
    ['class Order(Product)', 'Заказ содержит товары, но не является товаром. Сделай отдельный класс с полем items.'],
    ['items = [] в теле Order', 'Так список будет общим для всех заказов. Создавай self.items внутри __init__.'],
  ],
  checklist: ['Различаю «является» и «имеет»', 'Собрал Order из объектов Product', 'Проверил независимость двух заказов', 'Умею объяснить выбор композиции'],
  bridge: 'Теперь у нас несколько взаимодействующих классов. Следующий урок покажет, как сделать их удобнее для print, len и сравнения.',
});

export const oopMagic = lesson({
  id: 'magic-methods', title: 'Специальные методы', summary: '__str__, __repr__, __len__ и __eq__ без магии',
  goal: 'объяснить, какие специальные методы вызываются print, repr, len и ==',
  intro: 'Python сам вызывает методы с двойными подчёркиваниями при обычных действиях. Это протокол: договорённость об имени и результате. __str__ даёт текст для человека, __repr__ — полезное представление для разработчика, __len__ — длину, __eq__ — сравнение значений.',
  analogy: 'В анкете разные поля для покупателя и сотрудника: короткое название товара для покупателя и подробная запись для склада. Один товар, разные представления.',
  steps: [
    ['def __str__(self): return self.name', 'print(product) использует эту строку.'],
    ['def __repr__(self): return f"Product({self.name!r}, {self.price})"', 'repr(product) показывает данные для отладки. !r добавляет кавычки строке.'],
    ['def __eq__(self, other):', 'Оператор == вызывает этот метод.'],
    ['return isinstance(other, Product) and self.name == other.name', 'Сравниваем понятное поле только у совместимого объекта.'],
  ],
  code: `class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def __str__(self):
        return self.name
    def __repr__(self):
        return f"Product({self.name!r}, {self.price})"
    def __eq__(self, other):
        if not isinstance(other, Product):
            return NotImplemented
        return self.name == other.name and self.price == other.price

class Cart:
    def __init__(self):
        self.items = []
    def __len__(self):
        return len(self.items)

first = Product("Книга", 500)
print(first)
print(repr(first))
print(first == Product("Книга", 500))
cart = Cart()
cart.items.append(first)
print(len(cart))`,
  explanation: 'NotImplemented сообщает Python, что сравнение с чужим типом этот метод не умеет делать. Обычно итогом такого сравнения будет False. __len__ должен вернуть целое неотрицательное число.',
  practice: 'Поменяй цену второго товара и сравни снова. Добавь товар в корзину и проверь len.',
  tasks: [
    ['Красивый вывод', 'Добавь __str__ в Book, чтобы print(book) показывал заголовок.', 'Метод должен вернуть строку.'],
    ['Длина полки', 'Сделай Shelf с books и __len__; проверь len(shelf) до и после добавления книги.', 'Верни len(self.books).'],
    ['Сравнение', 'Создай Money(amount) с __eq__ по amount и проверкой типа; сравни две суммы и сумму со строкой.', 'Для другого класса верни NotImplemented.', `class Money:
    def __init__(self, amount):
        self.amount = amount
    def __eq__(self, other):
        if not isinstance(other, Money):
            return NotImplemented
        return self.amount == other.amount
print(Money(5) == Money(5))
print(Money(5) == "5")`],
  ],
  mistakes: [
    ['def __str__(self): print(self.name)', '__str__ обязан вернуть строку, а print возвращает None.'],
    ['def __len__(self): return "2"', '__len__ должен вернуть неотрицательное целое число, а не строку.'],
    ['self.name == other.name без проверки other', 'У чужого объекта может не быть name. Сначала проверь тип или верни NotImplemented.'],
  ],
  checklist: ['Вывожу объект через __str__', 'Вижу полезный repr', 'Получаю длину через __len__', 'Сравниваю значения через __eq__', 'Проверяю чужой тип'],
  bridge: 'Композиция дала корзину с товарами. Теперь стандартные операции Python умеют работать с нашими объектами. Далее изучим методы, которые вызывают через сам класс.',
});

export const oopClassMethods = lesson({
  id: 'class-static-methods', title: '@classmethod и @staticmethod', summary: 'Альтернативное создание объекта и вспомогательная функция',
  goal: 'написать альтернативный конструктор и отличить три вида методов',
  intro: 'Обычный метод получает self — конкретный объект. Метод с @classmethod получает cls — сам класс; его удобно использовать как другой способ создать объект. @staticmethod не получает ни self, ни cls: это функция, логически относящаяся к классу.',
  analogy: 'Обычный метод — сотрудник работает с конкретным заказом. Метод класса — мастерская выпускает новый заказ по номеру квитанции. Статический метод — таблица правил, которой можно пользоваться без заказа.',
  steps: [
    ['@classmethod', 'Следующий метод вызовем через имя класса.'],
    ['def from_text(cls, text):', 'cls — класс, на котором вызван метод.'],
    ['name, price = text.split(":")', 'Разделяем строку формата имя:цена.'],
    ['return cls(name, int(price))', 'Создаём объект, превращая цену в число.'],
  ],
  code: `class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    @classmethod
    def from_text(cls, text):
        name, price = text.split(":")
        return cls(name, int(price))
    @staticmethod
    def is_valid_price(price):
        return price >= 0

book = Product.from_text("Книга:500")
print(book.name, book.price)
print(Product.is_valid_price(book.price))`,
  explanation: 'from_text — альтернативный конструктор: данные пришли строкой, а на выходе объект Product. staticmethod подходит для проверки цены, потому что ей не нужны данные ни объекта, ни класса. Не каждую функцию нужно помещать в класс.',
  practice: 'Замени строку на «Ручка:30». Попробуй отрицательную цену в is_valid_price и объясни результат.',
  tasks: [
    ['Вызов метода класса', 'Создай Product.from_text("Тетрадь:80") и выведи цену.', 'Передавай строку с одним двоеточием.'],
    ['Статическая проверка', 'Добавь @staticmethod is_valid_name(name), возвращающий True для непустой строки.', 'Для строки подойдёт сравнение name != "".'],
    ['Альтернативный конструктор', 'Создай User(name, active) и User.guest(name), где guest возвращает User с active=False.', 'Метод guest получает cls и возвращает cls(name, False).', `class User:
    def __init__(self, name, active):
        self.name = name
        self.active = active
    @classmethod
    def guest(cls, name):
        return cls(name, False)

visitor = User.guest("Аня")
print(visitor.name, visitor.active)`],
  ],
  mistakes: [
    ['def from_text(self, text) под @classmethod', 'Первый параметр метода класса — cls, потому что Python передаёт сам класс.'],
    ['return Product(...) при возможности наследования', 'return cls(...) сохранит тип дочернего класса при вызове через него.'],
  ],
  checklist: ['Различаю self и cls', 'Создал объект через from_text', 'Написал статическую проверку', 'Могу выбрать обычную функцию вместо staticmethod'],
  bridge: 'После специальных методов рассматриваем способы создания и проверки объектов. Дальше зададим обязательный общий метод для группы классов.',
});

export const oopAbc = lesson({
  id: 'abstract-base-classes', title: 'ABC: общий договор для классов', summary: 'Обязательный метод через ABC и abstractmethod',
  goal: 'задать абстрактный метод и реализовать его в дочерних классах',
  intro: 'Duck typing из прошлого урока гибок, но ошибку в имени метода можно заметить только при вызове. ABC — абстрактный базовый класс, который объявляет обязательные методы. @abstractmethod помечает метод как обязательный; создать дочерний объект без реализации нельзя.',
  analogy: 'Договор доставки требует от каждой службы отвечать на вопрос «сколько стоит?». Службы считают по-разному, но если служба вообще не указала цену, её нельзя подключить.',
  steps: [
    ['from abc import ABC, abstractmethod', 'Импортируем инструменты стандартной библиотеки.'],
    ['class Delivery(ABC):', 'Создаём общий договор.'],
    ['    @abstractmethod', 'Следующий метод обязателен у потомков.'],
    ['    def cost(self): pass', 'Здесь нет расчёта; его напишет конкретная доставка.'],
  ],
  code: `from abc import ABC, abstractmethod

class Delivery(ABC):
    @abstractmethod
    def cost(self):
        pass

class Pickup(Delivery):
    def cost(self):
        return 0

class Courier(Delivery):
    def cost(self):
        return 250

for delivery in [Pickup(), Courier()]:
    print(delivery.cost())`,
  explanation: 'Delivery() создать нельзя: cost не реализован. Pickup и Courier выполняют договор и допускают полиморфный вызов в одном цикле. Это знакомое наследование с проверкой обязательного метода.',
  practice: 'Добавь PostalDelivery с cost() = 120. Затем временно убери cost и посмотри на ошибку при создании.',
  tasks: [
    ['Новая доставка', 'Реализуй PostalDelivery(Delivery) с cost() = 120.', 'У метода должно быть точное имя cost.'],
    ['Объясни ошибку', 'Почему класс EmptyDelivery(Delivery) без cost нельзя создать? Проверь в песочнице.', 'Наследуется обязательное требование abstractmethod.'],
    ['Договор оплаты', 'С нуля создай Payment(ABC) с абстрактным pay(amount), затем CashPayment с реализацией, возвращающей сумму.', 'Импортируй ABC и abstractmethod; переопредели pay.', `from abc import ABC, abstractmethod
class Payment(ABC):
    @abstractmethod
    def pay(self, amount):
        pass
class CashPayment(Payment):
    def pay(self, amount):
        return amount
print(CashPayment().pay(100))`],
  ],
  mistakes: [
    ['class Delivery: с @abstractmethod, но без ABC', 'Чтобы запретить создание неполного потомка, наследуй ABC.'],
    ['def costs(self) вместо cost', 'Название должно совпадать с договором; иначе абстрактный cost остаётся нереализованным.'],
  ],
  checklist: ['Импортирую ABC и abstractmethod', 'Объясняю назначение обязательного метода', 'Реализовал два разных cost', 'Проверил ошибку неполного потомка'],
  bridge: 'Полиморфизм и наследование уже знакомы. ABC добавляет проверяемый договор. Последний урок соединит эти идеи в одном заказе.',
});

export const oopProject = lesson({
  id: 'oop-cart-project', title: 'Мини-проект: корзина и заказ', summary: 'Соединяем классы, композицию, property и разные способы доставки',
  goal: 'самостоятельно собрать небольшую модель заказа из нескольких классов',
  intro: 'В реальном backend заказ состоит из товаров и правил доставки. Твоя задача — собрать модель без HTTP и базы данных: их курс объяснит позже. Здесь важны связи между объектами и проверяемое поведение.',
  analogy: 'Корзина в магазине содержит товары; кассир считает сумму; служба доставки добавляет свою цену. Каждый отвечает за свою часть, а заказ соединяет их.',
  steps: [
    ['class Product:', 'Товар хранит название и цену; свойство отклоняет отрицательную цену.'],
    ['class Order:', 'Заказ хранит собственный список товаров и объект доставки.'],
    ['def add(self, product):', 'Добавление товара меняет состояние конкретного заказа.'],
    ['def total(self):', 'Итог равен сумме цен товаров плюс cost() выбранной доставки.'],
  ],
  code: `class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    @property
    def price(self):
        return self._price
    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("Цена отрицательна")
        self._price = value

class Pickup:
    def cost(self):
        return 0

class Order:
    def __init__(self, delivery):
        self.items = []
        self.delivery = delivery
    def add(self, product):
        self.items.append(product)
    def total(self):
        return sum(item.price for item in self.items) + self.delivery.cost()

order = Order(Pickup())
order.add(Product("Книга", 500))
print(order.total())`,
  explanation: 'Это стартовая заготовка, а не готовый проект. Добавь вторую доставку, правила пустого заказа, два независимых заказа и вывод состава. Сначала попробуй сам, затем используй подсказки.',
  practice: 'Сначала запусти заготовку. Затем реализуй критерии проекта: две службы доставки с разной стоимостью, два независимых заказа, проверка отрицательной цены, сумма товара с доставкой и понятный вывод состава.',
  tasks: [
    ['Вторая доставка', 'Добавь Courier с cost() = 200 и проверь заказ с книгой: ожидается 700.', 'Нужен метод cost(self), как у Pickup.'],
    ['Независимость', 'Создай второй пустой заказ. Добавь книгу только в первый и проверь, что второй total() равен стоимости его доставки.', 'У каждого Order свой список items.'],
    ['Собери проект', 'С нуля собери Product, Pickup, Courier, Order. Добавь два товара (500 и 50), доставку Courier (200), выведи состав и итог 750. Проверь отрицательную цену и независимость двух заказов. Объясни, где композиция и полиморфизм.', 'Сначала реализуй Product и проверки, затем обе доставки, затем Order. Для итога используй цикл или sum; доставку вызывай через self.delivery.cost().', `# Ключевая идея проверки после самостоятельной сборки:
# order = Order(Courier())
# order.add(Product("Книга", 500))
# order.add(Product("Ручка", 50))
# assert order.total() == 750
# empty = Order(Pickup())
# assert empty.total() == 0
# assert len(empty.items) == 0`],
  ],
  mistakes: [
    ['items = [] в теле класса Order', 'Заказы разделят один список. Создай self.items = [] внутри __init__.'],
    ['self.delivery.cost вместо self.delivery.cost()', 'Без скобок получается сам метод, а не число стоимости.'],
    ['self._price = price в __init__', 'Так обходится проверка свойства. Присваивай self.price = price.'],
  ],
  checklist: ['Собрал несколько классов самостоятельно', 'Получил итог 750 для двух товаров и курьера', 'Отрицательная цена отклоняется', 'Второй заказ не видит товары первого', 'Могу показать композицию и полиморфизм', 'Могу объяснить код без копирования'],
  bridge: 'Здесь объекты работали в памяти. Дальше модуль об интернете объяснит, как клиент обращается к серверу; позже FastAPI превратит похожие правила в API.',
});
