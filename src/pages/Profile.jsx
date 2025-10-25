import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Formik, Form, Field } from "formik";
import axios from "axios";

export default function Profile() {
  const { user, profile, firebaseUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    setPreview(profile?.avatarUrl ?? null);
  }, [profile]);

  if (!user || !firebaseUser) return <div className="p-6">Please login</div>;

  const handleAvatar = async (file) => {
    if (!file) return;
    setError("");
    setUploading(true);
    setSuccess("");

    const maxSize = 3 * 1024 * 1024;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (jpg, png, ...)");
      setUploading(false);
      return;
    }
    if (file.size > maxSize) {
      setError("Image is too large (max 3MB)");
      setUploading(false);
      return;
    }

    const tempUrl = URL.createObjectURL(file);
    setPreview(tempUrl);

    try {
      const cloudName = "dsuxvkdfh";
      const uploadPreset = "react_unsigned_upload";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", `avatars/${firebaseUser.uid}`);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      // تحقق من نجاح الرفع
      if (!res.data.secure_url) {
        throw new Error("Upload failed: no image URL returned");
      }

      const imageUrl = res.data.secure_url;

      // تحديث Firestore
      const userRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userRef, {
        avatarUrl: imageUrl,
        avatarPublicId: res.data.public_id,
      });

      // تحديث العرض فورًا
      setPreview(imageUrl);
      profile.avatarUrl = imageUrl; // تحديث البيانات محليًا
      setSuccess("Avatar updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to upload avatar. Try again.");
      setPreview(profile?.avatarUrl ?? null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">Your profile</h2>
      <div className="bg-gray-800 p-4 sm:p-6 rounded mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="flex flex-col items-center sm:items-start sm:col-span-1">
          {preview ? (
            <img
              src={preview}
              alt="avatar"
              className="w-28 h-28 rounded-full object-cover mb-3"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center mb-3">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
              </svg>
            </div>
          )}
          <div className="w-full">
            <p className="text-white text-center sm:text-left font-semibold">
              {profile?.username ?? user.email}
            </p>
            <p className="text-gray-300 text-sm text-center sm:text-left">
              {profile?.role ?? "user"}
            </p>
          </div>
        </div>

        <div className="sm:col-span-2">
          <div className="bg-gray-800 p-4 rounded mb-4">
            <h3 className="text-yellow-400 mb-3">Change avatar</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleAvatar(e.target.files[0])}
              className="text-sm text-gray-300 w-full"
              disabled={uploading}
            />
            {uploading && <p className="text-sm text-gray-300">Uploading...</p>}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-yellow-400 mb-3">Edit profile</h3>
            <Formik
              initialValues={{ username: profile?.username ?? "" }}
              enableReinitialize={true}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  const userRef = doc(db, "users", firebaseUser.uid);
                  await updateDoc(userRef, { username: values.username });
                  setSuccess("Profile updated successfully!");
                  setError("");
                } catch (err) {
                  console.error(err);
                  setError("Failed to update profile.");
                  setSuccess("");
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
                      className="w-full p-3 mb-2 rounded bg-gray-700 text-white"
                      disabled={profile?.role === "admin"}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full p-3 bg-yellow-400 text-gray-900 font-bold rounded"
                  >
                    {isSubmitting ? "Saving..." : "Save changes"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
