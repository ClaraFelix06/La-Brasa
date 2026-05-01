// Tudo dentro dessa função, só roda depois que o HTML carrega
document.addEventListener('DOMContentLoaded', () => {

    // Estado 
    let carrinho = [];

    //Referências DOM
    const carrinhoLista   = document.getElementById('carrinho-lista');
    const totalValorEl    = document.getElementById('total-valor');
    const btnFinalizar    = document.getElementById('btn-finalizar');
    const modal           = document.getElementById('modal');
    const modalTexto      = document.getElementById('modal-texto');
    const btnModalOk      = document.getElementById('btn-modal-ok');
    const toastEl         = document.getElementById('toast');
    const selectPagamento = document.getElementById('pagamento');
    const campoTroco      = document.getElementById('campo-troco');
    const inputWhatsapp   = document.getElementById('whatsapp');

    // TOAST: Mensagem que vai aparecer no rodapé carro tenha algo de errado
    let toastTimer;
    function mostrarToast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
    }

    // Rederizar o carrinho
    function renderCarrinho() {
        carrinhoLista.innerHTML = '';

        if (carrinho.length === 0) {
            const li = document.createElement('li');
            li.className = 'carrinho-vazio';
            li.textContent = 'Seu carrinho está vazio.';
            carrinhoLista.appendChild(li);
            totalValorEl.textContent = 'R$ 0,00';
            return;
        }

        carrinho.forEach((item, idx) => {
            const li = document.createElement('li');
            li.className = 'carrinho-item';
            li.innerHTML = `
                <div class="ci-info">
                    <p>${item.nome}</p>
                    <span>R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="ci-qtd">
                    <button class="btn-qtd" data-idx="${idx}" data-acao="diminuir">−</button>
                    <span class="ci-qtd-num">${item.qtd}</span>
                    <button class="btn-qtd" data-idx="${idx}" data-acao="aumentar">+</button>
                </div>
                <span class="ci-subtotal">R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</span>
            `;
            carrinhoLista.appendChild(li);
        });

        carrinhoLista.querySelectorAll('.btn-qtd').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx  = parseInt(btn.getAttribute('data-idx'));
                const acao = btn.getAttribute('data-acao');
                if (acao === 'aumentar') {
                    carrinho[idx].qtd++;
                } else {
                    carrinho[idx].qtd--;
                    if (carrinho[idx].qtd <= 0) carrinho.splice(idx, 1);
                }
                renderCarrinho();
            });
        });

        const total = carrinho.reduce((acc, i) => acc + i.preco * i.qtd, 0);
        totalValorEl.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
        localStorage.setItem('labrasa_pedido', JSON.stringify(carrinho));
    }

    // Carregar o pedido do carrinho (localStorage)
    const pedidoSalvo = localStorage.getItem('labrasa_pedido');
    if (pedidoSalvo) {
        try {
            const itensSalvos = JSON.parse(pedidoSalvo);
            itensSalvos.forEach(item => {
                carrinho.push({ nome: item.nome, preco: item.preco, qtd: item.qtd });
            });
            
        } catch (e) {
            console.error('Erro ao ler pedido salvo:', e);
        }
    }

    renderCarrinho();

    if (carrinho.length > 0) {
        mostrarToast('🍕 Seu pedido foi carregado!');
    }

    // Botões de incluir as bebidas
    document.querySelectorAll('.btn-incluir').forEach(btn => {
        btn.addEventListener('click', () => {
            const nome  = btn.getAttribute('data-nome');
            const preco = parseFloat(btn.getAttribute('data-preco'));
            const existente = carrinho.find(i => i.nome === nome);
            if (existente) {
                existente.qtd++;
            } else {
                carrinho.push({ nome, preco, qtd: 1 });
            }
            renderCarrinho();
            mostrarToast(nome + ' adicionado! 🥤');
        });
    });

    // Máscara de telefone, padrão: (00)0000-0000
    inputWhatsapp.addEventListener('input', () => {
        let v = inputWhatsapp.value.replace(/\D/g, '').substring(0, 11);
        if      (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
        else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
        else if (v.length > 0) v = `(${v}`;
        inputWhatsapp.value = v;
    });

    // Campo de troco
    selectPagamento.addEventListener('change', () => {
        campoTroco.style.display = selectPagamento.value === 'dinheiro' ? 'block' : 'none';
    });

    // Finalização do pedido
    btnFinalizar.addEventListener('click', () => {
        const nome      = document.getElementById('nome').value.trim();
        const whatsapp  = document.getElementById('whatsapp').value.trim();
        const endereco  = document.getElementById('endereco').value.trim();
        const pagamento = selectPagamento.value;

        if (!nome)                                               return mostrarToast('⚠️ Informe seu nome.');
        if (!whatsapp || whatsapp.replace(/\D/g,'').length < 10) return mostrarToast('⚠️ Informe um WhatsApp válido.');
        if (!endereco)                                           return mostrarToast('⚠️ Informe seu endereço.');
        if (!pagamento)                                          return mostrarToast('⚠️ Escolha o método de pagamento.');
        if (carrinho.length === 0)                               return mostrarToast('⚠️ Adicione pelo menos um item!');
        
        const temPizza = carrinho.some(item => item.nome.toLowerCase().includes('pizza'));
        if (!temPizza)                                           return mostrarToast('⚠️ Você precisa incluir pelo menos uma pizza no pedido!');

        let linhatroco = '';
        if (pagamento === 'dinheiro') {
            const troco = parseFloat(document.getElementById('troco').value);
            const total = carrinho.reduce((a, i) => a + i.preco * i.qtd, 0);
            if (troco && troco < total) return mostrarToast('⚠️ Troco menor que o total.');
            if (troco) linhatroco = `<br>Troco para: R$ ${troco.toFixed(2).replace('.', ',')}`;
        }

        const total = carrinho.reduce((a, i) => a + i.preco * i.qtd, 0);
        const pagLabels = { pix:'PIX', credito:'Cartão de Crédito', debito:'Cartão de Débito', dinheiro:'Dinheiro' };

        modalTexto.innerHTML =
            `<strong>${nome}</strong><br>` +
            `📍 ${endereco}<br>` +
            `📱 ${whatsapp}<br><br>` +
            carrinho.map(i =>
                `${i.qtd}x ${i.nome} — R$ ${(i.preco * i.qtd).toFixed(2).replace('.', ',')}`
            ).join('<br>') +
            `<br><br><strong>Total: R$ ${total.toFixed(2).replace('.', ',')}</strong>` +
            `<br>Pagamento: ${pagLabels[pagamento] || pagamento}` +
            linhatroco;

        modal.style.display = 'flex';
    });

    // Fechar o modal e após o fechamento dele, reseta todos os dados do pedido
    btnModalOk.addEventListener('click', resetarTudo);

    modal.addEventListener('click', e => {
        if (e.target === modal) resetarTudo();
    });

    function resetarTudo() {
        modal.style.display = 'none';
        carrinho = [];
        renderCarrinho();
        ['nome', 'whatsapp', 'endereco', 'troco'].forEach(id => {
            document.getElementById(id).value = '';
        });
        selectPagamento.value = '';
        campoTroco.style.display = 'none';
    }

}); // fim DOMContentLoaded