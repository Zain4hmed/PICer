document.addEventListener("DOMContentLoaded", function() {
    const selectedImages = [];
    const gridContainer = document.getElementById("grid-container");
    const deleteButton = document.getElementById("deleteImages");

    // Function to fetch and render images
    function fetchAndRenderImages() {
        fetch('/api/files/imageslist')
            .then(response => response.json())
            .then(data => {
                gridContainer.innerHTML = ''; // Clear existing images

                data.forEach(imageName => {
                    const div = document.createElement("div");
                    div.classList.add("grid-item");

                    const img = document.createElement("img");
                    const timestamp = new Date().getTime();
                    img.src = `/upload/${imageName}?t=${timestamp}`;
                    img.alt = imageName;
                    img.dataset.name = imageName;

                    img.addEventListener("click", function() {
                        this.classList.toggle("selected");
                        const index = selectedImages.indexOf(imageName);
                        if (img.classList.contains("selected")) {
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

                    div.appendChild(img);
                    gridContainer.appendChild(div);
                });
            })
            .catch(error => console.error('Error fetching image names:', error));
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
});
