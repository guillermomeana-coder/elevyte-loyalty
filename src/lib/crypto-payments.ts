/**
 * Crypto Payment System — USDT BSC
 * Same architecture as Aurion:
 * - HD wallet derivation for unique payment addresses
 * - balanceOf via eth_call to check USDT balance
 * - No API key needed, uses public RPCs with fallback
 */

import { ethers } from "ethers";

// USDT BEP-20 contract on BSC
const USDT_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";

// Public BSC RPCs with fallback
const RPC_URLS = [
  "https://bsc-dataseed.binance.org",
  "https://bsc-dataseed1.defibit.io",
  "https://bsc-dataseed1.ninicoin.io",
];

// ERC-20 balanceOf ABI (minimal)
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

/**
 * Derive a unique payment address from xpub + index
 */
export function derivePaymentAddress(xpub: string, index: number): string {
  const hdNode = ethers.HDNodeWallet.fromExtendedKey(xpub);
  const child = hdNode.deriveChild(index);
  return child.address;
}

/**
 * Check USDT balance of an address on BSC
 * Uses balanceOf via eth_call — no API key needed
 * Tries multiple RPCs with fallback
 */
export async function checkUsdtBalance(address: string): Promise<number> {
  for (const rpcUrl of RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(USDT_CONTRACT, ERC20_ABI, provider);
      const balance = await contract.balanceOf(address);
      // USDT has 18 decimals on BSC
      const formatted = Number(ethers.formatUnits(balance, 18));
      return formatted;
    } catch (err) {
      console.log(`[CRYPTO] RPC ${rpcUrl} failed, trying next...`, err instanceof Error ? err.message : "");
      continue;
    }
  }

  console.error("[CRYPTO] All RPCs failed for address:", address);
  return 0;
}

/**
 * Get next available address index for an agency
 */
export async function getNextAddressIndex(agencyId: number): Promise<number> {
  // Import here to avoid circular deps
  const { db } = await import("@/lib/db");
  const { payments } = await import("../../drizzle/schema");
  const { eq, desc } = await import("drizzle-orm");

  const [last] = await db
    .select({ addressIndex: payments.addressIndex })
    .from(payments)
    .where(eq(payments.agencyId, agencyId))
    .orderBy(desc(payments.addressIndex))
    .limit(1);

  return (last?.addressIndex || 0) + 1;
}

/**
 * Create a new payment with a unique derived address
 */
export async function createPayment(
  agencyId: number,
  planId: number,
  amountUsdt: string,
  createdBy: number
) {
  const xpub = process.env.PAYMENT_XPUB;
  if (!xpub) throw new Error("PAYMENT_XPUB not configured");

  const { db } = await import("@/lib/db");
  const { payments } = await import("../../drizzle/schema");

  const index = await getNextAddressIndex(agencyId);
  const paymentAddress = derivePaymentAddress(xpub, index);

  // Expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const [payment] = await db
    .insert(payments)
    .values({
      agencyId,
      planId,
      amountUsdt,
      paymentAddress,
      addressIndex: index,
      status: "pending",
      expiresAt,
      createdBy,
    })
    .returning();

  return payment;
}

/**
 * Verify a pending payment by checking USDT balance
 */
export async function verifyPayment(paymentId: number): Promise<boolean> {
  const { db } = await import("@/lib/db");
  const { payments, agencies, subscriptionPlans } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!payment || payment.status !== "pending") return false;

  // Check if expired
  if (payment.expiresAt && new Date() > new Date(payment.expiresAt)) {
    await db
      .update(payments)
      .set({ status: "expired", updatedAt: new Date() })
      .where(eq(payments.id, paymentId));
    return false;
  }

  const balance = await checkUsdtBalance(payment.paymentAddress);
  const required = Number(payment.amountUsdt);

  if (balance >= required) {
    const txHash = `bsc-balance-${payment.paymentAddress}-${Date.now()}`;

    // Confirm payment
    await db
      .update(payments)
      .set({
        status: "confirmed",
        txHash,
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId));

    // Upgrade agency plan
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, payment.planId))
      .limit(1);

    if (plan) {
      await db
        .update(agencies)
        .set({
          plan: plan.slug,
          maxLocations: plan.maxLocations,
          updatedAt: new Date(),
        })
        .where(eq(agencies.id, payment.agencyId));
    }

    console.log(`[CRYPTO] Payment ${paymentId} CONFIRMED: ${balance} USDT at ${payment.paymentAddress}`);
    return true;
  }

  return false;
}
