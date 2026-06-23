"use client";

import { useState } from "react";
import { LogoMark } from "./Logo";
import { X, ExternalLink, Mail, MessageCircle } from "lucide-react";

type LegalPage = "privacy" | "terms" | "disclaimer" | null;

const CURRENT_YEAR = new Date().getFullYear();

function LegalModal({ page, onClose }: { page: LegalPage; onClose: () => void }) {
  if (!page) return null;

  const content: Record<string, { title: string; body: React.ReactNode }> = {
    privacy: {
      title: "Privacy Policy",
      body: (
        <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <p className="text-gray-400 text-xs">Last updated: June 2026</p>
          <h3 className="text-white font-semibold text-base">1. Information We Collect</h3>
          <p>MarketLens is designed with privacy-first principles. We do <strong className="text-white">not</strong> collect personal information, require account creation, or use tracking cookies. All user data — including watchlists, portfolio holdings, quiz progress, lesson completions, and trade journal entries — is stored exclusively in your browser&apos;s localStorage and never transmitted to our servers.</p>

          <h3 className="text-white font-semibold text-base">2. Data Storage</h3>
          <p>Your data lives entirely on your device. If you clear your browser data or switch devices, your progress will be reset. We recommend periodically noting important information externally, as we cannot recover locally-stored data.</p>

          <h3 className="text-white font-semibold text-base">3. Third-Party Services</h3>
          <p>We retrieve market data from third-party financial data providers (including Yahoo Finance). When you search for a stock, your query is sent to these providers to retrieve financial information. They have their own privacy policies governing how they handle requests. We do not control or have access to data collected by these providers.</p>

          <h3 className="text-white font-semibold text-base">4. Analytics</h3>
          <p>MarketLens does not use Google Analytics, Facebook Pixel, or any other user tracking or analytics tools. We do not track your browsing behavior, clicks, or usage patterns.</p>

          <h3 className="text-white font-semibold text-base">5. Cookies</h3>
          <p>We do not use cookies. The localStorage mechanism used by MarketLens is technically distinct from cookies and does not transmit data with HTTP requests.</p>

          <h3 className="text-white font-semibold text-base">6. Children&apos;s Privacy</h3>
          <p>MarketLens is an educational platform suitable for users of all ages. We do not knowingly collect personal information from anyone, including children under 13.</p>

          <h3 className="text-white font-semibold text-base">7. Changes to This Policy</h3>
          <p>We may update this Privacy Policy from time to time. Changes will be reflected on this page with an updated revision date.</p>

          <h3 className="text-white font-semibold text-base">8. Contact</h3>
          <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:mokshaglobal.org@gmail.com" className="text-[var(--color-brand)] hover:underline">mokshaglobal.org@gmail.com</a>.</p>
        </div>
      ),
    },
    terms: {
      title: "Terms of Service",
      body: (
        <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <p className="text-gray-400 text-xs">Last updated: June 2026</p>
          <h3 className="text-white font-semibold text-base">1. Acceptance of Terms</h3>
          <p>By accessing and using MarketLens (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>

          <h3 className="text-white font-semibold text-base">2. Nature of Service</h3>
          <p>MarketLens is a <strong className="text-white">free educational platform</strong> designed to help students and beginner investors learn about equity research, financial analysis, and investing concepts. The Platform provides paper trading simulations, financial data visualization, interactive lessons, and educational tools.</p>

          <h3 className="text-white font-semibold text-base">3. Not Financial Advice</h3>
          <p>Nothing on MarketLens constitutes financial advice, investment recommendations, or a solicitation to buy or sell any security. All content is for educational and informational purposes only. You should consult a qualified financial advisor before making any investment decisions. Past performance shown on the Platform does not guarantee future results.</p>

          <h3 className="text-white font-semibold text-base">4. Paper Trading</h3>
          <p>The paper trading feature uses simulated money and does not involve real financial transactions. Performance in paper trading does not reflect actual market conditions and should not be used as the sole basis for real investment decisions.</p>

          <h3 className="text-white font-semibold text-base">5. Data Accuracy</h3>
          <p>While we strive to provide accurate financial data, we do not guarantee the accuracy, completeness, or timeliness of any information on the Platform. Market data may be delayed or derived from demo datasets. Users should verify all information independently before making decisions.</p>

          <h3 className="text-white font-semibold text-base">6. Intellectual Property</h3>
          <p>All content, design, code, and educational materials on MarketLens are protected by copyright law. The MarketLens name, logo, and branding are the property of the MarketLens team. You may not reproduce, distribute, or create derivative works without written permission.</p>

          <h3 className="text-white font-semibold text-base">7. Limitation of Liability</h3>
          <p>MarketLens is provided &quot;as is&quot; without warranties of any kind, either express or implied. We shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the Platform, including but not limited to financial losses from investment decisions influenced by Platform content.</p>

          <h3 className="text-white font-semibold text-base">8. Modifications</h3>
          <p>We reserve the right to modify these terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised terms.</p>

          <h3 className="text-white font-semibold text-base">9. Contact</h3>
          <p>For questions about these terms, contact <a href="mailto:mokshaglobal.org@gmail.com" className="text-[var(--color-brand)] hover:underline">mokshaglobal.org@gmail.com</a>.</p>
        </div>
      ),
    },
    disclaimer: {
      title: "Investment Disclaimer",
      body: (
        <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <p className="text-gray-400 text-xs">Last updated: June 2026</p>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-400 font-semibold text-sm mb-2">Important Notice</p>
            <p className="text-amber-200/80 text-sm">MarketLens is an <strong>educational platform only</strong>. We are not a registered broker-dealer, investment advisor, or financial institution. We do not provide personalized investment advice, and no content on this platform should be interpreted as such.</p>
          </div>

          <h3 className="text-white font-semibold text-base">Educational Purpose</h3>
          <p>All information, tools, analysis, scores, ratings, and content provided on MarketLens are for <strong className="text-white">educational and informational purposes only</strong>. The Platform is designed to teach financial concepts and should not be the sole basis for any investment decision.</p>

          <h3 className="text-white font-semibold text-base">No Guarantee of Accuracy</h3>
          <p>Financial data displayed on MarketLens may be delayed, estimated, or derived from demo datasets. Stock prices, financial statements, analyst estimates, and other metrics may not reflect current real-time values. We make no representations about the accuracy or reliability of any information presented.</p>

          <h3 className="text-white font-semibold text-base">Risk Acknowledgment</h3>
          <p>Investing in securities involves substantial risk of loss. The value of investments can go down as well as up. You may lose some or all of your invested capital. Historical performance does not indicate future results.</p>

          <h3 className="text-white font-semibold text-base">AI-Generated Content</h3>
          <p>Some features on MarketLens use artificial intelligence to generate analysis and insights. AI-generated content may contain errors, biases, or outdated information. Always verify AI-generated insights with multiple independent sources.</p>

          <h3 className="text-white font-semibold text-base">Consult a Professional</h3>
          <p>Before making any investment decisions, we strongly recommend consulting with a qualified financial advisor, tax professional, or other licensed professional who can provide advice tailored to your specific financial situation and goals.</p>

          <h3 className="text-white font-semibold text-base">Third-Party Data</h3>
          <p>Market data and financial information are provided by third-party sources including Yahoo Finance. We are not responsible for errors or omissions in third-party data.</p>
        </div>
      ),
    },
  };

  const c = content[page];
  if (!c) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[80vh] bg-[#0f1419] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{c.title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(80vh-64px)]">
          {c.body}
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [legalPage, setLegalPage] = useState<LegalPage>(null);

  return (
    <>
      <LegalModal page={legalPage} onClose={() => setLegalPage(null)} />
      <footer className="mt-12 border-t border-[var(--color-border)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <LogoMark size={28} className="rounded-lg" />
                <div>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">
                    Market<span className="text-gradient-brand">Lens</span>
                  </p>
                  <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">Research Platform</p>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mt-2">
                Free equity research and financial education for students worldwide. Learn investing with professional tools, zero cost.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2">
                {["Stock Screener", "Paper Trading", "Lessons", "Sector Heatmap", "Economic Calendar"].map((item) => (
                  <li key={item}>
                    <span className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand)] cursor-pointer transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setLegalPage("privacy")} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setLegalPage("terms")} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors">Terms of Service</button></li>
                <li><button onClick={() => setLegalPage("disclaimer")} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors">Investment Disclaimer</button></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-3">Contact</h4>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:mokshaglobal.org@gmail.com" className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors">
                    <Mail size={12} />
                    mokshaglobal.org@gmail.com
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/15403979223" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors">
                    <MessageCircle size={12} />
                    WhatsApp Support
                  </a>
                </li>
                <li>
                  <a href="https://github.com/ANURAG981768/Marketlens.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors">
                    <ExternalLink size={12} />
                    GitHub Repository
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-[var(--color-text-muted)]">
                &copy; {CURRENT_YEAR} MarketLens. All rights reserved. Built for students, by students.
              </p>
              <div className="flex items-center gap-4">
                <button onClick={() => setLegalPage("disclaimer")} className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors">
                  Not Financial Advice
                </button>
                <span className="text-[var(--color-border)]">|</span>
                <button onClick={() => setLegalPage("privacy")} className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors">
                  Privacy
                </button>
                <span className="text-[var(--color-border)]">|</span>
                <button onClick={() => setLegalPage("terms")} className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors">
                  Terms
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-[var(--color-text-muted)]/50 mt-3">
              Market data provided by Yahoo Finance. Prices may be delayed. All paper trading uses simulated funds.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
