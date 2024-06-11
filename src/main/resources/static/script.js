document.addEventListener("DOMContentLoaded", function() {
    const gridContainer = document.getElementById("grid-container");

    // Replace with the actual number of images you have
    const totalImages = 18;

    for (let i = 1; i <= totalImages; i++) {
        const div = document.createElement("div");
        div.classList.add("grid-item");

        const img = document.createElement("img");

        // Append a timestamp as a query parameter to the image URL
        const timestamp = new Date().getTime();
        img.src = `upload/image${i}.jpg?_=${timestamp}`;

        img.alt = `Image ${i}`;

        // Add event listener to toggle selection on click
        img.addEventListener("click", function() {
            this.classList.toggle("selected");
        });

        div.appendChild(img);
        gridContainer.appendChild(div);
    }
});
