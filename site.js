async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerHTML = "Pobieranie danych z arkuszy (sell_summary)...";
    
    const apiUrl = "https://api.hypixel.net/v2/skyblock/bazaar";
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Błąd API: ${response.status}`);

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
                    const fineProduct = products[fineKey];
                    const flawlessProduct = products[flawlessKey];

                    // --- LOGIKA Z TWOJEJ LINII API (image_6c4262.png) ---
                    // Pobieramy cenę Fine z sell_summary (pierwszy element tablicy)
                    let finePrice = 0;
                    if (fineProduct.sell_summary && fineProduct.sell_summary.length > 0) {
                        // Bierzemy dokładnie pricePerUnit z pierwszej oferty sprzedaży
                        finePrice = fineProduct.sell_summary[0].pricePerUnit;
                    } else {
                        // Jeśli arkusz jest pusty, używamy awaryjnie quick_status
                        finePrice = fineProduct.quick_status.sellPrice;
                    }

                    // --- LOGIKA DLA FLAWLESS (buy_summary - najwyższy buy order) ---
                    let flawlessPrice = 0;
                    if (flawlessProduct.buy_summary && flawlessProduct.buy_summary.length > 0) {
                        flawlessPrice = flawlessProduct.buy_summary[0].pricePerUnit;
                    } else {
                        flawlessPrice = flawlessProduct.quick_status.buyPrice;
                    }
                    
                    // OBLICZENIA Z PODATKIEM 1%
                    const cost80xFine = finePrice * 80;
                    const tax = 0.01;
                    const revenueAfterTax = flawlessPrice * (1 - tax);
                    const netProfit = revenueAfterTax - cost80xFine;

                    const format = num => Math.round(num).toLocaleString('pl-PL');

                    const row = `<tr>
                        <td class="gem-${type.toLowerCase()}"><strong>${type}</strong></td>
                        <td style="color: #55cdff;">${format(finePrice)}</td>
                        <td style="color: #aa00aa;">${format(flawlessPrice)}</td>
                        <td style="color: #ffac1c;">${format(cost80xFine)}</td>
                        <td style="color: ${netProfit >= 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${netProfit >= 0 ? "+" : ""}${format(netProfit)}
                        </td>
                    </tr>`;
                    
                    tbody.innerHTML += row;
                }
            });

            const time = new Date().toLocaleTimeString('pl-PL');
            status.innerHTML = `Zaktualizowano: ${time}<br>
                               <small>Metoda: Fine (sell_summary[0]) | Flawless (buy_summary[0])</small>`;
        }
    } catch (error) {
        if (status) status.innerHTML = `<span style="color: red;">Błąd: ${error.message}</span>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchBazaarData);
