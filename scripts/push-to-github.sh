#!/bin/bash
set -e

echo "🚀 Pushing fintech prototype changes to GitHub..."

# Add all changes
git add -A

# Commit with descriptive message
git commit -m "feat: Transform Moneyfer into functional fintech prototype

- Add extended wallet system with PIN security (set/verify flows)
- Implement airtime purchase screen with country/provider selection
- Build bills payment screen (electricity, water, internet, TV)
- Enhance transaction history with advanced filtering and search
- Add USSD menu simulation (*328# text-based interface)
- Create spending analytics dashboard with charts and statistics
- Extend AppContext with PIN state and unified transactions
- Add new transaction types: airtime, bills, topup
- Update navigation and dashboard with new features
- Create reusable chart and select UI components"

# Push to the fintech-prototype-upgrade branch
git push origin fintech-prototype-upgrade

echo "✅ Successfully pushed all changes to GitHub!"
echo "📝 Branch: fintech-prototype-upgrade"
echo "📦 Repository: GIBRILKAMARA/v0-fintech-design-system"
