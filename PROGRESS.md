# E-Commerce Project — Progress Notes

**Stack:** Django + Django REST Framework + SimpleJWT + PostgreSQL/SQLite + React (Vite) + Redux Toolkit + Stripe

**Approach:** Building step-by-step for learning. Each step includes *why*, not just *how*.

---

## ✅ Step 1: Environment Setup
- Created venv, installed: `django`, `djangorestframework`, `djangorestframework-simplejwt`, `psycopg2-binary`, `django-cors-headers`, `python-decouple`, `stripe`

## ✅ Step 2: Project & App Structure
```
backend/
├── config/       # project settings, root URLs
├── accounts/     # users & auth
├── products/     # catalog (categories, products)
├── cart/         # shopping cart
├── orders/       # checkout & order history
└── manage.py
```
**Concept:** One project = container. Apps = feature modules within it (separation of concerns).

### App responsibilities
- **accounts** → register, login (JWT), profile
- **products** → list/detail products & categories
- **cart** → add/update/remove items, view cart
- **orders** → checkout (cart → order), payment via Stripe, order history

## ✅ Step 3: settings.py Configuration
- Added `rest_framework`, `rest_framework_simplejwt`, `corsheaders`, and our 4 apps to `INSTALLED_APPS`
- Added `CorsMiddleware` near top of `MIDDLEWARE`
- Set `AUTH_USER_MODEL = 'accounts.User'` **before** first migration
- Configured `REST_FRAMEWORK` defaults: JWT auth, `IsAuthenticatedOrReadOnly` permission
- Configured `SIMPLE_JWT`: 60 min access token, 7 day refresh, rotate refresh tokens
- Added `CORS_ALLOWED_ORIGINS` for `localhost:5173` (Vite)
- Moved `SECRET_KEY`/`DEBUG` into `.env` via `python-decouple` (never commit secrets)

## ✅ Step 4: Custom User Model (`accounts`)
- `User(AbstractUser)` + `phone_number`, `address`, `is_seller` fields
- Registered in `admin.py` via `UserAdmin`
- Ran `makemigrations` + `migrate` + `createsuperuser`
- Verified login to `/admin/`

## ✅ Step 5: Register/Login API (JWT)
- `UserRegisterSerializer` — accepts password (write_only), hashes via `create_user()`
  - Improved with `password2` confirmation field + `validate()` check
- `UserProfileSerializer` — read/update profile, excludes password
- Views: `RegisterView` (AllowAny), `ProfileView` (IsAuthenticated, returns `request.user`)
- Login handled by SimpleJWT's built-in `TokenObtainPairView`
- URLs wired: `/api/auth/register/`, `/api/auth/login/`, `/api/auth/login/refresh/`, `/api/auth/profile/`
- **Debugged:** 404 → wrong/missing URL wiring. 403 on register → check `AllowAny` permission actually applied + server reloaded. Resolved ✅

## ✅ Step 6: Products App (Catalog) — models done
- `Category` model: name, slug (auto-generated via `save()` override using `slugify`)
- `Product` model: category (FK, `SET_NULL`), owner (FK to User, `CASCADE`), name, slug, description, `DecimalField` price (never use Float for money), stock, image, `is_active`, timestamps
- `in_stock` property
- Installed `Pillow` (required for `ImageField`)
- Registered both in admin with `prepopulated_fields` for slug auto-fill
- Configured `MEDIA_URL` / `MEDIA_ROOT` + served media in dev via `urls.py`
- Migrated, created a test category + product via admin
- **Debugged:** `admin.E108`/`E116` — typo'd field name `Category` (capital C) instead of `category` on the FK. Fixed + re-migrated.

## ✅ Step 7: Products API — Role-Based CRUD
- **Design decision:** added `is_seller` boolean role on `User` (simple RBAC, not full Groups/Permissions — right call for portfolio scope)
- Added `owner` FK on `Product` — set server-side via `perform_create()`, never trusted from client input
- `IsSellerOrReadOnly` custom permission:
  - `has_permission` → anyone can read; only `is_seller=True` users can create
  - `has_object_permission` → only the product's owner can update/delete it
