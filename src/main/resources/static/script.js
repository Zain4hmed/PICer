document.addEventListener("DOMContentLoaded", function() {
    const selectedImages = [];
    const gridContainer = document.getElementById("grid-container");
    const deleteButton = document.getElementById("deleteImages");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".close");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");
    const loadingOverlay = document.getElementById("loading-overlay");
    let currentImageIndex = -1;
    let images = [];

    // Function to show loading overlay
    function showLoadingOverlay() {
        loadingOverlay.style.display = "flex";
    }

    // Function to hide loading overlay
    function hideLoadingOverlay() {
        loadingOverlay.style.display = "none";
    }

    // Function to fetch and render images
    function fetchAndRenderImages() {
        showLoadingOverlay(); // Show loading overlay
        gridContainer.classList.add("loading"); // Hide grid items

        fetch('/api/files/imageslist')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                gridContainer.innerHTML = ''; // Clear existing images
                images = data.reverse(); // Reverse the data array to load images from the top

                const imagePromises = images.map((imageName, index) => {
                    return new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = function() {
                            const div = document.createElement("div");
                            div.classList.add("grid-item");

                            const imgElement = document.createElement("img");
                            imgElement.src = `/upload/${imageName}?t=${new Date().getTime()}`;
                            imgElement.alt = imageName;
                            imgElement.dataset.name = imageName;
                            imgElement.dataset.index = index;

                            const fullscreenIcon = document.createElement("div");
                            fullscreenIcon.classList.add("fullscreen-icon");
                            fullscreenIcon.innerHTML = "&#x26F6;"; // Unicode character for fullscreen icon

                            imgElement.addEventListener("click", function() {
                                this.classList.toggle("selected");
                                const index = selectedImages.indexOf(imageName);
                                if (imgElement.classList.contains("selected")) {
                                    if (index === -1) {
                                        selectedImages.push(imageName);
                                    }
                                } else {
                                    if (index !== -1) {
                                        selectedImages.splice(index, 1);
                                    }
                                }
                                console.log('Selected images:', selectedImages);
                            });

                            fullscreenIcon.addEventListener("click", function(event) {
                                event.stopPropagation();
                                currentImageIndex = index;
                                openLightbox();
                            });

                            div.appendChild(imgElement);
                            div.appendChild(fullscreenIcon);
                            gridContainer.appendChild(div);

                            resolve();
                        };

                        img.onerror = function() {
                            console.error('Error loading image:', imageName);
                            reject(new Error('Failed to load image'));
                        };

                        img.src = `/upload/${imageName}?t=${new Date().getTime()}`;
                    });
                });

                Promise.all(imagePromises)
                    .then(() => {
                        hideLoadingOverlay(); // Hide loading overlay after images are loaded
                        gridContainer.classList.remove("loading"); // Show grid items
                    })
                    .catch(error => {
                        console.error('Error loading images:', error);
                        hideLoadingOverlay(); // Ensure loading overlay is hidden on error
                        gridContainer.classList.remove("loading"); // Show grid items
                    });
            })
            .catch(error => {
                console.error('Error fetching image names:', error);
                hideLoadingOverlay(); // Ensure loading overlay is hidden on error
                gridContainer.classList.remove("loading"); // Show grid items
            });
    }

    // Initial fetch and render
    fetchAndRenderImages();

    // Delete selected images
    deleteButton.addEventListener("click", function() {
        if (selectedImages.length === 0) {
            alert("Please select images to delete.");
            return;
        }

        console.log('Deleting images:', selectedImages);

        fetch('/api/files/deleteSelected', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(selectedImages)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete images');
            }
            return response.text(); // Parse response as text
        })
        .then(data => {
            console.log('Delete response:', data);

            // Handle successful deletion
            selectedImages.length = 0; // Clear selectedImages array
            fetchAndRenderImages(); // Refresh the grid after deletion
        })
        .catch(error => {
            console.error('Error deleting images:', error);
            alert('Failed to delete images. Please try again later.');
        });
    });

    // Open lightbox
    function openLightbox() {
        lightbox.style.display = "block";
        lightboxImg.src = `/upload/${images[currentImageIndex]}?t=${new Date().getTime()}`;

        // Calculate row and column based on currentImageIndex
        const columnCount = 4; // Adjust based on your column count in grid-container
        const row = Math.floor(currentImageIndex / columnCount);
        const column = currentImageIndex % columnCount;

        lightboxImg.style.objectPosition = `-${column * 100}% -${row * 100}%`;
    }

    // Close lightbox
    closeBtn.addEventListener("click", function() {
        lightbox.style.display = "none";
    });

    // Navigate to the previous image
    prevBtn.addEventListener("click", function() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            openLightbox();
        }
    });

    // Navigate to the next image
    nextBtn.addEventListener("click", function() {
        if (currentImageIndex < images.length - 1) {
            currentImageIndex++;
            openLightbox();
        }
    });

    // Close lightbox when clicking outside the image
    lightbox.addEventListener("click", function(event) {
        if (event.target === lightbox) {
            lightbox.style.display = "none";
        }
    });
});
