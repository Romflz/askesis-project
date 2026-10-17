import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const ts = (...lines: string[]) => code('ts', ...lines)
const html = (...lines: string[]) => code('html', ...lines)

const CARDS: CardContent[] = [
  {
    front: 'What is an Angular component?',
    back: 'A TypeScript class with the `@Component` decorator that ties together a CSS selector, a template and styles',
    extra: ts(
      '@Component({',
      '  selector: "app-hello",',
      '  template: `<h1>Hello {{ name }}</h1>`,',
      '})',
      'export class Hello {',
      '  name = "Ada"',
      '}',
    ),
  },
  {
    front: 'What is a standalone component?',
    back: 'A component that lists its own dependencies in `imports` instead of being declared in an `NgModule`',
    extra: 'New projects use them since Angular 17, and since v19 `standalone: true` is the default, so you no longer write it.',
  },
  {
    front: 'Bootstrap a standalone Angular app',
    back: ts('bootstrapApplication(App, {', '  providers: [provideRouter(routes), provideHttpClient()],', '})'),
  },
  {
    front: 'Template syntax: `{{ }}`, `[ ]` and `( )`',
    back: '`{{ total }}` interpolates text; `[disabled]="busy"` binds a property; `(click)="save()"` listens to an event',
  },
  {
    front: 'What is `[(ngModel)]`?',
    back: 'Two-way binding (“banana in a box”): a property binding plus an event binding in one. `ngModel` needs `FormsModule` in the component’s `imports`',
  },
  {
    front: 'Show content conditionally with built-in control flow',
    back: html('@if (user) {', '  <p>Hi {{ user.name }}</p>', '} @else {', '  <button (click)="login()">Log in</button>', '}'),
    extra: 'Built-in control flow arrived in Angular 17 (stable in 18) and replaces `*ngIf`.',
  },
  {
    front: 'Render a list with `@for`',
    back: html(
      '@for (item of items; track item.id) {',
      '  <li>{{ item.name }}</li>',
      '} @empty {',
      '  <li>No items yet</li>',
      '}',
    ),
  },
  {
    front: 'Why does `@for` require `track`?',
    back: 'It identifies each item so Angular can keep and move existing DOM nodes when the list changes instead of re-creating them. Track a unique ID',
    extra: '`track $index` is only fine for static lists.',
  },
  { front: 'Implicit variables available inside `@for`', back: '`$index`, `$first`, `$last`, `$even`, `$odd` and `$count`' },
  {
    front: 'What does `@defer` do?',
    back: 'Lazy-loads the components, directives and pipes inside the block in a separate chunk when a trigger fires, like `on viewport` or `on interaction`',
    extra: 'The default trigger is `on idle`. Optional `@placeholder`, `@loading` and `@error` blocks show other states.',
  },
  {
    front: 'What does `@let` do in a template?',
    back: 'Declares a read-only local variable: `@let total = price() * qty();` (Angular 18.1+)',
  },
  {
    front: 'Create, read and update a signal',
    back: ts(
      'count = signal(0)',
      '',
      'this.count()                 // read: call it',
      'this.count.set(5)',
      'this.count.update((c) => c + 1)',
    ),
    extra: 'Reading a signal in a template or a `computed` registers it as a dependency.',
  },
  {
    front: 'What does `computed()` create?',
    back: 'A read-only signal derived from other signals; it is evaluated lazily, memoized and recalculated only when a dependency changes',
    extra: ts('fullName = computed(() => `${this.first()} ${this.last()}`)'),
  },
  {
    front: 'What is `effect()` for?',
    back: 'Running side effects, like logging or syncing to `localStorage`, whenever the signals it reads change; it always runs at least once',
    extra: 'Don’t use effects to copy one signal into another; use `computed` or `linkedSignal`.',
  },
  {
    front: `Why doesn’t the template update?\n${ts('items = signal<string[]>([])', 'add(x: string) { this.items().push(x) }')}`,
    back: 'Mutating the array in place doesn’t notify the signal. Set a new value: `this.items.update((list) => [...list, x])`',
  },
  {
    front: 'Declare signal inputs',
    back: ts('name = input<string>()            // optional', 'userId = input.required<number>() // must be bound'),
    extra:
      'The parent binds `<app-user [userId]="id" />` and the child reads `this.userId()`. The older `@Input()` decorator still works.',
  },
  {
    front: 'Emit an event from a child with `output()`',
    back: ts('saved = output<User>()', '', 'this.saved.emit(user)'),
    extra: 'The parent listens with `(saved)="onSaved($event)"`.',
  },
  {
    front: 'What does `model()` create?',
    back: 'A writable signal input that supports two-way binding: the child calls `value.set(…)` and the parent binds with `[(value)]="count"`',
  },
  {
    front: 'What is dependency injection in Angular?',
    back: 'Classes declare what they need and Angular’s injector creates and supplies the instances, so components never construct services themselves',
    extra: 'This makes services easy to share and to replace with fakes in tests.',
  },
  {
    front: 'Inject a dependency with `inject()`',
    back: ts('export class UserList {', '  private http = inject(HttpClient)', '}'),
    extra: '`inject()` only works in an injection context: field initializers, constructors and provider factories.',
  },
  {
    front: 'What does `@Injectable({ providedIn: "root" })` do?',
    back: 'Registers the service with the root injector: one shared instance for the whole app, and tree-shaken away if nothing injects it',
  },
  {
    front: 'What happens when a component lists a service in its own `providers`?',
    back: 'Each instance of that component gets its own service instance, shared with its child components (hierarchical injectors)',
  },
  {
    front: 'What is an Angular service?',
    back: 'A class, usually `@Injectable`, that holds logic or state shared across components, like data access, caching or logging',
  },
  {
    front: 'Provide a non-class value, like a config URL',
    back: ts(
      'export const API_URL = new InjectionToken<string>("API_URL")',
      '',
      '// providers: [{ provide: API_URL, useValue: "https://api.example.com" }]',
      'private apiUrl = inject(API_URL)',
    ),
  },
  {
    front: 'Observable vs Promise',
    back: 'An Observable is lazy, can emit many values over time and is cancelled by unsubscribing; a Promise starts immediately and settles once',
  },
  {
    front: `Why is no request sent?\n${ts('loadUsers() {', '  this.http.get<User[]>("/api/users")', '}')}`,
    back: '`HttpClient` returns a cold Observable: nothing happens until something subscribes, for example `.subscribe()`, the `async` pipe or `toSignal()`',
  },
  {
    front: 'What does `switchMap` do?',
    back: 'Maps each value to an inner Observable and unsubscribes from the previous one, cancelling stale requests; ideal for search-as-you-type',
    extra: ts('results$ = this.query$.pipe(', '  debounceTime(300),', '  switchMap((q) => this.api.search(q)),', ')'),
  },
  {
    front: '`mergeMap` vs `concatMap` vs `exhaustMap`',
    back: '`mergeMap` runs inner Observables concurrently; `concatMap` queues them in order; `exhaustMap` ignores new values while one is still running',
    extra: '`exhaustMap` suits a submit button that shouldn’t fire twice.',
  },
  {
    front: 'Three ways to avoid leaking subscriptions in a component',
    back: 'The `async` pipe, `takeUntilDestroyed()` in the pipe, or `toSignal()`: each unsubscribes automatically when the component is destroyed',
  },
  {
    front: 'What does `toSignal()` do?',
    back: 'Subscribes to an Observable and exposes its latest value as a signal, unsubscribing on destroy; the value is `undefined` until the first emission unless you pass `initialValue`',
    extra: 'It and `toObservable()` come from `@angular/core/rxjs-interop`.',
  },
  {
    front: 'What is a `BehaviorSubject`?',
    back: 'A Subject that needs an initial value, stores the latest value and emits it immediately to every new subscriber',
  },
  {
    front: 'What does `{{ user$ | async }}` do?',
    back: 'Subscribes to `user$`, renders its latest value, marks the view for checking on each emission and unsubscribes when the component is destroyed',
    extra: 'The `$` suffix is a naming convention for Observables.',
  },
  {
    front: 'Define routes, including a 404 page',
    back: ts(
      'export const routes: Routes = [',
      '  { path: "", component: Home },',
      '  { path: "users/:id", component: UserDetail },',
      '  { path: "**", component: NotFound },',
      ']',
    ),
    extra: 'The first matching route wins, so the `**` wildcard goes last.',
  },
  {
    front: 'Lazy-load a route’s component',
    back: ts('{', '  path: "admin",', '  loadComponent: () => import("./admin/admin").then((m) => m.Admin),', '}'),
    extra: 'Use `loadChildren` to lazy-load a whole set of child routes.',
  },
  {
    front: 'Where do routed components render, and how do you link to them?',
    back: 'Inside `<router-outlet />`; link with `routerLink="/users"` or navigate in code with `router.navigate(["/users", id])`',
  },
  {
    front: 'Read the `:id` route parameter',
    back: ts('private route = inject(ActivatedRoute)', 'id = this.route.snapshot.paramMap.get("id")'),
    extra: 'With `provideRouter(routes, withComponentInputBinding())`, a matching `id = input<string>()` receives it directly.',
  },
  {
    front: 'Protect a route with a guard',
    back: ts(
      'export const authGuard: CanActivateFn = () =>',
      '  inject(Auth).isLoggedIn() || inject(Router).createUrlTree(["/login"])',
      '',
      '// { path: "admin", canActivate: [authGuard], … }',
    ),
    extra: 'Returning a `UrlTree` redirects instead of just blocking.',
  },
  {
    front: 'What is change detection?',
    back: 'Angular checking component templates for bindings whose values changed and updating the DOM to match',
  },
  {
    front: 'What does Zone.js do for Angular?',
    back: 'It patches async browser APIs (events, timers, promises, XHR) so Angular knows when to run change detection',
    extra:
      'Zoneless change detection, driven by signals and events, is stable since Angular 20.2 and the default for new apps since v21.',
  },
  {
    front: 'When is an `OnPush` component checked?',
    back: 'When an input gets a new reference, an event fires in it or its children, a signal read in its template changes, an `async` pipe emits, or `markForCheck()` is called',
  },
  {
    front: `With \`OnPush\`, why doesn’t the child update?\n${ts('this.user.name = "Grace" // user is passed as an input')}`,
    back: 'The input still holds the same object reference, so `OnPush` sees no change. Pass a new object: `this.user = { ...this.user, name: "Grace" }`',
  },
  {
    front: '`constructor` vs `ngOnInit`',
    back: 'Use the constructor (or field initializers) for injection; `ngOnInit` runs once after the first input values are set, so initialization that needs inputs goes there',
    extra: 'With signal inputs you can often use `computed` instead.',
  },
  {
    front: 'What are `ngOnChanges` and `ngOnDestroy` for?',
    back: '`ngOnChanges` runs whenever bound inputs change, first before `ngOnInit`; `ngOnDestroy` runs just before the component is removed, for cleanup',
  },
  {
    front: 'Register cleanup without implementing `ngOnDestroy`',
    back: ts('inject(DestroyRef).onDestroy(() => clearInterval(this.timer))'),
  },
  {
    front: 'What does `<ng-content />` do?',
    back: 'Content projection: it renders the markup the parent puts between the component’s tags',
    extra: 'Use `<ng-content select="[card-title]" />` for several named slots.',
  },
  {
    front: 'What is a pipe?',
    back: 'A template function that transforms a value for display, like `{{ price | currency: "EUR" }}` or `{{ when | date: "short" }}`',
    extra: 'Pipes are pure by default: they re-run only when the input value or reference changes.',
  },
  {
    front: 'What is `#box` in `<input #box />`?',
    back: 'A template reference variable: it refers to the element (or component) elsewhere in the template, e.g. `(click)="search(box.value)"`',
  },
  {
    front: 'Are component styles global?',
    back: 'No. With the default `ViewEncapsulation.Emulated`, Angular adds generated attributes so a component’s styles apply only to its own template',
  },
  {
    front: 'Common Angular CLI commands',
    back: '`ng new` creates a project, `ng serve` runs the dev server, `ng generate component name` (`ng g c`) scaffolds, `ng build` builds for production',
  },
  {
    front: 'Are `*ngIf` and `*ngFor` still recommended?',
    back: 'No. They are deprecated since Angular 20 in favor of `@if`, `@for` and `@switch`; `ng generate @angular/core:control-flow` migrates templates',
  },
]

