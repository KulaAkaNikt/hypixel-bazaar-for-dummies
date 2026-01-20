async function fetchBazaarData() {
    const status = document.getElementById('status');
    const tbody = document.getElementById('gemBody');
    
    if (status) status.innerText = "Ładowanie cen z Bazaar...";
    if (tbody) tbody.innerHTML = "";

    try {
        const apiUrl = "https://api.hypixel.net/v2/skyblock/bazaar";
        
        console.log("🔄 Pobieranie danych z API...");
        console.log("URL:", apiUrl);
        
        // Użyj CORS proxy
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
        console.log("Proxy URL:", proxyUrl);
        
        const response = await fetch(proxyUrl);
        console.log("Status odpowiedzi:", response.status, response.ok);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        console.log("✅ Dane API pobrane pomyślnie");
        console.log("Czy success:", data.success);
        console.log("Ilość produktów:", Object.keys(data.products || {}).length);
        
        if (!data.success || !data.products) {
            throw new Error("Nieprawidłowa odpowiedź API");
        }

        const products = data.products;
        const gemTypes = [
            "RUBY", "AMETHYST", "JADE", "AMBER", "TOPAZ", "SAPPHIRE", 
            "JASPER", "OPAL", "AQUAMARINE", "ONYX", "CITRINE", "PERIDOT"
        ];

        console.log("\n📊 ANALIZA CEN GEMÓW:");
        console.log("=".repeat(80));

        gemTypes.forEach(type => {
            const fineKey = `FINE_${type}_GEM`;
            const flawlessKey = `FLAWLESS_${type}_GEM`;

            if (products[fineKey] && products[flawlessKey]) {
                const fine = products[fineKey];
                const flawless = products[flawlessKey];
                
                // DEBUG: Wyświetl pełną strukturę dla pierwszego gemu
                if (type === "RUBY") {
                    console.log("\n🔍 DEBUG - RUBY GEM FULL DATA:");
                    console.log("FINE_RUBY_GEM:", JSON.stringify(fine, null, 2));
                    console.log("\nFLAWLESS_RUBY_GEM:", JSON.stringify(flawless, null, 2));
                }
                
                // 1. CENA KUPNA FINE GEM - najniższa cena sprzedaży (sell offer)
                let fineBuyPrice;
                console.log(`\n💎 ${type}:`);
                console.log(`  Fine - sell_summary dostępny:`, fine.sell_summary?.length > 0);
                console.log(`  Fine - buy_summary dostępny:`, fine.buy_summary?.length > 0);
                
                if (fine.sell_summary && fine.sell_summary.length > 0) {
                    console.log(`  Fine - sell_summary[0]:`, fine.sell_summary[0]);
                    fine.sell_summary.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
                    fineBuyPrice = fine.sell_summary[0].pricePerUnit;
                    console.log(`  Fine - cena kupna (z sell_summary):`, fineBuyPrice);
                } else {
                    fineBuyPrice = fine.quick_status?.sellPrice || 0;
                    console.log(`  Fine - cena kupna (z quick_status.sellPrice):`, fineBuyPrice);
                }
                
                // 2. CENA SPRZEDAŻY FLAWLESS GEM - najwyższa cena kupna (buy order)
                let flawlessSellPrice;
                console.log(`  Flawless - sell_summary dostępny:`, flawless.sell_summary?.length > 0);
                console.log(`  Flawless - buy_summary dostępny:`, flawless.buy_summary?.length > 0);
                
                if (flawless.buy_summary && flawless.buy_summary.length > 0) {
                    console.log(`  Flawless - buy_summary[0]:`, flawless.buy_summary[0]);
                    flawless.buy_summary.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
                    flawlessSellPrice = flawless.buy_summary[0].pricePerUnit;
                    console.log(`  Flawless - cena sprzedaży (z buy_summary):`, flawlessSellPrice);
                } else {
                    flawlessSellPrice = flawless.quick_status?.buyPrice || 0;
                    console.log(`  Flawless - cena sprzedaży (z quick_status.buyPrice):`, flawlessSellPrice);
                }
                
                // Pokazuj quick_status dla porównania
                console.log(`  Fine quick_status:`);
                console.log(`    - sellPrice:`, fine.quick_status?.sellPrice);
                console.log(`    - buyPrice:`, fine.quick_status?.buyPrice);
                console.log(`  Flawless quick_status:`);
                console.log(`    - sellPrice:`, flawless.quick_status?.sellPrice);
                console.log(`    - buyPrice:`, flawless.quick_status?.buyPrice);
                
                // Zaokrąglij do pełnych liczb
                fineBuyPrice = Math.round(fineBuyPrice);
                flawlessSellPrice = Math.round(flawlessSellPrice);
                
                // Koszt 80 Fine Gems
                const cost80Fine = fineBuyPrice * 80;
                const profit = flawlessSellPrice - cost80Fine;
                
                console.log(`  📈 PODSUMOWANIE ${type}:`);
                console.log(`    Fine cena kupna: ${fineBuyPrice.toLocaleString()}`);
                console.log(`    Flawless cena sprzedaży: ${flawlessSellPrice.toLocaleString()}`);
                console.log(`    Koszt 80 Fine: ${cost80Fine.toLocaleString()}`);
                console.log(`    Zysk/Strata: ${profit.toLocaleString()} (${profit > 0 ? 'ZYSK' : 'STRATA'})`);
                console.log(`    Stosunek: ${flawlessSellPrice} / ${cost80Fine} = ${(flawlessSellPrice/cost80Fine*100).toFixed(1)}%`);
                console.log("-".repeat(60));
                
                // Formatowanie dla tabeli
                const format = num => num.toLocaleString('pl-PL');
                
                const row = `<tr>
                    <td class="gem-${type.toLowerCase()}">${type}</td>
                    <td>${format(fineBuyPrice)}</td>
                    <td>${format(flawlessSellPrice)}</td>
                    <td>${format(cost80Fine)}</td>
                    <td class="${profit > 0 ? 'profit' : profit < 0 ? 'loss' : 'neutral'}">
                        ${profit > 0 ? 'ZYSK: +' : profit < 0 ? 'STRATA: ' : ''}${format(Math.abs(profit))}
                    </td>
                </tr>`;
                
                tbody.innerHTML += row;
            } else {
                console.warn(`⚠️ Brak danych dla: ${type}`);
                console.log(`   Fine (${fineKey}):`, products[fineKey] ? "ISTNIEJE" : "BRAK");
                console.log(`   Flawless (${flawlessKey}):`, products[flawlessKey] ? "ISTNIEJE" : "BRAK");
            }
        });

        console.log("\n✅ Tabela zaktualizowana");
        console.log("Ilość wierszy w tabeli:", tbody.querySelectorAll('tr').length);
        
        if (status) {
            const time = new Date().toLocaleTimeString('pl-PL');
            status.innerHTML = `Zaktualizowano: ${time}<br>
                               <small>Fine: cena KUPNA (sell offer) | Flawless: cena SPRZEDAŻY (buy order)</small>`;
        }

    } catch (error) {
        console.error("❌ Błąd pobierania danych:", error);
        console.error("Stack trace:", error.stack);
        
        if (status) {
            status.innerHTML = `<span style="color: red">Błąd: ${error.message}</span><br>
                               <button onclick="fetchBazaarData()" style="margin-top: 10px; padding: 5px 15px;">
                               Spróbuj ponownie</button>`;
        }
    }
}

