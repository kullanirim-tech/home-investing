import { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

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
    return String(value)
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

  const calculateRequiredMonthly = (currentSavings, housePrice, annualRealEstateGrowth, monthlyReturn, targetMonths) => {
    let low = 0
    let high = 1000000000
    let result = 0

    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2
      let savings = currentSavings
      let price = housePrice
      const monthlyHouseRate = Math.pow(1 + annualRealEstateGrowth / 100, 1/12) - 1
      const monthlyInvestmentRate = monthlyReturn / 100

      for (let month = 0; month < targetMonths; month++) {
        savings = savings * (1 + monthlyInvestmentRate) + mid
        price = price * (1 + monthlyHouseRate)
      }

      if (savings >= price) {
        high = mid
        result = mid
      } else {
        low = mid
      }
    }

    return Math.round(result)
  }

  const calculatePlan = () => {
    setIsCalculating(true)

    setTimeout(() => {
      const currentSavings = parseFloat(inputs.currentSavings) || 0
      const monthlySavings = parseFloat(inputs.monthlySavings) || 0
      const monthlyReturn = parseFloat(inputs.monthlyReturn) || 0
      const housePrice = parseFloat(inputs.housePrice) || 0
      const annualRealEstateGrowth = parseFloat(inputs.annualRealEstateGrowth) || 0

      if (housePrice <= 0) {
        setIsCalculating(false)
        alert('Lutfen gecerli bir ev fiyati girin')
        return
      }

      const monthlyInvestmentRate = monthlyReturn / 100
      const monthlyHouseRate = Math.pow(1 + annualRealEstateGrowth / 100, 1/12) - 1

      let savings = currentSavings
      let price = housePrice
      const chartData = []
      const maxMonths = 480
      let totalMonths = 0

      for (let month = 1; month <= maxMonths; month++) {
        savings = savings * (1 + monthlyInvestmentRate) + monthlySavings
        price = price * (1 + monthlyHouseRate)

        chartData.push({
          ay: month,
          birikim: Math.round(savings),
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

      let requiredMonthlyIncrease = null
      let isImpossible = false

      if (!canAfford) {
        isImpossible = monthlyInvestmentRate <= monthlyHouseRate
        if (isImpossible) {
          requiredMonthlyIncrease = calculateRequiredMonthly(currentSavings, housePrice, annualRealEstateGrowth, monthlyReturn, 240)
        }
      }

      setResults({
        months: totalMonths,
        years,
        remainingMonths,
        targetDate: targetDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }),
        finalSavings: Math.round(savings),
        finalHousePrice: Math.round(price),
        surplusShortfall: Math.round(savings - price),
        canAfford,
        isImpossible,
        requiredMonthlyIncrease,
        chartData,
      })

      setIsCalculating(false)
    }, 300)
  }

  const getXAxisInterval = () => {
    return results && results.months > 24 ? 3 : 1
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA', fontFamily: "'DM Sans', sans-serif", padding: '16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
            🏠 Ev Alım Planlayıcı
          </h1>
          <p style={{ fontSize: '16px', color: '#6B7280', margin: '0' }}>
            Birikimlerinizi planlayın, evi ne zaman alabileceğinizi öğrenin
          </p>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', margin: '0' }}>
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
                Aylık Birikim
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

            <button onClick={calculatePlan} disabled={isCalculating} style={{ width: '100%', height: '52px', backgroundColor: '#0F766E', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '600', cursor: isCalculating ? 'not-allowed' : 'pointer', opacity: isCalculating ? '0.7' : '1', marginTop: '8px' }}>
              {isCalculating ? 'Hesaplanıyor...' : 'Hesapla'}
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
            {results.isImpossible ? (
              <div style={{ backgroundColor: '#FEE2E2', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '2px solid #DC2626' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#DC2626', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ⚠️ Uyarı
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '12px' }}>
                  Hedefe ulaşmak matematiksel olarak imkansız
                </div>
                <div style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>
                  Emlak artış hızı birikim getirisini aşıyor
                </div>
                {results.requiredMonthlyIncrease !== null && (
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginTop: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      20 yılda ulaşmak için:
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#0F766E' }}>
                      {formatCurrency(results.requiredMonthlyIncrease)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>
                      aylık daha biriktirmeniz gerekiyor
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ backgroundColor: results.canAfford ? '#D1FAE5' : '#FEE2E2', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: results.canAfford ? '#059669' : '#DC2626', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {results.canAfford ? 'Hedefe Ulasti!' : 'Hedef Devam Ediyor'}
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
                  {results.years} yil {results.remainingMonths} ay
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  Hedef tarih: {results.targetDate}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Son Birikim
                </div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formatCurrency(results.finalSavings)}
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Son Ev Fiyati
                </div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formatCurrency(results.finalHousePrice)}
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {results.surplusShortfall >= 0 ? 'Birikim Fazlasi' : 'Acik'}
                </div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: results.surplusShortfall >= 0 ? '#059669' : '#DC2626', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formatCurrency(Math.abs(results.surplusShortfall))}
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Toplam Ay
                </div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formatNumber(results.months)} ay
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
                Birikim ve Ev Fiyati Grafigi
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={results.chartData}>
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
                  {results.canAfford && (
                    <ReferenceLine x={results.chartData[results.chartData.length - 1].ay} stroke="#0F766E" strokeDasharray="3 3" label="Hedefe Ulasti" />
                  )}
                  <Line type="monotone" dataKey="birikim" stroke="#0F766E" strokeWidth={3} name="Birikim" dot={false} />
                  <Line type="monotone" dataKey="evFiyati" stroke="#DC2626" strokeWidth={3} name="Ev Fiyati" dot={false} />
                </LineChart>
              </ResponsiveContainer>
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
