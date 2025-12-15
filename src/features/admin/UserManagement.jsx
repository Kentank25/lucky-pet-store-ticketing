import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  registerUser,
  getUsers,
  deleteUser,
  updateUser,
} from "../../services/userService";
import toast from "react-hot-toast";
import { userSchema } from "../../utils/validationSchemas";
import {
  PlusIcon,
  XMarkIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      toast.error("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Skip password validation for edit mode
    let validationResult;
    if (editingUser) {
      // Manual simple validation for edit
      validationResult = {
        success: formData.name.length >= 2,
        error: {
          flatten: () => ({ fieldErrors: { name: ["Nama terlalu pendek"] } }),
        },
      };
      if (formData.name.length < 2) validationResult.success = false;
    } else {
      validationResult = userSchema.safeParse(formData);
    }

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

    setErrors({});
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: formData.name,
          role: formData.role,
        });
        toast.success("Data user diperbarui!");
      } else {
        await registerUser(
          formData.email,
          formData.password,
          formData.name,
          formData.role
        );
        toast.success("User berhasil dibuat!");
      }
      handleCloseModal();
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error(error);
      const msg =
        error.code === "auth/email-already-in-use"
          ? "Email sudah terdaftar!"
          : "Gagal menyimpan data. Cek console.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Password not validated in edit
      role: user.role,
    });
    setIsModalOpen(true);
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
    } catch {
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "admin",
    });
    setErrors({});
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-text-main">
              Manajemen User
            </h1>
            <p className="text-text-muted mt-1">
              Kelola akun akses aplikasi (Admin, PIC, Kiosk)
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 hover:scale-105"
          >
            <PlusIcon className="w-6 h-6" /> Tambah User
          </button>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-bg-surface/50 border-b border-border-subtle">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">
                    Nama
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">
                    Dibuat
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-slate-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-slate-400"
                    >
                      Belum ada user.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border-subtle last:border-none hover:bg-bg-surface/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-text-main">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-medium font-mono text-sm">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 text-text-muted text-xs">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-indigo-400 hover:text-indigo-600 font-bold text-xs px-3 py-1 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-rose-400 hover:text-rose-600 font-bold text-xs px-3 py-1 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add User */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            {/* Modal Content */}
            <div className="bg-bg-surface rounded-4xl w-full max-w-lg shadow-2xl relative animate-scale-in flex flex-col max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-bg-surface sticky top-0 z-10">
                <h2 className="text-xl font-black text-text-main">
                  {editingUser ? "Edit User" : "Tambah User Baru"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-subtle hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar bg-bg-canvas/50">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                      Informasi Dasar
                    </label>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-text-main mb-1">
                          Nama
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className={`input-minimal ${
                            errors.name
                              ? "border-red-500 focus:border-red-500 ring-red-100"
                              : ""
                          }`}
                          placeholder="Nama Lengkap"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1 font-bold ml-1">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-text-main mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className={`input-minimal ${
                            errors.email
                              ? "border-red-500 focus:border-red-500 ring-red-100"
                              : ""
                          } ${
                            editingUser
                              ? "opacity-60 cursor-not-allowed bg-slate-100"
                              : ""
                          }`}
                          placeholder="Alamat Email"
                          disabled={!!editingUser}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1 font-bold ml-1">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {!editingUser && (
                        <div>
                          <label className="block text-sm font-bold text-text-main mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            minLength={6}
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                            className={`input-minimal ${
                              errors.password
                                ? "border-red-500 focus:border-red-500 ring-red-100"
                                : ""
                            }`}
                            placeholder="Password (Min. 6 karakter)"
                          />
                          {errors.password && (
                            <p className="text-red-500 text-xs mt-1 font-bold ml-1">
                              {errors.password}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Pilih Role Akses
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          value: "admin",
                          label: "Admin",
                          desc: "Akses Penuh",
                        },
                        {
                          value: "pic_grooming",
                          label: "PIC Grooming",
                          desc: "Kelola Grooming",
                        },
                        {
                          value: "pic_klinik",
                          label: "PIC Klinik",
                          desc: "Kelola Klinik",
                        },
                      ].map((roleOption) => (
                        <button
                          key={roleOption.value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, role: roleOption.value })
                          }
                          className={`p-3 rounded-2xl border-2 text-left transition-all relative ${
                            formData.role === roleOption.value
                              ? "border-indigo-500 bg-indigo-50/50"
                              : "border-border-subtle bg-bg-surface hover:border-border-main hover:bg-bg-subtle"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`font-bold text-sm ${
                                formData.role === roleOption.value
                                  ? "text-indigo-700"
                                  : "text-text-secondary"
                              }`}
                            >
                              {roleOption.label}
                            </span>
                            {formData.role === roleOption.value && (
                              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-medium">
                            {roleOption.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          {editingUser ? (
                            <PencilSquareIcon className="w-5 h-5" />
                          ) : (
                            <PlusIcon className="w-5 h-5" />
                          )}
                          <span>
                            {editingUser
                              ? "Simpan Perubahan"
                              : "Buat Akun User"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
