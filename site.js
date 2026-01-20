async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerText = "Synchronizacja z Bazarem...";
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
                    // DOKŁADNE POBIERANIE:
                    // buyPrice = najwyższy Buy Order (za tyle Ty kupujesz od innych)
                    const fineBuyOrderPrice = products[fineKey].quick_status.buyPrice;
                    
                    // sellPrice = najniższa Sell Offer (za tyle Ty wystawiasz na sprzedaż)
                    const flawlessSellOfferPrice = products[flawlessKey].quick_status.sellPrice;
                    
                    const cost80xFine = fineBuyOrderPrice * 80;
                    const profit = flawlessSellOfferPrice - cost80xFine;

                    const row = `<tr>
                        <td class="gem-${type.toLowerCase()}"><strong>${type}</strong></td>
                        <td style="color: #55cdff;">${Math.round(fineBuyOrderPrice).toLocaleString()}</td>
                        <td style="color: #aa00aa;">${Math.round(flawlessSellOfferPrice).toLocaleString()}</td>
                        <td style="color: #ffac1c;">${Math.round(cost80xFine).toLocaleString()}</td>
                        <td style="color: ${profit > 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${profit > 0 ? "ZYSK: " : "STRATA: "}${Math.abs(Math.round(profit)).toLocaleString()}
                        </td>
                    </tr>`;
                    tbody.innerHTML += row;
                }
            });

            if (status) status.innerText = `Dane zaktualizowane: ${new Date().toLocaleTimeString()}`;
        }
    } catch (error) {
        console.error(error);
        if (status) status.innerHTML = `<span style="color: red;">Błąd pobierania danych.</span>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchBazaarData);
