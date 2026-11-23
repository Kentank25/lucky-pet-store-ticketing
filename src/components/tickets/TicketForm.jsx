import { useState, useEffect, useRef } from "react";
import {
  addTicket,
  subscribeToTickets,
  updateTicketDetails,
} from "../../services/ticketService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { SERVICE_TYPE, TICKET_STATUS } from "../../constants";
import { getQueueDate, getRoom, SERVICE_ROOMS } from "../../utils/roomQueue";
import { ticketSchema } from "../../utils/validationSchemas";
import { availableDoctors, getDoctor } from "../../utils/doctors";
import { availableGroomers, getGroomer } from "../../utils/groomers";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import {
  ScissorsIcon,
  HeartIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
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
  const [createdTicket, setCreatedTicket] = useState(null);

  useEffect(
    () =>
      subscribeToTickets(
        (tickets) => {
          setQueueTickets(tickets);
          setQueueReady(true);
          setQueueError(false);
        },
        () => setQueueError(true)
      ),
    []
  );

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
      const rooms =
        formData.layanan === SERVICE_TYPE.KLINIK
          ? availableDoctors(formData.tanggalRilis, formData.jam).filter(
              (doctor) => !formData.doctorId || doctor.id === formData.doctorId
            )
          : availableGroomers(formData.tanggalRilis, formData.jam).filter(
              (groomer) =>
                !formData.groomerId || groomer.id === formData.groomerId
            );
      if (!rooms.length) {
        setLoading(false);
        toast.error(
          formData.layanan === SERVICE_TYPE.KLINIK
            ? "Tidak ada dokter pada waktu tersebut."
            : "Groomer tidak tersedia."
        );
        return;
      }
      const load = (room) =>
        queueTickets
          .filter(
            (ticket) => ticket.roomId === room.roomId || ticket.roomId === room.id
          )
          .filter(
            (ticket) =>
              ticket.tanggalRilis === formData.tanggalRilis &&
              ["PENDING", "WAITING", "aktif"].includes(ticket.status)
          ).length;
      const selected = [...rooms].sort(
        (a, b) =>
          load(a) - load(b) ||
          (a.roomId || a.id).localeCompare(b.roomId || b.id)
      )[0];
      cleanedFormData.roomId = selected.roomId || selected.id;
      if (formData.layanan === SERVICE_TYPE.KLINIK) {
        cleanedFormData.doctorId = selected.id;
        cleanedFormData.doctorName = selected.name;
      } else {
        cleanedFormData.groomerId = selected.id;
        cleanedFormData.groomerName = selected.name;
      }
    }

    if (
      ticketToEdit &&
      cleanedFormData.layanan === SERVICE_TYPE.KLINIK &&
      cleanedFormData.doctorId
    ) {
      const doctor = getDoctor(cleanedFormData.doctorId);
      if (
        !doctor ||
        doctor.roomId !== cleanedFormData.roomId ||
        !availableDoctors(cleanedFormData.tanggalRilis, cleanedFormData.jam).some(
          (item) => item.id === doctor.id
        )
      ) {
        setLoading(false);
        toast.error("Dokter tidak tersedia pada jadwal atau ruang tersebut.");
        return;
      }
      cleanedFormData.doctorName = doctor.name;
    }
    if (
      ticketToEdit &&
      cleanedFormData.layanan === SERVICE_TYPE.GROOMING &&
      cleanedFormData.groomerId
    ) {
      const groomer = getGroomer(cleanedFormData.groomerId);
      if (
        !groomer ||
        groomer.roomId !== cleanedFormData.roomId ||
        !availableGroomers(
          cleanedFormData.tanggalRilis,
          cleanedFormData.jam
        ).some((item) => item.id === groomer.id)
      ) {
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
        setStep(
          fieldErrors.nama || fieldErrors.kontak
            ? 0
            : fieldErrors.jam || fieldErrors.tanggalRilis
            ? 1
            : 2
        );
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
          setCreatedTicket(ticket);
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
      ? availableDoctors(formData.tanggalRilis, slot).some(
          (doctor) => !formData.doctorId || doctor.id === formData.doctorId
        )
      : availableGroomers(formData.tanggalRilis, slot).some(
          (groomer) => !formData.groomerId || groomer.id === formData.groomerId
        )
  );

  const labelClass =
    "block text-sm font-semibold text-text-secondary mb-2 ml-0.5";
  const steps = ["Data", "Jadwal", "Konfirmasi"];

  const nextStep = () => {
    if (step === 0) {
      const fieldErrors = {
        ...(!formData.nama.trim() && {
          nama: "Nama pelanggan atau hewan wajib diisi.",
        }),
        ...(!/^08[0-9]{8,12}$/.test(formData.telepon) && {
          kontak: "Masukkan nomor telepon yang diawali 08.",
        }),
      };
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length) return;
    }
    if (step === 1) {
      const fieldErrors = {
        ...(!formData.tanggalRilis && {
          tanggalRilis: "Pilih tanggal layanan.",
        }),
        ...(!formData.jam || !timeSlots.includes(formData.jam)
          ? { jam: "Pilih jam yang tersedia." }
          : {}),
      };
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length) return;
    }
    setStep((current) => current + 1);
  };

  if (createdTicket) {
    const monitorUrl = `${window.location.origin}/monitor/${createdTicket.id}`;
    const roomName =
      getRoom(createdTicket.roomId, createdTicket.layanan)?.name ||
      createdTicket.roomId ||
      "Menunggu Penempatan";
    const staffName =
      createdTicket.doctorName ||
      createdTicket.groomerName ||
      "Petugas Tersedia";
    const isGrooming = createdTicket.layanan === SERVICE_TYPE.GROOMING;
    const whatsappDigits = (createdTicket.telepon || "")
      .replace(/^0/, "62")
      .replace(/\D/g, "");
    const whatsappText = encodeURIComponent(
      `Halo ${createdTicket.nama}, nomor antrian Lucky Pet Store Anda adalah ${createdTicket.queueNumber} (${createdTicket.layanan} - ${roomName}). Pantau antrian: ${monitorUrl}`
    );

    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <CheckCircleIcon className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-xl font-bold text-text-main sm:text-2xl">
          Antrian Berhasil Dibuat
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Simpan nomor antrian atau pindai kode QR untuk memantau giliran Anda.
        </p>

        <div className="mt-5 w-full rounded-2xl border border-border-subtle bg-bg-subtle/60 p-5">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant={isGrooming ? "grooming" : "klinik"}>
              {createdTicket.layanan}
            </Badge>
            <Badge
              variant={
                createdTicket.status === TICKET_STATUS.WAITING
                  ? "waiting"
                  : "pending"
              }
              dot
            >
              {createdTicket.status}
            </Badge>
          </div>

          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Nomor Antrian
          </p>
          <p className="mt-1 font-heading text-5xl font-extrabold tracking-tight tabular-nums text-text-main">
            {createdTicket.queueNumber || "-"}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border-subtle pt-4 text-left text-sm">
            <div>
              <dt className="text-xs text-text-muted">Ruangan</dt>
              <dd className="font-semibold text-text-main">{roomName}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Petugas</dt>
              <dd className="font-semibold text-text-main">{staffName}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Pelanggan</dt>
              <dd className="truncate font-semibold text-text-main">
                {createdTicket.nama}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Jadwal</dt>
              <dd className="font-semibold tabular-nums text-text-main">
                {createdTicket.tanggalRilis} · {createdTicket.jam}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-5 rounded-2xl border border-border-subtle bg-white p-4 shadow-xs">
          <QRCode value={monitorUrl} size={160} />
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Pindai QR untuk pantau status secara langsung
        </p>

        <div className="mt-6 flex w-full flex-col gap-3">
          <Button
            variant={isGrooming ? "grooming" : "klinik"}
            size="lg"
            className="min-h-12 w-full"
            onClick={() => navigate(`/monitor/${createdTicket.id}`)}
          >
            Pantau Antrian
            <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
          </Button>

          {whatsappDigits && (
            <a
              href={`https://wa.me/${whatsappDigits}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-bg-surface px-4 py-2.5 text-sm font-semibold text-text-main transition-colors hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <ChatBubbleLeftRightIcon
                className="h-5 w-5 text-emerald-600"
                aria-hidden="true"
              />
              Kirim Resi ke WhatsApp
            </a>
          )}

          <Button
            variant="secondary"
            size="lg"
            className="min-h-12 w-full"
            onClick={() => {
              setCreatedTicket(null);
              setStep(0);
            }}
          >
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
            Ambil Antrian Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      aria-busy={inAdminPanel ? loading : undefined}
      onSubmit={handleSubmit}
      className={`relative flex flex-col ${className}`}
      noValidate
    >
      {isPublicKiosk && (
        <nav
          className="mx-auto mb-6 w-full max-w-md"
          aria-label="Langkah pendaftaran"
        >
          <p
            ref={stepTitleRef}
            tabIndex={-1}
            className="mb-3 text-sm font-semibold tabular-nums text-text-secondary outline-none"
            aria-live="polite"
          >
            Langkah {step + 1} dari {steps.length} · {steps[step]}
          </p>
          <ol className="grid grid-cols-3 gap-2">
            {steps.map((label, index) => (
              <li
                key={label}
                aria-current={step === index ? "step" : undefined}
                className={`flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-semibold sm:px-3 ${
                  step === index
                    ? "border-primary/30 bg-primary-soft text-primary"
                    : index < step
                    ? "border-border-subtle bg-bg-subtle text-text-secondary"
                    : "border-transparent bg-bg-subtle/50 text-text-muted"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full tabular-nums ${
                    step === index
                      ? "bg-primary text-white"
                      : index < step
                      ? "bg-text-secondary text-white"
                      : "bg-bg-muted text-text-secondary"
                  }`}
                >
                  {index < step ? (
                    <CheckIcon className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="truncate">{label}</span>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div
        className={
          inAdminPanel
            ? "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8"
            : "mx-auto w-full max-w-md"
        }
        onChange={onDraftChange}
        onClick={
          inAdminPanel
            ? (event) => {
                if (event.target.closest("button[aria-pressed]"))
                  onDraftChange?.();
              }
            : undefined
        }
      >
        <div
          className={`space-y-4 ${isPublicKiosk && step !== 0 ? "hidden" : ""}`}
        >
          {!isPublicKiosk && (
            <h3 className="border-b border-border-subtle pb-2 text-base font-bold text-text-main">
              Pelanggan
            </h3>
          )}
          <div>
            <label className={labelClass} htmlFor="ticket-name">
              Nama Pelanggan / Hewan
            </label>
            <input
              id="ticket-name"
              type="text"
              value={formData.nama}
              onChange={(e) => {
                setFormData({ ...formData, nama: e.target.value });
                setErrors((current) => ({ ...current, nama: undefined }));
              }}
              aria-invalid={!!errors.nama}
              aria-describedby={errors.nama ? "ticket-name-error" : undefined}
              className={`input-minimal min-h-12 ${
                errors.nama ? "border-danger ring-2 ring-danger/20" : ""
              }`}
              placeholder="Contoh: Budi / Mochi"
            />
            {errors.nama && (
              <p
                id="ticket-name-error"
                className="mt-1.5 ml-1 text-sm font-semibold text-danger"
              >
                {errors.nama}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="ticket-phone">
              Nomor Telepon
            </label>
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
              className={`input-minimal min-h-12 tabular-nums tracking-wider ${
                errors.kontak ? "border-danger ring-2 ring-danger/20" : ""
              }`}
              placeholder="08xxxxxxxxxx"
            />
            {errors.kontak && (
              <p
                id="ticket-phone-error"
                className="mt-1.5 ml-1 text-sm font-semibold text-danger"
              >
                {errors.kontak}
              </p>
            )}
          </div>

          {!isPublicKiosk && (
            <h3 className="border-b border-border-subtle pt-2 pb-2 text-base font-bold text-text-main">
              Layanan &amp; Jadwal
            </h3>
          )}
          <div>
            <label className={labelClass}>Layanan</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: SERVICE_TYPE.GROOMING,
                  label: "Grooming",
                  icon: <ScissorsIcon className="h-6 w-6" />,
                  activeClass:
                    "border-grooming bg-grooming-soft text-grooming ring-2 ring-grooming/25",
                },
                {
                  value: SERVICE_TYPE.KLINIK,
                  label: "Klinik",
                  icon: <HeartIcon className="h-6 w-6" />,
                  activeClass:
                    "border-primary bg-primary-soft text-primary ring-2 ring-primary/25",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={!!ticketToEdit}
                  onClick={() =>
                    setFormData((current) =>
                      current.layanan === option.value
                        ? current
                        : {
                            ...current,
                            layanan: option.value,
                            roomId: "",
                            doctorId: "",
                            groomerId: "",
                            jam: "",
                          }
                    )
                  }
                  aria-pressed={formData.layanan === option.value}
                  className={`flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-2xl border px-4 py-3.5 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    formData.layanan === option.value
                      ? option.activeClass
                      : "border-border-subtle bg-bg-surface text-text-secondary hover:border-border-main hover:bg-bg-subtle"
                  }`}
                >
                  <span aria-hidden="true">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`space-y-4 ${isPublicKiosk && step !== 1 ? "hidden" : ""}`}
        >
          {ticketToEdit &&
          formData.layanan === SERVICE_TYPE.GROOMING &&
          formData.groomerId ? (
            <div>
              <label className={labelClass} htmlFor="ticket-groomer">
                Groomer
              </label>
              <select
                id="ticket-groomer"
                className="input-minimal min-h-12 w-full cursor-pointer"
                value={formData.groomerId}
                onChange={(e) => {
                  const groomer = getGroomer(e.target.value);
                  setFormData({
                    ...formData,
                    groomerId: groomer.id,
                    roomId: groomer.roomId,
                  });
                }}
              >
                {availableGroomers(formData.tanggalRilis).map((groomer) => (
                  <option key={groomer.id} value={groomer.id}>
                    {groomer.name}
                  </option>
                ))}
              </select>
            </div>
          ) : ticketToEdit &&
            formData.layanan === SERVICE_TYPE.KLINIK &&
            formData.doctorId ? (
            <div>
              <label className={labelClass} htmlFor="ticket-doctor">
                Dokter
              </label>
              <select
                id="ticket-doctor"
                className="input-minimal min-h-12 w-full cursor-pointer"
                value={formData.doctorId}
                onChange={(e) => {
                  const doctor = getDoctor(e.target.value);
                  setFormData({
                    ...formData,
                    doctorId: doctor.id,
                    roomId: doctor.roomId,
                  });
                }}
              >
                {availableDoctors(formData.tanggalRilis).map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
          ) : ticketToEdit ? (
            <div>
              <label className={labelClass} htmlFor="ticket-room">
                Ruang layanan
              </label>
              <select
                id="ticket-room"
                className="input-minimal min-h-12 w-full cursor-pointer"
                value={formData.roomId}
                onChange={(e) =>
                  setFormData({ ...formData, roomId: e.target.value })
                }
              >
                <option value="">Pilih ruang</option>
                {SERVICE_ROOMS.filter(
                  (room) => room.service === formData.layanan
                ).map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          ) : formData.layanan === SERVICE_TYPE.KLINIK ? (
            <div>
              <label className={labelClass} htmlFor="ticket-doctor">
                Dokter
              </label>
              <select
                id="ticket-doctor"
                className="input-minimal min-h-12 w-full cursor-pointer"
                value={formData.doctorId}
                onChange={(e) => {
                  const doctorId = e.target.value;
                  setFormData({
                    ...formData,
                    doctorId,
                    jam: availableDoctors(
                      formData.tanggalRilis,
                      formData.jam
                    ).some((doctor) => !doctorId || doctor.id === doctorId)
                      ? formData.jam
                      : "",
                  });
                }}
              >
                <option value="">Dokter mana saja</option>
                {availableDoctors(formData.tanggalRilis).map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className={labelClass} htmlFor="ticket-groomer">
                Groomer
              </label>
              <select
                id="ticket-groomer"
                className="input-minimal min-h-12 w-full cursor-pointer"
                value={formData.groomerId}
                onChange={(e) => {
                  const groomerId = e.target.value;
                  setFormData({
                    ...formData,
                    groomerId,
                    jam: availableGroomers(
                      formData.tanggalRilis,
                      formData.jam
                    ).some((groomer) => !groomerId || groomer.id === groomerId)
                      ? formData.jam
                      : "",
                  });
                }}
              >
                <option value="">Groomer mana saja</option>
                {availableGroomers(formData.tanggalRilis).map((groomer) => (
                  <option key={groomer.id} value={groomer.id}>
                    {groomer.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelClass} htmlFor="ticket-date">
              Tanggal &amp; Jam
            </label>
            <div className="flex flex-col gap-4">
              <input
                id="ticket-date"
                type="date"
                aria-label="Tanggal layanan"
                value={formData.tanggalRilis}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tanggalRilis: e.target.value,
                    doctorId: "",
                    groomerId: "",
                    jam: "",
                  })
                }
                disabled={!!ticketToEdit}
                aria-invalid={!!errors.tanggalRilis}
                className="input-minimal min-h-12 w-full tabular-nums disabled:opacity-60"
              />

              {errors.tanggalRilis && (
                <p className="text-sm font-semibold text-danger">
                  {errors.tanggalRilis}
                </p>
              )}

              <div
                role="group"
                aria-label="Jam layanan"
                aria-invalid={!!errors.jam}
                tabIndex={-1}
                className={`grid grid-cols-3 gap-2 md:grid-cols-4 ${
                  errors.jam ? "rounded-xl p-1 ring-2 ring-danger/30" : ""
                }`}
              >
                {timeSlots.map((slot) => {
                  const isSelectedSlot = formData.jam === slot;
                  const activeSlotClass =
                    formData.layanan === SERVICE_TYPE.GROOMING
                      ? "bg-grooming border-grooming text-white shadow-xs"
                      : "bg-primary border-primary text-white shadow-xs";

                  return (
                    <button
                      key={slot}
                      type="button"
                      aria-pressed={isSelectedSlot}
                      onClick={() => setFormData({ ...formData, jam: slot })}
                      className={`min-h-12 cursor-pointer rounded-xl border px-2 py-2.5 text-sm font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                        isSelectedSlot
                          ? activeSlotClass
                          : "border-border-subtle bg-bg-surface text-text-secondary hover:border-border-main hover:bg-bg-subtle"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
                {timeSlots.length === 0 && (
                  <p className="col-span-3 py-4 text-center text-sm text-text-muted md:col-span-4">
                    Tidak ada jam tersedia. Pilih tanggal atau petugas lain.
                  </p>
                )}
              </div>
              {errors.jam && (
                <p className="mt-1 ml-1 text-sm font-semibold text-danger">
                  {errors.jam}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          className={`space-y-4 ${isPublicKiosk && step !== 2 ? "hidden" : ""}`}
        >
          {!isPublicKiosk && (
            <h3 className="border-b border-border-subtle pt-2 pb-2 text-base font-bold text-text-main">
              Detail
            </h3>
          )}
          {isPublicKiosk && (
            <section
              aria-label="Ringkasan tiket"
              className="rounded-2xl border border-border-subtle bg-bg-subtle/70 p-4"
            >
              <h2 className="mb-3 font-heading text-base font-bold text-text-main">
                Periksa pilihan Anda
              </h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-text-secondary">Nama</dt>
                <dd className="min-w-0 break-words font-semibold text-text-main">
                  {formData.nama}
                </dd>
                <dt className="text-text-secondary">Telepon</dt>
                <dd className="font-semibold tabular-nums text-text-main">
                  {formData.telepon}
                </dd>
                <dt className="text-text-secondary">Layanan</dt>
                <dd className="font-semibold text-text-main">
                  {formData.layanan}
                </dd>
                <dt className="text-text-secondary">Petugas</dt>
                <dd className="font-semibold text-text-main">
                  {formData.layanan === SERVICE_TYPE.KLINIK
                    ? getDoctor(formData.doctorId)?.name || "Dokter mana saja"
                    : getGroomer(formData.groomerId)?.name ||
                      "Groomer mana saja"}
                </dd>
                <dt className="text-text-secondary">Jadwal</dt>
                <dd className="font-semibold tabular-nums text-text-main">
                  {formData.tanggalRilis} · {formData.jam}
                </dd>
              </dl>
            </section>
          )}
          <div>
            <div className="flex justify-between">
              <label className={labelClass} htmlFor="ticket-notes">
                Catatan (Opsional)
              </label>
              <span
                className={`text-xs font-bold tabular-nums ${
                  formData.catatan.length > 200
                    ? "text-danger"
                    : "text-text-muted"
                }`}
              >
                {formData.catatan.length}/200
              </span>
            </div>
            <textarea
              id="ticket-notes"
              aria-label="Catatan (Opsional)"
              aria-invalid={!!errors.catatan}
              value={formData.catatan}
              onChange={(e) =>
                setFormData({ ...formData, catatan: e.target.value })
              }
              className={`input-minimal resize-none font-medium ${
                errors.catatan ? "border-danger ring-2 ring-danger/20" : ""
              }`}
              placeholder={
                formData.layanan === SERVICE_TYPE.GROOMING
                  ? "Contoh: Mandi Kutu, Potong Kuku..."
                  : "Contoh: Muntah, Diare, Lemas..."
              }
              rows="4"
            />
            {errors.catatan && (
              <p className="mt-1.5 ml-1 text-sm font-semibold text-danger">
                {errors.catatan}
              </p>
            )}
          </div>

          {role === "admin" && !isPublicKiosk && !ticketToEdit && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-danger-soft p-4 dark:border-red-900/40">
              <input
                type="checkbox"
                id="express"
                checked={isExpress}
                onChange={(e) => setIsExpress(e.target.checked)}
                className="h-5 w-5 cursor-pointer rounded border-border-main text-danger focus:ring-danger"
              />
              <label htmlFor="express" className="cursor-pointer select-none">
                <span className="flex items-center gap-2 text-sm font-bold text-text-main">
                  <ExclamationTriangleIcon
                    className="h-5 w-5 text-danger"
                    aria-hidden="true"
                  />
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
        <div
          className={
            inAdminPanel
              ? "flex shrink-0 flex-wrap gap-2 border-t border-border-subtle bg-bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8"
              : "mx-auto mt-5 flex w-full max-w-md gap-3 pt-1"
          }
        >
          {isPublicKiosk && (
            <Button
              variant="secondary"
              size="lg"
              className="min-h-12 flex-1"
              onClick={() => setStep(1)}
            >
              Kembali
            </Button>
          )}
          <Button
            type="submit"
            variant={
              formData.layanan === SERVICE_TYPE.GROOMING ? "grooming" : "klinik"
            }
            size="lg"
            loading={loading}
            className="min-h-12 flex-1"
          >
            {loading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <span>
                  {ticketToEdit
                    ? "Update Tiket"
                    : isKioskMode
                    ? "Ambil Antrian"
                    : "Simpan Tiket"}
                </span>
                {!ticketToEdit && (
                  <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </>
            )}
          </Button>

          {(ticketToEdit || inAdminPanel) && (
            <Button
              variant="secondary"
              size="lg"
              onClick={onCancel}
              disabled={loading}
              className="min-h-12 px-6"
            >
              Batal
            </Button>
          )}
        </div>
      )}

      {isPublicKiosk && step < 2 && (
        <div className="mx-auto mt-5 flex w-full max-w-md gap-3">
          {step > 0 && (
            <Button
              variant="secondary"
              size="lg"
              className="min-h-12 flex-1"
              onClick={() => setStep(step - 1)}
            >
              Kembali
            </Button>
          )}
          <Button
            variant={
              formData.layanan === SERVICE_TYPE.GROOMING ? "grooming" : "klinik"
            }
            size="lg"
            className="min-h-12 flex-1"
            onClick={nextStep}
          >
            Lanjut
          </Button>
        </div>
      )}
    </form>
  );
}
