import { HomeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-canvas">
      <Card
        padding="lg"
        elevated
        className="w-full max-w-md text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary-soft text-primary mx-auto mb-5 flex items-center justify-center">
          <MagnifyingGlassIcon aria-hidden="true" className="w-8 h-8" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2 tabular-nums">
          404 · Halaman Tidak Ditemukan
        </p>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-main mb-3 tracking-tight">
          Oops! Nyasar?
        </h1>

        <p className="text-text-secondary text-sm sm:text-base mb-8 leading-relaxed">
          Halaman yang Anda cari tidak tersedia atau alamatnya sudah berubah.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/", { replace: true })}
            className="w-full sm:w-auto"
          >
            <HomeIcon aria-hidden="true" className="w-5 h-5" />
            <span>Kembali ke Beranda</span>
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate("/kiosk", { replace: true })}
            className="w-full sm:w-auto"
          >
            <span>Buka Kiosk</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
