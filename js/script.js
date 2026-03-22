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


/* Map code removed - using Google Maps iframe embed instead */

    /* ================================================
       FORM SUBMISSION — GoHighLevel API
       ================================================ */
    // Local proxy keeps API key server-side (run ghl-proxy.rb).
    // Falls back to direct GHL API if proxy is not running.
    const GHL_PROXY  = 'http://localhost:3001/submit';
    const GHL_DIRECT = 'https://services.leadconnectorhq.com/contacts/';
    const GHL_KEY    = 'pit-d5ea78dd-c453-4f66-b6c4-8752d7c85209';
    const GHL_LOC    = 'FcshxsHOdsWHnfFGMvft';

    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = quoteForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;

            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            // Collect field values
            const nameRaw  = document.getElementById('ghl-name')?.value  || quoteForm.querySelector('input[type="text"]')?.value  || '';
            const phone    = document.getElementById('ghl-phone')?.value  || quoteForm.querySelector('input[type="tel"]')?.value   || '';
            const email    = document.getElementById('ghl-email')?.value  || quoteForm.querySelector('input[type="email"]')?.value || '';
            const service  = document.getElementById('ghl-service')?.value || quoteForm.querySelector('select')?.value             || '';
            const location = document.getElementById('ghl-location')?.value || '';
            const message  = document.getElementById('ghl-message')?.value || quoteForm.querySelector('textarea')?.value           || '';

            const nameParts = nameRaw.trim().split(/\s+/);
            const firstName = nameParts[0] || 'Unknown';
            const lastName  = nameParts.slice(1).join(' ') || '';

            const proxyPayload = {
                firstName: nameRaw,
                phone, email,
                message: `Service: ${service}\nLocation: ${location}\n\n${message}`
            };

            const ghlPayload = {
                locationId: GHL_LOC,
                firstName, lastName, phone, email,
                source: 'CrossSteel Website — Quote Form',
                tags:   ['website-lead', 'quote-request'],
                notes:  `Service: ${service}\nLocation: ${location}\n\n${message}`
            };

            try {
                let res;
                try {
                    // Try proxy first (keeps API key server-side)
                    res = await fetch(GHL_PROXY, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(proxyPayload)
                    });
                } catch (_) {
                    // Fallback: direct GHL API
                    res = await fetch(GHL_DIRECT, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${GHL_KEY}`,
                            'Version': '2021-07-28'
                        },
                        body: JSON.stringify(ghlPayload)
                    });
                }

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
