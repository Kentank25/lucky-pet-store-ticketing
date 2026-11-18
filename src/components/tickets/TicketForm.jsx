import { useState, useEffect, useRef } from "react";
import { addTicket, updateTicketDetails } from "../../services/ticketService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { SERVICE_TYPE } from "../../constants";
import { getQueueDate, SERVICE_ROOMS } from "../../utils/roomQueue";
import { ticketSchema } from "../../utils/validationSchemas";
import { availableDoctors, getDoctor } from "../../utils/doctors";
import { availableGroomers, getGroomer } from "../../utils/groomers";
import { subscribeToTickets } from "../../services/ticketService";
import { useNavigate } from "react-router-dom";
import {
  ScissorsIcon,
  HeartIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function TicketForm({
  ticketToEdit,
  onCancel,
  onSuccess,
  className = "",
  isPublicKiosk = false,
  inAdminPanel = false,
  onDraftChange,
}) {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: "",
    telepon: "",
    layanan: SERVICE_TYPE.GROOMING,
    tanggalRilis: getQueueDate(),
    roomId: "",
    doctorId: "",
    groomerId: "",
    jam: "",
    catatan: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const stepTitleRef = useRef(null);
  const formRef = useRef(null);
  const shouldFocusError = useRef(false);
  const [isExpress, setIsExpress] = useState(false);
  const [errors, setErrors] = useState({});
  const [queueTickets, setQueueTickets] = useState([]);
  const [queueError, setQueueError] = useState(false);
  const [queueReady, setQueueReady] = useState(false);
  useEffect(() => subscribeToTickets((tickets) => {
    setQueueTickets(tickets);
    setQueueReady(true);
    setQueueError(false);
  }, () => setQueueError(true)), []);

  const isGuest = !role;
  const isKioskMode = isPublicKiosk || role === "kiosk" || isGuest;

  useEffect(() => {
    if (!inAdminPanel || !shouldFocusError.current) return;
    shouldFocusError.current = false;
    formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [errors, inAdminPanel]);

  useEffect(() => {
    if (isPublicKiosk && step > 0) stepTitleRef.current?.focus();
  }, [isPublicKiosk, step]);

  useEffect(() => {
    if (ticketToEdit) {
      setFormData({
        nama: ticketToEdit.nama,
        telepon: ticketToEdit.telepon || ticketToEdit.kontak || "",
        roomId: ticketToEdit.roomId || "",
        doctorId: ticketToEdit.doctorId || "",
        groomerId: ticketToEdit.groomerId || "",
        layanan: ticketToEdit.layanan,
        tanggalRilis: ticketToEdit.tanggalRilis,
        jam: ticketToEdit.jam || "",
        catatan: ticketToEdit.catatan || "",
      });
    }
  }, [ticketToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (isPublicKiosk && step !== 2) {
      nextStep();
      return;
    }
    setLoading(true);

    const cleanedFormData = {
      ...formData,
      catatan: formData.catatan.trim(),
      kontak: formData.telepon,
      nama: formData.nama.trim(),
    };

    if (!ticketToEdit) {
      if (queueError || !queueReady) {
        setLoading(false);
        toast.error("Data antrean gagal dimuat. Coba lagi.");
        return;
      }
      const rooms = formData.layanan === SERVICE_TYPE.KLINIK
        ? availableDoctors(formData.tanggalRilis, formData.jam).filter((doctor) => !formData.doctorId || doctor.id === formData.doctorId)
        : availableGroomers(formData.tanggalRilis, formData.jam).filter((groomer) => !formData.groomerId || groomer.id === formData.groomerId);
      if (!rooms.length) {
        setLoading(false);
        toast.error(formData.layanan === SERVICE_TYPE.KLINIK ? "Tidak ada dokter pada waktu tersebut." : "Groomer tidak tersedia.");
        return;
      }
      const load = (room) => queueTickets.filter((ticket) =>
        ticket.roomId === room.roomId || ticket.roomId === room.id
      ).filter((ticket) => ticket.tanggalRilis === formData.tanggalRilis &&
        ["PENDING", "WAITING", "aktif"].includes(ticket.status)).length;
      const selected = [...rooms].sort((a, b) => load(a) - load(b) ||
        (a.roomId || a.id).localeCompare(b.roomId || b.id))[0];
      cleanedFormData.roomId = selected.roomId || selected.id;
      if (formData.layanan === SERVICE_TYPE.KLINIK) {
        cleanedFormData.doctorId = selected.id;
        cleanedFormData.doctorName = selected.name;
      } else {
        cleanedFormData.groomerId = selected.id;
        cleanedFormData.groomerName = selected.name;
      }
    }

    if (ticketToEdit && cleanedFormData.layanan === SERVICE_TYPE.KLINIK && cleanedFormData.doctorId) {
      const doctor = getDoctor(cleanedFormData.doctorId);
      if (!doctor || doctor.roomId !== cleanedFormData.roomId ||
          !availableDoctors(cleanedFormData.tanggalRilis, cleanedFormData.jam).some((item) => item.id === doctor.id)) {
        setLoading(false);
        toast.error("Dokter tidak tersedia pada jadwal atau ruang tersebut.");
        return;
      }
      cleanedFormData.doctorName = doctor.name;
    }
    if (ticketToEdit && cleanedFormData.layanan === SERVICE_TYPE.GROOMING && cleanedFormData.groomerId) {
      const groomer = getGroomer(cleanedFormData.groomerId);
      if (!groomer || groomer.roomId !== cleanedFormData.roomId ||
          !availableGroomers(cleanedFormData.tanggalRilis, cleanedFormData.jam).some((item) => item.id === groomer.id)) {
        setLoading(false);
        toast.error("Groomer tidak sesuai dengan ruang layanan.");
        return;
      }
      cleanedFormData.groomerName = groomer.name;
    }
    const validationResult = ticketSchema.safeParse(cleanedFormData);

    if (!validationResult.success) {
      const formatted = validationResult.error.flatten();
      const fieldErrors = {};
      Object.keys(formatted.fieldErrors).forEach((key) => {
        if (formatted.fieldErrors[key]?.length > 0) {
          fieldErrors[key] = formatted.fieldErrors[key][0];
        }
      });
      shouldFocusError.current = inAdminPanel;
      setErrors(fieldErrors);
      if (isPublicKiosk) {
        setStep(fieldErrors.nama || fieldErrors.kontak ? 0 : fieldErrors.jam || fieldErrors.tanggalRilis ? 1 : 2);
      }
      setLoading(false);
      toast.error("Mohon lengkapi data dengan benar");
      return;
    }

    setErrors({});

    try {
      if (ticketToEdit) {
        await updateTicketDetails(ticketToEdit.id, cleanedFormData);
        toast.success("Tiket berhasil diperbarui");
        if (onSuccess) onSuccess();
        else if (onCancel) onCancel();
      } else {
        const ticket = await addTicket(cleanedFormData, {
          source: isKioskMode ? "kiosk" : "admin",
          express: !isKioskMode && isExpress,
        });

        if (isKioskMode) {
          navigate(`/monitor/${ticket.id}`);
        } else {
          toast.success(`Tiket ${ticket.queueNumber} berhasil dibuat`);
          onSuccess?.();
        }

        setFormData({
          ...formData,
          nama: "",
          telepon: "",
          jam: "",
          doctorId: "",
          groomerId: "",
          catatan: "",
        });
        setIsExpress(false);
      }
    } catch (error) {
      if (error.code === "permission-denied") {
        toast.error("Akses ditolak saat menyimpan tiket.");
      } else if (error.code === "unavailable") {
        toast.error("Koneksi ke penyimpanan terputus. Silakan coba lagi.");
      } else {
        toast.error(error.code ? "Gagal menyimpan tiket" : error.message);
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (service) => {
    const slots = [];
    let startHour, endHour;

    if (service === SERVICE_TYPE.KLINIK) {
      startHour = 9;
      endHour = 18;
      for (let i = startHour; i < endHour; i++) {
        slots.push(`${i.toString().padStart(2, "0")}:00`);
      }
    } else {
      startHour = 9;
      endHour = 15;
      for (let i = startHour; i < endHour; i++) {
        slots.push(`${i.toString().padStart(2, "0")}:00`);
        slots.push(`${i.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots(formData.layanan).filter((slot) =>
    formData.layanan === SERVICE_TYPE.KLINIK
      ? availableDoctors(formData.tanggalRilis, slot).some((doctor) => !formData.doctorId || doctor.id === formData.doctorId)
      : availableGroomers(formData.tanggalRilis, slot).some((groomer) => !formData.groomerId || groomer.id === formData.groomerId)
  );
  const labelClass = "block text-sm font-semibold text-text-secondary mb-2 ml-1";
  const steps = ["Data", "Jadwal", "Konfirmasi"];

  const nextStep = () => {
    if (step === 0) {
      const fieldErrors = {
        ...(!formData.nama.trim() && { nama: "Nama pelanggan atau hewan wajib diisi." }),
        ...(!/^08[0-9]{8,12}$/.test(formData.telepon) && { kontak: "Masukkan nomor telepon yang diawali 08." }),
      };
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length) return;
    }
    if (step === 1) {
      const fieldErrors = {
        ...(!formData.tanggalRilis && { tanggalRilis: "Pilih tanggal layanan." }),
        ...(!formData.jam || !timeSlots.includes(formData.jam) ? { jam: "Pilih jam yang tersedia." } : {}),
      };
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length) return;
    }
    setStep((current) => current + 1);
  };

  return (
    <form
      ref={formRef}
      aria-busy={inAdminPanel ? loading : undefined}
      onSubmit={handleSubmit}
      className={`relative flex flex-col ${className}`}
      noValidate
    >
      {isPublicKiosk && (
        <nav className="mx-auto mb-6 w-full max-w-md" aria-label="Langkah pendaftaran">
          <p ref={stepTitleRef} tabIndex={-1} className="mb-3 text-sm font-semibold text-text-secondary outline-none" aria-live="polite">
            Langkah {step + 1} dari {steps.length} · {steps[step]}
          </p>
          <ol className="grid grid-cols-3 gap-2">
            {steps.map((label, index) => (
              <li key={label} aria-current={step === index ? "step" : undefined} className={`flex min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-xs font-semibold sm:px-3 ${step === index ? "bg-primary-soft text-primary" : index < step ? "bg-bg-subtle text-text-secondary" : "text-text-secondary"}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${step === index ? "bg-primary text-white" : index < step ? "bg-text-secondary text-white" : "bg-bg-muted text-text-secondary"}`}>
                  {index < step ? "✓" : index + 1}
                </span>
                <span className="truncate">{label}</span>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div
        className={inAdminPanel ? "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8" : "mx-auto w-full max-w-md"}
        onChange={onDraftChange}
        onClick={inAdminPanel ? (event) => {
          if (event.target.closest("button[aria-pressed]")) onDraftChange?.();
        } : undefined}
      >
        <div className={`space-y-4 ${isPublicKiosk && step !== 0 ? "hidden" : ""}`}>
        {!isPublicKiosk && <h3 className="border-b border-border-subtle pb-2 text-base font-bold text-text-main">Pelanggan</h3>}
        <div>
          <label className={labelClass} htmlFor="ticket-name">Nama Pelanggan / Hewan</label>
          <input
            id="ticket-name"
            type="text"
            value={formData.nama}
            onChange={(e) => { setFormData({ ...formData, nama: e.target.value }); setErrors((current) => ({ ...current, nama: undefined })); }}
            aria-invalid={!!errors.nama}
            aria-describedby={errors.nama ? "ticket-name-error" : undefined}
            className={`input-minimal ${
              errors.nama ? "border-red-500 ring-2 ring-red-200" : ""
            }`}
            placeholder="Contoh: Budi / Mochi"
          />
          {errors.nama && (
            <p id="ticket-name-error" className="text-red-500 text-sm mt-1 font-bold ml-2">
              {errors.nama}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="ticket-phone">Nomor Telepon</label>
          <input
            id="ticket-phone"
            type="tel"
            inputMode="numeric"
            value={formData.telepon || ""}
            onChange={(e) => {
              let val = e.target.value.replace(/\D/g, "");

              // Auto-correct 62 to 0
              if (val.startsWith("62")) {
                val = "0" + val.slice(2);
              }

              // Limit length
              if (val.length > 14) return;

              setFormData({ ...formData, telepon: val });
              setErrors((current) => ({ ...current, kontak: undefined }));
            }}
            aria-invalid={!!errors.kontak}
            aria-describedby={errors.kontak ? "ticket-phone-error" : undefined}
            className={`input-minimal tracking-wider ${
              errors.kontak ? "border-red-500 ring-2 ring-red-200" : ""
            }`}
            placeholder="08xxxxxxxxxx"
          />
          {errors.kontak && (
            <p id="ticket-phone-error" className="text-red-500 text-sm mt-1 font-bold ml-2">
              {errors.kontak}
            </p>
          )}
        </div>

        {!isPublicKiosk && <h3 className="border-b border-border-subtle pb-2 pt-2 text-base font-bold text-text-main">Layanan &amp; Jadwal</h3>}
        <div>
          <label className={labelClass}>Layanan</label>
          <div className="flex gap-3">
            {[
              {
                value: SERVICE_TYPE.GROOMING,
                label: "Grooming",
                icon: <ScissorsIcon className="h-6 w-6" />,
                activeClass:
                  "bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 dark:ring-blue-900/50",
              },
              {
                value: SERVICE_TYPE.KLINIK,
                label: "Klinik",
                icon: <HeartIcon className="h-6 w-6" />,
                activeClass:
                  "bg-rose-50 border-rose-200 text-rose-600 ring-2 ring-rose-100 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300 dark:ring-rose-900/50",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={!!ticketToEdit}
                onClick={() =>
                  setFormData((current) => current.layanan === option.value
                    ? current
                    : { ...current, layanan: option.value, roomId: "", doctorId: "", groomerId: "", jam: "" })
                }
                aria-pressed={formData.layanan === option.value}
                className={`flex-1 min-h-20 p-3 rounded-2xl border transition-all font-bold text-base flex items-center justify-center gap-2 active:scale-95 ${
                  formData.layanan === option.value
                    ? option.activeClass
                    : "bg-bg-surface border-border-subtle text-text-muted hover:bg-bg-subtle hover:border-border-main"
                }`}
              >
                <span aria-hidden="true">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        </div>
        <div className={`space-y-4 ${isPublicKiosk && step !== 1 ? "hidden" : ""}`}>
        {ticketToEdit && formData.layanan === SERVICE_TYPE.GROOMING && formData.groomerId ? (
          <div>
            <label className={labelClass} htmlFor="ticket-groomer">Groomer</label>
            <select id="ticket-groomer" className="input-minimal w-full" value={formData.groomerId}
              onChange={(e) => {
                const groomer = getGroomer(e.target.value);
                setFormData({ ...formData, groomerId: groomer.id, roomId: groomer.roomId });
              }}>
              {availableGroomers(formData.tanggalRilis).map((groomer) => <option key={groomer.id} value={groomer.id}>{groomer.name}</option>)}
            </select>
          </div>
        ) : ticketToEdit && formData.layanan === SERVICE_TYPE.KLINIK && formData.doctorId ? (
          <div>
            <label className={labelClass} htmlFor="ticket-doctor">Dokter</label>
            <select id="ticket-doctor" className="input-minimal w-full" value={formData.doctorId}
              onChange={(e) => {
                const doctor = getDoctor(e.target.value);
                setFormData({ ...formData, doctorId: doctor.id, roomId: doctor.roomId });
              }}>
              {availableDoctors(formData.tanggalRilis).map((doctor) =>
                <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
            </select>
          </div>
        ) : ticketToEdit ? (
          <div>
            <label className={labelClass} htmlFor="ticket-room">Ruang layanan</label>
            <select id="ticket-room" className="input-minimal w-full" value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}>
              <option value="">Pilih ruang</option>
              {SERVICE_ROOMS.filter((room) => room.service === formData.layanan).map((room) =>
                <option key={room.id} value={room.id}>{room.name}</option>)}
            </select>
          </div>
        ) : formData.layanan === SERVICE_TYPE.KLINIK ? (
          <div>
            <label className={labelClass} htmlFor="ticket-doctor">Dokter</label>
            <select id="ticket-doctor" className="input-minimal w-full" value={formData.doctorId}
              onChange={(e) => {
                const doctorId = e.target.value;
                setFormData({ ...formData, doctorId, jam: availableDoctors(formData.tanggalRilis, formData.jam).some((doctor) => !doctorId || doctor.id === doctorId) ? formData.jam : "" });
              }}>
              <option value="">Dokter mana saja</option>
              {availableDoctors(formData.tanggalRilis).map((doctor) =>
                <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <label className={labelClass} htmlFor="ticket-groomer">Groomer</label>
            <select id="ticket-groomer" className="input-minimal w-full" value={formData.groomerId}
              onChange={(e) => {
                const groomerId = e.target.value;
                setFormData({ ...formData, groomerId, jam: availableGroomers(formData.tanggalRilis, formData.jam).some((groomer) => !groomerId || groomer.id === groomerId) ? formData.jam : "" });
              }}>
              <option value="">Groomer mana saja</option>
              {availableGroomers(formData.tanggalRilis).map((groomer) => <option key={groomer.id} value={groomer.id}>{groomer.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className={labelClass}>Tanggal & Jam</label>
          <div className="flex flex-col gap-4">
            <input
              type="date"
              aria-label="Tanggal layanan"
              value={formData.tanggalRilis}
              onChange={(e) =>
                setFormData({ ...formData, tanggalRilis: e.target.value, doctorId: "", groomerId: "", jam: "" })
              }
              disabled={!!ticketToEdit}
              aria-invalid={!!errors.tanggalRilis}
              className={`input-minimal w-full disabled:opacity-60`}
            />

            {errors.tanggalRilis && <p className="text-red-500 text-sm">{errors.tanggalRilis}</p>}

            <div
              role="group"
              aria-label="Jam layanan"
              aria-invalid={!!errors.jam}
              tabIndex={-1}
              className={`grid grid-cols-3 md:grid-cols-4 gap-2 ${
                errors.jam ? "ring-2 ring-red-200 rounded-lg p-1" : ""
              }`}
            >
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={formData.jam === slot}
                  onClick={() => setFormData({ ...formData, jam: slot })}
                  className={`${inAdminPanel ? "min-h-11 " : ""}py-2 rounded-lg font-semibold text-sm transition-colors ${
                    formData.jam === slot
                      ? "bg-primary text-white shadow-lg shadow-primary/30 transform scale-105 border border-primary"
                      : "bg-bg-surface text-text-secondary border border-border-subtle hover:bg-bg-subtle hover:border-border-main dark:bg-bg-subtle dark:text-text-muted dark:hover:bg-bg-muted"
                  }`}
                >
                  {slot}
                </button>
              ))}
              {timeSlots.length === 0 && (
                <p className="col-span-4 text-center text-slate-400 py-4 text-sm">
                  Tidak ada jam tersedia. Pilih tanggal atau petugas lain.
                </p>
              )}
            </div>
            {errors.jam && (
              <p className="text-red-500 text-sm mt-1 font-bold ml-1">
                {errors.jam}
              </p>
            )}
          </div>
        </div>

        </div>
        <div className={`space-y-4 ${isPublicKiosk && step !== 2 ? "hidden" : ""}`}>
        {!isPublicKiosk && <h3 className="border-b border-border-subtle pb-2 pt-2 text-base font-bold text-text-main">Detail</h3>}
        {isPublicKiosk && (
          <section aria-label="Ringkasan tiket" className="rounded-2xl border border-border-subtle bg-bg-subtle/70 p-4">
            <h2 className="mb-3 text-base font-bold text-text-main">Periksa pilihan Anda</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-text-secondary">Nama</dt><dd className="min-w-0 break-words font-semibold text-text-main">{formData.nama}</dd>
              <dt className="text-text-secondary">Telepon</dt><dd className="font-semibold text-text-main">{formData.telepon}</dd>
              <dt className="text-text-secondary">Layanan</dt><dd className="font-semibold text-text-main">{formData.layanan}</dd>
              <dt className="text-text-secondary">Petugas</dt><dd className="font-semibold text-text-main">{formData.layanan === SERVICE_TYPE.KLINIK ? getDoctor(formData.doctorId)?.name || "Dokter mana saja" : getGroomer(formData.groomerId)?.name || "Groomer mana saja"}</dd>
              <dt className="text-text-secondary">Jadwal</dt><dd className="font-semibold text-text-main">{formData.tanggalRilis} · {formData.jam}</dd>
            </dl>
          </section>
        )}
        <div>
          <div className="flex justify-between">
            <label className={labelClass}>Catatan (Opsional)</label>
            <span
              className={`text-xs font-bold ${
                formData.catatan.length > 200
                  ? "text-red-500"
                  : "text-text-muted"
              }`}
            >
              {formData.catatan.length}/200
            </span>
          </div>
          <textarea
            aria-label="Catatan (Opsional)"
            aria-invalid={!!errors.catatan}
            value={formData.catatan}
            onChange={(e) =>
              setFormData({ ...formData, catatan: e.target.value })
            }
            className={`input-minimal resize-none font-medium ${
              errors.catatan ? "border-red-500 ring-2 ring-red-200" : ""
            }`}
            placeholder={
              formData.layanan === SERVICE_TYPE.GROOMING
                ? "Contoh: Mandi Kutu, Potong Kuku..."
                : "Contoh: Muntah, Diare, Lemas..."
            }
            rows="4"
          />
          {errors.catatan && (
            <p className="text-red-500 text-sm mt-1 font-bold ml-2">
              {errors.catatan}
            </p>
          )}
        </div>

        {role === "admin" && !isPublicKiosk && !ticketToEdit && (
          <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100 dark:bg-red-900/10 dark:border-red-900/30">
            <input
              type="checkbox"
              id="express"
              checked={isExpress}
              onChange={(e) => setIsExpress(e.target.checked)}
              className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300 cursor-pointer"
            />
            <label htmlFor="express" className="cursor-pointer select-none">
              <span className="font-bold text-text-main text-sm flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />{" "}
                Tiket Darurat (Langsung Aktif)
              </span>
              <span className="block text-xs text-text-muted">
                Lewati proses validasi (untuk kondisi darurat).
              </span>
            </label>
          </div>
        )}

        </div>
      </div>
      {(!isPublicKiosk || step === 2) && (
        <div className={inAdminPanel ? "flex shrink-0 flex-wrap gap-2 border-t border-border-subtle bg-bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8" : "mx-auto mt-4 flex w-full max-w-md gap-3 pt-1"}>
          {isPublicKiosk && <button type="button" onClick={() => setStep(1)} className="btn-secondary min-h-12 flex-1">Kembali</button>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary min-h-12 flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                {ticketToEdit
                  ? "Update Tiket"
                  : isKioskMode
                  ? "Ambil Antrian"
                  : "Simpan Tiket"}
                {!ticketToEdit && <ArrowRightIcon className="w-6 h-6" />}
              </>
            )}
          </button>

          {(ticketToEdit || inAdminPanel) && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-4 bg-bg-subtle text-text-secondary rounded-2xl hover:bg-bg-muted font-bold transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      )}
      {isPublicKiosk && step < 2 && (
        <div className="mx-auto mt-5 flex w-full max-w-md gap-3">
          {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary min-h-12 flex-1">Kembali</button>}
          <button type="button" onClick={nextStep} className="btn-primary min-h-12 flex-1">Lanjut</button>
        </div>
      )}
    </form>
  );
}
