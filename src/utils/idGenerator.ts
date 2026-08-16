/**
 * Gera um ID aleatório numérico para identificar a conta/serviço do cliente
 * Exemplo: 2024051234
 */
export const generateAccountId = () => {
  const timestamp = new Date().getTime().toString().slice(-4);
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${timestamp}${random}`;
};