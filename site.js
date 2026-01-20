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
                "RUBY", "AMETHYST", "JADE", "AMBER", "TOPAZ", "SAPPHIRE", 
                "JASPER", "OPAL", "AQUAMARINE", "ONYX", "CITRINE", "PERIDOT"
            ];
            
            gemTypes.forEach(type => {
                const fineKey = `FINE_${type}_GEM`;
                const flawlessKey = `FLAWLESS_${type}_GEM`;

                if (products[fineKey] && products[flawlessKey]) {
                    // PRAWIDŁOWE pobranie ceny kupna (najwyższy buy order)
                    const fineBuyOrders = products[fineKey].buy_summary || [];
                    const flawlessSellOffers = products[flawlessKey].sell_summary || [];
                    
                    // Sortowanie: dla buy orders - malejąco (najwyższa cena pierwsza)
                    fineBuyOrders.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
                    
                    // Sortowanie: dla sell offers - rosnąco (najniższa cena pierwsza)
                    flawlessSellOffers.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
                    
                    // Cena Fine Gem z najwyższego buy order
                    const finePrice = fineBuyOrders.length > 0 
                        ? Math.round(fineBuyOrders[0].pricePerUnit) 
                        : 0;
                    
                    // Cena Flawless Gem z najniższego sell offer
                    const flawlessPrice = flawlessSellOffers.length > 0 
                        ? Math.round(flawlessSellOffers[0].pricePerUnit) 
                        : 0;
                    
                    // Koszt 80 Fine Gems (do craftu Flawless)
                    const fineX80 = finePrice * 80;
                    const diff = flawlessPrice - fineX80;
                    const profitMargin = flawlessPrice > 0 ? (diff / flawlessPrice * 100).toFixed(2) : 0;

                    // Formatowanie liczb
                    const formatNumber = (num) => Math.round(num).toLocaleString('pl-PL');
                    
                    // Styl zależny od zysku/straty
                    const profitClass = diff > 0 ? 'profit' : 'loss';
                    const profitText = diff > 0 ? `ZYSK: +${formatNumber(diff)}` : `STRATA: ${formatNumber(diff)}`;
                    
                    const row = `<tr>
                        <td class="gem-${type.toLowerCase()}"><strong>${type}</strong></td>
                        <td style="color: #55cdff;">${formatNumber(finePrice)}</td>
                        <td style="color: #aa00aa;">${formatNumber(flawlessPrice)}</td>
                        <td style="color: #ffac1c;">${formatNumber(fineX80)}</td>
                        <td class="${profitClass}" style="font-weight: bold;">
                            ${profitText}
                        </td>
                        <td style="color: ${diff > 0 ? '#00cc00' : '#ff4444'}; font-size: 0.9em;">
                            (${profitMargin}%)
                        </td>
                    </tr>`;
                    tbody.innerHTML += row;
                }
            });

            // Dodaj styl CSS dla kolorów
            const style = document.createElement('style');
            style.textContent = `
                .profit { color: #00ff00; }
                .loss { color: #ff4444; }
                .gem-ruby { color: #ff4444; }
                .gem-amethyst { color: #aa00aa; }
                .gem-jade { color: #00aa00; }
                .gem-amber { color: #ffaa00; }
                .gem-topaz { color: #ffcc00; }
                .gem-sapphire { color: #0044ff; }
                .gem-jasper { color: #ff6600; }
                .gem-opal { color: #ccccff; }
                .gem-aquamarine { color: #00aaaa; }
                .gem-onyx { color: #333333; }
                .gem-citrine { color: #ffcc66; }
                .gem-peridot { color: #66ff66; }
            `;
            document.head.appendChild(style);

            if (status) status.innerText = `Dane z Bazaar załadowane: ${new Date().toLocaleTimeString()}`;
        }
    } catch (error) {
        console.error(error);
        if (status) {
            status.innerHTML = `<span style="color: red;">BŁĄD: ${error.message}</span><br>
                               <button onclick="fetchBazaarData()" style="margin-top: 10px; padding: 5px 15px;">
                               Spróbuj ponownie</button>`;
        }
    }
}

// Automatyczne odświeżanie co 60 sekund
document.addEventListener('DOMContentLoaded', () => {
    fetchBazaarData();
    setInterval(fetchBazaarData, 60000);
});
