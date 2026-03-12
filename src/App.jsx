import { useEffect, useMemo, useState } from 'react'
import * as ethiopianDate from 'ethiopian-date'
import './App.css'

const STORAGE_KEY = 'student-budget-tracker-data-v1'
const THEME_STORAGE_KEY = 'student-budget-tracker-theme'
const ETHIOPIAN_MONTHS_AM = [
  'መስከረም',
  'ጥቅምት',
  'ህዳር',
  'ታህሳስ',
  'ጥር',
  'የካቲት',
  'መጋቢት',
  'ሚያዝያ',
  'ግንቦት',
  'ሰኔ',
  'ሀምሌ',
  'ነሐሴ',
  'ጳጉሜ',
]

const expenseCategories = [
  'Food',
  'Transport',
  'Data & Internet',
  'Health',
  'Entertainment',
  'Other',
]

const getCurrentMonth = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

const getTodayIsoDate = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

const getDefaultDateForMonth = (month) => {
  const today = getTodayIsoDate()
  return today.startsWith(`${month}-`) ? today : `${month}-01`
}

const shiftMonthKey = (month, delta) => {
  const [year, monthPart] = month.split('-')
  const shifted = new Date(Number(year), Number(monthPart) - 1 + delta, 1)
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`
}

const createInitialData = () => {
  const month = getCurrentMonth()
  return {
    currentMonth: month,
    months: {
      [month]: {
        budget: 0,
        expenses: [],
      },
    },
  }
}

const readStoredData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return createInitialData()
    }

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return createInitialData()
    }

    const safeCurrent = parsed.currentMonth || getCurrentMonth()
    const safeMonths = parsed.months && typeof parsed.months === 'object' ? parsed.months : {}

    if (!safeMonths[safeCurrent]) {
      safeMonths[safeCurrent] = { budget: 0, expenses: [] }
    }

    return {
      currentMonth: safeCurrent,
      months: safeMonths,
    }
  } catch {
    return createInitialData()
  }
}

const createNumberFormatter = (options) => {
  const localeCandidates = ['am-ET', 'en-US']
  for (const locale of localeCandidates) {
    try {
      return new Intl.NumberFormat(locale, options)
    } catch {
      // Try the next locale on devices with partial Intl support.
    }
  }
  return new Intl.NumberFormat('en-US', options)
}

const currencyFormatter = createNumberFormatter({
  style: 'currency',
  currency: 'ETB',
  maximumFractionDigits: 2,
})

const amharicIntegerFormatter = createNumberFormatter({
  maximumFractionDigits: 0,
  useGrouping: false,
})

const formatCurrency = (value) => currencyFormatter.format(Number.isFinite(value) ? value : 0)

const formatAmharicInteger = (value) => {
  try {
    return amharicIntegerFormatter.format(value)
  } catch {
    return String(value)
  }
}

const parseIsoDate = (value) => {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return { year, month, day }
}

const toEthiopianDate = (isoDate) => {
  const parts = parseIsoDate(isoDate)
  if (!parts) return null
  const [year, month, day] = ethiopianDate.toEthiopian(parts.year, parts.month, parts.day)
  return { year, month, day }
}

const formatMonthLabel = (month) => {
  if (!month) return 'This month'
  const ethiopian = toEthiopianDate(`${month}-01`)
  if (!ethiopian) return month
  const monthName = ETHIOPIAN_MONTHS_AM[ethiopian.month - 1] || String(ethiopian.month)
  return `${monthName} ${formatAmharicInteger(ethiopian.year)}`
}

const formatEthiopicDate = (value) => {
  if (!value) return 'Unknown date'
  const ethiopian = toEthiopianDate(value)
  if (!ethiopian) return value
  const monthName = ETHIOPIAN_MONTHS_AM[ethiopian.month - 1] || String(ethiopian.month)
  return `${formatAmharicInteger(ethiopian.day)} ${monthName} ${formatAmharicInteger(ethiopian.year)}`
}

const formatRelativeDate = (value) => {
  if (!value) return 'Unknown day'

  const target = new Date(`${value}T00:00:00`)
  if (Number.isNaN(target.getTime())) return value

  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate())

  const msPerDay = 24 * 60 * 60 * 1000
  const dayDiff = Math.round((todayMidnight - targetMidnight) / msPerDay)

  if (dayDiff === 0) return 'Today'
  if (dayDiff === 1) return 'Yesterday'
  if (dayDiff > 1) return `${dayDiff} days ago`
  if (dayDiff === -1) return 'Tomorrow'
  return `In ${Math.abs(dayDiff)} days`
}

const formatExpenseDateLabel = (value) => `${formatRelativeDate(value)} • ${formatEthiopicDate(value)}`

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const [data, setData] = useState(readStoredData)
  const [theme, setTheme] = useState(getInitialTheme)
  const [flash, setFlash] = useState(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const isIOSDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
  const installHint = deferredInstallPrompt
    ? 'Ready. Tap Install App.'
    : isIOSDevice
      ? 'On iPhone/iPad: tap Share, then Add to Home Screen.'
      : 'If no popup appears, open browser menu and tap Install app.'
  const activeMonth = data.currentMonth
  const monthData = data.months[activeMonth] || { budget: 0, expenses: [] }
  const monthOptions = useMemo(() => {
    const keys = Object.keys(data.months)
    if (!keys.includes(activeMonth)) {
      keys.push(activeMonth)
    }
    return keys.sort((a, b) => b.localeCompare(a))
  }, [data.months, activeMonth])

  const [budgetInput, setBudgetInput] = useState(monthData.budget ? String(monthData.budget) : '')
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: expenseCategories[0],
    date: getDefaultDateForMonth(activeMonth),
    note: '',
  })

  const spent = useMemo(
    () => monthData.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [monthData.expenses],
  )

  const categoryBreakdown = useMemo(() => {
    const totals = monthData.expenses.reduce((accumulator, item) => {
      const key = item.category || 'Other'
      accumulator[key] = (accumulator[key] || 0) + Number(item.amount || 0)
      return accumulator
    }, {})

    return Object.entries(totals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
  }, [monthData.expenses])

  const budget = Number(monthData.budget || 0)
  const remaining = Math.max(budget - spent, 0)
  const overBy = Math.max(spent - budget, 0)
  const utilization = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0

  useEffect(() => {
    if (!flash) return undefined
    const timeoutId = window.setTimeout(() => setFlash(null), 2200)
    return () => window.clearTimeout(timeoutId)
  }, [flash])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    if (standaloneMode) {
      setIsInstalled(true)
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredInstallPrompt(event)
    }

    const handleInstalled = () => {
      setIsInstalled(true)
      setDeferredInstallPrompt(null)
      setFlash({ kind: 'success', message: 'App installed successfully.' })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const persist = (nextData) => {
    setData(nextData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData))
  }

  const ensureMonth = (month) => {
    const nextData = {
      ...data,
      currentMonth: month,
      months: {
        ...data.months,
        [month]: data.months[month] || {
          budget: 0,
          expenses: [],
        },
      },
    }
    persist(nextData)
    const selected = nextData.months[month]
    setBudgetInput(selected.budget ? String(selected.budget) : '')
    setExpenseForm((prev) => ({
      ...prev,
      date: getDefaultDateForMonth(month),
    }))
  }

  const handleBudgetSave = (event) => {
    event.preventDefault()
    const nextBudget = Number(budgetInput)
    if (!Number.isFinite(nextBudget) || nextBudget < 0) {
      setFlash({ kind: 'error', message: 'Please enter a valid budget amount.' })
      return
    }

    const nextData = {
      ...data,
      months: {
        ...data.months,
        [activeMonth]: {
          ...monthData,
          budget: nextBudget,
        },
      },
    }
    persist(nextData)
    setFlash({ kind: 'success', message: 'Monthly budget saved.' })
  }

  const handleExpenseAdd = (event) => {
    event.preventDefault()
    const amountValue = Number(expenseForm.amount)
    if (!expenseForm.title.trim() || !Number.isFinite(amountValue) || amountValue <= 0) {
      setFlash({ kind: 'error', message: 'Add a title and a valid amount greater than zero.' })
      return
    }

    const nextExpense = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: expenseForm.title.trim(),
      amount: amountValue,
      category: expenseForm.category,
      date: expenseForm.date,
      note: expenseForm.note.trim(),
    }

    const nextData = {
      ...data,
      months: {
        ...data.months,
        [activeMonth]: {
          ...monthData,
          expenses: [nextExpense, ...monthData.expenses],
        },
      },
    }
    persist(nextData)

    setExpenseForm({
      title: '',
      amount: '',
      category: expenseCategories[0],
      date: expenseForm.date,
      note: '',
    })
    setFlash({ kind: 'success', message: 'Expense added.' })
  }

  const handleExpenseDelete = (id) => {
    const nextData = {
      ...data,
      months: {
        ...data.months,
        [activeMonth]: {
          ...monthData,
          expenses: monthData.expenses.filter((item) => item.id !== id),
        },
      },
    }
    persist(nextData)
    setFlash({ kind: 'success', message: 'Expense removed.' })
  }

  const handleResetCurrentMonth = () => {
    const nextData = {
      ...data,
      months: {
        ...data.months,
        [activeMonth]: {
          budget: 0,
          expenses: [],
        },
      },
    }
    persist(nextData)
    setBudgetInput('')
    setExpenseForm((prev) => ({
      ...prev,
      title: '',
      amount: '',
      note: '',
      date: getDefaultDateForMonth(activeMonth),
      category: expenseCategories[0],
    }))
    setShowResetModal(false)
    setFlash({ kind: 'success', message: 'Current month has been reset.' })
  }

  const handleInstallApp = async () => {
    if (!deferredInstallPrompt) {
      if (!window.isSecureContext) {
        setFlash({
          kind: 'error',
          message: 'Install needs a secure URL. Use localhost on this device or deploy with HTTPS.',
        })
        return
      }

      if (isIOSDevice) {
        setFlash({
          kind: 'error',
          message: 'On iPhone/iPad, use Share > Add to Home Screen to install.',
        })
        return
      }

      setFlash({
        kind: 'error',
        message: 'Install prompt not ready. In Chrome/Edge, open browser menu and choose Install app.',
      })
      return
    }

    deferredInstallPrompt.prompt()
    const choiceResult = await deferredInstallPrompt.userChoice
    if (choiceResult.outcome === 'accepted') {
      setFlash({ kind: 'success', message: 'Install request accepted.' })
    }
    setDeferredInstallPrompt(null)
  }

  return (
    <main className="app-shell">
      {flash ? (
        <div className={`flash-banner ${flash.kind === 'error' ? 'flash-error' : 'flash-success'}`}>
          {flash.message}
        </div>
      ) : null}

      <div className="theme-toggle-wrap">
        <label className="bb8-toggle" aria-label="Switch color theme">
          <input
            className="bb8-toggle__checkbox"
            type="checkbox"
            checked={theme === 'dark'}
            onChange={(event) => setTheme(event.target.checked ? 'dark' : 'light')}
          />
          <div className="bb8-toggle__container">
            <div className="bb8-toggle__scenery">
              <div className="bb8-toggle__star" />
              <div className="bb8-toggle__star" />
              <div className="bb8-toggle__star" />
              <div className="tatto-1" />
              <div className="tatto-2" />
              <div className="bb8-toggle__cloud" />
              <div className="bb8-toggle__cloud" />
            </div>
            <div className="bb8">
              <div className="bb8__head-container">
                <div className="bb8__antenna" />
                <div className="bb8__antenna" />
                <div className="bb8__head" />
              </div>
              <div className="bb8__body" />
            </div>
            <div className="artificial__hidden">
              <div className="bb8__shadow" />
            </div>
          </div>
        </label>
      </div>

      <section className="hero-card">
        <div>
          <p className="eyebrow">Campus Cash Map</p>
          <h1>Control your money month by month.</h1>
          <p className="subtitle">
            Login-free planner for students to set a budget, log expenses, and track how much is left.
          </p>
        </div>
        <div className="hero-controls">
          <div className="month-switcher" role="group" aria-label="Month selector">
            <span>Month</span>
            <div className="month-picker-row">
              <button
                type="button"
                className="ghost-btn month-nav-btn"
                onClick={() => ensureMonth(shiftMonthKey(activeMonth, -1))}
                aria-label="Go to previous month"
              >
                Previous
              </button>
              <select
                value={activeMonth}
                onChange={(event) => ensureMonth(event.target.value)}
                aria-label="Select month"
              >
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {formatMonthLabel(month)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="ghost-btn month-nav-btn"
                onClick={() => ensureMonth(shiftMonthKey(activeMonth, 1))}
                aria-label="Go to next month"
              >
                Next
              </button>
            </div>
            <small>{`Selected: ${formatMonthLabel(activeMonth)}`}</small>
          </div>

          {!isInstalled ? (
            <>
              <button type="button" className="install-btn" onClick={handleInstallApp}>
                Install App
              </button>
              <small className="install-hint">{installHint}</small>
            </>
          ) : null}
        </div>
      </section>

      <section className="summary-grid">
        <article className="summary-card ring-card">
          <h2>{formatMonthLabel(activeMonth)}</h2>
          <div className="progress-wrap">
            <div
              className="progress-ring"
              style={{ '--pct': `${utilization}%` }}
              aria-label={`Budget usage ${utilization.toFixed(0)}%`}
            >
              <strong>{utilization.toFixed(0)}%</strong>
              <span>used</span>
            </div>
          </div>
        </article>

        <article className="summary-card">
          <p>Total Budget</p>
          <strong>{formatCurrency(budget)}</strong>
        </article>

        <article className="summary-card">
          <p>Total Spent</p>
          <strong>{formatCurrency(spent)}</strong>
        </article>

        <article className={`summary-card ${overBy > 0 ? 'danger' : 'safe'}`}>
          <p>{overBy > 0 ? 'Over Budget' : 'Remaining'}</p>
          <strong>{formatCurrency(overBy > 0 ? overBy : remaining)}</strong>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <h3>Set Monthly Budget</h3>
          <form onSubmit={handleBudgetSave} className="stack">
            <label>
              Amount
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 150"
                value={budgetInput}
                onChange={(event) => setBudgetInput(event.target.value)}
                required
              />
            </label>
            <button type="submit" className="primary-btn">
              Save Budget
            </button>
          </form>
        </article>

        <article className="panel">
          <h3>Add Expense</h3>
          <form onSubmit={handleExpenseAdd} className="stack">
            <label>
              Title
              <input
                type="text"
                placeholder="Lunch, Books, Taxi..."
                value={expenseForm.title}
                onChange={(event) =>
                  setExpenseForm((prev) => ({ ...prev, title: event.target.value }))
                }
                required
              />
            </label>
            <div className="inline-group">
              <label>
                Amount
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={expenseForm.amount}
                  onChange={(event) =>
                    setExpenseForm((prev) => ({ ...prev, amount: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Category
                <select
                  value={expenseForm.category}
                  onChange={(event) =>
                    setExpenseForm((prev) => ({ ...prev, category: event.target.value }))
                  }
                >
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Date
              <input
                type="date"
                value={expenseForm.date}
                onChange={(event) =>
                  setExpenseForm((prev) => ({ ...prev, date: event.target.value }))
                }
                required
              />
              <small>{`Ethiopian: ${formatEthiopicDate(expenseForm.date)}`}</small>
            </label>
            <label>
              Note (optional)
              <textarea
                rows="3"
                placeholder="Quick note"
                value={expenseForm.note}
                onChange={(event) =>
                  setExpenseForm((prev) => ({ ...prev, note: event.target.value }))
                }
              />
            </label>
            <button type="submit" className="primary-btn">
              Add Expense
            </button>
          </form>
        </article>
      </section>

      <section className="panel">
        <div className="expense-head">
          <h3>Expense History</h3>
          <div className="expense-head-actions">
            <span>{monthData.expenses.length} items</span>
            <button type="button" className="danger-btn" onClick={() => setShowResetModal(true)}>
              Reset Month
            </button>
          </div>
        </div>

        {monthData.expenses.length === 0 ? (
          <p className="empty">No expenses logged yet for this month.</p>
        ) : (
          <ul className="expense-list">
            {monthData.expenses.map((item) => (
              <li key={item.id}>
                <div className="expense-main">
                  <h4>{item.title}</h4>
                  <p>
                    {item.category} • {formatExpenseDateLabel(item.date)}
                  </p>
                  {item.note ? <small>{item.note}</small> : null}
                </div>
                <div className="expense-side">
                  <strong>{formatCurrency(item.amount)}</strong>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => handleExpenseDelete(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h3>Category Breakdown</h3>
        {categoryBreakdown.length === 0 ? (
          <p className="empty">No category data yet. Add expenses to see this chart.</p>
        ) : (
          <ul className="chart-list">
            {categoryBreakdown.map((item) => {
              const widthPercent = spent > 0 ? (item.total / spent) * 100 : 0
              return (
                <li key={item.category}>
                  <div className="chart-row-top">
                    <span>{item.category}</span>
                    <strong>{formatCurrency(item.total)}</strong>
                  </div>
                  <div className="chart-track" aria-hidden="true">
                    <div className="chart-fill" style={{ width: `${widthPercent}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {showResetModal ? (
        <section className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Confirm reset">
          <div className="modal-card">
            <h3>Reset {formatMonthLabel(activeMonth)}?</h3>
            <p>
              This will permanently clear the budget and all expenses for the selected month.
            </p>
            <div className="modal-actions">
              <button type="button" className="ghost-btn" onClick={() => setShowResetModal(false)}>
                Cancel
              </button>
              <button type="button" className="danger-btn" onClick={handleResetCurrentMonth}>
                Yes, Reset
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}

export default App
