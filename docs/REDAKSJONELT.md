# Redaksjonelt

*(Editorial commentary, kept separate from the methodology page so the dataset itself remains neutral. Rendered at `/redaksjonelt` on the public site.)*

This page is where we say what we think the numbers mean. Everything below goes beyond what the dataset alone supports; readers should treat it as informed opinion, not fact.

## 1. Why we stopped quoting "2.1 TWh"

Almost every Norwegian source still anchors on **2.1 TWh** for data-centre power consumption. That number is the audited 2024 figure from SSB / Digdir. By April 2026 it is roughly 18 months out of date and has been overtaken by:

- NVE's 1H 2025 actuals: 1.4 TWh in six months, +50 % year-on-year, annualising to **~2.8-3.1 TWh for 2025**.
- 2025 commissionings not yet absorbed: AQ-OSL1B/1C (+15 MW Q1 2025), Bulk OS-IX doubling to 14 MW, Skygard DC1 first full year, Bulk N01 expansion, Polar DRA1 (12 MW) live H2 2025, Nscale Glomfjord ramp to 30 MW.
- A 2026 base of roughly **2.6-3.4 TWh**, with central estimate ~3 TWh.

Why this matters: NVE's projection of 6 TWh by 2030 is a doubling from 3 TWh, not a tripling from 2.1 TWh. The slope is the story, not the snapshot. The methodology page now shows the trajectory rather than a single year.

## 2. Reserved capacity is not realised consumption

3 363 MW reserved with Statnett (Dec 2025). At full uptake that is 20-30 TWh/yr. Realised draw in 2024 was ~240 MW average, roughly 7 % of reservations. Both NVE and Statnett expect **at most ~50 %** of reservations to ever physically connect.

The "data centres will use as much power as half of all Norwegian households" framing applies to a hypothetical full-uptake world that even the grid operator says will not happen. Quoting reserved MW as if it were tomorrow's load overstates the impact by roughly an order of magnitude.

## 3. What ~3 TWh actually equals

Some equivalents for the central 2026 estimate of 3 TWh:

- **~1.9 %** of Norwegian power production (155 TWh).
- About **1.5×** Sauda kraftverk's annual output, or **1.5×** Hydro Karmøy aluminium smelter's annual consumption.
- Roughly **187 000** average Norwegian homes (16 000 kWh/year).
- About **one-third** of Oslo's annual consumption (9 TWh).

Real, measurable, and not negligible. Also not the dominant story in Norwegian electricity.

## 4. Power prices: meaningful, but smaller and more uneven than the loud voices suggest

Norwegian electricity prices are set hourly by NordPool inside each price zone (NO1-NO5). Adding load pushes prices up where it lands; the size of the effect depends on how much is actually drawing power, which zone it sits in, and how that zone is connected to the rest of the system.

**Today (~3 TWh)**: based on THEMA Consulting's modelling for the Ministry and NVE's own work, the average national effect is **under 1 øre/kWh**, roughly 50-100 NOK/year on a household with 16 000 kWh consumption. Real, measurable, but well below the noise floor of the political debate.

**If the full 3 400 MW reserved materialises by 2030**: **2-6 øre/kWh** nationally, potentially **5-10 øre/kWh on NO2 specifically** (Sør-Vestlandet). For a Stavanger or Kristiansand household: 300-1 000+ NOK/year, with NO2 bearing the heaviest share.

The zonal asymmetry is the part most national-average reporting misses:

- **NO2 (Sør-Vestlandet)** is where most hyperscale pipeline sits (Bulk N01, Green Mountain Kalberg, GreenScale Tonstad, ASP Dale, Terakraft Sauda) and is also the zone with the heaviest cable export to Germany and the UK. Stacking 1-2 GW of new data-centre load into a zone already exporting at the margin is where the upward pressure is real.
- **NO4 (Nord-Norge)** is the opposite case. The region has chronic surplus power, weak transmission south through the Ofoten flaskehals, and prices that frequently collapse to near-zero. Stargate Narvik, T1 Energy Mo i Rana, Nscale Fauske / Glomfjord absorb otherwise-stranded power. There the price effect on local consumers is roughly neutral or even mildly positive.

A second-order effect that is likely larger than the spot-market effect over a decade: **nettleie**. Statnett's investment plan to 2040 is around 150 billion NOK, much of it driven by industrial-load growth that includes data centres. RME's projections add an estimated 3-5 øre/kWh to grid tariffs over the next decade, paid by every Norwegian customer.

