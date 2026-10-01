// Receipt printing: Bluetooth thermal printer (Web Bluetooth, best-effort)
// with automatic fallback to the system print dialog.
import type { Order } from "../types";
import { PAYMENT_METHOD_LABELS } from "../types";

let btDevice: any = null;
let btChar: any = null;
const listeners = new Set<(connected: boolean) => void>();

export function isBluetoothSupported(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

export function isPrinterConnected(): boolean {
  return !!btChar && !!btDevice?.gatt?.connected;
}

export function onPrinterStatusChange(fn: (connected: boolean) => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function notify() {
  const c = isPrinterConnected();
  listeners.forEach((fn) => { try { fn(c); } catch {} });
}

const UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"; // Nordic UART (common on BT printers)
const EXTRA_SERVICES = [0xffe0, 0xff00, 0x18f0, "00001101-0000-1000-8000-00805f9b34fb"] as any[];

export async function connectBluetoothPrinter(): Promise<string> {
  if (!isBluetoothSupported()) throw new Error("Bluetooth not supported in this browser. Use Chrome on Android/desktop.");
  const nav: any = navigator as any;
  btDevice = await nav.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: [UART_SERVICE, ...EXTRA_SERVICES],
  });
  const server = await btDevice.gatt.connect();
  // Prefer Nordic UART TX characteristic, else first writable characteristic found
  let target: any = null;
  try {
    const uart = await server.getPrimaryService(UART_SERVICE);
    const chars = await uart.getCharacteristics();
    target = chars.find((c: any) => c.properties.writeWithoutResponse || c.properties.write) || chars[0];
  } catch {}
  if (!target) {
    const services = await server.getPrimaryServices();
    for (const svc of services) {
      let chars: any[] = [];
      try { chars = await svc.getCharacteristics(); } catch { continue; }
      const writable = chars.find((c) => c.properties.writeWithoutResponse || c.properties.write);
      if (writable) { target = writable; break; }
      if (!target && chars.length > 0) target = chars[0];
    }
  }
  if (!target) throw new Error("No writable characteristic found on this device");
  btChar = target;
  btDevice.addEventListener?.("gattserverdisconnected", () => { btChar = null; notify(); });
  notify();
  return btDevice.name || "Printer";
}

export function disconnectPrinter() {
  try { btDevice?.gatt?.disconnect(); } catch {}
  btChar = null;
  notify();
}

function line(text = "", width = 32): string {
  return text.slice(0, width) + "\n";
}

function row(left: string, right: string, width = 32): string {
  const gap = Math.max(1, width - left.length - right.length);
  return left + " ".repeat(gap) + right + "\n";
}

export function buildReceiptText(order: any): string {
  const W = 32;
  let t = "";
  t += line("      FINITIX SOLUTION");
  t += line(" ATTHERATE STORE SDN. BHD.");
  t += line("  Seri Kembangan, Selangor");
  t += line("  Tel: +601137356004");
  t += line("-".repeat(W));
  const typeLabel =
    order.deliveryType === "DINE_IN" ? `Dine-In (Table ${order.tableNumber || "-"})` :
    order.deliveryType === "TAKEAWAY" ? "Takeaway" :
    order.deliveryType === "ROOM" ? `Room ${order.roomNumber || "-"}` :
    "Delivery";
  t += line(`Order: ${order.orderNumber}`);
  t += line(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  t += line(`Type: ${typeLabel}`);
  t += line(`Customer: ${order.customerName || "-"}`);
  t += line("-".repeat(W));
  for (const it of order.items || []) {
    t += line(`${it.foodName} x${it.quantity}`);
    t += row(`  @${Number(it.unitPrice).toFixed(2)}`, Number(it.totalPrice).toFixed(2));
  }
  t += line("-".repeat(W));
  t += row("Subtotal:", `Rs. ${Number(order.subtotal).toFixed(2)}`);
  if (order.deliveryFee) t += row("Delivery:", `Rs. ${Number(order.deliveryFee).toFixed(2)}`);
  t += row("TOTAL:", `Rs. ${Number(order.total).toFixed(2)}`);
  t += line(`Pay: ${PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod || "-"}`);
  t += line("-".repeat(W));
  t += line("   Powered by Stratix AI");
  t += "\n\n";
  return t;
}

async function writeChunks(data: Uint8Array) {
  const CHUNK = 100;
  for (let i = 0; i < data.length; i += CHUNK) {
    const part = data.slice(i, i + CHUNK);
    if (btChar.properties?.writeWithoutResponse) {
      await btChar.writeValueWithoutResponse(part);
    } else {
      await btChar.writeValue(part);
    }
    await new Promise((r) => setTimeout(r, 60));
  }
}

export async function printViaBluetooth(order: any): Promise<void> {
  if (!isPrinterConnected()) throw new Error("Printer not connected");
  const enc = new TextEncoder();
  const INIT = new Uint8Array([0x1b, 0x40]);
  const CUT = new Uint8Array([0x1d, 0x56, 0x41, 0x00]);
  await writeChunks(INIT);
  await writeChunks(enc.encode(buildReceiptText(order)));
  await writeChunks(CUT);
}

export function printViaSystem(order: Order) {
  const typeLabel =
    order.deliveryType === "DINE_IN" ? `Dine-In (Table ${(order as any).tableNumber || "-"})` :
    order.deliveryType === "TAKEAWAY" ? "Takeaway" :
    order.deliveryType === "ROOM" ? `Room ${order.roomNumber || "-"}` :
    order.deliveryAddress || "Delivery";
  const rows = (order.items || []).map((it: any) => `
    <tr><td>${it.foodName} x ${it.quantity}</td><td style="text-align:right">Rs. ${Number(it.totalPrice).toLocaleString()}</td></tr>`).join("");
  const html = `
    <html><head><title>Bill ${order.orderNumber}</title>
    <style>body{font-family:monospace;padding:24px;max-width:320px;margin:auto}h2,h3,p{text-align:center;margin:4px 0}table{width:100%;border-collapse:collapse;margin:12px 0}td{padding:4px 0;border-top:1px dashed #999}.total{font-size:18px;font-weight:bold}</style>
    </head><body onload="window.print();">
    <h2>FINITIX SOLUTION</h2>
    <p>ATTHERATE STORE SDN. BHD.<br/>Seri Kembangan, Selangor<br/>Tel: +601137356004</p>
    <hr/>
    <p>Order: <b>${order.orderNumber}</b><br/>${new Date(order.createdAt).toLocaleString()}<br/>${typeLabel} · ${order.customerName}</p>
    <hr/>
    <table>${rows}</table>
    <hr/>
    <p class="total">TOTAL: Rs. ${Number(order.total).toLocaleString()}</p>
    <p>Payment: ${PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</p>
    <hr/>
    <h3>Powered by Stratix AI</h3>
    </body></html>`;
  const w = window.open("", "_blank", "width=360,height=600");
  if (!w) throw new Error("Popup blocked - allow popups to print");
  w.document.write(html);
  w.document.close();
}

// Print via Bluetooth when connected, otherwise system dialog.
// Returns "bluetooth" or "system" so UI can confirm what happened.
export async function printOrder(order: any): Promise<"bluetooth" | "system"> {
  if (isPrinterConnected()) {
    await printViaBluetooth(order);
    return "bluetooth";
  }
  printViaSystem(order as Order);
  return "system";
}
