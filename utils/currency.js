/**
 * Formats a number to Indian Rupees (INR) format.
 * Examples: 499 -> ₹499, 1299 -> ₹1,299
 */
export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  
  return '₹' + num.toLocaleString('en-IN');
};
