async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerText = "Pobieranie cen (Buy Orders i Sell Offers)...";
    if (tbody) tbody.innerHTML = ""; 

    const apiUrl = "https://api.hypixel.net/v2/skyblock/bazaar";
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Błąd sieci: ${response.status}`);

        const data = await response.json();

        if (data.success && tbody) {
            const products = data.products;
            const gemTypes = [
                "RUBY", "AMETHYST", "JADE", "AMBER", "TOPAZ", "SAPPHIRE", "JASPER", "OPAL",
                "AQUAMARINE", "ONYX", "CITRINE", "PERIDOT"
            ];
            
            gemTypes.forEach(type => {
                const fineKey = `FINE_${type}_GEM`;
                const flawlessKey = `FLAWLESS_${type}_GEM`;

                if (products[fineKey] && products[flawlessKey]) {
                    // ZMIANA: Cena Fine z Buy Order (buyPrice)
                    const finePrice = products[fineKey].quick_status.buyPrice;
                    // ZMIANA: Cena Flawless z Sell Offer (sellPrice)
                    const flawlessPrice = products[flawlessKey].quick_status.sellPrice;
                    
                    const fineX80 = finePrice * 80;
                    const diff = flawlessPrice - fineX80;

                    const row = `<tr>
                        <td class="gem-${type.toLowerCase()}"><strong>${type}</strong></td>
                        <td style="color: #55cdff;">${Math.round(finePrice).toLocaleString()}</td>
                        <td style="color: #aa00aa;">${Math.round(flawlessPrice).toLocaleString()}</td>
                        <td style="color: #ffac1c;">${Math.round(fineX80).toLocaleString()}</td>
                        <td style="color: ${diff > 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${diff > 0 ? "ZYSK: " : "STRATA: "}${Math.abs(Math.round(diff)).toLocaleString()}
                        </td>
                    </tr>`;
                    tbody.innerHTML += row;
                }
            });

            if (status) status.innerText = `Sukces! Dane zoptymalizowane pod ordery: ${new Date().toLocaleTimeString()}`;
        }
    } catch (error) {
        console.error(error);
        if (status) status.innerHTML = `<span style="color: red;">BŁĄD: ${error.message}</span>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchBazaarData);
