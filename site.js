async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerHTML = "Analiza arkuszy zleceń (Order Books)...";
    
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
                    const fine = products[fineKey];
                    const flawless = products[flawlessKey];

                    // 1. Cena FINE z sell_summary (najniższy sell offer / Instant Buy)
                    // Sortujemy dla pewności, by pobrać najniższą cenę jednostkową
                    let finePrice = 0;
                    if (fine.sell_summary && fine.sell_summary.length > 0) {
                        const sortedSells = [...fine.sell_summary].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
                        finePrice = sortedSells[0].pricePerUnit;
                    } else {
                        finePrice = fine.quick_status.sellPrice; // Fallback
                    }
                    
                    // 2. Cena FLAWLESS z buy_summary (najwyższy buy order / Instant Sell)
                    // Sortujemy, by pobrać najwyższą cenę jednostkową
                    let flawlessPrice = 0;
                    if (flawless.buy_summary && flawless.buy_summary.length > 0) {
                        const sortedBuys = [...flawless.buy_summary].sort((a, b) => b.pricePerUnit - a.pricePerUnit);
                        flawlessPrice = sortedBuys[0].pricePerUnit;
                    } else {
                        flawlessPrice = flawless.quick_status.buyPrice; // Fallback
                    }
                    
                    // 3. Obliczenia z podatkiem 1%
                    const cost80Fine = finePrice * 80;
                    const tax = 0.01;
                    const revenueAfterTax = flawlessPrice * (1 - tax);
                    const netProfit = revenueAfterTax - cost80Fine;

                    const format = num => Math.round(num).toLocaleString('pl-PL');

                    const row = `<tr>
                        <td class="gem-${type.toLowerCase()}"><strong>${type}</strong></td>
                        <td style="color: #55cdff;">${format(finePrice)}</td>
                        <td style="color: #aa00aa;">${format(flawlessPrice)}</td>
                        <td style="color: #ffac1c;">${format(cost80Fine)}</td>
                        <td style="color: ${netProfit >= 0 ? '#00ff00' : '#ff4444'}; font-weight: bold;">
                            ${netProfit >= 0 ? '+' : ''}${format(netProfit)}
                        </td>
                    </tr>`;
                    
                    tbody.innerHTML += row;
                }
            });

            const time = new Date().toLocaleTimeString('pl-PL');
            status.innerHTML = `Zaktualizowano: ${time}<br>
                               <small>Fine: sell_summary | Flawless: buy_summary | Podatek: 1%</small>`;
        }
    } catch (error) {
        if (status) status.innerHTML = `<span style="color: red;">Błąd: ${error.message}</span>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchBazaarData);
