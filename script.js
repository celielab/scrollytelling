(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('js-enabled');

    var progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress-bar';
    document.body.appendChild(progressBar);

    function updateProgressBar() {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
    }

    var backToTop = document.createElement('button');
    backToTop.id = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Terug naar boven');
    backToTop.textContent = '\u2191';
    document.body.appendChild(backToTop);

    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    var heroSection = document.querySelector('.hero-section');
    function updateBackToTop() {
        var heroBottom = heroSection ? heroSection.getBoundingClientRect().bottom : 0;
        var show = heroBottom < 0;
        backToTop.classList.toggle('visible', show);
    }

    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
    var navMap = {};
    navLinks.forEach(function (link) {
        var id = link.getAttribute('href').replace('#', '');
        if (document.getElementById(id)) navMap[id] = link;
    });

    function setActiveLink(activeLink) {
        navLinks.forEach(function (l) {
            l.style.textDecoration = 'none';
            l.style.textUnderlineOffset = '';
        });
        if (activeLink) {
            activeLink.style.textDecoration = 'underline';
            activeLink.style.textUnderlineOffset = '5px';
        }
    }

    function updateActiveLink() {
        var triggerPoint = window.innerHeight * 0.4;
        var currentId = null;

        for (var id in navMap) {
            var section = document.getElementById(id);
            if (!section) continue;
            var rect = section.getBoundingClientRect();
            if (rect.top <= triggerPoint && rect.bottom > triggerPoint) {
                currentId = id;
            }
        }

        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY >= docHeight - 5) {
            var ids = Object.keys(navMap);
            currentId = ids[ids.length - 1];
        }

        if (currentId) {
            setActiveLink(navMap[currentId]);
        }
    }
    
    var revealEls = Array.prototype.slice.call(
        document.querySelectorAll('.card, .barrier-item, .tools, .map-card, .stores-container, .highlight-box, .tip-box')
    );

    var groups = new Map();
    revealEls.forEach(function (el) {
        var parent = el.parentElement;
        if (!groups.has(parent)) groups.set(parent, []);
        groups.get(parent).push(el);
    });

    if (!reduceMotion) {
        revealEls.forEach(function (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(24px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });
    }

    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            if (!reduceMotion) {
                var siblings = groups.get(el.parentElement) || [el];
                var delay = Math.max(siblings.indexOf(el), 0) * 120;
                setTimeout(function () {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, delay);
            } else {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
            revealObserver.unobserve(el);
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });

    var closingContainer = document.querySelector('.closing-section .container');
    var largeText = document.querySelector('.large-text');

    var dots = null;
    if (closingContainer && largeText) {
        dots = document.createElement('div');
        dots.className = 'person-icons';
        if (largeText.nextSibling) {
            largeText.parentNode.insertBefore(dots, largeText.nextSibling);
        } else {
            largeText.parentNode.appendChild(dots);
        }
    }

    var MAX_DOTS = 100;
    var filled = 0;

    function makePerson() {
        var person = document.createElement('span');
        person.className = 'person-icon';
        return person;
    }

    function updateMultiplyingDots() {
        if (!dots || !closingContainer) return;
        var rect = closingContainer.getBoundingClientRect();
        var progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;
        var eased = progress * progress;
        var target = Math.round(eased * MAX_DOTS);

        while (filled < target) {
            dots.appendChild(makePerson());
            filled++;
        }
        while (filled > target && dots.lastChild) {
            dots.removeChild(dots.lastChild);
            filled--;
        }
    }

    var heroContent = document.querySelector('.hero-section .container');

    function updateHeroParallax() {
        if (!heroContent || !heroSection) return;
        var scrollY = window.scrollY;
        var heroHeight = heroSection.offsetHeight;

        if (scrollY <= heroHeight) {
            var opacity = 1 - (scrollY / heroHeight);
            if (opacity < 0) opacity = 0;
            heroContent.style.opacity = opacity;
            if (!reduceMotion) {
                heroContent.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
            }
        } else {
            heroContent.style.opacity = 0;
        }
    }

    var ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                updateProgressBar();
                updateBackToTop();
                updateMultiplyingDots();
                updateHeroParallax();
                updateActiveLink();
                ticking = false;
            });
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
})();
