export const module3 = {
  id: 'oop',
  order: 3,
  title: 'ООП в Python',
  icon: '🧩',
  description: 'Классы, объекты и наследование — через понятные аналогии, без сложных слов.',
  lessons: [
    {
      id: 'classes-objects',
      title: 'Классы и объекты',
      summary: 'Класс — это чертёж, объект — готовая вещь по этому чертежу',
      theory: [
        {
          type: 'p',
          text: 'До сих пор мы хранили данные отдельно: имя в одной переменной, возраст в другой, или всё вместе в словаре. Но у словаря есть предел: он просто хранит данные, а не "умеет" ничего делать с собой. Классы решают это по-другому.',
        },
        {
          type: 'analogy',
          text: 'Класс — это чертёж дома. По одному чертежу можно построить сколько угодно домов — они будут одинаковой конструкции, но каждый со своим адресом, своим цветом стен. Объект — это уже конкретный построенный дом. Класс Dog ("собака") — это чертёж, а rex = Dog("Рекс") — это уже конкретная собака по имени Рекс, "построенная" по этому чертежу.',
        },
        {
          type: 'p',
          text: 'Класс описывает: какие данные будут у каждого объекта (атрибуты) и что объект умеет делать (методы — это просто функции, но "принадлежащие" классу). Пока разберём только атрибуты — данные.',
        },
        {
          type: 'steps',
          title: 'Собираем класс по кусочкам',
          items: [
            { code: 'class Dog:', note: 'class — говорит Python "дальше будет чертёж". Dog — имя класса. По договорённости имена классов пишут с большой буквы.' },
            { code: '    def __init__(self, name):', note: '__init__ — специальный метод, который вызывается автоматически при создании нового объекта. Он настраивает, "с чем родится" объект. self — это сам создаваемый объект (мы объясним это чуть ниже).' },
            { code: '        self.name = name', note: 'Сохраняем переданное имя внутрь объекта. Теперь у КАЖДОГО объекта Dog будет своё собственное значение self.name.' },
            { code: 'rex = Dog("Рекс")', note: 'Создаём объект. Python сам вызовет __init__ и передаст "Рекс" в параметр name. Теперь rex.name равно "Рекс".' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Что такое self',
          text: 'self — это способ объекта сказать "мои собственные данные, а не чьи-то ещё". Когда ты пишешь self.name = name внутри класса, это значит "у ЭТОГО КОНКРЕТНОГО объекта (который сейчас создаётся) атрибут name равен переданному значению". self всегда пишут первым параметром в методах класса, и Python сам подставляет его — тебе не нужно передавать self вручную при вызове.',
        },
        {
          type: 'p',
          text: 'Можно создать сколько угодно объектов по одному классу — и у каждого будут свои собственные значения атрибутов, не связанные друг с другом.',
        },
      ],
      example: {
        title: 'Класс Dog и два разных объекта',
        lang: 'python',
        code: `class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed

rex = Dog("Рекс", "овчарка")
bobik = Dog("Бобик", "дворняга")

print(rex.name, rex.breed)
print(bobik.name, bobik.breed)`,
        explanation: 'rex и bobik — два разных объекта одного класса Dog. У каждого своё собственное значение name и breed — они никак не связаны между собой.',
      },
      sandbox: {
        description: 'Создай ещё одного пса с другим именем и породой, выведи его данные.',
        initialCode: `class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed

rex = Dog("Рекс", "овчарка")
bobik = Dog("Бобик", "дворняга")

print(rex.name, rex.breed)
print(bobik.name, bobik.breed)`,
      },
      tasks: [
        {
          title: 'Задание 1: класс Book',
          difficulty: 'easy',
          description: 'Создай класс Book с атрибутами title и author (через __init__). Создай один объект книги и выведи её title и author.',
          hints: ['class Book:\n    def __init__(self, title, author):\n        self.title = title\n        self.author = author', 'book = Book("Война и мир", "Толстой")'],
        },
        {
          title: 'Задание 2: несколько объектов',
          difficulty: 'medium',
          description: 'Создай класс Product с атрибутами name и price. Создай ТРИ разных объекта продукта. Выведи их через цикл for, используя список products = [product1, product2, product3].',
          hints: [
            'Сначала создай три отдельных объекта: p1 = Product(...), p2 = Product(...), p3 = Product(...)',
            'Затем собери их в список: products = [p1, p2, p3]',
            'for product in products: print(product.name, product.price)',
          ],
          solution: `class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

p1 = Product("Книга", 500)
p2 = Product("Ручка", 50)
p3 = Product("Тетрадь", 80)

products = [p1, p2, p3]
for product in products:
    print(product.name, product.price)`,
        },
        {
          title: 'Задание 3: атрибут по умолчанию',
          difficulty: 'hard',
          description: 'Создай класс User с атрибутами name и is_active. Сделай так, чтобы is_active по умолчанию было True, если его не передали при создании (используй значение по умолчанию в __init__, как мы делали для обычных функций).',
          hints: [
            'def __init__(self, name, is_active=True): — точно так же, как в обычных функциях',
            'user1 = User("Аня") — is_active будет True автоматически',
            'user2 = User("Боря", False) — можно явно передать другое значение',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'def __init__(name):  — забыт self первым параметром',
          right: 'def __init__(self, name):  — self обязателен первым параметром в любом методе класса. Python использует его, чтобы понять, с КАКИМ именно объектом сейчас работает код',
        },
        {
          wrong: 'self.name = имя  внутри __init__, но потом обращение через Dog.name вместо rex.name',
          right: 'Атрибуты объекта доступны через конкретный объект (rex.name), а не через сам класс (Dog.name). Класс — это чертёж, у него самого нет "имени" — оно появляется только у конкретных построенных объектов',
        },
      ],
      checklist: [
        'Понимаю аналогию "класс = чертёж, объект = вещь по чертежу"',
        'Умею создать класс с __init__ и атрибутами',
        'Понимаю, зачем нужен self',
        'Умею создавать несколько независимых объектов одного класса',
      ],
    },

    {
      id: 'methods',
      title: 'Методы — что объект умеет делать',
      summary: 'Функции внутри класса, которые работают с данными объекта',
      theory: [
        {
          type: 'p',
          text: 'В прошлом уроке мы научились хранить данные внутри объекта. Теперь научим объект что-то ДЕЛАТЬ с этими данными. Функция, объявленная внутри класса, называется методом.',
        },
        {
          type: 'analogy',
          text: 'Если атрибуты — это то, ЧТО ЕСТЬ у объекта (имя, порода, возраст), то методы — это то, ЧТО УМЕЕТ ДЕЛАТЬ объект. У собаки есть атрибут name ("что есть"), и есть метод bark() — "гавкнуть" ("что умеет делать").',
        },
        {
          type: 'steps',
          title: 'Собираем метод по кусочкам',
          items: [
            { code: 'def bark(self):', note: 'Метод — это обычная функция внутри класса, но первый параметр всегда self (сам объект, который вызывает метод)' },
            { code: '    return f"{self.name} говорit: Гав!"', note: 'Внутри метода можно обращаться к атрибутам ЭТОГО объекта через self.name — так метод "знает", с чьими данными работает' },
            { code: 'rex.bark()', note: 'Вызов метода: пишем объект, точку, имя метода и скобки. self передаётся автоматически — это будет rex' },
          ],
        },
        {
          type: 'p',
          text: 'Обрати внимание: когда мы ВЫЗЫВАЕМ метод, self передавать вручную не нужно — Python сам подставит туда объект, у которого метод вызван (rex.bark() автоматически означает "self это rex").',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Методы могут изменять данные объекта',
          text: 'Метод может не только читать атрибуты, но и менять их: self.age += 1 внутри метода увеличит возраст именно этого объекта. Это позволяет объекту "меняться со временем" — например, когда пользователь делает заказ, счётчик его заказов растёт.',
        },
      ],
      example: {
        title: 'Класс BankAccount с методами',
        lang: 'python',
        code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if amount > self.balance:
            return "Недостаточно средств"
        self.balance -= amount
        return self.balance

account = BankAccount("Аня", 1000)
account.deposit(500)
print(account.balance)

result = account.withdraw(2000)
print(result)`,
        explanation: 'deposit и withdraw — методы, которые изменяют self.balance. withdraw даже "принимает решение" — проверяет условие внутри себя, прежде чем изменить баланс.',
      },
      sandbox: {
        description: 'Попробуй положить и снять разные суммы, посмотри на баланс.',
        initialCode: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if amount > self.balance:
            return "Недостаточно средств"
        self.balance -= amount
        return self.balance

account = BankAccount("Аня", 1000)
print(account.deposit(500))
print(account.withdraw(2000))
print(account.withdraw(300))`,
      },
      tasks: [
        {
          title: 'Задание 1: метод приветствия',
          difficulty: 'easy',
          description: 'В классе User с атрибутом name добавь метод greet(self), который возвращает f"Привет, я {self.name}". Вызови его для одного объекта.',
          hints: ['def greet(self):\n    return f"Привет, я {self.name}"', 'user = User("Аня")\nprint(user.greet())'],
        },
        {
          title: 'Задание 2: счётчик внутри объекта',
          difficulty: 'medium',
          description: 'В классе Counter с атрибутом count=0 (по умолчанию в __init__) добавь метод increment(self), который увеличивает count на 1. Вызови increment() три раза подряд и выведи итоговое значение count.',
          hints: [
            'def increment(self):\n    self.count += 1',
            'Вызывай counter.increment() несколько раз — self.count будет расти',
          ],
          solution: `class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1

counter = Counter()
counter.increment()
counter.increment()
counter.increment()
print(counter.count)`,
        },
        {
          title: 'Задание 3: метод с параметром и условием',
          difficulty: 'hard',
          description: 'В классе Cart (корзина) с атрибутом items=[] (список товаров, пустой по умолчанию) добавь метод add_item(self, item), который добавляет товар в self.items, только если такого товара там ещё нет (проверь через if item not in self.items).',
          hints: [
            'def add_item(self, item):\n    if item not in self.items:\n        self.items.append(item)',
            'not in — проверяет, ЧТО ЭЛЕМЕНТА НЕТ в списке',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'account.deposit(self, 500)  — попытка передать self вручную при вызове',
          right: 'account.deposit(500)  — self передаётся автоматически при вызове метода через точку. Указывать его вручную не нужно и приведёт к ошибке (слишком много аргументов)',
        },
        {
          wrong: 'def deposit(self, amount):\n    balance += amount  — забыто self перед balance',
          right: 'self.balance += amount  — без self.  Python подумает, что balance — это отдельная, никак не связанная с объектом переменная, и выдаст ошибку, что такой переменной не существует',
        },
      ],
      checklist: [
        'Понимаю разницу между атрибутом (данные) и методом (действие)',
        'Умею создавать методы с self и вызывать их через точку',
        'Понимаю, что self передаётся автоматически при вызове',
        'Умею писать методы, которые изменяют данные объекта',
      ],
    },

    {
      id: 'inheritance',
      title: 'Наследование',
      summary: 'Как один класс может "унаследовать" всё от другого класса',
      theory: [
        {
          type: 'p',
          text: 'Часто бывает несколько похожих классов, которые отличаются лишь частично. Вместо того чтобы писать одинаковый код заново в каждом — можно "унаследовать" его от общего класса.',
        },
        {
          type: 'analogy',
          text: 'Представь общий чертёж "Транспорт" — у него есть колёса и двигатель. Чертёж "Машина" может ВЗЯТЬ ВСЁ из чертежа "Транспорт" и добавить своё — например, багажник. Чертёж "Мотоцикл" тоже возьмёт всё из "Транспорта", но добавит что-то своё. Это и есть наследование: дочерний класс получает всё от родительского, и может добавить или изменить что-то своё.',
        },
        {
          type: 'steps',
          title: 'Собираем наследование по кусочкам',
          items: [
            { code: 'class Animal:', note: 'Это родительский класс ("Транспорт" из аналогии) — общий, базовый' },
            { code: 'class Dog(Animal):', note: 'Скобки после имени класса означают "унаследован от". Dog получает всё, что есть у Animal' },
            { code: '    def speak(self):', note: 'Dog может переопределить метод — написать свою версию speak(), которая заменит родительскую именно для собак' },
          ],
        },
        {
          type: 'p',
          text: 'Если у дочернего класса нет собственного __init__, он использует __init__ родителя автоматически. Если нужно и взять родительское поведение, и добавить что-то своё, используется специальная функция super().',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Зачем вообще нужно наследование',
          text: 'Оно избавляет от копирования одного и того же кода в нескольких похожих классах. Если завтра понадобится поменять общее поведение (например, у всех животных) — достаточно поменять его в одном месте, родительском классе, и изменения автоматически применятся ко всем "детям".',
        },
      ],
      example: {
        title: 'Animal, Dog и Cat',
        lang: 'python',
        code: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} издаёт какой-то звук"

class Dog(Animal):
    def speak(self):
        return f"{self.name} говорит: Гав!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} говорит: Мяу!"

animals = [Dog("Рекс"), Cat("Мурка"), Animal("Неизвестное существо")]

for animal in animals:
    print(animal.speak())

print(isinstance(animals[0], Animal))`,
        explanation: 'Dog и Cat не переопределяют __init__ — они используют родительский, потому что не написали свой. Но каждый переопределяет speak() по-своему. isinstance проверяет: "является ли этот объект (тоже) объектом класса Animal?" — и для Dog это True, ведь Dog унаследован от Animal.',
      },
      sandbox: {
        description: 'Добавь ещё одного животного своего вида и посмотри, как он ведёт себя в общем цикле.',
        initialCode: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} издаёт какой-то звук"

class Dog(Animal):
    def speak(self):
        return f"{self.name} говорит: Гав!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} говорит: Мяу!"

animals = [Dog("Рекс"), Cat("Мурка")]

for animal in animals:
    print(animal.speak())`,
      },
      tasks: [
        {
          title: 'Задание 1: класс Bird',
          difficulty: 'easy',
          description: 'Создай класс Bird(Animal), который переопределяет speak() так, чтобы возвращать f"{self.name} говорит: Чирик!". Добавь птицу в список animals из примера и выведи всех через цикл.',
          hints: ['class Bird(Animal):\n    def speak(self):\n        return f"{self.name} говорит: Чирик!"'],
        },
        {
          title: 'Задание 2: свой __init__ с super()',
          difficulty: 'medium',
          description: 'Создай класс Employee(Animal не подходит — создай новый базовый класс Person с атрибутом name). Затем класс Employee(Person) должен принимать И name, И salary — используй super().__init__(name), чтобы не дублировать код сохранения name.',
          hints: [
            'class Person:\n    def __init__(self, name):\n        self.name = name',
            'class Employee(Person):\n    def __init__(self, name, salary):\n        super().__init__(name)\n        self.salary = salary',
            'super().__init__(name) вызывает __init__ родителя, как будто ты написал self.name = name — но переиспользуя код родителя',
          ],
          solution: `class Person:
    def __init__(self, name):
        self.name = name

class Employee(Person):
    def __init__(self, name, salary):
        super().__init__(name)
        self.salary = salary

emp = Employee("Аня", 80000)
print(emp.name, emp.salary)`,
        },
        {
          title: 'Задание 3: проверка через isinstance',
          difficulty: 'hard',
          description: 'Используя классы Animal, Dog, Cat из примера, создай список из нескольких животных. С помощью цикла и if isinstance(animal, Dog) выведи только тех, кто является собакой (по имени).',
          hints: [
            'isinstance(объект, Класс) возвращает True, если объект принадлежит этому классу (или его "потомку")',
            'for animal in animals:\n    if isinstance(animal, Dog):\n        print(animal.name)',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'class Dog(Animal):\n    def __init__(self, name, breed):\n        self.name = name\n        self.breed = breed  — дублирование кода родителя вместо super()',
          right: 'class Dog(Animal):\n    def __init__(self, name, breed):\n        super().__init__(name)\n        self.breed = breed  — super() переиспользует код родителя вместо копирования, поэтому если родительский __init__ изменится, Dog не придётся переписывать',
        },
        {
          wrong: 'class Dog Animal:  — забыты скобки для наследования',
          right: 'class Dog(Animal):  — круглые скобки после имени класса обязательны, чтобы указать родительский класс. Без них Dog не унаследует ничего от Animal',
        },
      ],
      checklist: [
        'Понимаю идею наследования: дочерний класс получает всё от родительского',
        'Умею создать класс, унаследованный от другого, через class Дочерний(Родитель):',
        'Умею переопределить метод родителя в дочернем классе',
        'Понимаю, зачем нужен super().__init__()',
      ],
    },
  ],
};
