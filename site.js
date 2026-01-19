async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    if (status) status.innerText = "Pobieranie danych...";

    const apiUrl = "https://api.hypixel.net/v2/skyblock/bazaar";
    // Zmiana na AllOrigins (często stabilniejsze dla GitHub Pages)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const rawData = await response.json();
        const data = JSON.parse(rawData.contents); // AllOrigins wymaga parsowania contents

        if (data.success && tbody) {
            tbody.innerHTML = "";
            const products = data.products;
            
            // Kompletna lista gemów
            const gemTypes = [
                "RUBY", "AMETHYST", "JADE", "AMBER", "TOPAZ", "SAPPHIRE", "JASPER", "OPAL",
                "AQUAMARINE", "ONYX", "CITRINE", "PERIDOT"
            ];
            
            gemTypes.forEach(type => {
                const fineKey = `FINE_${type}_GEM`;
                const flawlessKey = `FLAWLESS_${type}_GEM`;

                if (products[fineKey] && products[flawlessKey]) {
                    const finePrice = products[fineKey].quick_status.buyPrice;
                    const flawlessPrice = products[flawlessKey].quick_status.buyPrice;
                    const fineX80 = finePrice * 80;
                    const diff = flawlessPrice - fineX80;
                    
                    const row = `<tr>
                        <td class="gem-${type.toLowerCase()}"><strong>${type}</strong></td>
                        <td>${Math.round(finePrice).toLocaleString()}</td>
                        <td>${Math.round(flawlessPrice).toLocaleString()}</td>
                        <td>${Math.round(fineX80).toLocaleString()}</td>
                        <td style="color: ${diff > 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${Math.abs(Math.round(diff)).toLocaleString()}
                        </td>
                    </tr>`;
                    tbody.innerHTML += row;
                }
            });
            if (status) status.innerText = "Zaktualizowano: " + new Date().toLocaleTimeString();
        }
    } catch (error) {
        if (status) status.innerText = "Błąd API. Odśwież stronę.";
        console.error(error);
    }
}
document.addEventListener('DOMContentLoaded', fetchBazaarData);
