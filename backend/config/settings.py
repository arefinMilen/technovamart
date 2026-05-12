"""
TechNova Mart - Django Settings
"""
from pathlib import Path
from datetime import timedelta
from decouple import config, Csv
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("SECRET_KEY", default="django-insecure-change-me-in-production")
DEBUG = config("DEBUG", default=True, cast=bool)

# IMPORTANT: Csv() দিলে "*" টা লিস্টে যাবে ["*"] -> Django accept করে
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="*", cast=Csv())

INSTALLED_APPS = [
    "jazzmin",
    "import_export",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",

    # Local apps
    "apps.accounts",
    "apps.catalog",
    "apps.orders",
    "apps.payments",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
APPEND_SLASH = False
ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# Database
DATABASE_URL = config("DATABASE_URL", default=f"sqlite:///{BASE_DIR}/db.sqlite3")
DATABASES = {
    "default": dj_database_url.parse(DATABASE_URL),
}

# Auth
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Dhaka"
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# =========================
# Static & Media (FIXED)
# =========================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# WhiteNoise recommended for production
STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"

# If any referenced .map is missing, don't crash collectstatic
WHITENOISE_MANIFEST_STRICT = False

# REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

# JWT Settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# CORS
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:3000",
    cast=Csv(),
)
CORS_ALLOW_CREDENTIALS = True

# Payment Gateways
BKASH_APP_KEY = config("BKASH_APP_KEY", default="")
BKASH_APP_SECRET = config("BKASH_APP_SECRET", default="")
BKASH_USERNAME = config("BKASH_USERNAME", default="")
BKASH_PASSWORD = config("BKASH_PASSWORD", default="")
BKASH_BASE_URL = config(
    "BKASH_BASE_URL",
    default="https://tokenized.sandbox.bka.sh/v1.2.0-beta",
)

NAGAD_MERCHANT_ID = config("NAGAD_MERCHANT_ID", default="")
NAGAD_PUBLIC_KEY = config("NAGAD_PUBLIC_KEY", default="")
NAGAD_PRIVATE_KEY = config("NAGAD_PRIVATE_KEY", default="")
NAGAD_BASE_URL = config(
    "NAGAD_BASE_URL",
    default="http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0",
)

FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:3000")

# Session/CSRF settings (needed for admin panel alongside JWT)
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = "Lax"

# ─── Jazzmin Admin UI Config ────────────────────────────────────────────────
JAZZMIN_SETTINGS = {
    "site_title": "TechNova Mart Admin",
    "site_header": "TechNova Mart",
    "site_brand": "TechNova Mart",
    "site_logo": None,
    "login_logo": None,
    "welcome_sign": "TechNova Mart Admin Panel এ স্বাগতম",
    "copyright": "TechNova Mart Bangladesh",
    "search_model": ["catalog.Product", "orders.Order", "accounts.User"],
    "user_avatar": None,

    "topmenu_links": [
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "Website", "url": "https://technovamartbd.com/", "new_window": True},
        {"model": "catalog.Product"},
        {"model": "orders.Order"},
    ],

    "usermenu_links": [
        {"name": "Website", "url": "https://technovamartbd.com/", "new_window": True},
        {"model": "auth.user"},
    ],

    "show_sidebar": True,
    "navigation_expanded": True,

    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "accounts.User": "fas fa-user-circle",
        "accounts.Address": "fas fa-map-marker-alt",
        "catalog.Product": "fas fa-box",
        "catalog.Category": "fas fa-tags",
        "catalog.Brand": "fas fa-trademark",
        "catalog.Banner": "fas fa-images",
        "catalog.ProductImage": "fas fa-image",
        "orders.Order": "fas fa-shopping-bag",
        "orders.OrderItem": "fas fa-list",
        "payments.Payment": "fas fa-credit-card",
    },

    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",

    "related_modal_active": True,

    "custom_css": None,
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,

    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "vertical_tabs",
    },

    "order_with_respect_to": [
        "catalog",
        "catalog.Category",
        "catalog.Brand",
        "catalog.Product",
        "catalog.Banner",
        "orders",
        "orders.Order",
        "payments",
        "payments.Payment",
        "accounts",
    ],
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-danger",
    "accent": "accent-danger",
    "navbar": "navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-danger",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "dark_mode_theme": None,
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
}

APPEND_SLASH = False
