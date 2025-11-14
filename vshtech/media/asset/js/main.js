const canvas = document.getElementById('code-canvas');

if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const charset = '01<>[]{}#?&$=+-*/VSHTECH.ONLINE';
    let width;
    let height;
    let columns;
    let drops;

    const resizeCanvas = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        columns = Math.floor(width / 18);
        drops = Array(columns).fill(0);
    };

    const draw = () => {
        ctx.fillStyle = 'rgba(3, 7, 17, 0.15)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#5de0e6';
        ctx.font = '14px "Space Mono", monospace';

        drops.forEach((drop, i) => {
            const text = charset.charAt(Math.floor(Math.random() * charset.length));
            ctx.fillText(text, i * 18, drop * 18);

            if (drop * 18 > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i] = drops[i] + 1;
        });

        requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();
    window.addEventListener('resize', resizeCanvas);
}

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));

const header = document.querySelector('.site-header');
if (header) {
    const toggleState = () => {
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    toggleState();
    window.addEventListener('scroll', toggleState);
}

const featureCards = document.querySelectorAll('.feature-card, .training-card, .benefit-card');
featureCards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
        card.style.transform = `perspective(800px) rotateX(${-y}deg) rotateY(${x}deg) translateY(-4px)`;
        card.style.boxShadow = '0 25px 50px rgba(7, 12, 30, 0.45)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
    });
});

const blockDevtools = (event) => {
    if (event.key === 'F12' || ((event.ctrlKey || event.metaKey) && event.shiftKey && ['I', 'J', 'C'].includes(event.key.toUpperCase()))) {
        event.preventDefault();
        event.stopPropagation();
    }
};
document.addEventListener('keydown', blockDevtools);
document.addEventListener('contextmenu', (event) => event.preventDefault());

const ctaTargets = document.querySelectorAll('[data-cta]');
ctaTargets.forEach((element) => {
    if (element.tagName === 'BUTTON') {
        element.addEventListener('click', () => {
            window.open('https://zalo.me/0382304188', '_blank');
        });
    }
});

const yearHolder = document.getElementById('year');
if (yearHolder) {
    yearHolder.textContent = new Date().getFullYear();
}
