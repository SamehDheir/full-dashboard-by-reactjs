import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const schema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

export default function Login() {
  const [formError, setFormError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" />;

  return (
    <div className="flex items-center h-full">
      <div className="p-6 w-full max-w-md mx-auto bg-gray-800 text-white rounded">
        <h2 className="text-2xl mb-4 text-yellow-400">Sign in</h2>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            setFormError("");
            try {
              await login(values.email, values.password);
              navigate("/");
            } catch (err) {
              const code = err?.code || err?.message || "unknown";
              if (code.includes("auth/user-not-found")) {
                setFormError("No account found with this email.");
              } else if (code.includes("auth/wrong-password")) {
                setFormError("Incorrect password.");
              } else {
                setFormError("Login failed. Please try again.");
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
                <span className="text-sm text-gray-300">Email</span>
                <Field
                  name="email"
                  type="email"
                  className="w-full p-3 mb-2 rounded bg-gray-700"
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
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