The narrative "data centres are pushing up everyone's electricity bill" overshoots when applied nationally. The narrative "data centres are only 1.5 % of consumption, the price effect is negligible" undershoots in NO2 in tight hours and underweights nettleie. The honest framing is regional and asymmetric.

## 5. Could Norway just export the power instead?

A natural follow-up question: what if the ~3 TWh consumed by data centres were instead exported to Germany / UK at the cable margin?

Headline calculation: 3 TWh × ~40 øre/kWh average export margin ≈ **1.2 billion NOK/year** in gross arbitrage. Scaled to a hypothetical full-uptake 20 TWh: ~8 billion NOK/year. Those are the politician-friendly numbers.

They are misleading in three ways:

1. **Data centres are not on a discount.** Bulk, Green Mountain, Lefdal, Stack and Skygard buy power on the same NordPool spot market as households and industry. The "cheap power" they're attracted to is cheap relative to Frankfurt or London, not relative to what Norwegian consumers pay. The actual subsidy, where there is one, is the *redusert el-avgift* for kraftforedlende industri: roughly **15 øre/kWh** in tax that data centres avoid versus households. On 3 TWh, that is ~450 million NOK/year of foregone tax revenue. Real, but an order of magnitude smaller than the export-arbitrage headline.
2. **You can't just redirect 3 TWh to the cables.** NordLink + North Sea Link total ~2 800 MW and already run near full export in most hours when prices favour it. Removing 3 TWh of domestic load translates into perhaps 40-60 % additional exports plus lower domestic prices plus more spilled hydropower in wet years.
3. **The export profit isn't simply "lost."** When NO2 prices are 50 øre and German prices are 90 øre, the cable owner (Statnett, 50 % owned) collects the spread as **congestion rent** (5-10 billion NOK/year recently), a substantial share of which is regulated to flow back to grid customers via reduced nettleie. Some of the "exported instead" upside is already captured today.

Stripping out the double-counting, the net incremental revenue from redirecting current data-centre load to exports is closer to **400-500 million NOK/year**, scaling to ~3 billion NOK/year in a full-uptake 2030 scenario.

What gets traded away on the other side of the ledger:

- **Property tax (eiendomsskatt) and corporate tax**: Vennesla, Tinn, Hamar, Kinn, Drangedal and others receive tens of millions NOK/year from host data-centre eiendomsskatt. Cable exports pay no eiendomsskatt to anyone.
- **Direct employment**: ~1 500-2 500 FTEs sector-wide (NDC Industry estimate), concentrated in kommunes with weak labour markets.
- **Construction-phase regional investment**: Green Mountain Hamar alone was estimated at 4-5 billion NOK; Bulk N01 expansion in similar territory.
- **Strategic value of compute on Norwegian soil** (sovereign cloud, AI capacity for Norwegian researchers and businesses, geopolitical resilience). Hard to put a kroner figure on, but clearly above zero, which is why the 2025 *Datasenterstrategi* exists.

The honest framing is regional, again. Foregone export revenue is real but modest in NO4, where data centres absorb otherwise-stranded power. It is more meaningful in NO2, where data-centre load competes with cable exports for the same MWh that household prices are set against.

## 6. Things this map can show better than a national average can

- **Zone × reserved MW × kommune share**, so readers see where the price-impact and export-arbitrage arguments actually bite (NO2) and where they don't (NO4).
- **Realised vs. reserved** as a band, not a point, so the 7:1 gap between announcement and operation is visible.
- **Ownership chains** to ultimate parent. Foreign-owned operators are the majority by count, and the policy debate (Klassekampen on Azrieli, Stortinget Innst. 140S on transparency) is currently focused there.

Sources we draw on for this page: THEMA Consulting's 2024 modelling for DFD, NVE LA25, Statnett Områdeplan Nord/Midt/Sør 2025, Stortinget Innst. 140S 2025-2026, RME nettariff projections, Klaus Mohn (UiS) commentary in DN and Stavanger Aftenblad, Volue analyst notes, Statnett annual reports on congestion rent, the 2025 Datasenterstrategi economic-impact assessment, Helge Aasen (Elkem) at Arendalsuka 2025, and the April 2026 Datasenter-Norge inventory.
