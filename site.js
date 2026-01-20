async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerText = "Pobieranie danych (Proxy: AllOrigins)...";
    if (tbody) tbody.innerHTML = ""; 

    const apiUrl = "https://api.hypixel.net/v2/skyblock/bazaar";
    // Używamy AllOrigins, aby ominąć limit 1MB w corsproxy.io
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Błąd sieci: ${response.status}`);

        const rawData = await response.json();
        const data = JSON.parse(rawData.contents); // AllOrigins pakuje dane do pola 'contents'

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
                    // DOKŁADNE CENY ZGODNIE Z TWOJĄ PROŚBĄ:
                    // Cena Fine z Buy Order (za tyle Ty chcesz kupić od innych)
                    const finePrice = products[fineKey].quick_status.buyPrice;
                    
                    // Cena Flawless z Sell Offer (za tyle Ty wystawiasz na sprzedaż)
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

            if (status) status.innerHTML = `Sukces! Zaktualizowano: ${new Date().toLocaleTimeString()}<br><small>Fine: Buy Order | Flawless: Sell Offer</small>`;
        }
    } catch (error) {
        console.error("Błąd:", error);
        if (status) status.innerHTML = `<span style="color: red;">BŁĄD: ${error.message}. Spróbuj F5.</span>`;
    }
}

// Start po załadowaniu strony
document.addEventListener('DOMContentLoaded', fetchBazaarData);
// Odświeżanie co 60 sekund
setInterval(fetchBazaarData, 60000);
