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
import ConfirmationModal from "../../components/modals/ConfirmationModal";

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
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDanger: false,
    confirmText: "Konfirmasi",
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      toast.error("Gagal mengambil data pengguna");
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
        toast.success("Data pengguna diperbarui!");
      } else {
        await registerUser(
          formData.email,
          formData.password,
          formData.name,
          formData.role
        );
        toast.success("Pengguna berhasil dibuat!");
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

  const handleDelete = (uid) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Pengguna",
      message:
        "Apakah Anda yakin ingin menghapus akses pengguna ini? (User Auth tidak terhapus)",
      confirmText: "Hapus",
      isDanger: true,
      onConfirm: async () => {
        closeConfirmModal();
        try {
          await deleteUser(uid);
          setUsers(users.filter((u) => u.id !== uid));
          toast.success("Data pengguna dihapus.");
        } catch {
          toast.error("Gagal menghapus pengguna");
        }
      },
    });
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase">
            Admin
          </span>
        );
      case "kiosk":
        return (
          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase">
            Kiosk
          </span>
        );
      case "pic_grooming":
        return (
          <span className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 px-3 py-1 rounded-full text-xs font-bold uppercase">
            PIC Grooming
          </span>
        );
      case "pic_klinik":
        return (
          <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase">
            PIC Klinik
          </span>
        );
      default:
        return (
          <span className="bg-bg-subtle text-text-muted dark:bg-white/5 px-3 py-1 rounded-full text-xs font-bold uppercase">
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-main">
              Manajemen Pengguna
            </h1>
            <p className="text-text-muted mt-1">
              Kelola akun akses aplikasi (Admin, PIC, Kiosk)
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 hover:scale-105"
          >
            <PlusIcon className="w-6 h-6" /> Tambah Pengguna
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:hidden">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Memuat...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              Belum ada pengguna.
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="glass-panel p-4 rounded-2xl flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-text-main text-lg">
                      {user.name}
                    </h3>
                    <p className="text-text-secondary text-sm font-mono break-all">
                      {user.email}
                    </p>
                  </div>
                  {getRoleBadge(user.role)}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-subtle mt-1">
                  <span className="text-text-muted text-xs">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse ">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-md">
                  <th className="px-6 py-5 text-xs font-black text-text-secondary uppercase tracking-widest first:pl-8">
                    Nama
                  </th>
                  <th className="px-6 py-5 text-xs font-black text-text-secondary uppercase tracking-widest">
                    Email
                  </th>
                  <th className="px-6 py-5 text-xs font-black text-text-secondary uppercase tracking-widest">
                    Role
                  </th>
                  <th className="px-6 py-5 text-xs font-black text-text-secondary uppercase tracking-widest">
                    Dibuat
                  </th>
                  <th className="px-6 py-5 text-xs font-black text-text-secondary uppercase tracking-widest text-right last:pr-8">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-text-muted italic animate-pulse"
                    >
                      Memuat data pengguna...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-text-muted"
                    >
                      Belum ada pengguna terdaftar.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="group border-b border-border-subtle/50 last:border-none hover:bg-white/40 dark:hover:bg-white/5 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 font-bold text-text-main first:pl-8 group-hover:text-primary transition-colors">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-medium font-mono text-xs opacity-80 group-hover:opacity-100">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 text-text-muted text-xs font-medium">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-right last:pr-8">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleEdit(user)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 p-2 rounded-xl transition-all hover:scale-105 shadow-sm"
                            title="Edit Pengguna"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 p-2 rounded-xl transition-all hover:scale-105 shadow-sm"
                            title="Hapus Pengguna"
                          >
                            <XMarkIcon className="w-4 h-4" />
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
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-10 flex justify-between items-center">
                <h2 className="text-2xl font-black text-text-main tracking-tight">
                  {editingUser ? "Edit Pengguna" : "Tambah Pengguna"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-canvas hover:bg-rose-100 hover:text-rose-600 text-text-muted transition-all duration-300 transform hover:rotate-90"
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
                              ? "opacity-60 cursor-not-allowed disabled:bg-bg-muted dark:disabled:bg-bg-subtle"
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
                              : "Buat Akun Pengguna"}
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
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.isDanger}
      />
    </>
  );
}
