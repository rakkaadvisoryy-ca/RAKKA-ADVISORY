const modal = document.getElementById("mpesaModal");
const modalText = document.getElementById("mpesaModalText");
const statusEl = document.getElementById("payStatus");

const phoneEl = document.getElementById("mpesaPhone");
const amountEl = document.getElementById("mpesaAmount");
const serviceEl = document.getElementById("serviceName");

document.getElementById("year").textContent = new Date().getFullYear();

// WhatsApp button (your saved number)
document.getElementById("waBtn").href = "https://wa.me/254739477171?text=" + encodeURIComponent("Hello Rakka Advisory, I need assistance.");

// Clicking a pricing button auto-fills the pay box
document.querySelectorAll("[data-pick][data-amt]").forEach((btn) => {
  btn.addEventListener("click", () => {
    serviceEl.value = btn.getAttribute("data-pick") || "";
    amountEl.value = btn.getAttribute("data-amt") || "";
  });
});

document.getElementById("payBtn").addEventListener("click", () => {
  const phone = phoneEl.value.trim();
  const amount = Math.floor(Number(amountEl.value));
  const service = serviceEl.value.trim() || "Rakka Advisory Service";

  if (!phone) return setStatus("Please enter your M-Pesa phone number.", true);
  if (!amount || amount < 1) return setStatus("Please enter a valid amount.", true);

  modalText.textContent = `You are about to pay KES ${amount.toLocaleString()} for "${service}" to Rakka Advisory via M-Pesa. Continue?`;
  modal.style.display = "flex";
});

document.getElementById("cancelPay").addEventListener("click", () => {
  modal.style.display = "none";
});

document.getElementById("confirmPay").addEventListener("click", async () => {
  modal.style.display = "none";
  setStatus("Sending payment request…", false);

  const phone = phoneEl.value.trim();
  const amount = Math.floor(Number(amountEl.value));
  const service = serviceEl.value.trim() || "Rakka Advisory Service";

  try {
    // IMPORTANT:
    // If you deploy site on GitHub Pages, this /api path must be proxied/routed to your Worker domain.
    // Easiest: call your Worker URL directly here (see steps below).
    const API_BASE = window.RAKKA_API_BASE || ""; // set in index if you want

    const res = await fetch(`${API_BASE}/api/mpesa/stkpush`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        amount,
        accountReference: "RAKKA",
        description: `Payment: ${service}`,
        service
      })
    });

    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Payment request failed.");

    setStatus("✅ Request sent. Check your phone for the M-Pesa prompt and enter your PIN to complete payment.", false);
  } catch (e) {
    setStatus("❌ " + (e.message || "Something went wrong."), true);
  }
});

function setStatus(msg, isError) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? "#ff9aa2" : "#9fffd3";
}

