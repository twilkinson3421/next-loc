import { NextLocTypes } from "../types";

export function* generateLocDedup(t: NextLocTypes.TFunction) {
  const previousKeys = new Set<string>();
  const previousAnswers = new Map<string, ReturnType<NextLocTypes.TFunction>>();

  while (true) {
    const key: string = yield;
    let trueDedupThisAnswer: undefined | ReturnType<NextLocTypes.TFunction> = undefined;

    if (previousKeys.has(key)) {
      yield previousAnswers.get(key)!;
    } else {
      trueDedupThisAnswer = t(key);
      previousKeys.add(key);
      previousAnswers.set(key, trueDedupThisAnswer);
      yield trueDedupThisAnswer!;
    }
  }
}

export function dedupTranslationNow(
  iter: ReturnType<typeof generateLocDedup>,
  key: string
) {
  iter.next().value;
  return iter.next(key).value!;
}

export function iterToTranslator(iter: ReturnType<typeof generateLocDedup>) {
  return (key: string) => dedupTranslationNow(iter, key);
}