- `ProductSerializer`: read/write split for category (`category` nested read-only, `category_id` write-only `PrimaryKeyRelatedField`, `required=True`)
- `owner` shown as read-only username field in responses
- Views: `ProductListCreateView` (list+create), `ProductDetailView` (retrieve/update/destroy), both using `IsSellerOrReadOnly`
- Filtering/search: `django-filter` (`filterset_fields=['category']`), `SearchFilter` (`?search=`), `OrderingFilter` (`?ordering=price`)
- Public endpoint: `GET /api/products/categories/` (no auth needed) — frontend will use this to populate a category dropdown so sellers pick from existing categories rather than typing anything
- **Auto-slug generation:** `Product.save()` builds slug as `slugify(name)-category.slug` (e.g. `wireless-mouse-electronics`) — seller never types a slug
  - Uniqueness enforced by DRF's automatic `UniqueValidator` (from `unique=True` on the model field) — returns a clean 400 error on duplicates, no manual uniqueness-checking code needed
  - **Debugged:** `AttributeError: 'NoneType' object has no attribute 'slug'` — category wasn't being sent (used category name instead of ID). Fixed by testing with correct `category_id`; also made `category_id` `required=True` so missing category now returns a clean 400 instead of a 500 crash
  - **Debugged:** `NameError: slugify is not defined` — missing `from django.utils.text import slugify` import
- Endpoints: `GET/POST /api/products/`, `GET/PUT/PATCH/DELETE /api/products/<slug>/`, `GET /api/products/categories/`

---

## ✅ Step 8: Cart App — server-side, tied to user
- **Design decision:** server-side cart chosen over client-side (persists across devices, natural fit with existing JWT auth)
- Relationship chain clarified: `User (1) → Cart (1) → CartItem (many) → Product (1 each)`
  - `Cart.user` → `OneToOneField` (one cart per user, reused forever)
  - `CartItem.cart` → `ForeignKey` (many items per cart)
  - `CartItem.product` → `ForeignKey` (each item references exactly one product)
- `unique_together = ('cart', 'product')` — adding same product again increments quantity instead of creating duplicate rows (verified via testing — 3x add same product → 1 row, quantity 3)
- `subtotal` (CartItem) and `total_price` (Cart) — both `@property`, calculated live, never stored — avoids stale-data bugs if product price changes
- Added stock validation: `AddToCartView` and `UpdateCartItemView` reject quantities exceeding `product.stock` with clean 400 errors
- Views: mix of `generics.RetrieveAPIView` (CartDetailView — simple fetch, auto-creates cart via overridden `get_object()` using `get_or_create`) and plain `APIView` (Add/Update/Remove — custom business logic: increment-vs-set quantity, stock checks, delete-on-zero)
- Security: all cart item queries filtered by `cart__user=request.user` — users can only ever touch their own cart items; wrong/other-user's item_id returns 404 (not 403, to avoid leaking existence)
- **Debugged:** `IndentationError` in serializers.py — mixed indentation, fixed by normalizing to consistent 4-space indent
- Verified: multi-item cart math correct (total_price = sum of all item subtotals), tested via Postman with real multi-product cart
- Endpoints: `GET /api/cart/`, `POST /api/cart/add/`, `PATCH /api/cart/items/<id>/`, `DELETE /api/cart/items/<id>/remove/`

## ✅ Database: Switched SQLite → PostgreSQL
- Installed PostgreSQL locally on Windows, added `bin` folder to PATH (was causing "psql not recognized")
- Created dedicated `ecommerce_db` database + `ecommerce_user` (least-privilege, not using postgres superuser directly)
- **Debugged:** `permission denied for schema public` — Postgres 15+ changed default schema privileges; fixed via explicit `GRANT ALL ON SCHEMA public` + `ALTER DEFAULT PRIVILEGES` for tables/sequences
- Updated `.env` + `settings.py` `DATABASES` config to use `django.db.backends.postgresql`
- Ran `migrate` (not `makemigrations` — existing migration files are DB-agnostic schema instructions, replayed as-is against the new empty database)
- Confirmed: schema carries over via migrations, but data does not — recreated superuser/test category/product fresh
- Can access DB directly via `psql -U ecommerce_user -d ecommerce_db` or pgAdmin 4 (GUI, installed alongside Postgres)

---

## ✅ Architecture Refactor: Service Layer Pattern
- **Design decision:** business logic moved out of views into dedicated `services.py` per app (domain-level, not per-endpoint — one `CartService`/`OrderService` class per domain, methods as `@staticmethod`)
- Views now only handle HTTP concerns (parse request, call service, catch exceptions, return Response) — services contain pure Python business logic, no HTTP dependency
- Convention: `ValueError` for business-rule failures (→ 400), `LookupError` for not-found/ownership failures (→ 404)
- Refactored `cart/views.py` → `cart/services.py` (`CartService`) using this pattern
- Rationale: testability (can test logic without HTTP), reusability (callable from anywhere, not just views), and critically — Orders/checkout needed this structure from the start due to complexity

