import { useState, useEffect, useCallback } from "react";
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
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { SERVICE_ROOMS } from "../../utils/roomQueue";
import { SERVICE_TYPE } from "../../constants";

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
    roomId: "",
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

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "admin",
      roomId: "",
    });
    setErrors({});
  }, []);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !confirmModal.isOpen && !isSubmitting) {
        handleCloseModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, confirmModal.isOpen, isSubmitting, handleCloseModal]);

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

    let validationResult;
    if (editingUser) {
      validationResult = {
        success: formData.name.trim().length >= 2,
        error: {
          flatten: () => ({ fieldErrors: { name: ["Nama terlalu pendek"] } }),
        },
      };
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
    const normalizedRoomId =
      formData.role === "admin" ? null : formData.roomId || null;
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: formData.name.trim(),
          role: formData.role,
          roomId: normalizedRoomId,
        });
        toast.success("Data pengguna diperbarui!");
      } else {
        await registerUser(
          formData.email,
          formData.password,
          formData.name.trim(),
          formData.role,
          normalizedRoomId
        );
        toast.success("Pengguna berhasil dibuat!");
      }

      handleCloseModal();
      fetchUsers();
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
      password: "",
      role: user.role,
      roomId: user.roomId || "",
    });
    setIsModalOpen(true);
  };

  const getRoomLabel = (user) => {
    if (user.role === "admin") return null;
    if (!user.roomId) return "Koordinator (Semua Ruang)";
    return SERVICE_ROOMS.find((r) => r.id === user.roomId)?.name || user.roomId;
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
        return <Badge variant="payment">Admin</Badge>;
      case "kiosk":
        return <Badge variant="waiting">Kiosk</Badge>;
      case "pic_grooming":
        return <Badge variant="grooming">PIC Grooming</Badge>;
      case "pic_klinik":
        return <Badge variant="klinik">PIC Klinik</Badge>;
      default:
        return <Badge variant="neutral">{role}</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-main sm:text-3xl">
              Manajemen Pengguna
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Kelola akun akses aplikasi (Admin, PIC, Kiosk)
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto"
          >
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
            <span>Tambah Pengguna</span>
          </Button>
        </div>

        {/* Mobile User Cards */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {loading ? (
            <Card padding="md" className="text-center text-sm text-text-muted">
              Memuat...
            </Card>
          ) : users.length === 0 ? (
            <Card padding="md" className="text-center text-sm text-text-muted">
              Belum ada pengguna.
            </Card>
          ) : (
            users.map((user) => (
              <Card key={user.id} padding="sm" className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-heading text-base font-bold text-text-main">
                      {user.name}
                    </h3>
                    <p className="break-all font-mono text-xs text-text-secondary">
                      {user.email}
                    </p>
                    {getRoomLabel(user) && (
                      <p className="mt-1 text-xs font-medium text-text-secondary">
                        Ruang: <span className="font-semibold text-text-main">{getRoomLabel(user)}</span>
                      </p>
                    )}
                  </div>
                  {getRoleBadge(user.role)}
                </div>

                <div className="mt-1 flex items-center justify-between border-t border-border-subtle pt-2.5">
                  <span className="text-xs font-medium tabular-nums text-text-muted">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("id-ID")
                      : "-"}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Edit ${user.name}`}
                      onClick={() => handleEdit(user)}
                      className="text-primary hover:bg-primary-soft"
                    >
                      <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Hapus ${user.name}`}
                      onClick={() => handleDelete(user.id)}
                      className="text-danger hover:bg-danger-soft"
                    >
                      <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Desktop User Table */}
        <Card padding="none" className="hidden overflow-hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-subtle/60">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary first:pl-8">
                    Nama
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Email
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Dibuat
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-text-secondary last:pr-8">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm font-medium text-text-muted"
                    >
                      Memuat data pengguna...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm text-text-muted"
                    >
                      Belum ada pengguna terdaftar.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="group border-b border-border-subtle/70 transition-colors last:border-none hover:bg-bg-subtle/50"
                    >
                      <td className="px-6 py-4 font-bold text-text-main first:pl-8">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-medium text-text-secondary">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          {getRoleBadge(user.role)}
                          {getRoomLabel(user) && (
                            <span className="text-xs font-medium text-text-secondary">
                              {getRoomLabel(user)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium tabular-nums text-text-muted">
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
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            aria-label={`Edit ${user.name}`}
                            onClick={() => handleEdit(user)}
                            title="Edit Pengguna"
                          >
                            <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Hapus ${user.name}`}
                            onClick={() => handleDelete(user.id)}
                            title="Hapus Pengguna"
                            className="text-danger hover:bg-danger-soft"
                          >
                            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px] animate-fade-in"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isSubmitting) {
                handleCloseModal();
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="user-modal-title"
              className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border-subtle bg-bg-surface shadow-2xl animate-scale-in"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-bg-surface px-6 py-4">
                <h2
                  id="user-modal-title"
                  className="font-heading text-xl font-bold tracking-tight text-text-main"
                >
                  {editingUser ? "Edit Pengguna" : "Tambah Pengguna"}
                </h2>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  aria-label="Tutup modal pengguna"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="overflow-y-auto bg-bg-canvas/40 p-6 custom-scrollbar">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">
                      Informasi Dasar
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-bold text-text-main">
                          Nama
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          aria-invalid={!!errors.name}
                          aria-describedby={
                            errors.name ? "user-name-error" : undefined
                          }
                          className={`input-minimal ${
                            errors.name
                              ? "border-danger focus:border-danger"
                              : ""
                          }`}
                          placeholder="Nama Lengkap"
                        />
                        {errors.name && (
                          <p
                            id="user-name-error"
                            role="alert"
                            className="ml-1 mt-1 text-xs font-bold text-danger"
                          >
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-bold text-text-main">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          aria-invalid={!!errors.email}
                          aria-describedby={
                            errors.email ? "user-email-error" : undefined
                          }
                          className={`input-minimal ${
                            errors.email
                              ? "border-danger focus:border-danger"
                              : ""
                          } ${
                            editingUser
                              ? "cursor-not-allowed opacity-60 disabled:bg-bg-muted dark:disabled:bg-bg-subtle"
                              : ""
                          }`}
                          placeholder="Alamat Email"
                          disabled={!!editingUser}
                        />
                        {errors.email && (
                          <p
                            id="user-email-error"
                            role="alert"
                            className="ml-1 mt-1 text-xs font-bold text-danger"
                          >
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {!editingUser && (
                        <div>
                          <label className="mb-1 block text-sm font-bold text-text-main">
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
                            aria-invalid={!!errors.password}
                            aria-describedby={
                              errors.password ? "user-password-error" : undefined
                            }
                            className={`input-minimal ${
                              errors.password
                                ? "border-danger focus:border-danger"
                                : ""
                            }`}
                            placeholder="Password (Min. 6 karakter)"
                          />
                          {errors.password && (
                            <p
                              id="user-password-error"
                              role="alert"
                              className="ml-1 mt-1 text-xs font-bold text-danger"
                            >
                              {errors.password}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                      Pilih Role Akses
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                      ].map((roleOption) => {
                        const isSelected = formData.role === roleOption.value;
                        return (
                          <button
                            key={roleOption.value}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                role: roleOption.value,
                                roomId: "",
                              })
                            }
                            className={`min-h-11 cursor-pointer rounded-2xl border-2 p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                              isSelected
                                ? "border-primary bg-primary-soft"
                                : "border-border-subtle bg-bg-surface hover:border-border-main hover:bg-bg-subtle"
                            }`}
                          >
                            <div className="mb-0.5 flex items-center justify-between">
                              <span
                                className={`text-sm font-bold ${
                                  isSelected
                                    ? "text-primary dark:text-teal-300"
                                    : "text-text-main"
                                }`}
                              >
                                {roleOption.label}
                              </span>
                              {isSelected && (
                                <span
                                  aria-hidden="true"
                                  className="h-2 w-2 rounded-full bg-primary"
                                />
                              )}
                            </div>
                            <span className="text-xs font-medium text-text-secondary">
                              {roleOption.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {(formData.role === "pic_grooming" ||
                    formData.role === "pic_klinik") && (
                    <div>
                      <label
                        htmlFor="user-room-select"
                        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-text-muted"
                      >
                        Ruang Tugas (Opsional)
                      </label>
                      <select
                        id="user-room-select"
                        value={formData.roomId}
                        onChange={(e) =>
                          setFormData({ ...formData, roomId: e.target.value })
                        }
                        aria-invalid={Boolean(errors.roomId)}
                        className="input-minimal cursor-pointer"
                      >
                        <option value="">
                          Semua Ruang (Koordinator Divisi)
                        </option>
                        {SERVICE_ROOMS.filter(
                          (r) =>
                            r.service ===
                            (formData.role === "pic_grooming"
                              ? SERVICE_TYPE.GROOMING
                              : SERVICE_TYPE.KLINIK)
                        ).map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                        ))}
                      </select>
                      {errors.roomId && (
                        <p
                          role="alert"
                          className="ml-1 mt-1 text-xs font-bold text-danger"
                        >
                          {errors.roomId}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={isSubmitting}
                      className="w-full"
                    >
                      {!isSubmitting &&
                        (editingUser ? (
                          <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <PlusIcon className="h-5 w-5" aria-hidden="true" />
                        ))}
                      <span>
                        {isSubmitting
                          ? "Menyimpan..."
                          : editingUser
                          ? "Simpan Perubahan"
                          : "Buat Akun Pengguna"}
                      </span>
                    </Button>
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
