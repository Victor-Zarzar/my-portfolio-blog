import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaArrowRight, FaLaptopCode } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { MdDarkMode, MdOutlineLightMode } from "react-icons/md";
import LangToggleModal from "@/app/features/lang-toggle/lang-toggle-modal";
import { Button } from "@/app/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/shared/ui/select";

export default function SettingsSwitcher() {
  const [open, setOpen] = useState(false);
  const { setTheme, theme } = useTheme();

  const t = useTranslations("Navbar");

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("app:open-settings", handler as EventListener);
    return () =>
      window.removeEventListener("app:open-settings", handler as EventListener);
  }, []);

  return (
    <div className="container-settings">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => setOpen(true)}
            aria-label={t("open-settings")}
          >
            <IoMdSettings size={27} aria-hidden="true" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[320px] sm:max-w-106.25 dark:bg-stone-950 bg-[#ffffff] border-black dark:border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IoMdSettings size={20} aria-hidden="true" />
              <span>{t("settings")}</span>
            </DialogTitle>
            <DialogDescription>{t("dialog-description")}</DialogDescription>
          </DialogHeader>
          <span className="border-b border-black dark:border-gray-200" />
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <span>{t("toggle-theme")}</span>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#ffffff]">
                  <SelectItem value="light">
                    <div className="flex items-center space-x-2">
                      <MdOutlineLightMode />
                      <span>{t("light")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center space-x-2">
                      <MdDarkMode />
                      <span>{t("dark")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center space-x-2">
                      <FaLaptopCode />
                      <span>{t("system")}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("language")}</span>
              <LangToggleModal />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setOpen(false)}>
              {t("close")}
              <FaArrowRight className="ml-1 animate-pulse" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
