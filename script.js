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
