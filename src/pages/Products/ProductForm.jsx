export default function ProductForm({
  formData,
  setFormData,
  onSubmit,
  editMode,
  uploading,
 
  handleImageUpload,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 rounded bg-gray-700 text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Price</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: Number(e.target.value) })
          }
          className="w-full px-3 py-2 rounded bg-gray-700 text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="w-full px-3 py-2 rounded bg-gray-700 text-white"
        >
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
          <option value="books">Books</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Stock</label>
        <input
          type="number"
          value={formData.stock}
          onChange={(e) =>
            setFormData({ ...formData, stock: Number(e.target.value) })
          }
          className="w-full px-3 py-2 rounded bg-gray-700 text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-3 py-2 rounded bg-gray-700 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files[0])}
          className="w-full text-gray-300"
        />
        {uploading && (
          <p className="text-yellow-400 text-sm mt-1">Uploading...</p>
        )}
        {formData.image && (
          <img
            src={formData.image}
            alt="preview"
            className="w-24 h-24 object-cover mt-2 rounded"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.active}
          onChange={(e) =>
            setFormData({ ...formData, active: e.target.checked })
          }
        />
        <span className="text-gray-300">Active</span>
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-yellow-400 text-gray-900 font-bold rounded hover:bg-yellow-500"
        disabled={uploading}
      >
        {editMode ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
}
