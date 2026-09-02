export const module26 = {
  id: 'file-storage-s3',
  order: 26,
  title: 'Загрузка файлов и облачное хранилище',
  icon: '☁️',
  description: 'Как правильно загружать и раздавать файлы: FastAPI UploadFile, валидация типов/размеров, S3 хранилища (Cloudflare R2/AWS) и presigned URLs.',
  lessons: [
    {
      id: 'why-cloud-storage',
      title: 'Почему сервер — это рабочий стол, а не склад',
      summary: 'Почему сохранять файлы на диск рядом с кодом бэкенда — фатальная ошибка и как устроены S3-совместимые хранилища',
      theory: [
        {
          type: 'p',
          text: 'Новички часто сохраняют загруженные аватарки прямо в папку `uploads/` рядом с `main.py`. Но когда проект деплоится в Docker или на Render/Railway, случается катастрофа: при каждом перезапуске контейнера или обновлении кода вся папка с файлами СТИРАЕТСЯ НАВСЕГДА! А если у тебя 3 экземпляра сервера — файл, загруженный на сервер №1, будет недоступен для пользователей сервера №2.',
        },
        {
          type: 'analogy',
          text: 'Сервер бэкенда — это РАБОЧИЙ СТОЛ хирурга или повара. На столе должно быть чисто: только исходный код программы и оперативная память для вычислений. Складывать туда 50 000 фотографий пользователей — это как свалить мешки с цементом прямо на обеденный стол. Для хранения файлов человечество придумало отдельный специализированный СКЛАД — ОБЪЕКТНОЕ ХРАНИЛИЩЕ S3 (Amazon S3, Cloudflare R2, MinIO).',
        },
        {
          type: 'list',
          title: '3 главных преимущества S3-хранилищ (Simple Storage Service)',
          items: [
            '1. Бесконечная емкость: можно загрузить 1 терабайт файлов без риска переполнить диск сервера.',
            '2. Глобальный CDN: файлы раздаются пользователям на сверхвысокой скорости через кэширующие серверы по всему миру.',
            '3. Бесплатный тариф (Free Tier): например, Cloudflare R2 даёт 10 ГБ бесплатного хранилища без платы за исходящий трафик!',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Термины S3 простыми словами',
          text: 'БАКЕТ (Bucket) — это "папка верхнего уровня" или виртуальный сейф (например, my-shop-avatars). КЛЮЧ (Key / Object Key) — это имя файла внутри бакета (например, avatars/user_42_a1b2c3.jpg).',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Структура адреса файла в S3 хранилище',
          lang: 'bash',
          code: `# Пример публичной ссылки на файл в бакете Cloudflare R2 / AWS S3:
# https://pub-xxx.r2.dev/avatars/user_42_9f8e7d.png
#         └───────┬───────┘ └───────┬───────┘
#             Домен R2/S3          Object Key`,
          explanation: 'Бэкенд сохраняет в PostgreSQL только строковый URL файла, а сами тяжёлые байты хранятся в облаке S3.',
        },
        {
          title: 'Пример 2: Генерация безопасного уникального имени файла (UUID)',
          lang: 'python',
          code: `import uuid
import os

def generate_unique_filename(original_filename: str) -> str:
    """Заменяет опасные имена вроде 'моё фото (1).jpg' на безопасный уникальный UUID"""
    ext = os.path.splitext(original_filename)[1].lower()  # '.jpg'
    safe_uuid = uuid.uuid4().hex
    return f"{safe_uuid}{ext}"

print(generate_unique_filename("Аватарка 2026.png"))
# -> e4d909c290d04297865819d45e7e63f7.png`,
          explanation: 'UUID гарантирует, что два пользователя с файлом image.jpg никогда не перезапишут файлы друг друга.',
        },
        {
          title: 'Пример 3: Сравнение локального диска и S3 в архитектуре',
          lang: 'python',
          code: `STORAGE_COMPARISON = {
    "Local Disk": {"persistence": "❌ Теряется при рестарте Docker", "scalability": "❌ Ограничен 20 ГБ диска сервера"},
    "S3 / R2 Cloud": {"persistence": "✅ Вечное хранение с репликацией 99.9999%", "scalability": "✅ До петабайт данных"}
}

for storage, props in STORAGE_COMPARISON.items():
    print(f"[{storage}]: {props['persistence']}, {props['scalability']}")`,
          explanation: 'Облачные хранилища проектируются с многократным резервированием данных в нескольких дата-центрах.',
        },
      ],
      terminal: {
        title: 'Установка AWS SDK (boto3) для Python',
        description: 'boto3 — официальный стандарт для работы с S3, Cloudflare R2 и MinIO:',
        lessonCommands: {
          'pip install boto3 python-multipart': {
            output: [
              'Collecting boto3 python-multipart',
              'Installing collected packages: jmespath, botocore, s3transfer, boto3, python-multipart',
              'Successfully installed boto3-1.35.71 python-multipart-0.0.19',
            ],
            type: 'success',
          },
        },
        suggestions: ['pip install boto3 python-multipart'],
        script: [
          { command: 'pip install boto3 python-multipart' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор S3 хранилища сохраняет файлы и генерирует CDN ссылки. Запусти код!',
        initialCode: `class MockS3Storage:
    def __init__(self, bucket_name: str):
        self.bucket = bucket_name
        self.objects = {}

    def put_object(self, key: str, file_bytes: bytes, content_type: str) -> str:
        self.objects[key] = {"data": file_bytes, "type": content_type, "size": len(file_bytes)}
        public_url = f"https://cdn.cloud.com/{self.bucket}/{key}"
        print(f"✓ Файл '{key}' ({len(file_bytes)} байт) сохранён в бакет '{self.bucket}'")
        return public_url

s3 = MockS3Storage("my-user-media")
url = s3.put_object(
    key="avatars/user_10_avatar.png",
    file_bytes=b"FAKE_PNG_BINARY_BYTES",
    content_type="image/png"
)

print("Сгенерированный публичный CDN URL:", url)
assert url.startswith("https://cdn.cloud.com/my-user-media/avatars/")`,
      },
      tasks: [
        {
          title: 'Задание 1: проверка наличия расширения у файла',
          difficulty: 'easy',
          description: 'Напиши функцию get_file_extension(filename: str) -> str: возвращает расширение файла в нижнем регистре (например, "avatar.JPEG" -> ".jpeg"). Если расширения нет, возвращает пустую строку.',
          hints: ['import os\nreturn os.path.splitext(filename)[1].lower()'],
        },
        {
          title: 'Задание 2: парсер ключа объекта из S3 ссылки',
          difficulty: 'medium',
          description: 'Напиши функцию extract_s3_key(s3_url: str, bucket_name: str) -> str: из ссылки "https://cdn.cloud.com/my-bucket/avatars/pic.jpg" извлекает ключ "avatars/pic.jpg".',
          hints: ['prefix = f"/{bucket_name}/"\nreturn s3_url.split(prefix)[1]'],
          solution: `def extract_s3_key(url: str, bucket: str) -> str:
    token = f"/{bucket}/"
    if token not in url:
        raise ValueError("URL не содержит указанный бакет")
    return url.split(token)[1]

key = extract_s3_key("https://cdn.cloud.com/my-user-media/avatars/pic.jpg", "my-user-media")
assert key == "avatars/pic.jpg"
print("✓ Ключ объекта успешно извлечён:", key)`,
        },
        {
          title: 'Задание 3: выбор между Cloudflare R2 и Amazon S3',
          difficulty: 'hard',
          description: 'Объясни, почему для пет-проектов и стартапов Cloudflare R2 выгоднее AWS S3 (в AWS берут существенную плату за исходящий трафик Egress bandwidth, а в Cloudflare R2 исходящий трафик 100% бесплатный).',
          hints: ['Zero egress fees позволяют свободно раздавать картинки миллионам посетителей без скрытых счетов'],
        },
      ],
      mistakes: [
        {
          wrong: 'Сохранять загруженные файлы на локальный диск контейнера в папку static/uploads',
          right: 'Любой перезапуск сервера сотрёт все локальные файлы. Всегда загружай файлы в S3-совместимое облако',
        },
        {
          wrong: 'Использовать исходное имя файла от пользователя: save_file(file.filename)',
          right: 'Имена от пользователей могут содержать кириллицу, пробелы, спецсимволы и опасные пути "../../../etc/passwd". Всегда генерируй случайный uuid4()',
        },
      ],
      checklist: [
        'Понимаю, почему серверные диски эфемерны и требуют S3 хранилища',
        'Знаю концепции Bucket (бакет), Key (ключ) и CDN URL',
        'Умею генерировать безопасные имена файлов через uuid4',
        'Знаю преимущества Cloudflare R2 и MinIO',
      ],
    },

    {
      id: 'fastapi-uploadfile',
      title: 'Приём файлов в FastAPI (UploadFile) и базовая валидация',
      summary: 'Как принимать файлы через multipart/form-data, проверять MIME-типы и защищаться от загрузки файлов по 10 ГБ',
      theory: [
        {
          type: 'p',
          text: 'В FastAPI есть два способа принять файл: `bytes` (загружает весь файл целиком в оперативную память сервера) и `UploadFile` (профессиональный способ: читает файл потоком как SpooledFile). Если пользователь загрузит видео на 2 ГБ через `bytes`, сервер моментально упадёт от нехватки памяти (OOM Error). Всегда используй `UploadFile`!',
        },
        {
          type: 'steps',
          title: '3 обязательных шага валидации входящего файла',
          items: [
            { code: '1. Проверка Content-Type (MIME-тип)', note: 'Разрешаем только безопасные форматы: image/jpeg, image/png, image/webp' },
            { code: '2. Проверка размера файла (Max File Size)', note: 'Ограничиваем размер (например, не более 5 Мегабайт для аватарок)' },
            { code: '3. Безопасное чтение чанками (await file.read(1024*1024))', note: 'Читаем файл порциями, не перегружая память сервера' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Валидация типа и размера файла в FastAPI',
          lang: 'python',
          code: `from fastapi import FastAPI, UploadFile, File, HTTPException

app = FastAPI()

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 Мегабайт

@app.post("/api/upload/avatar")
async def upload_avatar(file: UploadFile = File(...)):
    # 1. Проверяем MIME-тип:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Разрешены только картинки JPG, PNG и WEBP!")
    
    # 2. Читаем содержимое и проверяем размер:
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Файл слишком большой! Максимум 5 МБ.")
        
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size_bytes": len(contents),
        "status": "validated_successfully"
    }`,
          explanation: 'Код ошибки 413 (Payload Too Large) — официальный HTTP статус для файлов, превысивших лимит размера.',
        },
        {
          title: 'Пример 2: Проверка "магических байтов" файла (Magic Numbers)',
          lang: 'python',
          code: `def is_real_png_image(file_header_bytes: bytes) -> bool:
    """Хакер может переименовать virus.exe в photo.png. Проверяем первые 8 байт (сигнатуру PNG)"""
    PNG_SIGNATURE = b"\\x89PNG\\r\\n\\x1a\\n"
    return file_header_bytes.startswith(PNG_SIGNATURE)

fake_file = b"MZ\\x90\\x00\\x03" # сигнатура exe
print("Это настоящий PNG?", is_real_png_image(fake_file)) # False`,
          explanation: 'Проверка сигнатуры файла защищает от загрузки вредоносных скриптов под видом картинок.',
        },
        {
          title: 'Пример 3: Потоковое чтение большого файла частями (Chunks)',
          lang: 'python',
          code: `async def read_file_in_chunks(file: UploadFile, chunk_size=1024*1024):
    """Читает файл порциями по 1 МБ для экономии оперативной памяти"""
    total_size = 0
    while chunk := await file.read(chunk_size):
        total_size += len(chunk)
        # можно сразу стримить чанк в S3 без сохранения на диск!
    return total_size`,
          explanation: 'Потоковая передача позволяет загружать даже 10-гигабайтные видеоролики с использованием всего 10 МБ оперативной памяти.',
        },
      ],
      terminal: {
        title: 'Загрузка файла через curl (form-data)',
        description: 'Отправка файла на эндпоинт загрузки из терминала:',
        lessonCommands: {
          'curl -X POST http://localhost:8000/api/upload/avatar -F "file=@avatar.png"': {
            output: [
              '{"filename":"avatar.png","content_type":"image/png","size_bytes":14200,"status":"validated_successfully"}',
            ],
            type: 'success',
          },
        },
        suggestions: ['curl -X POST http://localhost:8000/api/upload/avatar -F "file=@avatar.png"'],
        script: [
          { command: 'curl -X POST http://localhost:8000/api/upload/avatar -F "file=@avatar.png"' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице валидатор файлов проверяет расширения и лимиты памяти. Запусти код!',
        initialCode: `class FileValidator:
    def __init__(self, allowed_types: set, max_mb: int):
        self.allowed_types = allowed_types
        self.max_bytes = max_mb * 1024 * 1024

    def validate(self, filename: str, content_type: str, file_size_bytes: int):
        if content_type not in self.allowed_types:
            raise ValueError(f"Недопустимый тип контента: {content_type}")
        if file_size_bytes > self.max_bytes:
            raise ValueError(f"Размер файла ({file_size_bytes/1024/1024:.1f} МБ) превышает лимит!")
        return True

validator = FileValidator(
    allowed_types={"image/jpeg", "image/png"},
    max_mb=2
)

# 1. Валидный файл 500 КБ:
print("1. Проверка фото 500 КБ:", validator.validate("photo.jpg", "image/jpeg", 500 * 1024))

# 2. Файл с превышением лимита (3 МБ):
try:
    validator.validate("huge.png", "image/png", 3 * 1024 * 1024)
except ValueError as err:
    print("2. Ошибка валидации:", err)`,
      },
      tasks: [
        {
          title: 'Задание 1: добавление формата PDF в разрешенные типы',
          difficulty: 'easy',
          description: 'Создай валидатор doc_validator с разрешенным типом "application/pdf" и лимитом 10 МБ. Проверь файл документа.',
          hints: ['doc_validator = FileValidator({"application/pdf"}, max_mb=10)'],
        },
        {
          title: 'Задание 2: безопасное удаление спецсимволов из имени файла',
          difficulty: 'medium',
          description: 'Напиши функцию sanitize_filename(filename: str) -> str, которая оставляет только буквы, цифры, точки и дефисы, заменяя пробелы и спецсимволы на подчёркивание.',
          hints: ['import re\nreturn re.sub(r"[^a-zA-Z0-9.-]", "_", filename)'],
          solution: `import re

def sanitize_filename(filename: str) -> str:
    return re.sub(r"[^a-zA-Z0-9.-]", "_", filename)

clean = sanitize_filename("my avatar photo (2026)!.png")
assert clean == "my_avatar_photo__2026__.png"
print("✓ Очищенное безопасное имя файла:", clean)`,
        },
        {
          title: 'Задание 3: уязвимость Directory Traversal',
          difficulty: 'hard',
          description: 'Объясни в комментарии: почему имя файла `../../../../etc/shadow`, отправленное злоумышленником в заголовке Content-Disposition, может перезаписать системные файлы ОС, если сохранять файл локально без валидации имени.',
          hints: ['Символы ../ поднимаются вверх по дереву каталогов файловой системы сервера'],
        },
      ],
      mistakes: [
        {
          wrong: 'Использовать file: bytes = File(...) для загрузки больших файлов',
          right: 'bytes загружает весь файл в оперативную память сервера. Всегда используй UploadFile для потоковой обработки',
        },
        {
          wrong: 'Доверять расширению файла без проверки MIME-типа content_type',
          right: 'Файл virus.exe можно легко переименовать в virus.jpg. Проверяй как content_type, так и сигнатуру байтов',
        },
      ],
      checklist: [
        'Понимаю разницу между UploadFile и bytes в FastAPI',
        'Умею проверять MIME-тип и лимит размера файла',
        'Знаю код ошибки 413 Payload Too Large',
        'Понимаю важность потокового чтения файлов чанками',
      ],
    },

    {
      id: 'boto3-and-presigned-urls',
      title: 'Загрузка в S3 через boto3 и генерация публичных ссылок',
      summary: 'Как инициализировать S3 клиент в Python, загружать файлы в Cloudflare R2 / AWS и создавать безопасные временные ссылки (Presigned URLs)',
      theory: [
        {
          type: 'p',
          text: 'Для работы с любым S3-хранилищем (AWS, Cloudflare R2, Яндекс Облако, MinIO) в Python используется официальная библиотека `boto3`. Все эти сервисы говорят на одном стандартном протоколе S3 API, поэтому один и тот же код будет работать везде без изменений!',
        },
        {
          type: 'steps',
          title: 'Как загрузить файл в S3 через boto3',
          items: [
            { code: 's3_client = boto3.client("s3", ...)', note: '1. Подключаемся к S3: передаём endpoint_url (для R2), access_key и secret_key' },
            { code: 's3_client.upload_fileobj(file.file, "bucket-name", "avatars/uuid.png")', note: '2. Отправляем поток файла напрямую в бакет' },
            { code: 'url = generate_presigned_url("get_object", ...)', note: '3. Создаём временную ссылку с ограниченным сроком действия (например, на 1 час)' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Что такое Presigned URL?',
          text: 'Если ты продаёшь платный видеокурс или приватные документы — бакет должен быть ЗАКРЫТ от публики. Чтобы покупатель мог скачать свой оплаченный файл, бэкенд генерирует Presigned URL — уникальную ссылку с зашифрованной криптографической подписью, которая действует ровно 15 минут, а затем навсегда сгорает!',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Готовый сервис загрузки файлов в S3/Cloudflare R2 на Python',
          lang: 'python',
          code: `import os
import boto3
from botocore.config import Config

class S3Service:
    def __init__(self):
        self.bucket = os.getenv("S3_BUCKET_NAME", "my-app-media")
        self.client = boto3.client(
            "s3",
            endpoint_url=os.getenv("S3_ENDPOINT_URL"), # для Cloudflare R2
            aws_access_key_id=os.getenv("S3_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("S3_SECRET_ACCESS_KEY"),
            config=Config(signature_version="s3v4")
        )

    def upload_file(self, file_obj, object_key: str, content_type: str) -> str:
        """Загружает файл в S3 и возвращает публичную ссылку"""
        self.client.upload_fileobj(
            file_obj,
            self.bucket,
            object_key,
            ExtraArgs={"ContentType": content_type}
        )
        return f"{os.getenv('S3_PUBLIC_DOMAIN')}/{object_key}"`,
          explanation: 'Метод upload_fileobj загружает файл потоком без создания временных файлов на диске сервера.',
        },
        {
          title: 'Пример 2: Генерация временной приватной ссылки (Presigned URL)',
          lang: 'python',
          code: `def generate_download_link(s3_client, bucket: str, object_key: str, expires_in=3600) -> str:
    """Генерирует безопасную ссылку на скачивание файла, действующую 1 час"""
    url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": object_key},
        ExpiresIn=expires_in  # 3600 секунд = 1 час
    )
    return url`,
          explanation: 'Presigned URL позволяет клиенту скачивать файл напрямую из S3 без нагрузки на твой сервер FastAPI.',
        },
        {
          title: 'Пример 3: Прямая загрузка с браузера в S3 минуя бэкенд (Direct-to-S3)',
          lang: 'python',
          code: `def generate_presigned_upload_post(s3_client, bucket: str, object_key: str):
    """Позволяет фронтенду загружать 5-гигабайтные видео напрямую в S3, разгружая бэкенд"""
    response = s3_client.generate_presigned_post(
        bucket,
        object_key,
        Fields={"acl": "public-read"},
        Conditions=[["content-length-range", 10, 100 * 1024 * 1024]], # 10 байт..100 МБ
        ExpiresIn=300
    )
    return response`,
          explanation: 'Direct Upload — вершина оптимизации: сервер только подписывает политику, а браузер шлёт файл в облако.',
        },
      ],
      terminal: {
        title: 'Просмотр файлов бакета через AWS CLI',
        description: 'Команды просмотра содержимого бакета S3:',
        lessonCommands: {
          'aws s3 ls s3://my-app-media/avatars/': {
            output: [
              '2026-09-02 14:00:01      14200 user_42_avatar.png',
              '2026-09-02 14:05:12      38900 user_99_avatar.jpg',
            ],
            type: 'default',
          },
        },
        suggestions: ['aws s3 ls s3://my-app-media/avatars/'],
        script: [
          { command: 'aws s3 ls s3://my-app-media/avatars/' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор генерации Presigned URLs подписывает временные ссылки. Запусти код!',
        initialCode: `import time
import hashlib

class MockPresignedSigner:
    def __init__(self, secret_key: str):
        self.secret = secret_key

    def generate_presigned_url(self, bucket: str, key: str, expires_in_sec: int = 60) -> str:
        expire_timestamp = int(time.time()) + expires_in_sec
        signature = hashlib.sha256(f"{bucket}/{key}:{expire_timestamp}:{self.secret}".encode()).hexdigest()[:12]
        return f"https://s3.cloud.com/{bucket}/{key}?Expires={expire_timestamp}&Signature={signature}"

    def verify_url(self, url: str) -> bool:
        # Проверяем, не истёк ли срок действия
        params = dict(p.split("=") for p in url.split("?")[1].split("&"))
        exp = int(params["Expires"])
        return time.time() < exp

signer = MockPresignedSigner("my_secret_aws_key")
link = signer.generate_presigned_url("private-contracts", "contract_42.pdf", expires_in_sec=10)

print("Сгенерированная временная ссылка:", link)
print("Ссылка активна прямо сейчас?", signer.verify_url(link))
assert signer.verify_url(link) is True`,
      },
      tasks: [
        {
          title: 'Задание 1: симуляция истечения срока ссылки',
          difficulty: 'easy',
          description: 'Сгенерируй ссылку с expires_in_sec = -10 (как будто ссылка была создана в прошлом). Проверь, что verify_url(link) возвращает False.',
          hints: ['expired_link = signer.generate_presigned_url("bucket", "key", expires_in_sec=-10)'],
        },
        {
          title: 'Задание 2: сохранение URL аватарки в базу данных',
          difficulty: 'medium',
          description: 'Напиши функцию update_user_avatar_in_db(user_id: int, s3_url: str) -> dict: имитирует сохранение ссылки в словаре пользователей `users_db = {1: {"name": "Alex", "avatar_url": None}}`.',
          hints: ['users_db[user_id]["avatar_url"] = s3_url'],
          solution: `users_db = {1: {"name": "Alex", "avatar_url": None}}

def update_user_avatar(user_id: int, url: str):
    users_db[user_id]["avatar_url"] = url
    return users_db[user_id]

updated = update_user_avatar(1, "https://cdn.cloud.com/avatars/alex.png")
assert updated["avatar_url"] is not None
print("✓ Профиль пользователя обновлён ссылкой на аватарку:", updated)`,
        },
        {
          title: 'Задание 3: практическая интеграция загрузки файлов в проект портфолио',
          difficulty: 'hard',
          description: 'Добавь в свой проект Auth API (проект 3) эндпоинт POST /users/me/avatar: принимает файл картинки через UploadFile, валидирует размер и сохраняет CDN ссылку в профиль пользователя!',
          hints: ['Поздравляем! Ты освоил промышленную архитектуру работы с медиафайлами!'],
        },
      ],
      mistakes: [
        {
          wrong: 'Оставлять бакет с конфиденциальными документами полностью публичным (Public Read)',
          right: 'Приватные данные всегда хранятся в закрытом бакете и раздаются только через временные Presigned URLs',
        },
        {
          wrong: 'Прокачивать тяжелые файлы через бэкенд при наличии миллионов пользователей',
          right: 'Для видео и тяжелых архивов используй Presigned POST (Direct-to-S3), чтобы браузер загружал файлы напрямую в облако минуя сервер',
        },
      ],
      checklist: [
        'Умею подключаться к S3 через библиотеку boto3',
        'Понимаю, как загружать файлы методом upload_fileobj',
        'Знаю назначение и устройство Presigned URLs',
        'Умею связывать загруженные файлы с записями в PostgreSQL',
      ],
    },
  ],
};
