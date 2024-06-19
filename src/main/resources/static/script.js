document.addEventListener("DOMContentLoaded", function() {
    fetch('/api/files/imageslist')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const gridContainer = document.getElementById("grid-container");

            data.forEach(imageName => {
                const div = document.createElement("div");
                div.classList.add("grid-item");

                const img = document.createElement("img");

                // Append a timestamp as a query parameter to the image URL
                const timestamp = new Date().getTime();
                img.src = `/upload/${imageName}`;
                img.alt = imageName;

                // Add event listener to toggle selection on click
                img.addEventListener("click", function() {
                    this.classList.toggle("selected");
                });

                div.appendChild(img);
                gridContainer.appendChild(div);
            });
        })
        .catch(error => console.error('Error fetching image names:', error));
});
