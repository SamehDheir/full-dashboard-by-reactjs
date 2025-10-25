import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import {
  createProduct,
  deleteProductById,
  updateProduct,
} from "../../services/firestoreProducts";
import ProductForm from "./ProductForm";
import { uploadImageToCloudinary } from "../../services/cloudinary";

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "electronics",
    stock: "",
    image: "",
    active: true,
  });

  // Fetch products realtime
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleActive = async (product) => {
    try {
      await updateDoc(doc(db, "products", product.id), {
        active: !product.active,
      });
      toast.success(
        `${product.title} is now ${!product.active ? "active" : "inactive"}`
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteProductById(id);
      toast.success("Product deleted successfully");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditMode(true);
    setCurrentProduct(product);
    setFormData({ ...product, stock: product.stock ?? product.quantity ?? 0 });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      setError("Please upload an image");
      toast.error("Please upload an image");
      return;
    }

    try {
      if (editMode && currentProduct) {
        await updateProduct(currentProduct.id, formData);
        toast.success("Product updated successfully");
      } else {
        await createProduct(formData);
        toast.success("Product created successfully");
      }
      closeModal();
    } catch {
      toast.error("Failed to save product");
    }
  };

  const handleImageUpload = (file) => {
    uploadImageToCloudinary(file, "admin", setError, setUploading, setFormData);
  };

  const openAddModal = () => {
    setEditMode(false);
    setFormData({
      title: "",
      price: "",
      description: "",
      category: "electronics",
      stock: "",
      image: "",
      active: true,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentProduct(null);
    setError("");
    setFormData({
      title: "",
      price: "",
      description: "",
      category: "electronics",
      stock: "",
      image: "",
      active: true,
    });
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-yellow-400">
          Products Management
        </h2>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded hover:bg-yellow-500"
        >
          + Add Product
        </button>
      </div>

      {error && !showModal && (
        <div className="mb-4 p-3 bg-red-500 text-white rounded">{error}</div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 text-white rounded-lg overflow-hidden text-center">
          <thead>
            <tr className="bg-gray-800">
              <th className="py-3 px-6">Image</th>
              <th className="py-3 px-6">Title</th>
              <th className="py-3 px-6">Price</th>
              <th className="py-3 px-6">Category</th>
              <th className="py-3 px-6">Stock</th>
              <th className="py-3 px-6">Active</th>
              <th className="py-3 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-400">
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-600 hover:bg-gray-600"
                >
                  <td className="py-3 px-6">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="py-3 px-6">{p.title}</td>
                  <td className="py-3 px-6">${p.price}</td>
                  <td className="py-3 px-6 capitalize">{p.category}</td>
                  <td className="py-3 px-6">{p.stock}</td>
                  <td className="py-3 px-6">
                    <input
                      type="checkbox"
                      checked={p.active}
                      onChange={() => toggleActive(p)}
                    />
                  </td>
                  <td className="py-3 px-6 flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(p)}
                      className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-600 text-white text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 text-white text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-yellow-400">
                {editMode ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <ProductForm
              {...{
                formData,
                setFormData,
                onSubmit: handleSubmit,
                editMode,
                uploading,
                setUploading,
                setError,
                handleImageUpload,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
