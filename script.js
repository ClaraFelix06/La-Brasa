const slide = document.querySelector('.carrossel-slide');
const images = document.querySelectorAll('.carrossel-slide img');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let counter = 0;

// atualiza o CSS Transform para jogar a próxima imagem na frente
function updateCarousel() {
    slide.style.transform = 'translateX(' + (-100 * counter) + '%)';
}

nextBtn.addEventListener('click', () => {
    // se chegou na última imagem, zera pra voltar na primeira
    if (counter >= images.length - 1) {
        counter = 0;
    } else {
        counter++;
    }
    updateCarousel();
});

prevBtn.addEventListener('click', () => {
    // se tava na primeira imagem, vai direto pra última
    if (counter <= 0) {
        counter = images.length - 1;
    } else {
        counter--;
    }
    updateCarousel();
});
