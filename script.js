
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("search-form");
    const input = document.getElementById("search-input");
    const results = document.getElementById("results");
    const emptyState = document.getElementById("empty-state");
    const resultCount = document.getElementById("result-count");

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        console.log("Search detected!");

        const query = input.value.trim();

        if (!query) return;

        results.innerHTML = "";
        emptyState.style.display = "none";
        resultCount.textContent = "Searching...";

        const url = 
            `https://commons.wikimedia.org/w/api.php?` +
            `action=query&generator=search` +
            `&gsrsearch=${encodeURIComponent(query)}` +
            `&gsrnamespace=6&gsrlimit=20` +
            `&prop=imageinfo&iiprop=url` +
            `&iiurlwidth=600&format=json&origin=*`;

        try {

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("API request failed: " + response.status);
            }

            const data = await response.json();

            const images = Object.values(
                data.query?.pages || {}
            ).filter(page =>
                page.imageinfo && page.imageinfo.length > 0
            );

            console.log("Images found:", images.length);

            resultCount.textContent =
                `Showing ${images.length} results for "${query}"`;

            if (images.length === 0) {
                emptyState.style.display = "flex";
                emptyState.querySelector("h3").textContent =
                    "No images found.";
                emptyState.querySelector("p").textContent =
                    "Try another search.";
                return;
            }

            images.forEach(page => {

                const info = page.imageinfo[0];

                const card = document.createElement("a");
                card.className = "image-card";
                card.href = info.descriptionurl || info.url;
                card.target = "_blank";
                card.rel = "noopener noreferrer";

                const img = document.createElement("img");
                img.src = info.thumburl || info.url;
                img.alt = page.title.replace("File:", "");
                img.loading = "eager";

                img.onerror = () => {
                    console.error("Image failed to load:", img.src);
                };

                const caption = document.createElement("p");
                caption.className = "image-caption";
                caption.textContent = page.title.replace("File:", "");

                card.appendChild(img);
                card.appendChild(caption);

                results.appendChild(card);

            });

        } catch (error) {

            console.error("Search error:", error);

            resultCount.textContent = "Search failed.";

            emptyState.style.display = "flex";
            emptyState.querySelector("h3").textContent =
                "Something went wrong.";
            emptyState.querySelector("p").textContent =
                "Please try again.";

        }

    });

});
