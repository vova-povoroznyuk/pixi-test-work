# Port Simulation (test task)

Невелика симуляція порту на PixiJS + TypeScript.
Кораблі двох типів (FULL, EMPTY) спавняться, стають у свою чергу, заходять у доки, проходять "loading" (після якого міняють стан cargo/empty) і виходять з порту.

## Як запустити

Залежить від твого шаблону/бандлера, але логіка старту така:

- `main.ts` створює `App` і `Scene`
- ініціалізує Pixi Application (`App.init()`)
- створює `PortController(scene)` і викликає `port.start()`
- додає `scene.root` у `app.stage`

Типовий запуск:

1. `npm i`
2. `npm run dev`

## Що тут є

### Rendering

- `App.ts`
  - створює Pixi `Application`
  - додає canvas у DOM
  - ставить тікер для tween-анімацій через `TweenTicker.installTicker(app)`

- `Scene.ts`
  - `root` контейнер
  - `queueLayer` (кораблі у чергах)
  - `portLayer` (доки, стіни порту)
  - малює верхню/нижню стіни порту (відділення зони порту від черги)

- `TweenTicker.ts`
  - один `@tweenjs/tween.js` Group на весь проєкт
  - апдейтиться з Pixi ticker
  - використовується кораблями для руху

### Domain / Logic

#### Кораблі

- `Ship.ts`
  - Pixi Graphics для відмальовки
  - `isCargo` впливає на рендер (заливка або stroke)
  - `move({ points, speed })` виконує рух по сегментах через tween
  - захист від паралельних рухів (`moving`)
  - `destroy()` стопає активний tween і прибирає графіку

- `ShipService.ts`
  - реєстр кораблів `Map<string, Ship>`
  - `spawnShip(scene, id, type)` спавнить справа за екраном у `queueLayer`
  - `moveShip(shipId, points, speed)`
  - `toggleCargo(shipId)` міняє стан корабля
  - `destroyShip(shipId)` чистить ship з мапи і сцени

#### Черги

- `ShipQueue.ts`
  - проста модель черги як масив `slots`
  - `assign(shipId)` додає в кінець і повертає позицію цілі
  - `dequeueWithExit()` виймає з голови
  - `updateQueue()` генерує список `MoveUpdate` для зсуву решти кораблів

- `ShipQueueFactory.ts`
  - створює 2 черги: cargo та empty (з різними базовими позиціями/кроком)

#### Доки

- `Dock.ts`
  - тримає `route` (шлях заходу/виходу)
  - `shipId`, `isShipReady`, `isLoading`, `isCargo`
  - `startLoading(toggleShip, callTrigger)`
    - через `setTimeout(DOCK_LOADING_TIME)` міняє `isCargo`
    - робить корабель "ready" і тригерить координатор

- `DockViewFactory.ts`
  - створює набір доків (`DOCK_COUNT`) і рахує для кожного:
    - y-позицію
    - `route` з 3 точок: старт порту -> підхід -> док

- `DockAssignmentPolicy.ts`
  - `pickDockForEnter(...)`
    - якщо є EMPTY-кораблі і є доки з cargo-станом, пріоритезує їх
    - інакше бере перший доступний "без cargo"
  - `pickQueueForDock(dock, emptyQueue, cargoQueue)`
    - якщо док cargo, то в нього заводимо EMPTY (щоб після loading стати cargo)
    - якщо док empty, то заводимо FULL

#### Оркестрація

- `PortCoordinator.ts` (експорт: `PortController`)
  - головний координатор
  - два цикли:
    1. spawn loop (`setInterval` з `SPAWN_INTERVAL`) генерує кораблі випадкового типу, кладе в відповідну чергу, рухає до своєї позиції
    2. керований run-loop через `trigger()/run()`:
       - гарантує послідовність операцій і "добиває" pending події
       - не блокується на довгих операціях типу loading: коли док завершує loading, він сам викликає `trigger()`

  - Пріоритет кроку (`stepOne()`):
    1. якщо є док з `isShipReady`, робимо `dispatchExit(doc)`
       - виводимо корабель з доку назад по маршруту, потім за екран і знищуємо
    2. якщо є порожні доки, робимо `dispatchEnter(emptyDocs)`
       - вибираємо док політикою
       - вибираємо чергу політикою
       - дістаємо корабель з голови черги
       - рухаємо в док
       - стартуємо loading, після нього корабель міняє cargo-стан і док стає ready-to-exit

  - Захист від конфліктів входу:
    - `entranceBusy` не дозволяє одночасно запускати кілька заходів у доки

## Поведінка візуально

- Кораблі FULL відмальовуються як заповнений прямокутник
- Кораблі EMPTY як контур
- Доки аналогічно: заповнений = cargo, контур = empty
- Після loading корабель і док міняють стан

## Файли входу

- `main.ts` точка старту
- `App.ts`, `Scene.ts` ініціалізація Pixi та сцени
- `PortCoordinator.ts` вся бізнес-логіка руху/доків/черг
