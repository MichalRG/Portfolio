import { LocalizedBlogContent } from '../../../interfaces/blog-article.interface';

export const COMMENTS_API_WITH_FASTAPI_AND_DYNAMODB_CONTENT: LocalizedBlogContent =
  {
    en: `## Architecture overview
For comments I chose a small serverless backend.
The API accepts public submissions and supports moderation operations.

## Core constraints
I focused on reliability and abuse resistance from day one.
Input validation, strict CORS, and careful rate limiting are key.

### Data model
DynamoDB stores comment records by article slug and creation timestamp.
Moderation status and audit fields are part of each record.

### Moderation flow
Admin actions update status without deleting historical context.
This keeps the system transparent and easier to debug.

## Operational lessons
Even a small API needs clear observability and guardrails.
Simple architecture can still be production ready when discipline is high.`,
    pl: `## Przeglad architektury
Dla komentarzy wybralem maly backend serverless.
API przyjmuje publiczne wpisy i wspiera operacje moderacyjne.

## Kluczowe zalozenia
Od poczatku skupilem sie na niezawodnosci i ochronie przed naduzyciami.
Wazne sa walidacja danych, restrykcyjny CORS i limity zapytan.

### Model danych
DynamoDB przechowuje komentarze po slug artykulu i czasie utworzenia.
Status moderacji i pola audytowe sa czescia kazdego rekordu.

### Przeplyw moderacji
Akcje administratora zmieniaja status bez kasowania historii.
To ulatwia analize i utrzymanie systemu.

## Wnioski operacyjne
Nawet maly backend potrzebuje monitoringu i zabezpieczen.
Prosta architektura tez moze byc gotowa produkcyjnie.`,
  };
