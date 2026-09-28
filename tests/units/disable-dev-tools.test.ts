import { beforeEach, describe, expect, it, mock } from "bun:test";
import { renderHook } from "@testing-library/react";
import useDisableDevTools from "@/app/shared/hooks/disable-dev";

const mockRouter = {
  push: mock(() => undefined),
};

let mockPathname = "/";

mock.module("@/i18n/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname,
}));

mock.module("@/env", () => ({
  default: {
    NEXT_PUBLIC_DISABLE_DEVTOOLS: true,
  },
}));

describe("useDisableDevTools", () => {
  beforeEach(() => {
    mockRouter.push.mockClear();
    mockPathname = "/";
  });

  it("should prevent F12 and redirect to /unauthorized", () => {
    renderHook(() => useDisableDevTools());

    const event = new KeyboardEvent("keydown", { key: "F12" });
    document.dispatchEvent(event);

    expect(mockRouter.push).toHaveBeenCalledWith("/unauthorized");
  });

  it("should prevent Ctrl+Shift+I and redirect", () => {
    renderHook(() => useDisableDevTools());

    const event = new KeyboardEvent("keydown", {
      key: "I",
      ctrlKey: true,
      shiftKey: true,
    });
    document.dispatchEvent(event);

    expect(mockRouter.push).toHaveBeenCalledWith("/unauthorized");
  });

  it("should prevent Ctrl+U and redirect", () => {
    renderHook(() => useDisableDevTools());

    const event = new KeyboardEvent("keydown", {
      key: "U",
      ctrlKey: true,
    });
    document.dispatchEvent(event);

    expect(mockRouter.push).toHaveBeenCalledWith("/unauthorized");
  });

  it("should prevent context menu and redirect", () => {
    renderHook(() => useDisableDevTools());

    const event = new MouseEvent("contextmenu", { bubbles: true });
    document.dispatchEvent(event);

    expect(mockRouter.push).toHaveBeenCalledWith("/unauthorized");
  });

  it("should redirect only once", () => {
    renderHook(() => useDisableDevTools());

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "F12" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "F12" }));

    expect(mockRouter.push).toHaveBeenCalledTimes(1);
  });

  it("should reset redirect state when pathname changes", () => {
    const { rerender } = renderHook(() => useDisableDevTools());

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "F12" }));
    expect(mockRouter.push).toHaveBeenCalledTimes(1);

    mockPathname = "/home";
    rerender();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "F12" }));
    expect(mockRouter.push).toHaveBeenCalledTimes(2);
  });
});
