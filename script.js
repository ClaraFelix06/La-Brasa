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
        // Pede o arquivo "header.html" que você isolou
        fetch('header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;

                // Efeito Brilhante do Menu: Descobrir onde estamos!
                let currentPage = window.location.pathname.split('/').pop();
                if(currentPage === '' || currentPage === '/') {
                    currentPage = 'home.html';
                }

                const navLinks = headerPlaceholder.querySelectorAll('nav ul li a');
                navLinks.forEach(link => {
                    const linkDestino = link.getAttribute('href');
                    if (linkDestino === currentPage) {
                        // Deixa a aba Laranja caso seja a página ativa
                        link.style.color = '#FF4400';
                        link.style.borderBottom = '3px solid #FF4400';
                        link.style.paddingBottom = '5px';
                    }
                });
            })
            .catch(error => console.error("Erro ao carregar o header:", error));
    }
}

// Quando o navegador desenhar a página, jogue o menu e o javascript!
document.addEventListener('DOMContentLoaded', loadHeader);


// Fazendo ligação do carrinho com os pedidos 

const cartSidebar = document.getElementById('cart-sidebar');
const openBtn = document.querySelector('.cart-open-btn');
const closeBtn = document.getElementById('close-cart');
const cartList = document.querySelector('.cart-items');
const cartTotalValue = document.getElementById('cart-total-value');
const cartCountElement = document.getElementById('cart-count'); // O número no ícone
const btnsPedir = document.querySelectorAll('.bt-pedir');

let totalGeral = 0;
let quantidadeItens = 0;
const itensCarrinho = {};

// 1. O menu de finalizar pedido SÓ abre ao clicar no ícone do carrinho
if (openBtn) {
    openBtn.addEventListener('click', () => {
        cartSidebar.classList.add('open');
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });
}

// 2. Adicionar itens ao carrinho 
btnsPedir.forEach(botao => {
    botao.addEventListener('click', () => {
        const nome = botao.getAttribute('data-nome');
        const preco = parseFloat(botao.getAttribute('data-preco'));

        if (!nome || isNaN(preco)) return;

        // Criar item visual
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

            itensCarrinho[nome] = {
                preco,
                quantidade: 1,
                elemento: li
            };

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

        // Lógica de remover
            li.querySelector('.remove-item').addEventListener('click', () => {
                const item = itensCarrinho[nome];

                li.remove();
                totalGeral -= item.preco * item.quantidade;
                quantidadeItens -= item.quantidade; // Diminui o contador
                delete itensCarrinho[nome];
                atualizarInterface();
            });

            cartList.appendChild(li);
        }
        totalGeral += preco;
        quantidadeItens++; // Aumenta o contador
        atualizarInterface();
        
        
    });
});

function atualizarInterface() {
    if (totalGeral < 0) totalGeral = 0;
    if (quantidadeItens < 0) quantidadeItens = 0;

    // Atualiza o valor total no menu lateral
    cartTotalValue.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    
    // Atualiza o número (0 para 1, etc) no ícone do cabeçalho
    cartCountElement.innerText = quantidadeItens;

    Object.values(itensCarrinho).forEach(item => {
        const quantidade = item.elemento.querySelector('.item-quantity');
        const preco = item.elemento.querySelector('.item-price');

        quantidade.innerText = item.quantidade;
        preco.innerText = `R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`;
    });
}
