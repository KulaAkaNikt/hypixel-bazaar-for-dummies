async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerHTML = "Aktualizacja danych (Podatek: 1.1%)...";
    
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

                    // 1. Pobieranie ceny FINE z sell_summary[0] (zgodnie z obrazkiem 6c4262)
                    let finePrice = 0;
                    if (fineProduct.sell_summary && fineProduct.sell_summary.length > 0) {
                        finePrice = fineProduct.sell_summary[0].pricePerUnit;
                    } else {
                        finePrice = fineProduct.quick_status.sellPrice;
                    }

                    // 2. Pobieranie ceny FLAWLESS z buy_summary[0]
                    let flawlessPrice = 0;
                    if (flawlessProduct.buy_summary && flawlessProduct.buy_summary.length > 0) {
                        flawlessPrice = flawlessProduct.buy_summary[0].pricePerUnit;
                    } else {
                        flawlessPrice = flawlessProduct.quick_status.buyPrice;
                    }
                    
                    // 3. OBLICZENIA Z UWZGLĘDNIENIEM PODATKU 1.1%
                    const cost80xFine = finePrice * 80;
                    const taxRate = 0.011; // Zmieniono na 1.1%
                    const revenueAfterTax = flawlessPrice * (1 - taxRate);
                    const netProfit = revenueAfterTax - cost80xFine;

                    const format = num => {
                        return num.toLocaleString('pl-PL', {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1
                        });
                    };

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
            status.innerHTML = `Ostatnia aktualizacja: ${time}<br>
                               <small>Metoda: Arkusz Zleceń | Podatek: 1.1%</small>`;
        }
    } catch (error) {
        if (status) status.innerHTML = `<span style="color: red;">Błąd: ${error.message}</span>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchBazaarData);

