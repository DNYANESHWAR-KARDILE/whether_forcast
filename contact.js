// Initialize Google Map for Contact Page
let map;

function initContactMap() {
    // Coordinates for Nashik, Maharashtra, India
    const nashik = { lat: 19.9975, lng: 73.7898 };

    // Map options
    const mapOptions = {
        zoom: 12,
        center: nashik,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "weight": "2.00"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#9c9c9c"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text",
                "stylers": [
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#f2f2f2"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "landscape.man_made",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "all",
                "stylers": [
                    {
                        "saturation": -100
                    },
                    {
                        "lightness": 45
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#7b7b7b"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#46bcec"
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#c8d7d4"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#070707"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            }
        ]
    };

    // Create Map
    const mapElement = document.getElementById('contact_map');
    if (mapElement) {
        map = new google.maps.Map(mapElement, mapOptions);

        // Add Marker for Nashik
        new google.maps.Marker({
            position: nashik,
            map: map,
            title: 'SkyGlass Headquarters',
            animation: google.maps.Animation.DROP
        });
    }
}

// Form Submission Handling
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.querySelector('.submit_btn');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Visual feedback
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
            submitBtn.style.opacity = '0.8';
            submitBtn.style.cursor = 'not-allowed';

            fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: "5389bd25-2cd0-4439-9089-c41162677480",
                    name: name,
                    email: email,
                    message: message,
                    subject: `New Contact Message from ${name}`
                })
            })
            .then(response => response.json())
            .then(data => {
                submitBtn.innerHTML = '<span>Message Sent!</span> <i class="fa-solid fa-check"></i>';
                submitBtn.style.background = 'linear-gradient(135deg, #059669, #10B981)';
                
                // Reset form
                contactForm.reset();
                
                // Revert button after 3 seconds
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                }, 3000);
            })
            .catch(error => {
                console.log(error);
                submitBtn.innerHTML = '<span>Error Sending</span> <i class="fa-solid fa-circle-exclamation"></i>';
                submitBtn.style.background = 'linear-gradient(135deg, #DC2626, #EF4444)';
                
                // Revert button after 3 seconds
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                }, 3000);
            });
        });
    }

    // Hamburger menu logic
    const hamburger = document.getElementById('hamburger-menu');
    const overlayMenu = document.getElementById('overlay_menu');
    if (hamburger && overlayMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            overlayMenu.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        const menuLinks = overlayMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                overlayMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!hamburger.contains(event.target) && !overlayMenu.contains(event.target) && overlayMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                overlayMenu.classList.remove('active');
            }
        });
    }
});
