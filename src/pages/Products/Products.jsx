import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { fetchUserProducts } from "../../services/firestoreProducts";
import useCart from "../../context/useCart";
import toast from "react-hot-toast";

export default function Products() {
  const { firebaseUser } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    if (!firebaseUser) return;
    (async () => {
      try {
        const data = await fetchUserProducts();
        // تأكد أن كل منتج فيه stock
        const normalized = data.map((p) => ({
          ...p,
          stock: p.stock ?? 0,
        }));
        setProducts(normalized);
      } catch {
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    })();
  }, [firebaseUser]);

  const visibleProducts = products
    .filter((p) => p.active && p.stock > 0) // فقط المنتجات المتوفرة
    .filter((p) =>
      search ? p.title.toLowerCase().includes(search.toLowerCase()) : true
    )
    .filter((p) => (categoryFilter ? p.category === categoryFilter : true));

  if (!firebaseUser) return <div className="p-6 text-white">Please login</div>;
  if (loading) return <div className="p-6 text-white">Loading...</div>;

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    addToCart({ ...product, quantity: 1 }); // الكمية الافتراضية 1 عند الإضافة
    toast.success(`${product.title} added to cart`);
  };

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search product..."
          className="px-3 py-2 rounded bg-gray-700 text-white flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="px-3 py-2 rounded bg-gray-700 text-white"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
          <option value="books">Books</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.length === 0 ? (
          <p className="text-gray-400">No products found.</p>
        ) : (
          visibleProducts.map((p) => (
            <div
              key={p.id}
              className="bg-gray-800 rounded-lg shadow-md p-4 hover:scale-[1.02] transition cursor-pointer"
              onClick={() => setSelectedProduct(p)}
            >
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-48 object-contain rounded"
              />
              <h3 className="text-lg font-bold text-yellow-400 mt-3">
                {p.title}
              </h3>
              <p className="text-gray-300">${p.price}</p>
              <p className="text-sm text-gray-400 capitalize">{p.category}</p>
              <p className="text-sm text-gray-300">Stock: {p.stock}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(p);
                }}
                className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
              >
                Add to Cart
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedProduct.image}
              alt={selectedProduct.title}
              className="w-full h-56 object-contain rounded"
            />
            <h2 className="text-xl font-bold text-yellow-400 mt-3">
              {selectedProduct.title}
            </h2>
            <p className="text-gray-300 mt-2">{selectedProduct.description}</p>
            <p className="text-white mt-2">Price: ${selectedProduct.price}</p>
            <p className="text-sm text-gray-300 mt-1">
              Stock: {selectedProduct.stock}
            </p>
            <button
              onClick={() => handleAddToCart(selectedProduct)}
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
            >
              Add to Cart
            </button>
            <button
              onClick={() => setSelectedProduct(null)}
              className="mt-2 w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
