"""
Мини-версия SQLAlchemy для песочницы в браузере.

В отличие от мини-FastAPI (там пришлось имитировать вообще всё), здесь под
капотом настоящий sqlite3 из стандартной библиотеки Python — то есть SQL,
который реально выполняется, реальные ограничения (UNIQUE, NOT NULL) и
настоящие ошибки. Сверху — маленькая, но по-настоящему рабочая копия API
SQLAlchemy: Column, declarative_base, sessionmaker, session.query(...) и т.д.
Код ученика выглядит один в один как в настоящем проекте (только вместо
postgresql://... используется sqlite:///:memory:, потому что открыть
настоящее сетевое соединение из браузера нельзя).

Всё определено внутри _bootstrap(), чтобы имя переменной ученика (самое
частое — `Session = sessionmaker(bind=engine)`) не могло случайно
перезаписать внутренний класс с тем же именем.
"""

import sqlite3
import sys
import types


def _bootstrap():
    class Integer:
        sql_type = "INTEGER"

    class String:
        sql_type = "TEXT"

        def __init__(self, length=None):
            self.length = length

    class Float:
        sql_type = "REAL"

    class Boolean:
        sql_type = "INTEGER"

    class Column:
        def __init__(self, type_, primary_key=False, nullable=True, unique=False, default=None):
            self.type_ = type_
            self.primary_key = primary_key
            self.nullable = False if primary_key else nullable
            self.unique = unique
            self.default = default
            self.name = None

    class _Metadata:
        def __init__(self):
            self.tables = {}

        def create_all(self, engine):
            conn = engine.connection
            for model in self.tables.values():
                parts = []
                for name, col in model.__columns__.items():
                    sql_type = col.type_.sql_type if isinstance(col.type_, type) else col.type_.sql_type
                    piece = f"{name} {sql_type}"
                    if col.primary_key:
                        piece += " PRIMARY KEY AUTOINCREMENT" if sql_type == "INTEGER" else " PRIMARY KEY"
                    else:
                        if col.unique:
                            piece += " UNIQUE"
                        if not col.nullable:
                            piece += " NOT NULL"
                    parts.append(piece)
                sql = f"CREATE TABLE IF NOT EXISTS {model.__tablename__} ({', '.join(parts)})"
                conn.execute(sql)
            conn.commit()

    registry_tables = {}
    metadata_singleton = _Metadata()
    metadata_singleton.tables = registry_tables

    class _DeclarativeMeta(type):
        def __new__(mcs, name, bases, namespace):
            cls = super().__new__(mcs, name, bases, namespace)
            if bases:
                columns = {}
                for key, value in list(namespace.items()):
                    if isinstance(value, Column):
                        value.name = key
                        columns[key] = value
                cls.__columns__ = columns
                tablename = namespace.get("__tablename__")
                if tablename:
                    registry_tables[tablename] = cls
            return cls

    def declarative_base():
        class Base(metaclass=_DeclarativeMeta):
            metadata = metadata_singleton

            def __init__(self, **kwargs):
                for col_name, col in self.__columns__.items():
                    setattr(self, col_name, kwargs.get(col_name, col.default))

            def __repr__(self):
                fields = ", ".join(f"{k}={getattr(self, k)!r}" for k in self.__columns__)
                return f"{type(self).__name__}({fields})"

        return Base

    class Engine:
        def __init__(self, url):
            self.url = url
            self.connection = sqlite3.connect(":memory:")
            self.connection.execute("PRAGMA foreign_keys = ON")

    def create_engine(url, **kwargs):
        return Engine(url)

    class IntegrityError(Exception):
        pass

    class Query:
        def __init__(self, session, model):
            self.session = session
            self.model = model
            self._where = []
            self._params = []

        def filter_by(self, **kwargs):
            for k, v in kwargs.items():
                self._where.append(f"{k} = ?")
                self._params.append(v)
            return self

        def _build_sql(self):
            cols = list(self.model.__columns__)
            sql = f"SELECT {', '.join(cols)} FROM {self.model.__tablename__}"
            if self._where:
                sql += " WHERE " + " AND ".join(self._where)
            return sql, cols

        def _row_to_obj(self, row, cols):
            obj = self.model()
            for name, value in zip(cols, row):
                setattr(obj, name, value)
            return obj

        def all(self):
            sql, cols = self._build_sql()
            cur = self.session.engine.connection.execute(sql, self._params)
            return [self._row_to_obj(row, cols) for row in cur.fetchall()]

        def first(self):
            results = self.all()
            return results[0] if results else None

        def get(self, id_):
            pk_name = next(name for name, col in self.model.__columns__.items() if col.primary_key)
            return self.filter_by(**{pk_name: id_}).first()

        def count(self):
            return len(self.all())

        def delete(self):
            sql = f"DELETE FROM {self.model.__tablename__}"
            if self._where:
                sql += " WHERE " + " AND ".join(self._where)
            cur = self.session.engine.connection.execute(sql, self._params)
            self.session.engine.connection.commit()
            return cur.rowcount

    class Session:
        def __init__(self, engine):
            self.engine = engine
            self._new = []

        def add(self, obj):
            self._new.append(obj)

        def commit(self):
            try:
                for obj in self._new:
                    model = type(obj)
                    cols = [name for name, col in model.__columns__.items() if not col.primary_key]
                    values = [getattr(obj, name) for name in cols]
                    placeholders = ", ".join("?" for _ in cols)
                    sql = f"INSERT INTO {model.__tablename__} ({', '.join(cols)}) VALUES ({placeholders})"
                    cur = self.engine.connection.execute(sql, values)
                    pk_name = next((name for name, col in model.__columns__.items() if col.primary_key), None)
                    if pk_name:
                        setattr(obj, pk_name, cur.lastrowid)
                self.engine.connection.commit()
            except sqlite3.IntegrityError as exc:
                self.engine.connection.rollback()
                raise IntegrityError(str(exc)) from exc
            finally:
                self._new = []

        def query(self, model):
            return Query(self, model)

        def get(self, model, id_):
            return self.query(model).get(id_)

        def delete(self, obj):
            model = type(obj)
            pk_name = next(name for name, col in model.__columns__.items() if col.primary_key)
            self.query(model).filter_by(**{pk_name: getattr(obj, pk_name)}).delete()

        def close(self):
            pass

    def sessionmaker(bind=None, **kwargs):
        def factory():
            return Session(bind)
        return factory

    sa = types.ModuleType("sqlalchemy")
    sa.create_engine = create_engine
    sa.Column = Column
    sa.Integer = Integer
    sa.String = String
    sa.Float = Float
    sa.Boolean = Boolean

    orm = types.ModuleType("sqlalchemy.orm")
    orm.declarative_base = declarative_base
    orm.sessionmaker = sessionmaker
    orm.Session = Session
    sa.orm = orm

    exc_module = types.ModuleType("sqlalchemy.exc")
    exc_module.IntegrityError = IntegrityError
    sa.exc = exc_module

    sys.modules["sqlalchemy"] = sa
    sys.modules["sqlalchemy.orm"] = orm
    sys.modules["sqlalchemy.exc"] = exc_module


_bootstrap()
del _bootstrap
