"""
Мини-версия FastAPI и Pydantic для песочницы в браузере.

Настоящий FastAPI и Pydantic в браузере запустить сложно (они рассчитаны на
реальный сервер). Поэтому здесь — маленькая, но по-настоящему рабочая копия
той же самой логики: те же названия, тот же способ писать код. Всё, что
ученик напишет здесь (@app.get, BaseModel, HTTPException, Depends, Header,
OAuth2PasswordBearer...), будет работать один в один так же, как в настоящем
проекте на компьютере.

Всё определено внутри одной функции _bootstrap() и не "утекает" в общее
пространство имён песочницы — иначе имя переменной ученика (например,
`Session`, `app` или `status`) могло бы случайно перезаписать что-то важное
здесь. Наружу проходят только сами модули fastapi/pydantic через sys.modules.
"""

import re
import sys
import types
import inspect


def _bootstrap():
    class HTTPException(Exception):
        def __init__(self, status_code, detail=None):
            self.status_code = status_code
            self.detail = detail
            super().__init__(str(detail))

    class ValidationError(Exception):
        """Похожа на настоящий pydantic.ValidationError: хранит список ошибок,
        каждая — словарь с полями loc/msg/type, как в реальном FastAPI."""

        def __init__(self, errors):
            self._errors = errors
            super().__init__(str(errors))

        def errors(self):
            return self._errors

    class _FieldInfo:
        def __init__(self, default=..., gt=None, ge=None, lt=None, le=None, min_length=None, max_length=None):
            self.default = default
            self.gt = gt
            self.ge = ge
            self.lt = lt
            self.le = le
            self.min_length = min_length
            self.max_length = max_length

    def Field(default=..., *, gt=None, ge=None, lt=None, le=None, min_length=None, max_length=None, **kwargs):
        return _FieldInfo(default, gt=gt, ge=ge, lt=lt, le=le, min_length=min_length, max_length=max_length)

    def _collect_annotations(cls):
        annotations = {}
        for klass in reversed(cls.__mro__):
            annotations.update(getattr(klass, "__annotations__", {}))
        return annotations

    def _field_info_for(cls, name):
        value = getattr(cls, name, None)
        return value if isinstance(value, _FieldInfo) else None

    def _check_constraints(value, field_info, name):
        if field_info is None:
            return None
        if field_info.gt is not None and not (value > field_info.gt):
            return {"loc": ["body", name], "msg": f"значение должно быть больше {field_info.gt}", "type": "value_error.number.not_gt"}
        if field_info.ge is not None and not (value >= field_info.ge):
            return {"loc": ["body", name], "msg": f"значение должно быть не меньше {field_info.ge}", "type": "value_error.number.not_ge"}
        if field_info.lt is not None and not (value < field_info.lt):
            return {"loc": ["body", name], "msg": f"значение должно быть меньше {field_info.lt}", "type": "value_error.number.not_lt"}
        if field_info.le is not None and not (value <= field_info.le):
            return {"loc": ["body", name], "msg": f"значение должно быть не больше {field_info.le}", "type": "value_error.number.not_le"}
        if field_info.min_length is not None and len(value) < field_info.min_length:
            return {"loc": ["body", name], "msg": f"длина должна быть не меньше {field_info.min_length}", "type": "value_error.any_str.min_length"}
        if field_info.max_length is not None and len(value) > field_info.max_length:
            return {"loc": ["body", name], "msg": f"длина должна быть не больше {field_info.max_length}", "type": "value_error.any_str.max_length"}
        return None

    def _coerce(value, annotation):
        try:
            if annotation is int and not isinstance(value, bool):
                return int(value)
            if annotation is float:
                return float(value)
            if annotation is str:
                return str(value)
            if annotation is bool:
                if isinstance(value, str):
                    return value.lower() in ("1", "true", "yes")
                return bool(value)
        except (TypeError, ValueError):
            raise ValueError(f"Не удалось привести значение {value!r} к типу {annotation}")
        return value

    class BaseModel:
        def __init__(self, **data):
            annotations = _collect_annotations(type(self))
            errors = []
            for name, field_type in annotations.items():
                field_info = _field_info_for(type(self), name)
                if name in data:
                    try:
                        coerced = _coerce(data[name], field_type)
                    except ValueError as exc:
                        errors.append({"loc": ["body", name], "msg": str(exc), "type": "type_error"})
                        continue
                    constraint_error = _check_constraints(coerced, field_info, name)
                    if constraint_error:
                        errors.append(constraint_error)
                        continue
                    setattr(self, name, coerced)
                elif field_info is not None and field_info.default is not ...:
                    setattr(self, name, field_info.default)
                elif field_info is None and hasattr(type(self), name):
                    setattr(self, name, getattr(type(self), name))
                else:
                    errors.append({"loc": ["body", name], "msg": "field required", "type": "value_error.missing"})
            if errors:
                raise ValidationError(errors)

        def dict(self):
            annotations = _collect_annotations(type(self))
            return {name: getattr(self, name) for name in annotations}

        model_dump = dict

        def __repr__(self):
            fields = ", ".join(f"{k}={v!r}" for k, v in self.dict().items())
            return f"{type(self).__name__}({fields})"

    def _to_jsonable(value):
        if isinstance(value, BaseModel):
            return {k: _to_jsonable(v) for k, v in value.dict().items()}
        if isinstance(value, list):
            return [_to_jsonable(v) for v in value]
        if isinstance(value, dict):
            return {k: _to_jsonable(v) for k, v in value.items()}
        return value

    class Depends:
        def __init__(self, dependency=None):
            self.dependency = dependency

    class _HeaderInfo:
        def __init__(self, default=...):
            self.default = default

    def Header(default=..., **kwargs):
        return _HeaderInfo(default)

    class OAuth2PasswordBearer:
        def __init__(self, tokenUrl, **kwargs):
            self.tokenUrl = tokenUrl

        def __call__(self, headers):
            headers = headers or {}
            norm = {k.lower(): v for k, v in headers.items()}
            auth = norm.get("authorization")
            if not auth or not auth.lower().startswith("bearer "):
                raise HTTPException(401, "Not authenticated")
            return auth.split(" ", 1)[1]

    class OAuth2PasswordRequestForm:
        def __init__(self, username="", password="", scope="", **kwargs):
            self.username = username
            self.password = password
            self.scopes = scope.split() if scope else []

    def _resolve_kwargs(func, path_values, query, json_body, form_data, headers):
        kwargs = {}
        for name, param in inspect.signature(func).parameters.items():
            annotation = param.annotation
            default = param.default

            if isinstance(default, Depends):
                dep = default.dependency
                if dep is None:
                    if isinstance(annotation, type) and issubclass(annotation, OAuth2PasswordRequestForm):
                        kwargs[name] = annotation(**(form_data or {}))
                    else:
                        raise HTTPException(500, "Песочница не знает, как создать эту зависимость")
                elif isinstance(dep, OAuth2PasswordBearer):
                    kwargs[name] = dep(headers)
                else:
                    dep_kwargs = _resolve_kwargs(dep, path_values, query, json_body, form_data, headers)
                    kwargs[name] = dep(**dep_kwargs)
                continue

            if isinstance(default, _HeaderInfo):
                norm = {k.lower().replace("-", "_"): v for k, v in (headers or {}).items()}
                key = name.lower()
                if key in norm:
                    kwargs[name] = norm[key]
                elif default.default is not ...:
                    kwargs[name] = default.default
                else:
                    raise HTTPException(422, f"Отсутствует обязательный заголовок: {name}")
                continue

            is_model = isinstance(annotation, type) and issubclass(annotation, BaseModel)
            if name in path_values:
                ann = annotation if annotation is not inspect.Parameter.empty else str
                kwargs[name] = _coerce(path_values[name], ann)
            elif is_model:
                kwargs[name] = annotation(**(json_body or {}))
            elif annotation is dict and json_body is not None:
                kwargs[name] = json_body
            elif name in query:
                ann = annotation if annotation is not inspect.Parameter.empty else str
                kwargs[name] = _coerce(query[name], ann)
            elif default is not inspect.Parameter.empty:
                kwargs[name] = default
            else:
                raise HTTPException(422, f"Отсутствует обязательный параметр: {name}")
        return kwargs

    class _Route:
        def __init__(self, method, path, func, status_code=200):
            self.method = method
            self.path = path
            self.func = func
            self.status_code = status_code
            self.param_names = []
            pattern = ""
            for part in path.strip("/").split("/"):
                if not part:
                    continue
                if part.startswith("{") and part.endswith("}"):
                    name = part[1:-1]
                    self.param_names.append(name)
                    pattern += r"/(?P<%s>[^/]+)" % name
                else:
                    pattern += "/" + re.escape(part)
            self.regex = re.compile("^" + (pattern or "") + "/?$")

    class FastAPI:
        def __init__(self, title="FastAPI", **kwargs):
            self.title = title
            self.routes = []

        def _register(self, method, path, status_code):
            def decorator(func):
                self.routes.append(_Route(method, path, func, status_code))
                return func
            return decorator

        def get(self, path, status_code=200, **kwargs):
            return self._register("GET", path, status_code)

        def post(self, path, status_code=200, **kwargs):
            return self._register("POST", path, status_code)

        def put(self, path, status_code=200, **kwargs):
            return self._register("PUT", path, status_code)

        def patch(self, path, status_code=200, **kwargs):
            return self._register("PATCH", path, status_code)

        def delete(self, path, status_code=200, **kwargs):
            return self._register("DELETE", path, status_code)

    class _FakeResponse:
        def __init__(self, status_code, body):
            self.status_code = status_code
            self._body = body

        @property
        def text(self):
            return str(self._body) if self._body is not None else ""

        def json(self):
            return _to_jsonable(self._body)

    class HTMLResponse:
        def __init__(self, content="", status_code=200):
            self.content = content
            self.status_code = status_code

        def __str__(self):
            return str(self.content)

    class JSONResponse:
        def __init__(self, content=None, status_code=200):
            self.content = content
            self.status_code = status_code

        def __str__(self):
            return str(self.content)

    class TestClient:
        """Мини-копия fastapi.testclient.TestClient — "отправляет" запрос в приложение
        прямо внутри Python, без настоящей сети (так же можно тестировать и в реальном FastAPI)."""

        def __init__(self, app):
            self.app = app

        def _call(self, method, path, json_body=None, params=None, headers=None, data=None):
            path_only, _, query_string = path.partition("?")
            if not path_only.startswith("/"):
                path_only = "/" + path_only
            query = dict(params or {})
            if query_string:
                for pair in query_string.split("&"):
                    if "=" in pair:
                        k, v = pair.split("=", 1)
                        query[k] = v

            for route in self.app.routes:
                if route.method != method:
                    continue
                match = route.regex.match(path_only)
                if not match:
                    continue
                path_values = match.groupdict()
                try:
                    kwargs = _resolve_kwargs(route.func, path_values, query, json_body, data, headers or {})
                    result = route.func(**kwargs)
                    return _FakeResponse(route.status_code, result)
                except ValidationError as exc:
                    return _FakeResponse(422, {"detail": exc.errors()})
                except HTTPException as exc:
                    return _FakeResponse(exc.status_code, {"detail": exc.detail})
                except ValueError as exc:
                    return _FakeResponse(422, {"detail": str(exc)})
                except Exception:
                    return _FakeResponse(500, {"detail": "Internal Server Error"})

            return _FakeResponse(404, {"detail": "Not Found"})

        def get(self, path, params=None, headers=None):
            return self._call("GET", path, params=params, headers=headers)

        def post(self, path, json=None, data=None, headers=None):
            return self._call("POST", path, json_body=json, data=data, headers=headers)

        def put(self, path, json=None, data=None, headers=None):
            return self._call("PUT", path, json_body=json, data=data, headers=headers)

        def patch(self, path, json=None, data=None, headers=None):
            return self._call("PATCH", path, json_body=json, data=data, headers=headers)

        def delete(self, path, headers=None):
            return self._call("DELETE", path, headers=headers)

    fastapi_module = types.ModuleType("fastapi")
    fastapi_module.FastAPI = FastAPI
    fastapi_module.HTTPException = HTTPException
    fastapi_module.Depends = Depends
    fastapi_module.Header = Header

    responses_module = types.ModuleType("fastapi.responses")
    responses_module.HTMLResponse = HTMLResponse
    responses_module.JSONResponse = JSONResponse
    fastapi_module.responses = responses_module

    status_module = types.ModuleType("fastapi.status")
    for code, name in [
        (200, "HTTP_200_OK"), (201, "HTTP_201_CREATED"), (204, "HTTP_204_NO_CONTENT"),
        (400, "HTTP_400_BAD_REQUEST"), (401, "HTTP_401_UNAUTHORIZED"), (403, "HTTP_403_FORBIDDEN"),
        (404, "HTTP_404_NOT_FOUND"), (409, "HTTP_409_CONFLICT"), (422, "HTTP_422_UNPROCESSABLE_ENTITY"),
        (500, "HTTP_500_INTERNAL_SERVER_ERROR"),
    ]:
        setattr(status_module, name, code)
    fastapi_module.status = status_module

    testclient_module = types.ModuleType("fastapi.testclient")
    testclient_module.TestClient = TestClient
    fastapi_module.testclient = testclient_module

    security_module = types.ModuleType("fastapi.security")
    security_module.OAuth2PasswordBearer = OAuth2PasswordBearer
    security_module.OAuth2PasswordRequestForm = OAuth2PasswordRequestForm
    fastapi_module.security = security_module

    pydantic_module = types.ModuleType("pydantic")
    pydantic_module.BaseModel = BaseModel
    pydantic_module.Field = Field
    pydantic_module.ValidationError = ValidationError

    sys.modules["fastapi"] = fastapi_module
    sys.modules["fastapi.responses"] = responses_module
    sys.modules["fastapi.testclient"] = testclient_module
    sys.modules["fastapi.security"] = security_module
    sys.modules["fastapi.status"] = status_module
    sys.modules["pydantic"] = pydantic_module


_bootstrap()
del _bootstrap
