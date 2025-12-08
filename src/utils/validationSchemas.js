import { z } from "zod";
import { SERVICE_TYPE } from "../constants";

export const ticketSchema = z.object({
  nama: z.string().min(1, "Nama pemilik wajib diisi"),
  kontak: z.string().min(10, "Nomor kontak minimal 10 digit").max(15, "Nomor kontak maksimal 15 digit").regex(/^[0-9]+$/, "Kontak hanya boleh berisi angka"),
  layanan: z.enum([SERVICE_TYPE.GROOMING, SERVICE_TYPE.KLINIK], {
    errorMap: () => ({ message: "Pilih layanan yang valid" }),
  }),
  catatan: z.string().max(200, "Catatan maksimal 200 karakter").optional(),
});


export const userSchema = z.object({
  name: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["admin", "pic_grooming", "pic_klinik"], {
    errorMap: () => ({ message: "Role tidak valid" }),
  }),
});


export const cancelSchema = z.object({
  reason: z.string().min(1, "Alasan pembatalan wajib dipilih"),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});
