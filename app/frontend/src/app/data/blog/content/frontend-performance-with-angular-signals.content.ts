import { LocalizedBlogContent } from '../../../interfaces/blog-article.interface';

export const FRONTEND_PERFORMANCE_WITH_ANGULAR_SIGNALS_CONTENT: LocalizedBlogContent =
  {
    en: `## Why signals improved my code
Signals made UI state transitions easier to reason about.
I reduced manual subscription plumbing in several components.

## Practical migration pattern
I start by converting local view state, then move derived values to computed signals.
Observable streams still stay useful for async sources.

### Avoid over-modeling
Not every value needs to become a signal.
Simple constants and one-off values should stay simple.

### Rendering wins
Computed values helped me keep templates clean and predictable.
Combined with OnPush, updates became easier to follow.

## Takeaway
Signals are not a silver bullet, but they improve day to day ergonomics.
Used with discipline, they make complex pages more maintainable.`,
    pl: `## Dlaczego sygnaly poprawily moj kod
Sygnaly uproscily zarzadzanie stanem widoku.
Ograniczylem reczne spinanie subskrypcji w kilku komponentach.

## Praktyczny schemat migracji
Najpierw przenosze lokalny stan UI, potem wartosci pochodne do computed.
Strumienie Observable nadal sa dobre dla asynchronicznych zrodel.

### Unikaj nadmiarowej abstrakcji
Nie kazda wartosc musi byc sygnalem.
Stale i jednorazowe wartosci powinny pozostac proste.

### Korzysci w renderowaniu
Computed pozwalaja utrzymac szablony w porzadku.
W polaczeniu z OnPush aktualizacje sa bardziej przewidywalne.

## Podsumowanie
Sygnaly nie rozwiazuja wszystkiego, ale poprawiaja codzienna prace.
Przy dobrych zasadach latwiej utrzymac bardziej zlozone widoki.`,
  };