export const ANGULAR: PublicDeck = {
  slug: 'angular-essentials',
  title: 'Angular essentials: 50 cards on signals, components and RxJS',
  shortTitle: 'Angular',
  category: 'web',
  level: 'beginner',
  icon: 'code',
  description:
    'Modern Angular: standalone components, signals, inputs and outputs, dependency injection, RxJS basics, @if and @for, routing and OnPush change detection.',
  intro:
    'Angular has changed a lot since its NgModule days. These cards teach the modern way: standalone components, signal inputs and computed values, inject() for dependency injection, built-in control flow with @if, @for and @defer, functional route guards and zoneless-friendly change detection. A handful of RxJS cards cover the operators and subscription habits you need for HttpClient.',
  faq: [
    {
      q: 'Which Angular version does this deck cover?',
      a: 'Current Angular (v20 and later), with version notes where a feature arrived recently, such as built-in control flow (17), standalone by default (19) and zoneless apps (20.2 and 21).',
    },
    {
      q: 'Do I still need to learn RxJS?',
      a: 'Some. Signals now handle most component state, but HttpClient, the router and many libraries return Observables, so you should know subscribing, switchMap and how to avoid leaks.',
    },
    {
      q: 'Signals or Observables?',
      a: 'Signals for synchronous state that templates read; Observables for streams of events over time, like requests or keystrokes. toSignal and toObservable convert between them.',
    },
  ],
  cards: CARDS,
}
