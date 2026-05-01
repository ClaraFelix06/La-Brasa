// ---- LÓGICA DO CARROSSEL (Somente aplicável se existir) ----
const slide = document.querySelector('.carrossel-slide');
if (slide) {
    const images = document.querySelectorAll('.carrossel-slide img');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    let counter = 0;

    function updateCarousel() {
        slide.style.transform = 'translateX(' + (-100 * counter) + '%)';
    }

    nextBtn.addEventListener('click', () => {
        if (counter >= images.length - 1) {
            counter = 0;
        } else {
            counter++;
        }
        updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
        if (counter <= 0) {
            counter = images.length - 1;
        } else {
            counter--;
        }
        updateCarousel();
    });
}

// ---- COMPONENTE ÚNICO DE MENU (Carregamento Universal) ----
function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch('header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;

                let currentPage = window.location.pathname.split('/').pop();
                if (currentPage === '' || currentPage === '/') {
                    currentPage = 'home.html';
                }

                const navLinks = headerPlaceholder.querySelectorAll('nav ul li a');
                navLinks.forEach(link => {
                    const linkDestino = link.getAttribute('href');
                    if (linkDestino === currentPage) {
                        link.style.color = '#FF4400';
                        link.style.borderBottom = '3px solid #FF4400';
                        link.style.paddingBottom = '5px';
                    }
                });

                // O botão de carrinho agora é flutuante e está direto no cardapio.html

                // Atualizar os números caso algo já esteja carregado
                if (typeof atualizarInterface === 'function') {
                    atualizarInterface();
                }
            })
            .catch(error => console.error("Erro ao carregar o header:", error));
    }
}

document.addEventListener('DOMContentLoaded', loadHeader);


// ---- CARRINHO DO CARDÁPIO ----

const cartSidebar = document.getElementById('cart-sidebar');
const closeBtn = document.getElementById('close-cart');
const cartList = document.querySelector('.cart-items');
const cartTotalValue = document.getElementById('cart-total-value');
const btnsPedir = document.querySelectorAll('.bt-pedir');

let totalGeral = 0;
let quantidadeItens = 0;
const itensCarrinho = {};

// Abrir/fechar sidebar
const floatingCartBtn = document.getElementById('floating-cart-btn');
if (floatingCartBtn) {
    floatingCartBtn.addEventListener('click', () => {
        if (cartSidebar) cartSidebar.classList.add('open');
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });
}

// Adicionar itens ao carrinho
btnsPedir.forEach(botao => {
    botao.addEventListener('click', () => {
        const nome = botao.getAttribute('data-nome');
        const preco = parseFloat(botao.getAttribute('data-preco'));

        if (!nome || isNaN(preco)) return;

        if (itensCarrinho[nome]) {
            itensCarrinho[nome].quantidade++;
        } else {
            const li = document.createElement('li');
            li.classList.add('cart-item');
            li.innerHTML = `
                <div class="item-info">
                    <p>${nome}</p>
                    <span class="item-price">R$ ${preco.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease-item">-</button>
                    <span class="item-quantity">1</span>
                    <button class="quantity-btn increase-item">+</button>
                </div>
                <button class="remove-item">X</button>
            `;

            itensCarrinho[nome] = { preco, quantidade: 1, elemento: li };

            li.querySelector('.decrease-item').addEventListener('click', () => {
                const item = itensCarrinho[nome];
                if (item.quantidade > 1) {
                    item.quantidade--;
                    totalGeral -= item.preco;
                    quantidadeItens--;
                    atualizarInterface();
                    return;
                }
                li.remove();
                totalGeral -= item.preco;
                quantidadeItens--;
                delete itensCarrinho[nome];
                atualizarInterface();
            });

            li.querySelector('.increase-item').addEventListener('click', () => {
                const item = itensCarrinho[nome];
                item.quantidade++;
                totalGeral += item.preco;
                quantidadeItens++;
                atualizarInterface();
            });

            li.querySelector('.remove-item').addEventListener('click', () => {
                const item = itensCarrinho[nome];
                li.remove();
                totalGeral -= item.preco * item.quantidade;
                quantidadeItens -= item.quantidade;
                delete itensCarrinho[nome];
                atualizarInterface();
            });

            cartList.appendChild(li);
        }

        totalGeral += preco;
        quantidadeItens++;
        atualizarInterface();
        
        // Abre o carrinho automaticamente
        if (cartSidebar) {
            cartSidebar.classList.add('open');
        }
    });
});

// ---- FINALIZAR PEDIDO: salva no localStorage e vai para delivery.html ----
const checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (Object.keys(itensCarrinho).length === 0) return;

        // Monta array com nome, preco e quantidade de cada item
        const pedido = Object.entries(itensCarrinho).map(([nome, item]) => ({
            nome,
            preco: item.preco,
            qtd: item.quantidade
        }));

        // Salva no localStorage para a delivery.html ler
        localStorage.setItem('labrasa_pedido', JSON.stringify(pedido));

        // Redireciona para a página de delivery
        window.location.href = 'delivery.html';
    });
}

function atualizarInterface() {
    if (totalGeral < 0) totalGeral = 0;
    if (quantidadeItens < 0) quantidadeItens = 0;

    if (cartTotalValue) cartTotalValue.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    const cartCountElem = document.getElementById('cart-count');
    if (cartCountElem) cartCountElem.innerText = quantidadeItens;

    Object.values(itensCarrinho).forEach(item => {
        const quantidade = item.elemento.querySelector('.item-quantity');
        const preco = item.elemento.querySelector('.item-price');
        quantidade.innerText = item.quantidade;
        preco.innerText = `R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`;
    });
}