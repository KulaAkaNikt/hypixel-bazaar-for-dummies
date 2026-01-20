async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerHTML = "Pobieranie realnych cen rynkowych...";
    
    const apiUrl = "https://api.hypixel.net/v2/skyblock/bazaar";
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Błąd: ${response.status}`);

        const data = await response.json();

        if (data.success && tbody) {
            tbody.innerHTML = ""; 
            const products = data.products;
            
            const gemTypes = [
                "RUBY", "AMETHYST", "JADE", "AMBER", "TOPAZ", "SAPPHIRE", "JASPER", "OPAL",
                "AQUAMARINE", "ONYX", "CITRINE", "PERIDOT"
            ];
            
            gemTypes.forEach(type => {
                const fineKey = `FINE_${type}_GEM`;
                const flawlessKey = `FLAWLESS_${type}_GEM`;

                if (products[fineKey] && products[flawlessKey]) {
                    // TWOJA PROŚBA:
                    // Fine z Buy Order -> API field: buyPrice
                    const fineBuyOrder = products[fineKey].quick_status.buyPrice;
                    
                    // Flawless z Sell Offer -> API field: sellPrice
                    const flawlessSellOffer = products[flawlessKey].quick_status.sellPrice;
                    
                    const cost80xFine = fineBuyOrder * 80;
                    const profit = flawlessSellOffer - cost80xFine;

                    const row = `<tr>
                        <td class="gem-${type.toLowerCase()}"><strong>${type}</strong></td>
                        <td style="color: #55cdff;">${Math.round(fineBuyOrder).toLocaleString()}</td>
                        <td style="color: #aa00aa;">${Math.round(flawlessSellOffer).toLocaleString()}</td>
                        <td style="color: #ffac1c;">${Math.round(cost80xFine).toLocaleString()}</td>
                        <td style="color: ${profit > 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${profit > 0 ? "ZYSK: +" : "STRATA: "}${Math.abs(Math.round(profit)).toLocaleString()}
                        </td>
                    </tr>`;
                    tbody.innerHTML += row;
                }
            });

            status.innerHTML = `Zaktualizowano: ${new Date().toLocaleTimeString()}<br><small>Metoda: Fine (Buy Order) | Flawless (Sell Offer)</small>`;
        }
    } catch (error) {
        if (status) status.innerHTML = `<span style="color: red;">Błąd: ${error.message}</span>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchBazaarData);
