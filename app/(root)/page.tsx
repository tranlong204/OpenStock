import TradingViewWidget from "@/components/TradingViewWidget";
import StockHeatmap from "@/components/StockHeatmap";
import MarketOverview from "@/components/MarketOverview";
import {
    MARKET_DATA_WIDGET_CONFIG,
    TOP_STORIES_WIDGET_CONFIG
} from "@/lib/constants";

const Home = () => {
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

    return (
        <div className="flex min-h-screen home-wrapper">
            <section className="grid w-full gap-8 home-section">
                <div className="md:col-span-1 xl:col-span-1">
                    <MarketOverview height={600} />
                </div>
                <div className="md-col-span xl:col-span-2">
                    <StockHeatmap
                        symbols={[
                            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'AVGO',
                            'JPM', 'BAC', 'WFC', 'MA', 'V', 'HD', 'WMT', 'COST',
                            'JNJ', 'PG', 'KO', 'PEP', 'NFLX', 'ADBE', 'CRM', 'ORCL',
                            'INTC', 'AMD', 'QCOM', 'TXN', 'CSCO', 'IBM', 'UBER', 'LYFT'
                        ]}
                        height={600}
                    />
                </div>
            </section>
            <section className="grid w-full gap-8 home-section">
                <div className="h-full md:col-span-1 xl:col-span-2">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}market-quotes.js`}
                        config={MARKET_DATA_WIDGET_CONFIG}
                        height={600}
                    />
                </div>
                <div className="h-full md:col-span-1 xl:col-span-1">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}timeline.js`}
                        config={TOP_STORIES_WIDGET_CONFIG}
                        height={600}
                    />
                </div>

            </section>
        </div>
    )
}

export default Home;