import { useState, useEffect } from "react";
import { registerUser, getUsers, deleteUser } from "../../services/userService";
import toast from "react-hot-toast";
import { userSchema } from "../../utils/validationSchemas"; // Zod imports
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "kiosk", // default
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({}); // Zod errors state

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Zod Validation
    const validationResult = userSchema.safeParse(formData);

    if (!validationResult.success) {
      const formatted = validationResult.error.flatten();
      const fieldErrors = {};
      Object.keys(formatted.fieldErrors).forEach((key) => {
        if (formatted.fieldErrors[key]?.length > 0) {
          fieldErrors[key] = formatted.fieldErrors[key][0];
        }
      });
      setErrors(fieldErrors);
      toast.error("Mohon lengkapi data dengan benar");
      return;
    }

    setErrors({}); // Clear errors
    setIsSubmitting(true);
    try {
      await registerUser(
        formData.email,
        formData.password,
        formData.name,
        formData.role
      );
      toast.success("User berhasil dibuat!");
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "kiosk" });
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error(error);
      const msg =
        error.code === "auth/email-already-in-use"
          ? "Email sudah terdaftar!"
          : "Gagal membuat user. Cek console.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (uid) => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus akses user ini? (User Auth tidak terhapus)"
      )
    )
      return;

    try {
      await deleteUser(uid);
      setUsers(users.filter((u) => u.id !== uid));
      toast.success("Data user dihapus.");
    } catch (error) {
      toast.error("Gagal menghapus user");
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
            Admin
          </span>
        );
      case "kiosk":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
            Kiosk
          </span>
        );
      case "pic_grooming":
        return (
          <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
            PIC Grooming
          </span>
        );
      case "pic_klinik":
        return (
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
            PIC Klinik
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
            {role}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen User</h1>
          <p className="text-gray-500 mt-1">
            Kelola akun akses aplikasi (Admin, PIC, Kiosk)
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-gray-200 transition-all hover:scale-105"
        >
          <PlusIcon className="w-6 h-6" /> Tambah User
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Nama
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Dibuat
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    Belum ada user.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium font-mono text-sm">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-400 hover:text-red-600 font-bold text-xs px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-4xl w-full max-w-md shadow-2xl p-8 relative animate-scale-in">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Tambah User Baru
            </h2>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border-2 transition-all font-bold outline-none ${
                    errors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-transparent focus:border-blue-500 focus:bg-white"
                  }`}
                  placeholder="Contoh: Admin Utama"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border-2 transition-all font-bold outline-none ${
                    errors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-transparent focus:border-blue-500 focus:bg-white"
                  }`}
                  placeholder="admin@petshop.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border-2 transition-all font-bold outline-none ${
                    errors.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-transparent focus:border-blue-500 focus:bg-white"
                  }`}
                  placeholder="Minimal 6 karakter"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Role (Akses)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["admin", "pic_grooming", "pic_klinik"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r })}
                      className={`px-4 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                        formData.role === r
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                      }`}
                    >
                      {r.replace("_", " ").toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all mt-4 disabled:opacity-50"
              >
                {isSubmitting ? "Memproses..." : "Buat Akun"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
