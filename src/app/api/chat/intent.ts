/**
 * Intent Detection Module
 * 
 * Detects user intent from message text and conversation history:
 * budget parsing, troubleshooting detection, guide inference,
 * escalation signals, and fallback reply generation.
 */

import { GUIDE_MAPPING } from "./knowledge";

export type ChatHistoryMessage = {
  role: string;
  content: string;
};

// ---------------------------------------------------------------------------
// Budget extraction
// ---------------------------------------------------------------------------

export function extractBudgetGhs(input: string): number | null {
  const normalized = input.toLowerCase();

  const hasCurrencySignal =
    /\bghs?\b/.test(normalized) ||
    /\bcedi(?:s)?\b/.test(normalized) ||
    normalized.includes("¢");

  const hasBudgetKeyword =
    normalized.includes("budget") ||
    normalized.includes("under") ||
    normalized.includes("below") ||
    normalized.includes("max") ||
    normalized.includes("maximum") ||
    normalized.includes("up to") ||
    normalized.includes("upto") ||
    normalized.includes("within") ||
    normalized.includes("less than") ||
    normalized.includes("at most") ||
    normalized.includes("not exceed") ||
    normalized.includes("no more than") ||
    normalized.includes("<=");

  const hasBudgetSignal =
    hasCurrencySignal ||
    hasBudgetKeyword ||
    /^\s*\d[\d,]*(?:\.\d+)?\s*$/.test(normalized);

  if (!hasBudgetSignal) return null;

  const kMatch = normalized.match(/(\d+(?:\.\d+)?)\s*k\b/);
  if (kMatch) {
    const parsedK = Number(kMatch[1]);
    if (Number.isFinite(parsedK)) {
      return parsedK * 1000;
    }
  }

  const match = normalized.match(/(\d[\d,]*(?:\.\d+)?)/);
  if (!match) return null;

  const parsed = Number(match[1].replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function resolveBudgetFromConversation(
  message: string,
  history: ChatHistoryMessage[] = [],
): number | null {
  const currentBudget = extractBudgetGhs(message);
  if (currentBudget && currentBudget > 0) return currentBudget;

  for (let i = history.length - 1; i >= 0; i--) {
    const turn = history[i];
    if (turn.role !== "user") continue;

    const historicalBudget = extractBudgetGhs(turn.content);
    if (historicalBudget && historicalBudget > 0) {
      return historicalBudget;
    }
  }

  return null;
}

export function formatGhs(amount: number): string {
  return `GHS ${amount.toLocaleString("en-GH")}`;
}

// ---------------------------------------------------------------------------
// Guide inference
// ---------------------------------------------------------------------------

export function inferGuideSlug(userMessage: string): string | undefined {
  const normalized = userMessage.toLowerCase();
  let bestMatch: { slug: string; score: number } | null = null;

  for (const guide of GUIDE_MAPPING) {
    const score = guide.keywords.reduce((acc, keyword) => {
      return acc + (normalized.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);

    if (score <= 0) continue;
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { slug: guide.slug, score };
    }
  }

  return bestMatch?.slug;
}

// ---------------------------------------------------------------------------
// Troubleshooting & escalation detection
// ---------------------------------------------------------------------------

function hasGuideAttemptContext(history: ChatHistoryMessage[] = []): boolean {
  return history.some((message) => {
    if (message.role !== "assistant") return false;

    const content = message.content.toLowerCase();
    return (
      content.includes("guide") ||
      content.includes("troubleshoot") ||
      content.includes("step") ||
      content.includes("try this")
    );
  });
}

export function shouldEscalateToSupport(
  userMessage: string,
  history: ChatHistoryMessage[] = [],
): boolean {
  const normalized = userMessage.toLowerCase();

  const unableSignals = [
    "didn't work",
    "didnt work",
    "not working",
    "still broken",
    "still not",
    "still failing",
    "can't fix",
    "cant fix",
    "cannot fix",
    "can't follow",
    "cant follow",
    "cannot follow",
    "too hard",
    "too difficult",
    "confusing",
    "not able",
    "unable to",
    "i tried",
    "tried that",
    "followed the guide",
    "guide didn't",
    "guide did not",
    "nothing works",
  ];

  const hasUnableSignal = unableSignals.some((signal) =>
    normalized.includes(signal),
  );
  if (!hasUnableSignal) return false;

  return hasGuideAttemptContext(history) || normalized.includes("guide");
}

export function hasTroubleshootingIntent(userMessage: string): boolean {
  const normalized = userMessage.toLowerCase();

  const issueSignals = [
    "fix",
    "issue",
    "problem",
    "error",
    "slow",
    "sluggish",
    "lag",
    "laggy",
    "freez",
    "broken",
    "crash",
    "boot",
    "not turning on",
    "won't",
    "wont",
    "overheating",
    "troubleshoot",
    "repair",
  ];

  const productSignals = [
    "laptop",
    "pc",
    "router",
    "switch",
    "network",
    "printer",
    "phone",
    "monitor",
    "storage",
    "audio",
    "accessory",
    "recommend",
    "buy",
    "order",
    "price",
    "budget",
  ];

  const hasIssueSignal = issueSignals.some((signal) =>
    normalized.includes(signal),
  );

  if (hasIssueSignal) return true;

  const asksForHelp =
    normalized.includes("help") || normalized.includes("assist");
  const isShoppingIntent = productSignals.some((signal) =>
    normalized.includes(signal),
  );

  return asksForHelp && !isShoppingIntent;
}

export function buildInlineTroubleshootingSteps(userMessage: string): string {
  const normalized = userMessage.toLowerCase();

  if (
    normalized.includes("slow") ||
    normalized.includes("sluggish") ||
    normalized.includes("lag")
  ) {
    return "Try this first:\n\n1. **Restart and disable heavy startup apps.**\n2. **Keep at least 15% free storage** and install OS updates.\n3. **Run a full malware scan.**\n\n*If still slow, share your OS and laptop model for deeper checks.*";
  }

  if (
    normalized.includes("boot") ||
    normalized.includes("not turning on") ||
    normalized.includes("black screen") ||
    normalized.includes("power")
  ) {
    return "Try this first:\n\n1. **Disconnect charger and peripherals**, hold power for 15 seconds, then restart.\n2. **Try another charger or outlet.**\n3. **Run BIOS or hardware diagnostics** if available.\n\n*If it still fails, share any lights, beeps, or error messages.*";
  }

  if (normalized.includes("overheating") || normalized.includes("hot")) {
    return "Try this first:\n\n1. **Clean vents** and use the laptop on a hard surface.\n2. **Close heavy apps** and apply system and driver updates.\n3. **Check fan health** with diagnostics.\n\n*If temperature still spikes, tell me when it happens and the exact model.*";
  }

  return "I'm here to help! Could you provide a bit more detail about the exact issue you're facing?\n\nIf you need immediate assistance, please **[visit our Support Center](/support)** to open a ticket or contact our team directly.";
}

// ---------------------------------------------------------------------------
// Fallback reply (used when LLM is unavailable)
// ---------------------------------------------------------------------------

export function buildFallbackReply(
  userMessage: string,
  history: ChatHistoryMessage[] = [],
): string {
  const normalized = userMessage.toLowerCase().trim();
  const guideSlug = inferGuideSlug(userMessage) || GUIDE_MAPPING[0]?.slug;
  const escalatesToSupport = shouldEscalateToSupport(userMessage, history);

  // Tracking intents
  const orderIdMatch = userMessage.match(
    /(?:order(?:\s*id)?[:#\s-]*)([a-zA-Z0-9-]{5})/i,
  );
  const ticketIdMatch = userMessage.match(
    /(?:ticket(?:\s*id)?[:#\s-]*)([a-zA-Z0-9-]{4})/i,
  );

  if (normalized.includes("track") && normalized.includes("order")) {
    if (orderIdMatch?.[1]) {
      return `Got it. I would track your order ${orderIdMatch[1]} now, but my live tracking system is currently offline. Please check your email for updates.`;
    }
    return "Sure. Share your order ID and I will track it for you.";
  }

  if (normalized.includes("track") && normalized.includes("ticket")) {
    if (ticketIdMatch?.[1]) {
      return `Got it. I would check ticket ${ticketIdMatch[1]} now, but my live system is currently offline. Please check your email for updates.`;
    }
    return "Sure. Share your ticket ID and I will check the status.";
  }

  // Repetition guard
  const userHistory = history
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase().trim());

  const lastUser = userHistory[userHistory.length - 1] || null;
  const previousUser =
    lastUser === normalized
      ? userHistory[userHistory.length - 2] || null
      : lastUser;

  if (previousUser === normalized) {
    return "I understand. Give me one detail so I can help better: your use case, budget (GHS), or exact issue.";
  }

  // Booking intent
  if (
    normalized.includes("book") ||
    normalized.includes("consultation") ||
    normalized.includes("call") ||
    normalized.includes("meeting") ||
    normalized.includes("talk to someone")
  ) {
    return "I've flagged this for a professional consultation. You can schedule a time by visiting our Consultation page.";
  }

  // Support escalation
  const supportKeywords = [
    "crash", "broken", "os", "boot", "won't boot", "wont boot",
    "blue screen", "not turning on", "overheating", "error",
    "problem", "issue", "failing", "trouble", "don't work", "repair",
  ];

  if (escalatesToSupport) {
    return "I see those troubleshooting steps didn't resolve the issue. Please reach out to our support team directly via email or phone.";
  }

  if (supportKeywords.some((k) => normalized.includes(k))) {
    if (!guideSlug) {
      return buildInlineTroubleshootingSteps(userMessage);
    }
    return `Let's troubleshoot this first. I recommend reading our guide on this topic in the Support section.`;
  }

  if (normalized.includes("help") && hasTroubleshootingIntent(userMessage)) {
    if (!guideSlug) {
      return buildInlineTroubleshootingSteps(userMessage);
    }
    return `I can help you fix this. I recommend checking our Support guides for step-by-step instructions.`;
  }

  // Product discovery
  const laptopKeywords = ["laptop", "pc", "computer", "macbook", "hp", "dell"];
  if (laptopKeywords.some((k) => normalized.includes(k))) {
    const budget = extractBudgetGhs(userMessage);
    if (normalized.includes("slow")) {
      if (!guideSlug) {
        return buildInlineTroubleshootingSteps(userMessage);
      }
      return `I can help fix laptop performance first. Check our performance troubleshooting guide in the Support section.`;
    }

    let brand = "";
    if (normalized.includes("hp")) brand = "HP ";
    else if (normalized.includes("dell")) brand = "Dell ";
    else if (normalized.includes("lenovo")) brand = "Lenovo ";
    else if (normalized.includes("apple") || normalized.includes("macbook")) brand = "Apple ";

    if (budget && budget < 6000)
      return `I recommend browsing our entry-level ${brand}laptops within your ${formatGhs(budget)} budget on our Products page. (AI Offline Mode)`;
    if (budget)
      return `I've found some premium options for your ${formatGhs(budget)} budget in our store. (AI Offline Mode)`;
    return `I can help you browse our current ${brand}laptop inventory. Please visit the Products page to see our full catalog. (AI Offline Mode)`;
  }

  const networkKeywords = ["network", "router", "switch", "wifi", "internet"];
  if (networkKeywords.some((k) => normalized.includes(k))) {
    return "Check out our networking hardware including routers and switches on the Products page. (AI Offline Mode)";
  }

  // Budget-only check
  const budgetOnly = extractBudgetGhs(userMessage);
  if (budgetOnly) {
    return `Noted budget: ${formatGhs(budgetOnly)}. What specifically are you looking for? (Laptops, Networking, or Repair)`;
  }

  // Generic catch-all
  if (history.length > 4) {
    return "I can narrow this quickly. Tell me your exact use case and budget (GHS), and I will recommend the best options. (AI Offline Mode)";
  }

  return "I'm currently experiencing high traffic or connectivity issues and running in limited offline mode. How can I help you today? (Try asking about laptops, networking, or troubleshooting)";
}
