import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _setStore(s: Record<string, string>) { store = { ...s }; },
  };
})();

vi.stubGlobal("localStorage", localStorageMock);

// Mock crypto.randomUUID
vi.stubGlobal("crypto", { randomUUID: () => "test-uuid-1234" });

class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static CONNECTING = 0;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((ev: any) => void) | null = null;
  onclose: ((ev: any) => void) | null = null;
  onerror: ((ev: any) => void) | null = null;
  onmessage: ((ev: any) => void) | null = null;
  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
  });

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  // Simulate the server opening the connection
  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.({});
  }

  simulateClose() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({});
  }

  // Track instances for test assertions
  static instances: MockWebSocket[] = [];
  static reset() {
    MockWebSocket.instances = [];
  }
}

vi.stubGlobal("WebSocket", MockWebSocket);

let useWebSocket: typeof import("../app/lib/useWebSocket").useWebSocket;

beforeEach(async () => {
  vi.useFakeTimers();
  MockWebSocket.reset();
  localStorageMock.clear();
  localStorageMock._setStore({});

  vi.resetModules();
  const mod = await import("../app/lib/useWebSocket");
  useWebSocket = mod.useWebSocket;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useWebSocket", () => {
  it("does NOT connect when no access_token in localStorage", () => {
    localStorageMock._setStore({});

    renderHook(() => useWebSocket());

    expect(MockWebSocket.instances).toHaveLength(0);
  });

  it("connects when access_token is present", () => {
    localStorageMock._setStore({ access_token: "valid-token" });

    renderHook(() => useWebSocket());

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toContain("token=valid-token");
  });

  it("sets connected to true after WebSocket opens", () => {
    localStorageMock._setStore({ access_token: "valid-token" });

    const { result } = renderHook(() => useWebSocket());

    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateOpen();
    });

    expect(result.current.connected).toBe(true);
  });

  it("calls onConnect callback when connection opens", () => {
    localStorageMock._setStore({ access_token: "valid-token" });
    const onConnect = vi.fn();

    renderHook(() => useWebSocket({ onConnect }));

    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateOpen();
    });

    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it("calls onMessage callback when a message is received", () => {
    localStorageMock._setStore({ access_token: "valid-token" });
    const onMessage = vi.fn();

    renderHook(() => useWebSocket({ onMessage }));

    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateOpen();
    });

    act(() => {
      ws.onmessage?.({ data: JSON.stringify({ type: "notification", text: "hello" }) });
    });

    expect(onMessage).toHaveBeenCalledWith({ type: "notification", text: "hello" });
  });

  it("does not reconnect on close when token is removed", () => {
    localStorageMock._setStore({ access_token: "valid-token" });

    renderHook(() => useWebSocket());

    expect(MockWebSocket.instances).toHaveLength(1);

    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateOpen();
    });

    // Remove token before close
    localStorageMock._setStore({});

    act(() => {
      ws.simulateClose();
    });

    // Advance past any reconnect delay
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should still only have 1 instance (no reconnect attempted)
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("attempts reconnect on close when token still exists", () => {
    localStorageMock._setStore({ access_token: "valid-token" });

    renderHook(() => useWebSocket());

    expect(MockWebSocket.instances).toHaveLength(1);

    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateOpen();
    });

    // Close while token still exists
    act(() => {
      ws.simulateClose();
    });

    // First reconnect delay = min(1000 * 2^0, 30000) = 1000ms
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Should have created a second WebSocket instance
    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it("send returns false when not connected", () => {
    localStorageMock._setStore({});

    const { result } = renderHook(() => useWebSocket());

    const sendResult = result.current.send("test_action", { key: "value" });
    expect(sendResult).toBe(false);
  });
});
