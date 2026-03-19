import { execSync } from 'child_process'

try {
  console.log('🚀 Pushing fintech prototype changes to GitHub...')

  // Configure git
  try {
    execSync('git config user.email "v0@vercel.com"', { cwd: '/vercel/share/v0-project', stdio: 'pipe' })
    execSync('git config user.name "v0 Assistant"', { cwd: '/vercel/share/v0-project', stdio: 'pipe' })
  } catch (e) {
    // Git config might already be set
  }

  // Add all changes
  console.log('Adding changes...')
  execSync('git add -A', { cwd: '/vercel/share/v0-project', stdio: 'inherit' })

  // Check if there are changes
  try {
    execSync('git diff --cached --quiet', { cwd: '/vercel/share/v0-project', stdio: 'pipe' })
    console.log('No changes to commit')
  } catch (e) {
    // There are changes, proceed with commit
    console.log('Committing changes...')
    execSync('git commit -m "feat: Transform Moneyfer into functional fintech prototype\n\n- Add extended wallet system with PIN security (set/verify flows)\n- Implement airtime purchase screen with country/provider selection\n- Build bills payment screen (electricity, water, internet, TV)\n- Enhance transaction history with advanced filtering and search\n- Add USSD menu simulation (*328# text-based interface)\n- Create spending analytics dashboard with charts and statistics\n- Extend AppContext with PIN state and unified transactions\n- Add new transaction types: airtime, bills, topup\n- Update navigation and dashboard with new features\n- Create reusable chart and select UI components"', { cwd: '/vercel/share/v0-project', stdio: 'inherit' })

    console.log('Pushing to GitHub...')
    execSync('git push origin fintech-prototype-upgrade', { cwd: '/vercel/share/v0-project', stdio: 'inherit' })
  }

  console.log('✅ Successfully pushed all changes to GitHub!')
  console.log('📝 Branch: fintech-prototype-upgrade')
  console.log('📦 Repository: GIBRILKAMARA/v0-fintech-design-system')
} catch (error) {
  console.error('❌ Error pushing to GitHub:', error.message)
  process.exit(1)
}
