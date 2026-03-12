export const WAITING_MESSAGES = [
  "Carregando a sua benção... 🙏",
  "Buscando a palavra... 📖",
  "Espere que você vai se surpreender... ✨",
  "Preparando o banquete espiritual... 🥖",
  "Sintonizando com o céu... ☁️",
  "O Senhor é o meu pastor, nada me faltará... inclusive esta resposta! 🙌",
  "Aquietai-vos e sabei que eu sou Deus... e que estou processando... 🤫",
  "Tudo tem o seu tempo determinado... inclusive o tempo de carregamento! ⏳"
];

export const getRandomWaitingMessage = () => {
  return WAITING_MESSAGES[Math.floor(Math.random() * WAITING_MESSAGES.length)];
};