## ✅ Step 9: Orders App + Checkout
- `Order` model: user (FK), total_price (stored, frozen — NOT a property), status (choices: pending/paid/shipped/cancelled), created_at
- `OrderItem` model: order (FK), product (FK, `SET_NULL`), quantity, price (frozen snapshot at purchase time), `subtotal` property
- **Key architectural decision, reasoned through in depth:** NO foreign key relationship between Cart/CartItem and Order/OrderItem — completely independent model families. Connection is behavioral only (checkout service reads Cart, copies data into Order, then clears Cart) — never a persistent DB relationship. Reasoned through why: Cart is reusable/mutable (OneToOne per user), Order is permanent/historical (many per user); merging them would force status-field ambiguity, live-vs-frozen pricing conflicts, and draft data polluting a permanent records table
- `OrderService.checkout()`:
  1. Fetch user's cart + items
  2. **Race condition fix:** lock the actual `Product` rows via `Product.objects.select_for_update()` (NOT via `CartItem` — select_for_update only locks the model being queried directly, doesn't extend through select_related/FK traversal)
  3. Validate stock for ALL items upfront (before creating anything) using the locked product data
  4. Create `Order` with `total_price` copied from `cart.total_price` (called once, stored as frozen value — not recalculated from OrderItems)
  5. Create `OrderItem`s, freezing `product.price` at that moment; reduce stock on the locked product objects
  6. Clear the cart
  - Entire method wrapped in `@transaction.atomic` — required both for all-or-nothing rollback safety AND because `select_for_update()` locks only exist within an active transaction
- **Concurrency bug caught during design (by asking, not by accident):** without row-locking, two simultaneous checkouts on the last unit of a low-stock item could both pass validation before either writes — resulting in overselling. Fixed via `select_for_update()`, which forces the second transaction to wait until the first commits, so it reads updated (accurate) stock
- `get_user_orders()` / `get_order()` — read methods, `get_order()` filters by `id` AND `user` together (same ownership-security pattern as Cart — wrong user gets 404, not 403, to avoid leaking existence)
- **Debugged:** `AssertionError: missing "Meta" attribute` — typo'd `class meta:` (lowercase) instead of `class Meta:` (capital M required — Python is case-sensitive, DRF looks for the exact name)
- Endpoints: `POST /api/orders/checkout/` (no request body needed — uses request.user + their current cart), `GET /api/orders/` (history), `GET /api/orders/<id>/` (detail)
- Verified via full test checklist: order creation, cart clearing, stock reduction, order history, empty-cart edge case, cross-user security, out-of-stock validation

---

## 🔜 Next: Step 10 — Stripe Integration
- **Important correction identified before building:** current checkout creates Order + reduces stock immediately, with no real payment involved yet. This is backwards for a production flow — stock should only reduce AFTER payment is confirmed, not at checkout initiation
- Correct flow to build: checkout creates Order (status='pending') + Stripe PaymentIntent, returns client_secret to frontend → frontend confirms payment via Stripe.js → Stripe webhook notifies backend → webhook handler flips status to 'paid' and reduces stock (moving stock deduction out of the initial checkout call)

## Backlog (upcoming steps)
- Step 10: Stripe integration (PaymentIntent + webhook, fix stock-timing to happen post-payment)
- Step 11: React frontend setup (Vite, routing, folder structure)
- Step 12: Frontend auth (login/register pages, JWT storage, protected routes)
- Step 13: Frontend product listing/detail pages (incl. category dropdown for sellers)
- Step 14: Frontend cart & Stripe checkout UI
- Step 15: Order history page, polish, deployment notes
- Testing/polish backlog: automated test suite (pytest/Django TestCase), `.gitignore` setup, consistent validation patterns, pagination on list views

## Key Design Principles Used So Far
- Separate Django apps per domain (accounts/products/cart/orders)
- Secrets in `.env`, never hardcoded
- `DecimalField` for all money values
- Soft-hide products via `is_active` instead of hard delete
- `get_object()` overrides so users only ever touch their own data
- JWT with refresh token rotation for security
