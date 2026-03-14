import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

function App() {
  useEffect(() => {
    const link = document.createElement('link')
    link.href = GOOGLE_FONTS_URL
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [])

  const [inputs, setInputs] = useState({
    currentSavings: '',
    monthlySavings: '',
    monthlyReturn: '',
    housePrice: '',
    annualRealEstateGrowth: '',
  })

  const [results, setResults] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleInputChange = (name, value) => {
    setInputs(prev => ({ ...prev, [name]: value }))
  }

  const loadExample = () => {
    setInputs({
      currentSavings: '300000',
      monthlySavings: '20000',
      monthlyReturn: '1.5',
      housePrice: '4000000',
      annualRealEstateGrowth: '15',
    })
    setResults(null)
  }

  const clearInputs = () => {
    setInputs({
      currentSavings: '',
      monthlySavings: '',
      monthlyReturn: '',
      housePrice: '',
      annualRealEstateGrowth: '',
    })
    setResults(null)
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

      const monthlyReturnRate = monthlyReturn / 100
      const monthlyHouseGrowthRate = (annualRealEstateGrowth / 12) / 100

      let currentSavingsBalance = currentSavings
      let currentHousePrice = housePrice
      const chartData = []
      const maxMonths = 480
      let month = 0

      while (month < maxMonths) {
        const tapuMasrafi = currentHousePrice * 0.04
        const totalRequired = currentHousePrice + tapuMasrafi

        if (month % 12 === 0 && month > 0) {
          chartData.push({
            year: month / 12,
            savings: Math.round(currentSavingsBalance),
            housePrice: Math.round(currentHousePrice),
            totalRequired: Math.round(totalRequired),
          })
        }

        if (currentSavingsBalance >= totalRequired) {
          break
        }

        currentSavingsBalance = currentSavingsBalance * (1 + monthlyReturnRate) + monthlySavings
        currentHousePrice = currentHousePrice * (1 + monthlyHouseGrowthRate)

        month++
      }

      const finalTapu = currentHousePrice * 0.04
      const finalTotal = currentHousePrice + finalTapu
      const canAfford = currentSavingsBalance >= finalTotal
      const years = Math.floor(month / 12)
      const remainingMonths = month % 12

      const today = new Date()
      const targetDate = new Date(today)
      targetDate.setMonth(targetDate.getMonth() + month)

      const surplusShortfall = currentSavingsBalance - finalTotal

      setResults({
        months: month + 1,
        years,
        remainingMonths,
        targetDate: targetDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }),
        finalSavings: Math.round(currentSavingsBalance),
        finalHousePrice: Math.round(currentHousePrice),
        finalTapu: Math.round(finalTapu),
        finalTotal: Math.round(finalTotal),
        surplusShortfall: Math.round(surplusShortfall),
        canAfford,
        chartData,
      })

      setIsCalculating(false)
    }, 300)
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
              <input type="number" value={inputs.currentSavings} onChange={(e) => handleInputChange('currentSavings', e.target.value)} placeholder="0" style={{ width: '100%', height: '48px', padding: '12px 16px', fontSize: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#DBEAFE', color: '#2563EB', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>
                  📈
                </span>
                Aylık Birikim
              </label>
              <input type="number" value={inputs.monthlySavings} onChange={(e) => handleInputChange('monthlySavings', e.target.value)} placeholder="0" style={{ width: '100%', height: '48px', padding: '12px 16px', fontSize: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>
                  🎯
                </span>
                Aylık Yatırım Getirisi (%)
              </label>
              <input type="number" value={inputs.monthlyReturn} onChange={(e) => handleInputChange('monthlyReturn', e.target.value)} placeholder="0" style={{ width: '100%', height: '48px', padding: '12px 16px', fontSize: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#FEE2E2', color: '#DC2626', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>
                  🏠
                </span>
                Evin Fiyatı
              </label>
              <input type="number" value={inputs.housePrice} onChange={(e) => handleInputChange('housePrice', e.target.value)} placeholder="0" style={{ width: '100%', height: '48px', padding: '12px 16px', fontSize: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#EDE9FE', color: '#7C3AED', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>
                  📊
                </span>
                Yıllık Emlak Artışı (%)
              </label>
              <input type="number" value={inputs.annualRealEstateGrowth} onChange={(e) => handleInputChange('annualRealEstateGrowth', e.target.value)} placeholder="0" style={{ width: '100%', height: '48px', padding: '12px 16px', fontSize: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <button onClick={calculatePlan} disabled={isCalculating} style={{ width: '100%', height: '52px', backgroundColor: '#0F766E', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '600', cursor: isCalculating ? 'not-allowed' : 'pointer', opacity: isCalculating ? '0.7' : '1', marginTop: '8px' }}>
              {isCalculating ? 'Hesaplanıyor...' : 'Hesapla'}
            </button>
          </div>
        </div>

        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Son Birikim
                </div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937' }}>
                  {formatCurrency(results.finalSavings)}
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Son Ev Fiyati
                </div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937' }}>
                  {formatCurrency(results.finalHousePrice)}
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Gereken Toplam
                </div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937' }}>
                  {formatCurrency(results.finalTotal)}
                </div>
              </div>

              <div style={{ backgroundColor: results.surplusShortfall >= 0 ? '#D1FAE5' : '#FEE2E2', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: results.surplusShortfall >= 0 ? '#059669' : '#DC2626', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {results.surplusShortfall >= 0 ? 'Fazla' : 'Eksi'}
                </div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: results.surplusShortfall >= 0 ? '#059669' : '#DC2626' }}>
                  {formatCurrency(Math.abs(results.surplusShortfall))}
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
                  <XAxis dataKey="year" stroke="#6B7280" tick={{ fontSize: 12 }} label={{ value: 'Yil', position: 'insideBottom', offset: -5 }} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} label={{ value: 'Milyon TL', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px' }} />
                  <Line type="monotone" dataKey="savings" stroke="#0F766E" strokeWidth={3} name="Birikim" dot={{ fill: "#0F766E", strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="totalRequired" stroke="#DC2626" strokeWidth={3} name="Gereken Toplam" strokeDasharray="5 5" dot={{ fill: "#DC2626", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
