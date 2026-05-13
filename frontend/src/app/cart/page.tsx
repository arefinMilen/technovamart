"use client";
import { useCartStore } from "@/store";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } =
    useCartStore();

  // ✅ Media base URL (from .env.local)
  const MEDIA_BASE =
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "http://localhost:8000";

  // ✅ Convert relative media path -> absolute URL
  const toMediaUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return `${MEDIA_BASE}${url}`;
    return `${MEDIA_BASE}/${url}`;
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 text-gray-300" size={80} />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">You have no items in your cart</p>
        <Link
          href="/products"
          className="btn-primary inline-flex items-center gap-2"
        >
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  const shipping = 0;
  const subtotal = totalPrice();
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Shopping Cart ({items.length} items)
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const imgSrc = toMediaUrl(item.image);

            return (
              <div key={item.product_id} className="card p-4 flex gap-4">
                <div className="relative w-24 h-24 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={item.product_name}
                      fill
                      className="object-contain p-2"
                      sizes="96px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      📦
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-medium text-gray-800 hover:text-red-600 line-clamp-2 text-sm"
                  >
                    {item.product_name}
                  </Link>

                  <p className="text-red-600 font-bold mt-1">
                    ৳{item.price.toLocaleString()}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.quantity - 1)
                        }
                        className="px-3 py-1.5 hover:bg-gray-100"
                        type="button"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="px-3 py-1.5 font-medium text-sm min-w-[2rem] text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.quantity + 1)
                        }
                        className="px-3 py-1.5 hover:bg-gray-100"
                        type="button"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-gray-400 hover:text-red-600 transition"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            type="button"
          >
            <Trash2 size={14} /> Clear all items
          </button>
        </div>

        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>৳{shipping}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-red-600">৳{total.toLocaleString()}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-3"
            >
              Checkout <ArrowRight size={18} />
            </Link>

            <Link
              href="/products"
              className="btn-secondary w-full flex items-center justify-center gap-2 mt-3 py-2.5 text-sm"
            >
              Continue Shopping
            </Link>

            <div className="mt-4 p-3 bg-green-50 rounded-lg text-xs text-green-700 text-center">
              ✅ 100% Secure Payment Guaranteed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
