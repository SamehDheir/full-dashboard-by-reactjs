import { useNavigate } from "react-router-dom";
import useCart from "../context/useCart";

export default function Cart() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <h2 className="text-3xl font-semibold text-gray-800 mb-3">
          🛒 Your Cart is Empty
        </h2>
        <p className="text-gray-500 mb-6">
          Start shopping and add some awesome products.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
        >
          Browse Products
        </button>
      </div>
    );

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleUpdateQuantity = (id, value, stock) => {
    if (value < 1) value = 1;
    if (value > stock) value = stock;
    updateQuantity(id, value);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-10 text-gray-800">
          Shopping Cart
        </h1>

        <div className="space-y-6">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row items-center justify-between border-b border-gray-200 pb-6 gap-4"
            >
              <div className="flex items-center gap-5 w-full md:w-auto">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {item.name}
                  </h2>
                  <p className="text-gray-500">Price: ${item.price}</p>
                  <p className="text-gray-500 text-sm">Stock: {item.stock}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="text-gray-600">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateQuantity(
                          item.id,
                          Number(e.target.value),
                          item.stock
                        )
                      }
                      className="w-16 px-2 py-1 border rounded text-center border-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <p className="font-semibold text-lg text-blue-700">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 hover:text-red-700 font-medium transition-all duration-200"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-200 pt-6">
          <button
            onClick={clearCart}
            className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 w-full md:w-auto"
          >
            Clear Cart
          </button>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-xl font-bold text-gray-800">
              Total: ${total.toFixed(2)}
            </p>
            <button
              onClick={() => navigate("/checkout")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 w-full md:w-auto"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
