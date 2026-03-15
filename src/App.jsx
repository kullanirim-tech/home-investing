import { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar } from 'recharts'

const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('tr-TR').format(value)
}

const formatYAxis = (value) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'Mr'
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'Mn'
  } else {
    return (value / 1000).toFixed(0) + 'B'
  }
}

function App() {
  useEffect(() => {
    const link = document.createElement('link')
    link.href = GOOGLE_FONTS_URL
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [])

  const [inputs, setInputs] = useState({
    currentSavings: 0,
    monthlySavings: 0,
    monthlyReturn: 0,
    housePrice: 0,
    annualRealEstateGrowth: 0,
    annualInflationRate: 0,
    loanInterest: 0,
    loanYears: 30,
  })

  const [focusedInput, setFocusedInput] = useState(null)

  const [results, setResults] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [toast, setToast] = useState(null)
  const [savedTimeout, setSavedTimeout] = useState(null)

  const saveTimeoutRef = useCallback((timeout) => {
    if (savedTimeout) clearTimeout(savedTimeout)
    setSavedTimeout(timeout)
  }, [savedTimeout])

  const handleCurrencyInputChange = (e, name) => {
    let value = e.target.value

    value = value.replace(/[^0-9]/g, '')

    if (value === '') {
      setInputs({ ...inputs, [name]: 0 })
      return
    }

    const numericValue = parseFloat(value)
    if (isNaN(numericValue)) {
      return
    }

    setInputs({ ...inputs, [name]: numericValue })
    debouncedSave(numericValue, name)
  }

  const handlePercentageInputChange = (e, name) => {
    let value = e.target.value

    value = value.replace(/[^0-9.,]/g, '')

    if (value === '' || value === '.') {
      setInputs({ ...inputs, [name]: 0 })
      return
    }

    const normalizedValue = value.replace(',', '.')
    const numericValue = parseFloat(normalizedValue)

    if (isNaN(numericValue)) {
      return
    }

    setInputs({ ...inputs, [name]: numericValue })
    debouncedSave(numericValue, name)
  }

  const handleNumberInputChange = (e, name) => {
    const value = parseInt(e.target.value)
    setInputs({ ...inputs, [name]: value })
    debouncedSave(value, name)
  }

  const debouncedSave = useCallback((value, name) => {
    if (window.storage) {
      const newInputs = { ...inputs, [name]: value }
      if (savedTimeout) clearTimeout(savedTimeout)
      const timeout = setTimeout(async () => {
        try {
          await window.storage.set('evAlim_inputs', JSON.stringify(newInputs))
          setToast('Kaydedildi ✓')
          setTimeout(() => setToast(null), 2000)
        } catch (e) {
          console.error('Storage error:', e)
        }
      }, 500)
      saveTimeoutRef(timeout)
    }
  }, [inputs, savedTimeout])

  const handleInputFocus = (name) => {
    setFocusedInput(name)
  }

  const handleInputBlur = (name) => {
    setFocusedInput(null)
  }

  const getCurrencyDisplayValue = (name, value) => {
    if (focusedInput === name) {
      return value === 0 ? '' : String(value)
    }
    return formatNumber(value)
  }

  const getPercentageDisplayValue = (name, value) => {
    if (focusedInput === name) {
      return value === 0 ? '' : String(value)
    }
    return value.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }

  const getNumberDisplayValue = (name, value) => {
    if (focusedInput === name) {
      return value === 0 ? '' : String(value)
    }
    return value
  }

  useEffect(() => {
    const loadInputs = async () => {
      try {
        const saved = await window.storage.get('evAlim_inputs')
        if (saved && saved.value) {
          const parsed = JSON.parse(saved.value)
          setInputs({
            currentSavings: parsed.currentSavings || 0,
            monthlySavings: parsed.monthlySavings || 0,
            monthlyReturn: parsed.monthlyReturn || 0,
            housePrice: parsed.housePrice || 0,
            annualRealEstateGrowth: parsed.annualRealEstateGrowth || 0,
            annualInflationRate: parsed.annualInflationRate || 0,
            loanInterest: parsed.loanInterest || 0,
            loanYears: parsed.loanYears || 30,
          })
        }
      } catch (e) {
        console.error('Storage load error:', e)
      }
    }
    loadInputs()

    return () => {
      if (savedTimeout) clearTimeout(savedTimeout)
    }
  }, [])

  const loadExample = () => {
    setInputs({
      currentSavings: 300000,
      monthlySavings: 20000,
      monthlyReturn: 1.5,
      housePrice: 4000000,
      annualRealEstateGrowth: 15,
      annualInflationRate: 50,
      loanInterest: 16.5,
      loanYears: 30,
    })
    setResults(null)
  }

  const clearInputs = async () => {
    setInputs({
      currentSavings: 0,
      monthlySavings: 0,
      monthlyReturn: 0,
      housePrice: 0,
      annualRealEstateGrowth: 0,
      annualInflationRate: 0,
      loanInterest: 0,
      loanYears: 30,
    })
    setResults(null)
    if (window.storage) {
      try {
        await window.storage.delete('evAlim_inputs')
      } catch (e) {
        console.error('Storage delete error:', e)
      }
    }
  }

  const calculateLoan = (principal, annualRate, years) => {
    const monthlyRate = annualRate / 100 / 12
    const numPayments = years * 12

    if (annualRate === 0) {
      return principal / numPayments
    }

    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
  }

  const calculateSavingsPath = (currentSavings, monthlySavings, monthlyReturn, housePrice, annualRealEstateGrowth, annualInflationRate) => {
    const monthlyInvestmentRate = monthlyReturn / 100
    const monthlyHouseRate = Math.pow(1 + annualRealEstateGrowth / 100, 1/12) - 1
    const monthlyInflationRate = Math.pow(1 + annualInflationRate / 100, 1/12) - 1
    const realMonthlyReturn = ((1 + monthlyInvestmentRate) / (1 + monthlyInflationRate)) - 1

    let savings = currentSavings
    let realSavings = currentSavings
    let price = housePrice
    const chartData = []
    const maxMonths = 480
    let totalMonths = 0

    for (let month = 1; month <= maxMonths; month++) {
      savings = savings * (1 + monthlyInvestmentRate) + monthlySavings
      price = price * (1 + monthlyHouseRate)

      const monthlySavingsRealValue = monthlySavings / Math.pow(1 + monthlyInflationRate, month - 1)
      realSavings = realSavings * (1 + realMonthlyReturn) + monthlySavingsRealValue

      chartData.push({
        ay: month,
        path: 'savings',
        birikim: Math.round(savings),
        gercekBirikim: Math.round(realSavings),
        evFiyati: Math.round(price),
      })

      if (savings >= price) {
        totalMonths = month
        break
      }
    }

    const canAfford = totalMonths > 0
    const years = Math.floor(totalMonths / 12)
    const remainingMonths = totalMonths % 12
    const today = new Date()
    const targetDate = new Date(today)
    targetDate.setMonth(targetDate.getMonth() + totalMonths)

    return {
      months: totalMonths,
      years,
      remainingMonths,
      targetDate: targetDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }),
      finalSavings: Math.round(savings),
      finalRealSavings: Math.round(realSavings),
      finalHousePrice: Math.round(price),
      surplusShortfall: Math.round(savings - price),
      canAfford,
      chartData,
    }
  }

  const calculateLoanPath = (currentSavings, monthlySavings, monthlyReturn, housePrice, annualRealEstateGrowth, annualInflationRate, loanInterest, loanYears) => {
    const monthlyInvestmentRate = monthlyReturn / 100
    const monthlyHouseRate = Math.pow(1 + annualRealEstateGrowth / 100, 1/12) - 1
    const monthlyInflationRate = Math.pow(1 + annualInflationRate / 100, 1/12) - 1
    const realMonthlyReturn = ((1 + monthlyInvestmentRate) / (1 + monthlyInflationRate)) - 1

    const loanAmount = Math.max(0, housePrice - currentSavings)
    const monthlyPayment = calculateLoan(loanAmount, loanInterest, loanYears)

    let remainingLoan = loanAmount
    let investment = 0
    let totalPaid = 0
    const chartData = []
    const maxMonths = loanYears * 12

    for (let month = 1; month <= maxMonths; month++) {
      const interestPayment = remainingLoan * (loanInterest / 100 / 12)
      const principalPayment = Math.min(monthlyPayment - interestPayment, remainingLoan)
      remainingLoan = Math.max(0, remainingLoan - principalPayment)
      totalPaid += monthlyPayment

      const availableForInvestment = monthlySavings - monthlyPayment
      if (availableForInvestment > 0) {
        investment = investment * (1 + monthlyInvestmentRate) + availableForInvestment
      }

      const totalValue = investment + Math.max(0, currentSavings - loanAmount)
      const monthlySavingsRealValue = monthlySavings / Math.pow(1 + monthlyInflationRate, month - 1)
      const realEquity = (totalValue / Math.pow(1 + monthlyInflationRate, month - 1))

      chartData.push({
        ay: month,
        path: 'loan',
        birikim: Math.round(totalValue),
        gercekBirikim: Math.round(realEquity),
        evFiyati: Math.round(housePrice * Math.pow(1 + monthlyHouseRate, month)),
      })
    }

    const today = new Date()
    const targetDate = new Date(today)
    targetDate.setMonth(targetDate.getMonth() + maxMonths)

    return {
      months: maxMonths,
      years: loanYears,
      remainingMonths: 0,
      targetDate: targetDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }),
      finalSavings: Math.round(chartData[chartData.length - 1].birikim),
      finalRealSavings: Math.round(chartData[chartData.length - 1].gercekBirikim),
      finalHousePrice: Math.round(chartData[chartData.length - 1].evFiyati),
      loanAmount: Math.round(loanAmount),
      monthlyPayment: Math.round(monthlyPayment),
      totalInvested: Math.round(investment),
      totalPaid: Math.round(totalPaid),
      chartData,
    }
  }

  const comparePaths = () => {
    setIsCalculating(true)

    setTimeout(() => {
      const currentSavings = parseFloat(inputs.currentSavings) || 0
      const monthlySavings = parseFloat(inputs.monthlySavings) || 0
      const monthlyReturn = parseFloat(inputs.monthlyReturn) || 0
      const housePrice = parseFloat(inputs.housePrice) || 0
      const annualRealEstateGrowth = parseFloat(inputs.annualRealEstateGrowth) || 0
      const annualInflationRate = parseFloat(inputs.annualInflationRate) || 0
      const loanInterest = parseFloat(inputs.loanInterest) || 0
      const loanYears = parseInt(inputs.loanYears) || 30

      if (housePrice <= 0) {
        setIsCalculating(false)
        alert('Lutfen gecerli bir ev fiyati girin')
        return
      }

      const savingsPath = calculateSavingsPath(
        currentSavings,
        monthlySavings,
        monthlyReturn,
        housePrice,
        annualRealEstateGrowth,
        annualInflationRate
      )

      const loanPath = calculateLoanPath(
        currentSavings,
        monthlySavings,
        monthlyReturn,
        housePrice,
        annualRealEstateGrowth,
        annualInflationRate,
        loanInterest,
        loanYears
      )

      setResults({
        savingsPath,
        loanPath,
        isLoanRecommended: savingsPath.finalSavings < loanPath.finalSavings,
      })

      setIsCalculating(false)
    }, 300)
  }

  const getXAxisInterval = () => {
    return results && results.savingsPath.months > 24 ? 3 : 1
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA', fontFamily: "'DM Sans', sans-serif", padding: '16px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
            🏠 Ev Alım Planlayıcı
          </h1>
          <p style={{ fontSize: '16px', color: '#6B7280', margin: '0' }}>
            İki yolunu karşılaştırın: Sadece biriktirmek mi, yoksa kredi alıp farkı yatırmak mı daha iyi?
          </p>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
              Finansal Veriler
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={loadExample} style={{ padding: '8px 16px', backgroundColor: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Örnek Yükle
              </button>
              <button onClick={clearInputs} style={{ padding: '8px 16px', backgroundColor: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Sıfırla
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#D1FAE5', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>
                  💰
                </span>
                Mevcut Birikim
              </label>
              <input type="text" value={getCurrencyDisplayValue('currentSavings', inputs.currentSavings)} onChange={(e) => handleCurrencyInputChange(e, 'currentSavings')} onFocus={() => handleInputFocus('currentSavings')} onBlur={() => handleInputBlur('currentSavings')} placeholder="0" style={{ width: '100%', height: '48px', padding: '12px 16px', fontSize: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#DBEAFE', color: '#2563EB', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>
                  📈
                </span>
                Aylık Birikim (Kredi Taksidinden Sonra)
              </label>
              <input type="text" value={getCurrencyDisplayValue('monthlySavings', inputs.monthlySavings)} onChange={(e) => handleCurrencyInputChange(e, 'monthlySavings')} onFocus={() => handleInputFocus('monthlySavings')} onBlur={() => handleInputBlur('monthlySavings')} placeholder="0" style={{ width: '100%', height: '48px', padding: '12px 16px', fontSize: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>
                  🎯
                </span>
                Aylık Yatırım Getirisi (%)
              </label>
              <input type="text" value={getPercentageDisplayValue('monthlyReturn', inputs.monthlyReturn)} onChange={(e) => handlePercentageInputChange(e, 'monthlyReturn')} onFocus={() => handleInputFocus('monthlyReturn')} onBlur={() => handleInputBlur('monthlyReturn')} placeholder="0" style={{ width: '100%', height: '48px', padding: '12px 16px', fontSize: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#FEE2E2', color: '#DC2626', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>
                  🏠
                </span>
                Evin Fiyatı
              </label>
              <input type="text" value={getCurrencyDisplayValue('housePrice', inputs.housePrice)} onChange={(e) => handleCurrencyInputChange(e, 'housePrice')} onFocus={() => handleInputFocus('housePrice')} onBlur={() => handleInputBlur('housePrice')} placeholder="0" style={{ width: '100%', height: '48px', padding: '12px 16px', fontSize: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#EDE9FE', color: '#7C3AED', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>
                  📊
                </span>
                Yıllık Emlak Artışı (%)
              </label>
              <input type="text" value={getPercentageDisplayValue('annualRealEstateGrowth', inputs.annualRealEstateGrowth)} onChange={(e) => handlePercentageInputChange(e, 'annualRealEstateGrowth')} onFocus={() => handleInputFocus('annualRealEstateGrowth')} onBlur={() => handleInputBlur('annualRealEstateGrowth')} placeholder="0" style={{ width: '100%', height: '48px', padding: '12px 16px', fontSize: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#FECACA', color: '#DC2626', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>
                  💹
                </span>
                Yıllık Enflasyon Oranı (%)
              </label>
              <input type="text" value={getPercentageDisplayValue('annualInflationRate', inputs.annualInflationRate)} onChange={(e) => handlePercentageInputChange(e, 'annualInflationRate')} onFocus={() => handleInputFocus('annualInflationRate')} onBlur={() => handleInputBlur('annualInflationRate')} placeholder="0" style={{ width: '100%', height: '48px', padding: '12px 16px', fontSize: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
                  🏦 Kredi Yolu İle Karşılaştırma
                </h3>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  Kredi miktarı otomatik hesaplanır
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Kredi Faiz Oranı (%)
                  </label>
                  <input type="text" value={getPercentageDisplayValue('loanInterest', inputs.loanInterest)} onChange={(e) => handlePercentageInputChange(e, 'loanInterest')} onFocus={() => handleInputFocus('loanInterest')} onBlur={() => handleInputBlur('loanInterest')} placeholder="0" style={{ width: '100%', height: '40px', padding: '8px 12px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Kredi Süresi (Yıl)
                  </label>
                  <input type="number" value={getNumberDisplayValue('loanYears', inputs.loanYears)} onChange={(e) => handleNumberInputChange(e, 'loanYears')} onFocus={() => handleInputFocus('loanYears')} onBlur={() => handleInputBlur('loanYears')} min="1" max="35" style={{ width: '100%', height: '40px', padding: '8px 12px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {results && results.loanPath && (
                <div style={{ backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                    📊 Hesaplanan Değerler
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Kredi Miktarı</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>{formatCurrency(results.loanPath.loanAmount)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Aylık Taksit</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>{formatCurrency(results.loanPath.monthlyPayment)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button onClick={comparePaths} disabled={isCalculating} style={{ width: '100%', height: '52px', backgroundColor: '#0F766E', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '600', cursor: isCalculating ? 'not-allowed' : 'pointer', opacity: isCalculating ? '0.7' : '1', marginTop: '8px' }}>
              {isCalculating ? 'Hesaplanıyor...' : 'Karşılaştır'}
            </button>
          </div>
        </div>

        {toast && (
          <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#059669', color: 'white', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', zIndex: 1000, animation: 'fadeIn 0.3s ease-out' }}>
            {toast}
          </div>
        )}

        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
              <div style={{ backgroundColor: results.isLoanRecommended ? '#D1FAE5' : '#FEF3C7', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '2px solid', borderColor: results.isLoanRecommended ? '#059669' : '#F59E0B' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: results.isLoanRecommended ? '#059669' : '#D97706', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {results.isLoanRecommended ? '✨ ÖNERİLEN YOL' : '💡 Alternatif Yaklaşım'}
                </div>
                <div style={{ fontSize: '16px', color: '#374151', marginBottom: '12px' }}>
                  {results.savingsPath.finalSavings < results.loanPath.finalSavings ? (
                    <span>Kredi alıp farkı yatırmak {formatCurrency(results.loanPath.finalSavings - results.savingsPath.finalSavings)}{' '}daha avantajlı!</span>
                  ) : (
                    <span>Sadece biriktirmek {formatCurrency(results.savingsPath.finalSavings - results.loanPath.finalSavings)}{' '}daha avantajlı!</span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  Bu sonuçlar özettedir - Detaylı grafiği aşağıda inceleyin
                </div>
              </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
                📊 Yol Karşılaştırması (Ay Bazlı)
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={results.savingsPath.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="ay"
                    stroke="#6B7280"
                    tick={{ fontSize: 12 }}
                    interval={getXAxisInterval()}
                    label={{ value: 'Ay', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} tickFormatter={formatYAxis} label={{ value: 'TL', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px' }} />
                  {results.savingsPath.canAfford && (
                    <ReferenceLine x={results.savingsPath.chartData[results.savingsPath.chartData.length - 1].ay} stroke="#0F766E" strokeDasharray="3 3" label="Hedefe Ulasti" />
                  )}
                  <Line type="monotone" dataKey="birikim" stroke="#0F766E" strokeWidth={3} name="Sadece Biriktirme (Nominal)" dot={false} />
                  <Line type="monotone" dataKey="gercekBirikim" stroke="#8B5CF6" strokeWidth={3} name="Sadece Biriktirme (Gerçek)" strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '24px', fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
                ⚔️ Kredi Yolu:
              </div>
              
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={results.loanPath.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="ay"
                      stroke="#6B7280"
                      tick={{ fontSize: 12 }}
                      interval={getXAxisInterval()}
                      label={{ value: 'Ay', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} tickFormatter={formatYAxis} label={{ value: 'TL', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px' }} />
                    {results.comparisonMonth && (
                      <ReferenceLine x={results.comparisonMonth} stroke="#DC2626" strokeDasharray="3 3" label="İlk Eşleşme" />
                    )}
                    <Line type="monotone" dataKey="birikim" stroke="#DC2626" strokeWidth={3} name="Kredi + Yatırım (Toplam Değer)" dot={false} />
                    <Line type="monotone" dataKey="gercekBirikim" stroke="#7C3AED" strokeWidth={3} name="Kredi + Yatırım (Gerçek)" strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              <div style={{ marginTop: '16px', fontSize: '12px', color: '#6B7280', lineHeight: '1.5' }}>
                <span style={{ fontWeight: '600' }}>💡 Not:</span> "Sadece Biriktirme" yolu: Tüm aylık birikimi ev için tutarsınız. "Kredi + Yatırım" yolu: Krediyi öderken, aylık birikimin kredi taksitinden fazlasını yatırırsınız. Bugün ev alırsınız.
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
                📈 Yıllık Özet (Farklı Yıllarda)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { label: '5 Yıl', savings: results.savingsPath.chartData.find(d => d.ay === 60)?.birikim || 0, loan: results.loanPath.chartData.find(d => d.ay === 60)?.birikim || 0 },
                  { label: '10 Yıl', savings: results.savingsPath.chartData.find(d => d.ay === 120)?.birikim || 0, loan: results.loanPath.chartData.find(d => d.ay === 120)?.birikim || 0 },
                  { label: '15 Yıl', savings: results.savingsPath.chartData.find(d => d.ay === 180)?.birikim || 0, loan: results.loanPath.chartData.find(d => d.ay === 180)?.birikim || 0 },
                  { label: '20 Yıl', savings: results.savingsPath.chartData.find(d => d.ay === 240)?.birikim || 0, loan: results.loanPath.chartData.find(d => d.ay === 240)?.birikim || 0 },
                  { label: '30 Yıl', savings: results.savingsPath.chartData.find(d => d.ay === 360)?.birikim || 0, loan: results.loanPath.chartData.find(d => d.ay === 360)?.birikim || 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="label" stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} tickFormatter={formatYAxis} label={{ value: 'TL', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px' }} />
                  <Bar dataKey="savings" stackId="a" fill="#0F766E" name="Sadece Biriktirme" />
                  <Bar dataKey="loan" stackId="a" fill="#DC2626" name="Kredi + Yatırım" />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '16px', fontSize: '12px', color: '#6B7280', lineHeight: '1.5' }}>
                <span style={{ fontWeight: '600' }}>📈 Not:</span> Bar grafikte, her yıl için iki yolun toplam varlığını gösterir. Kırmızı bar "Kredi + Yatırım" yolunu, turuncu bar "Sadece Biriktirme" yolunu temsil eder. Stacked bar olduğu için, genişlikleri toplam varlık kadar gösterir.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Sadece Biriktirme - Son Durum
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {results.savingsPath.canAfford ? (
                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>{formatCurrency(results.savingsPath.finalSavings)}</span>
                  ) : (
                    <span style={{ fontSize: '18px', fontWeight: '600', color: '#DC2626' }}>{formatCurrency(results.savingsPath.finalSavings)}</span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500', marginTop: '4px' }}>
                  {results.savingsPath.finalHousePrice !== null && formatCurrency(results.savingsPath.finalHousePrice)} ev fiyatı
                </div>
                <div style={{ fontSize: '12px', color: '#0F766E', marginTop: '4px' }}>
                  {results.savingsPath.years} yıl {results.savingsPath.remainingMonths} ay sonra
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Kredi ile Bugün Al - Son Durum
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formatCurrency(results.loanPath.finalSavings)}
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500', marginTop: '4px' }}>
                  Yatırılan: {formatCurrency(results.loanPath.totalInvested)}
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500', marginTop: '4px' }}>
                  {results.loanYears} yılda {formatCurrency(results.loanPath.totalPaid)} ödenir
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(10px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default App
