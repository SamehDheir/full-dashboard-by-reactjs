import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useCart from "../context/useCart";
import useAuth from "../context/useAuth";
import { createOrder } from "../services/firestoreOrders";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const initialValues = {
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    paymentMethod: "cash",
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    address: Yup.string().required("Required"),
    city: Yup.string().required("Required"),
    postalCode: Yup.string().required("Required"),
    country: Yup.string().required("Required"),
    paymentMethod: Yup.string().oneOf(["cash", "credit"]).required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!cart || cart.length === 0) {
      alert("Cart is empty!");
      setSubmitting(false);
      return;
    }

    const orderData = {
      userId: user?.uid || user?.id,
      cartItems: cart.map((item) => ({
        id: item.id,
        name: item.title || item.name,
        price: item.price,
        quantity: item.quantity || 1,
        image: item.image,
      })),
      totalPrice,
      address: `${values.address}, ${values.city}, ${values.country}`,
      postalCode: values.postalCode,
      paymentMethod: values.paymentMethod,
      createdAt: new Date(),
      status: "pending",
    };

    try {
      for (const item of cart) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) throw new Error(`${item.name} not found`);

        const stock = productSnap.data().stock || 0;
        if ((item.quantity || 1) > stock) {
          throw new Error(`Not enough stock for ${item.title || item.name}`);
        }
      }

      await Promise.all(
        cart.map(async (item) => {
          const productRef = doc(db, "products", item.id);
          const productSnap = await getDoc(productRef);
          const stock = productSnap.data().stock || 0;
          await updateDoc(productRef, {
            stock: stock - (item.quantity || 1),
          });
        })
      );

      await createOrder(orderData);
      clearCart();
      alert("Order placed successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to place order");
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-yellow-400 mb-6">
          Checkout
        </h1>

        {cart.length === 0 ? (
          <p className="text-gray-600 text-center">Your cart is empty.</p>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Your Cart</h2>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center mb-3 bg-gray-600 p-3 rounded"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.title || item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="text-white font-semibold">
                        {item.title || item.name}
                      </p>
                      <p className="text-gray-300 text-sm">
                        Qty: {item.quantity || 1}
                      </p>
                      <p className="text-gray-300 text-sm">
                        Stock left: {item.stock - (item.quantity || 0)}
                      </p>
                    </div>
                  </div>
                  <p className="text-yellow-400 font-bold">
                    ${(item.price * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="text-right mt-3 text-white font-bold text-lg">
                Total: ${totalPrice.toFixed(2)}
              </div>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="bg-gray-700 p-4 rounded-lg space-y-4">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Billing Details
                  </h2>

                  {["name","email","address","city","postalCode","country"].map((field) => (
                    <div key={field}>
                      <Field
                        name={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        className="w-full p-3 rounded bg-gray-600 text-white"
                      />
                      <ErrorMessage
                        name={field}
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  ))}

                  <div>
                    <Field
                      as="select"
                      name="paymentMethod"
                      className="w-full p-3 rounded bg-gray-600 text-white"
                    >
                      <option value="cash">Cash on Delivery</option>
                      <option value="credit">Credit Card</option>
                    </Field>
                    <ErrorMessage
                      name="paymentMethod"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-yellow-400 text-gray-900 font-bold py-3 rounded hover:bg-yellow-500 transition"
                  >
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
