const textarea = document.querySelector("textarea");
const divMessages = document.querySelector(".messages");
const sendIcon = document.querySelector(".send-icon");

textarea.addEventListener("input", updateTextareaHeight);
textarea.addEventListener("keydown", getUserMessage);
sendIcon.addEventListener("click", sendOnClick);

// Função para atualizar dinâmicamente a altura do elemento textarea
function updateTextareaHeight() {
   textarea.style.height = "auto";
   textarea.style.height = textarea.scrollHeight + "px";

   if (textarea.offsetHeight >= 200) textarea.style.overflowY = "scroll";
   else textarea.style.overflowY = "hidden";
}

// Função para limpar o conteúdo do elemento textarea
function cleanTextarea() {
   textarea.value = "";
   textarea.style.height = "initial";
}

// Função para obter a mensagem do usuário a partir do evento de teclado
function getUserMessage(event) {
   if (event.key === "Enter" && !event.shiftKey && this.value.trim()) {
      event.preventDefault();
      const message = this.value.trim();
      cleanTextarea();
      createAndSendUserMessage(message);
   }
}

// Função para enviar a mensagem do usuário quando o ícone de enviar é clicado
function sendOnClick() {
   if (textarea.value.trim()) {
      createAndSendUserMessage(textarea.value);
      cleanTextarea();
   }
}

// Função para criar e enviar a mensagem do usuário para a API
function createAndSendUserMessage(message) {
   const div = document.createElement("div");
   div.classList.add("user-message");
   div.innerText = message;
   divMessages.appendChild(div);
   div.scrollIntoView({ behavior: "smooth" });

   setTimeout(() => {
      sendMessageToApi(message);
   }, 100);
}

// Função para criar e enviar a mensagem da AI para o usuário
function createAndSendAiMessage(message, ellipsis) {
   const aiContent = document.createElement("div");
   aiContent.classList.add("ai-content");

   const img = document.createElement("img");
   img.setAttribute("src", "./src/assets/img/avatar.png");

   const p = document.createElement("p");
   p.classList.add("ai-message");

   if (ellipsis && !message) {
      p.innerHTML = ellipsis;
      p.style.whiteSpace = "normal";
   } else {
      p.innerText = message;
      p.style.whiteSpace = "pre-wrap";
   }

   aiContent.append(img, p);
   divMessages.appendChild(aiContent);

   if (window.innerWidth > 700) textarea.focus();
   aiContent.scrollIntoView({ behavior: "smooth" });
}

// Função para definir o placeholder do elemento textarea
function setTextareaPlaceholder(text, disabled) {
   textarea.setAttribute("placeholder", text);
   textarea.disabled = disabled;
}

// Função para criar um efeito de reticências
function createEllipsis() {
   return `
   <div class="dot"></div>
   <div class="dot"></div>
   <div class="dot"></div>
   `;
}

// Função para enviar a mensagem do usuário para a API
async function sendMessageToApi(message) {
   try {
      const ellipsisTimeout = setTimeout(() => {
         setTextareaPlaceholder("Gerando resposta...", true);
         createAndSendAiMessage(null, createEllipsis());
      }, 400);

      // Envia a mensagem do usuário para a API
      const response = await fetch(
         "https://ai-chatbot-endpoint.onrender.com/ask",
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
         }
      );

      // Limpa o Timeout e não executa o createEllipsis()
      // se a promise não for bem-sucedida, evitando bug visual
      clearTimeout(ellipsisTimeout);
      setTextareaPlaceholder("Faça uma pergunta!", false);

      if (response.status === 429) {
         createAndSendAiMessage(
            "Você atingiu o limite de mensagens diárias! Volte novamente amanhã."
         );
         setTextareaPlaceholder("Faça uma pergunta!", true);
      } else {
         divMessages.lastChild.remove();
         const answer = await response.json();
         createAndSendAiMessage(answer);
      }
   } catch (error) {
      console.log("Erro: " + error.message);
      setTextareaPlaceholder("Tente recarregar a página.", true);
      divMessages.lastChild.remove();

      createAndSendAiMessage(
         "Desculpe, ocorreu um erro na API da OpenAI. Se o problema persistir, tente novamente mais tarde."
      );
   }
}
