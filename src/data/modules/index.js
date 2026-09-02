import { module1 } from './module1';
import { module2 } from './module2';
import { module3 } from './module3';
import { module4 } from './module4';
import { module5 } from './module5';
import { module6 } from './module6';
import { module7 } from './module7';
import { module8 } from './module8';
import { module9 } from './module9';
import { module10 } from './module10';
import { module11 } from './module11';
import { module12 } from './module12';
import { module13 } from './module13';
import { module14 } from './module14';
import { module15 } from './module15';
import { module16 } from './module16';
import { module17 } from './module17';
import { module18 } from './module18';
import { module19 } from './module19';
import { module20 } from './module20';
import { module21 } from './module21';
import { module22 } from './module22';
import { module23 } from './module23';
import { module24 } from './module24';
import { module25 } from './module25';
import { module26 } from './module26';
import { module27 } from './module27';
import { module28 } from './module28';
import { module29 } from './module29';
import { module30 } from './module30';
import { module31 } from './module31';

export const modules = [
  module1,
  module2,
  module3,
  module4,
  module5,
  module6,
  module7,
  module8,
  module9,
  module10,
  module11,
  module12,
  module13,
  module14,
  module15,
  module16,
  module17,
  module18,
  module19,
  module20,
  module21,
  module22,
  module23,
  module24,
  module25,
  module26,
  module27,
  module28,
  module29,
  module30,
  module31,
];

export function findModule(moduleId) {
  return modules.find((m) => m.id === moduleId);
}

export function findLesson(moduleId, lessonId) {
  const module = findModule(moduleId);
  if (!module) return null;
  const lesson = module.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;
  return { module, lesson };
}

export function flatLessons() {
  return modules.flatMap((m) => m.lessons.map((l) => ({ module: m, lesson: l })));
}

export function adjacentLessons(moduleId, lessonId) {
  const flat = flatLessons();
  const index = flat.findIndex((x) => x.module.id === moduleId && x.lesson.id === lessonId);
  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index >= 0 && index < flat.length - 1 ? flat[index + 1] : null,
  };
}
