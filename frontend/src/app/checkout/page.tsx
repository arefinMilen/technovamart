"use client";
import { useState } from "react";
import { useCartStore, useAuthStore } from "@/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authApi, orderApi, paymentApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { MapPin, CreditCard, CheckCircle } from "lucide-react";

type AddressForm = {
  name: string;
  phone: string;
  city: string;
  area: string;
  address_line: string;
};

// Shipping rates configuration
const SHIPPING_RATES = {
  DHAKA: 80,
  OTHER: 120,
};

// Cities considered as Dhaka (add more as needed)
const DHAKA_CITIES = ["Dhaka", "dhaka", "Dhaka City", "Dacca"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<AddressForm>();

  const { data: addressData, refetch: refetchAddresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => authApi.getAddresses().then((r) => r.data),
    enabled: isAuthenticated,
  });

  const addresses = addressData?.results || addressData || [];

  const createAddressMutation = useMutation({
    mutationFn: (data: AddressForm) => authApi.createAddress(data),
    onSuccess: (res) => {
      setSelectedAddress(res.data.id);
      refetchAddresses();
      setShowAddressForm(false);
      reset();
      toast.success("Address added!");
    },
  });

  const orderMutation = useMutation({
    mutationFn: (data: any) => orderApi.create(data),
    onSuccess: async (orderRes) => {
      const order = orderRes.data;
      try {
        const payRes = await paymentApi.init({
          order_id: order.id,
          provider: selectedPayment,
        });
        if (selectedPayment === "bkash" && payRes.data.bkash_url) {
          window.location.href = payRes.data.bkash_url;
        } else {
          clearCart();
          router.push(`/payment/success?order=${order.id}`);
        }
      } catch {
        router.push(`/account/orders`);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to place order");
    },
  });
   // Calculate shipping cost based on selected address city
  const getShippingCost = () => {
    if (!selectedAddress) return SHIPPING_RATES.OTHER; // default
    const selectedAddr = addresses.find((addr: any) => addr.id === selectedAddress);
    if (!selectedAddr) return SHIPPING_RATES.OTHER;
    
    const city = selectedAddr.city || "";
    return DHAKA_CITIES.includes(city) ? SHIPPING_RATES.DHAKA : SHIPPING_RATES.OTHER;
  };
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="mb-4">Please login to checkout</p>
        <button
          onClick={() => router.push("/auth/login")}
          className="btn-primary"
        >
          Login
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const subtotal = totalPrice();
  const shipping = getShippingCost();  // ← Dynamic shipping
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }
    orderMutation.mutate({
      address_id: selectedAddress,
      items: items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
    });
  };

  const PAYMENT_METHODS = [
    {
      id: "bkash",
      label: "bKash",
      emoji: "🔴",
      desc: "Pay with bKash",
      disabled: true,
    },
    {
      id: "nagad",
      label: "Nagad",
      emoji: "🟠",
      desc: "Pay with Nagad",
      disabled: true,
    },
    {
      id: "card",
      label: "Card",
      emoji: "💳",
      desc: "Debit / Credit Card",
      disabled: true,
    },
    {
      id: "cod",
      label: "Cash on Delivery",
      emoji: "💵",
      desc: "Pay on delivery",
      disabled: false,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="card p-6">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
              <MapPin className="text-red-600" size={20} /> Delivery Address
            </h2>
            <div className="space-y-3">
              {addresses.map((addr: any) => (
                <label
                  key={addr.id}
                  className={`flex gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${selectedAddress === addr.id ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id)}
                    className="mt-1 text-red-600"
                  />
                  <div className="text-sm">
                    <p className="font-medium">
                      {addr.name} · {addr.phone}
                    </p>
                    <p className="text-gray-500">
                      {addr.address_line}, {addr.area}, {addr.city}
                    </p>
                  </div>
                </label>
              ))}
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-red-600 text-sm font-medium hover:text-red-700"
              >
                + Add new address
              </button>
            </div>
            {showAddressForm && (
              <form
                onSubmit={handleSubmit((d) => createAddressMutation.mutate(d))}
                className="mt-4 grid grid-cols-2 gap-3"
              >
                <input
                  {...register("name", { required: true })}
                  placeholder="Full Name *"
                  className="input col-span-2"
                />
                <input
                  {...register("phone", { required: true })}
                  placeholder="Phone *"
                  className="input"
                />
                <input
                  {...register("city", { required: true })}
                  placeholder="City *"
                  className="input"
                />
                <input
                  {...register("area", { required: true })}
                  placeholder="Area *"
                  className="input"
                />
                <textarea
                  {...register("address_line", { required: true })}
                  placeholder="Full Address *"
                  className="input col-span-2 resize-none h-20"
                />
                <button type="submit" className="btn-primary col-span-2">
                  Save Address
                </button>
              </form>
            )}
          </div>

          {/* Payment Method */}
          <div className="card p-6">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
              <CreditCard className="text-red-600" size={20} /> Payment Method
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${selectedPayment === method.id ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={selectedPayment === method.id}
                    onChange={() => setSelectedPayment(method.id)}
                    className="text-red-600"
                    disabled={method.disabled}
                  />
                  <div>
                    <div className="font-medium text-sm">
                      {method.emoji} {method.label}
                    </div>
                    <div className="text-xs text-gray-500">{method.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex justify-between gap-2"
                >
                  <span className="text-gray-600 line-clamp-1">
                    {item.product_name} ×{item.quantity}
                  </span>
                  <span className="shrink-0">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>৳{shipping}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total</span>
                <span className="text-red-600">৳{total.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={orderMutation.isPending}
              className="btn-primary w-full mt-6 py-3 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <CheckCircle size={18} />
              {orderMutation.isPending ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
