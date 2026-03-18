document.addEventListener('DOMContentLoaded', () => {

    /* ================================================
       MOBILE MENU
       ================================================ */
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const menuClose = document.querySelector('.mobile-menu-close');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');

    function toggleMenu() {
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : '';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
        menuClose.addEventListener('click', toggleMenu);
        mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));
    }


    /* ================================================
       HEADER — SHRINK ON SCROLL
       ================================================ */
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        // Add scrolled class after 60px (slightly smaller, more prominent)
        if (scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide on scroll down, show on scroll up (below 200px threshold)
        if (scrollY > 200) {
            if (scrollY > lastScroll) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScroll = scrollY;
    }, { passive: true });


    /* ================================================
       SCROLL REVEAL — INTERSECTION OBSERVER
       ================================================ */
    const revealItems = document.querySelectorAll('.reveal-item');

    if (revealItems.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Stagger siblings by their index within the parent
                    const siblings = [...entry.target.parentNode.querySelectorAll('.reveal-item')];
                    const delay = siblings.indexOf(entry.target) * 90;
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, delay);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        });

        revealItems.forEach(item => revealObserver.observe(item));
    }


    /* ================================================
       ANIMATED COUNTERS
       ================================================ */
    function animateCounter(el, target, duration = 1800) {
        let start = 0;
        const step = target / (duration / 16);

        function update() {
            start += step;
            if (start >= target) {
                el.textContent = target;
                return;
            }
            el.textContent = Math.floor(start);
            requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }

    const counters = document.querySelectorAll('.counter');
    let countersStarted = false;

    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersStarted) {
                    countersStarted = true;
                    counters.forEach(counter => {
                        const target = parseInt(counter.dataset.target, 10);
                        animateCounter(counter, target);
                    });
                    counterObserver.disconnect();
                }
            });
        }, { threshold: 0.3 });

        counterObserver.observe(counters[0]);
    }


    /* ================================================
       FAQ ACCORDION
       ================================================ */
    const accordions = document.querySelectorAll('.accordion-header');

    accordions.forEach(acc => {
        acc.addEventListener('click', function () {
            const isActive = this.classList.contains('active');
            const panel = this.nextElementSibling;

            // Close all open ones first
            accordions.forEach(other => {
                if (other !== this) {
                    other.classList.remove('active');
                    other.nextElementSibling.style.maxHeight = null;
                }
            });

            // Toggle this one
            if (isActive) {
                this.classList.remove('active');
                panel.style.maxHeight = null;
            } else {
                this.classList.add('active');
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
    });


    /* ================================================
       MAP — LEAFLET
       ================================================ */
    if (document.getElementById('map')) {
        const magnoliaLat = 30.2085;
        const magnoliaLng = -95.7508;

        const map = L.map('map').setView([magnoliaLat, magnoliaLng], 9);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // 50-mile service radius
        L.circle([magnoliaLat, magnoliaLng], {
            color: '#ff4500',
            fillColor: '#ff4500',
            fillOpacity: 0.08,
            radius: 80467,
            weight: 1.5
        }).addTo(map);

        // Custom icon
        const csIcon = L.divIcon({
            html: `<div style="background:#ff4500;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 12px rgba(255,69,0,0.7)"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
            className: ''
        });

        L.marker([magnoliaLat, magnoliaLng], { icon: csIcon })
            .addTo(map)
            .bindPopup('<b style="color:#ff4500">CrossSteel Welding</b><br>Magnolia, TX — Mobile Welding')
            .openPopup();
    }


    /* ================================================
       FORM SUBMISSION — GoHighLevel Webhook
       ================================================ */
    const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/pit-3ed7afe3-0612-4c5b-ae11-d59d48b3d97e';

    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = quoteForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;

            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            // Collect field values (works with or without IDs)
            const nameRaw  = (document.getElementById('ghl-name')  || quoteForm.querySelector('input[type="text"]'))?.value  || '';
            const phone    = (document.getElementById('ghl-phone') || quoteForm.querySelector('input[type="tel"]'))?.value   || '';
            const email    = (document.getElementById('ghl-email') || quoteForm.querySelector('input[type="email"]'))?.value || '';
            const service  = (document.getElementById('ghl-service') || quoteForm.querySelector('select'))?.value           || '';
            const location = document.getElementById('ghl-location')?.value || '';
            const message  = (document.getElementById('ghl-message') || quoteForm.querySelector('textarea'))?.value         || '';

            // Split name into first / last
            const nameParts  = nameRaw.trim().split(/\s+/);
            const firstName  = nameParts[0] || 'Unknown';
            const lastName   = nameParts.slice(1).join(' ') || '';

            const payload = {
                firstName,
                lastName,
                phone,
                email,
                message: `Service: ${service}\nLocation: ${location}\n\n${message}`,
                source:  'CrossSteel Website — Quote Form',
                tags:    ['website-lead', 'quote-request']
            };

            try {
                await fetch(GHL_WEBHOOK, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(payload)
                });

                // Success
                quoteForm.innerHTML = `
                    <div style="text-align:center;padding:50px 20px;">
                        <div style="font-size:3rem;color:#ff4500;margin-bottom:16px">
                            <i class="fa-solid fa-circle-check"></i>
                        </div>
                        <h3 style="font-size:1.8rem;margin-bottom:12px;color:#fff">Quote Request Sent!</h3>
                        <p style="color:#aaa;font-size:1rem;line-height:1.7">
                            Thanks — we'll be in touch within a few hours.<br>
                            Or call us now at <a href="tel:3462367549" style="color:#ff4500;font-weight:700">(346) 236-7549</a>.
                        </p>
                    </div>
                `;
            } catch (err) {
                // Re-enable form if network error
                btn.innerHTML = originalHTML;
                btn.disabled = false;
                btn.style.opacity = '1';
                alert('Something went wrong. Please call us at (346) 236-7549 or try again.');
            }
        });
    }


    /* ================================================
       SMOOTH SCROLL
       ================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });


    /* ================================================
       PARALLAX — HERO BACKGROUND (lightweight)
       ================================================ */
    const heroBg = document.querySelector('.hero');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            if (scrolled < window.innerHeight) {
                heroBg.style.backgroundPositionY = `calc(50% + ${scrolled * 0.3}px)`;
            }
        }, { passive: true });
    }


    /* ================================================
       GALLERY FILTER
       ================================================ */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const noResults = document.getElementById('galleryNoResults');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('filter-active'));
                btn.classList.add('filter-active');

                const filter = btn.dataset.filter;
                let visibleCount = 0;

                galleryItems.forEach(item => {
                    const category = item.dataset.category;
                    if (filter === 'all' || category === filter) {
                        item.classList.remove('gallery-hidden');
                        visibleCount++;
                    } else {
                        item.classList.add('gallery-hidden');
                    }
                });

                if (noResults) {
                    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
                }
            });
        });
    }

});
