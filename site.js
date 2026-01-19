async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    if (status) status.innerText = "Błyskawiczne pobieranie danych...";

    const apiUrl = "https://api.hypixel.net/v2/skyblock/bazaar";
    // Używamy szybszego proxy
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.success && tbody) {
            tbody.innerHTML = "";
            const products = data.products;

            // Lista wszystkich gemstone'ów, w tym te nowe z Glacite Tunnels
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
                    const diffColor = diff > 0 ? "#00ff00" : "#ff4444";

                    const row = `<tr>
                        <td><strong>${type}</strong></td>
                        <td style="color: #55cdff;">${Math.round(finePrice).toLocaleString()}</td>
                        <td style="color: #aa00aa;">${Math.round(flawlessPrice).toLocaleString()}</td>
                        <td style="color: #ffac1c;">${Math.round(fineX80).toLocaleString()}</td>
                        <td style="color: ${diffColor}; font-weight: bold;">
                            ${diff > 0 ? "Zysk: " : "Strata: "}${Math.abs(Math.round(diff)).toLocaleString()}
                        </td>
                    </tr>`;
                    tbody.innerHTML += row;
                }
            });
            if (status) status.innerText = "Zaktualizowano: " + new Date().toLocaleTimeString();
        }
    } catch (error) {
        if (status) status.innerText = "Błąd połączenia. Spróbuj ponownie za chwilę.";
        console.error("Błąd API:", error);
    }
}

// Automatyczne odświeżanie co 30 sekund dla szybkości
setInterval(fetchBazaarData, 30000);
document.addEventListener('DOMContentLoaded', fetchBazaarData);