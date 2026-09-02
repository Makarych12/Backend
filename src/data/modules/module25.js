export const module25 = {
  id: 'stripe-payments',
  order: 25,
  title: 'Приём платежей со Stripe',
  icon: '💳',
  description: 'Приём банковских карт онлайн: Stripe API, Payment Intent, тестовый режим, Webhooks и фиксация оплаты заказов.',
  lessons: [
    {
      id: 'how-payments-work',
      title: 'Как устроена онлайн-оплата в интернете',
      summary: 'Почему серверу запрещено трогать номера банковских карт напрямую и какую работу берёт на себя платёжный шлюз',
      theory: [
        {
          type: 'p',
          text: 'Многие новички думают: "Чтобы принять оплату на сайте, сделаем форму ввода номера карты, CVV-кода и сохраним их в нашу базу данных PostgreSQL!". Это ГЛАВНАЯ ОШИБКА, за которую можно получить многомиллионные штрафы или уголовную ответственность. Хранить и обрабатывать сырые данные банковских карт имеют право только сертифицированные финансовые организации по строжайшему мировому стандарту PCI-DSS.',
        },
        {
          type: 'analogy',
          text: 'Представь, что твой интернет-магазин нанял профессионального вооруженного инкассатора и кассира в бронированном фургоне (STRIPE). Когда покупатель нажимает "Оплатить", он вводит номер карты прямо в защищенный бронированный шлюз Stripe. Твой сервер даже не видит номер карты! Stripe списывает деньги со счёта клиента, оставляет их на твоём балансе и сообщает твоему бэкенду: "Всё чисто, платёж на 1500 рублей успешно прошёл, можешь выдавать товар!".',
        },
        {
          type: 'steps',
          title: 'Два типа ключей в Stripe',
          items: [
            { code: 'Publishable Key (pk_test_...):', note: 'Публичный ключ для фронтенда (React/Vue/мобильное приложение) — безопасен для показа в браузере' },
            { code: 'Secret Key (sk_test_...):', note: 'Секретный ключ для бэкенда (FastAPI) — хранится строго в .env и даёт доступ к списанию денег' },
            { code: 'Тестовая карта 4242 4242 4242 4242:', note: 'Официальная тестовая карта Stripe для проверки успешных оплат без списания реальных денег' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Инициализация Stripe клиента в Python',
          lang: 'python',
          code: `import os
import stripe

# Загружаем секретный ключ из переменных окружения:
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_mock_secret_key_2026")

def check_stripe_balance():
    """Проверка доступного баланса в аккаунте Stripe"""
    try:
        balance = stripe.Balance.retrieve()
        print("Доступный баланс:", balance)
        return balance
    except stripe.error.AuthenticationError:
        print("❌ Неверный секретный ключ Stripe!")
        return None`,
          explanation: 'Библиотека stripe использует глобальный api_key для всех дальнейших вызовов методов API.',
        },
        {
          title: 'Пример 2: Почему суммы в Stripe ВСЕГДА передаются в минимальных единицах (копейках/центах)',
          lang: 'python',
          code: `def format_stripe_amount(rubles: float) -> int:
    """Stripe принимает целые числа в копейках/центах для исключения ошибок округления float!"""
    amount_kopecks = int(round(rubles * 100))
    return amount_kopecks

print("100 руб 50 коп -> в Stripe:", format_stripe_amount(100.50)) # 10050
print("4990 руб -> в Stripe:", format_stripe_amount(4990))        # 499000`,
          explanation: 'Дробные числа (float) в языках программирования подвержены ошибкам точности (0.1 + 0.2 != 0.3), поэтому в финансах используют целые числа.',
        },
        {
          title: 'Пример 3: Валидация валюты платежа',
          lang: 'python',
          code: `SUPPORTED_CURRENCIES = {"usd", "eur", "rub", "kzt", "gel"}

def validate_currency(curr: str) -> str:
    curr_clean = curr.strip().lower()
    if curr_clean not in SUPPORTED_CURRENCIES:
        raise ValueError(f"Валюта {curr} не поддерживается шлюзом!")
    return curr_clean`,
          explanation: 'Все валюты приводятся к нижнему трехбуквенному коду ISO 4217.',
        },
      ],
      terminal: {
        title: 'Установка официальной библиотеки Stripe',
        description: 'Установка SDK Stripe для Python:',
        lessonCommands: {
          'pip install stripe': {
            output: [
              'Collecting stripe',
              '  Downloading stripe-11.3.0-py3-none-any.whl (1.1 MB)',
              'Installing collected packages: stripe',
              'Successfully installed stripe-11.3.0',
            ],
            type: 'success',
          },
        },
        suggestions: ['pip install stripe'],
        script: [
          { command: 'pip install stripe' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор платежного шлюза валидирует параметры транзакции. Запусти код!',
        initialCode: `class MockStripeGateway:
    def __init__(self, secret_key):
        self.secret_key = secret_key

    def create_charge(self, amount_cents: int, currency: str, card_number: str):
        if not self.secret_key.startswith("sk_"):
            return {"status": "FAILED", "error": "Invalid API Key"}
        if amount_cents < 50:
            return {"status": "FAILED", "error": "Сумма меньше минимального лимита (50 центов)"}
        if card_number.startswith("4242"):
            return {"status": "SUCCEEDED", "charge_id": "ch_3M4k9s0", "paid": True}
        elif card_number.startswith("4000"):
            return {"status": "DECLINED", "error": "Недостаточно средств на карте"}
        return {"status": "DECLINED", "error": "Неверный номер карты"}

stripe_mock = MockStripeGateway("sk_test_12345")

# 1. Тест успешной оплаты тестовой картой 4242:
res1 = stripe_mock.create_charge(amount_cents=150000, currency="rub", card_number="4242424242424242")
print("1. Оплата картой 4242:", res1)

# 2. Тест отклонённой оплаты:
res2 = stripe_mock.create_charge(amount_cents=150000, currency="rub", card_number="4000000000000000")
print("2. Оплата с отказом:", res2)`,
      },
      tasks: [
        {
          title: 'Задание 1: проверка минимальной суммы заказа',
          difficulty: 'easy',
          description: 'Напиши функцию is_valid_payment_amount(amount_rub: float) -> bool: возвращает True, если сумма не меньше 50 руб и не больше 500 000 руб.',
          hints: ['return 50.0 <= amount_rub <= 500000.0'],
        },
        {
          title: 'Задание 2: форматирование чека для клиента',
          difficulty: 'medium',
          description: 'Напиши функцию format_receipt(charge_id: str, amount_kopecks: int, currency: str) -> str: преобразует копейки обратно в рубли и возвращает f"Чек #{charge_id}: {amount_kopecks/100:.2f} {currency.upper()}".',
          hints: ['return f"Чек #{charge_id}: {amount_kopecks/100:.2f} {currency.upper()}"'],
          solution: `def format_receipt(charge_id: str, amount_kopecks: int, currency: str) -> str:
    rub = amount_kopecks / 100
    return f"Чек #{charge_id}: {rub:.2f} {currency.upper()}"

receipt = format_receipt("ch_101", 499000, "rub")
assert receipt == "Чек #ch_101: 4990.00 RUB"
print("✓ Чек успешно сформирован:", receipt)`,
        },
        {
          title: 'Задание 3: безопасность секретных ключей',
          difficulty: 'hard',
          description: 'Объясни в комментарии: почему публичный ключ (pk_test_...) можно без опаски отдавать в JavaScript в браузер любого посетителя сайта, а секретный ключ (sk_test_...) ни в коем случае нельзя передавать на клиент.',
          hints: ['Публичный ключ умеет только создавать защищенные токены карт, но не может списывать деньги или просматривать историю транзакций'],
        },
      ],
      mistakes: [
        {
          wrong: 'Передавать в Stripe сумму в обычных рублях или долларах: amount=150 (вместо amount=15000)',
          right: 'Stripe всегда ожидает сумму в минимальных неделимых единицах (копейках или центах). 150 рублей = 15000 копеек',
        },
        {
          wrong: 'Пытаться принимать данные карты в FastAPI и передавать в базу данных',
          right: 'Бэкенд никогда не касается сырых номеров карт. Карта отправляется с фронтенда напрямую в защищенный шлюз Stripe Elements',
        },
      ],
      checklist: [
        'Понимаю архитектуру онлайн-платежей и стандарт безопасности PCI-DSS',
        'Знаю разницу между Publishable Key и Secret Key',
        'Понимаю, почему суммы в Stripe передаются в копейках/центах',
        'Знаю тестовую карту 4242 для отладки',
      ],
    },

    {
      id: 'payment-intent-flow',
      title: 'Создание Payment Intent и проведение платежа',
      summary: 'Современный протокол оплаты: как бэкенд создаёт намерение платежа (Payment Intent) и отдаёт client_secret на фронтенд',
      theory: [
        {
          type: 'p',
          text: 'Современный и самый надёжный способ приёма платежей в Stripe — это механизм PAYMENT INTENT (Намерение платежа). Он автоматически поддерживает двухфакторную аутентификацию карт 3D Secure (СМС-подтверждение от банка) и предотвращает двойные списания.',
        },
        {
          type: 'steps',
          title: 'Жизненный цикл платежа через Payment Intent',
          items: [
            { code: '1. Клиент нажимает "Оформить заказ"', note: 'Фронтенд шлёт POST /api/orders/checkout на твой бэкенд с ID заказа' },
            { code: '2. FastAPI создаёт Payment Intent в Stripe', note: 'Бэкенд рассчитывает точную сумму из БД и вызывает stripe.PaymentIntent.create(amount=150000, currency="rub")' },
            { code: '3. Stripe возвращает client_secret', note: 'Бэкенд отдаёт client_secret (секрет платежа) на фронтенд' },
            { code: '4. Фронтенд подтверждает оплату картой', note: 'Stripe Elements в браузере проводит 3D Secure и списывает деньги' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Эндпоинт создания Payment Intent в FastAPI',
          lang: 'python',
          code: `import os
import stripe
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_12345")

app = FastAPI()

class CheckoutRequest(BaseModel):
    order_id: int
    amount_rub: float

@app.post("/api/payments/create-intent")
def create_payment_intent(req: CheckoutRequest):
    try:
        # Рассчитываем сумму в копейках:
        amount_kopecks = int(req.amount_rub * 100)
        
        # Создаём намерение платежа в Stripe:
        intent = stripe.PaymentIntent.create(
            amount=amount_kopecks,
            currency="rub",
            metadata={"order_id": str(req.order_id)},  # привязываем к нашему заказу
            automatic_payment_methods={"enabled": True}
        )
        
        # Отдаём client_secret фронтенду:
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))`,
          explanation: 'client_secret передаётся на фронтенд для безопасной инициализации платежной формы Stripe Elements.',
        },
        {
          title: 'Пример 2: Добавление метаданных к платежу для бухгалтерии',
          lang: 'python',
          code: `metadata = {
    "order_id": "order_7749",
    "customer_email": "user@example.com",
    "items_count": "3",
    "promo_code": "DISCOUNT2026"
}
# Метаданные сохраняются в Stripe и видны в панели управления транзакциями!`,
          explanation: 'Поле metadata позволяет связать платёж в Stripe с конкретным пользователем и заказом в твоей БД.',
        },
        {
          title: 'Пример 3: Отмена незавершенного намерения платежа (Cancel Intent)',
          lang: 'python',
          code: `def cancel_expired_intent(intent_id: str):
    """Отменяет подвисший платёж, если пользователь закрыл вкладку"""
    # canceled_intent = stripe.PaymentIntent.cancel(intent_id)
    return {"id": intent_id, "status": "canceled"}`,
          explanation: 'Отмена освобождает зарезервированные лимиты по картам покупателей.',
        },
      ],
      terminal: {
        title: 'Управление Stripe через официальную CLI утилиту',
        description: 'Создание тестового Payment Intent из консоли:',
        lessonCommands: {
          'stripe payment_intents create --amount=2000 --currency=usd': {
            output: [
              '{',
              '  "id": "pi_3M4k9s0TestIntent123",',
              '  "object": "payment_intent",',
              '  "amount": 2000,',
              '  "currency": "usd",',
              '  "status": "requires_payment_method"',
              '}',
            ],
            type: 'success',
          },
        },
        suggestions: ['stripe payment_intents create --amount=2000 --currency=usd'],
        script: [
          { command: 'stripe payment_intents create --amount=2000 --currency=usd' },
        ],
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'В песочнице работает роут создания Payment Intent. Запусти код!',
        initialCode: `from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.testclient import TestClient

app = FastAPI()

class OrderCheckout(BaseModel):
    order_id: int
    amount: float

@app.post("/create-payment")
def create_payment(order: OrderCheckout):
    cents = int(order.amount * 100)
    fake_intent_id = f"pi_mock_{order.order_id}"
    fake_client_secret = f"{fake_intent_id}_secret_test99"
    
    return {
        "status": "requires_payment_method",
        "amount_cents": cents,
        "client_secret": fake_client_secret
    }

client = TestClient(app)

res = client.post("/create-payment", json={"order_id": 105, "amount": 2500.0})
print("Ответ создания платежа:", res.json())
assert res.status_code == 200
assert res.json()["amount_cents"] == 250000`,
      },
      tasks: [
        {
          title: 'Задание 1: проверка валюты в заказе',
          difficulty: 'easy',
          description: 'Добавь в модель OrderCheckout поле currency: str = "rub". Возвращай валюту в ответе эндпоинта.',
          hints: ['currency: str = "rub"'],
        },
        {
          title: 'Задание 2: защита от изменения цены на фронтенде',
          difficulty: 'medium',
          description: 'Почему нельзя доверять сумме amount, присланной с фронтенда? Напиши логику, которая достаёт реальную цену товара из словаря fake_db_products по product_id и игнорирует сумму из запроса клиента.',
          hints: ['real_amount = fake_db[order.product_id]["price"]'],
          solution: `fake_db_products = {1: {"name": "Курс", "price": 4990}}

def get_verified_price(product_id: int) -> float:
    if product_id not in fake_db_products:
        raise ValueError("Товар не найден в базе!")
    return fake_db_products[product_id]["price"]

assert get_verified_price(1) == 4990
print("✓ Цена проверена по внутренней базе данных, подделка невозможна!")`,
        },
        {
          title: 'Задание 3: обработка 3D Secure сценария',
          difficulty: 'hard',
          description: 'Объясни в комментарии: что означает статус Payment Intent `requires_action` и как браузерный Stripe SDK перенаправляет пользователя на страницу ввода SMS-кода от банка.',
          hints: ['requires_action сигнализирует фронтенду, что банк требует прохождения 3D Secure проверки'],
        },
      ],
      mistakes: [
        {
          wrong: 'Принимать сумму к оплате напрямую от клиента из JS: fetch("/pay", {body: {price: 10}})',
          right: 'Хакер легко изменит цену в JS на 1 рубль. Бэкенд должен САМ рассчитывать стоимость заказа по своей базе данных товаров',
        },
        {
          wrong: 'Считать заказ оплаченным сразу после создания Payment Intent',
          right: 'Создание Intent — это только НАМЕРЕНИЕ заплатить. Заказ считается оплаченным только после подтверждения от Вебхука Stripe',
        },
      ],
      checklist: [
        'Понимаю жизненный цикл Payment Intent (Client Secret -> Оплата -> Webhook)',
        'Умею создавать Payment Intent в FastAPI',
        'Знаю, как привязывать метаданные к платежу',
        'Понимаю, почему цену заказа всегда рассчитывает бэкенд',
      ],
    },

    {
      id: 'stripe-webhooks',
      title: 'Webhooks: как Stripe уведомляет сервер об успешной оплате',
      summary: 'Асинхронные вебхуки: как гарантированно узнать об успешной оплате, проверить криптографическую подпись и обновить статус заказа в БД',
      theory: [
        {
          type: 'p',
          text: 'Что произойдёт, если покупатель нажал "Оплатить", деньги с карты списались, но в эту же секунду у него сел аккумулятор телефона или пропал интернет? Браузер закрылся, но Stripe успешно снял деньги! Как твой бэкенд узнает, что оплата прошла и нужно активировать заказ? Ответ — ВЕБХУКИ (Webhooks).',
        },
        {
          type: 'analogy',
          text: 'ВЕБХУК (Webhook) — это автоматический обратный звонок от банка твоему серверу. Stripe сам делает HTTP POST запрос на твой защищённый эндпоинт `https://api.myshop.com/stripe/webhook` в ту же миллисекунду, как банк одобрил транзакцию. Даже если покупатель давно закрыл сайт — твой бэкенд получит уведомление и надёжно переведёт заказ в статус "Оплачен".',
        },
        {
          type: 'steps',
          title: '3 правила безопасной обработки вебхуков',
          items: [
            { code: '1. Проверка подписи stripe-signature', note: 'Обязательно проверяем криптографическую подпись Stripe Webhook Secret (чтобы хакер не мог отправить фальшивое уведомление "оплата прошла")' },
            { code: '2. Обработка события payment_intent.succeeded', note: 'Достаём order_id из metadata и переводим заказ в статус PAID в PostgreSQL' },
            { code: '3. Быстрый ответ 200 OK', note: 'Мгновенно отдаём 200 OK шлюзу Stripe, чтобы он знал, что уведомление доставлено' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Эталонный эндпоинт обработки Webhook в FastAPI',
          lang: 'python',
          code: `import os
import stripe
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_test_secret_2026")

@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request):
    # 1. Читаем сырое тело запроса в байтах:
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        # 2. Криптографически верифицируем событие:
        event = stripe.Webhook.construct_event(
            payload, sig_header, WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError) as err:
        raise HTTPException(status_code=400, detail="Неверная подпись вебхука!")

    # 3. Обрабатываем событие успешной оплаты:
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        order_id = payment_intent["metadata"].get("order_id")
        print(f"🎉 Заказ №{order_id} успешно оплачен! Начисляем товар в БД.")
        # db.update_order_status(order_id, "PAID")

    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        print(f"❌ Оплата заказа №{payment_intent['metadata'].get('order_id')} отклонена банком.")

    # 4. Всегда возвращаем 200 OK:
    return {"status": "success"}`,
          explanation: 'stripe.Webhook.construct_event гарантирует подлинность входящего запроса от серверов Stripe.',
        },
        {
          title: 'Пример 2: Идемпотентность обработки вебхуков',
          lang: 'python',
          code: `processed_event_ids = set()

def handle_webhook_event_idempotent(event_id: str, order_id: str):
    # Если Stripe повторно прислал то же самое событие:
    if event_id in processed_event_ids:
        print(f"Событие {event_id} уже было обработано ранее, пропускаем дубликат.")
        return False
    
    processed_event_ids.add(event_id)
    print(f"Заказ {order_id} впервые переведён в статус PAID.")
    return True`,
          explanation: 'Stripe может повторить отправку вебхука при сетевых задержках, поэтому проверка event_id защищает от дублирования.',
        },
        {
          title: 'Пример 3: Логирование неподдерживаемых типов событий',
          lang: 'python',
          code: `def dispatch_event(event_type: str, data: dict):
    match event_type:
        case "payment_intent.succeeded":
            return "Оплата прошла"
        case "charge.refunded":
            return "Возврат средств покупателю"
        case _:
            return f"Событие {event_type} проигнорировано (не требует действий)"`,
          explanation: 'match/case элегантно фильтрует только необходимые события из сотен возможных типов событий Stripe.',
        },
      ],
      terminal: {
        title: 'Перенаправление вебхуков Stripe на локальный компьютер через CLI',
        description: 'Stripe CLI позволяет тестировать вебхуки на localhost:8000 без деплоя в облако:',
        lessonCommands: {
          'stripe listen --forward-to localhost:8000/api/stripe/webhook': {
            output: [
              '> Ready! Your webhook signing secret is whsec_test123...',
              '2026-09-02 14:00:01   --> payment_intent.succeeded [evt_123]',
              '2026-09-02 14:00:01  <--  [200] POST http://localhost:8000/api/stripe/webhook',
            ],
            type: 'success',
          },
        },
        suggestions: ['stripe listen --forward-to localhost:8000/api/stripe/webhook'],
        script: [
          { command: 'stripe listen --forward-to localhost:8000/api/stripe/webhook' },
        ],
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'В песочнице симулятор вебхука обрабатывает событие payment_intent.succeeded. Запусти код!',
        initialCode: `from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from fastapi.testclient import TestClient

app = FastAPI()
db_orders = {101: {"status": "PENDING", "amount": 4990}}

@app.post("/webhook")
def webhook_handler(event: dict, stripe_signature: str = Header(None)):
    if stripe_signature != "valid_secret_sig":
        raise HTTPException(400, "Invalid Signature")
        
    if event.get("type") == "payment_intent.succeeded":
        order_id = event["data"]["object"]["metadata"]["order_id"]
        if order_id in db_orders:
            db_orders[order_id]["status"] = "PAID"
            return {"status": "order_updated_to_paid"}
    return {"status": "ignored"}

client = TestClient(app)

# Имитируем входящий вебхук от Stripe:
fake_webhook_event = {
    "type": "payment_intent.succeeded",
    "data": {
        "object": {
            "id": "pi_123",
            "metadata": {"order_id": 101}
        }
    }
}

res = client.post("/webhook", json=fake_webhook_event, headers={"stripe-signature": "valid_secret_sig"})
print("Ответ обработчика вебхука:", res.json())
print("Статус заказа в БД после вебхука:", db_orders[101])
assert db_orders[101]["status"] == "PAID"`,
      },
      tasks: [
        {
          title: 'Задание 1: обработка возврата средств (Refund)',
          difficulty: 'easy',
          description: 'Добавь в webhook_handler обработку события "charge.refunded": переводит статус заказа в "REFUNDED". Проверь статус заказа в БД.',
          hints: ['elif event.get("type") == "charge.refunded": db_orders[order_id]["status"] = "REFUNDED"'],
        },
        {
          title: 'Задание 2: защита от поддельных вебхуков без сигнатуры',
          difficulty: 'medium',
          description: 'Отправь запрос к эндпоинту /webhook с неверным заголовком stripe_signature="fake_hacker_sig". Убедись, что сервер возвращает статус 400 и не меняет статус в БД.',
          hints: ['res = client.post("/webhook", json=..., headers={"stripe-signature": "bad"})'],
          solution: `res_fake = client.post("/webhook", json=fake_webhook_event, headers={"stripe-signature": "fake"})
assert res_fake.status_code == 400
print("✓ Поддельный запрос отклонён со статусом 400!")`,
        },
        {
          title: 'Задание 3: практическое подключение платежей к проекту 2 (Shop API)',
          difficulty: 'hard',
          description: 'Интегрируй Stripe в свой проект интернет-магазина: 1) Эндпоинт POST /orders/{id}/pay создаёт Payment Intent; 2) Вебхук POST /stripe/webhook переводит статус заказа в PAID и уменьшает остаток товара на складе!',
          hints: ['Поздравляем! Твой интернет-магазин принимает реальные платежи по мировым стандартам!'],
        },
      ],
      mistakes: [
        {
          wrong: 'Не проверять подпись stripe-signature при приёме вебхука',
          right: 'Без проверки подписи любой злоумышленник может отправить фальшивый POST запрос на /webhook и бесплатно "оплатить" любой заказ',
        },
        {
          wrong: 'Выполнять долгие тяжелые задачи прямо в теле вебхука дольше 10 секунд',
          right: 'Stripe ждёт ответ не дольше 10-15 секунд, иначе считает вебхук упавшим и повторяет его. Быстро обнови статус в БД и отдай 200 OK, а тяжелые задачи вынеси в Celery',
        },
      ],
      checklist: [
        'Понимаю назначение асинхронных вебхуков для подтверждения оплат',
        'Умею верифицировать подпись Webhook Secret',
        'Знаю структуру событий payment_intent.succeeded и payment_failed',
        'Понимаю принцип идемпотентности обработки вебхуков',
      ],
    },
  ],
};
