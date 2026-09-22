import client from "./client";

export const getPaymentOverview = () => client.get("/payments");
export const updatePayoutDetails = (data) =>
  client.patch("/payments/payout-details", data);
export const requestWithdrawal = (amount) =>
  client.post("/payments/withdrawals", { amount });
