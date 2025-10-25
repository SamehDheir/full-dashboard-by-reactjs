import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, "Too short")
    .max(50, "Too long")
    .required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Required"),
});

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");

  if (user) return <Navigate to="/" />;

  return (
    <div className="flex items-center h-full">
      <div className="p-6 w-full max-w-md mx-auto bg-gray-800 text-white rounded">
        <h2 className="text-2xl mb-4 text-yellow-400">Create account</h2>

        <Formik
          initialValues={{ username: "", email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setFormError("");
            try {
              await register(values.username, values.email, values.password);
              navigate("/");
            } catch (err) {
              const code = err?.code || err?.message || "unknown";
              if (code.includes("auth/email-already-in-use")) {
                setFormError("This email is already in use.");
              } else if (code.includes("auth/invalid-email")) {
                setFormError("Invalid email address.");
              } else if (code.includes("auth/weak-password")) {
                setFormError("Password is too weak.");
              } else {
                setFormError("Registration failed. Please try again.");
                console.error(err);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <label className="block mb-2">
                <span className="text-sm text-gray-300">User name</span>
                <Field
                  name="username"
                  className="w-full p-3 mb-2 rounded bg-gray-700"
                  placeholder="Your name"
                />
                <div className="text-red-400 text-sm">
                  <ErrorMessage name="username" />
                </div>
              </label>

              <label className="block mb-2">
                <span className="text-sm text-gray-300">Email</span>
                <Field
                  name="email"
                  type="email"
                  className="w-full p-3 mb-2 rounded bg-gray-700"
                  placeholder="you@example.com"
                />
                <div className="text-red-400 text-sm">
                  <ErrorMessage name="email" />
                </div>
              </label>

              <label className="block mb-4">
                <span className="text-sm text-gray-300">Password</span>
                <Field
                  name="password"
                  type="password"
                  className="w-full p-3 mb-2 rounded bg-gray-700"
                  placeholder="Minimum 6 characters"
                />
                <div className="text-red-400 text-sm">
                  <ErrorMessage name="password" />
                </div>
              </label>

              {formError && (
                <div className="mb-3 text-red-300 text-sm">{formError}</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full p-3 bg-yellow-400 text-gray-900 font-bold rounded"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
