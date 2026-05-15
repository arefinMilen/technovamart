from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView,
    ProfileView, AddressListCreateView, AddressDetailView,
    AdminLoginBridgeView, GoogleLoginView,
)

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile', ProfileView.as_view(), name='profile'),
    path('addresses', AddressListCreateView.as_view(), name='addresses'),
    path('addresses/<int:pk>', AddressDetailView.as_view(), name='address-detail'),
    path('admin-login', AdminLoginBridgeView.as_view(), name='admin-login-bridge'),
    path('google-login', GoogleLoginView.as_view(), name='google-login'),
]
