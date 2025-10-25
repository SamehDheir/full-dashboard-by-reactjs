import axios from "axios";

export const uploadImageToCloudinary = async (
  file,
  userId,
  setError,
  setUploading,
  setFormData
) => {
  if (!file) return;
  setError("");
  setUploading(true);

  const maxSize = 20 * 1024 * 1024;
  if (!file.type.startsWith("image/")) {
    setError("Please upload an image file");
    setUploading(false);
    return;
  }
  if (file.size > maxSize) {
    setError("Image is too large (max 3MB)");
    setUploading(false);
    return;
  }

  try {
    const cloudName = "dsuxvkdfh";
    const uploadPreset = "react_unsigned_upload";

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("upload_preset", uploadPreset);
    formDataUpload.append("folder", `products/${userId}`);

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formDataUpload
    );

    setFormData((prev) => ({ ...prev, image: res.data.secure_url }));
  } catch (err) {
    console.error(err);
    setError("Failed to upload image");
  } finally {
    setUploading(false);
  }
};
