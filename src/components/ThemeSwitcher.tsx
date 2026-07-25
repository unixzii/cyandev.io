import { type MouseEventHandler, useSyncExternalStore } from "react";
import clsx from "clsx";
import { type IconType, Icon } from "@/components/Icon";
import { type Theme, themeManager } from "@/theme";
import * as cuelume from "cuelume";

function ThemeRadioButton({
  active,
  icon,
  title,
  onClick,
}: {
  active: boolean;
  icon: IconType;
  title: string;
  onClick: MouseEventHandler;
}) {
  return (
    <button
      className={clsx(
        {
          "text-primary": active,
          "text-secondary": !active,
        },
        "flex w-[30px] h-[30px] items-center justify-center cursor-pointer hover:text-primary transition-colors duration-200",
      )}
      role="radio"
      aria-label={title}
      aria-checked={active}
      onClick={onClick}
    >
      <Icon icon={icon} size="15px" />
    </button>
  );
}

const INDICATOR_OFFSET_MAP: Record<Theme, number> = {
  dark: 2,
  system: 32,
  light: 62,
};

export function ThemeSwitcher() {
  const currentTheme = useSyncExternalStore<Theme>(
    (onStoreChange) => {
      return themeManager.registerListener(onStoreChange);
    },
    () => themeManager.getTheme(),
    () => "system",
  );

  function changeTheme(theme: Theme) {
    if (theme === themeManager.getTheme()) {
      return;
    }
    themeManager.setTheme(theme);
    cuelume.play("tick");
  }

  return (
    <div
      className="theme-switcher relative p-0.5 bg-separator inset-shadow-xs rounded-full"
      aria-label="Theme Switcher"
    >
      <div
        className="theme-switcher-thumb absolute w-[30px] h-[30px] bg-background shadow rounded-full z-10"
        style={{
          left: INDICATOR_OFFSET_MAP[currentTheme],
        }}
      />

      <div className="relative flex z-20">
        <ThemeRadioButton
          active={currentTheme === "dark"}
          icon="moon"
          title="Dark"
          onClick={() => changeTheme("dark")}
        />
        <ThemeRadioButton
          active={currentTheme === "system"}
          icon="display"
          title="System"
          onClick={() => changeTheme("system")}
        />
        <ThemeRadioButton
          active={currentTheme === "light"}
          icon="sun"
          title="Light"
          onClick={() => changeTheme("light")}
        />
      </div>
    </div>
  );
}