// Funkcja do testowania bezpośredniego API
async function testDirectAPI() {
    console.log("\n🔧 TEST BEZPOŚREDNIEGO API:");
    console.log("=".repeat(80));
    
    try {
        // Test bez proxy
        const apiUrl = "https://api.hypixel.net/v2/skyblock/bazaar";
        console.log("Test URL:", apiUrl);
        
        const response = await fetch(apiUrl);
        console.log("Status bez proxy:", response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log("Bezpośrednie API działa!");
            
            // Sprawdź konkretne gemstone
            const fineRuby = data.products.FINE_RUBY_GEM;
            const flawlessRuby = data.products.FLAWLESS_RUBY_GEM;
            
            console.log("\n💰 PRZYKŁADOWE CENY RUBY:");
            console.log("FINE_RUBY_GEM quick_status:", fineRuby.quick_status);
            console.log("FLAWLESS_RUBY_GEM quick_status:", flawlessRuby.quick_status);
            
            console.log("\n📋 Porównanie cen:");
            console.log(`Fine sellPrice (kupno): ${fineRuby.quick_status.sellPrice}`);
            console.log(`Fine buyPrice (sprzedaż): ${fineRuby.quick_status.buyPrice}`);
            console.log(`Flawless sellPrice (kupno): ${flawlessRuby.quick_status.sellPrice}`);
            console.log(`Flawless buyPrice (sprzedaż): ${flawlessRuby.quick_status.buyPrice}`);
            
            // Oblicz potencjalny zysk
            const fineCost = fineRuby.quick_status.sellPrice * 80;
            const flawlessRevenue = flawlessRuby.quick_status.buyPrice;
            const profit = flawlessRevenue - fineCost;
            
            console.log(`\n💰 POTENCJALNY ZYSK:`);
            console.log(`Koszt 80 Fine: ${fineCost.toLocaleString()}`);
            console.log(`Przychód Flawless: ${flawlessRevenue.toLocaleString()}`);
            console.log(`Zysk/Strata: ${profit.toLocaleString()}`);
        } else {
            console.log("Bezpośrednie API nie działa, CORS blokuje");
        }
    } catch (error) {
        console.log("Błąd bezpośredniego API (oczekiwany CORS):", error.message);
    }
}

// Dodaj przycisk do testowania
document.addEventListener('DOMContentLoaded', () => {
    fetchBazaarData();
    
    // Dodaj przycisk testowy
    const testBtn = document.createElement('button');
    testBtn.textContent = '🔧 Test API';
    testBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 15px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
    `;
    testBtn.onclick = testDirectAPI;
    document.body.appendChild(testBtn);
});

// Automatyczne odświeżanie co 30 sekund
setInterval(fetchBazaarData, 30000);

