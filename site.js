async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerHTML = "Aktualizacja cen...";
    
    // API URL
    const apiUrl = "https://api.hypixel.net/v2/skyblock/bazaar";
    
    // Używamy CodeTabs - stabilna bramka bez limitu 1MB
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`Błąd bramki: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && tbody) {
            tbody.innerHTML = ""; // Czyścimy tabelę dopiero po odebraniu danych
            const products = data.products;
            
            const gemTypes = [
                "RUBY", "AMETHYST", "JADE", "AMBER", "TOPAZ", "SAPPHIRE", "JASPER", "OPAL",
                "AQUAMARINE", "ONYX", "CITRINE", "PERIDOT"
            ];
            
            gemTypes.forEach(type => {
                const fineKey = `FINE_${type}_GEM`;
                const flawlessKey = `FLAWLESS_${type}_GEM`;

                if (products[fineKey] && products[flawlessKey]) {
                    // Fine: Buy Order Price (buyPrice w API)
                    const finePrice = products[fineKey].quick_status.buyPrice;
                    
                    // Flawless: Sell Offer Price (sellPrice w API)
                    const flawlessPrice = products[flawlessKey].quick_status.sellPrice;
                    
                    const cost80xFine = finePrice * 80;
                    const profit = flawlessPrice - cost80xFine;

                    const row = `<tr>
                        <td class="gem-${type.toLowerCase()}"><strong>${type}</strong></td>
                        <td style="color: #55cdff;">${Math.round(finePrice).toLocaleString()}</td>
                        <td style="color: #aa00aa;">${Math.round(flawlessPrice).toLocaleString()}</td>
                        <td style="color: #ffac1c;">${Math.round(cost80xFine).toLocaleString()}</td>
                        <td style="color: ${profit > 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${profit > 0 ? "ZYSK: +" : "STRATA: "}${Math.abs(Math.round(profit)).toLocaleString()}
                        </td>
                    </tr>`;
                    tbody.innerHTML += row;
                }
            });

            if (status) status.innerHTML = `Ostatnia aktualizacja: ${new Date().toLocaleTimeString()}`;
        }
    } catch (error) {
        console.error("Szczegóły błędu:", error);
        if (status) {
            status.innerHTML = `<span style="color: #ff4444;">Błąd: ${error.message}. Spróbuj F5 za chwilę.</span>`;
        }
    }
}

// Start po załadowaniu
document.addEventListener('DOMContentLoaded', fetchBazaarData);
